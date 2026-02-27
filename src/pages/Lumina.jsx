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
import { WhatsAppAlertas } from '../lib/whatsapp';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import UpsellCard from '../components/UpsellCard';
import LanguageSelector from '../components/LanguageSelector';
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
  // i18n
  const { t, locale } = useI18n();
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
      message = t('lumina.cycle.menstrual_msg');
    } else if (day <= 13) {
      phase = 'folicular';
      message = t('lumina.cycle.folicular_msg');
    } else if (day <= 16) {
      phase = 'ovulacao';
      message = t('lumina.cycle.ovulacao_msg');
    } else {
      phase = 'lutea';
      message = t('lumina.cycle.lutea_msg');
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
    const textoLeituraOriginal = obterLeitura(padraoDetectado, locale);
    // Gender adaptation only for Portuguese (en/fr already use neutral forms)
    const textoLeitura = locale === 'pt'
      ? adaptarTextoGenero(textoLeituraOriginal, genero || profile?.genero)
      : textoLeituraOriginal;
    const recomendacao = obterRecomendacaoEco(respostas, locale);
    const padraoSem = analisarPadroesSemanais(historico, locale);

    // Insights personalizados baseados no histórico e fase do ciclo
    const faseActual = faseCiclo?.phase || null;
    const insightsPersonais = obterInsightsPersonalizados(historico, faseActual, locale);
    const recCiclo = obterRecomendacaoCicloEco(respostas, faseActual, historico, locale);
    const tendencias = analisarTendenciasMensais(historico, locale);

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

      // Notificar coach sobre novo diagnóstico (fire-and-forget)
      WhatsAppAlertas.diagnosticoLumina(
        profile?.nome || 'Utilizador',
        padrao
      ).catch(() => {});

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
      alert(t('lumina.onboarding.name_required'));
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
    const weeklyInsights = obterInsightsSemanais(historico, locale);
    const patterns14 = analisarPadroesPeriodo(historico, 14);
    const patterns30 = analisarPadroesPeriodo(historico, 30);
    const dateLocale = locale === 'fr' ? 'fr-FR' : locale === 'en' ? 'en-GB' : 'pt-PT';

    return (
      <div className="history-container">
        <h2 className="history-title">{t('lumina.history.title')}</h2>

        {weeklyInsights && weeklyInsights.length > 0 && (
          <div className="weekly-summary">
            <div className="weekly-title">{t('lumina.history.this_week')}</div>
            {weeklyInsights.map((insight, i) => (
              <div key={i} className="weekly-insight">{insight}</div>
            ))}
          </div>
        )}

        {historico.length === 0 ? (
          <div className="history-empty">
            {t('lumina.history.empty').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <><br /><br /></>}</span>
            ))}
          </div>
        ) : (
          historico.slice(0, 10).map((entry, i) => (
            <div key={i} className="history-item">
              <div className="history-date">
                {new Date(entry.created_at).toLocaleDateString(dateLocale)}
                {entry.dia_ciclo && ` · ${t('lumina.history.cycle_day', { day: entry.dia_ciclo })}`}
              </div>
              <div className="history-tags">
                <span className="history-tag">{locale === 'pt' ? entry.energia : t(`lumina.opt.${entry.energia}`)}</span>
                <span className="history-tag">{locale === 'pt' ? entry.corpo : t(`lumina.opt.${entry.corpo}`)}</span>
                <span className="history-tag">{locale === 'pt' ? entry.mente : t(`lumina.opt.${entry.mente}`)}</span>
              </div>
            </div>
          ))
        )}

        {patterns14 && (
          <div className="patterns-section">
            <div className="patterns-title">{t('lumina.history.last_14')}</div>
            {renderPatternItems(patterns14, 3)}
          </div>
        )}

        {patterns30 && (
          <div className="patterns-section">
            <div className="patterns-title">{t('lumina.history.last_30')}</div>
            {renderPatternItems(patterns30, 7)}
          </div>
        )}

        <button className="back-btn" onClick={() => setScreen('splash')}>
          {t('lumina.history.back')}
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
          <div className="pattern-stat">{t('lumina.pattern.low_energy', { count: counts.energiaBaixa })}</div>
          <div className="pattern-insight">
            {threshold >= 7
              ? t('lumina.pattern.low_energy_long')
              : t('lumina.pattern.low_energy_short')}
          </div>
        </div>
      );
    }

    if (counts.corpoFechado >= threshold) {
      items.push(
        <div key="corpo" className="pattern-item">
          <div className="pattern-stat">{t('lumina.pattern.closed_body', { count: counts.corpoFechado })}</div>
          <div className="pattern-insight">
            {threshold >= 7
              ? t('lumina.pattern.closed_body_long')
              : t('lumina.pattern.closed_body_short')}
          </div>
        </div>
      );
    }

    if (counts.menteRuidosa >= threshold) {
      items.push(
        <div key="mente" className="pattern-item">
          <div className="pattern-stat">{t('lumina.pattern.noisy_mind', { count: counts.menteRuidosa })}</div>
          <div className="pattern-insight">
            {threshold >= 7
              ? t('lumina.pattern.noisy_mind_long')
              : t('lumina.pattern.noisy_mind_short')}
          </div>
        </div>
      );
    }

    if (items.length === 0) {
      items.push(
        <div key="none" className="pattern-item">
          <div className="pattern-insight">
            {threshold >= 7
              ? t('lumina.pattern.none_long')
              : t('lumina.pattern.none_short')}
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
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          <LanguageSelector size="sm" />
        </div>
        <img src="/logos/lumina-logo_v2.png" alt="LUMINA" className="splash-eye" style={{
          width: '120px',
          height: '120px',
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 30px rgba(75, 0, 130, 0.25))'
        }} />

        <div className="splash-title">LUMINA</div>
        <div className="splash-subtitle">
          {t('lumina.subtitle')}
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
          {t('lumina.quote').split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br/>}</span>
          ))}
        </div>

        <button className="splash-tap" onClick={handleSplashTap}>
          {t('lumina.enter')}
        </button>

        <button className="splash-history" onClick={showHistory}>
          {t('lumina.history_link_simple')} ({diasCount} {diasCount === 1 ? t('lumina.day') : t('lumina.days')})
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
        <div className="onboarding-title">{bemVindo(genero)} {locale === 'fr' ? 'à' : locale === 'en' ? 'to' : 'à'} LUMINA</div>
        <div className="onboarding-subtitle">{t('lumina.onboarding.subtitle')}</div>

        <div className="form-group">
          <label className="form-label">{t('lumina.onboarding.name_label')}</label>
          <input
            type="text"
            className="form-input"
            placeholder={t('lumina.onboarding.name_placeholder')}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('lumina.onboarding.gender_label')}</label>
          <p style={{ fontSize: '12px', color: '#5A5A8F', marginBottom: '12px', lineHeight: 1.4 }}>
            {t('lumina.onboarding.gender_help')}
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
            <label className="form-label">{t('lumina.onboarding.cycle_label')}</label>
            <p style={{ fontSize: '12px', color: '#5A5A8F', marginBottom: '12px', lineHeight: 1.4 }}>
              {t('lumina.onboarding.cycle_help')}
            </p>
            <div className="radio-group">
              <div
                className={`radio-option ${tracksCycle === 'sim' ? 'selected' : ''}`}
                onClick={() => setTracksCycle('sim')}
              >
                {t('lumina.onboarding.cycle_yes')}
              </div>
              <div
                className={`radio-option ${tracksCycle === 'nao' ? 'selected' : ''}`}
                onClick={() => setTracksCycle('nao')}
              >
                {t('lumina.onboarding.cycle_no')}
              </div>
              <div
                className={`radio-option ${tracksCycle === 'menopausa' ? 'selected' : ''}`}
                onClick={() => setTracksCycle('menopausa')}
              >
                {t('lumina.onboarding.cycle_na')}
              </div>
            </div>
          </div>
        )}

        <div className={`cycle-section ${tracksCycle === 'sim' ? 'visible' : ''}`}>
          <div className="form-group">
            <label className="form-label">{t('lumina.onboarding.period_label')}</label>
            <p style={{ fontSize: '11px', color: '#6B6B9D', marginBottom: '8px' }}>
              {t('lumina.onboarding.period_help')}
            </p>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('lumina.onboarding.cycle_length_label')}</label>
            <p style={{ fontSize: '11px', color: '#6B6B9D', marginBottom: '8px' }}>
              {t('lumina.onboarding.cycle_length_help')}
            </p>
            <div className="slider-value">
              <span style={{ fontSize: '24px' }}>{cycleLength}</span> <span>{t('lumina.days')}</span>
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
          {t('lumina.onboarding.start')}
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
        menstrual: { emoji: '🌑', nome: t('lumina.cycle.menstrual'), desc: t('lumina.cycle.menstrual_desc') },
        folicular: { emoji: '🌒', nome: t('lumina.cycle.folicular'), desc: t('lumina.cycle.folicular_desc') },
        ovulacao: { emoji: '🌕', nome: t('lumina.cycle.ovulacao'), desc: t('lumina.cycle.ovulacao_desc') },
        lutea: { emoji: '🌘', nome: t('lumina.cycle.lutea'), desc: t('lumina.cycle.lutea_desc') }
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
          {t('lumina.intro.before_acting')}<br />
          <em style={{ fontSize: '22px' }}>{t('lumina.intro.see_yourself')}</em>.<br /><br />
          <span style={{ color: '#3A3A6F', fontSize: '15px' }}>
            {t('lumina.intro.questions_desc')}<br />
            {t('lumina.intro.reading_desc')}
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
              {t('lumina.reading.cycle_day', { day: faseCiclo.day, phase: cycleDesc.nome })}
            </div>
            <div style={{ fontSize: '13px', color: '#3A3A6F' }}>{cycleDesc.desc}</div>
          </div>
        )}

        <button className="start-button" onClick={startJourney} style={{ marginTop: '24px' }}>
          {t('lumina.intro.start_reading')}
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
            {(() => {
              const titulo = t(`lumina.q.${pergunta.id}.title`);
              return <><span className="i">{titulo[0]}</span>{titulo.slice(1)}</>;
            })()}
          </p>
          <p className="question-explanation">
            {locale === 'pt'
              ? explicacaoAdaptada(pergunta.id, pergunta.explicacao, userGenero)
              : t(`lumina.q.${pergunta.id}.explain`)
            }
          </p>
        </div>

        <div className="options">
          <div className="options-row">
            {negativos.map(opcao => (
              <button
                key={opcao.valor}
                className="option"
                onClick={() => handleAnswer(pergunta.id, opcao.valor)}
              >
                {locale === 'pt' ? opcaoLabel(opcao.valor, userGenero) : t(`lumina.opt.${opcao.valor}`)}
              </button>
            ))}
          </div>

          <div className="options-row">
            {neutro && (
              <button
                className="option"
                onClick={() => handleAnswer(pergunta.id, neutro.valor)}
              >
                {locale === 'pt' ? opcaoLabel(neutro.valor, userGenero) : t(`lumina.opt.${neutro.valor}`)}
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
                {locale === 'pt' ? opcaoLabel(opcao.valor, userGenero) : t(`lumina.opt.${opcao.valor}`)}
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
        <p className="pause-text">{t('lumina.pause')}</p>
      </div>
    );
  }

  // ============================================================
  // RENDER - LEITURA
  // ============================================================
  
  function renderReading() {
    // Os 7 Ecos - LUMINA NÃO É UM ECO, ela observa e guia
    const SETE_ECOS = [
      { nome: 'Vitalis', foco: t('lumina.ecos.vitalis_focus'), cor: '#7C8B6F', disponivel: true, link: '/vitalis' },
      { nome: 'Áurea', foco: t('lumina.ecos.aurea_focus'), cor: '#C9A227', disponivel: true, link: '/aurea' },
      { nome: 'Serena', foco: t('lumina.ecos.serena_focus'), cor: '#6B8E9B', disponivel: true, link: '/serena' },
      { nome: 'Ignis', foco: t('lumina.ecos.ignis_focus'), cor: '#C1634A', disponivel: true, link: '/ignis' },
      { nome: 'Ventis', foco: t('lumina.ecos.ventis_focus'), cor: '#5D9B84', disponivel: true, link: '/ventis' },
      { nome: 'Ecoa', foco: t('lumina.ecos.ecoa_focus'), cor: '#4A90A4', disponivel: true, link: '/ecoa' },
      { nome: 'Imago', foco: t('lumina.ecos.imago_focus'), cor: '#8B7BA5', disponivel: true, link: '/imago' }
    ];

    // Informação do ciclo para mostrar
    const cicloInfo = faseCiclo?.phase ? CICLO_ECO_MAP[faseCiclo.phase] : null;

    // Cor índigo da Lumina
    const INDIGO = '#4B0082';
    const INDIGO_LIGHT = 'rgba(75, 0, 130, 0.1)';

    return (
      <div className={`screen ${screen === 'reading' ? 'active' : ''}`} style={{ overflowY: 'auto', paddingBottom: '100px' }}>
        <div className="logo-small">{t('lumina.reading.title')}</div>

        {diasCount > 0 && (
          <div className="days-badge">{t('lumina.reading.days_with_you', { count: diasCount })}</div>
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
                    {t('lumina.reading.cycle_day', { day: faseCiclo.day, phase: t('lumina.cycle.' + faseCiclo.phase) })}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5A5A8F' }}>
                    {t('lumina.reading.cycle_days', { range: cicloInfo.dias, energy: t('lumina.cycle.energy.' + faseCiclo.phase) })}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '10px' }}>
                {t('lumina.cycle.' + faseCiclo.phase + '_msg')}
              </div>
              <div style={{ fontSize: '11px', color: '#6B6B9D' }}>
                {t('lumina.reading.common_states', { states: t('lumina.cycle.states.' + faseCiclo.phase) })}
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
                {t('lumina.reading.learned')}
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
                  {t('lumina.reading.eco_for_phase', { eco: recomendacaoCiclo.eco })}
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
                  {t('lumina.reading.explore_eco', { eco: recomendacaoCiclo.eco })}
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
                {ecoRecomendado.eco === 'Áurea' ? t('lumina.reading.needs_aurea') : t('lumina.reading.suggestion', { eco: ecoRecomendado.eco })}
              </div>
              <div style={{
                fontSize: '14px',
                lineHeight: 1.6,
                textAlign: ecoRecomendado.eco === 'Áurea' ? 'center' : 'left'
              }}>
                {ecoRecomendado.eco === 'Áurea'
                  ? t('lumina.reading.aurea_desc')
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
                  {t('lumina.reading.explore_eco', { eco: ecoRecomendado.eco })}
                </a>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6B6B9D', fontStyle: 'italic' }}>
                  {t('lumina.reading.coming_soon')}
                </div>
              )}
            </div>
          )}

          {/* Padrão Semanal */}
          {padraoSemanal && (
            <div className="pattern-alert" style={{ marginTop: '16px' }}>
              <div className="pattern-alert-title">{t('lumina.reading.pattern_detected')}</div>
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
                {t('lumina.reading.monthly_trend')}
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
            // Converter respostas de string para score numérico
            const SCORE_MAP = {
              // Energia
              vazia: 1, baixa: 2, normal: 3, boa: 4, cheia: 5,
              // Corpo
              pesado: 1, tenso: 2, solto: 4, leve: 5,
              // Mente
              caotica: 1, barulhenta: 2, calma: 4, silenciosa: 5,
              // Passado
              preso: 1, apesar: 2, arrumado: 4,
              // Impulso
              esconder: 1, parar: 2, nada: 3, decidir: 4, agir: 5,
              // Futuro
              escuro: 1, luminoso: 5, claro: 4,
              // Espelho
              invisivel: 1, apagada: 2, visivel: 4, luminosa: 5,
              // Cuidado
              esquecida: 1, 'por ultimo': 2, presente: 4, prioritaria: 5
            };
            const toScore = (val) => SCORE_MAP[val] || 3;
            const vals = Object.values(respostas || {});
            const media = vals.length > 0 ? vals.reduce((sum, v) => sum + toScore(v), 0) / vals.length : 3;
            const corpoScore = toScore(respostas?.corpo) || toScore(respostas?.energia) || 3;
            const espelhoScore = toScore(respostas?.espelho) || 3;
            const cuidadoScore = toScore(respostas?.cuidado) || 3;
            const needsVitalis = corpoScore <= 2 || media <= 2.5;
            const needsAurea = espelhoScore <= 2 || cuidadoScore <= 2;
            const eco = needsAurea ? 'aurea' : 'vitalis';
            const ecoNome = needsAurea ? 'ÁUREA' : 'VITALIS';
            const ecoMsg = needsAurea
              ? t('lumina.reading.aurea_upsell')
              : t('lumina.reading.vitalis_upsell');
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
                  {t('lumina.reading.next_step')}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: ecoCor, marginBottom: '8px' }}>
                  {t('lumina.reading.can_help', { eco: ecoNome })}
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
                  {t('lumina.reading.know_eco', { eco: ecoNome })}
                </a>
                <div style={{ fontSize: '11px', color: '#6B6B9D', marginTop: '10px' }}>
                  {needsAurea ? t('lumina.reading.price_aurea') : t('lumina.reading.price_vitalis')}
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
                {t('lumina.email.title')}
              </div>
              <div style={{ fontSize: '13px', color: '#5A5A8F', marginBottom: '16px', lineHeight: 1.5 }}>
                {t('lumina.email.desc')}
              </div>
              <div style={{ display: 'flex', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
                <input
                  type="email"
                  value={captureEmail}
                  onChange={(e) => setCaptureEmail(e.target.value)}
                  placeholder={t('lumina.email.placeholder')}
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
                      // Notificar coach (fire-and-forget)
                      WhatsAppAlertas.novoLeadWaitlist(
                        profile?.nome || '', captureEmail.trim(), 'lumina-checkin'
                      ).catch(() => {});
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
                  {captureLoading ? '...' : t('lumina.email.send')}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#8888B0', marginTop: '10px' }}>
                {t('lumina.email.no_spam')}
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
                {t('lumina.email.thanks')}
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
                {t('lumina.email.create_account')}
              </a>
            </div>
          )}

          {/* Os 7 Ecos - LUMINA observa, não faz parte */}
          <div style={{ marginTop: '30px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', letterSpacing: '2px', color: '#6B6B9D' }}>{t('lumina.ecos.title')}</div>
              <div style={{ fontSize: '11px', color: '#6B6B9D', marginTop: '4px' }}>
                {t('lumina.ecos.subtitle')}
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
                  {t('lumina.ecos.vitalis_focus')}
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
                  {t('lumina.ecos.self_worth')}
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
                Vitalis → <span style={{ fontWeight: 'bold' }}>{t('lumina.ecos.login')}</span>
              </a>
              <a href="/aurea/login" style={{
                padding: '10px',
                color: '#B8941F',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '11px'
              }}>
                Áurea → <span style={{ fontWeight: 'bold' }}>{t('lumina.ecos.login')}</span>
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
              {t('lumina.save_close')}
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
