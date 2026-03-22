import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { coachApi } from '../lib/coachApi';
import { SUBSCRIPTION_PLANS } from '../lib/subscriptions';
import { enviarBoasVindas, enviarConfirmacaoPagamento } from '../lib/emails';
import { calcularPorcoesDiarias, extrairConfigPlano } from '../lib/vitalis/calcularPorcoes.js';

/**
 * Coach - Vista detalhada de um cliente
 * Carrega dados via coach API (server-side, bypasses RLS)
 * Mostra plano completo com porcoes, equivalencias, dicas de fase
 */

const ABORDAGEM_LABELS = {
  keto_if: 'Keto + Jejum Intermitente',
  low_carb: 'Low Carb',
  equilibrado: 'Equilibrado'
};

const OBJECTIVO_LABELS = {
  emagrecer: 'Emagrecer',
  perder_peso: 'Perder peso',
  ganhar_massa: 'Ganhar massa',
  ganhar_energia: 'Ganhar energia',
  melhorar_saude: 'Melhorar saúde',
  controlar_emocoes: 'Controlar emoções'
};

const FASE_LABELS = {
  inducao: 'Indução',
  transicao: 'Transição',
  recomposicao: 'Recomposição',
  manutencao: 'Manutenção'
};

// Nomes de fase adaptados à abordagem
const FASE_NOMES_POR_ABORDAGEM = {
  keto_if: { inducao: 'Indução', transicao: 'Transição', recomposicao: 'Recomposição', manutencao: 'Manutenção' },
  low_carb: { inducao: 'Adaptação', transicao: 'Transição', recomposicao: 'Recomposição', manutencao: 'Manutenção' },
  equilibrado: { inducao: 'Arranque', transicao: 'Progressão', recomposicao: 'Consolidação', manutencao: 'Manutenção' }
};

// ==========================================
// HAND METHOD CONFIG (same as PlanoAlimentar)
// ==========================================
const HAND_CONFIG = {
  proteina: {
    gesto: '\u{1FAF2}', nome: 'Proteína', medida: 'palma', medidaPlural: 'palmas',
    cor: 'from-rose-50 to-red-50', corTexto: 'text-rose-700', corBorda: 'border-rose-200',
    explicacao: 'Tamanho e espessura da palma (sem dedos) \u2248 100g',
    equivalencias: [
      { icon: '\u{1F357}', texto: '1 peito de frango (~100g)' },
      { icon: '\u{1F41F}', texto: '1 lata de atum escorrida' },
      { icon: '\u{1F95A}', texto: '2-3 ovos inteiros' },
      { icon: '\u{1F969}', texto: '1 bife médio (~100g)' },
      { icon: '\u{1F990}', texto: '6-8 camarões ou 1 posta de peixe' },
      { icon: '\u{1F95B}', texto: '\u00BD palma = 1 iogurte grego' },
    ]
  },
  legumes: {
    gesto: '\u270A', nome: 'Legumes', medida: 'punho', medidaPlural: 'punhos',
    cor: 'from-green-50 to-emerald-50', corTexto: 'text-green-700', corBorda: 'border-green-200',
    explicacao: 'Tamanho do punho fechado \u2248 150g de legumes cozidos',
    equivalencias: [
      { icon: '\u{1F957}', texto: '2 mãos cheias de salada crua' },
      { icon: '\u{1F966}', texto: '1 chávena de brócolos' },
      { icon: '\u{1F96C}', texto: '1 chávena de espinafres/couve' },
      { icon: '\u{1F345}', texto: '1 tomate médio + pepino' },
      { icon: '\u{1F955}', texto: '1 cenoura grande' },
      { icon: '\u{1F344}', texto: '1 chávena de cogumelos' },
    ]
  },
  hidratos: {
    gesto: '\u{1F932}', nome: 'Hidratos', medida: 'mão concha', medidaPlural: 'mãos concha',
    cor: 'from-amber-50 to-orange-50', corTexto: 'text-amber-700', corBorda: 'border-amber-200',
    explicacao: 'O que cabe na mão em concha \u2248 30g de hidratos',
    equivalencias: [
      { icon: '\u{1F35A}', texto: '3 col. sopa de arroz cozido' },
      { icon: '\u{1F954}', texto: '1 batata pequena ou \u00BD batata-doce' },
      { icon: '\u{1F35D}', texto: '\u00BD chávena de massa cozida' },
      { icon: '\u{1F35E}', texto: '1 fatia de pão' },
      { icon: '\u{1F34E}', texto: '1 fruta média (maçã, banana, laranja)' },
      { icon: '\u{1FAD0}', texto: '\u00BD chávena de mandioca cozida' },
    ]
  },
  gordura: {
    gesto: '\u{1F44D}', nome: 'Gordura', medida: 'polegar', medidaPlural: 'polegares',
    cor: 'from-purple-50 to-violet-50', corTexto: 'text-purple-700', corBorda: 'border-purple-200',
    explicacao: 'Tamanho da ponta do polegar \u2248 10g de gordura',
    equivalencias: [
      { icon: '\u{1FAD2}', texto: '1 col. sopa de azeite' },
      { icon: '\u{1F951}', texto: '\u00BC de abacate' },
      { icon: '\u{1F95C}', texto: '1 punhado pequeno de nozes (~15g)' },
      { icon: '\u{1F9C8}', texto: '1 col. cha de manteiga' },
      { icon: '\u{1F965}', texto: '2 col. sopa de coco ralado' },
      { icon: '\u{1F95C}', texto: '1 col. sopa de amendoim' },
    ]
  }
};

