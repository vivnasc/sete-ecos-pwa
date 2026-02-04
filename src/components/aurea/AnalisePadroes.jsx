import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * ÁUREA - Análise de Padrões
 * Detecta padrões de auto-abandono e culpa
 * Mostra evolução ao longo do tempo
 */

const PADROES = {
  culpa_pratica: {
    id: 'culpa_pratica',
    nome: 'Padrão de Culpa',
    icone: '😔',
    descricao: 'Sentes culpa quando cuidas de ti',
    mensagem_alta: 'Tens sentido muita culpa nas práticas. Isso é normal no início. Cada "sim" a ti mesma enfraquece essa voz.',
    mensagem_media: 'A culpa ainda aparece às vezes. Nota quando surge - o que a dispara?',
    mensagem_baixa: 'A culpa tem diminuído! Estás a dar-te permissão de existir.',
    cor: '#EF4444'
  },
  auto_abandono: {
    id: 'auto_abandono',
    nome: 'Auto-Abandono',
    icone: '🫥',
    descricao: 'Não respeitas a tua quota de presença',
    mensagem_alta: 'Tens deixado a tua quota de lado. O que te impede de reservar tempo/dinheiro/energia para ti?',
    mensagem_media: 'Às vezes cumpres a quota, às vezes não. O que diferencia os dias bons dos outros?',
    mensagem_baixa: 'Estás a respeitar a tua quota! A presença para ti mesma está a tornar-se hábito.',
    cor: '#8B5CF6'
  },
  roupa_escondida: {
    id: 'roupa_escondida',
    nome: 'Roupa Escondida',
    icone: '👗',
    descricao: 'Guardas peças bonitas "para ocasiões"',
    mensagem_alta: 'Tens muitas peças guardadas. A tua vida diária É a ocasião. Usa uma peça especial esta semana.',
    mensagem_media: 'Algumas peças ainda estão guardadas. O que precisas para as usar?',
    mensagem_baixa: 'Estás a usar as tuas peças bonitas! O armário está ao teu serviço.',
    cor: '#EC4899'
  },
  dinheiro_outros: {
    id: 'dinheiro_outros',
    nome: 'Dinheiro para Outros',
    icone: '💰',
    descricao: 'Gastas mais nos outros do que em ti',
    mensagem_alta: 'Grande parte do teu dinheiro vai para outros. Quanto % seria justo ires para ti?',
    mensagem_media: 'Estás a equilibrar, mas ainda há espaço para investir mais em ti.',
    mensagem_baixa: 'O teu dinheiro reflete o teu valor! Estás a tratar-te como prioridade.',
    cor: '#F59E0B'
  },
  justificacao: {
    id: 'justificacao',
    nome: 'Padrão de Justificação',
    icone: '📝',
    descricao: 'Sentes necessidade de justificar quando cuidas de ti',
    mensagem_alta: 'Notas que justificas muito o que fazes por ti. Não precisas de permissão de ninguém.',
    mensagem_media: 'Às vezes ainda justificas. Tenta uma vez não explicar porquê.',
    mensagem_baixa: 'Já não precisas de justificar! O teu bem-estar fala por si.',
    cor: '#06B6D4'
  }
};

const PERIODOS = [
  { id: 'semana', label: 'Esta Semana', dias: 7 },
  { id: 'mes', label: 'Este Mês', dias: 30 },
  { id: 'trimestre', label: '3 Meses', dias: 90 }
];

