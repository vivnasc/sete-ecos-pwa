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
// COMPONENTE: CARTÃO DE PORÇÃO (HAND-CENTRIC)
// ============================================================
const HAND_CONFIG = {
  proteina: {
    gesto: '🫲',
    nome: 'Proteína',
    medida: 'palma',
    medidaPlural: 'palmas',
    cor: 'from-rose-50 to-red-50',
    corTexto: 'text-rose-700',
    corFundo: 'bg-rose-100',
    corBorda: 'border-rose-200',
    explicacao: 'Tamanho e espessura da tua palma (sem dedos) ≈ 100g',
    equivalencias: [
      { icon: '🍗', texto: '1 peito de frango (~100g)' },
      { icon: '🐟', texto: '1 lata de atum escorrida' },
      { icon: '🥚', texto: '2-3 ovos inteiros' },
      { icon: '🥩', texto: '1 bife médio (~100g)' },
      { icon: '🦐', texto: '6-8 camarões ou 1 posta de peixe' },
      { icon: '🥛', texto: '½ palma = 1 iogurte grego' },
    ]
  },
  legumes: {
    gesto: '✊',
    nome: 'Legumes',
    medida: 'punho',
    medidaPlural: 'punhos',
    cor: 'from-green-50 to-emerald-50',
    corTexto: 'text-green-700',
    corFundo: 'bg-green-100',
    corBorda: 'border-green-200',
    explicacao: 'Tamanho do teu punho fechado ≈ 150g de legumes cozidos',
    equivalencias: [
      { icon: '🥗', texto: '2 mãos cheias de salada crua' },
      { icon: '🥦', texto: '1 chávena de brócolos' },
      { icon: '🥬', texto: '1 chávena de espinafres/couve' },
      { icon: '🍅', texto: '1 tomate médio + pepino' },
      { icon: '🥕', texto: '1 cenoura grande' },
      { icon: '🍄', texto: '1 chávena de cogumelos' },
    ]
  },
  hidratos: {
    gesto: '🤲',
    nome: 'Hidratos',
    medida: 'mão concha',
    medidaPlural: 'mãos concha',
    cor: 'from-amber-50 to-orange-50',
    corTexto: 'text-amber-700',
    corFundo: 'bg-amber-100',
    corBorda: 'border-amber-200',
    explicacao: 'O que cabe na tua mão em concha ≈ 30g de hidratos',
    equivalencias: [
      { icon: '🍚', texto: '3 col. sopa de arroz cozido' },
      { icon: '🥔', texto: '1 batata pequena ou ½ batata doce' },
      { icon: '🍝', texto: '½ chávena de massa cozida' },
      { icon: '🍞', texto: '1 fatia de pão' },
      { icon: '🍎', texto: '1 fruta média (maçã, banana, laranja)' },
      { icon: '🫚', texto: '½ chávena de mandioca cozida' },
    ]
  },
  gordura: {
    gesto: '👍',
    nome: 'Gordura',
    medida: 'polegar',
    medidaPlural: 'polegares',
    cor: 'from-purple-50 to-violet-50',
    corTexto: 'text-purple-700',
    corFundo: 'bg-purple-100',
    corBorda: 'border-purple-200',
    explicacao: 'Tamanho da ponta do teu polegar ≈ 10g de gordura',
    equivalencias: [
      { icon: '🫒', texto: '1 col. sopa de azeite' },
      { icon: '🥑', texto: '¼ de abacate' },
      { icon: '🥜', texto: '1 punhado pequeno de nozes (~15g)' },
      { icon: '🧈', texto: '1 col. chá de manteiga' },
      { icon: '🥥', texto: '2 col. sopa de coco ralado' },
      { icon: '🥜', texto: '1 col. sopa de amendoim' },
    ]
  }
};

