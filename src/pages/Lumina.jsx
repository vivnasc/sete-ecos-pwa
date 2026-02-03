// ============================================================
// LUMINA v15 - Componente React CORRIGIDO
// Sete Ecos © Vivianne dos Santos
// ============================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  detectarPadrao,
  obterLeitura,
  obterRecomendacaoEco,
  analisarPadroesSemanais,
  obterInsightsSemanais,
  analisarPadroesPeriodo,
  CICLO_ECO_MAP,
  obterInsightsPersonalizados,
  obterRecomendacaoCicloEco,
  analisarTendenciasMensais
} from '../lib/lumina-leituras';
import './Lumina.css';

// ============================================================
// CONSTANTES - 7 PERGUNTAS NA ORDEM CORRECTA
// ============================================================
const PERGUNTAS = [
  {
    id: 'corpo',
    eco: 1,
    titulo: 'Corpo',
    inicial: 'C',
    explicacao: 'Como sentes o teu corpo físico agora?',
    opcoes: [
      { valor: 'pesado', posicao: 'negativo' },
      { valor: 'tenso', posicao: 'negativo' },
      { valor: 'normal', posicao: 'neutro' },
      { valor: 'solto', posicao: 'positivo' },
      { valor: 'leve', posicao: 'positivo' }
    ]
  },
  {
    id: 'passado',
    eco: 2,
    titulo: 'Passado',
    inicial: 'P',
    explicacao: 'O ontem está a pesar ou está no seu lugar?',
    opcoes: [
      { valor: 'preso', posicao: 'negativo' },
      { valor: 'apesar', posicao: 'negativo' },
      { valor: 'normal', posicao: 'neutro' },
      { valor: 'arrumado', posicao: 'positivo' },
      { valor: 'leve', posicao: 'positivo' }
    ]
  },
  {
    id: 'impulso',
    eco: 3,
    titulo: 'Impulso',
    inicial: 'I',
    explicacao: 'O que te puxa agora?',
    opcoes: [
      { valor: 'esconder', posicao: 'negativo' },
      { valor: 'parar', posicao: 'negativo' },
      { valor: 'nada', posicao: 'neutro' },
      { valor: 'decidir', posicao: 'positivo' },
      { valor: 'agir', posicao: 'positivo' }
    ]
  },
  {
    id: 'futuro',
    eco: 4,
    titulo: 'Futuro',
    inicial: 'F',
    explicacao: 'Como sentes o que vem aí?',
    opcoes: [
      { valor: 'escuro', posicao: 'negativo' },
      { valor: 'pesado', posicao: 'negativo' },
      { valor: 'normal', posicao: 'neutro' },
      { valor: 'claro', posicao: 'positivo' },
      { valor: 'luminoso', posicao: 'positivo' }
    ]
  },
  {
    id: 'mente',
    eco: 5,
    titulo: 'Mente',
    inicial: 'M',
    explicacao: 'O que se passa na tua cabeça?',
    opcoes: [
      { valor: 'caotica', posicao: 'negativo' },
      { valor: 'barulhenta', posicao: 'negativo' },
      { valor: 'normal', posicao: 'neutro' },
      { valor: 'calma', posicao: 'positivo' },
      { valor: 'silenciosa', posicao: 'positivo' }
    ]
  },
  {
    id: 'energia',
    eco: 6,
    titulo: 'Energia',
    inicial: 'E',
    explicacao: 'Quanta força tens disponível agora?',
    opcoes: [
      { valor: 'vazia', posicao: 'negativo' },
      { valor: 'baixa', posicao: 'negativo' },
      { valor: 'normal', posicao: 'neutro' },
      { valor: 'boa', posicao: 'positivo' },
      { valor: 'cheia', posicao: 'positivo' }
    ]
  },
  {
    id: 'espelho',
    eco: 7,
    titulo: 'Espelho',
    inicial: 'E',
    explicacao: 'Quando te olhas, o que encontras?',
    opcoes: [
      { valor: 'invisivel', posicao: 'negativo' },
      { valor: 'apagada', posicao: 'negativo' },
      { valor: 'normal', posicao: 'neutro' },
      { valor: 'visivel', posicao: 'positivo' },
      { valor: 'luminosa', posicao: 'positivo' }
    ]
  }
];



// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Lumina() {
  // Estados do fluxo
  const [screen, setScreen] = useState('splash');
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // Estados do utilizador
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados das respostas
  const [respostas, setRespostas] = useState({
    corpo: null,
    passado: null,
    impulso: null,
    futuro: null,
    mente: null,
    energia: null,
    espelho: null
  });
  
  // Estados da leitura
  const [padrao, setPadrao] = useState(null);
  const [leitura, setLeitura] = useState('');
  const [ecoRecomendado, setEcoRecomendado] = useState(null);
  const [padraoSemanal, setPadraoSemanal] = useState(null);
  const [insightsPersonalizados, setInsightsPersonalizados] = useState(null);
  const [recomendacaoCiclo, setRecomendacaoCiclo] = useState(null);
  const [tendenciasMensais, setTendenciasMensais] = useState(null);
  
  // Estados do ciclo menstrual
  const [faseCiclo, setFaseCiclo] = useState(null);
  const [diaCiclo, setDiaCiclo] = useState(null);
  
  // Estados do histórico
  const [historico, setHistorico] = useState([]);
  const [diasCount, setDiasCount] = useState(0);
  
  // Estados do onboarding
  const [nome, setNome] = useState('');
  const [tracksCycle, setTracksCycle] = useState(null);
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);

  // ============================================================
  // EFEITOS
  // ============================================================
  
  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      loadHistorico();
    }
  }, [profile]);

  // ============================================================
  // FUNÇÕES DE CARREGAMENTO
  // ============================================================
  
  async function loadUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser(authUser);
        
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', authUser.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          if (profileData.ciclo_activo && profileData.ultimo_periodo) {
            calcularFaseCiclo(profileData);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar utilizador:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistorico() {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('lumina_checkins')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      if (data) {
        setHistorico(data);
        const uniqueDates = [...new Set(data.map(e => e.data))];
        setDiasCount(uniqueDates.length);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }

  // ============================================================
  // CICLO MENSTRUAL
  // ============================================================
  
  function calcularFaseCiclo(profileData) {
    if (!profileData?.ciclo_activo || !profileData?.ultimo_periodo) {
      setFaseCiclo(null);
      setDiaCiclo(null);
      return;
    }

    const lastPeriodDate = new Date(profileData.ultimo_periodo);
    const today = new Date();
    const diffDays = Math.floor((today - lastPeriodDate) / (1000 * 60 * 60 * 24));
    const cycleLen = profileData.duracao_ciclo || 28;
    const day = (diffDays % cycleLen) + 1;

    setDiaCiclo(day);

    let phase, message;
    if (day <= 5) {
      phase = 'menstrual';
      message = 'Estás na menstruação – o recolhimento que sentes é natural, não resistência.';
    } else if (day <= 13) {
      phase = 'folicular';
      message = 'Estás na fase folicular – a energia está a subir naturalmente.';
    } else if (day <= 16) {
      phase = 'ovulacao';
      message = 'Estás na ovulação – este é o teu pico natural de energia e clareza.';
    } else {
      phase = 'lutea';
      message = 'Estás na fase lútea – o cansaço ou irritabilidade que sentes é fisiológico, não falha tua.';
    }

    setFaseCiclo({ phase, day, message });
  }

  function getCycleNote() {
    if (!faseCiclo) return null;
    return `Dia ${faseCiclo.day} do ciclo · Fase ${faseCiclo.phase}`;
  }

  // ============================================================
  // EXTRAIR PRIMEIRO NOME
  // ============================================================
  function getPrimeiroNome() {
    if (profile?.nome) {
      // Retorna apenas o primeiro nome
      return profile.nome.split(' ')[0].split('.')[0];
    }
    return null;
  }

  // ============================================================
  // NAVEGAÇÃO
  // ============================================================
  
  function handleSplashTap() {
    if (profile) {
      setScreen('intro');
    } else {
      setScreen('onboarding');
    }
  }

  function startJourney() {
    setQuestionIndex(0);
    setScreen('question');
  }

  function handleAnswer(perguntaId, valor) {
    setRespostas(prev => ({ ...prev, [perguntaId]: valor }));
    
    if (questionIndex < PERGUNTAS.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      // Mostrar pausa com olho a piscar
      setScreen('pause');
      setTimeout(() => {
        gerarLeitura();
      }, 2500);
    }
  }

  // ============================================================
  // GERAR LEITURA
  // ============================================================
  
  function gerarLeitura() {
    const padraoDetectado = detectarPadrao(respostas);
    const textoLeitura = obterLeitura(padraoDetectado);
    const recomendacao = obterRecomendacaoEco(respostas);
    const padraoSem = analisarPadroesSemanais(historico);

    // Insights personalizados baseados no histórico e fase do ciclo
    const faseActual = faseCiclo?.phase || null;
    const insightsPersonais = obterInsightsPersonalizados(historico, faseActual);
    const recCiclo = obterRecomendacaoCicloEco(respostas, faseActual, historico);
    const tendencias = analisarTendenciasMensais(historico);

    setPadrao(padraoDetectado);
    setLeitura(textoLeitura);
    setEcoRecomendado(recomendacao);
    setPadraoSemanal(padraoSem);
    setInsightsPersonalizados(insightsPersonais);
    setRecomendacaoCiclo(recCiclo);
    setTendenciasMensais(tendencias);

    setScreen('reading');
  }

  // ============================================================
  // GUARDAR CHECK-IN
  // ============================================================
  
  async function saveAndRestart() {
    if (!profile?.id) {
      console.error('Sem profile.id para guardar');
      restart();
      return;
    }

    try {
      // Preparar dados do check-in
      const checkinData = {
        user_id: profile.id,
        data: new Date().toISOString().split('T')[0],
        corpo: respostas.corpo,
        passado: respostas.passado,
        impulso: respostas.impulso,
        futuro: respostas.futuro,
        mente: respostas.mente,
        energia: respostas.energia,
        espelho: respostas.espelho,
        fase_ciclo: faseCiclo?.phase || null,
        dia_ciclo: diaCiclo || null
      };

      console.log('A guardar check-in:', checkinData);

      const { data: savedCheckin, error: checkinError } = await supabase
        .from('lumina_checkins')
        .insert(checkinData)
        .select()
        .single();

      if (checkinError) {
        console.error('Erro ao guardar check-in:', checkinError);
        throw checkinError;
      }

      console.log('Check-in guardado:', savedCheckin);

      // Guardar leitura
      if (savedCheckin?.id) {
        const leituraData = {
          checkin_id: savedCheckin.id,
          user_id: profile.id,
          padrao: padrao,
          texto_leitura: leitura
        };

        const { error: leituraError } = await supabase
          .from('lumina_leituras')
          .insert(leituraData);

        if (leituraError) {
          console.error('Erro ao guardar leitura:', leituraError);
        }
      }

      // Recarregar histórico
      await loadHistorico();
      
    } catch (error) {
      console.error('Erro ao guardar:', error);
    }

    restart();
  }

  function restart() {
    setRespostas({
      corpo: null,
      passado: null,
      impulso: null,
      futuro: null,
      mente: null,
      energia: null,
      espelho: null
    });
    setPadrao(null);
    setLeitura('');
    setEcoRecomendado(null);
    setPadraoSemanal(null);
    setInsightsPersonalizados(null);
    setRecomendacaoCiclo(null);
    setTendenciasMensais(null);
    setQuestionIndex(0);
    setScreen('splash');
  }

  // ============================================================
  // ONBOARDING
  // ============================================================
  
  async function saveOnboarding() {
    if (!nome.trim()) {
      alert('Por favor, insere o teu nome.');
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const profileData = {
          auth_id: authUser.id,
          nome: nome.trim(),
          email: authUser.email,
          ciclo_activo: tracksCycle === 'sim',
          duracao_ciclo: cycleLength,
          ultimo_periodo: tracksCycle === 'sim' && lastPeriod ? lastPeriod : null
        };

        const { data, error } = await supabase
          .from('users')
          .upsert(profileData, { onConflict: 'auth_id' })
          .select()
          .single();

        if (error) throw error;
        
        setProfile(data);
        if (data.ciclo_activo && data.ultimo_periodo) {
          calcularFaseCiclo(data);
        }
      }
    } catch (error) {
      console.error('Erro ao guardar onboarding:', error);
    }

    setScreen('intro');
  }

  // ============================================================
  // HISTÓRICO
  // ============================================================
  
  function showHistory() {
    setScreen('history');
  }

  function renderHistorico() {
    const weeklyInsights = obterInsightsSemanais(historico);
    const patterns14 = analisarPadroesPeriodo(historico, 14);
    const patterns30 = analisarPadroesPeriodo(historico, 30);

    return (
      <div className="history-container">
        <h2 className="history-title">Histórico</h2>
        
        {weeklyInsights && weeklyInsights.length > 0 && (
          <div className="weekly-summary">
            <div className="weekly-title">Esta semana</div>
            {weeklyInsights.map((insight, i) => (
              <div key={i} className="weekly-insight">{insight}</div>
            ))}
          </div>
        )}

        {historico.length === 0 ? (
          <div className="history-empty">
            Ainda não tens registos.<br /><br />
            Usa a LUMINA diariamente para descobrires os teus padrões.
          </div>
        ) : (
          historico.slice(0, 10).map((entry, i) => (
            <div key={i} className="history-item">
              <div className="history-date">
                {new Date(entry.created_at).toLocaleDateString('pt-PT')}
                {entry.dia_ciclo && ` · Dia ${entry.dia_ciclo} do ciclo`}
              </div>
              <div className="history-tags">
                <span className="history-tag">{entry.energia}</span>
                <span className="history-tag">{entry.corpo}</span>
                <span className="history-tag">{entry.mente}</span>
              </div>
            </div>
          ))
        )}

        {patterns14 && (
          <div className="patterns-section">
            <div className="patterns-title">últimos 14 dias</div>
            {renderPatternItems(patterns14, 3)}
          </div>
        )}

        {patterns30 && (
          <div className="patterns-section">
            <div className="patterns-title">últimos 30 dias</div>
            {renderPatternItems(patterns30, 7)}
          </div>
        )}

        <button className="back-btn" onClick={() => setScreen('splash')}>
          voltar
        </button>
      </div>
    );
  }

  function renderPatternItems(patterns, threshold) {
    const { counts } = patterns;
    const items = [];

    if (counts.energiaBaixa >= threshold) {
      items.push(
        <div key="energia" className="pattern-item">
          <div className="pattern-stat">Energia baixa: {counts.energiaBaixa}x</div>
          <div className="pattern-insight">
            {threshold >= 7 
              ? 'Padrão consolidado. O teu corpo está a precisar de atenção séria.'
              : 'Atenção ao cansaço acumulado'}
          </div>
        </div>
      );
    }

    if (counts.corpoFechado >= threshold) {
      items.push(
        <div key="corpo" className="pattern-item">
          <div className="pattern-stat">Corpo fechado: {counts.corpoFechado}x</div>
          <div className="pattern-insight">
            {threshold >= 7 
              ? 'Tensão crónica. Considera movimento, massagem, ou descanso real.'
              : 'O corpo está a pedir abertura'}
          </div>
        </div>
      );
    }

    if (counts.menteRuidosa >= threshold) {
      items.push(
        <div key="mente" className="pattern-item">
          <div className="pattern-stat">Mente agitada: {counts.menteRuidosa}x</div>
          <div className="pattern-insight">
            {threshold >= 7 
              ? 'Ruído mental persistente. O que está a ocupar espaço?'
              : 'Precisa de mais silêncio'}
          </div>
        </div>
      );
    }

    if (items.length === 0) {
      items.push(
        <div key="none" className="pattern-item">
          <div className="pattern-insight">
            {threshold >= 7 
              ? 'Sem padrões negativos consolidados. Bom sinal.'
              : 'Sem padrões negativos detectados.'}
          </div>
        </div>
      );
    }

    return items;
  }

  // ============================================================
  // RENDER - SPLASH SCREEN
  // ============================================================
  
  function renderSplash() {
    return (
      <div className={`screen ${screen === 'splash' ? 'active' : ''}`}>
        <img src="/logos/lumina-logo_v2.png" alt="LUMINA" className="splash-eye" style={{
          width: '120px',
          height: '120px',
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 30px rgba(75, 0, 130, 0.25))'
        }} />

        <div className="splash-title">LUMINA</div>
        <div className="splash-subtitle">
          Diagnóstico Interior
        </div>
        <div style={{
          fontSize: '13px',
          opacity: 0.6,
          marginTop: '20px',
          fontStyle: 'italic',
          maxWidth: '300px',
          lineHeight: 1.6,
          textAlign: 'center'
        }}>
          "Antes de agires, vê-te.<br/>
          Antes de decidires, conhece-te."
        </div>

        <button className="splash-tap" onClick={handleSplashTap}>
          ENTRAR
        </button>

        <button className="splash-history" onClick={showHistory}>
          ver histórico ({diasCount} {diasCount === 1 ? 'dia' : 'dias'})
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER - ONBOARDING
  // ============================================================
  
  function renderOnboarding() {
    return (
      <div className={`screen ${screen === 'onboarding' ? 'active' : ''}`}>
        <div className="onboarding-title">Bem-vinda à LUMINA</div>
        <div className="onboarding-subtitle">Vê-te antes de agir</div>

        <div className="form-group">
          <label className="form-label">Como te chamas?</label>
          <input
            type="text"
            className="form-input"
            placeholder="O teu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Acompanhas o teu ciclo menstrual?</label>
          <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '12px', lineHeight: 1.4 }}>
            O ciclo menstrual influencia energia, emoções e clareza mental.
            Se acompanhares, a LUMINA ajusta a leitura à tua fase.
          </p>
          <div className="radio-group">
            <div
              className={`radio-option ${tracksCycle === 'sim' ? 'selected' : ''}`}
              onClick={() => setTracksCycle('sim')}
            >
              Sim, acompanho
            </div>
            <div
              className={`radio-option ${tracksCycle === 'nao' ? 'selected' : ''}`}
              onClick={() => setTracksCycle('nao')}
            >
              Não acompanho
            </div>
            <div
              className={`radio-option ${tracksCycle === 'menopausa' ? 'selected' : ''}`}
              onClick={() => setTracksCycle('menopausa')}
            >
              Menopausa / Não se aplica
            </div>
          </div>
        </div>

        <div className={`cycle-section ${tracksCycle === 'sim' ? 'visible' : ''}`}>
          <div className="form-group">
            <label className="form-label">Quando começou a última menstruação?</label>
            <p style={{ fontSize: '11px', opacity: 0.6, marginBottom: '8px' }}>
              O 1º dia em que veio sangue
            </p>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quantos dias dura o teu ciclo?</label>
            <p style={{ fontSize: '11px', opacity: 0.6, marginBottom: '8px' }}>
              Do 1º dia de uma menstruação até ao 1º dia da seguinte (normalmente 21-35 dias)
            </p>
            <div className="slider-value">
              <span style={{ fontSize: '24px' }}>{cycleLength}</span> <span>dias</span>
            </div>
            <input
              type="range"
              min="21"
              max="35"
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value))}
            />
          </div>
        </div>

        <button className="start-button" onClick={saveOnboarding} style={{ marginTop: '20px' }}>
          COMEÇAR
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER - INTRO
  // ============================================================
  
  function renderIntro() {
    const primeiroNome = getPrimeiroNome();

    // Descrição clara da fase do ciclo
    const getCycleDescription = () => {
      if (!faseCiclo) return null;
      const descriptions = {
        menstrual: { emoji: '🌑', nome: 'Menstruação', desc: 'Tempo de recolhimento e descanso' },
        folicular: { emoji: '🌒', nome: 'Fase Folicular', desc: 'Energia a subir, boa altura para iniciar' },
        ovulacao: { emoji: '🌕', nome: 'Ovulação', desc: 'Pico de energia e clareza' },
        lutea: { emoji: '🌘', nome: 'Fase Lútea', desc: 'Energia a descer, tempo de completar' }
      };
      return descriptions[faseCiclo.phase];
    };

    const cycleDesc = getCycleDescription();

    return (
      <div className={`screen ${screen === 'intro' ? 'active' : ''}`}>
        <div className="intro-greeting">
          {primeiroNome ? `${primeiroNome},` : 'Mulher,'}
        </div>

        <div className="intro-text" style={{ fontSize: '18px', lineHeight: 1.6 }}>
          Antes de agires,<br />
          <em style={{ fontSize: '22px' }}>vê-te</em>.<br /><br />
          <span style={{ opacity: 0.8, fontSize: '15px' }}>
            7 perguntas sobre o teu estado.<br />
            1 leitura que revela o que precisas saber.
          </span>
        </div>

        {cycleDesc && (
          <div className="cycle-note visible" style={{
            background: 'rgba(75, 0, 130, 0.08)',
            padding: '16px',
            borderRadius: '12px',
            marginTop: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{cycleDesc.emoji}</div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              Dia {faseCiclo.day} · {cycleDesc.nome}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>{cycleDesc.desc}</div>
          </div>
        )}

        <button className="start-button" onClick={startJourney} style={{ marginTop: '24px' }}>
          COMEÇAR LEITURA
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER - PERGUNTA
  // ============================================================
  
  function renderQuestion() {
    const pergunta = PERGUNTAS[questionIndex];
    const ecoClass = `eco-${pergunta.eco}`;
    
    const negativos = pergunta.opcoes.filter(o => o.posicao === 'negativo');
    const neutro = pergunta.opcoes.find(o => o.posicao === 'neutro');
    const positivos = pergunta.opcoes.filter(o => o.posicao === 'positivo');

    return (
      <div className={`screen ${ecoClass} ${screen === 'question' ? 'active' : ''}`}>
        <div className="logo-small">LUMINA</div>
        
        <div className="progress">
          {PERGUNTAS.map((_, i) => (
            <div 
              key={i} 
              className={`progress-dot ${i <= questionIndex ? `eco-${i + 1} filled` : ''}`}
            />
          ))}
        </div>
        
        <div className="question-container">
          <p className={`question ${ecoClass}`}>
            <span className="i">{pergunta.inicial}</span>
            {pergunta.titulo.slice(1)}
          </p>
          <p className="question-explanation">{pergunta.explicacao}</p>
        </div>
        
        <div className="options">
          <div className="options-row">
            {negativos.map(opcao => (
              <button 
                key={opcao.valor}
                className="option"
                onClick={() => handleAnswer(pergunta.id, opcao.valor)}
              >
                {opcao.valor}
              </button>
            ))}
          </div>
          
          <div className="options-row">
            {neutro && (
              <button 
                className="option"
                onClick={() => handleAnswer(pergunta.id, neutro.valor)}
              >
                {neutro.valor}
              </button>
            )}
          </div>
          
          <div className="options-row">
            {positivos.map(opcao => (
              <button 
                key={opcao.valor}
                className="option"
                onClick={() => handleAnswer(pergunta.id, opcao.valor)}
              >
                {opcao.valor}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - PAUSA COM OLHO A PISCAR
  // ============================================================
  
  function renderPause() {
    return (
      <div className={`screen pause-screen ${screen === 'pause' ? 'active' : ''}`}>
        <img src="/logos/lumina-logo_v2.png" alt="LUMINA" className="pause-eye" />
        <p className="pause-text">a ler-te...</p>
      </div>
    );
  }

  // ============================================================
  // RENDER - LEITURA
  // ============================================================
  
  function renderReading() {
    // Os 7 Ecos - LUMINA NÃO É UM ECO, ela observa e guia
    const SETE_ECOS = [
      { nome: 'Vitalis', chakra: 'Raiz', foco: 'Corpo & Nutrição', cor: '#7C8B6F', disponivel: true, link: '/vitalis' },
      { nome: 'Serena', chakra: 'Sacral', foco: 'Emoção & Fluidez', cor: '#E8927C', disponivel: false },
      { nome: 'Ignis', chakra: 'Plexo Solar', foco: 'Vontade & Foco', cor: '#F4A460', disponivel: false },
      { nome: 'Ventis', chakra: 'Coração', foco: 'Ritmo & Energia', cor: '#90EE90', disponivel: false },
      { nome: 'Ecoa', chakra: 'Garganta', foco: 'Voz & Expressão', cor: '#87CEEB', disponivel: false },
      { nome: 'Imago', chakra: 'Terceiro Olho', foco: 'Visão & Identidade', cor: '#9370DB', disponivel: false },
      { nome: 'Aurora', chakra: 'Coroa', foco: 'Integração Final', cor: '#DDA0DD', disponivel: false }
    ];

    // Informação do ciclo para mostrar
    const cicloInfo = faseCiclo?.phase ? CICLO_ECO_MAP[faseCiclo.phase] : null;

    // Cor índigo da Lumina
    const INDIGO = '#4B0082';
    const INDIGO_LIGHT = 'rgba(75, 0, 130, 0.1)';

    return (
      <div className={`screen ${screen === 'reading' ? 'active' : ''}`} style={{ overflowY: 'auto', paddingBottom: '100px' }}>
        <div className="logo-small">A TUA LEITURA</div>

        {diasCount > 0 && (
          <div className="days-badge">{diasCount} dias contigo</div>
        )}

        <div className="reading-container">
          <p className="reading-text" style={{
            fontSize: '17px',
            lineHeight: 1.8,
            fontStyle: 'italic',
            wordBreak: 'break-word',
            hyphens: 'auto'
          }}>
            "{leitura}"
          </p>

          {/* Contexto do Ciclo com Eco Map */}
          {cicloInfo && (
            <div style={{
              background: INDIGO_LIGHT,
              padding: '16px',
              borderRadius: '12px',
              marginTop: '20px',
              borderLeft: `4px solid ${INDIGO}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px' }}>{cicloInfo.lua}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    Dia {faseCiclo.day} · {cicloInfo.fase}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    Dias {cicloInfo.dias} · Energia {cicloInfo.energia}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '10px' }}>
                {cicloInfo.mensagem}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.6 }}>
                Estados comuns: {cicloInfo.estadosComuns.join(', ')}
              </div>
            </div>
          )}

          {/* Insights Personalizados (aprendizagem) */}
          {insightsPersonalizados && insightsPersonalizados.length > 0 && (
            <div style={{
              background: INDIGO_LIGHT,
              padding: '16px',
              borderRadius: '12px',
              marginTop: '16px',
              borderLeft: `4px solid ${INDIGO}`
            }}>
              <div style={{ fontSize: '12px', letterSpacing: '1px', opacity: 0.7, marginBottom: '10px' }}>
                A LUMINA APRENDEU CONTIGO
              </div>
              {insightsPersonalizados.map((insight, i) => (
                <div key={i} style={{
                  fontSize: '13px',
                  lineHeight: 1.5,
                  marginBottom: i < insightsPersonalizados.length - 1 ? '10px' : 0,
                  padding: '8px',
                  background: insight.tipo === 'atencao' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(75, 0, 130, 0.05)',
                  borderRadius: '8px'
                }}>
                  <span style={{ marginRight: '6px' }}>
                    {insight.tipo === 'atencao' ? '!' : insight.tipo === 'confirmacao' ? '·' : '·'}
                  </span>
                  {insight.msg}
                </div>
              ))}
            </div>
          )}

          {/* Recomendação Ciclo + Eco */}
          {recomendacaoCiclo && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: recomendacaoCiclo.eco === 'Vitalis' ? 'rgba(124, 139, 111, 0.1)' : INDIGO_LIGHT,
              borderRadius: '12px',
              borderLeft: `4px solid ${recomendacaoCiclo.eco === 'Vitalis' ? '#7C8B6F' : INDIGO}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>{recomendacaoCiclo.lua}</span>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {recomendacaoCiclo.eco} para esta fase
                </span>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '8px' }}>
                {recomendacaoCiclo.razao}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, fontStyle: 'italic' }}>
                {recomendacaoCiclo.contextoCiclo}
              </div>
              {recomendacaoCiclo.disponivel && recomendacaoCiclo.link && (
                <a href={recomendacaoCiclo.link} style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '10px 20px',
                  background: recomendacaoCiclo.eco === 'Vitalis' ? '#7C8B6F' : INDIGO,
                  color: 'white',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  Explorar {recomendacaoCiclo.eco} →
                </a>
              )}
            </div>
          )}

          {/* Fallback para Eco Recomendado (sem ciclo) */}
          {!recomendacaoCiclo && ecoRecomendado && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: ecoRecomendado.eco === 'Vitalis' ? 'rgba(124, 139, 111, 0.1)' : INDIGO_LIGHT,
              borderRadius: '12px',
              borderLeft: `4px solid ${ecoRecomendado.eco === 'Vitalis' ? '#7C8B6F' : INDIGO}`
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                Sugestão: {ecoRecomendado.eco}
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
                {ecoRecomendado.msg}
              </div>
              {ecoRecomendado.disponivel && ecoRecomendado.link ? (
                <a href={ecoRecomendado.link} style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '10px 20px',
                  background: ecoRecomendado.eco === 'Vitalis' ? '#7C8B6F' : INDIGO,
                  color: 'white',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  Explorar {ecoRecomendado.eco} →
                </a>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.6, fontStyle: 'italic' }}>
                  Em breve disponível
                </div>
              )}
            </div>
          )}

          {/* Padrão Semanal */}
          {padraoSemanal && (
            <div className="pattern-alert" style={{ marginTop: '16px' }}>
              <div className="pattern-alert-title">Padrão Detectado</div>
              <div className="pattern-alert-text">{padraoSemanal.message}</div>
            </div>
          )}

          {/* Tendências Mensais */}
          {tendenciasMensais && tendenciasMensais.insights.length > 0 && (
            <div style={{
              background: INDIGO_LIGHT,
              padding: '14px',
              borderRadius: '10px',
              marginTop: '16px',
              borderLeft: `3px solid ${INDIGO}`
            }}>
              <div style={{ fontSize: '12px', letterSpacing: '1px', opacity: 0.7, marginBottom: '8px' }}>
                TENDÊNCIA MENSAL
              </div>
              {tendenciasMensais.insights.map((insight, i) => (
                <div key={i} style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: i < tendenciasMensais.insights.length - 1 ? '6px' : 0 }}>
                  {insight}
                </div>
              ))}
            </div>
          )}

          {/* Os 7 Ecos - LUMINA observa, não faz parte */}
          <div style={{ marginTop: '30px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', letterSpacing: '2px', opacity: 0.6 }}>OS SETE ECOS</div>
              <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
                A LUMINA observa e guia-te para o Eco certo
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {SETE_ECOS.slice(0, 4).map(eco => (
                <div key={eco.nome} style={{
                  textAlign: 'center',
                  padding: '10px 4px',
                  background: eco.disponivel ? 'rgba(124, 139, 111, 0.1)' : 'rgba(0,0,0,0.03)',
                  borderRadius: '8px',
                  opacity: eco.disponivel ? 1 : 0.6
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: eco.cor, margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{eco.nome}</div>
                  <div style={{ fontSize: '8px', opacity: 0.6 }}>{eco.foco}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
              {SETE_ECOS.slice(4).map(eco => (
                <div key={eco.nome} style={{
                  textAlign: 'center',
                  padding: '10px 4px',
                  background: eco.disponivel ? 'rgba(124, 139, 111, 0.1)' : 'rgba(0,0,0,0.03)',
                  borderRadius: '8px',
                  opacity: eco.disponivel ? 1 : 0.6
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: eco.cor, margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{eco.nome}</div>
                  <div style={{ fontSize: '8px', opacity: 0.6 }}>{eco.foco}</div>
                </div>
              ))}
            </div>

            {/* CTA Vitalis */}
            <a href="/vitalis" style={{
              display: 'block',
              marginTop: '20px',
              padding: '14px',
              background: 'linear-gradient(135deg, #7C8B6F 0%, #6B7A5E 100%)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>VITALIS</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Começa pelo corpo. Nutrição consciente e transformação.
              </div>
            </a>
          </div>
        </div>

        <div className="reading-signature" style={{ marginTop: '24px' }}>
          LUMINA · Sete Ecos<br />
          <span style={{ fontSize: '10px' }}>© Vivianne dos Santos</span>
        </div>

        <button className="close-button" onClick={saveAndRestart} style={{
          marginTop: '16px',
          padding: '12px 30px'
        }}>
          Guardar e Fechar
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER - HISTÓRICO
  // ============================================================
  
  function renderHistoryScreen() {
    return (
      <div className={`screen ${screen === 'history' ? 'active' : ''}`}>
        {renderHistorico()}
      </div>
    );
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  
  if (loading) {
    return (
      <div className="lumina-container">
        <div className="phone-frame">
          <div className="screen active">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lumina-container">
      <div className="phone-frame">
        {renderSplash()}
        {renderOnboarding()}
        {renderIntro()}
        {renderQuestion()}
        {renderPause()}
        {renderReading()}
        {renderHistoryScreen()}
      </div>
    </div>
  );
}