// Dicas de fase adaptadas à abordagem do cliente
const FASES_DICAS_POR_ABORDAGEM = {
  keto_if: {
    inducao: {
      nome: 'Fase 1: Indução', duracao: '3-4 semanas',
      descricao: 'Fase de arranque cetogénico. Foco em proteína, gorduras saudáveis e vegetais.',
      priorizar: ['Proteína em todas as refeições', 'Vegetais verdes em abundância (4+ punhos/dia)', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água mínimo 2.5L/dia', 'Sono 7-9 horas', 'Electrólitos (sal marinho, magnésio)'],
      evitar: ['Açúcar e adoçantes', 'Grãos e cereais (pão, massa, arroz)', 'Frutas doces (banana, manga, uvas)', 'Leguminosas (feijão, grão)', 'Álcool', 'Alimentos processados'],
      dicas: ['Prepara refeições ao domingo', 'Tem snacks keto à mão (ovos cozidos, queijo, nozes)', 'Podes sentir "keto flu" dias 2-4 — é temporário', 'Adiciona 1 colher de sal na água 2x/dia', 'Pesa-te às sextas em jejum']
    },
    transicao: {
      nome: 'Fase 2: Transição', duracao: '4-6 semanas',
      descricao: 'Reintrodução gradual de hidratos complexos mantendo perda de gordura.',
      priorizar: ['Manter proteína elevada', 'Hidratos complexos pós-treino (batata-doce, arroz integral)', 'Fruta de baixo índice glicémico', 'Leguminosas em moderação', 'Água mínimo 2L/dia'],
      evitar: ['Açúcar refinado', 'Farinhas brancas e pão branco', 'Ultra-processados', 'Bebidas açucaradas', 'Refeições sem proteína'],
      dicas: ['Introduz UM hidrato novo por semana', 'Observa como o corpo reage nas 48h', 'Mantém o diário alimentar', 'Hidratos funcionam melhor perto do treino']
    },
    recomposicao: {
      nome: 'Fase 3: Recomposição', duracao: '6-8 semanas',
      descricao: 'Ganho de massa muscular com manutenção de gordura baixa.',
      priorizar: ['Proteína alta (2g/kg)', 'Hidratos em volta do treino', 'Treino de força 3-4x/semana', 'Sono reparador'],
      evitar: ['Déficit calórico excessivo', 'Cardio em excesso', 'Saltar refeições pós-treino'],
      dicas: ['Come mais nos dias de treino', 'Menos hidratos nos dias de descanso', 'Prioriza alimentos inteiros']
    },
    manutencao: {
      nome: 'Fase 4: Manutenção', duracao: 'Contínua',
      descricao: 'Manutenção dos resultados com hábitos sustentáveis.',
      priorizar: ['Manter proteína elevada', 'Variedade alimentar', 'Rotina de refeições consistente', 'Movimento regular'],
      evitar: ['Voltar aos velhos padrões', 'Dietas extremas', 'Saltar refeições'],
      dicas: ['1-2 refeições livres por semana', 'Celebra vitórias não-balança', 'O processo é individual']
    }
  },
  low_carb: {
    inducao: {
      nome: 'Fase 1: Adaptação', duracao: '3-4 semanas',
      descricao: 'Fase de adaptação. Redução gradual de hidratos, foco em proteína e vegetais.',
      priorizar: ['Proteína em todas as refeições', 'Vegetais variados em abundância (4+ punhos/dia)', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água mínimo 2L/dia', 'Sono 7-9 horas', 'Hidratos complexos em pequenas porções'],
      evitar: ['Açúcar refinado e adoçantes', 'Pão branco, massa branca, arroz branco', 'Bebidas açucaradas', 'Ultra-processados', 'Álcool em excesso', 'Snacks embalados'],
      dicas: ['Prepara refeições ao domingo', 'Tem snacks saudáveis à mão (ovos cozidos, nozes, queijo)', 'Substitui hidratos refinados por integrais', 'Fruta com baixo açúcar (frutos vermelhos, maçã verde)', 'Pesa-te às sextas em jejum']
    },
    transicao: {
      nome: 'Fase 2: Transição', duracao: '4-6 semanas',
      descricao: 'Optimização dos hidratos — manter baixo mas com mais variedade.',
      priorizar: ['Manter proteína elevada', 'Hidratos complexos pós-treino (batata-doce, arroz integral)', 'Fruta de baixo índice glicémico', 'Leguminosas em moderação', 'Água mínimo 2L/dia'],
      evitar: ['Açúcar refinado', 'Farinhas brancas', 'Ultra-processados', 'Bebidas açucaradas', 'Refeições sem proteína'],
      dicas: ['Ajusta porções de hidratos conforme actividade', 'Observa como o corpo reage', 'Mantém o diário alimentar', 'Hidratos funcionam melhor perto do treino']
    },
    recomposicao: {
      nome: 'Fase 3: Recomposição', duracao: '6-8 semanas',
      descricao: 'Ganho de massa muscular com manutenção de gordura baixa.',
      priorizar: ['Proteína alta (2g/kg)', 'Hidratos em volta do treino', 'Treino de força 3-4x/semana', 'Sono reparador'],
      evitar: ['Déficit calórico excessivo', 'Cardio em excesso', 'Saltar refeições pós-treino'],
      dicas: ['Come mais nos dias de treino', 'Menos hidratos nos dias de descanso', 'Prioriza alimentos inteiros']
    },
    manutencao: {
      nome: 'Fase 4: Manutenção', duracao: 'Contínua',
      descricao: 'Manutenção dos resultados com hábitos sustentáveis.',
      priorizar: ['Manter proteína elevada', 'Variedade alimentar', 'Rotina de refeições consistente', 'Movimento regular'],
      evitar: ['Voltar aos velhos padrões', 'Dietas extremas', 'Saltar refeições'],
      dicas: ['1-2 refeições livres por semana', 'Celebra vitórias não-balança', 'O processo é individual']
    }
  },
  equilibrado: {
    inducao: {
      nome: 'Fase 1: Arranque', duracao: '3-4 semanas',
      descricao: 'Fase de criação de hábitos. Refeições equilibradas e regulares com todos os grupos alimentares.',
      priorizar: ['Proteína em todas as refeições', 'Vegetais variados em abundância (4+ punhos/dia)', 'Hidratos complexos (arroz integral, batata-doce, aveia)', 'Gorduras saudáveis (azeite, abacate, nozes)', 'Água mínimo 2L/dia', 'Horários regulares de refeição'],
      evitar: ['Açúcar refinado e ultra-processados', 'Refeições sem proteína', 'Saltar refeições', 'Bebidas açucaradas', 'Álcool em excesso', 'Comer por stress ou emoção'],
      dicas: ['Prepara refeições ao domingo', 'Tem snacks saudáveis à mão (fruta, iogurte, nozes)', 'Come devagar e com atenção', 'Não elimines nenhum grupo alimentar', 'Pesa-te às sextas em jejum']
    },
    transicao: {
      nome: 'Fase 2: Progressão', duracao: '4-6 semanas',
      descricao: 'Aprofundamento dos hábitos e optimização das porções.',
      priorizar: ['Manter proteína elevada', 'Variedade de hidratos complexos', 'Fruta e vegetais variados', 'Leguminosas 2-3x/semana', 'Água mínimo 2L/dia'],
      evitar: ['Açúcar refinado', 'Farinhas brancas em excesso', 'Ultra-processados', 'Bebidas açucaradas', 'Refeições sem vegetais'],
      dicas: ['Experimenta novos alimentos saudáveis', 'Ajusta porções conforme a fome e actividade', 'Mantém o diário alimentar', 'Inclui hidratos complexos em cada refeição principal']
    },
    recomposicao: {
      nome: 'Fase 3: Consolidação', duracao: '6-8 semanas',
      descricao: 'Consolidação dos resultados e melhoria da composição corporal.',
      priorizar: ['Proteína alta (1.6-2g/kg)', 'Hidratos em volta do treino', 'Treino de força 3-4x/semana', 'Sono reparador'],
      evitar: ['Déficit calórico excessivo', 'Cardio em excesso', 'Saltar refeições pós-treino'],
      dicas: ['Come mais nos dias de treino', 'Menos hidratos nos dias de descanso', 'Prioriza alimentos inteiros']
    },
    manutencao: {
      nome: 'Fase 4: Manutenção', duracao: 'Contínua',
      descricao: 'Manutenção dos resultados com hábitos sustentáveis.',
      priorizar: ['Manter proteína elevada', 'Variedade alimentar', 'Rotina de refeições consistente', 'Movimento regular'],
      evitar: ['Voltar aos velhos padrões', 'Dietas extremas', 'Saltar refeições'],
      dicas: ['1-2 refeições livres por semana', 'Celebra vitórias não-balança', 'O processo é individual']
    }
  }
};

export default function CoachClienteDetalhe() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('resumo');

  // Data
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [intake, setIntake] = useState(null);
  const [plano, setPlano] = useState([]);
  const [registos, setRegistos] = useState([]);
  const [aguaLogs, setAguaLogs] = useState([]);
  const [mealsLogs, setMealsLogs] = useState([]);
  const [medidas, setMedidas] = useState([]);
  const [checkins, setCheckins] = useState([]);

  // Actions
  const [gerandoPlano, setGerandoPlano] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(null);

  useEffect(() => {
    if (userId) loadClientData();
  }, [userId]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Server-side fetch via coach API (bypasses RLS)
      const data = await coachApi.buscarDadosCliente(userId);
      setUser(data.user);
      setClient(data.client);
      setIntake(data.intake);
      setPlano(data.planos || []);
      setRegistos(data.registos || []);
      setAguaLogs(data.aguaLogs || []);
      setMealsLogs(data.mealsLogs || []);
      setMedidas(data.medidas || []);
      setCheckins(data.checkins || []);
    } catch (err) {
      console.error('Erro ao carregar dados do cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  // Current active plan (or most recent non-error)
  const activePlan = plano.find(p => p.status === 'activo') || plano.find(p => p.status !== 'erro') || null;
  const errorPlan = plano.find(p => p.status === 'erro');
  const hasIntake = !!(intake && intake.altura_cm && intake.peso_actual && intake.idade);

  // Parse error message from error plan
  const parseErro = (p) => {
    if (!p?.receitas_incluidas) return null;
    try {
      const parsed = typeof p.receitas_incluidas === 'string' ? JSON.parse(p.receitas_incluidas) : p.receitas_incluidas;
      return parsed.erro || null;
    } catch { return null; }
  };
  const planErroMsg = parseErro(errorPlan);

  // Porções diárias — função partilhada (PDF + dashboard + cliente)
  const porcoes = calcularPorcoesDiarias(activePlan);
  const porcoesProteina = porcoes.proteina;
  const porcoesLegumes = porcoes.legumes;
  const porcoesHidratos = porcoes.hidratos;
  const porcoesGordura = porcoes.gordura;
  const { numRefeicoes, horarios } = extrairConfigPlano(activePlan);

  // Generate plan
  const handleGerarPlano = async () => {
    if (!confirm('Gerar plano nutricional para este cliente?')) return;
    setGerandoPlano(true);
    try {
      await coachApi.gerarPlano(userId);
      loadClientData();
    } catch (err) {
      alert('Erro ao gerar plano: ' + err.message);
    } finally {
      setGerandoPlano(false);
    }
  };

  // Delete client
  const handleDeleteClient = async () => {
    const nome = user?.nome || user?.email || 'este cliente';
    if (!confirm(`APAGAR "${nome}" e TODOS os seus dados?\n\nIsto é irreversível!`)) return;
    if (!confirm('Última chance. Confirmas?')) return;
    try {
      await coachApi.apagarCliente(userId);
      alert('Cliente apagado.');
      navigate('/coach');
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  // Activate subscription
  const handleActivate = async (planKey) => {
    if (!confirm(`Activar ${SUBSCRIPTION_PLANS[planKey].name}?`)) return;
    try {
      const result = await coachApi.activarSubscricao(userId, planKey);
      const validoAte = new Date(result.expiresAt).toLocaleDateString('pt-PT');
      alert(`Activado ate ${validoAte}`);

      // Enviar emails de boas-vindas e confirmacao a cliente
      if (user?.email) {
        const plan = SUBSCRIPTION_PLANS[planKey];
        const sexo = intake?.sexo;
        enviarBoasVindas(user.email, user.nome, sexo).catch(() => {});
        enviarConfirmacaoPagamento(user.email, {
          nome: user.nome,
          plano: plan.name,
          valor: `${plan.price_mzn?.toLocaleString('pt-MZ') || plan.price_usd} ${plan.price_mzn ? 'MZN' : 'USD'}`,
          data: new Date().toLocaleDateString('pt-PT'),
          validoAte,
          sexo
        }).catch(() => {});
      }

      loadClientData();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-500">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Cliente não encontrado.</p>
          <Link to="/coach" className="text-blue-600 text-sm mt-2 block">Voltar</Link>
        </div>
      </div>
    );
  }

  const abordagemCliente = activePlan?.abordagem || intake?.abordagem_preferida || 'equilibrado';
  const faseDicasAbordagem = FASES_DICAS_POR_ABORDAGEM[abordagemCliente] || FASES_DICAS_POR_ABORDAGEM.equilibrado;
  const faseDicas = faseDicasAbordagem[activePlan?.fase] || null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/coach" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.nome || 'Sem nome'}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={client?.subscription_status} />
                {client?.subscription_expires && (
                  <span className="text-xs text-gray-400">
                    Expira: {new Date(client.subscription_expires).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>
            </div>
            {hasIntake && (
              <button
                onClick={handleGerarPlano}
                disabled={gerandoPlano}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {gerandoPlano ? 'A gerar...' : (activePlan ? 'Regenerar' : 'Gerar plano')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-4xl mx-auto flex gap-1 overflow-x-auto">
          {[
            { key: 'resumo', label: 'Resumo' },
            { key: 'plano', label: 'Plano completo' },
            { key: 'intake', label: 'Intake' },
            { key: 'progresso', label: 'Progresso' },
            { key: 'notificacoes', label: 'Notificações' },
            { key: 'gestao', label: 'Gestão' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">

        {/* === RESUMO === */}
        {tab === 'resumo' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InfoCard label="Subscrição" value={STATUS_LABELS_TEXT[client?.subscription_status] || 'N/A'} />
              <InfoCard label="Intake" value={hasIntake ? 'Completo' : 'Em falta'} color={hasIntake ? 'green' : 'red'} />
              <InfoCard label="Plano" value={
                activePlan?.status === 'activo' ? 'Activo' :
                activePlan ? 'Inactivo' :
                errorPlan ? 'Erro' : 'Sem plano'
              } color={
                activePlan?.status === 'activo' ? 'green' :
                errorPlan ? 'red' :
                activePlan ? 'gray' : 'red'
              } />
              <InfoCard label="Check-ins" value={`${registos.length} (30d)`} />
            </div>

            {/* Plan overview */}
            {activePlan && (
              <div className="bg-white rounded-xl border border-green-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Plano actual</h3>
                  <button
                    onClick={() => setTab('plano')}
                    className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Ver plano completo
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-800">{activePlan.calorias_alvo}</p>
                    <p className="text-[10px] text-gray-500">kcal/dia</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-rose-700">{activePlan.proteina_g}g</p>
                    <p className="text-[10px] text-gray-500">Proteina</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-amber-700">{activePlan.carboidratos_g}g</p>
                    <p className="text-[10px] text-gray-500">Carbs</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-purple-700">{activePlan.gordura_g}g</p>
                    <p className="text-[10px] text-gray-500">Gordura</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-blue-700">{FASE_LABELS[activePlan.fase] || activePlan.fase}</p>
                    <p className="text-[10px] text-gray-500">Fase</p>
                  </div>
                </div>
                {/* Detalhe do cálculo TMB */}
                {intake && (
                  <details className="mt-3">
                    <summary className="text-[10px] text-gray-400 cursor-pointer font-medium">Ver cálculo TMB</summary>
                    <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                      {(() => {
                        const peso = parseFloat(intake.peso_actual) || 0;
                        const altura = parseFloat(intake.altura_cm) || 165;
                        const idade = parseInt(intake.idade) || 30;
                        const sexo = intake.sexo;
                        const tmb = sexo === 'masculino'
                          ? (10 * peso) + (6.25 * altura) - (5 * idade) + 5
                          : (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
                        const factores = { sedentaria: 1.2, leve: 1.375, moderada: 1.55, intensa: 1.725 };
                        const factor = factores[intake.nivel_actividade] || 1.2;
                        const tdee = tmb * factor;
                        const prontidao = parseInt(intake.prontidao_1a10) || 5;
                        const obj = intake.objectivo_principal;
                        let defLabel = 'Manutenção (0%)';
                        let calFinal = tdee;
                        if (obj === 'perder_peso' || obj === 'emagrecer') {
                          if (prontidao <= 4) { calFinal = tdee * 0.87; defLabel = `Deficit 13% (prontidão ${prontidao}/10)`; }
                          else if (prontidao <= 7) { calFinal = tdee * 0.82; defLabel = `Deficit 18% (prontidão ${prontidao}/10)`; }
                          else { calFinal = tdee * 0.75; defLabel = `Deficit 25% (prontidão ${prontidao}/10)`; }
                        } else if (obj === 'ganhar_massa') {
                          calFinal = tdee * 1.1; defLabel = 'Superavit 10%';
                        }
                        // Calorias reais das porções
                        const calPorcoes = (porcoesProteina * 25 * 4) + (porcoesHidratos * 30 * 4) + (porcoesGordura * 10 * 9) + (porcoesLegumes * 50 * 0.3);
                        return (
                          <>
                            <p>Peso: {peso}kg | Altura: {altura}cm | Idade: {idade} | Sexo: {sexo}</p>
                            <p>TMB (Mifflin-St Jeor): <strong>{Math.round(tmb)} kcal</strong></p>
                            <p>Actividade: {intake.nivel_actividade} (×{factor}) → TDEE: <strong>{Math.round(tdee)} kcal</strong></p>
                            <p>Objectivo: {obj} | {defLabel}</p>
                            <p>Alvo calculado: <strong>{Math.round(calFinal)} kcal/dia</strong></p>
                            <p className="border-t border-gray-200 pt-1 mt-1">Porções → {porcoesProteina} prot + {porcoesHidratos} hid + {porcoesGordura} gord + {porcoesLegumes} leg</p>
                            <p>Calorias reais das porções: <strong className={Math.abs(calPorcoes - calFinal) > 200 ? 'text-red-600' : 'text-green-600'}>~{Math.round(calPorcoes)} kcal</strong>
                              {Math.abs(calPorcoes - calFinal) > 200 && <span className="text-red-500"> (diferença de {Math.round(Math.abs(calPorcoes - calFinal))} kcal!)</span>}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* Error plan alert */}
            {errorPlan && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">&#x26A0;&#xFE0F;</span>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-semibold mb-1">Erro na geração do plano</p>
                    <p className="text-sm text-red-700">{planErroMsg || 'Erro desconhecido'}</p>
                    <p className="text-xs text-red-400 mt-1">
                      {errorPlan.created_at ? new Date(errorPlan.created_at).toLocaleString('pt-PT') : ''}
                    </p>
                    <button onClick={handleGerarPlano} disabled={gerandoPlano}
                      className="mt-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                      {gerandoPlano ? 'A gerar...' : 'Tentar novamente'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!activePlan && !errorPlan && hasIntake && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800 font-medium mb-2">Intake preenchido mas sem plano gerado!</p>
                <button onClick={handleGerarPlano} disabled={gerandoPlano}
                  className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
                  {gerandoPlano ? 'A gerar...' : 'Gerar plano agora'}
                </button>
              </div>
            )}

            {!hasIntake && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800 font-medium">Cliente ainda nao preencheu o intake.</p>
              </div>
            )}

            {/* Weight */}
            {client && (client.peso_inicial || client.peso_actual || client.peso_meta) && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Peso</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Inicial</p>
                    <p className="text-xl font-bold text-gray-400">{client.peso_inicial || '-'} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Actual</p>
                    <p className="text-xl font-bold text-gray-800">{client.peso_actual || '-'} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Meta</p>
                    <p className="text-xl font-bold text-green-600">{client.peso_meta || '-'} kg</p>
                  </div>
                </div>
                {client.peso_inicial && client.peso_actual && client.peso_inicial > client.peso_actual && (
                  <p className="text-center text-sm text-green-600 mt-2">
                    Ja perdeu {(client.peso_inicial - client.peso_actual).toFixed(1)} kg
                  </p>
                )}
              </div>
            )}

            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Actividade recente</h3>
              {registos.length === 0 && aguaLogs.length === 0 && mealsLogs.length === 0 ? (
                <p className="text-sm text-gray-500">Sem actividade registada.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {registos.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Check-in</span>
                      <span className="text-gray-400">{r.data}</span>
                      <span className={`font-medium ${r.aderencia_1a10 >= 7 ? 'text-green-600' : r.aderencia_1a10 >= 4 ? 'text-amber-600' : 'text-red-600'}`}>
                        {r.aderencia_1a10}/10
                      </span>
                    </div>
                  ))}
                  {aguaLogs.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Água (último)</span>
                      <span className="text-gray-400">{aguaLogs[0].data}</span>
                      <span className="font-medium text-blue-600">{aguaLogs[0].quantidade_ml}ml</span>
                    </div>
                  )}
                  {mealsLogs.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Refeição (último)</span>
                      <span className="text-gray-400">{mealsLogs[0].data}</span>
                      <span className={`font-medium ${mealsLogs[0].seguiu_plano === 'sim' ? 'text-green-600' : 'text-amber-600'}`}>
                        {mealsLogs[0].seguiu_plano}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* === PLANO COMPLETO === */}
        {tab === 'plano' && (
          <>
            {!activePlan ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-2xl mb-3">{hasIntake ? '\u2699\uFE0F' : '\u{1F4CB}'}</p>
                <p className="text-gray-500 mb-3">{hasIntake ? 'Intake preenchido mas sem plano.' : 'Sem intake nem plano.'}</p>
                {hasIntake && (
                  <button onClick={handleGerarPlano} disabled={gerandoPlano}
                    className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {gerandoPlano ? 'A gerar...' : 'Gerar plano'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Fase + Abordagem header */}
                <div className="bg-gradient-to-r from-[#7C8B6F] to-[#5A6B4D] rounded-xl p-5 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-xl font-bold">{faseDicas?.nome || FASE_LABELS[activePlan.fase] || activePlan.fase}</h2>
                      <p className="text-white/70 text-sm">{ABORDAGEM_LABELS[activePlan.abordagem] || activePlan.abordagem} | {faseDicas?.duracao || ''}</p>
                    </div>
                    <button
                      onClick={() => window.open(`/vitalis/plano-pdf?id=${activePlan.id}&userId=${userId}&nome=${encodeURIComponent(user?.nome || '')}`, '_blank')}
                      className="px-3 py-1.5 text-sm font-medium bg-white/20 rounded-lg hover:bg-white/30"
                    >
                      Ver PDF
                    </button>
                  </div>
                  {faseDicas?.descricao && (
                    <p className="text-white/80 text-sm">{faseDicas.descricao}</p>
                  )}
                </div>

                {/* Macros bar */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-gray-800">{activePlan.calorias_alvo}</p>
                      <p className="text-xs text-gray-500">kcal/dia</p>
                    </div>
                    <div className="bg-rose-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-rose-700">{activePlan.proteina_g}g</p>
                      <p className="text-xs text-gray-500">Proteina</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-amber-700">{activePlan.carboidratos_g}g</p>
                      <p className="text-xs text-gray-500">Carbs</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-purple-700">{activePlan.gordura_g}g</p>
                      <p className="text-xs text-gray-500">Gordura</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-blue-700">{numRefeicoes}</p>
                      <p className="text-xs text-gray-500">Refeições</p>
                    </div>
                  </div>
                  {horarios.length > 0 && (
                    <p className="text-center text-sm text-gray-500 mt-2">Horários: {horarios.join(' | ')}</p>
                  )}
                </div>

                {/* Hand method hero */}
                <div className="bg-gradient-to-br from-[#7C8B6F] to-[#5A6B4D] rounded-xl p-4 text-white">
                  <h3 className="font-bold mb-2">Método da Mão — Porções diárias</h3>
                  <p className="text-white/70 text-sm mb-3">Sem balança, proporcional ao corpo {intake?.sexo === 'masculino' ? 'do cliente' : 'da cliente'}</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white/15 rounded-lg p-2 text-center">
                      <div className="text-2xl">{HAND_CONFIG.proteina.gesto}</div>
                      <div className="text-xs font-bold">{porcoesProteina}</div>
                      <div className="text-[10px] text-white/70">palmas</div>
                    </div>
                    <div className="bg-white/15 rounded-lg p-2 text-center">
                      <div className="text-2xl">{HAND_CONFIG.legumes.gesto}</div>
                      <div className="text-xs font-bold">{porcoesLegumes}</div>
                      <div className="text-[10px] text-white/70">punhos</div>
                    </div>
                    <div className="bg-white/15 rounded-lg p-2 text-center">
                      <div className="text-2xl">{HAND_CONFIG.hidratos.gesto}</div>
                      <div className="text-xs font-bold">{porcoesHidratos}</div>
                      <div className="text-[10px] text-white/70">mãos</div>
                    </div>
                    <div className="bg-white/15 rounded-lg p-2 text-center">
                      <div className="text-2xl">{HAND_CONFIG.gordura.gesto}</div>
                      <div className="text-xs font-bold">{porcoesGordura}</div>
                      <div className="text-[10px] text-white/70">polegares</div>
                    </div>
                  </div>
                </div>

                {/* Portion cards with food equivalences */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">O que conta como 1 porção</h3>
                  {['proteina', 'legumes', 'hidratos', 'gordura'].map(tipo => {
                    const h = HAND_CONFIG[tipo];
                    const qtd = tipo === 'proteina' ? porcoesProteina
                      : tipo === 'legumes' ? porcoesLegumes
                      : tipo === 'hidratos' ? porcoesHidratos
                      : porcoesGordura;
                    return (
                      <div key={tipo} className={`bg-gradient-to-br ${h.cor} rounded-xl border ${h.corBorda} p-4`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{h.gesto}</span>
                            <div>
                              <h4 className="font-bold text-gray-800 text-sm">{h.nome}</h4>
                              <p className="text-xs text-gray-500">{qtd} {qtd === 1 ? h.medida : h.medidaPlural}/dia</p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-gray-800">{qtd}</span>
                        </div>
                        <p className="text-xs text-gray-500 italic mb-2">{h.explicacao}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {h.equivalencias.map((eq, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700 bg-white/60 rounded-lg px-2 py-1.5">
                              <span>{eq.icon}</span>
                              <span>{eq.texto}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Phase tips */}
                {faseDicas && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                    <h3 className="font-semibold text-gray-900">Regras da fase: {faseDicas.nome}</h3>

                    {faseDicas.priorizar?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-600 uppercase mb-2">PRIORIZAR</p>
                        <ul className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg space-y-1">
                          {faseDicas.priorizar.map((item, i) => <li key={i}>+ {item}</li>)}
                        </ul>
                      </div>
                    )}

                    {faseDicas.evitar?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-red-600 uppercase mb-2">EVITAR</p>
                        <ul className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg space-y-1">
                          {faseDicas.evitar.map((item, i) => <li key={i}>- {item}</li>)}
                        </ul>
                      </div>
                    )}

                    {faseDicas.dicas?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase mb-2">DICAS</p>
                        <ul className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg space-y-1">
                          {faseDicas.dicas.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Weight progress */}
                {client && client.peso_inicial && client.peso_meta && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Progresso de peso</h3>
                    <div className="grid grid-cols-3 gap-3 text-center mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Início</p>
                        <p className="text-lg font-bold text-gray-400">{client.peso_inicial} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Actual</p>
                        <p className="text-xl font-bold text-gray-800">{client.peso_actual} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Meta</p>
                        <p className="text-lg font-bold text-green-600">{client.peso_meta} kg</p>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#9CAF88] to-[#7C8B6F] rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(0,
                            ((client.peso_inicial - client.peso_actual) / (client.peso_inicial - client.peso_meta)) * 100
                          ))}%`
                        }}
                      />
                    </div>
                    {client.peso_inicial > client.peso_actual && (
                      <p className="text-center text-sm text-green-600 mt-2">
                        Já perdeu {(client.peso_inicial - client.peso_actual).toFixed(1)} kg
                      </p>
                    )}
                  </div>
                )}

                {/* Free meal */}
                {activePlan.fase !== 'inducao' && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{'\u{1F355}'}</span>
                      <div>
                        <p className="font-semibold text-gray-800">Refeição livre</p>
                        <p className="text-sm text-gray-600">
                          {activePlan.fase === 'transicao' ? '1x' : '2x'} por semana nesta fase
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan history */}
                {plano.length > 1 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Histórico de planos ({plano.length})</h3>
                    <div className="space-y-2">
                      {plano.map((p, index) => (
                        <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2">
                            <PlanStatusBadge status={p.status} />
                            <span className="text-gray-600">v{p.versao || index + 1} | {p.calorias_alvo}kcal | P:{p.proteina_g}g C:{p.carboidratos_g}g G:{p.gordura_g}g</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-PT') : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* === INTAKE === */}
        {tab === 'intake' && (
          <>
            {!intake ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">Intake não preenchido.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Dados do Intake</h3>
                <div className="grid grid-cols-2 gap-4">
                  <IntakeField label="Sexo" value={intake.sexo} />
                  <IntakeField label="Idade" value={intake.idade ? `${intake.idade} anos` : null} />
                  <IntakeField label="Peso actual" value={intake.peso_actual ? `${intake.peso_actual} kg` : null} />
                  <IntakeField label="Altura" value={intake.altura_cm ? `${intake.altura_cm} cm` : null} />
                  <IntakeField label="Peso meta" value={intake.peso_meta ? `${intake.peso_meta} kg` : null} />
                  <IntakeField label="Objectivo" value={OBJECTIVO_LABELS[intake.objectivo_principal] || intake.objectivo_principal} />
                  <IntakeField label="Nível actividade" value={intake.nivel_actividade} />
                  <IntakeField label="Abordagem" value={ABORDAGEM_LABELS[intake.abordagem_preferida] || intake.abordagem_preferida} />
                  <IntakeField label="Jejum" value={intake.aceita_jejum ? 'Sim' : 'Não'} />
                  <IntakeField label="Refeições/dia" value={intake.num_refeicoes_dia} />
                  <IntakeField label="Pequeno-almoço" value={intake.pequeno_almoco} />
                  <IntakeField label="Emoção dominante" value={intake.emocao_dominante} />
                  <IntakeField label="Prontidão (1-10)" value={intake.prontidao_1a10} />
                </div>
                {intake.restricoes_alimentares && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">Restrições alimentares:</p>
                    <p className="text-sm text-gray-800">{Array.isArray(intake.restricoes_alimentares) ? intake.restricoes_alimentares.join(', ') : intake.restricoes_alimentares}</p>
                  </div>
                )}
                {intake.tipos_comida && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Tipos de comida preferidos:</p>
                    <p className="text-sm text-gray-800">{Array.isArray(intake.tipos_comida) ? intake.tipos_comida.join(', ') : intake.tipos_comida}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-4">
                  Preenchido: {intake.created_at ? new Date(intake.created_at).toLocaleString('pt-PT') : 'N/A'}
                </p>
              </div>
            )}
            {hasIntake && (
              <button onClick={handleGerarPlano} disabled={gerandoPlano}
                className="w-full py-3 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
                {gerandoPlano ? 'A gerar plano...' : (activePlan ? 'Regenerar plano' : 'Gerar plano')}
              </button>
            )}
          </>
        )}

        {/* === PROGRESSO === */}
        {tab === 'progresso' && (
          <>
            {/* ===== EVOLUÇÃO PESO ===== */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Evolução de Peso</h3>
              {(() => {
                const pesosRegistos = registos.filter(r => r.peso).map(r => ({ data: r.data, peso: parseFloat(r.peso) }));
                const pesosCheckins = checkins.filter(c => c.peso).map(c => ({ data: c.data, peso: parseFloat(c.peso) }));
                const todosPesos = [...pesosRegistos, ...pesosCheckins]
                  .sort((a, b) => a.data.localeCompare(b.data))
                  .filter((p, i, arr) => i === 0 || p.data !== arr[i - 1].data);

                // Sem registos individuais — usar dados do vitalis_clients
                if (todosPesos.length === 0 && client?.peso_inicial) {
                  const pesoIni = parseFloat(client.peso_inicial);
                  const pesoAct = parseFloat(client.peso_actual) || pesoIni;
                  const pesoMeta = parseFloat(client.peso_meta);
                  const diff = pesoAct - pesoIni;
                  return (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-center flex-1">
                          <p className="text-xs text-gray-500">Inicial</p>
                          <p className="text-lg font-bold text-gray-400">{pesoIni}kg</p>
                        </div>
                        <div className="text-center flex-1">
                          <p className={`text-sm font-bold ${diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                            {diff < 0 ? '' : '+'}{diff.toFixed(1)}kg
                          </p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-xs text-gray-500">Actual</p>
                          <p className="text-lg font-bold text-gray-800">{pesoAct}kg</p>
                        </div>
                        {pesoMeta && (
                          <div className="text-center flex-1">
                            <p className="text-xs text-gray-500">Meta</p>
                            <p className="text-lg font-bold text-green-600">{pesoMeta}kg</p>
                          </div>
                        )}
                      </div>
                      {pesoMeta && pesoIni > pesoMeta && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(((pesoIni - pesoAct) / (pesoIni - pesoMeta)) * 100, 100)}%` }} />
                        </div>
                      )}
                      {diff < 0 && <p className="text-center text-sm text-green-600">Já perdeu {Math.abs(diff).toFixed(1)} kg</p>}
                      <p className="text-[10px] text-gray-400 mt-1 text-center">Sem registos diários de peso — dados do perfil do cliente</p>
                    </div>
                  );
                }

                if (todosPesos.length === 0) return <p className="text-sm text-gray-500">Sem registos de peso.</p>;

                const pesoMin = Math.min(...todosPesos.map(p => p.peso));
                const pesoMax = Math.max(...todosPesos.map(p => p.peso));
                const range = pesoMax - pesoMin || 1;
                const primeiro = todosPesos[0].peso;
                const ultimo = todosPesos[todosPesos.length - 1].peso;
                const diff = ultimo - primeiro;

                return (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Início</p>
                        <p className="text-lg font-bold text-gray-400">{primeiro}kg</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className={`text-sm font-bold ${diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                          {diff < 0 ? '' : '+'}{diff.toFixed(1)}kg
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Actual</p>
                        <p className="text-lg font-bold text-gray-800">{ultimo}kg</p>
                      </div>
                      {client?.peso_meta && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Meta</p>
                          <p className="text-lg font-bold text-green-600">{client.peso_meta}kg</p>
                        </div>
                      )}
                    </div>
                    {/* Mini gráfico de barras */}
                    <div className="flex items-end gap-0.5 h-16 bg-gray-50 rounded-lg p-2">
                      {todosPesos.slice(-20).map((p, i) => {
                        const h = ((p.peso - pesoMin) / range) * 100 || 50;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${p.data}: ${p.peso}kg`}>
                            <div className="w-full bg-green-400 rounded-t-sm" style={{ height: `${Math.max(h, 8)}%` }} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-400 mt-1 px-1">
                      <span>{todosPesos.slice(-20)[0]?.data}</span>
                      <span>{todosPesos[todosPesos.length - 1]?.data}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ===== MEDIDAS CORPORAIS ===== */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Medidas Corporais</h3>
              {medidas.length === 0 ? (
                <p className="text-sm text-gray-500">Sem medidas registadas.</p>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-indigo-600">Cintura</p>
                      <p className="text-xl font-bold text-indigo-700">{medidas[0].cintura_cm || '-'} cm</p>
                      {medidas.length > 1 && medidas[0].cintura_cm && medidas[medidas.length - 1].cintura_cm && (
                        <p className={`text-xs font-medium ${medidas[0].cintura_cm < medidas[medidas.length - 1].cintura_cm ? 'text-green-600' : 'text-gray-400'}`}>
                          {(medidas[0].cintura_cm - medidas[medidas.length - 1].cintura_cm).toFixed(1)}cm vs início
                        </p>
                      )}
                    </div>
                    <div className="bg-pink-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-pink-600">Anca</p>
                      <p className="text-xl font-bold text-pink-700">{medidas[0].anca_cm || '-'} cm</p>
                      {medidas.length > 1 && medidas[0].anca_cm && medidas[medidas.length - 1].anca_cm && (
                        <p className={`text-xs font-medium ${medidas[0].anca_cm < medidas[medidas.length - 1].anca_cm ? 'text-green-600' : 'text-gray-400'}`}>
                          {(medidas[0].anca_cm - medidas[medidas.length - 1].anca_cm).toFixed(1)}cm vs início
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {medidas.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                        <span className="text-gray-600">{m.data}</span>
                        <div className="flex gap-3">
                          <span className="text-indigo-600 text-xs">C: {m.cintura_cm || '-'}cm</span>
                          <span className="text-pink-600 text-xs">A: {m.anca_cm || '-'}cm</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ===== CHECK-INS DETALHADOS ===== */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Check-ins Diários ({registos.length})</h3>
              {registos.length === 0 && checkins.length === 0 ? (
                <p className="text-sm text-gray-500">Sem check-ins.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {registos.map((r, i) => (
                    <div key={`r-${i}`} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-700">{r.data}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.aderencia_1a10 >= 7 ? 'bg-green-100 text-green-700' :
                          r.aderencia_1a10 >= 4 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>Aderência: {r.aderencia_1a10}/10</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {r.peso && <span className="bg-white px-2 py-1 rounded border border-gray-200">Peso: {r.peso}kg</span>}
                        {r.energia_1a5 && <span className="bg-yellow-50 px-2 py-1 rounded border border-yellow-200">Energia: {r.energia_1a5}/5</span>}
                        {r.humor && <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200">Humor: {r.humor}/5</span>}
                        {r.sono && <span className="bg-purple-50 px-2 py-1 rounded border border-purple-200">Sono: {r.sono}/5</span>}
                        {r.seguiu_plano !== undefined && r.seguiu_plano !== null && (
                          <span className={`px-2 py-1 rounded border ${r.seguiu_plano ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {r.seguiu_plano ? 'Seguiu plano' : 'Não seguiu'}
                          </span>
                        )}
                        {r.fez_exercicio !== undefined && r.fez_exercicio !== null && (
                          <span className={`px-2 py-1 rounded border ${r.fez_exercicio ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                            {r.fez_exercicio ? 'Fez exercício' : 'Sem exercício'}
                          </span>
                        )}
                        {r.agua && <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200">Água: {r.agua}L</span>}
                      </div>
                    </div>
                  ))}
                  {checkins.filter(c => !registos.some(r => r.data === c.data)).map((c, i) => (
                    <div key={`c-${i}`} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-700">{c.data}</span>
                        <span className="text-[10px] text-gray-400">Check-in</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {c.peso && <span className="bg-white px-2 py-1 rounded border border-gray-200">Peso: {c.peso}kg</span>}
                        {c.energia && <span className="bg-yellow-50 px-2 py-1 rounded border border-yellow-200">Energia: {c.energia}/5</span>}
                        {c.humor && <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200">Humor: {c.humor}/5</span>}
                        {c.sono && <span className="bg-purple-50 px-2 py-1 rounded border border-purple-200">Sono: {c.sono}/5</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== REFEIÇÕES DETALHADAS ===== */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Refeições Detalhadas ({mealsLogs.length})</h3>
              {mealsLogs.length === 0 ? (
                <p className="text-sm text-gray-500">Sem registos de refeições.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(() => {
                    // Agrupar refeições por data
                    const porDia = {};
                    mealsLogs.forEach(m => {
                      if (!porDia[m.data]) porDia[m.data] = [];
                      porDia[m.data].push(m);
                    });
                    return Object.entries(porDia).map(([data, refeicoes]) => (
                      <div key={data} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-sm text-gray-700 mb-2 border-b border-gray-200 pb-1">{data}</p>
                        <div className="space-y-1.5">
                          {refeicoes.map((m, i) => (
                            <div key={i} className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-700 capitalize">{m.refeicao}</span>
                                  {m.hora && <span className="text-[10px] text-gray-400">{m.hora}</span>}
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    m.seguiu_plano === 'sim' ? 'bg-green-100 text-green-700' :
                                    m.seguiu_plano === 'parcial' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>{m.seguiu_plano}</span>
                                </div>
                                {/* Porções registadas */}
                                {(m.porcoes_proteina || m.porcoes_hidratos || m.porcoes_gordura || m.porcoes_legumes) && (
                                  <div className="flex gap-1.5 mt-1">
                                    {m.porcoes_proteina > 0 && <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">{m.porcoes_proteina} prot</span>}
                                    {m.porcoes_hidratos > 0 && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">{m.porcoes_hidratos} hid</span>}
                                    {m.porcoes_gordura > 0 && <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">{m.porcoes_gordura} gord</span>}
                                    {m.porcoes_legumes > 0 && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{m.porcoes_legumes} leg</span>}
                                  </div>
                                )}
                                {m.notas && (() => {
                                  // Notas pode ser JSON estruturado com items da refeição
                                  try {
                                    const parsed = typeof m.notas === 'string' ? JSON.parse(m.notas) : m.notas;
                                    if (parsed?.items && Array.isArray(parsed.items)) {
                                      return (
                                        <div className="mt-1 space-y-0.5">
                                          {parsed.items.map((item, idx) => (
                                            <p key={idx} className="text-[10px] text-gray-600">
                                              {item.icon || ''} {item.nome} — {item.quantidade_g}g ({item.calorias}kcal)
                                            </p>
                                          ))}
                                          {parsed.macros_total && (
                                            <p className="text-[10px] font-medium text-gray-700 mt-0.5">
                                              Total: {parsed.macros_total.calorias}kcal | P:{parsed.macros_total.proteina}g C:{parsed.macros_total.carboidratos}g G:{parsed.macros_total.gordura}g
                                            </p>
                                          )}
                                        </div>
                                      );
                                    }
                                  } catch { /* não é JSON, mostrar como texto */ }
                                  return <p className="text-[10px] text-gray-500 mt-1 italic">{m.notas}</p>;
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Totais do dia */}
                        {(() => {
                          const totProt = refeicoes.reduce((s, m) => s + (m.porcoes_proteina || 0), 0);
                          const totHid = refeicoes.reduce((s, m) => s + (m.porcoes_hidratos || 0), 0);
                          const totGord = refeicoes.reduce((s, m) => s + (m.porcoes_gordura || 0), 0);
                          const totLeg = refeicoes.reduce((s, m) => s + (m.porcoes_legumes || 0), 0);
                          if (totProt + totHid + totGord + totLeg === 0) return null;
                          // Estimar calorias: prot*25*4 + hid*30*4 + gord*10*9 + leg*50*0.3
                          const calEst = (totProt * 25 * 4) + (totHid * 30 * 4) + (totGord * 10 * 9) + (totLeg * 50 * 0.3);
                          return (
                            <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                              <div className="flex gap-2 text-[10px]">
                                <span className="text-rose-600 font-medium">{totProt} prot</span>
                                <span className="text-amber-600 font-medium">{totHid} hid</span>
                                <span className="text-purple-600 font-medium">{totGord} gord</span>
                                <span className="text-green-600 font-medium">{totLeg} leg</span>
                              </div>
                              <span className="text-[10px] font-bold text-gray-600">~{Math.round(calEst)} kcal est.</span>
                            </div>
                          );
                        })()}
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* ===== ÁGUA ===== */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Água (30 dias)</h3>
              {aguaLogs.length === 0 ? (
                <p className="text-sm text-gray-500">Sem registos.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {Object.entries(
                    aguaLogs.reduce((acc, l) => { acc[l.data] = (acc[l.data] || 0) + l.quantidade_ml; return acc; }, {})
                  ).map(([data, total]) => (
                    <div key={data} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{data}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((total / 2500) * 100, 100)}%` }} />
                        </div>
                        <span className={`font-medium text-xs ${total >= 2000 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {(total / 1000).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* === NOTIFICAÇÕES === */}
        {tab === 'notificacoes' && (
          <NotificacoesTab userId={userId} />
        )}

        {/* === GESTAO === */}
        {tab === 'gestao' && (
          <div className="space-y-4">
            {/* Payment verification alert */}
            {client?.subscription_status === 'pending' && client?.payment_reference && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  Pagamento pendente de verificação
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-yellow-700 text-xs">Método</p>
                    <p className="font-semibold text-gray-900">📱 {client.payment_method || 'M-Pesa'}</p>
                  </div>
                  <div>
                    <p className="text-yellow-700 text-xs">Referência / Código</p>
                    <p className="font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded border border-yellow-200">{client.payment_reference}</p>
                  </div>
                  <div>
                    <p className="text-yellow-700 text-xs">Valor</p>
                    <p className="font-semibold text-green-700 text-lg">
                      {client.payment_amount ? `${Number(client.payment_amount).toLocaleString('pt-MZ')} ${client.payment_currency || 'MZN'}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-yellow-700 text-xs">Plano escolhido</p>
                    <p className="font-semibold text-gray-900">{client.subscription_plan || 'N/A'}</p>
                  </div>
                </div>
                <p className="text-xs text-yellow-700 mb-3">Verifica a transacção no M-Pesa e depois activa:</p>
                <div className="grid grid-cols-3 gap-2">
                  {['MONTHLY', 'SEMESTRAL', 'ANNUAL'].map(key => (
                    <button key={key} onClick={() => handleActivate(key)}
                      className="py-2.5 text-sm font-bold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Activar {SUBSCRIPTION_PLANS[key].name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Subscrição</h3>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div><p className="text-gray-500">Estado</p><p className="font-medium">{STATUS_LABELS_TEXT[client?.subscription_status] || 'N/A'}</p></div>
                <div><p className="text-gray-500">Plano</p><p className="font-medium">{client?.subscription_plan || 'N/A'}</p></div>
                <div><p className="text-gray-500">Expira</p><p className="font-medium">{client?.subscription_expires ? new Date(client.subscription_expires).toLocaleDateString('pt-PT') : 'N/A'}</p></div>
                <div><p className="text-gray-500">Método pagamento</p><p className="font-medium">{client?.payment_method || 'N/A'}</p></div>
                {client?.payment_reference && (
                  <div><p className="text-gray-500">Referência</p><p className="font-mono font-medium text-sm">{client.payment_reference}</p></div>
                )}
                {client?.payment_amount && (
                  <div><p className="text-gray-500">Valor pago</p><p className="font-medium">{Number(client.payment_amount).toLocaleString('pt-MZ')} {client.payment_currency || 'MZN'}</p></div>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">Activar subscrição:</p>
              <div className="grid grid-cols-3 gap-2">
                {['MONTHLY', 'SEMESTRAL', 'ANNUAL'].map(key => (
                  <button key={key} onClick={() => handleActivate(key)}
                    className="py-2 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                    {SUBSCRIPTION_PLANS[key].name} (${SUBSCRIPTION_PLANS[key].price_usd})
                  </button>
                ))}
              </div>
              <button
                onClick={async () => {
                  if (!confirm('Definir como tester?')) return;
                  try { await coachApi.setTester(userId); loadClientData(); } catch (err) { alert('Erro: ' + err.message); }
                }}
                className="w-full mt-2 py-2 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                Definir como tester (acesso gratuito)
              </button>
            </div>

            {/* WhatsApp messages */}
            <div className="bg-white rounded-xl border border-green-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Mensagens WhatsApp
              </h3>
              <div className="space-y-3">
                {/* Boas-vindas */}
                {(() => {
                  const nome = user?.nome?.split(' ')[0] || '';
                  const isMasc = intake?.sexo === 'masculino';
                  const bemVindo = isMasc ? 'Bem-vindo' : 'Bem-vinda';
                  const querido = isMasc ? 'querido' : 'querida';
                  const perfeito = isMasc ? 'perfeito' : 'perfeita';
                  const msgBoasVindas = `Olá ${nome || querido}! 🌿\n\n${bemVindo} ao Vitalis! O teu acesso está activo.\n\nPróximos passos:\n1. Abre a app: app.seteecos.com\n2. Preenche o questionário inicial\n3. Vou criar o teu plano personalizado\n\nQualquer dúvida estou aqui para ti! 💚`;
                  const msgLembrete = `Olá ${nome || querido}! 💚\n\nSó a verificar como estás. Já conseguiste preencher o questionário inicial?\n\nSe tiveres alguma dúvida, diz-me! Estou aqui para te ajudar.\n\napp.seteecos.com/vitalis/intake`;
                  const msgReactivar = `Olá ${nome || querido}! 🌱\n\nSentimos a tua falta no Vitalis!\n\nLembra-te: cada dia é uma nova oportunidade. Não precisas ser ${perfeito}, só precisas de aparecer.\n\nO teu plano está à tua espera: app.seteecos.com\n\nEstou aqui se precisares de conversar. 💚`;

                  const handleCopy = async (msg, id) => {
                    try {
                      await navigator.clipboard.writeText(msg);
                      setCopiedMsg(id);
                      setTimeout(() => setCopiedMsg(null), 2000);
                    } catch {
                      // Fallback para browsers sem clipboard API
                      const ta = document.createElement('textarea');
                      ta.value = msg;
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand('copy');
                      document.body.removeChild(ta);
                      setCopiedMsg(id);
                      setTimeout(() => setCopiedMsg(null), 2000);
                    }
                  };

                  return (
                    <>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-green-700">{isMasc ? 'BEM-VINDO' : 'BEM-VINDA'} (após activar)</span>
                          <button
                            onClick={() => handleCopy(msgBoasVindas, 'bv')}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                              copiedMsg === 'bv'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-200 text-green-800 hover:bg-green-300'
                            }`}
                          >
                            {copiedMsg === 'bv' ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{msgBoasVindas}</p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-700">LEMBRETE INTAKE (se não preencheu)</span>
                          <button
                            onClick={() => handleCopy(msgLembrete, 'fu')}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                              copiedMsg === 'fu'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                            }`}
                          >
                            {copiedMsg === 'fu' ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{msgLembrete}</p>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-amber-700">REACTIVAR (cliente {isMasc ? 'inactivo' : 'inactiva'})</span>
                          <button
                            onClick={() => handleCopy(msgReactivar, 'ra')}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                              copiedMsg === 'ra'
                                ? 'bg-amber-600 text-white'
                                : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                            }`}
                          >
                            {copiedMsg === 'ra' ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{msgReactivar}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Plano nutricional</h3>
              {hasIntake ? (
                <button onClick={handleGerarPlano} disabled={gerandoPlano}
                  className="w-full py-2 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50">
                  {gerandoPlano ? 'A gerar...' : (activePlan ? 'Regenerar plano' : 'Gerar plano')}
                </button>
              ) : (
                <p className="text-sm text-red-500">Intake em falta.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-red-200 p-4">
              <h3 className="font-semibold text-red-600 mb-3">Zona perigosa</h3>
              <button onClick={handleDeleteClient}
                className="w-full py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                Apagar cliente e todos os dados
              </button>
              <p className="text-xs text-red-400 mt-2">Irreversível. Remove todos os dados.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Notificações Tab ──
function NotificacoesTab({ userId }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reenviando, setReenviando] = useState(null);
  const [expandedErro, setExpandedErro] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // todos | erros | enviados

  const loadNotifs = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    coachApi.historicoNotificacoes(userId)
      .then(data => setNotifs(data.notificacoes || []))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);

  const errosCount = notifs.filter(n => n.status === 'erro').length;

  const filteredNotifs = useMemo(() => {
    if (filtro === 'erros') return notifs.filter(n => n.status === 'erro');
    if (filtro === 'enviados') return notifs.filter(n => n.status !== 'erro');
    return notifs;
  }, [notifs, filtro]);

  const handleReenviar = async (notif, index) => {
    setReenviando(index);
    try {
      const result = await coachApi.reenviarNotificacao(userId, notif.canal, notif.tipo);
      if (result.ok) {
        loadNotifs();
      } else {
        alert(`Falhou: ${result.erro || 'Erro desconhecido'}`);
      }
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setReenviando(null);
    }
  };

  const formatData = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const agora = new Date();
    const diffMs = agora - d;
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffMs / 86400000);
    if (diffH < 1) return 'há poucos minutos';
    if (diffH < 24) return `há ${diffH}h`;
    if (diffD < 7) return `há ${diffD}d`;
    return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 text-sm mt-3">A carregar histórico...</p>
      </div>
    );
  }

  if (notifs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <p className="text-gray-400 text-4xl mb-2">📭</p>
        <p className="text-gray-500 text-sm">Nenhuma notificação enviada a este cliente.</p>
        <p className="text-gray-400 text-xs mt-1">Emails e WhatsApp automáticos aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Erros summary — acção imediata */}
      {errosCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-red-800 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /><path d="M12 15.75h.007v.008H12v-.008z" /></svg>
              {errosCount} notificação{errosCount > 1 ? 'ões' : ''} falhada{errosCount > 1 ? 's' : ''}
            </h4>
            <button
              onClick={() => setFiltro(filtro === 'erros' ? 'todos' : 'erros')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtro === 'erros' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
            >
              {filtro === 'erros' ? 'Ver todas' : 'Ver erros'}
            </button>
          </div>
          <p className="text-xs text-red-600">
            Podes reenviar cada uma individualmente com o botão "Reenviar".
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <span>📬</span> Histórico ({filteredNotifs.length}{filtro !== 'todos' ? ` de ${notifs.length}` : ''})
        </h3>
        <button onClick={loadNotifs} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="Actualizar">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
        </button>
      </div>

      {/* Notification list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
          {filteredNotifs.map((n, i) => {
            const isErro = n.status === 'erro';
            const isExpanded = expandedErro === i;
            return (
              <div key={i} className={`transition-colors ${isErro ? 'bg-red-50/40' : ''}`}>
                <div className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      isErro ? 'bg-red-100' : n.canal === 'whatsapp' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {isErro ? '❌' : n.canal === 'whatsapp' ? '💬' : '📧'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-800 truncate font-medium">{n.label}</span>
                        {isErro && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 flex-shrink-0">FALHOU</span>
                        )}
                      </div>
                      {isErro && n.erro && (
                        <button
                          onClick={() => setExpandedErro(isExpanded ? null : i)}
                          className="text-[11px] text-red-500 hover:text-red-700 mt-0.5 flex items-center gap-1"
                        >
                          <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                          Ver detalhe do erro
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {isErro && (
                      <button
                        onClick={() => handleReenviar(n, i)}
                        disabled={reenviando === i}
                        className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center gap-1"
                      >
                        {reenviando === i ? (
                          <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> A reenviar...</>
                        ) : (
                          <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg> Reenviar</>
                        )}
                      </button>
                    )}
                    <span className="text-[11px] text-gray-400 font-medium tabular-nums">{formatData(n.data)}</span>
                  </div>
                </div>
                {/* Error detail expandable */}
                {isErro && isExpanded && n.erro && (
                  <div className="px-4 pb-3">
                    <div className="bg-red-100/60 border border-red-200 rounded-lg p-3 text-xs text-red-700 font-mono break-all">
                      {n.erro}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper components
const STATUS_LABELS_TEXT = {
  tester: 'Tester', trial: 'Trial', active: 'Activo',
  pending: 'Pendente', expired: 'Expirado', cancelled: 'Cancelado',
};

function StatusBadge({ status }) {
  const colors = {
    tester: 'bg-purple-100 text-purple-700', trial: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
      {STATUS_LABELS_TEXT[status] || status || 'N/A'}
    </span>
  );
}

function PlanStatusBadge({ status }) {
  if (status === 'activo') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Activo</span>;
  if (status === 'erro') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Erro</span>;
  if (status === 'inactivo') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactivo</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{status || 'N/A'}</span>;
}

function InfoCard({ label, value, color = 'gray' }) {
  const colors = { green: 'bg-green-50 text-green-700', red: 'bg-red-50 text-red-700', amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-700', gray: 'bg-gray-50 text-gray-700' };
  return (
    <div className={`rounded-xl p-3 ${colors[color]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}

function IntakeField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '-'}</p>
    </div>
  );
}