function PorcaoCard({ tipo, quantidade, extra = 0 }) {
  const [showEquiv, setShowEquiv] = useState(false);
  const h = HAND_CONFIG[tipo];
  const total = quantidade + extra;

  return (
    <div className={`bg-gradient-to-br ${h.cor} rounded-2xl overflow-hidden shadow-sm border ${h.corBorda}`}>
      {/* Main card */}
      <button
        onClick={() => setShowEquiv(!showEquiv)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{h.gesto}</span>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">{h.nome}</h3>
              <p className="text-xs text-gray-500">{total} {total === 1 ? h.medida : h.medidaPlural}/dia</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-gray-800">{total}</span>
          </div>
        </div>
        {extra > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
            <Icons.Dumbbell />
            <span>+{extra} treino</span>
          </div>
        )}
        <p className={`text-xs mt-1.5 ${h.corTexto} opacity-70`}>
          {showEquiv ? '▲ fechar' : '▼ o que conta como 1 ' + h.medida + '?'}
        </p>
      </button>

      {/* Equivalências expandidas */}
      {showEquiv && (
        <div className={`px-4 pb-3 border-t ${h.corBorda}`}>
          <p className="text-[11px] text-gray-500 mt-2 mb-2 italic bg-white/50 rounded-lg px-2 py-1.5">
            {h.explicacao}
          </p>
          <p className="text-xs font-semibold text-gray-600 mb-1.5">
            1 {h.gesto} {h.medida} =
          </p>
          <div className="grid grid-cols-2 gap-1">
            {h.equivalencias.map((eq, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700 bg-white/60 rounded-lg px-2 py-1.5">
                <span>{eq.icon}</span>
                <span>{eq.texto}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
          <div className="p-2 bg-[#E8E4DC] rounded-lg">
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
                ? 'bg-[#7C8B6F] text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-[#E8E4DC]'
              }
            `}
            title={dia.nomeLongo}
          >
            {dia.nome}
          </button>
        ))}
      </div>

      {dias.length > 0 && (
        <p className="text-center text-sm text-[#7C8B6F] mb-4">
          +1 mão de hidratos nos dias de treino 🍚
        </p>
      )}

      {mudou && (
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-2 bg-[#E8E4DC] text-[#6B7A5D] rounded-lg font-medium hover:bg-[#D5D0C8] transition-all disabled:opacity-50"
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
  const [errorType, setErrorType] = useState(null); // 'no_intake', 'no_plan', 'generic'
  const [plano, setPlano] = useState(null);
  const [usersId, setUsersId] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [regenerando, setRegenerando] = useState(false);

  // Fallback: query vitalis_meal_plans directly when RPC/view fails
  const carregarPlanoFallback = async (userId) => {
    const { data: mealPlan } = await supabase
      .from('vitalis_meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'activo')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!mealPlan) return null;

    const { data: clientData } = await supabase
      .from('vitalis_clients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    let receitasConfig = {};
    try {
      receitasConfig = mealPlan.receitas_incluidas ? JSON.parse(mealPlan.receitas_incluidas) : {};
    } catch (e) { /* ignore */ }

    const porcoes = receitasConfig['porções_por_refeicao'] || receitasConfig.porcoes_por_refeicao || {};

    return {
      fase: {
        nome: mealPlan.fase === 'inducao' ? 'Indução'
            : mealPlan.fase === 'transicao' ? 'Transição'
            : mealPlan.fase === 'recomposicao' ? 'Recomposição'
            : mealPlan.fase === 'manutencao' ? 'Manutenção'
            : mealPlan.fase || 'Fase Inicial',
        semana: 1,
        duracao_semanas: 4
      },
      porcoes: {
        proteina: porcoes.proteina || Math.round(mealPlan.proteina_g / 25),
        legumes: porcoes.legumes || 4,
        hidratos_base: porcoes.hidratos || Math.round(mealPlan.carboidratos_g / 30),
        gordura: porcoes.gordura || Math.round(mealPlan.gordura_g / 10),
        carbs_extra_treino: 1
      },
      tamanhos: {
        palma_g: 25,
        mao_g: 30,
        polegar_g: 10
      },
      calorias: mealPlan.calorias_alvo,
      macros: {
        proteina_g: mealPlan.proteina_g,
        carboidratos_g: mealPlan.carboidratos_g,
        gordura_g: mealPlan.gordura_g
      },
      dias_treino: mealPlan.dias_treino || [],
      e_dia_treino: false,
      regras: {
        priorizar: ['Proteína em todas as refeições', 'Legumes variados', 'Água entre refeições'],
        evitar: ['Açúcar adicionado', 'Alimentos processados', 'Bebidas calóricas'],
        dicas: ['Come devagar e com atenção', 'Prepara as refeições com antecedência', 'Mantém um registo do que comes']
      },
      peso: clientData ? {
        inicial: clientData.peso_inicial,
        actual: clientData.peso_actual,
        meta: clientData.peso_meta
      } : null,
      refeicao_livre: {
        permitida: mealPlan.fase !== 'inducao',
        por_semana: mealPlan.fase === 'inducao' ? 0 : mealPlan.fase === 'transicao' ? 1 : 2
      }
    };
  };

  const carregarPlano = async () => {
    let localUserId = null;
    let localUserEmail = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Utilizador não autenticado');
        setErrorType('generic');
        return;
      }
      localUserEmail = user.email;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userError) throw userError;
      localUserId = userData.id;
      setUsersId(userData.id);

      const { data, error: planoError } = await supabase.rpc('vitalis_plano_do_dia', {
        p_user_id: userData.id
      });

      if (planoError) throw planoError;

      if (data?.erro) {
        // RPC returned error - try fallback to vitalis_meal_plans
        console.warn('RPC vitalis_plano_do_dia:', data.erro, '- trying fallback...');
        const fallbackData = await carregarPlanoFallback(userData.id);
        if (fallbackData) {
          setPlano(fallbackData);
        } else {
          // Check if intake exists to show the right error
          await detectarTipoErro(userData.id, data.erro);
        }
      } else {
        setPlano(data);
      }
    } catch (err) {
      console.error('Erro ao carregar plano:', err);
      // Try fallback on any error (use local var, not state)
      if (localUserId) {
        try {
          const fallbackData = await carregarPlanoFallback(localUserId);
          if (fallbackData) {
            setPlano(fallbackData);
            return;
          }
        } catch (fbErr) {
          console.error('Fallback failed:', fbErr);
        }
        // Check intake to show the right error
        await detectarTipoErro(localUserId, 'Erro ao carregar o plano.');
      } else {
        setError('Erro ao carregar o plano. Tenta novamente.');
        setErrorType('generic');
      }
    } finally {
      setLoading(false);
    }
  };

  // Detect whether error is due to missing intake or missing plan
  const detectarTipoErro = async (userId, mensagem) => {
    try {
      const { data: intake } = await supabase
        .from('vitalis_intake')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!intake) {
        setError('Precisas de preencher o questionário inicial para gerar o teu plano.');
        setErrorType('no_intake');
      } else {
        setError('O teu intake já está preenchido mas o plano ainda não foi gerado.');
        setErrorType('no_plan');
      }
    } catch (e) {
      setError(mensagem || 'Erro ao carregar o plano.');
      setErrorType('generic');
    }
  };

  // Regenerate plan from existing intake
  const regenerarPlano = async () => {
    if (!usersId) return;
    setRegenerando(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Sem email');

      const response = await fetch(`/api/regenerar-plano-emergencia?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();

      if (result.sucesso || result.success) {
        // Reload the plan
        setError(null);
        setErrorType(null);
        setLoading(true);
        await carregarPlano();
      } else {
        setError(result.erro || result.error || 'Erro ao regenerar plano. Tenta mais tarde.');
        setErrorType('generic');
      }
    } catch (err) {
      console.error('Erro ao regenerar plano:', err);
      setError('Erro ao regenerar plano. Tenta mais tarde.');
      setErrorType('generic');
    } finally {
      setRegenerando(false);
    }
  };

  useEffect(() => {
    carregarPlano();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">A carregar o teu plano...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] p-4">
        <div className="max-w-2xl mx-auto mt-20 bg-white rounded-2xl p-6 text-center shadow-lg">
          <div className="text-5xl mb-4">{errorType === 'no_plan' ? '⚙️' : '🥗'}</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {errorType === 'no_plan' ? 'Plano em falta' : 'Plano não disponível'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>

          {errorType === 'no_plan' ? (
            <button
              onClick={regenerarPlano}
              disabled={regenerando}
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white rounded-full font-semibold disabled:opacity-50"
            >
              {regenerando ? 'A gerar plano...' : 'Gerar o Meu Plano'}
            </button>
          ) : (
            <a
              href="/vitalis/intake"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white rounded-full font-semibold"
            >
              Completar Intake
            </a>
          )}

          <a
            href="/vitalis/dashboard"
            className="block mt-3 text-[#7C8B6F] text-sm hover:underline"
          >
            Voltar ao dashboard
          </a>
        </div>
      </div>
    );
  }

  // Calcular duração da fase
  const semanaActual = plano.fase?.semana || 1;
  const duracaoFase = plano.fase?.duracao_semanas || 4;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] text-white px-4 sm:px-6 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <Link to="/vitalis/dashboard" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4">
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
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>O Meu Plano</h1>
              <p className="text-white/80 mt-1">Resumo do teu plano alimentar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-4 space-y-4">
        
        {/* Card Fase Actual - DESTAQUE */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#E8E4DC] rounded-xl">
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
              <span className="font-medium text-[#7C8B6F]">{Math.round((semanaActual / duracaoFase) * 100)}%</span>
            </div>
            <div className="h-3 bg-[#E8E4DC] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#9CAF88] to-[#7C8B6F] rounded-full transition-all"
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
          className="w-full bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <Icons.Download />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Descarregar Plano PDF</p>
              <p className="text-white/80 text-sm">Plano completo para consultar offline</p>
            </div>
          </div>
          <span className="text-2xl">📄</span>
        </button>

        {/* Método da Mão - Hero Banner */}
        <div className="bg-gradient-to-br from-[#7C8B6F] to-[#5A6B4D] rounded-2xl p-5 shadow-lg text-white">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-5xl">🤚</div>
            <div>
              <h2 className="font-bold text-lg leading-tight">A tua mão é a tua medida</h2>
              <p className="text-white/70 text-sm">Sem balança, sem stress. Proporcional ao TEU corpo.</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
              <div className="text-2xl">🫲</div>
              <div className="text-[10px] font-semibold mt-0.5">PALMA</div>
              <div className="text-[10px] text-white/70">Proteína</div>
              <div className="text-[9px] text-white/50">≈100g</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
              <div className="text-2xl">✊</div>
              <div className="text-[10px] font-semibold mt-0.5">PUNHO</div>
              <div className="text-[10px] text-white/70">Legumes</div>
              <div className="text-[9px] text-white/50">≈150g</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
              <div className="text-2xl">🤲</div>
              <div className="text-[10px] font-semibold mt-0.5">MÃO CONCHA</div>
              <div className="text-[10px] text-white/70">Hidratos</div>
              <div className="text-[9px] text-white/50">≈30g</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2 text-center">
              <div className="text-2xl">👍</div>
              <div className="text-[10px] font-semibold mt-0.5">POLEGAR</div>
              <div className="text-[10px] text-white/70">Gordura</div>
              <div className="text-[9px] text-white/50">≈10g</div>
            </div>
          </div>
        </div>

        {/* Porções do dia - cards com equivalências integradas */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800 px-1">As tuas porções diárias</h2>
          <p className="text-xs text-gray-500 px-1 -mt-2">Toca num cartão para ver o que conta como 1 porção</p>

          <div className="grid grid-cols-2 gap-3">
            <PorcaoCard
              tipo="proteina"
              quantidade={plano.porcoes?.proteina || 0}
            />
            <PorcaoCard
              tipo="legumes"
              quantidade={plano.porcoes?.legumes || 0}
            />
            <PorcaoCard
              tipo="hidratos"
              quantidade={plano.porcoes?.hidratos_base || 0}
              extra={plano.e_dia_treino ? (plano.porcoes?.carbs_extra_treino || 0) : 0}
            />
            <PorcaoCard
              tipo="gordura"
              quantidade={plano.porcoes?.gordura || 0}
            />
          </div>
        </div>

        {/* Macros - compacto */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
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
                <p className="text-2xl font-bold text-[#7C8B6F]">{plano.peso.actual} kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Meta</p>
                <p className="text-lg font-bold text-green-600">{plano.peso.meta} kg</p>
              </div>
            </div>
            
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              {plano.peso.meta && plano.peso.inicial && plano.peso.actual && (
                <div 
                  className="h-full bg-gradient-to-r from-[#9CAF88] to-[#7C8B6F] rounded-full transition-all"
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
