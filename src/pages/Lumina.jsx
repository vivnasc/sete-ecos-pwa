// ============================================================
// LUMINA v16 - Revamp Completo (Design + Funcionalidade)
// Sete Ecos © Vivianne dos Santos
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
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
import AudioPlayerBar from '../components/shared/AudioPlayerBar';

// Mapeamento padrão Lumina → slug de áudio no Supabase Storage
const LUMINA_AUDIO_SLUGS = {
  crit_vid: '01-lumina-crit-vid',
  crit_pfm: '02-lumina-crit-pfm',
  crit_tba: '03-lumina-crit-tba',
  forcaMax: '04-lumina-forca-max',
  presencaRara: '05-lumina-presenca-rara',
  esgotamento: '06-lumina-esgotamento',
  dissociacao: '07-lumina-dissociacao',
  passadoComanda: '08-lumina-passado-comanda',
  falsaClareza: '09-lumina-falsa-clareza',
  fugaFrente: '10-lumina-fuga-frente',
  menteSabota: '11-lumina-mente-sabota',
  corpoGrita: '12-lumina-corpo-grita',
  futuroRouba: '13-lumina-futuro-rouba',
  recolhimento: '14-lumina-recolhimento',
  vazioFertil: '15-lumina-vazio-fertil',
  silencioCura: '16-lumina-silencio-cura',
  alinhamento: '17-lumina-alinhamento',
  aberturaSemDirecao: '18-lumina-abertura-sem-direcao',
  corpoLidera: '19-lumina-corpo-lidera',
  futuroConvite: '20-lumina-futuro-convite',
  neutralidade: '21-lumina-neutralidade',
  transicao: '22-lumina-transicao',
  diaSemNome: '23-lumina-dia-sem-nome',
  aurea_corpoTenso: '24-lumina-aurea-corpo-tenso',
  aurea_energiaBaixa: '25-lumina-aurea-energia-baixa',
  aurea_espelhoInvisivel: '26-lumina-aurea-espelho-invisivel',
  aurea_isolado: '27-lumina-aurea-isolado',
  serena_emocaoRetida: '28-lumina-serena-emocao-retida',
  serena_cicloPesa: '29-lumina-serena-ciclo-pesa',
  ignis_paralisiaEscolha: '30-lumina-ignis-paralisia-escolha',
  ventis_burnoutSilencioso: '31-lumina-ventis-burnout-silencioso',
  ecoa_vozPresa: '32-lumina-ecoa-voz-presa',
  imago_mascaraCansa: '33-lumina-imago-mascara-cansa',
  imago_espelhoDistorcido: '34-lumina-imago-espelho-distorcido',
  ansiedadeActiva: '35-lumina-ansiedade-activa',
  sobrevivente: '36-lumina-sobrevivente',
  sonhadoraPresa: '37-lumina-sonhadora-presa',
  supressao: '38-lumina-supressao',
  fazerSemVer: '39-lumina-fazer-sem-ver',
  hipervigilancia: '40-lumina-hipervigilancia',
  lutoSilencioso: '41-lumina-luto-silencioso',
  casuloCura: '42-lumina-casulo-cura',
  despertar: '43-lumina-despertar',
  comparacao: '44-lumina-comparacao',
};
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
    explicacao: 'Como te tens tratado ultimamente?',
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

  // Share state
  const [copied, setCopied] = useState(false);
  
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
  // PARTILHA E EMAIL
  // ============================================================

  const shareText = useCallback(() => {
    if (!leitura) return '';
    return t('lumina.share.text').replace('{reading}', leitura);
  }, [leitura, t]);

  function handleShareWhatsApp() {
    const text = shareText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  async function handleCopyReading() {
    try {
      await navigator.clipboard.writeText(shareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = shareText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleEmailCapture() {
    if (!captureEmail.includes('@')) return;
    setCaptureLoading(true);
    try {
      // 1. Inserir na waitlist
      await supabase.from('waitlist').insert({
        nome: profile?.nome || '',
        email: captureEmail.trim(),
        whatsapp: null,
        produto: 'lumina-checkin'
      });

      // 2. Enviar email com a leitura REAL (a promessa cumprida!)
      try {
        await fetch('/api/enviar-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'lumina-leitura',
            destinatario: captureEmail.trim(),
            dados: {
              nome: profile?.nome || null,
              leitura: leitura,
              padrao: padrao,
              respostas: respostas,
              ecoRecomendado: ecoRecomendado
            }
          })
        });
      } catch {
        // Email falhou mas waitlist foi inserida — não bloquear
      }

      // 3. Notificar coach (fire-and-forget)
      WhatsAppAlertas.novoLeadWaitlist(
        profile?.nome || '', captureEmail.trim(), 'lumina-checkin'
      ).catch(() => {});
    } catch {
      // Duplicado ou erro, ignorar silenciosamente
    }
    setCaptureSubmitted(true);
    setCaptureLoading(false);
  }

  // Score map para visualização das dimensões
  const SCORE_MAP = {
    vazia: 1, baixa: 2, normal: 3, boa: 4, cheia: 5,
    pesado: 1, tenso: 2, solto: 4, leve: 5,
    caotica: 1, barulhenta: 2, calma: 4, silenciosa: 5,
    preso: 1, apesar: 2, arrumado: 4,
    esconder: 1, parar: 2, nada: 3, decidir: 4, agir: 5,
    escuro: 1, luminoso: 5, claro: 4,
    invisivel: 1, apagada: 2, visivel: 4, luminosa: 5,
    esquecida: 1, 'por ultimo': 2, presente: 4, prioritaria: 5
  };
  const toScore = (val) => SCORE_MAP[val] || 3;

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
          historico.slice(0, 10).map((entry, i) => {
            const DIM_COLORS = { energia: '#C1634A', corpo: '#7C8B6F', mente: '#4A90A4', espelho: '#8B7BA5', cuidado: '#4B0082' };
            return (
              <div key={i} className="history-item">
                <div className="history-date">
                  {new Date(entry.created_at).toLocaleDateString(dateLocale)}
                  {entry.dia_ciclo && ` · ${t('lumina.history.cycle_day', { day: entry.dia_ciclo })}`}
                </div>
                <div className="history-tags">
                  {['energia', 'corpo', 'mente', 'espelho', 'cuidado'].map(dim => entry[dim] && (
                    <span key={dim} className="history-tag" style={{
                      borderLeft: `2px solid ${DIM_COLORS[dim]}`,
                      paddingLeft: '8px'
                    }}>
                      {locale === 'pt' ? entry[dim] : t(`lumina.opt.${entry[dim]}`)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
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

        <button className="splash-tap" onClick={handleSplashTap} aria-label={t('lumina.enter')}>
          {t('lumina.enter')}
        </button>

        <button className="splash-history" onClick={showHistory} aria-label={t('lumina.history_link_simple')}>
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
      <div className={`screen pause-screen ${screen === 'pause' ? 'active' : ''}`} role="status" aria-live="polite">
        <img src="/logos/lumina-logo_v2.png" alt="" className="pause-eye" aria-hidden="true" />
        <p className="pause-text">{t('lumina.pause')}</p>
      </div>
    );
  }

  // ============================================================
  // RENDER - LEITURA (v16 — Revamp Completo)
  // ============================================================

  function renderReading() {
    // Os 7 Ecos - LUMINA NÃO É UM ECO, ela observa e guia
    const SETE_ECOS = [
      { nome: 'Vitalis', foco: t('lumina.ecos.vitalis_focus'), cor: '#7C8B6F', emoji: '🌿', link: '/vitalis' },
      { nome: 'Áurea', foco: t('lumina.ecos.aurea_focus'), cor: '#C9A227', emoji: '✧', link: '/aurea' },
      { nome: 'Serena', foco: t('lumina.ecos.serena_focus'), cor: '#6B8E9B', emoji: '💧', link: '/serena' },
      { nome: 'Ignis', foco: t('lumina.ecos.ignis_focus'), cor: '#C1634A', emoji: '🔥', link: '/ignis' },
      { nome: 'Ventis', foco: t('lumina.ecos.ventis_focus'), cor: '#5D9B84', emoji: '🍃', link: '/ventis' },
      { nome: 'Ecoa', foco: t('lumina.ecos.ecoa_focus'), cor: '#4A90A4', emoji: '🔊', link: '/ecoa' },
      { nome: 'Imago', foco: t('lumina.ecos.imago_focus'), cor: '#8B7BA5', emoji: '⭐', link: '/imago' }
    ];

    // Informação do ciclo para mostrar
    const cicloInfo = faseCiclo?.phase ? CICLO_ECO_MAP[faseCiclo.phase] : null;

    // Cor índigo da Lumina
    const INDIGO = '#4B0082';
    const INDIGO_LIGHT = 'rgba(75, 0, 130, 0.08)';

    // Dimensões com scores visuais
    const dimensoes = [
      { id: 'corpo', label: t('lumina.dims.corpo'), cor: '#C1634A' },
      { id: 'passado', label: t('lumina.dims.passado'), cor: '#6B8E9B' },
      { id: 'impulso', label: t('lumina.dims.impulso'), cor: '#C9A227' },
      { id: 'futuro', label: t('lumina.dims.futuro'), cor: '#5D9B84' },
      { id: 'mente', label: t('lumina.dims.mente'), cor: '#4A90A4' },
      { id: 'energia', label: t('lumina.dims.energia'), cor: '#C1634A' },
      { id: 'espelho', label: t('lumina.dims.espelho'), cor: '#8B7BA5' },
      { id: 'cuidado', label: t('lumina.dims.cuidado'), cor: '#4B0082' }
    ];

    // Calcular scores para upsell
    const vals = Object.values(respostas || {});
    const media = vals.length > 0 ? vals.reduce((sum, v) => sum + toScore(v), 0) / vals.length : 3;
    const corpoScore = toScore(respostas?.corpo);
    const espelhoScore = toScore(respostas?.espelho);
    const cuidadoScore = toScore(respostas?.cuidado);
    const needsAurea = espelhoScore <= 2 || cuidadoScore <= 2;
    const eco = needsAurea ? 'aurea' : 'vitalis';
    const ecoNome = needsAurea ? 'ÁUREA' : 'VITALIS';
    const ecoMsg = needsAurea
      ? t('lumina.reading.aurea_upsell')
      : t('lumina.reading.vitalis_upsell');
    const ecoCor = needsAurea ? '#C9A227' : '#7C8B6F';

    return (
      <div className={`screen ${screen === 'reading' ? 'active' : ''}`} style={{ overflowY: 'auto', paddingBottom: '100px' }}>
        <div className="logo-small">{t('lumina.reading.title')}</div>

        {diasCount > 0 && (
          <div className="days-badge">{t('lumina.reading.days_with_you', { count: diasCount })}</div>
        )}

        <div className="reading-container" style={{ maxWidth: '380px' }}>
          {/* ═══ LEITURA PRINCIPAL ═══ */}
          <div style={{
            background: 'linear-gradient(135deg, #F8F8FC 0%, #F2F0FA 100%)',
            borderRadius: '20px',
            padding: '28px 22px',
            borderLeft: '4px solid #4B0082',
            boxShadow: '0 4px 30px rgba(75, 0, 130, 0.06)'
          }}>
            <p className="reading-text" style={{
              fontSize: '17px',
              lineHeight: 1.9,
              fontStyle: 'italic',
              wordBreak: 'break-word',
              hyphens: 'auto',
              margin: 0
            }}>
              &ldquo;{leitura}&rdquo;
            </p>
          </div>

          {/* ═══ ÁUDIO ═══ */}
          {padrao && LUMINA_AUDIO_SLUGS[padrao] && (
            <div style={{ marginTop: '16px' }}>
              <AudioPlayerBar
                eco="lumina"
                slug={LUMINA_AUDIO_SLUGS[padrao]}
                accentColor="#4B0082"
                titulo={t('lumina.reading.listen_reading')}
              />
            </div>
          )}

          {/* ═══ PARTILHA ═══ */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '16px'
          }}>
            <button
              onClick={handleShareWhatsApp}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '20px',
                background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.2)',
                color: '#128C7E', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              aria-label={t('lumina.share.whatsapp')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              {t('lumina.share.whatsapp')}
            </button>
            <button
              onClick={handleCopyReading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '20px',
                background: copied ? 'rgba(16, 185, 129, 0.1)' : INDIGO_LIGHT,
                border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(75, 0, 130, 0.15)'}`,
                color: copied ? '#059669' : '#4B0082', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              aria-label={t('lumina.share.copy')}
            >
              {copied ? '✓' : '📋'} {copied ? t('lumina.share.copied') : t('lumina.share.copy')}
            </button>
          </div>

          {/* ═══ MAPA DAS 8 DIMENSÕES ═══ */}
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid rgba(26, 26, 78, 0.06)',
            boxShadow: '0 2px 16px rgba(26, 26, 78, 0.04)'
          }}>
            <div style={{
              fontSize: '10px', letterSpacing: '2px', color: '#6B6B9D',
              marginBottom: '14px', textAlign: 'center'
            }}>
              {t('lumina.dims.title')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {dimensoes.map(dim => {
                const score = toScore(respostas[dim.id]);
                const pct = (score / 5) * 100;
                return (
                  <div key={dim.id} style={{ padding: '6px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#3A3A6F' }}>{dim.label}</span>
                      <span style={{ fontSize: '10px', color: '#6B6B9D' }}>
                        {locale === 'pt' ? opcaoLabel(respostas[dim.id], genero || profile?.genero) : t(`lumina.opt.${respostas[dim.id]}`)}
                      </span>
                    </div>
                    <div style={{
                      height: '4px', borderRadius: '2px',
                      background: 'rgba(26, 26, 78, 0.06)', overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        borderRadius: '2px',
                        background: score <= 2 ? '#E74C3C' : score === 3 ? '#F39C12' : dim.cor,
                        transition: 'width 0.8s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══ CONTEXTO DO CICLO ═══ */}
          {cicloInfo && (
            <div style={{
              background: INDIGO_LIGHT,
              padding: '18px',
              borderRadius: '14px',
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

          {/* ═══ INSIGHTS PERSONALIZADOS ═══ */}
          {insightsPersonalizados && insightsPersonalizados.length > 0 && (
            <div style={{
              background: INDIGO_LIGHT,
              padding: '18px',
              borderRadius: '14px',
              marginTop: '16px',
              borderLeft: `4px solid ${INDIGO}`
            }}>
              <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#5A5A8F', marginBottom: '12px' }}>
                {t('lumina.reading.learned')}
              </div>
              {insightsPersonalizados.map((insight, i) => (
                <div key={i} style={{
                  fontSize: '13px',
                  lineHeight: 1.5,
                  marginBottom: i < insightsPersonalizados.length - 1 ? '10px' : 0,
                  padding: '10px 12px',
                  background: insight.tipo === 'atencao' ? 'rgba(255, 193, 7, 0.12)' : 'rgba(75, 0, 130, 0.05)',
                  borderRadius: '10px'
                }}>
                  <span style={{ marginRight: '8px', fontWeight: 'bold' }}>
                    {insight.tipo === 'atencao' ? '⚠' : '·'}
                  </span>
                  {insight.msg}
                </div>
              ))}
            </div>
          )}

          {/* ═══ RECOMENDAÇÃO ECO (ciclo ou genérica) ═══ */}
          {recomendacaoCiclo && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: recomendacaoCiclo.eco === 'Áurea'
                ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.12) 0%, rgba(212, 175, 55, 0.06) 100%)'
                : recomendacaoCiclo.eco === 'Vitalis' ? 'rgba(124, 139, 111, 0.08)' : INDIGO_LIGHT,
              borderRadius: '14px',
              borderLeft: `4px solid ${
                recomendacaoCiclo.eco === 'Áurea' ? '#C9A227'
                : recomendacaoCiclo.eco === 'Vitalis' ? '#7C8B6F' : INDIGO
              }`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '18px' }}>
                  {recomendacaoCiclo.eco === 'Áurea' ? '✧' : recomendacaoCiclo.lua}
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {t('lumina.reading.eco_for_phase', { eco: recomendacaoCiclo.eco })}
                </span>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '8px' }}>
                {recomendacaoCiclo.razao}
              </div>
              <div style={{ fontSize: '12px', color: '#3A3A6F', fontStyle: 'italic' }}>
                {recomendacaoCiclo.contextoCiclo}
              </div>
              {recomendacaoCiclo.disponivel && recomendacaoCiclo.link && (
                <a href={recomendacaoCiclo.link} style={{
                  display: 'inline-block',
                  marginTop: '14px',
                  padding: '11px 22px',
                  background: recomendacaoCiclo.eco === 'Áurea'
                    ? 'linear-gradient(135deg, #C9A227 0%, #D4AF37 100%)'
                    : recomendacaoCiclo.eco === 'Vitalis' ? '#7C8B6F' : INDIGO,
                  color: 'white',
                  borderRadius: '22px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  {t('lumina.reading.explore_eco', { eco: recomendacaoCiclo.eco })}
                </a>
              )}
            </div>
          )}

          {/* Fallback Eco Recomendado (sem ciclo) */}
          {!recomendacaoCiclo && ecoRecomendado && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              background: ecoRecomendado.eco === 'Áurea'
                ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.12) 0%, rgba(212, 175, 55, 0.06) 100%)'
                : ecoRecomendado.eco === 'Vitalis' ? 'rgba(124, 139, 111, 0.08)' : INDIGO_LIGHT,
              borderRadius: '14px',
              borderLeft: `4px solid ${
                ecoRecomendado.eco === 'Áurea' ? '#C9A227'
                : ecoRecomendado.eco === 'Vitalis' ? '#7C8B6F' : INDIGO
              }`
            }}>
              <div style={{
                fontWeight: 'bold', marginBottom: '8px', fontSize: '14px',
                textAlign: ecoRecomendado.eco === 'Áurea' ? 'center' : 'left'
              }}>
                {ecoRecomendado.eco === 'Áurea' ? t('lumina.reading.needs_aurea') : t('lumina.reading.suggestion', { eco: ecoRecomendado.eco })}
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.6, textAlign: ecoRecomendado.eco === 'Áurea' ? 'center' : 'left' }}>
                {ecoRecomendado.eco === 'Áurea' ? t('lumina.reading.aurea_desc') : ecoRecomendado.msg}
              </div>
              {ecoRecomendado.disponivel && ecoRecomendado.link ? (
                <a href={ecoRecomendado.link} style={{
                  display: 'block', marginTop: '14px', padding: '12px 24px',
                  background: ecoRecomendado.eco === 'Áurea'
                    ? 'linear-gradient(135deg, #C9A227 0%, #D4AF37 100%)'
                    : ecoRecomendado.eco === 'Vitalis' ? '#7C8B6F' : INDIGO,
                  color: 'white', borderRadius: '25px', textDecoration: 'none',
                  fontSize: '14px', fontWeight: 'bold', textAlign: 'center'
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

          {/* ═══ PADRÃO SEMANAL ═══ */}
          {padraoSemanal && (
            <div className="pattern-alert" style={{ marginTop: '16px' }}>
              <div className="pattern-alert-title">{t('lumina.reading.pattern_detected')}</div>
              <div className="pattern-alert-text">{padraoSemanal.message}</div>
            </div>
          )}

          {/* ═══ TENDÊNCIAS MENSAIS ═══ */}
          {tendenciasMensais && tendenciasMensais.insights.length > 0 && (
            <div style={{
              background: INDIGO_LIGHT, padding: '16px', borderRadius: '12px',
              marginTop: '16px', borderLeft: `3px solid ${INDIGO}`
            }}>
              <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#5A5A8F', marginBottom: '10px' }}>
                {t('lumina.reading.monthly_trend')}
              </div>
              {tendenciasMensais.insights.map((insight, i) => (
                <div key={i} style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: i < tendenciasMensais.insights.length - 1 ? '6px' : 0 }}>
                  {insight}
                </div>
              ))}
            </div>
          )}

          {/* ═══ PONTE CONTEXTUAL: LUMINA → ECO ═══ */}
          <div style={{
            marginTop: '24px',
            padding: '22px 20px',
            background: needsAurea
              ? 'linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(212, 175, 55, 0.04) 100%)'
              : 'linear-gradient(135deg, rgba(124, 139, 111, 0.1) 0%, rgba(156, 175, 136, 0.04) 100%)',
            borderRadius: '16px',
            border: `1px solid ${ecoCor}25`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#6B6B9D', marginBottom: '10px' }}>
              {t('lumina.reading.next_step')}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: ecoCor, marginBottom: '10px' }}>
              {t('lumina.reading.can_help', { eco: ecoNome })}
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#3A3A6F', marginBottom: '16px' }}>
              {ecoMsg}
            </div>
            <a href={`/${eco}?utm_source=lumina&utm_medium=upsell&utm_campaign=pos-checkin`} style={{
              display: 'inline-block', padding: '13px 30px',
              background: ecoCor, color: 'white', borderRadius: '25px',
              textDecoration: 'none', fontSize: '13px', fontWeight: 'bold'
            }}>
              {t('lumina.reading.know_eco', { eco: ecoNome })}
            </a>
            <div style={{ fontSize: '11px', color: '#6B6B9D', marginTop: '10px' }}>
              {needsAurea ? t('lumina.reading.price_aurea') : t('lumina.reading.price_vitalis')}
            </div>
          </div>

          {/* ═══ CAPTURA DE EMAIL (visitantes) ═══ */}
          {!user && !captureSubmitted && (
            <div style={{
              marginTop: '24px',
              padding: '24px 20px',
              background: 'linear-gradient(135deg, rgba(75, 0, 130, 0.06) 0%, rgba(107, 91, 149, 0.03) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(75, 0, 130, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>✉</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '6px', color: '#1A1A4E' }}>
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
                  aria-label={t('lumina.email.placeholder')}
                  style={{
                    flex: 1, padding: '13px 16px', borderRadius: '12px',
                    border: '1px solid rgba(75, 0, 130, 0.15)', background: 'white',
                    fontSize: '14px', outline: 'none', fontFamily: 'inherit'
                  }}
                />
                <button
                  disabled={captureLoading || !captureEmail.includes('@')}
                  onClick={handleEmailCapture}
                  style={{
                    padding: '13px 22px', borderRadius: '12px',
                    background: captureLoading ? '#999' : '#4B0082',
                    color: 'white', border: 'none', fontWeight: 'bold',
                    fontSize: '14px', cursor: captureLoading ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap', fontFamily: 'inherit',
                    opacity: !captureEmail.includes('@') ? 0.5 : 1
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

          {/* Confirmação de captura */}
          {!user && captureSubmitted && (
            <div style={{
              marginTop: '24px', padding: '22px',
              background: 'rgba(16, 185, 129, 0.06)',
              borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.15)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669' }}>
                {t('lumina.email.thanks')}
              </div>
              <a href="/login" style={{
                display: 'inline-block', marginTop: '14px',
                padding: '11px 24px', background: '#4B0082',
                color: 'white', borderRadius: '22px',
                textDecoration: 'none', fontSize: '13px', fontWeight: 'bold'
              }}>
                {t('lumina.email.create_account')}
              </a>
            </div>
          )}

          {/* ═══ OS 7 ECOS — todos clicáveis ═══ */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#6B6B9D' }}>{t('lumina.ecos.title')}</div>
              <div style={{ fontSize: '11px', color: '#6B6B9D', marginTop: '4px' }}>
                {t('lumina.ecos.subtitle')}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {SETE_ECOS.slice(0, 4).map(ecoItem => (
                <a key={ecoItem.nome} href={ecoItem.link} style={{
                  textAlign: 'center', padding: '12px 4px',
                  background: 'white', borderRadius: '12px',
                  border: `1px solid ${ecoItem.cor}20`,
                  textDecoration: 'none', color: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 8px rgba(26, 26, 78, 0.03)'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{ecoItem.emoji}</div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: ecoItem.cor }}>{ecoItem.nome}</div>
                  <div style={{ fontSize: '9px', color: '#6B6B9D', lineHeight: 1.3, marginTop: '2px' }}>{ecoItem.foco}</div>
                </a>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
              {SETE_ECOS.slice(4).map(ecoItem => (
                <a key={ecoItem.nome} href={ecoItem.link} style={{
                  textAlign: 'center', padding: '12px 4px',
                  background: 'white', borderRadius: '12px',
                  border: `1px solid ${ecoItem.cor}20`,
                  textDecoration: 'none', color: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 8px rgba(26, 26, 78, 0.03)'
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{ecoItem.emoji}</div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: ecoItem.cor }}>{ecoItem.nome}</div>
                  <div style={{ fontSize: '9px', color: '#6B6B9D', lineHeight: 1.3, marginTop: '2px' }}>{ecoItem.foco}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Upsell contextual */}
          {!upsellDismissed && !vitalisAccess && !aureaAccess && padrao && (
            <UpsellCard padrao={padrao} onDismiss={() => setUpsellDismissed(true)} />
          )}

          {/* ═══ ASSINATURA E GUARDAR ═══ */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#6B6B9D', letterSpacing: '1px' }}>
              LUMINA · Sete Ecos<br />
              <span style={{ fontSize: '10px' }}>© Vivianne dos Santos</span>
            </div>

            <button className="close-button" onClick={saveAndRestart} style={{
              marginTop: '20px', padding: '14px 35px'
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
