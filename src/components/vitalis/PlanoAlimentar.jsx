// ============================================================
// VITALIS - PLANO ALIMENTAR COMPONENT (SIMPLIFICADO)
// ============================================================
// Mostra: resumo da fase, porções, macros, dicas, dias treino, PDF
// ============================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link } from 'react-router-dom';
import GeradorPDFPlano from './GeradorPDFPlano';

// ============================================================
// ÍCONES
// ============================================================
const Icons = {
  Hand: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
    </svg>
  ),
  Meat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M15.5 2.5c2 0 3.5 1.5 3.5 3.5 0 2.5-2 4-4 6-2-2-4-3.5-4-6 0-2 1.5-3.5 3.5-3.5h1z"/>
      <path d="M12 12c-2 2-3.5 4-3.5 6.5a3.5 3.5 0 0 0 7 0c0-2.5-1.5-4.5-3.5-6.5z"/>
    </svg>
  ),
  Salad: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M7 21h10"/>
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z"/>
      <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47.63 2.4 2.4 0 0 1 .53 3.67 2.4 2.4 0 0 1-2.8 3.24"/>
    </svg>
  ),
  Bread: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M12 2a4 4 0 0 0-4 4v2H5a3 3 0 0 0 0 6h1v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6h1a3 3 0 0 0 0-6h-3V6a4 4 0 0 0-4-4z"/>
    </svg>
  ),
  Oil: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M10 2v7.31"/>
      <path d="M14 9.3V1.99"/>
      <path d="M8.5 2h7"/>
      <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
    </svg>
  ),
  Dumbbell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M6.5 6.5a2 2 0 0 0-3 0L2 8l10 10 1.5-1.5a2 2 0 0 0 0-3"/>
      <path d="M17.5 17.5a2 2 0 0 0 3 0L22 16 12 6l-1.5 1.5a2 2 0 0 0 0 3"/>
      <path d="M12 6L6 12"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  )
};

