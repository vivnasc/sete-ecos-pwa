import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { calcularPorcoesDiarias } from '../../lib/vitalis/calcularPorcoes.js';
import { somarMacros, calcularMacrosPorcaoMao, CONVERSOES_MAO } from '../../lib/vitalis/porcoesConverter.js';
import AddFoodModal from './AddFoodModal.jsx';

export default function MealsTracker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refeicoes, setRefeicoes] = useState([]);
  const [registosHoje, setRegistosHoje] = useState({});
  const [itemsPorRefeicao, setItemsPorRefeicao] = useState({}); // { refeicaoNome: [items] }
  const [dataSeleccionada, setDataSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [expandido, setExpandido] = useState(null);
  const [plano, setPlano] = useState(null);
  const [addFoodModal, setAddFoodModal] = useState(null); // nome da refeição ou null

  useEffect(() => {
    loadData();
  }, [dataSeleccionada]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      const { data: userData, error: userError } = await supabase
        .from('users').select('id').eq('auth_id', user.id).single();
      if (userError || !userData) throw new Error('Utilizador não encontrado');
      setUserId(userData.id);

      // Buscar configs, registos e plano em paralelo
      const [configRes, registosRes, clientRes] = await Promise.all([
        supabase.from('vitalis_refeicoes_config').select('*')
          .eq('user_id', userData.id).eq('activo', true).order('ordem', { ascending: true }),
        supabase.from('vitalis_meals_log').select('*')
          .eq('user_id', userData.id).eq('data', dataSeleccionada),
        supabase.from('vitalis_clients').select('id').eq('user_id', userData.id).single()
      ]);

      if (configRes.error) throw configRes.error;
      setRefeicoes(configRes.data || []);

      // Registos: converter para map
      const registosMap = {};
      (registosRes.data || []).forEach(r => { registosMap[r.refeicao] = r; });
      setRegistosHoje(registosMap);

      // Items por refeição: ler do JSONB notas (backward compatible)
      const itemsMap = {};
      (registosRes.data || []).forEach(r => {
        try {
          const parsed = r.notas ? JSON.parse(r.notas) : null;
          if (parsed && Array.isArray(parsed.items)) {
            itemsMap[r.refeicao] = parsed.items;
          }
        } catch {
          // Notas é texto livre, não JSON — manter vazio
        }
      });
      setItemsPorRefeicao(itemsMap);

      // Plano
      if (clientRes.data) {
        let planoData = null;
        const { data: planoView } = await supabase
          .from('vitalis_plano')
          .select('porcoes_proteina, porcoes_hidratos, porcoes_gordura, porcoes_legumes')
          .eq('client_id', clientRes.data.id).maybeSingle();
        planoData = planoView;

        if (!planoData) {
          const { data: mealPlan } = await supabase
            .from('vitalis_meal_plans').select('proteina_g, carboidratos_g, gordura_g')
            .eq('user_id', userData.id).eq('status', 'activo')
            .order('created_at', { ascending: false }).limit(1).maybeSingle();
          if (mealPlan) {
            const porcoesDiarias = calcularPorcoesDiarias(mealPlan);
            planoData = {
              porcoes_proteina: porcoesDiarias.proteina,
              porcoes_hidratos: porcoesDiarias.hidratos,
              porcoes_gordura: porcoesDiarias.gordura,
              porcoes_legumes: porcoesDiarias.legumes
            };
          }
        }
        setPlano(planoData);
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular macros alvo diários a partir do plano (porções-mão)
  const macrosAlvoDiario = useMemo(() => {
    if (!plano) return null;
    const macrosP = calcularMacrosPorcaoMao(plano.porcoes_proteina || 0, 'palma');
    const macrosH = calcularMacrosPorcaoMao(plano.porcoes_hidratos || 0, 'concha');
    const macrosG = calcularMacrosPorcaoMao(plano.porcoes_gordura || 0, 'polegar');
    const macrosL = calcularMacrosPorcaoMao(plano.porcoes_legumes || 0, 'punho');
    return somarMacros([macrosP, macrosH, macrosG, macrosL]);
  }, [plano]);

  // Somar macros de todos os items registados hoje
  const macrosHoje = useMemo(() => {
    const allItems = Object.values(itemsPorRefeicao).flat();
    if (allItems.length === 0) return { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 };
    return somarMacros(allItems.map(item => item.macros || { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 }));
  }, [itemsPorRefeicao]);

  // Adicionar item a uma refeição
  const adicionarItem = async (refeicaoNome, itemData) => {
    const currentItems = itemsPorRefeicao[refeicaoNome] || [];
    const novoItem = {
      id: Date.now().toString(),
      nome: itemData.nome_display,
      icon: itemData.alimento?.icon || '🍽️',
      quantidade_g: itemData.quantidade_g,
      quantidade_porcao: itemData.quantidade_porcao,
      tipo_porcao: itemData.tipo_porcao,
      macros: itemData.macros,
      alimento_id: itemData.alimento?.id
    };
    const novosItems = [...currentItems, novoItem];
    const novoMap = { ...itemsPorRefeicao, [refeicaoNome]: novosItems };
    setItemsPorRefeicao(novoMap);

    // Calcular totais para salvar no registo
    await salvarRegisto(refeicaoNome, novosItems);
  };

  // Remover item de uma refeição
  const removerItem = async (refeicaoNome, itemId) => {
    const currentItems = itemsPorRefeicao[refeicaoNome] || [];
    const novosItems = currentItems.filter(i => i.id !== itemId);
    const novoMap = { ...itemsPorRefeicao, [refeicaoNome]: novosItems };
    setItemsPorRefeicao(novoMap);

    await salvarRegisto(refeicaoNome, novosItems);
  };

  // Salvar registo no Supabase
  const salvarRegisto = async (refeicaoNome, items) => {
    setSaving(true);
    try {
      const macros = somarMacros(items.map(i => i.macros || { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 }));
      const nRef = refeicoes.length || 3;
      const alvoPorRefeicao = plano ? {
        proteina: (plano.porcoes_proteina || 0) / nRef,
        hidratos: (plano.porcoes_hidratos || 0) / nRef,
        gordura: (plano.porcoes_gordura || 0) / nRef,
        legumes: (plano.porcoes_legumes || 0) / nRef,
      } : null;

      // Calcular porções-mão a partir dos macros reais
      const porcoes_proteina = macros.proteina ? Math.round(macros.proteina / 25 * 10) / 10 : 0;
      const porcoes_hidratos = macros.carboidratos ? Math.round(macros.carboidratos / 30 * 10) / 10 : 0;
      const porcoes_gordura = macros.gordura ? Math.round(macros.gordura / 10 * 10) / 10 : 0;
      // Legumes: contar items com tipo_porcao punho
      const porcoes_legumes = items
        .filter(i => i.tipo_porcao === 'punho')
        .reduce((sum, i) => sum + (i.quantidade_porcao || 1), 0);

      // Determinar status (seguiu_plano)
      let seguiu_plano = 'sim';
      if (items.length === 0) {
        seguiu_plano = null;
      } else if (alvoPorRefeicao) {
        const excessoP = porcoes_proteina > alvoPorRefeicao.proteina * 1.3;
        const excessoH = porcoes_hidratos > alvoPorRefeicao.hidratos * 1.3;
        const excessoG = porcoes_gordura > alvoPorRefeicao.gordura * 1.3;
        if (excessoP || excessoH || excessoG) seguiu_plano = 'parcial';
      }

      const dados = {
        user_id: userId,
        data: dataSeleccionada,
        refeicao: refeicaoNome,
        seguiu_plano: items.length > 0 ? seguiu_plano : null,
        hora: new Date().toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' }),
        porcoes_proteina,
        porcoes_hidratos,
        porcoes_gordura,
        porcoes_legumes,
        notas: JSON.stringify({ items, macros_total: macros })
      };

      const registoExistente = registosHoje[refeicaoNome];
      if (registoExistente) {
        const { error } = await supabase.from('vitalis_meals_log').update(dados).eq('id', registoExistente.id);
        if (error) throw error;
        setRegistosHoje(prev => ({ ...prev, [refeicaoNome]: { ...registoExistente, ...dados } }));
      } else {
        const { data, error } = await supabase.from('vitalis_meals_log').insert([dados]).select().single();
        if (error) throw error;
        setRegistosHoje(prev => ({ ...prev, [refeicaoNome]: data }));
      }
    } catch (err) {
      console.error('Erro ao guardar:', err);
    } finally {
      setSaving(false);
    }
  };

  // Calcular resumo
  const resumo = useMemo(() => {
    const total = refeicoes.length;
    const registadas = Object.keys(registosHoje).length;
    const comItems = Object.entries(itemsPorRefeicao).filter(([, items]) => items.length > 0).length;
    return { total, registadas, comItems };
  }, [refeicoes, registosHoje, itemsPorRefeicao]);

  // Progresso calorias
  const progressoCalorias = macrosAlvoDiario && macrosAlvoDiario.calorias > 0
    ? Math.min(100, Math.round((macrosHoje.calorias / macrosAlvoDiario.calorias) * 100))
    : 0;

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🍽️</div>
          <p className="text-gray-600" role="status" aria-live="polite">A carregar...</p>
        </div>
      </div>
    );
  }

  // Sem refeições configuradas
  if (refeicoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FDF8F3] to-[#F0EBE3]">
        <HeaderBar navigate={navigate} />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-[#D2B48C]/30">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-[#4A4035] mb-2">Configura as tuas refeições</h2>
            <p className="text-[#6B4423] mb-6">
              Antes de começar a registar, define quais refeições fazes no teu dia.
            </p>
            <button
              onClick={() => navigate('/vitalis/refeicoes-config')}
              className="px-8 py-4 bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all active:scale-95"
            >
              Configurar Refeições
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isHoje = dataSeleccionada === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FDF8F3] to-[#F0EBE3] pb-24">
      <HeaderBar navigate={navigate} />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Date selector */}
        <div className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between">
          <button
            onClick={() => {
              const d = new Date(dataSeleccionada);
              d.setDate(d.getDate() - 1);
              setDataSeleccionada(d.toISOString().split('T')[0]);
            }}
            className="p-2 text-[#7C8B6F] hover:bg-[#7C8B6F]/10 rounded-lg active:scale-95"
            aria-label="Dia anterior"
          >
            ←
          </button>
          <div className="text-center">
            <input
              type="date"
              value={dataSeleccionada}
              onChange={(e) => setDataSeleccionada(e.target.value)}
              className="text-base font-semibold text-gray-800 border-none text-center bg-transparent cursor-pointer"
            />
            {isHoje && <p className="text-xs text-[#7C8B6F] font-medium">Hoje</p>}
          </div>
          <button
            onClick={() => {
              const d = new Date(dataSeleccionada);
              d.setDate(d.getDate() + 1);
              if (d <= new Date()) setDataSeleccionada(d.toISOString().split('T')[0]);
            }}
            disabled={isHoje}
            className="p-2 text-[#7C8B6F] hover:bg-[#7C8B6F]/10 rounded-lg disabled:opacity-30 active:scale-95"
            aria-label="Dia seguinte"
          >
            →
          </button>
        </div>

        {/* Macro summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Resumo do Dia</h3>
            <span className="text-xs text-gray-400">{resumo.comItems}/{resumo.total} refeições</span>
          </div>

          {/* Calorie bar */}
          <div className="mb-3">
            <div className="flex items-end justify-between mb-1">
              <span className="text-2xl font-bold text-gray-800">{macrosHoje.calorias}</span>
              {macrosAlvoDiario && (
                <span className="text-sm text-gray-400">/ {macrosAlvoDiario.calorias} kcal</span>
              )}
            </div>
            {macrosAlvoDiario && (
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressoCalorias > 100 ? 'bg-orange-400' : 'bg-[#7C8B6F]'
                  }`}
                  style={{ width: `${Math.min(progressoCalorias, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Macro breakdown */}
          <div className="grid grid-cols-4 gap-2">
            <MacroCard
              label="Proteína"
              valor={macrosHoje.proteina}
              alvo={macrosAlvoDiario?.proteina}
              cor="rose"
              unidade="g"
            />
            <MacroCard
              label="Hidratos"
              valor={macrosHoje.carboidratos}
              alvo={macrosAlvoDiario?.carboidratos}
              cor="amber"
              unidade="g"
            />
            <MacroCard
              label="Gordura"
              valor={macrosHoje.gordura}
              alvo={macrosAlvoDiario?.gordura}
              cor="purple"
              unidade="g"
            />
            <MacroCard
              label="Legumes"
              valor={Object.values(itemsPorRefeicao).flat().filter(i => i.tipo_porcao === 'punho').reduce((s, i) => s + (i.quantidade_porcao || 0), 0)}
              alvo={plano?.porcoes_legumes}
              cor="green"
              unidade="p"
            />
          </div>
        </div>

        {/* Meals list */}
        <div className="space-y-3">
          {refeicoes.map((ref) => {
            const items = itemsPorRefeicao[ref.nome] || [];
            const registo = registosHoje[ref.nome];
            const isExpanded = expandido === ref.nome;
            const mealMacros = items.length > 0
              ? somarMacros(items.map(i => i.macros || { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 }))
              : null;

            return (
              <div
                key={ref.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${
                  items.length > 0 ? 'border-2 border-green-200' : 'border border-gray-100'
                }`}
              >
                {/* Meal header */}
                <button
                  onClick={() => setExpandido(isExpanded ? null : ref.nome)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      items.length > 0 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {items.length > 0 ? '✅' : getMealEmoji(ref.nome)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{ref.nome}</h4>
                      <p className="text-xs text-gray-400">
                        {ref.hora_habitual || ''}
                        {items.length > 0 && ` · ${items.length} ${items.length === 1 ? 'item' : 'items'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {mealMacros && (
                      <span className="text-sm font-bold text-gray-600">{mealMacros.calorias} kcal</span>
                    )}
                    <span className={`text-gray-400 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    {/* Items list */}
                    {items.length > 0 && (
                      <div className="py-3 space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 group"
                          >
                            <span className="text-base flex-shrink-0">{item.icon || '🍽️'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 truncate">{item.nome}</p>
                              <p className="text-[10px] text-gray-400">
                                {item.quantidade_g}g · {item.macros?.calorias || 0} kcal
                              </p>
                            </div>
                            <button
                              onClick={() => removerItem(ref.nome, item.id)}
                              className="p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              aria-label={`Remover ${item.nome}`}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        {/* Meal totals */}
                        {mealMacros && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <span>Total:</span>
                            <span>
                              <strong className="text-gray-700">{mealMacros.calorias}</strong> kcal
                              {' · '}
                              <span className="text-rose-500">{mealMacros.proteina}P</span>
                              {' '}
                              <span className="text-amber-500">{mealMacros.carboidratos}C</span>
                              {' '}
                              <span className="text-purple-500">{mealMacros.gordura}G</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add food button */}
                    <button
                      onClick={() => setAddFoodModal(ref.nome)}
                      className="w-full py-3 mt-1 border-2 border-dashed border-gray-200 hover:border-[#7C8B6F] rounded-xl text-sm text-gray-500 hover:text-[#7C8B6F] font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">+</span>
                      Adicionar alimento
                    </button>

                    {/* Quick note */}
                    {registo?.notas && (() => {
                      try {
                        JSON.parse(registo.notas);
                        return null; // É JSON de items, não mostrar
                      } catch {
                        return (
                          <p className="mt-2 text-xs text-gray-400 italic">
                            {registo.notas}
                          </p>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Quick add button (when collapsed and no items) */}
                {!isExpanded && items.length === 0 && (
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => setAddFoodModal(ref.nome)}
                      className="w-full py-2.5 bg-gray-50 hover:bg-[#7C8B6F]/10 rounded-xl text-xs text-gray-500 hover:text-[#7C8B6F] font-medium transition-all active:scale-[0.98]"
                    >
                      + Registar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hand method reference */}
        <div className="bg-gradient-to-r from-[#7C8B6F] to-[#5A6B4D] rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🤚</span>
            <span className="font-bold text-sm">Guia rápido — Método da Mão</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            {Object.entries(CONVERSOES_MAO).map(([key, conv]) => (
              <div key={key}>
                <span className="text-lg">{conv.emoji}</span>
                <br />
                <span className="font-semibold">{conv.desc}</span>
                <br />
                <span className="opacity-80">≈ {conv.g}g</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add food modal */}
      {addFoodModal && (
        <AddFoodModal
          refeicao={addFoodModal}
          onAdd={(itemData) => {
            adicionarItem(addFoodModal, itemData);
            setAddFoodModal(null);
          }}
          onClose={() => setAddFoodModal(null)}
        />
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-4 py-2 rounded-full">
          A guardar...
        </div>
      )}
    </div>
  );
}

// Header bar component
function HeaderBar({ navigate }) {
  return (
    <div className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] shadow-lg">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate('/vitalis/dashboard')}
          className="text-white/80 hover:text-white mb-3 flex items-center gap-1 text-sm"
        >
          ← Voltar
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-10 h-10 object-contain drop-shadow-lg" />
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Refeições
            </h1>
          </div>
          <button
            onClick={() => navigate('/vitalis/refeicoes-config')}
            className="text-xs text-white/80 hover:text-white bg-white/20 px-3 py-2 rounded-lg active:scale-95"
          >
            Configurar
          </button>
        </div>
      </div>
    </div>
  );
}

// Macro card component
function MacroCard({ label, valor, alvo, cor, unidade }) {
  const percent = alvo && alvo > 0 ? Math.min(100, Math.round((valor / alvo) * 100)) : 0;
  const colorMap = {
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'bg-rose-400' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-400' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-400' },
    green: { bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-400' },
  };
  const c = colorMap[cor] || colorMap.amber;

  return (
    <div className={`${c.bg} rounded-xl p-2 text-center`}>
      <div className={`text-base font-bold ${c.text}`}>
        {Math.round(valor * 10) / 10}
        <span className="text-[10px] font-normal">{unidade}</span>
      </div>
      <div className="text-[10px] text-gray-500 mb-1">{label}</div>
      {alvo != null && (
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${c.bar}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Emoji por tipo de refeição
function getMealEmoji(nome) {
  const n = nome.toLowerCase();
  if (n.includes('pequeno') || n.includes('café') || n.includes('manha')) return '🌅';
  if (n.includes('almoço') || n.includes('almoco')) return '🍛';
  if (n.includes('lanche') || n.includes('snack')) return '🍎';
  if (n.includes('jantar') || n.includes('ceia')) return '🌙';
  return '🍽️';
}
