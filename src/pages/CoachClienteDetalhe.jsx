import React, { useState, useEffect } from 'react';
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
  melhorar_saude: 'Melhorar saude',
  controlar_emocoes: 'Controlar emocoes'
};

const FASE_LABELS = {
  inducao: 'Inducao',
  transicao: 'Transicao',
  recomposicao: 'Recomposicao',
  manutencao: 'Manutencao'
};

// ==========================================
// HAND METHOD CONFIG (same as PlanoAlimentar)
// ==========================================
const HAND_CONFIG = {
  proteina: {
    gesto: '\u{1FAF2}', nome: 'Proteina', medida: 'palma', medidaPlural: 'palmas',
    cor: 'from-rose-50 to-red-50', corTexto: 'text-rose-700', corBorda: 'border-rose-200',
    explicacao: 'Tamanho e espessura da palma (sem dedos) \u2248 100g',
    equivalencias: [
      { icon: '\u{1F357}', texto: '1 peito de frango (~100g)' },
      { icon: '\u{1F41F}', texto: '1 lata de atum escorrida' },
      { icon: '\u{1F95A}', texto: '2-3 ovos inteiros' },
      { icon: '\u{1F969}', texto: '1 bife medio (~100g)' },
      { icon: '\u{1F990}', texto: '6-8 camaroes ou 1 posta de peixe' },
      { icon: '\u{1F95B}', texto: '\u00BD palma = 1 iogurte grego' },
    ]
  },
  legumes: {
    gesto: '\u270A', nome: 'Legumes', medida: 'punho', medidaPlural: 'punhos',
    cor: 'from-green-50 to-emerald-50', corTexto: 'text-green-700', corBorda: 'border-green-200',
    explicacao: 'Tamanho do punho fechado \u2248 150g de legumes cozidos',
    equivalencias: [
      { icon: '\u{1F957}', texto: '2 maos cheias de salada crua' },
      { icon: '\u{1F966}', texto: '1 chavena de brocolos' },
      { icon: '\u{1F96C}', texto: '1 chavena de espinafres/couve' },
      { icon: '\u{1F345}', texto: '1 tomate medio + pepino' },
      { icon: '\u{1F955}', texto: '1 cenoura grande' },
      { icon: '\u{1F344}', texto: '1 chavena de cogumelos' },
    ]
  },
  hidratos: {
    gesto: '\u{1F932}', nome: 'Hidratos', medida: 'mao concha', medidaPlural: 'maos concha',
    cor: 'from-amber-50 to-orange-50', corTexto: 'text-amber-700', corBorda: 'border-amber-200',
    explicacao: 'O que cabe na mao em concha \u2248 30g de hidratos',
    equivalencias: [
      { icon: '\u{1F35A}', texto: '3 col. sopa de arroz cozido' },
      { icon: '\u{1F954}', texto: '1 batata pequena ou \u00BD batata doce' },
      { icon: '\u{1F35D}', texto: '\u00BD chavena de massa cozida' },
      { icon: '\u{1F35E}', texto: '1 fatia de pao' },
      { icon: '\u{1F34E}', texto: '1 fruta media (maca, banana, laranja)' },
      { icon: '\u{1FAD0}', texto: '\u00BD chavena de mandioca cozida' },
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

const FASES_DICAS = {
  inducao: {
    nome: 'Fase 1: Inducao', duracao: '3-4 semanas',
    descricao: 'Fase de arranque. Foco em proteina, gorduras saudaveis e vegetais.',
    priorizar: ['Proteina em todas as refeicoes', 'Vegetais verdes em abundancia (4+ punhos/dia)', 'Gorduras saudaveis (azeite, abacate, nozes)', 'Agua minimo 2.5L/dia', 'Sono 7-9 horas', 'Electrolitos (sal marinho, magnesio)'],
    evitar: ['Acucar e adocantes', 'Graos e cereais (pao, massa, arroz)', 'Frutas doces (banana, manga, uvas)', 'Leguminosas (feijao, grao)', 'Alcool', 'Alimentos processados'],
    dicas: ['Prepara refeicoes ao domingo', 'Tem snacks keto a mao (ovos cozidos, queijo, nozes)', 'Podes sentir "keto flu" dias 2-4 \u2014 e temporario', 'Adiciona 1 colher de sal na agua 2x/dia', 'Pesa-te as sextas em jejum']
  },
  transicao: {
    nome: 'Fase 2: Transicao', duracao: '4-6 semanas',
    descricao: 'Reintroducao gradual de hidratos complexos mantendo perda de gordura.',
    priorizar: ['Manter proteina elevada', 'Hidratos complexos pos-treino (batata-doce, arroz integral)', 'Fruta de baixo indice glicemico', 'Leguminosas em moderacao', 'Agua minimo 2L/dia'],
    evitar: ['Acucar refinado', 'Farinhas brancas e pao branco', 'Ultra-processados', 'Bebidas acucaradas', 'Refeicoes sem proteina'],
    dicas: ['Introduz UM hidrato novo por semana', 'Observa como o corpo reage nas 48h', 'Mantem o diario alimentar', 'Hidratos funcionam melhor perto do treino']
  },
  recomposicao: {
    nome: 'Fase 3: Recomposicao', duracao: '6-8 semanas',
    descricao: 'Ganho de massa muscular com manutencao de gordura baixa.',
    priorizar: ['Proteina alta (2g/kg)', 'Hidratos em volta do treino', 'Treino de forca 3-4x/semana', 'Sono reparador'],
    evitar: ['Deficit calorico excessivo', 'Cardio em excesso', 'Saltar refeicoes pos-treino'],
    dicas: ['Come mais nos dias de treino', 'Menos hidratos nos dias de descanso', 'Prioriza alimentos inteiros']
  },
  manutencao: {
    nome: 'Fase 4: Manutencao', duracao: 'Continua',
    descricao: 'Manutencao dos resultados com habitos sustentaveis.',
    priorizar: ['Manter proteina elevada', 'Variedade alimentar', 'Rotina de refeicoes consistente', 'Movimento regular'],
    evitar: ['Voltar aos velhos padroes', 'Dietas extremas', 'Saltar refeicoes'],
    dicas: ['1-2 refeicoes livres por semana', 'Celebra vitorias nao-balanca', 'O processo e individual']
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
    if (!confirm(`APAGAR "${nome}" e TODOS os seus dados?\n\nIsto e irreversivel!`)) return;
    if (!confirm('Ultima chance. Confirmas?')) return;
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
          <p className="text-gray-500">Cliente nao encontrado.</p>
          <Link to="/coach" className="text-blue-600 text-sm mt-2 block">Voltar</Link>
        </div>
      </div>
    );
  }

  const faseDicas = FASES_DICAS[activePlan?.fase] || null;

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
            { key: 'gestao', label: 'Gestao' },
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
              <InfoCard label="Subscricao" value={STATUS_LABELS_TEXT[client?.subscription_status] || 'N/A'} />
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
              </div>
            )}

            {/* Error plan alert */}
            {errorPlan && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">&#x26A0;&#xFE0F;</span>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-semibold mb-1">Erro na geracao do plano</p>
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
                      <span className="text-gray-600">Agua (ultimo)</span>
                      <span className="text-gray-400">{aguaLogs[0].data}</span>
                      <span className="font-medium text-blue-600">{aguaLogs[0].quantidade_ml}ml</span>
                    </div>
                  )}
                  {mealsLogs.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Refeicao (ultimo)</span>
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
                      <p className="text-xs text-gray-500">Refeicoes</p>
                    </div>
                  </div>
                  {horarios.length > 0 && (
                    <p className="text-center text-sm text-gray-500 mt-2">Horarios: {horarios.join(' | ')}</p>
                  )}
                </div>

                {/* Hand method hero */}
                <div className="bg-gradient-to-br from-[#7C8B6F] to-[#5A6B4D] rounded-xl p-4 text-white">
                  <h3 className="font-bold mb-2">Metodo da Mao — Porcoes diarias</h3>
                  <p className="text-white/70 text-sm mb-3">Sem balanca, proporcional ao corpo {intake?.sexo === 'masculino' ? 'do cliente' : 'da cliente'}</p>
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
                      <div className="text-[10px] text-white/70">maos</div>
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
                  <h3 className="font-semibold text-gray-900">O que conta como 1 porcao</h3>
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
                        <p className="text-xs text-gray-500">Inicio</p>
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
                        Ja perdeu {(client.peso_inicial - client.peso_actual).toFixed(1)} kg
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
                        <p className="font-semibold text-gray-800">Refeicao livre</p>
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
                    <h3 className="font-semibold text-gray-900 mb-3">Historico de planos ({plano.length})</h3>
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
                <p className="text-gray-500">Intake nao preenchido.</p>
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
                  <IntakeField label="Nivel actividade" value={intake.nivel_actividade} />
                  <IntakeField label="Abordagem" value={ABORDAGEM_LABELS[intake.abordagem_preferida] || intake.abordagem_preferida} />
                  <IntakeField label="Jejum" value={intake.aceita_jejum ? 'Sim' : 'Nao'} />
                  <IntakeField label="Refeicoes/dia" value={intake.num_refeicoes_dia} />
                  <IntakeField label="Pequeno almoco" value={intake.pequeno_almoco} />
                  <IntakeField label="Emocao dominante" value={intake.emocao_dominante} />
                  <IntakeField label="Prontidao (1-10)" value={intake.prontidao_1a10} />
                </div>
                {intake.restricoes_alimentares && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-1">Restricoes alimentares:</p>
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
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Check-ins ({registos.length})</h3>
              {registos.length === 0 ? (
                <p className="text-sm text-gray-500">Sem check-ins.</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {registos.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{r.data}</span>
                      <div className="flex items-center gap-2">
                        {r.peso && <span className="text-xs text-gray-400">{r.peso}kg</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.aderencia_1a10 >= 7 ? 'bg-green-100 text-green-700' :
                          r.aderencia_1a10 >= 4 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{r.aderencia_1a10}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Agua (30 dias)</h3>
              {aguaLogs.length === 0 ? (
                <p className="text-sm text-gray-500">Sem registos.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {Object.entries(
                    aguaLogs.reduce((acc, l) => { acc[l.data] = (acc[l.data] || 0) + l.quantidade_ml; return acc; }, {})
                  ).map(([data, total]) => (
                    <div key={data} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{data}</span>
                      <span className={`font-medium ${total >= 2000 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {(total / 1000).toFixed(1)}L
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Refeicoes (30 dias)</h3>
              {mealsLogs.length === 0 ? (
                <p className="text-sm text-gray-500">Sem registos.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {mealsLogs.slice(0, 20).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-600">{m.data} - {m.refeicao}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.seguiu_plano === 'sim' ? 'bg-green-100 text-green-700' :
                        m.seguiu_plano === 'parcial' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{m.seguiu_plano}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* === GESTAO === */}
        {tab === 'gestao' && (
          <div className="space-y-4">
            {/* Payment verification alert */}
            {client?.subscription_status === 'pending' && client?.payment_reference && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  Pagamento pendente de verificacao
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-yellow-700 text-xs">Metodo</p>
                    <p className="font-semibold text-gray-900">📱 {client.payment_method || 'M-Pesa'}</p>
                  </div>
                  <div>
                    <p className="text-yellow-700 text-xs">Referencia / Codigo</p>
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
                <p className="text-xs text-yellow-700 mb-3">Verifica a transaccao no M-Pesa e depois activa:</p>
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
              <h3 className="font-semibold text-gray-900 mb-3">Subscricao</h3>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div><p className="text-gray-500">Estado</p><p className="font-medium">{STATUS_LABELS_TEXT[client?.subscription_status] || 'N/A'}</p></div>
                <div><p className="text-gray-500">Plano</p><p className="font-medium">{client?.subscription_plan || 'N/A'}</p></div>
                <div><p className="text-gray-500">Expira</p><p className="font-medium">{client?.subscription_expires ? new Date(client.subscription_expires).toLocaleDateString('pt-PT') : 'N/A'}</p></div>
                <div><p className="text-gray-500">Metodo pagamento</p><p className="font-medium">{client?.payment_method || 'N/A'}</p></div>
                {client?.payment_reference && (
                  <div><p className="text-gray-500">Referencia</p><p className="font-mono font-medium text-sm">{client.payment_reference}</p></div>
                )}
                {client?.payment_amount && (
                  <div><p className="text-gray-500">Valor pago</p><p className="font-medium">{Number(client.payment_amount).toLocaleString('pt-MZ')} {client.payment_currency || 'MZN'}</p></div>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">Activar subscricao:</p>
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
                  const msgBoasVindas = `Ola ${nome || querido}! 🌿\n\n${bemVindo} ao Vitalis! O teu acesso esta activo.\n\nProximos passos:\n1. Abre a app: app.seteecos.com\n2. Preenche o questionario inicial\n3. Vou criar o teu plano personalizado\n\nQualquer duvida estou aqui para ti! 💚`;
                  const msgLembrete = `Ola ${nome || querido}! 💚\n\nSo a verificar como estas. Ja conseguiste preencher o questionario inicial?\n\nSe tiveres alguma duvida, diz-me! Estou aqui para te ajudar.\n\napp.seteecos.com/vitalis/intake`;
                  const msgReactivar = `Ola ${nome || querido}! 🌱\n\nSentimos a tua falta no Vitalis!\n\nLembra-te: cada dia e uma nova oportunidade. Nao precisas ser ${perfeito}, so precisas de aparecer.\n\nO teu plano esta a tua espera: app.seteecos.com\n\nEstou aqui se precisares de conversar. 💚`;

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
                          <span className="text-xs font-semibold text-green-700">{isMasc ? 'BEM-VINDO' : 'BEM-VINDA'} (apos activar)</span>
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
                          <span className="text-xs font-semibold text-blue-700">FOLLOW-UP (se nao fez intake)</span>
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
              <p className="text-xs text-red-400 mt-2">Irreversivel. Remove todos os dados.</p>
            </div>
          </div>
        )}
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