// ============================================================
// COMPONENTE: CARTÃO DE PORÇÃO
// ============================================================
function PorcaoCard({ tipo, quantidade, tamanho, extra = 0, cor }) {
  const config = {
    proteina: { 
      icon: Icons.Meat, 
      nome: 'Proteína', 
      unidade: 'palmas',
      descricao: `~${tamanho}g por palma`,
      exemplos: 'Frango, peixe, ovos, carne'
    },
    legumes: { 
      icon: Icons.Salad, 
      nome: 'Legumes', 
      unidade: 'punhos',
      descricao: '~100g por punho',
      exemplos: 'Brócolos, espinafres, tomate'
    },
    hidratos: { 
      icon: Icons.Bread, 
      nome: 'Hidratos', 
      unidade: 'mãos',
      descricao: `~${tamanho}g carbs por mão`,
      exemplos: 'Arroz, batata, fruta'
    },
    gordura: { 
      icon: Icons.Oil, 
      nome: 'Gordura', 
      unidade: 'polegares',
      descricao: `~${tamanho}g por polegar`,
      exemplos: 'Azeite, abacate, nozes'
    }
  };

  const item = config[tipo];
  const Icon = item.icon;
  const total = quantidade + extra;

  return (
    <div className={`bg-gradient-to-br ${cor} rounded-2xl p-4 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-50 rounded-xl">
            <Icon />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{item.nome}</h3>
            <p className="text-xs text-gray-600">{item.descricao}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-gray-800">{total}</span>
          <p className="text-xs text-gray-600">{item.unidade}</p>
        </div>
      </div>
      {extra > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
          <Icons.Dumbbell />
          <span>+{extra} dia de treino</span>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500 italic">{item.exemplos}</p>
    </div>
  );
}

// ============================================================
// COMPONENTE: DIAS DE TREINO
// ============================================================
const DIAS_SEMANA = [
  { valor: 1, nome: 'D', nomeLongo: 'Domingo' },
  { valor: 2, nome: 'S', nomeLongo: 'Segunda' },
  { valor: 3, nome: 'T', nomeLongo: 'Terça' },
  { valor: 4, nome: 'Q', nomeLongo: 'Quarta' },
  { valor: 5, nome: 'Q', nomeLongo: 'Quinta' },
  { valor: 6, nome: 'S', nomeLongo: 'Sexta' },
  { valor: 7, nome: 'S', nomeLongo: 'Sábado' }
];

function ConfigurarDiasTreino({ userId, diasActuais = [], onSave }) {
  const [dias, setDias] = useState(diasActuais);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDias(diasActuais);
  }, [diasActuais]);

  const toggleDia = (valor) => {
    setDias(prev => {
      const novos = prev.includes(valor) 
        ? prev.filter(d => d !== valor)
        : [...prev, valor].sort((a, b) => a - b);
      return novos;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('vitalis_definir_dias_treino', {
        p_user_id: userId,
        p_dias: dias
      });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (onSave) onSave(dias);
      }, 1500);
    } catch (err) {
      console.error('Erro ao guardar dias:', err);
    } finally {
      setLoading(false);
    }
  };

  const mudou = JSON.stringify(dias) !== JSON.stringify(diasActuais);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Icons.Dumbbell />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Dias de treino</h3>
            <p className="text-xs text-gray-500">Ajusta os hidratos automaticamente</p>
          </div>
        </div>
        {saved && <span className="text-green-600 text-sm font-medium">✓ Guardado!</span>}
      </div>
      
      <div className="flex justify-center gap-2 mb-4">
        {DIAS_SEMANA.map((dia) => (
          <button
            key={dia.valor}
            onClick={() => toggleDia(dia.valor)}
            className={`
              w-10 h-10 rounded-full text-sm font-medium transition-all
              ${dias.includes(dia.valor)
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-orange-100'
              }
            `}
            title={dia.nomeLongo}
          >
            {dia.nome}
          </button>
        ))}
      </div>

      {dias.length > 0 && (
        <p className="text-center text-sm text-orange-600 mb-4">
          +1 mão de hidratos nos dias de treino 🍚
        </p>
      )}

      {mudou && (
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-all disabled:opacity-50"
        >
          {loading ? 'A guardar...' : 'Guardar alterações'}
        </button>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL: PLANO ALIMENTAR
// ============================================================
export default function PlanoAlimentar() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plano, setPlano] = useState(null);
  const [usersId, setUsersId] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const carregarPlano = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Utilizador não autenticado');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userError) throw userError;
      setUsersId(userData.id);

      const { data, error: planoError } = await supabase.rpc('vitalis_plano_do_dia', {
        p_user_id: userData.id
      });

      if (planoError) throw planoError;

      if (data?.erro) {
        setError(data.erro);
      } else {
        setPlano(data);
      }
    } catch (err) {
      console.error('Erro ao carregar plano:', err);
      setError('Erro ao carregar o plano. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPlano();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar o teu plano...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 p-4">
        <div className="max-w-md mx-auto mt-20 bg-white rounded-2xl p-6 text-center shadow-lg">
          <div className="text-5xl mb-4">🥗</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Plano não disponível</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/vitalis/intake"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full font-semibold"
          >
            Completar Intake
          </a>
        </div>
      </div>
    );
  }

  // Calcular duração da fase
  const semanaActual = plano.fase?.semana || 1;
  const duracaoFase = plano.fase?.duracao_semanas || 4;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C1634A] via-[#D97706] to-[#A54E38] text-white px-4 pt-8 pb-6">
        <div className="max-w-md mx-auto">
          <Link to="/vitalis/dashboard" className="inline-flex items-center gap-1 text-orange-100 hover:text-white mb-4">
            <Icons.ArrowLeft />
            <span>Voltar</span>
          </Link>

          <div className="flex items-center gap-3">
            <img
              src="/logos/VITALIS_LOGO_V3.png"
              alt="Vitalis"
              className="w-12 h-12 object-contain drop-shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold">O Meu Plano</h1>
              <p className="text-orange-100 mt-1">Resumo do teu plano alimentar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        
        {/* Card Fase Actual - DESTAQUE */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Icons.Target />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{plano.fase?.nome || 'Fase Inicial'}</h2>
              <p className="text-sm text-gray-500">O teu foco actual</p>
            </div>
          </div>
          
          {/* Progresso da fase */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Semana {semanaActual} de {duracaoFase}</span>
              <span className="font-medium text-orange-600">{Math.round((semanaActual / duracaoFase) * 100)}%</span>
            </div>
            <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all"
                style={{ width: `${(semanaActual / duracaoFase) * 100}%` }}
              />
            </div>
          </div>

          {plano.e_dia_treino && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
              <Icons.Dumbbell />
              <span className="font-medium">Hoje é dia de treino! (+1 mão de carbs)</span>
            </div>
          )}
        </div>

        {/* BOTÃO PDF - DESTACADO */}
        <button
          onClick={() => setShowPDFModal(true)}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <Icons.Download />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Descarregar Plano PDF</p>
              <p className="text-amber-100 text-sm">Plano completo para consultar offline</p>
            </div>
          </div>
          <span className="text-2xl">📄</span>
        </button>

        {/* Porções do dia */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">Porções diárias</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <PorcaoCard 
              tipo="proteina"
              quantidade={plano.porcoes?.proteina || 0}
              tamanho={plano.tamanhos?.palma_g || 20}
              cor="from-red-50 to-rose-100"
            />
            <PorcaoCard 
              tipo="legumes"
              quantidade={plano.porcoes?.legumes || 0}
              tamanho={100}
              cor="from-green-50 to-emerald-100"
            />
            <PorcaoCard 
              tipo="hidratos"
              quantidade={plano.porcoes?.hidratos_base || 0}
              tamanho={plano.tamanhos?.mao_g || 20}
              extra={plano.e_dia_treino ? (plano.porcoes?.carbs_extra_treino || 0) : 0}
              cor="from-amber-50 to-yellow-100"
            />
            <PorcaoCard 
              tipo="gordura"
              quantidade={plano.porcoes?.gordura || 0}
              tamanho={plano.tamanhos?.polegar_g || 7}
              cor="from-purple-50 to-violet-100"
            />
          </div>

          {/* Macros */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Calorias diárias</span>
              <span className="font-bold text-gray-800">~{plano.calorias} kcal</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-500">Macros</span>
              <span className="text-sm text-gray-600">
                P:{plano.macros?.proteina_g}g · C:{plano.macros?.carboidratos_g}g · G:{plano.macros?.gordura_g}g
              </span>
            </div>
          </div>
        </div>

        {/* Dias de treino */}
        <ConfigurarDiasTreino 
          userId={usersId}
          diasActuais={plano.dias_treino || []}
          onSave={() => carregarPlano()}
        />

        {/* Dicas da fase */}
        {plano.regras && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Dicas da fase</h3>
            
            {plano.regras.priorizar?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-green-600 uppercase mb-2">✓ PRIORIZAR</p>
                <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                  {plano.regras.priorizar.join(', ')}
                </p>
              </div>
            )}
            
            {plano.regras.evitar?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-red-600 uppercase mb-2">✗ EVITAR</p>
                <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
                  {plano.regras.evitar.join(', ')}
                </p>
              </div>
            )}

            {plano.regras.dicas?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase mb-2">💡 DICAS</p>
                <ul className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg space-y-1">
                  {plano.regras.dicas.map((dica, i) => (
                    <li key={i}>• {dica}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Progresso peso */}
        {plano.peso && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Progresso de peso</h3>
            
            <div className="flex justify-between items-center mb-2">
              <div className="text-center">
                <p className="text-xs text-gray-500">Início</p>
                <p className="text-lg font-bold text-gray-400">{plano.peso.inicial} kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Actual</p>
                <p className="text-2xl font-bold text-orange-600">{plano.peso.actual} kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Meta</p>
                <p className="text-lg font-bold text-green-600">{plano.peso.meta} kg</p>
              </div>
            </div>
            
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              {plano.peso.meta && plano.peso.inicial && plano.peso.actual && (
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-green-500 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, Math.max(0, 
                      ((plano.peso.inicial - plano.peso.actual) / (plano.peso.inicial - plano.peso.meta)) * 100
                    ))}%` 
                  }}
                />
              )}
            </div>
            
            {plano.peso.inicial > plano.peso.actual && (
              <p className="text-center text-sm text-green-600 mt-2">
                🎉 Já perdeste {(plano.peso.inicial - plano.peso.actual).toFixed(1)} kg!
              </p>
            )}
          </div>
        )}

        {/* Refeição livre */}
        {plano.refeicao_livre?.permitida && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍕</span>
              <div>
                <p className="font-semibold text-gray-800">Refeição livre</p>
                <p className="text-sm text-gray-600">
                  {plano.refeicao_livre.por_semana}x por semana nesta fase
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal PDF */}
      {showPDFModal && (
        <GeradorPDFPlano 
          userId={usersId}
          onClose={() => setShowPDFModal(false)}
        />
      )}
    </div>
  );
}
