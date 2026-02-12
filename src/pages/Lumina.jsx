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
import {
  GENEROS,
  saudacao,
  bemVindo,
  opcaoLabel,
  explicacaoAdaptada,
  adaptarTextoGenero,
  mostrarCicloMenstrual
} from '../lib/genero';
import { setSexo } from '../utils/genero';
import { useAuth } from '../contexts/AuthContext';
import UpsellCard from '../components/UpsellCard';
import './Lumina.css';

// ============================================================
// CONSTANTES - 7 PERGUNTAS NA ORDEM CORRETA
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
  },
  {
    id: 'cuidado',
    eco: 8,
    titulo: 'Cuidado Próprio',
    inicial: 'C',
    explicacao: 'Como tens tratado a ti mesma ultimamente?',
    opcoes: [
      { valor: 'esquecida', posicao: 'negativo' },
      { valor: 'por ultimo', posicao: 'negativo' },
      { valor: 'normal', posicao: 'neutro' },
      { valor: 'presente', posicao: 'positivo' },
      { valor: 'prioritaria', posicao: 'positivo' }
    ]
  }
];



// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Lumina() {
  // Acesso a subscricoes (para upsell contextual)
  const { vitalisAccess, aureaAccess } = useAuth();
  const [upsellDismissed, setUpsellDismissed] = useState(false);

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
    espelho: null,
    cuidado: null
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

  // Email capture (funil para visitantes não autenticadas)
  const [captureEmail, setCaptureEmail] = useState('');
  const [captureSubmitted, setCaptureSubmitted] = useState(false);
  const [captureLoading, setCaptureLoading] = useState(false);
  
  // Estados do onboarding
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState(null);
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
          if (profileData.genero) {
            setGenero(profileData.genero);
          }
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
    const textoLeituraOriginal = obterLeitura(padraoDetectado);
    const textoLeitura = adaptarTextoGenero(textoLeituraOriginal, genero || profile?.genero);
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
        cuidado: respostas.cuidado,
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
      espelho: null,
      cuidado: null
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
        // Utilizadora autenticada - guardar em Supabase
        const profileData = {
          auth_id: authUser.id,
          nome: nome.trim(),
          email: authUser.email,
          genero: genero || null,
          ciclo_activo: tracksCycle === 'sim',
          duracao_ciclo: cycleLength,
          ultimo_periodo: tracksCycle === 'sim' && lastPeriod ? lastPeriod : null
        };

        const { data, error } = await supabase
          .from('users')
          .upsert(profileData)
          .select()
          .single();

        if (error) throw error;

        setProfile(data);
        if (data.ciclo_activo && data.ultimo_periodo) {
          calcularFaseCiclo(data);
        }
      } else {
        // Visitante não autenticada - perfil local temporário
        const localProfile = {
          id: null,
          nome: nome.trim(),
          genero: genero || null,
          ciclo_activo: tracksCycle === 'sim',
          duracao_ciclo: cycleLength,
          ultimo_periodo: tracksCycle === 'sim' && lastPeriod ? lastPeriod : null
        };
        setProfile(localProfile);
        if (localProfile.ciclo_activo && localProfile.ultimo_periodo) {
          calcularFaseCiclo(localProfile);
        }
      }

      // Sincronizar genero com localStorage para g() funcionar em toda a app
      if (genero === 'M') {
        setSexo('masculino');
      } else if (genero === 'F') {
        setSexo('feminino');
      }
    } catch (error) {
      console.error('Erro ao guardar onboarding:', error);
      // Mesmo com erro, criar perfil local para permitir check-in
      setProfile({ id: null, nome: nome.trim(), genero: genero || null });
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
          color: '#6B6B9D',
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
    const showCycleSection = mostrarCicloMenstrual(genero);

    return (
      <div className={`screen ${screen === 'onboarding' ? 'active' : ''}`}>
        <div className="onboarding-title">{bemVindo(genero)} à LUMINA</div>
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
          <label className="form-label">Como te identificas?</label>
          <p style={{ fontSize: '12px', color: '#5A5A8F', marginBottom: '12px', lineHeight: 1.4 }}>
            Isto ajuda a LUMINA a personalizar a tua experiência.
          </p>
          <div className="radio-group">
            {GENEROS.map(g => (
              <div
                key={g.valor}
                className={`radio-option ${genero === g.valor ? 'selected' : ''}`}
                onClick={() => {
                  setGenero(g.valor);
                  // Reset cycle tracking when switching to male
                  if (g.valor === 'M') {
                    setTracksCycle('nao');
                  }
                }}
              >
                {g.label}
              </div>
            ))}
          </div>
        </div>

        {showCycleSection && (
          <div className="form-group">
            <label className="form-label">Acompanhas o teu ciclo menstrual?</label>
            <p style={{ fontSize: '12px', color: '#5A5A8F', marginBottom: '12px', lineHeight: 1.4 }}>
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
        )}

        <div className={`cycle-section ${tracksCycle === 'sim' ? 'visible' : ''}`}>
          <div className="form-group">
            <label className="form-label">Quando começou a última menstruação?</label>
            <p style={{ fontSize: '11px', color: '#6B6B9D', marginBottom: '8px' }}>
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
            <p style={{ fontSize: '11px', color: '#6B6B9D', marginBottom: '8px' }}>
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
          {primeiroNome ? `${primeiroNome},` : `${saudacao(genero || profile?.genero)},`}
        </div>

        <div className="intro-text" style={{ fontSize: '18px', lineHeight: 1.6 }}>
          Antes de agires,<br />
          <em style={{ fontSize: '22px' }}>vê-te</em>.<br /><br />
          <span style={{ color: '#3A3A6F', fontSize: '15px' }}>
            8 perguntas sobre o teu estado.<br />
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
            <div style={{ fontSize: '13px', color: '#3A3A6F' }}>{cycleDesc.desc}</div>
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
    const userGenero = genero || profile?.genero;

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
          <p className="question-explanation">{explicacaoAdaptada(pergunta.id, pergunta.explicacao, userGenero)}</p>
        </div>

        <div className="options">
          <div className="options-row">
            {negativos.map(opcao => (
              <button
                key={opcao.valor}
                className="option"
                onClick={() => handleAnswer(pergunta.id, opcao.valor)}
              >
                {opcaoLabel(opcao.valor, userGenero)}
              </button>
            ))}
          </div>

          <div className="options-row">
            {neutro && (
              <button
                className="option"
                onClick={() => handleAnswer(pergunta.id, neutro.valor)}
              >
                {opcaoLabel(neutro.valor, userGenero)}
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
                {opcaoLabel(opcao.valor, userGenero)}
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
      { nome: 'Vitalis', foco: 'Corpo & Nutrição', cor: '#7C8B6F', disponivel: true, link: '/vitalis' },
      { nome: 'Áurea', foco: 'Auto-Valor & Merecimento', cor: '#C9A227', disponivel: true, link: '/aurea' },
      { nome: 'Serena', foco: 'Emoção & Fluidez', cor: '#6B8E9B', disponivel: false },
      { nome: 'Ignis', foco: 'Vontade & Foco', cor: '#C1634A', disponivel: false },
      { nome: 'Ventis', foco: 'Ritmo & Energia', cor: '#5D9B84', disponivel: false },
      { nome: 'Ecoa', foco: 'Voz & Expressão', cor: '#4A90A4', disponivel: false },
      { nome: 'Imago', foco: 'Identidade & Essência', cor: '#8B7BA5', disponivel: false }
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
                  <div style={{ fontSize: '11px', color: '#5A5A8F' }}>
                    Dias {cicloInfo.dias} · Energia {cicloInfo.energia}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '10px' }}>
                {cicloInfo.mensagem}
              </div>
              <div style={{ fontSize: '11px', color: '#6B6B9D' }}>
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
              <div style={{ fontSize: '12px', letterSpacing: '1px', color: '#5A5A8F', marginBottom: '10px' }}>
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
              background: recomendacaoCiclo.eco === 'Áurea'
                ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(212, 175, 55, 0.1) 100%)'
                : recomendacaoCiclo.eco === 'Vitalis' ? 'rgba(124, 139, 111, 0.1)' : INDIGO_LIGHT,
              borderRadius: '12px',
              borderLeft: `4px solid ${
                recomendacaoCiclo.eco === 'Áurea' ? '#C9A227'
                : recomendacaoCiclo.eco === 'Vitalis' ? '#7C8B6F' : INDIGO
              }`,
              boxShadow: recomendacaoCiclo.eco === 'Áurea' ? '0 2px 12px rgba(201, 162, 39, 0.2)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px' }}>
                  {recomendacaoCiclo.eco === 'Áurea' ? '✧' : recomendacaoCiclo.lua}
                </span>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: recomendacaoCiclo.eco === 'Áurea' ? '#7A6200' : 'inherit'
                }}>
                  {recomendacaoCiclo.eco} para esta fase
                </span>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '8px' }}>
                {recomendacaoCiclo.razao}
              </div>
              <div style={{ fontSize: '12px', color: '#3A3A6F', fontStyle: 'italic' }}>
                {recomendacaoCiclo.contextoCiclo}
              </div>
              {recomendacaoCiclo.disponivel && recomendacaoCiclo.link && (
                <a href={recomendacaoCiclo.link} style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '10px 20px',
                  background: recomendacaoCiclo.eco === 'Áurea'
                    ? 'linear-gradient(135deg, #C9A227 0%, #D4AF37 100%)'
                    : recomendacaoCiclo.eco === 'Vitalis' ? '#7C8B6F' : INDIGO,
                  color: 'white',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  boxShadow: recomendacaoCiclo.eco === 'Áurea' ? '0 4px 15px rgba(201, 162, 39, 0.3)' : 'none'
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
              background: ecoRecomendado.eco === 'Áurea'
                ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(212, 175, 55, 0.1) 100%)'
                : ecoRecomendado.eco === 'Vitalis'
                  ? 'rgba(124, 139, 111, 0.1)'
                  : INDIGO_LIGHT,
              borderRadius: '12px',
              borderLeft: `4px solid ${
                ecoRecomendado.eco === 'Áurea' ? '#C9A227'
                : ecoRecomendado.eco === 'Vitalis' ? '#7C8B6F'
                : INDIGO
              }`,
              boxShadow: ecoRecomendado.eco === 'Áurea' ? '0 2px 12px rgba(201, 162, 39, 0.2)' : 'none'
            }}>
              {/* Ícone dourado para ÁUREA */}
              {ecoRecomendado.eco === 'Áurea' && (
                <div style={{
                  textAlign: 'center',
                  marginBottom: '12px',
                  fontSize: '32px'
                }}>
                  ✧
                </div>
              )}
              <div style={{
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '14px',
                color: ecoRecomendado.eco === 'Áurea' ? '#7A6200' : 'inherit',
                textAlign: ecoRecomendado.eco === 'Áurea' ? 'center' : 'left'
              }}>
                {ecoRecomendado.eco === 'Áurea' ? 'Parece que precisas de ÁUREA' : `Sugestão: ${ecoRecomendado.eco}`}
              </div>
              <div style={{
                fontSize: '14px',
                lineHeight: 1.6,
                textAlign: ecoRecomendado.eco === 'Áurea' ? 'center' : 'left'
              }}>
                {ecoRecomendado.eco === 'Áurea'
                  ? 'ÁUREA trabalha o valor próprio encarnado. Ajuda-te a existir para ti — sem culpa.'
                  : ecoRecomendado.msg
                }
              </div>
              {ecoRecomendado.disponivel && ecoRecomendado.link ? (
                <a href={ecoRecomendado.link} style={{
                  display: 'block',
                  marginTop: '16px',
                  padding: '12px 24px',
                  background: ecoRecomendado.eco === 'Áurea'
                    ? 'linear-gradient(135deg, #C9A227 0%, #D4AF37 100%)'
                    : ecoRecomendado.eco === 'Vitalis' ? '#7C8B6F' : INDIGO,
                  color: 'white',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  boxShadow: ecoRecomendado.eco === 'Áurea' ? '0 4px 15px rgba(201, 162, 39, 0.3)' : 'none'
                }}>
                  Explorar {ecoRecomendado.eco} →
                </a>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6B6B9D', fontStyle: 'italic' }}>
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
              <div style={{ fontSize: '12px', letterSpacing: '1px', color: '#5A5A8F', marginBottom: '8px' }}>
                TENDÊNCIA MENSAL
              </div>
              {tendenciasMensais.insights.map((insight, i) => (
                <div key={i} style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: i < tendenciasMensais.insights.length - 1 ? '6px' : 0 }}>
                  {insight}
                </div>
              ))}
            </div>
          )}

          {/* Ponte Contextual: Lumina → Vitalis/Áurea */}
          {(() => {
            // Determinar se o check-in sugere necessidade de Vitalis
            const vals = Object.values(respostas || {});
            const media = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 5;
            const corpo = respostas?.corpo || respostas?.energia || 5;
            const espelho = respostas?.espelho || 5;
            const needsVitalis = corpo <= 4 || media <= 4;
            const needsAurea = espelho <= 3;
            const eco = needsAurea ? 'aurea' : 'vitalis';
            const ecoNome = needsAurea ? 'ÁUREA' : 'VITALIS';
            const ecoMsg = needsAurea
              ? 'Os teus padroes mostram que a tua relacao contigo pode precisar de atencao. A ÁUREA trabalha o valor proprio — sem culpa, sem pressao.'
              : 'O teu corpo esta a pedir atencao. O VITALIS combina nutricao cientifica com apoio emocional para uma transformacao real e sustentavel.';
            const ecoCor = needsAurea ? '#C9A227' : '#7C8B6F';
            const ecoBg = needsAurea
              ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.12) 0%, rgba(212, 175, 55, 0.06) 100%)'
              : 'linear-gradient(135deg, rgba(124, 139, 111, 0.12) 0%, rgba(156, 175, 136, 0.06) 100%)';

            return (
              <div style={{
                marginTop: '24px',
                padding: '20px',
                background: ecoBg,
                borderRadius: '16px',
                border: `1px solid ${ecoCor}30`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#6B6B9D', marginBottom: '8px' }}>
                  O PRÓXIMO PASSO
                </div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: ecoCor, marginBottom: '8px' }}>
                  {ecoNome} pode ajudar-te
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#3A3A6F', marginBottom: '16px' }}>
                  {ecoMsg}
                </div>
                <a href={`/${eco}?utm_source=lumina&utm_medium=upsell&utm_campaign=pos-checkin`} style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  background: ecoCor,
                  color: 'white',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  Conhecer {ecoNome} →
                </a>
                <div style={{ fontSize: '11px', color: '#6B6B9D', marginTop: '10px' }}>
                  {needsAurea ? 'Desde 975 MT/mês · 7 dias de garantia' : 'Desde 2.500 MT/mês · 7 dias de garantia'}
                </div>
              </div>
            );
          })()}

          {/* Captura de email - só para visitantes não autenticadas */}
          {!user && !captureSubmitted && (
            <div style={{
              marginTop: '24px',
              padding: '24px 20px',
              background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.08) 0%, rgba(155, 89, 182, 0.04) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(107, 91, 149, 0.15)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✉️</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '6px' }}>
                Queres receber os teus padrões por email?
              </div>
              <div style={{ fontSize: '13px', color: '#5A5A8F', marginBottom: '16px', lineHeight: 1.5 }}>
                Recebe a tua leitura + dicas personalizadas baseadas nos teus resultados. Grátis.
              </div>
              <div style={{ display: 'flex', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
                <input
                  type="email"
                  value={captureEmail}
                  onChange={(e) => setCaptureEmail(e.target.value)}
                  placeholder="O teu email"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(107, 91, 149, 0.2)',
                    background: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  disabled={captureLoading || !captureEmail.includes('@')}
                  onClick={async () => {
                    if (!captureEmail.includes('@')) return;
                    setCaptureLoading(true);
                    try {
                      await supabase.from('waitlist').insert({
                        nome: profile?.nome || '',
                        email: captureEmail.trim(),
                        whatsapp: null,
                        produto: 'lumina-checkin'
                      });
                    } catch (err) {
                      // Duplicado ou erro, ignorar silenciosamente
                    }
                    setCaptureSubmitted(true);
                    setCaptureLoading(false);
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: captureLoading ? '#999' : '#6B5B95',
                    color: 'white',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: captureLoading ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {captureLoading ? '...' : 'Enviar'}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#8888B0', marginTop: '10px' }}>
                Sem spam. Podes cancelar quando quiseres.
              </div>
            </div>
          )}

          {/* Confirmacao de captura */}
          {!user && captureSubmitted && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'rgba(16, 185, 129, 0.08)',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>✓</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669' }}>
                Obrigada! Vais receber os teus resultados em breve.
              </div>
              <a href="/login" style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '10px 24px',
                background: '#6B5B95',
                color: 'white',
                borderRadius: '20px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 'bold'
              }}>
                Criar conta para guardar historico →
              </a>
            </div>
          )}

          {/* Os 7 Ecos - LUMINA observa, não faz parte */}
          <div style={{ marginTop: '30px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', letterSpacing: '2px', color: '#6B6B9D' }}>OS SETE ECOS</div>
              <div style={{ fontSize: '11px', color: '#6B6B9D', marginTop: '4px' }}>
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
                  <div style={{ fontSize: '10px', color: '#6B6B9D' }}>{eco.foco}</div>
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
                  <div style={{ fontSize: '10px', color: '#6B6B9D' }}>{eco.foco}</div>
                </div>
              ))}
            </div>

            {/* CTAs dos Ecos Disponíveis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
              {/* CTA Vitalis */}
              <a href="/vitalis" style={{
                display: 'block',
                padding: '14px 10px',
                background: 'linear-gradient(135deg, #7C8B6F 0%, #6B7A5E 100%)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>VITALIS</div>
                <div style={{ fontSize: '10px', opacity: 0.9, lineHeight: 1.3 }}>
                  Corpo & Nutrição
                </div>
              </a>

              {/* CTA ÁUREA */}
              <a href="/aurea" style={{
                display: 'block',
                padding: '14px 10px',
                background: 'linear-gradient(135deg, #C9A227 0%, #D4AF37 100%)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(201, 162, 39, 0.25)'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>ÁUREA</div>
                <div style={{ fontSize: '10px', opacity: 0.9, lineHeight: 1.3 }}>
                  Valor Próprio
                </div>
              </a>
            </div>

            {/* Login para clientes existentes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
              <a href="/vitalis/login" style={{
                padding: '10px',
                color: '#7C8B6F',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '11px'
              }}>
                Vitalis → <span style={{ fontWeight: 'bold' }}>Entrar</span>
              </a>
              <a href="/aurea/login" style={{
                padding: '10px',
                color: '#B8941F',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '11px'
              }}>
                Áurea → <span style={{ fontWeight: 'bold' }}>Entrar</span>
              </a>
            </div>
          </div>

          {/* Upsell contextual - só aparece para quem não tem Vitalis/Aurea */}
          {!upsellDismissed && !vitalisAccess && !aureaAccess && padrao && (
            <UpsellCard padrao={padrao} onDismiss={() => setUpsellDismissed(true)} />
          )}

          {/* Assinatura e botão dentro do container para evitar sobreposição */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#6B6B9D', letterSpacing: '1px' }}>
              LUMINA · Sete Ecos<br />
              <span style={{ fontSize: '10px' }}>© Vivianne dos Santos</span>
            </div>

            <button className="close-button" onClick={saveAndRestart} style={{
              marginTop: '20px',
              padding: '14px 35px'
            }}>
              Guardar e Fechar
            </button>
          </div>
        </div>
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