export default function AnalisePadroes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [periodo, setPeriodo] = useState('mes');
  const [analise, setAnalise] = useState({
    padroes: {},
    evolucao: [],
    insights: [],
    pontuacaoGeral: 0
  });

  useEffect(() => {
    loadData();
  }, [periodo]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/aurea/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userData) {
        setUserId(userData.id);
        await analisarPadroes(userData.id);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDataInicio = () => {
    const periodoInfo = PERIODOS.find(p => p.id === periodo);
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - periodoInfo.dias);
    return dataInicio.toISOString();
  };

  const analisarPadroes = async (uid) => {
    const dataInicio = getDataInicio();
    const padroes = {};
    const insights = [];

    // 1. Analisar padrão de culpa (das práticas)
    const { data: praticasLog } = await supabase
      .from('aurea_praticas_log')
      .select('nivel_culpa')
      .eq('user_id', uid)
      .gte('created_at', dataInicio);

    if (praticasLog && praticasLog.length > 0) {
      const totalPraticas = praticasLog.length;
      const comCulpa = praticasLog.filter(p => p.nivel_culpa && p.nivel_culpa !== 'sem').length;
      const percentagemCulpa = (comCulpa / totalPraticas) * 100;

      padroes.culpa_pratica = {
        ...PADROES.culpa_pratica,
        valor: percentagemCulpa,
        nivel: percentagemCulpa > 50 ? 'alto' : percentagemCulpa > 20 ? 'medio' : 'baixo',
        dados: { total: totalPraticas, comCulpa }
      };

      if (percentagemCulpa > 50) {
        insights.push({
          tipo: 'alerta',
          texto: 'A culpa aparece em mais de metade das tuas práticas. Isso é comum no início, mas merece atenção.'
        });
      }
    }

    // 2. Analisar auto-abandono (quota check-ins)
    const { data: quotaLog } = await supabase
      .from('aurea_checkins_quota')
      .select('resposta')
      .eq('user_id', uid)
      .gte('created_at', dataInicio);

    if (quotaLog && quotaLog.length > 0) {
      const totalDias = quotaLog.length;
      const diasNaoCumpridos = quotaLog.filter(q => q.resposta === 'nao').length;
      const percentagemAbandono = (diasNaoCumpridos / totalDias) * 100;

      padroes.auto_abandono = {
        ...PADROES.auto_abandono,
        valor: percentagemAbandono,
        nivel: percentagemAbandono > 50 ? 'alto' : percentagemAbandono > 20 ? 'medio' : 'baixo',
        dados: { total: totalDias, naoCumpridos: diasNaoCumpridos }
      };

      const diasCumpridos = quotaLog.filter(q => q.resposta === 'sim').length;
      if (diasCumpridos >= 7) {
        insights.push({
          tipo: 'celebracao',
          texto: `Já respeitaste a tua quota ${diasCumpridos} dias! Isso é presença real.`
        });
      }
    }

    // 3. Analisar padrão de roupa
    const { data: roupaLog } = await supabase
      .from('aurea_roupa_checkins')
      .select('tem_pecas_guardadas, usou_peca_guardada, modo_dominante')
      .eq('user_id', uid)
      .gte('created_at', dataInicio);

    if (roupaLog && roupaLog.length > 0) {
      const comPecasGuardadas = roupaLog.filter(r => r.tem_pecas_guardadas === 'muitas').length;
      const usouPecaGuardada = roupaLog.filter(r => r.usou_peca_guardada).length;
      const percentagemEscondida = comPecasGuardadas > 0 && usouPecaGuardada < comPecasGuardadas
        ? ((comPecasGuardadas - usouPecaGuardada) / roupaLog.length) * 100
        : 0;

      padroes.roupa_escondida = {
        ...PADROES.roupa_escondida,
        valor: percentagemEscondida,
        nivel: percentagemEscondida > 50 ? 'alto' : percentagemEscondida > 20 ? 'medio' : 'baixo',
        dados: { semanas: roupaLog.length, usouEspecial: usouPecaGuardada }
      };

      if (usouPecaGuardada > 0) {
        insights.push({
          tipo: 'celebracao',
          texto: `Usaste peças "guardadas" ${usouPecaGuardada} vezes! Estás a dar-lhes vida.`
        });
      }
    }

    // 4. Analisar padrão de dinheiro
    const { data: carteiraLog } = await supabase
      .from('aurea_carteira_entries')
      .select('para_quem, valor')
      .eq('user_id', uid)
      .gte('created_at', dataInicio);

    if (carteiraLog && carteiraLog.length > 0) {
      const gastoTotal = carteiraLog.reduce((acc, e) => acc + (e.valor || 0), 0);
      const gastoComigo = carteiraLog
        .filter(e => e.para_quem === 'eu')
        .reduce((acc, e) => acc + (e.valor || 0), 0);
      const percentagemParaMim = gastoTotal > 0 ? (gastoComigo / gastoTotal) * 100 : 0;
      const percentagemOutros = 100 - percentagemParaMim;

      padroes.dinheiro_outros = {
        ...PADROES.dinheiro_outros,
        valor: percentagemOutros,
        nivel: percentagemOutros > 80 ? 'alto' : percentagemOutros > 60 ? 'medio' : 'baixo',
        dados: { paraMim: gastoComigo, total: gastoTotal, percentagemMim: percentagemParaMim.toFixed(0) }
      };

      if (percentagemParaMim >= 20) {
        insights.push({
          tipo: 'celebracao',
          texto: `${percentagemParaMim.toFixed(0)}% dos teus gastos são contigo! Estás a investir em ti.`
        });
      }
    }

    // 5. Analisar padrão de justificação (chat themes)
    const { data: chatThemes } = await supabase
      .from('aurea_chat_themes')
      .select('themes')
      .eq('user_id', uid)
      .gte('created_at', dataInicio);

    if (chatThemes && chatThemes.length > 0) {
      const temasCulpa = chatThemes.filter(c =>
        c.themes?.includes('culpa') || c.themes?.includes('merecimento')
      ).length;
      const percentagemJustificacao = (temasCulpa / chatThemes.length) * 100;

      padroes.justificacao = {
        ...PADROES.justificacao,
        valor: percentagemJustificacao,
        nivel: percentagemJustificacao > 50 ? 'alto' : percentagemJustificacao > 20 ? 'medio' : 'baixo',
        dados: { conversas: chatThemes.length, comCulpa: temasCulpa }
      };
    }

    // Calcular pontuação geral
    const padroesArray = Object.values(padroes);
    const pontuacaoGeral = padroesArray.length > 0
      ? 100 - (padroesArray.reduce((acc, p) => acc + p.valor, 0) / padroesArray.length)
      : 50;

    setAnalise({
      padroes,
      insights,
      pontuacaoGeral: Math.round(pontuacaoGeral)
    });
  };

  const getNivelCor = (nivel) => {
    switch (nivel) {
      case 'alto': return 'text-red-400';
      case 'medio': return 'text-yellow-400';
      case 'baixo': return 'text-green-400';
      default: return 'text-amber-200';
    }
  };

  const getMensagem = (padrao) => {
    if (!padrao) return '';
    switch (padrao.nivel) {
      case 'alto': return padrao.mensagem_alta;
      case 'medio': return padrao.mensagem_media;
      case 'baixo': return padrao.mensagem_baixa;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/aurea/dashboard" className="text-amber-200/60 hover:text-amber-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-amber-100">Análise de Padrões</h1>
            <p className="text-amber-200/60 text-sm">Onde te abandonas?</p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* Período selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {PERIODOS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                periodo === p.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/10 text-amber-200 hover:bg-white/20'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Pontuação Geral */}
        <div className="p-6 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl border border-amber-500/30 text-center">
          <p className="text-amber-200/60 text-sm mb-2">Índice de Auto-Cuidado</p>
          <div className="text-5xl font-bold text-amber-100 mb-2">
            {analise.pontuacaoGeral}%
          </div>
          <p className="text-amber-200/70 text-sm">
            {analise.pontuacaoGeral >= 70 ? 'Estás a priorizar-te!' :
             analise.pontuacaoGeral >= 40 ? 'A caminho de te tratares melhor' :
             'Há espaço para te cuidares mais'}
          </p>
        </div>

        {/* Insights */}
        {analise.insights.length > 0 && (
          <div className="space-y-2">
            {analise.insights.map((insight, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  insight.tipo === 'celebracao'
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <p className={insight.tipo === 'celebracao' ? 'text-green-300' : 'text-amber-200'}>
                  {insight.tipo === 'celebracao' ? '🎉 ' : '💡 '}{insight.texto}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Padrões Detectados */}
        <div className="space-y-3">
          <h2 className="text-amber-100 font-bold">Padrões Detectados</h2>

          {Object.keys(analise.padroes).length === 0 ? (
            <div className="p-6 bg-white/5 rounded-2xl border border-amber-500/20 text-center">
              <p className="text-amber-200/60">
                Ainda não há dados suficientes para análise.
              </p>
              <p className="text-amber-200/40 text-sm mt-2">
                Continua a usar ÁUREA para ver os teus padrões.
              </p>
            </div>
          ) : (
            Object.values(analise.padroes).map(padrao => (
              <div
                key={padrao.id}
                className="p-4 bg-white/5 rounded-2xl border border-amber-500/20"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: padrao.cor + '20' }}
                  >
                    {padrao.icone}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-amber-100 font-medium">{padrao.nome}</h3>
                      <span className={`text-sm font-medium ${getNivelCor(padrao.nivel)}`}>
                        {padrao.nivel === 'alto' ? 'Alto' : padrao.nivel === 'medio' ? 'Médio' : 'Baixo'}
                      </span>
                    </div>
                    <p className="text-amber-200/60 text-sm mt-1">{getMensagem(padrao)}</p>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${100 - padrao.valor}%`,
                            backgroundColor: padrao.valor > 50 ? '#EF4444' : padrao.valor > 20 ? '#F59E0B' : '#22C55E'
                          }}
                        />
                      </div>
                      <p className="text-amber-200/40 text-xs mt-1">
                        {padrao.valor > 50 ? 'Precisa atenção' : padrao.valor > 20 ? 'Em progresso' : 'Saudável'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dica */}
        <div className="p-4 bg-white/5 rounded-2xl border border-amber-500/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-amber-100 font-medium">Como usar esta análise</p>
              <p className="text-amber-200/60 text-sm mt-1">
                Os padrões não são falhas — são padrões aprendidos que podes mudar.
                Escolhe um padrão para trabalhar esta semana nas tuas práticas.
              </p>
            </div>
          </div>
        </div>

        {/* Acções Rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/aurea/chat"
            className="p-4 bg-white/5 rounded-2xl border border-amber-500/20 text-center hover:border-amber-500/40 transition-colors"
          >
            <span className="text-2xl">💬</span>
            <p className="text-amber-100 text-sm mt-2">Falar sobre padrões</p>
          </Link>
          <Link
            to="/aurea/praticas"
            className="p-4 bg-white/5 rounded-2xl border border-amber-500/20 text-center hover:border-amber-500/40 transition-colors"
          >
            <span className="text-2xl">✨</span>
            <p className="text-amber-100 text-sm mt-2">Práticas para hoje</p>
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D2A24]/95 backdrop-blur-sm border-t border-amber-500/20 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link to="/aurea/dashboard" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/aurea/praticas" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💎</span>
            <span className="text-xs mt-1">Práticas</span>
          </Link>
          <Link to="/aurea/padroes" className="flex flex-col items-center text-amber-400">
            <span className="text-xl">🔍</span>
            <span className="text-xs mt-1">Padrões</span>
          </Link>
          <Link to="/aurea/chat" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">💬</span>
            <span className="text-xs mt-1">Chat</span>
          </Link>
          <Link to="/aurea/perfil" className="flex flex-col items-center text-amber-200/60 hover:text-amber-300">
            <span className="text-xl">⚙️</span>
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
