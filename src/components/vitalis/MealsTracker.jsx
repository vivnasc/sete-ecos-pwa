import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function MealsTracker() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [refeicoes, setRefeicoes] = useState([]);
  const [registosHoje, setRegistosHoje] = useState({});
  const [dataSeleccionada, setDataSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [expandido, setExpandido] = useState(null);
  const [plano, setPlano] = useState(null);

  useEffect(() => {
    loadData();
  }, [dataSeleccionada]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Buscar user autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // 2. Converter auth_id → users.id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Utilizador não encontrado');
      }

      setUserId(userData.id);

      // 3. Buscar configuração de refeições
      const { data: refeicoesCofig, error: refError } = await supabase
        .from('vitalis_refeicoes_config')
        .select('*')
        .eq('user_id', userData.id)
        .eq('activo', true)
        .order('ordem', { ascending: true });

      if (refError) throw refError;

      setRefeicoes(refeicoesCofig || []);

      // 4. Buscar registos do dia seleccionado
      const { data: registos, error: regError } = await supabase
        .from('vitalis_meals_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', dataSeleccionada);

      if (regError) throw regError;

      // Converter para objecto por refeicao
      const registosMap = {};
      (registos || []).forEach(r => {
        registosMap[r.refeicao] = r;
      });
      setRegistosHoje(registosMap);

      // 5. Buscar plano (para mostrar porções alvo)
      const { data: clientData } = await supabase
        .from('vitalis_clients')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (clientData) {
        let planoData = null;
        const { data: planoView } = await supabase
          .from('vitalis_plano')
          .select('porcoes_proteina, porcoes_hidratos, porcoes_gordura, porcoes_legumes')
          .eq('client_id', clientData.id)
          .maybeSingle();
        planoData = planoView;

        // Fallback: vitalis_meal_plans
        if (!planoData) {
          const { data: mealPlan } = await supabase
            .from('vitalis_meal_plans').select('proteina_g, carboidratos_g, gordura_g')
            .eq('user_id', userData.id).eq('status', 'activo')
            .order('created_at', { ascending: false }).limit(1).maybeSingle();
          if (mealPlan) {
            planoData = {
              porcoes_proteina: Math.round(mealPlan.proteina_g / 25),
              porcoes_hidratos: Math.round(mealPlan.carboidratos_g / 30),
              porcoes_gordura: Math.round(mealPlan.gordura_g / 10),
              porcoes_legumes: 4
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

  const registarRefeicao = async (refeicaoNome, status, detalhes = {}) => {
    setSaving(true);
    try {
      const registoExistente = registosHoje[refeicaoNome];

      const dados = {
        user_id: userId,
        data: dataSeleccionada,
        refeicao: refeicaoNome,
        seguiu_plano: status,
        hora: detalhes.hora || new Date().toLocaleTimeString('pt', { hour: '2-digit', minute: '2-digit' }),
        porcoes_proteina: detalhes.porcoes_proteina || null,
        porcoes_hidratos: detalhes.porcoes_hidratos || null,
        porcoes_gordura: detalhes.porcoes_gordura || null,
        porcoes_legumes: detalhes.porcoes_legumes || null,
        notas: detalhes.notas || null
      };

      if (registoExistente) {
        // Actualizar
        const { error } = await supabase
          .from('vitalis_meals_log')
          .update(dados)
          .eq('id', registoExistente.id);

        if (error) throw error;

        setRegistosHoje({
          ...registosHoje,
          [refeicaoNome]: { ...registoExistente, ...dados }
        });
      } else {
        // Inserir
        const { data, error } = await supabase
          .from('vitalis_meals_log')
          .insert([dados])
          .select()
          .single();

        if (error) throw error;

        setRegistosHoje({
          ...registosHoje,
          [refeicaoNome]: data
        });
      }

      setExpandido(null);

    } catch (err) {
      console.error('Erro ao registar:', err);
      alert('Erro ao registar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sim': return '✅';
      case 'parcial': return '⚠️';
      case 'nao': return '❌';
      default: return '○';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sim': return 'bg-green-100 border-green-400';
      case 'parcial': return 'bg-yellow-100 border-yellow-400';
      case 'nao': return 'bg-red-100 border-red-400';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Calcular resumo do dia
  const calcularResumo = () => {
    const total = refeicoes.length;
    const registadas = Object.keys(registosHoje).length;
    const completas = Object.values(registosHoje).filter(r => r.seguiu_plano === 'sim').length;
    const parciais = Object.values(registosHoje).filter(r => r.seguiu_plano === 'parcial').length;
    
    return { total, registadas, completas, parciais };
  };

  const resumo = calcularResumo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  // Se não tem refeições configuradas
  if (refeicoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FDF8F3] to-[#F0EBE3]">
        <div className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <button
              onClick={() => navigate('/vitalis/dashboard')}
              className="text-white/80 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Voltar
            </button>
            <div className="flex items-center gap-3">
              <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-12 h-12 object-contain drop-shadow-lg" />
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Registo de Refeições</h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center border border-[#D2B48C]/30">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-[#4A4035] mb-2">Configura as tuas refeições</h2>
            <p className="text-[#6B4423] mb-6">
              Antes de começar a registar, define quais refeições fazes no teu dia.
            </p>
            <button
              onClick={() => navigate('/vitalis/refeicoes-config')}
              className="px-8 py-4 bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              Configurar Refeições →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#FDF8F3] to-[#F0EBE3] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/vitalis/dashboard')}
            className="text-white/80 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logos/VITALIS_LOGO_V3.png"
                alt="Vitalis"
                className="w-12 h-12 object-contain drop-shadow-lg"
              />
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Refeições
              </h1>
            </div>
            <button
              onClick={() => navigate('/vitalis/refeicoes-config')}
              className="text-sm text-white/80 hover:text-white bg-white/20 px-3 py-2 rounded-lg"
            >
              ⚙️ Configurar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Selector de Data */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const d = new Date(dataSeleccionada);
                d.setDate(d.getDate() - 1);
                setDataSeleccionada(d.toISOString().split('T')[0]);
              }}
              className="p-2 text-[#C1634A] hover:bg-[#C1634A]/10 rounded-lg"
            >
              ←
            </button>
            <div className="text-center">
              <input
                type="date"
                value={dataSeleccionada}
                onChange={(e) => setDataSeleccionada(e.target.value)}
                className="text-lg font-semibold text-gray-800 border-none text-center bg-transparent cursor-pointer"
              />
              {dataSeleccionada === new Date().toISOString().split('T')[0] && (
                <p className="text-sm text-[#C1634A]">Hoje</p>
              )}
            </div>
            <button
              onClick={() => {
                const d = new Date(dataSeleccionada);
                d.setDate(d.getDate() + 1);
                if (d <= new Date()) {
                  setDataSeleccionada(d.toISOString().split('T')[0]);
                }
              }}
              disabled={dataSeleccionada === new Date().toISOString().split('T')[0]}
              className="p-2 text-[#C1634A] hover:bg-[#C1634A]/10 rounded-lg disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>

        {/* Resumo do Dia */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{resumo.completas}</div>
            <div className="text-xs text-gray-500">Completas</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{resumo.parciais}</div>
            <div className="text-xs text-gray-500">Parciais</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{resumo.registadas}/{resumo.total}</div>
            <div className="text-xs text-gray-500">Registadas</div>
          </div>
        </div>

        {/* Lista de Refeições */}
        <div className="space-y-3">
          {refeicoes.map((ref) => {
            const registo = registosHoje[ref.nome];
            const isExpanded = expandido === ref.nome;

            return (
              <div 
                key={ref.id}
                className={`bg-white rounded-xl shadow overflow-hidden border-2 transition-all ${getStatusColor(registo?.seguiu_plano)}`}
              >
                {/* Linha Principal */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusIcon(registo?.seguiu_plano)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{ref.nome}</h3>
                        {ref.hora_habitual && (
                          <p className="text-sm text-gray-500">{ref.hora_habitual}</p>
                        )}
                      </div>
                    </div>

                    {/* Botões Rápidos */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => registarRefeicao(ref.nome, 'sim')}
                        disabled={saving}
                        className={`p-2 rounded-lg transition-all ${
                          registo?.seguiu_plano === 'sim' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => registarRefeicao(ref.nome, 'parcial')}
                        disabled={saving}
                        className={`p-2 rounded-lg transition-all ${
                          registo?.seguiu_plano === 'parcial' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        ~
                      </button>
                      <button
                        onClick={() => registarRefeicao(ref.nome, 'nao')}
                        disabled={saving}
                        className={`p-2 rounded-lg transition-all ${
                          registo?.seguiu_plano === 'nao' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        ✕
                      </button>
                      <button
                        onClick={() => setExpandido(isExpanded ? null : ref.nome)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg ml-2"
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {isExpanded && (
                  <DetalheRefeicao
                    refeicao={ref.nome}
                    registo={registo}
                    plano={plano}
                    numRefeicoes={refeicoes.length}
                    onSave={(detalhes) => registarRefeicao(ref.nome, detalhes.seguiu_plano || registo?.seguiu_plano || 'sim', detalhes)}
                    saving={saving}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Dica */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Dica:</p>
              <p className="text-blue-800 text-sm">
                Clica nos botões ✓ ~ ✕ para registo rápido, ou expande (▼) para adicionar detalhes de porções.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Alimentos comuns com equivalências em porções-mão
const ALIMENTOS_COMUNS = {
  proteina: [
    { nome: 'Frango (1 palma)', porcao: 1, icon: '🍗' },
    { nome: 'Peixe (1 palma)', porcao: 1, icon: '🐟' },
    { nome: 'Bife/Carne (1 palma)', porcao: 1, icon: '🥩' },
    { nome: 'Atum (1 lata)', porcao: 1, icon: '🐠' },
    { nome: 'Ovos (2-3)', porcao: 1, icon: '🥚' },
    { nome: 'Iogurte grego (170g)', porcao: 0.5, icon: '🥛' },
    { nome: 'Queijo (2 fatias)', porcao: 0.5, icon: '🧀' },
    { nome: 'Whey (1 scoop)', porcao: 1, icon: '🥤' },
    { nome: 'Camarão/Marisco (1 palma)', porcao: 1, icon: '🦐' },
    { nome: 'Tofu (1 palma)', porcao: 1, icon: '🫘' },
  ],
  hidratos: [
    { nome: 'Arroz (1 mão concha)', porcao: 1, icon: '🍚' },
    { nome: 'Massa (1 mão concha)', porcao: 1, icon: '🍝' },
    { nome: 'Batata (1 punho)', porcao: 1, icon: '🥔' },
    { nome: 'Batata doce (1 punho)', porcao: 1, icon: '🍠' },
    { nome: 'Pão (1 fatia)', porcao: 1, icon: '🍞' },
    { nome: 'Aveia (3 col. sopa)', porcao: 1, icon: '🥣' },
    { nome: 'Fruta (1 peça média)', porcao: 1, icon: '🍎' },
    { nome: 'Mandioca (1 punho)', porcao: 1, icon: '🫚' },
  ],
  gordura: [
    { nome: 'Azeite (1 col. sopa)', porcao: 1, icon: '🫒' },
    { nome: '¼ abacate', porcao: 1, icon: '🥑' },
    { nome: 'Amêndoas/Nozes (1 punhado)', porcao: 1, icon: '🥜' },
    { nome: 'Manteiga (1 col. chá)', porcao: 1, icon: '🧈' },
    { nome: 'Amendoim (1 col. sopa)', porcao: 1, icon: '🥜' },
    { nome: 'Coco ralado (2 col. sopa)', porcao: 1, icon: '🥥' },
  ],
  legumes: [
    { nome: 'Salada mista (1 punho)', porcao: 1, icon: '🥗' },
    { nome: 'Brócolos (1 punho)', porcao: 1, icon: '🥦' },
    { nome: 'Espinafres (1 punho)', porcao: 1, icon: '🥬' },
    { nome: 'Tomate (1 punho)', porcao: 1, icon: '🍅' },
    { nome: 'Cenoura (1 punho)', porcao: 1, icon: '🥕' },
    { nome: 'Couve (1 punho)', porcao: 1, icon: '🥬' },
    { nome: 'Cogumelos (1 punho)', porcao: 1, icon: '🍄' },
  ]
};

const CATEGORIAS = [
  { key: 'proteina', label: 'Proteína', emoji: '🫲', medida: 'palmas', cor: 'rose' },
  { key: 'hidratos', label: 'Hidratos', emoji: '🤲', medida: 'mãos', cor: 'amber' },
  { key: 'gordura', label: 'Gordura', emoji: '👍', medida: 'polegares', cor: 'yellow' },
  { key: 'legumes', label: 'Legumes', emoji: '✊', medida: 'punhos', cor: 'green' },
];

// Componente de Detalhe
function DetalheRefeicao({ refeicao, registo, plano, numRefeicoes, onSave, saving }) {
  const [detalhes, setDetalhes] = useState({
    seguiu_plano: registo?.seguiu_plano || 'sim',
    hora: registo?.hora || '',
    porcoes_proteina: registo?.porcoes_proteina || 0,
    porcoes_hidratos: registo?.porcoes_hidratos || 0,
    porcoes_gordura: registo?.porcoes_gordura || 0,
    porcoes_legumes: registo?.porcoes_legumes || 0,
    notas: registo?.notas || ''
  });
  const [categoriaAberta, setCategoriaAberta] = useState(null);
  const [alimentosSelecionados, setAlimentosSelecionados] = useState([]);

  // Calcular alvo por refeição (total do dia / nº refeições)
  const nRef = numRefeicoes || 3;
  const alvoPorRefeicao = plano ? {
    proteina: Math.ceil(plano.porcoes_proteina / nRef),
    hidratos: Math.ceil(plano.porcoes_hidratos / nRef),
    gordura: Math.ceil(plano.porcoes_gordura / nRef),
    legumes: Math.ceil(plano.porcoes_legumes / nRef),
  } : null;

  const adicionarAlimento = (categoria, alimento) => {
    const campo = `porcoes_${categoria}`;
    const novoValor = parseFloat(detalhes[campo] || 0) + alimento.porcao;
    setDetalhes({ ...detalhes, [campo]: novoValor });
    setAlimentosSelecionados([...alimentosSelecionados, { ...alimento, categoria }]);
  };

  const removerAlimento = (index) => {
    const item = alimentosSelecionados[index];
    const campo = `porcoes_${item.categoria}`;
    const novoValor = Math.max(0, parseFloat(detalhes[campo] || 0) - item.porcao);
    setDetalhes({ ...detalhes, [campo]: novoValor });
    setAlimentosSelecionados(alimentosSelecionados.filter((_, i) => i !== index));
  };

  const verificarExcesso = (categoria) => {
    if (!alvoPorRefeicao) return null;
    const actual = parseFloat(detalhes[`porcoes_${categoria}`] || 0);
    const alvo = alvoPorRefeicao[categoria];
    if (actual > alvo) return { excesso: actual - alvo, alvo };
    return null;
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
          <select
            value={detalhes.seguiu_plano}
            onChange={(e) => setDetalhes({ ...detalhes, seguiu_plano: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#C1634A] focus:outline-none"
          >
            <option value="sim">Seguiu o plano</option>
            <option value="parcial">Parcialmente</option>
            <option value="nao">Não seguiu</option>
          </select>
        </div>

        {/* Hora */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Hora</label>
          <input
            type="time"
            value={detalhes.hora}
            onChange={(e) => setDetalhes({ ...detalhes, hora: e.target.value })}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#C1634A] focus:outline-none"
          />
        </div>
      </div>

      {/* Alimentos selecionados */}
      {alimentosSelecionados.length > 0 && (
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">O que comeste:</label>
          <div className="flex flex-wrap gap-1.5">
            {alimentosSelecionados.map((item, i) => (
              <button
                key={i}
                onClick={() => removerAlimento(i)}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-red-50 hover:border-red-300 transition-all"
                title="Clica para remover"
              >
                <span>{item.icon}</span>
                <span className="text-gray-700">{item.nome}</span>
                <span className="text-gray-400 ml-0.5">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seleção rápida de alimentos por categoria */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Adicionar alimentos:
        </label>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {CATEGORIAS.map(cat => {
            const valor = parseFloat(detalhes[`porcoes_${cat.key}`] || 0);
            const excesso = verificarExcesso(cat.key);
            return (
              <button
                key={cat.key}
                onClick={() => setCategoriaAberta(categoriaAberta === cat.key ? null : cat.key)}
                className={`p-2 rounded-lg border-2 text-center transition-all ${
                  categoriaAberta === cat.key
                    ? 'border-[#7C8B6F] bg-[#7C8B6F]/10'
                    : excesso ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-lg">{cat.emoji}</div>
                <div className="text-xs font-medium text-gray-700">{cat.label}</div>
                <div className={`text-sm font-bold ${excesso ? 'text-orange-600' : 'text-gray-800'}`}>
                  {valor}
                  {alvoPorRefeicao && (
                    <span className="text-gray-400 font-normal">/{alvoPorRefeicao[cat.key]}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Alertas de excesso */}
        {CATEGORIAS.map(cat => {
          const excesso = verificarExcesso(cat.key);
          if (!excesso) return null;
          return (
            <div key={`alerta-${cat.key}`} className="flex items-center gap-2 px-3 py-1.5 mb-1 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
              <span>⚠️</span>
              <span><strong>{cat.label}</strong>: +{excesso.excesso} {cat.medida} acima do alvo ({excesso.alvo} por refeição)</span>
            </div>
          );
        })}

        {/* Lista de alimentos da categoria aberta */}
        {categoriaAberta && (
          <div className="bg-white border-2 border-[#7C8B6F]/30 rounded-xl p-3 mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">
                {CATEGORIAS.find(c => c.key === categoriaAberta)?.emoji}{' '}
                {CATEGORIAS.find(c => c.key === categoriaAberta)?.label} — toca para adicionar:
              </span>
              <button
                onClick={() => setCategoriaAberta(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >✕</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALIMENTOS_COMUNS[categoriaAberta].map((alimento, i) => (
                <button
                  key={i}
                  onClick={() => adicionarAlimento(categoriaAberta, alimento)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-[#7C8B6F]/10 border border-gray-200 hover:border-[#7C8B6F]/40 rounded-full text-xs transition-all"
                >
                  <span>{alimento.icon}</span>
                  <span className="text-gray-700">{alimento.nome}</span>
                  <span className="text-gray-400 text-[10px]">+{alimento.porcao}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ajuste manual de porções */}
      <details className="mb-4">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          Ajustar porções manualmente
        </summary>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {CATEGORIAS.map(cat => (
            <div key={cat.key}>
              <label className="block text-xs text-gray-500 mb-1">
                {cat.emoji} {cat.label}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={detalhes[`porcoes_${cat.key}`]}
                onChange={(e) => setDetalhes({ ...detalhes, [`porcoes_${cat.key}`]: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:border-[#C1634A] focus:outline-none text-center"
              />
            </div>
          ))}
        </div>
      </details>

      {/* Notas */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">Notas (opcional)</label>
        <textarea
          value={detalhes.notas}
          onChange={(e) => setDetalhes({ ...detalhes, notas: e.target.value })}
          placeholder="Ex: Comi fora, escolhi grelhados..."
          rows={2}
          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#C1634A] focus:outline-none"
        />
      </div>

      {/* Guardar */}
      <button
        onClick={() => onSave(detalhes)}
        disabled={saving}
        className="w-full py-3 bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {saving ? 'A guardar...' : '✓ Guardar Detalhes'}
      </button>
    </div>
  );
}
