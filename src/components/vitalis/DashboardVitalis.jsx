import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link, useNavigate } from 'react-router-dom';
import { StreakDisplay, CelebracaoModal, ConquistasSection, NivelProgresso, CONQUISTAS } from './Gamificacao.jsx';
import { useOnboarding } from './OnboardingTutorial.jsx';
import { EmailTriggers } from '../../lib/emails';
import WelcomeTutorial from '../WelcomeTutorial.jsx';
import { isCoach } from '../../lib/coach';
import { g, setSexo } from '../../utils/genero';
import { isNearRamadan, setObservaRamadao, observaRamadao } from '../../utils/ramadao';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../contexts/I18nContext';
import { temPermissao, contarLembretesHoje } from '../../utils/notifications';
import { pedirPermissaoERegistar, guardarPreferencias } from '../../lib/pushSubscription';
import { checkVitalisAccess } from '../../lib/subscriptions';
import { calcularPorcoesDiarias } from '../../lib/vitalis/calcularPorcoes.js';
import { obterRegrasOuro, obterMetaAgua } from '../../lib/vitalis/regrasOuro.js';
import { obterConteudoSemanal, calcularSemanaPrograma } from '../../lib/vitalis/conteudoFase.js';
import QuickTrackers from './QuickTrackers';
import FastingTimerCard from './FastingTimerCard';
import MealsSection from './MealsSection';
import MacrosDisplay from './MacrosDisplay';
import AchievementsPanel from './AchievementsPanel';
import PaletaSelector from './PaletaSelector';
import { useDetectorDesistencia, AlertaDesistencia } from './DetectorDesistencia';
import PodcastPlayer from '../shared/PodcastPlayer';
import {
  Bell, Sun, Moon, Flame, X, Download, BookOpen, Gift, ArrowRight, Lightbulb,
  ClipboardList, CheckCircle2, UtensilsCrossed, CalendarDays, ChefHat, Ruler,
  Thermometer, Sparkles, FileText, BarChart3, Dumbbell, MessageCircle,
  Target, ShoppingCart, Wand2, CalendarRange, Camera, TrendingUp, BookHeart,
  Scale, Wind, Heart, Apple, Carrot, Salad, Soup, Coffee
} from 'lucide-react';

// Função para solicitar permissão de notificações
const solicitarPermissaoNotificacoes = async () => {
  if (!('Notification' in window)) {
    console.log('Este browser não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Função para enviar notificação
const enviarNotificacao = (titulo, opcoes = {}) => {
  if (Notification.permission === 'granted') {
    const notif = new Notification(titulo, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      ...opcoes
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return notif;
  }
};

export default function DashboardVitalis() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [client, setClient] = useState(null);
  const [plano, setPlano] = useState(null);
  const [planoPendenteRevisao, setPlanoPendenteRevisao] = useState(false);
  const [registos, setRegistos] = useState([]);
  const [refeicoes, setRefeicoes] = useState([]);
  const [mealsHoje, setMealsHoje] = useState([]);
  const [aguaHoje, setAguaHoje] = useState(0);
  const [treinoHoje, setTreinoHoje] = useState(null);
  const [sonoHoje, setSonoHoje] = useState(null);
  const [jejumActual, setJejumActual] = useState(null);
  const [humor, setHumor] = useState(null);
  const [streak, setStreak] = useState(0);
  const [melhorStreak, setMelhorStreak] = useState(0);
  const [showCelebracao, setShowCelebracao] = useState(false);
  const [conquistaActual, setConquistaActual] = useState(null);
  const [regrasExpandidas, setRegrasExpandidas] = useState(false);
  const [conquistasDesbloqueadas, setConquistasDesbloqueadas] = useState([]);
  const [xpTotal, setXpTotal] = useState(0);
  const [avatarIcon, setAvatarIcon] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vitalis-avatar') || '🌱';
    }
    return '🌱';
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const { isDark: isDarkMode, toggleTheme: toggleDarkMode } = useTheme();

  // Hook do onboarding — controla se o tutorial deve aparecer
  const { showOnboarding: mostrarOnboarding, completeOnboarding: completarOnboarding } = useOnboarding();

  // Ref para controlar se já enviamos notificação do jejum
  const notificacaoJejumEnviada = useRef(false);
  const jejumTimerRef = useRef(null);

  // Conquistas já celebradas — persistente via localStorage individual por conquista
  const getConquistasCelebradas = () => {
    const set = new Set();
    // Ler chaves individuais (mais robusto que JSON array)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('vitalis-conquista-')) {
        set.add(key.replace('vitalis-conquista-', ''));
      }
    }
    // Migrar formato antigo (JSON array) se existir
    try {
      const old = JSON.parse(localStorage.getItem('vitalis-conquistas-celebradas') || '[]');
      old.forEach(id => { set.add(id); localStorage.setItem(`vitalis-conquista-${id}`, '1'); });
      if (old.length > 0) localStorage.removeItem('vitalis-conquistas-celebradas');
    } catch { /* ignorar */ }
    try {
      const old2 = JSON.parse(localStorage.getItem('vitalis-conquistas-notificadas') || '[]');
      old2.forEach(id => { set.add(id); localStorage.setItem(`vitalis-conquista-${id}`, '1'); });
      if (old2.length > 0) localStorage.removeItem('vitalis-conquistas-notificadas');
    } catch { /* ignorar */ }
    return set;
  };
  const marcarConquistaCelebrada = (id) => {
    localStorage.setItem(`vitalis-conquista-${id}`, '1');
  };

  // Estados de sono interactivo movidos para QuickTrackers

  // Estados para PWA install e notificações
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(
    () => 'Notification' in window && Notification.permission === 'granted'
  );
  const [mostrarBannerPWA, setMostrarBannerPWA] = useState(false);

  // Estados para Trial e Intake
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [trialExpiresAt, setTrialExpiresAt] = useState(null);
  const [hasIntake, setHasIntake] = useState(false);

  // Detector de padrão de desistência
  const riskData = useDetectorDesistencia(userId, client, registos);

  const hoje = new Date().toISOString().split('T')[0];
  const [dataTracking, setDataTracking] = useState(hoje);
  const diaSemana = new Date().toLocaleDateString('pt-PT', { weekday: 'long' });
  const dataFormatada = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });

  useEffect(() => {
    loadDashboard();
  }, []);

  // Detectar se PWA está instalada e configurar eventos
  useEffect(() => {
    // Verificar se já está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    setIsPWAInstalled(isStandalone);

    // Verificar estado das notificações
    if ('Notification' in window) {
      setNotificacoesAtivas(Notification.permission === 'granted');
    }

    // Banner PWA: uma vez fechado, não volta a aparecer
    const bannerFechado = localStorage.getItem('vitalis-pwa-banner-fechado');
    if (bannerFechado) {
      setMostrarBannerPWA(false);
    } else {
      setMostrarBannerPWA(!isStandalone);
    }

    // Re-registar push subscription silenciosamente (garante que está na DB)
    // Lembretes locais são agora activados globalmente no App.jsx
    if (temPermissao()) {
      import('../../lib/pushSubscription').then(({ registarPushSubscription }) => {
        registarPushSubscription().catch(() => {});
      });
    }

    // Capturar evento de instalação PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setMostrarBannerPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Dark mode agora gerido pelo ThemeContext

  // Fasting notification effect - monitora o timer e notifica quando a janela abre
  useEffect(() => {
    if (!jejumActual || !plano?.horas_jejum) return;

    const verificarJanelaAlimentar = () => {
      const inicio = new Date(jejumActual.hora_inicio);
      const agora = new Date();
      const diffMin = Math.floor((agora - inicio) / (1000 * 60));
      const horasDecorridas = diffMin / 60;
      const horasJejumMeta = plano.horas_jejum || 16;

      // Se completou o jejum e ainda não notificamos
      if (horasDecorridas >= horasJejumMeta && !notificacaoJejumEnviada.current) {
        notificacaoJejumEnviada.current = true;

        // Enviar notificação
        enviarNotificacao('Janela Alimentar Aberta! 🎉', {
          body: `Parabéns! Completaste ${horasJejumMeta}h de jejum. Podes começar a comer agora.`,
          tag: 'jejum-completo',
          requireInteraction: true
        });

        // Guardar no localStorage que notificação foi enviada para esta sessão
        localStorage.setItem(`jejum-notif-${jejumActual.id}`, 'true');
      }
    };

    // Verificar se já enviamos notificação para este jejum
    const jaNotificou = localStorage.getItem(`jejum-notif-${jejumActual.id}`);
    if (jaNotificou) {
      notificacaoJejumEnviada.current = true;
    }

    // Verificar imediatamente
    verificarJanelaAlimentar();

    // Verificar a cada minuto
    jejumTimerRef.current = setInterval(verificarJanelaAlimentar, 60000);

    return () => {
      if (jejumTimerRef.current) {
        clearInterval(jejumTimerRef.current);
      }
    };
  }, [jejumActual, plano?.horas_jejum]);

  // Reset notification flag when fasting ends
  useEffect(() => {
    if (!jejumActual) {
      notificacaoJejumEnviada.current = false;
    }
  }, [jejumActual]);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/vitalis/login');
        return;
      }
      setUserEmail(user.email);

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('Utilizador não encontrado');
      setUserId(userData.id);
      setUserName(userData.nome || '');

      const { data: clientData, error: clientError } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle();

      // Se não tem cliente, verificar se é coach
      let activeClientData = clientData;
      if (!clientData) {
        if (isCoach(user.email)) {
          // Coach sem registo - criar registo mínimo ou usar dummy
          console.log('Coach sem registo vitalis_clients - permitindo acesso');
          activeClientData = {
            id: 'coach-temp',
            user_id: userData.id,
            subscription_status: 'tester',
            fase_actual: 'aprendizagem'
          };
          setClient(activeClientData);
        } else {
          console.log('Utilizador sem registo vitalis_clients');
          navigate('/vitalis/pagamento');
          return;
        }
      } else {
        setClient(clientData);
      }

      // Verificar status de subscrição e trial
      const accessInfo = await checkVitalisAccess(userData.id);
      setSubscriptionStatus(accessInfo.status);
      if (accessInfo.status === 'trial' && accessInfo.daysLeft) {
        setTrialDaysLeft(accessInfo.daysLeft);
        setTrialExpiresAt(accessInfo.expiresAt);
      }

      // Buscar sexo e preferências do intake para adaptar UI
      const { data: intakeData } = await supabase
        .from('vitalis_intake')
        .select('sexo, observa_ramadao, altura_cm, peso_actual, idade, janela_jejum_inicio, janela_jejum_fim')
        .eq('user_id', userData.id)
        .maybeSingle();

      // ✅ INTAKE COMPLETO = tem campos obrigatórios preenchidos
      const intakeCompleto = intakeData &&
        intakeData.altura_cm &&
        intakeData.peso_actual &&
        intakeData.idade;

      setHasIntake(intakeCompleto); // Define se tem intake COMPLETO

      if (intakeData?.sexo) setSexo(intakeData.sexo);
      if (intakeData?.observa_ramadao) setObservaRamadao(intakeData.observa_ramadao);

      // Buscar plano (pode não existir ainda)
      let planoData = null;

      // Só consultar vitalis_plano view se temos um client_id real (não 'coach-temp')
      if (activeClientData.id && activeClientData.id !== 'coach-temp') {
        const { data: planoFromView } = await supabase
          .from('vitalis_plano')
          .select('*')
          .eq('client_id', activeClientData.id)
          .maybeSingle();
        planoData = planoFromView;
      }

      // Fallback: se vitalis_plano (view) não tem dados, tentar vitalis_meal_plans
      if (!planoData) {
        const { data: mealPlan } = await supabase
          .from('vitalis_meal_plans')
          .select('*')
          .eq('user_id', userData.id)
          .eq('status', 'activo')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (mealPlan) {
          const porcoesDiarias = calcularPorcoesDiarias(mealPlan);
          // Calcular horas de jejum a partir da janela definida no intake
          let horasJejumPersonalizadas = mealPlan.abordagem === 'keto_if' ? 16 : null;
          let protocoloPersonalizado = mealPlan.abordagem === 'keto_if' ? '16_8' : null;
          if (mealPlan.abordagem === 'keto_if' && intakeData?.janela_jejum_inicio && intakeData?.janela_jejum_fim) {
            const [hi, mi] = String(intakeData.janela_jejum_inicio).split(':').map(Number);
            const [hf, mf] = String(intakeData.janela_jejum_fim).split(':').map(Number);
            let inicio = hi + (mi || 0) / 60;
            let fim = hf + (mf || 0) / 60;
            if (fim <= inicio) fim += 24;
            const janela = fim - inicio;
            horasJejumPersonalizadas = Math.round(24 - janela);
            protocoloPersonalizado = `${horasJejumPersonalizadas}_${Math.round(janela)}`;
          }
          planoData = {
            ...mealPlan,
            client_id: activeClientData.id,
            calorias_diarias: mealPlan.calorias_alvo,
            porcoes_proteina: porcoesDiarias.proteina,
            porcoes_hidratos: porcoesDiarias.hidratos,
            porcoes_gordura: porcoesDiarias.gordura,
            porcoes_legumes: porcoesDiarias.legumes,
            horas_jejum: horasJejumPersonalizadas,
            aceita_jejum: mealPlan.abordagem === 'keto_if',
            protocolo_jejum: protocoloPersonalizado,
            janela_jejum_inicio: intakeData?.janela_jejum_inicio || null,
            janela_jejum_fim: intakeData?.janela_jejum_fim || null,
            dias_treino: mealPlan.dias_treino || []
          };
        } else {
          // Check if plan exists but is pending coach review
          const { data: pendingPlan } = await supabase
            .from('vitalis_meal_plans')
            .select('id')
            .eq('user_id', userData.id)
            .eq('status', 'pendente_revisao')
            .limit(1)
            .maybeSingle();

          if (pendingPlan) {
            setPlanoPendenteRevisao(true);
          }
        }
      }
      setPlano(planoData || null);

      const { data: registosData } = await supabase
        .from('vitalis_registos')
        .select('*')
        .eq('user_id', userData.id)
        .order('data', { ascending: false })
        .limit(30);
      setRegistos(registosData || []);

      const { data: refeicoesCofig } = await supabase
        .from('vitalis_refeicoes_config')
        .select('*')
        .eq('user_id', userData.id)
        .eq('activo', true)
        .order('ordem', { ascending: true });
      setRefeicoes(refeicoesCofig || []);

      // Carregar dados do dia seleccionado (hoje ou passado)
      await carregarDadosDia(userData.id, dataTracking);

      const { data: jejumData } = await supabase
        .from('vitalis_fasting_log')
        .select('*')
        .eq('user_id', userData.id)
        .is('hora_fim', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setJejumActual(jejumData || null);

      calcularStreak(userData.id);
      calcularConquistas(userData.id, userData.nome || user.email.split('@')[0], user.email);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular conquistas desbloqueadas
  const calcularConquistas = async (userId, userName, email) => {
    try {
      // Buscar dados para verificar conquistas
      const [aguaCount, mealsCount, treinoCount, checkinCount, sonoBoasNoites, receitasVistas] = await Promise.all([
        supabase.from('vitalis_agua_log').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('vitalis_meals_log').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('vitalis_workouts_log').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('vitalis_registos').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('vitalis_sono_log').select('id', { count: 'exact' }).eq('user_id', userId).gte('duracao_min', 420),
        supabase.from('vitalis_meals_log').select('receita_id', { count: 'exact' }).eq('user_id', userId).not('receita_id', 'is', null)
      ]);

      const conquistas = [];
      let xp = 0;

      // Conquista primeiro registo
      if ((checkinCount.count || 0) >= 1) {
        conquistas.push('primeiro_registo');
        xp += CONQUISTAS.primeiro_registo?.xp || 50;
      }

      // Conquistas de streak
      const streakAtual = parseInt(localStorage.getItem('vitalis-melhor-streak') || '0');
      if (streakAtual >= 3) { conquistas.push('streak_3'); xp += 100; }
      if (streakAtual >= 7) { conquistas.push('streak_7'); xp += 200; }
      if (streakAtual >= 14) { conquistas.push('streak_14'); xp += 350; }
      if (streakAtual >= 30) { conquistas.push('streak_30'); xp += 500; }
      if (streakAtual >= 60) { conquistas.push('streak_60'); xp += CONQUISTAS.streak_60?.xp || 1000; }

      // Conquistas de check-in
      if ((checkinCount.count || 0) >= 7) { conquistas.push('checkin_7'); xp += CONQUISTAS.checkin_7?.xp || 75; }
      if ((checkinCount.count || 0) >= 30) { conquistas.push('checkin_30'); xp += CONQUISTAS.checkin_30?.xp || 200; }

      // Conquista sono perfeito (7+ noites com 7+ horas = 420min)
      if ((sonoBoasNoites.count || 0) >= 7) { conquistas.push('sono_perfeito'); xp += CONQUISTAS.sono_perfeito?.xp || 125; }

      // Conquista receitas (usou receita em pelo menos 5 refeições)
      if ((receitasVistas.count || 0) >= 5) { conquistas.push('receita_5'); xp += CONQUISTAS.receita_5?.xp || 50; }

      // Conquistas de fase (baseado na fase actual do cliente)
      const faseActual = client?.fase_actual;
      const fasesCompletadas = {
        transicao: ['fase_inducao'],
        recomposicao: ['fase_inducao', 'fase_estabilizacao'],
        manutencao: ['fase_inducao', 'fase_estabilizacao', 'fase_reeducacao']
      };
      const fasesDesbloqueadas = fasesCompletadas[faseActual] || [];
      for (const faseId of fasesDesbloqueadas) {
        conquistas.push(faseId);
        xp += CONQUISTAS[faseId]?.xp || 250;
      }

      // Conquistas de água (só conta se realmente há registos, não erros de query)
      const aguaTotal = typeof aguaCount.count === 'number' ? aguaCount.count : 0;
      const mealsTotal = typeof mealsCount.count === 'number' ? mealsCount.count : 0;
      const treinoTotal = typeof treinoCount.count === 'number' ? treinoCount.count : 0;

      if (aguaTotal >= 1) { conquistas.push('agua_1'); xp += 50; }
      if (aguaTotal >= 50) { conquistas.push('agua_50'); xp += 150; }

      // Conquistas de treino
      if (treinoTotal >= 1) { conquistas.push('treino_1'); xp += 75; }
      if (treinoTotal >= 10) { conquistas.push('treino_10'); xp += 200; }

      // Conquistas de refeições
      if (mealsTotal >= 10) { conquistas.push('refeicoes_10'); xp += 100; }
      if (mealsTotal >= 50) { conquistas.push('refeicoes_50'); xp += 250; }

      // Conquistas de peso — comparar peso actual vs peso inicial
      if (client?.peso_inicial && client?.peso_actual && client.peso_inicial > client.peso_actual) {
        const pesoPerdido = client.peso_inicial - client.peso_actual;

        if (pesoPerdido >= 1) { conquistas.push('peso_1kg'); xp += CONQUISTAS.peso_1kg?.xp || 150; }
        if (pesoPerdido >= 5) { conquistas.push('peso_5kg'); xp += CONQUISTAS.peso_5kg?.xp || 300; }
        if (pesoPerdido >= 10) { conquistas.push('peso_10kg'); xp += CONQUISTAS.peso_10kg?.xp || 500; }

        // Atingiu peso meta
        if (client.peso_meta && client.peso_actual <= client.peso_meta) {
          conquistas.push('peso_meta'); xp += CONQUISTAS.peso_meta?.xp || 1000;
        }
      }

      // Se utilizador não tem NENHUMA actividade, não celebrar nada
      // (evita "Primeira Gota" e outros popups na primeira visita)
      const temActividade = aguaTotal > 0 || mealsTotal > 0 || treinoTotal > 0 ||
        (typeof checkinCount.count === 'number' && checkinCount.count > 0);

      // Verificar novas conquistas — usar chaves individuais no localStorage
      const celebradas = getConquistasCelebradas();

      // Determinar conquistas REALMENTE novas (nunca celebradas)
      const novasConquistas = temActividade
        ? conquistas.filter(c => !celebradas.has(c))
        : [];

      // Marcar TODAS as conquistas como celebradas imediatamente (chaves individuais)
      for (const cId of conquistas) {
        marcarConquistaCelebrada(cId);
      }

      // Só mostrar celebração se é realmente nova E ainda não mostrámos nesta sessão
      const jaCelebrouNestaSessao = sessionStorage.getItem('vitalis-celebracao-sessao');
      if (novasConquistas.length > 0 && !jaCelebrouNestaSessao) {
        sessionStorage.setItem('vitalis-celebracao-sessao', '1');

        const primeiraNovaId = novasConquistas[0];
        const primeiraNovaConquista = CONQUISTAS[primeiraNovaId];
        if (primeiraNovaConquista) {
          setConquistaActual(primeiraNovaId);
          setShowCelebracao(true);
        }

        // Enviar emails para todas as novas conquistas
        if (email) {
          for (const conquistaId of novasConquistas) {
            const conquista = CONQUISTAS[conquistaId];
            if (conquista) {
              EmailTriggers.onConquista(
                { nome: userName, email: email },
                {
                  nome: conquista.nome,
                  emoji: conquista.icone,
                  mensagem: conquista.descricao,
                  xp: conquista.pontos || conquista.xp
                }
              ).catch(err => console.error('Erro ao enviar email conquista:', err));
            }
          }
        }
      }

      setConquistasDesbloqueadas(conquistas);
      setXpTotal(xp);
      localStorage.setItem('vitalis-xp', xp.toString());
    } catch (error) {
      console.error('Erro ao calcular conquistas:', error);
    }
  };

  const calcularStreak = async (userId) => {
    // Streak = dias consecutivos com pelo menos 1 registo (água, refeição, treino, sono, ou check-in)
    try {
      const hoje = new Date();
      let count = 0;

      for (let i = 0; i < 60; i++) { // Estendido para 60 dias
        const data = new Date(hoje);
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];

        // Verificar se há algum registo neste dia
        const [agua, meals, treino, sono, checkin] = await Promise.all([
          supabase.from('vitalis_agua_log').select('id').eq('user_id', userId).eq('data', dataStr).limit(1),
          supabase.from('vitalis_meals_log').select('id').eq('user_id', userId).eq('data', dataStr).limit(1),
          supabase.from('vitalis_workouts_log').select('id').eq('user_id', userId).eq('data', dataStr).limit(1),
          supabase.from('vitalis_sono_log').select('id').eq('user_id', userId).eq('data', dataStr).limit(1),
          supabase.from('vitalis_registos').select('id').eq('user_id', userId).eq('data', dataStr).limit(1)
        ]);

        const temRegisto =
          (agua.data && agua.data.length > 0) ||
          (meals.data && meals.data.length > 0) ||
          (treino.data && treino.data.length > 0) ||
          (sono.data && sono.data.length > 0) ||
          (checkin.data && checkin.data.length > 0);

        if (temRegisto) {
          count++;
        } else if (i > 0) {
          // Se não é hoje e não tem registo, quebra o streak
          break;
        }
      }

      setStreak(count);

      // Verificar melhor streak (guardar no localStorage)
      const melhor = parseInt(localStorage.getItem('vitalis-melhor-streak') || '0');
      if (count > melhor) {
        localStorage.setItem('vitalis-melhor-streak', count.toString());
        setMelhorStreak(count);

        // Verificar conquistas de streak (só se não foi já celebrada)
        const celebradas = getConquistasCelebradas();
        const streakMilestones = [3, 7, 14, 30, 60];
        for (const milestone of streakMilestones) {
          if (count >= milestone && melhor < milestone) {
            const conquistaId = `streak_${milestone}`;
            if (!celebradas.has(conquistaId)) {
              marcarConquistaCelebrada(conquistaId);
              setConquistaActual(conquistaId);
              setShowCelebracao(true);
            }
            break;
          }
        }
      } else {
        setMelhorStreak(melhor);
      }
    } catch (error) {
      console.error('Erro ao calcular streak:', error);
      setStreak(0);
    }
  };

  // Carregar dados de um dia específico (água, treino, sono, refeições)
  const carregarDadosDia = async (uid, data) => {
    const [mealsRes, aguaRes, treinoRes, sonoRes] = await Promise.all([
      supabase.from('vitalis_meals_log').select('*').eq('user_id', uid).eq('data', data),
      supabase.from('vitalis_agua_log').select('quantidade_ml').eq('user_id', uid).eq('data', data),
      supabase.from('vitalis_workouts_log').select('*').eq('user_id', uid).eq('data', data).limit(1).maybeSingle(),
      supabase.from('vitalis_sono_log').select('*').eq('user_id', uid).eq('data', data).limit(1).maybeSingle(),
    ]);
    setMealsHoje(mealsRes.data || []);
    setAguaHoje((aguaRes.data || []).reduce((sum, a) => sum + a.quantidade_ml, 0) / 1000);
    setTreinoHoje(treinoRes.data || null);
    setSonoHoje(sonoRes.data || null);
  };

  // Recarregar quando o utilizador muda a data de tracking
  useEffect(() => {
    if (userId && dataTracking) {
      carregarDadosDia(userId, dataTracking);
    }
  }, [dataTracking]);

  // FUNÇÃO ÁGUA
  const adicionarAgua = async (ml = 250) => {
    if (!userId) {
      console.error('userId não disponível');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('vitalis_agua_log')
        .insert({
          user_id: userId,
          data: dataTracking,
          quantidade_ml: ml
        });
      
      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }
      
      setAguaHoje(prev => prev + (ml / 1000));
    } catch (err) {
      console.error('Erro ao registar água:', err.message);
    }
  };

  // FUNÇÃO TREINO
  const registarTreino = async (tipo = 'geral', duracaoMin = null) => {
    if (!userId) {
      console.error('userId não disponível');
      return;
    }
    
    try {
      const agora = new Date();
      const horaFormatada = agora.toLocaleTimeString('pt-PT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const insertData = {
          user_id: userId,
          data: dataTracking,
          tipo: tipo
        };
      if (duracaoMin) insertData.duracao_min = duracaoMin;

      const { data, error } = await supabase
        .from('vitalis_workouts_log')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }
      
      setTreinoHoje({ ...data, hora: horaFormatada });
    } catch (err) {
      console.error('Erro ao registar treino:', err.message);
    }
  };

  // FUNÇÃO SONO (recebe params do QuickTrackers)
  const registarSono = async (horas, minutos, qualidade) => {
    if (!userId) {
      console.error('userId não disponível');
      return;
    }

    const duracaoMin = horas * 60 + minutos;

    // Auto-calcular qualidade baseado nas horas se não foi selecionada manualmente
    let qualidadeFinal = qualidade;
    if (qualidadeFinal === 0) {
      const h = duracaoMin / 60;
      if (h >= 7 && h <= 9) {
        qualidadeFinal = 5;
      } else if (h >= 6 && h < 7) {
        qualidadeFinal = 4;
      } else if ((h >= 5 && h < 6) || (h > 9 && h <= 10)) {
        qualidadeFinal = 3;
      } else if ((h >= 4 && h < 5) || (h > 10 && h <= 11)) {
        qualidadeFinal = 2;
      } else {
        qualidadeFinal = 1;
      }
    }

    try {
      const { data, error } = await supabase
        .from('vitalis_sono_log')
        .insert({
          user_id: userId,
          data: dataTracking,
          duracao_min: duracaoMin,
          qualidade_1a5: qualidadeFinal
        })
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }

      setSonoHoje(data);
    } catch (err) {
      console.error('Erro ao registar sono:', err.message);
    }
  };

  // FUNÇÃO INICIAR JEJUM
  const iniciarJejum = async () => {
    if (!userId) {
      console.error('userId não disponível');
      return;
    }

    // Solicitar permissão para notificações ao iniciar jejum
    await solicitarPermissaoNotificacoes();
    
    try {
      const { data, error } = await supabase
        .from('vitalis_fasting_log')
        .insert({
          user_id: userId,
          data: hoje,
          hora_inicio: new Date().toISOString(),
          protocolo: protocoloJejum
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }
      
      setJejumActual(data);
    } catch (err) {
      console.error('Erro ao iniciar jejum:', err.message);
    }
  };

  // FUNÇÃO TERMINAR JEJUM
  const terminarJejum = async () => {
    if (!jejumActual) return;
    
    try {
      const horaFim = new Date();
      const horaInicio = new Date(jejumActual.hora_inicio);
      const duracaoMin = Math.round((horaFim - horaInicio) / (1000 * 60));
      
      const { error } = await supabase
        .from('vitalis_fasting_log')
        .update({
          hora_fim: horaFim.toISOString(),
          duracao_min: duracaoMin,
          completou: duracaoMin >= (horasJejum * 60)
        })
        .eq('id', jejumActual.id);
      
      if (error) {
        console.error('Erro Supabase:', error.message);
        return;
      }
      
      setJejumActual(null);
    } catch (err) {
      console.error('Erro ao terminar jejum:', err.message);
    }
  };

  const registarHumor = async (valor) => {
    setHumor(valor);
  };

  // Cálculos
  const pesoInicial = client?.peso_inicial || 0;
  const pesoActual = client?.peso_actual || 0;
  const pesoMeta = client?.peso_meta || pesoInicial;
  const pesoPerdido = pesoInicial - pesoActual;
  const pesoRestante = pesoActual - pesoMeta;
  const progressoPeso = pesoInicial > pesoMeta ? ((pesoPerdido) / (pesoInicial - pesoMeta)) * 100 : 0;

  const abordagemActual = plano?.abordagem || 'equilibrado';
  const metaAgua = obterMetaAgua(abordagemActual);
  const progressoAgua = (aguaHoje / metaAgua) * 100;
  const regrasOuro = obterRegrasOuro(abordagemActual);
  const semanaPrograma = calcularSemanaPrograma(client?.data_inicio);
  const conteudoSemanal = obterConteudoSemanal(abordagemActual, semanaPrograma);

  const totalRefeicoes = refeicoes.length || 4;
  const refeicoesConcluidas = mealsHoje.filter(m => m.seguiu_plano === 'sim' || m.seguiu_plano === 'parcial').length;
  const progressoRefeicoes = totalRefeicoes > 0 ? (refeicoesConcluidas / totalRefeicoes) * 100 : 0;

  const progressoGeral = Math.round((progressoRefeicoes + progressoAgua) / 2);

  // Dados do jejum
  const jejumActivo = plano?.aceita_jejum || false;
  const protocoloJejum = plano?.protocolo_jejum || '16_8';
  const horasJejum = plano?.horas_jejum || 16;
  
  // Calcular janela alimentar dinamicamente (hora início + horas jejum)
  const calcularJanelaAlimentar = () => {
    if (!jejumActual?.hora_inicio) return '--:--';
    const inicio = new Date(jejumActual.hora_inicio);
    inicio.setHours(inicio.getHours() + horasJejum);
    return inicio.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };
  const janelaInicio = calcularJanelaAlimentar();

  // Macros
  const macrosAlvo = {
    proteina: plano?.porcoes_proteina || 6,
    hidratos: plano?.porcoes_hidratos || 3,
    gordura: plano?.porcoes_gordura || 8
  };

  const caloriasAlvo = plano?.calorias_diarias || 1250;

  // Calendário
  const ultimaSemana = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dataStr = data.toISOString().split('T')[0];
    const registo = registos.find(r => r.data === dataStr);
    ultimaSemana.push({
      dia: data.getDate(),
      diaSemana: data.toLocaleDateString('pt-PT', { weekday: 'short' }).charAt(0).toUpperCase(),
      status: registo ? (registo.aderencia_1a10 >= 7 ? 'verde' : registo.aderencia_1a10 >= 4 ? 'amarelo' : 'vermelho') : (i === 0 ? 'hoje' : 'vazio'),
      ehHoje: i === 0
    });
  }

  // Dias de treino
  // getDay() retorna 0-6 (Domingo=0), mas o sistema usa 1-7 (Domingo=1)
  const diasTreino = plano?.dias_treino || [];
  const diaAtual = new Date().getDay() + 1; // Converter para formato 1-7
  const ehDiaTreino = diasTreino.includes(diaAtual);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌱</div>
          <p className="text-[#6B5C4C]">{t('vitalis.dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
    {/* Modais com position:fixed — FORA do container animado para evitar bug CSS
        (transform no pai quebra position:fixed nos filhos) */}
    {mostrarOnboarding && (
      <WelcomeTutorial eco="vitalis" onComplete={completarOnboarding} />
    )}

    <div className={`fnx-theme min-h-screen pb-20 fnx-fade-in ${isDarkMode ? 'dark' : ''}`}>

      {/* HERO EDITORIAL — espelho da FénixFit */}
      <header className="relative">
        <div className="fnx-container pt-5 pb-7">
          {/* Top bar: logo wordmark · acções */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="/logos/VITALIS_LOGO_V3.png"
                alt=""
                aria-hidden
                className="h-8 w-8 object-contain rounded-md"
              />
              <span
                className="fnx-text-ink"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '18px',
                  fontWeight: 400,
                  letterSpacing: '-0.01em'
                }}
              >
                vita<span className="fnx-text-ouro">lis</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                to="/vitalis/notificacoes"
                className="p-2 rounded-md fnx-transition fnx-text-soft hover:opacity-70"
                aria-label="Notificações"
              >
                <Bell size={18} strokeWidth={1.4} />
              </Link>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md fnx-transition fnx-text-soft hover:opacity-70"
                aria-label={isDarkMode ? 'modo claro' : 'modo escuro'}
              >
                {isDarkMode ? <Sun size={18} strokeWidth={1.4} /> : <Moon size={18} strokeWidth={1.4} />}
              </button>
            </div>
          </div>

          {/* Data + saudação grande */}
          <p
            className="fnx-text-faint mt-5"
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase'
            }}
          >
            <span style={{ color: 'var(--fnx-ouro)' }}>{diaSemana}</span> · {dataFormatada}
          </p>

          <h1
            className="fnx-text-ink mt-2"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 300,
              fontSize: 'clamp(30px, 8vw, 40px)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            {(() => {
              const hora = new Date().getHours();
              return hora < 6 ? 'boa madrugada' : hora < 12 ? 'bom dia' : hora < 19 ? 'boa tarde' : 'boa noite';
            })()},{' '}
            <Link to="/vitalis/perfil" className="italic hover:opacity-80 fnx-transition">
              {(userName?.split(' ')[0] || client?.nome_completo?.split(' ')[0] || userEmail?.split('@')[0] || g('guerreiro', 'guerreira')).toLowerCase()}
            </Link>.
          </h1>

          {/* Hairline ouro — assinatura editorial */}
          <div
            aria-hidden
            className="mt-3"
            style={{ height: '1px', width: '32px', background: 'var(--fnx-ouro)' }}
          />

          {/* Resumo editorial narrativo */}
          {!loading && (
            <section className="mt-5 pl-4" style={{ borderLeft: '1px solid color-mix(in srgb, var(--fnx-ouro) 40%, transparent)' }}>
              <p
                className="fnx-text-soft italic"
                style={{
                  fontSize: '14.5px',
                  lineHeight: 1.7,
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 300
                }}
              >
                {[
                  `dia ${Math.max(1, Math.floor((new Date() - new Date(client?.data_inicio || new Date())) / 86400000) + 1)} da jornada`,
                  streak > 0 && `${streak} ${streak === 1 ? 'dia' : 'dias'} de constância`,
                  xpTotal > 0 && `${xpTotal} xp`,
                  jejumActual?.hora_inicio && `em jejum há ${Math.floor((Date.now() - new Date(jejumActual.hora_inicio).getTime()) / 3600000)}h`,
                  pesoActual && `${pesoActual} kg`
                ].filter(Boolean).join(' · ')}.
              </p>
            </section>
          )}

          {/* Avatar + nível (compacto, à direita) */}
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="relative flex items-center gap-3 fnx-transition hover:opacity-80"
              title="mudar avatar"
            >
              <span
                className="flex items-center justify-center overflow-hidden rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  background: 'var(--fnx-bg-elev)',
                  boxShadow: 'inset 0 0 0 1px var(--fnx-hair-strong)'
                }}
              >
                {client?.foto_url ? (
                  <img src={client.foto_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ fontSize: 22 }}>{avatarIcon}</span>
                )}
              </span>
              <span className="text-left">
                <span className="fnx-label-soft block">nível</span>
                <span className="fnx-editorial-num block" style={{ fontSize: '20px', lineHeight: 1 }}>
                  {Math.floor(xpTotal / 500) + 1}
                </span>
              </span>
            </button>

            {streak > 0 && (
              <div className="flex items-center gap-2">
                <Flame size={14} strokeWidth={1.4} className="fnx-text-ouro" />
                <span className="fnx-editorial-num fnx-tnum" style={{ fontSize: '20px' }}>{streak}</span>
                <span className="fnx-label-soft">{streak === 1 ? 'dia' : 'dias'}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="fnx-container pt-2 pb-6 space-y-8">

        {/* Banner PWA e Notificações */}
        {mostrarBannerPWA && (
          <section className="fnx-card-solid">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="fnx-label-cap">instalar app</span>
                <h3
                  className="fnx-text-ink mt-1"
                  style={{ fontFamily: 'var(--font-editorial)', fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em' }}
                >
                  vitalis no teu telefone
                </h3>
                <p className="fnx-text-soft mt-1.5" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                  acesso offline · lembretes mesmo com a app fechada
                </p>
              </div>
              <button
                onClick={() => {
                  setMostrarBannerPWA(false);
                  localStorage.setItem('vitalis-pwa-banner-fechado', new Date().toISOString());
                }}
                className="fnx-text-faint hover:opacity-70 fnx-transition p-1 -mt-1 -mr-1"
                aria-label="fechar"
              >
                <X size={16} strokeWidth={1.4} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {deferredPrompt && (
                <button
                  onClick={async () => {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                      setIsPWAInstalled(true);
                      setMostrarBannerPWA(false);
                    }
                    setDeferredPrompt(null);
                  }}
                  className="fnx-btn-primary"
                >
                  <Download size={14} strokeWidth={1.4} />
                  <span>instalar</span>
                </button>
              )}

              {!notificacoesAtivas && (
                <button
                  onClick={async () => {
                    const resultado = await pedirPermissaoERegistar();
                    setNotificacoesAtivas(resultado);
                    if (resultado) {
                      const { carregarLembretes } = await import('../../utils/notifications');
                      guardarPreferencias(carregarLembretes()).catch(() => {});
                      const { activarLembretes } = await import('../../utils/notifications');
                      await activarLembretes();
                      enviarNotificacao('Notificações activadas!', {
                        body: 'Vais receber lembretes mesmo com a app fechada!'
                      });
                    }
                  }}
                  className="fnx-btn-outline"
                >
                  <Bell size={14} strokeWidth={1.4} />
                  <span>activar notificações</span>
                </button>
              )}

              <Link to="/vitalis/guia" className="fnx-btn-ghost">
                <BookOpen size={14} strokeWidth={1.4} />
                <span>ver guia</span>
              </Link>
            </div>

            {!deferredPrompt && (
              <p className="fnx-text-faint mt-3 flex items-center gap-1.5" style={{ fontSize: '11px' }}>
                <Lightbulb size={11} strokeWidth={1.4} />
                <span>iphone: safari → partilhar → adicionar ao ecrã inicial</span>
              </p>
            )}
          </section>
        )}

        {/* Banner Trial - Contador de Dias */}
        {subscriptionStatus === 'trial' && trialDaysLeft !== null && (
          <section className="fnx-card-feature">
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift size={14} strokeWidth={1.4} className="fnx-text-ouro" />
                <span className="fnx-label-cap">trial gratuito</span>
              </div>
              <span className="fnx-label-soft fnx-tnum">
                {trialDaysLeft}/7 dias
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="fnx-editorial-num fnx-tnum" style={{ fontSize: '52px', lineHeight: 1 }}>
                {trialDaysLeft}
              </span>
              <span className="fnx-text-soft" style={{ fontSize: '14px' }}>
                {trialDaysLeft === 1 ? 'último dia' : 'dias por viver'}
              </span>
            </div>

            <p
              className="fnx-text-soft mt-2 italic"
              style={{ fontFamily: 'var(--font-editorial)', fontWeight: 300, fontSize: '13.5px', lineHeight: 1.6 }}
            >
              {trialDaysLeft === 1
                ? 'hoje é o dia. subscreve para continuar a tua jornada.'
                : trialDaysLeft <= 3
                  ? 'a recta final do trial. é altura de decidires.'
                  : 'continua a explorar. quando estiveres pronta, escolhe um plano.'}
            </p>

            {/* Hairline progress */}
            <div className="mt-4 h-px w-full overflow-hidden" style={{ background: 'var(--fnx-hair)' }}>
              <div
                className="h-px"
                style={{
                  width: `${(trialDaysLeft / 7) * 100}%`,
                  background: 'var(--fnx-ouro)',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              {trialExpiresAt && (
                <p className="fnx-text-faint fnx-tnum" style={{ fontSize: '11px' }}>
                  expira {new Date(trialExpiresAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}
                </p>
              )}
              <Link to="/vitalis/pagamento" className="fnx-btn-ouro">
                <span>ver planos</span>
                <ArrowRight size={14} strokeWidth={1.4} />
              </Link>
            </div>
          </section>
        )}

        {/* Banner Intake - Sugerir completar */}
        {subscriptionStatus === 'trial' && !hasIntake && (
          <section className="fnx-card-feature">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} strokeWidth={1.4} className="fnx-text-ouro" />
              <span className="fnx-label-cap">personaliza a experiência</span>
            </div>
            <h3
              className="fnx-text-ink"
              style={{ fontFamily: 'var(--font-editorial)', fontSize: '22px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.2 }}
            >
              5 minutos · um plano só teu
            </h3>
            <p className="fnx-text-soft mt-2" style={{ fontSize: '13.5px', lineHeight: 1.65 }}>
              completa o questionário inicial para receberes plano alimentar, treinos e macros calculados ao detalhe.
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                'plano alimentar adaptado ao teu objectivo',
                'treinos para a tua fase e condição',
                'calorias e macros calculados para ti'
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 inline-block" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--fnx-ouro)' }} />
                  <span className="fnx-text-soft" style={{ fontSize: '13.5px', lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/vitalis/intake" className="fnx-btn-primary mt-5 w-full">
              <ClipboardList size={14} strokeWidth={1.4} />
              <span>começar questionário</span>
            </Link>
          </section>
        )}

        {/* Banner Plano Pendente Revisao */}
        {planoPendenteRevisao && !plano && (
          <section className="fnx-card-solid">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} strokeWidth={1.4} className="fnx-text-ouro" />
              <span className="fnx-label-cap">plano em revisão</span>
            </div>
            <h3
              className="fnx-text-ink"
              style={{ fontFamily: 'var(--font-editorial)', fontSize: '19px', fontWeight: 400, letterSpacing: '-0.015em' }}
            >
              a tua coach está a rever o plano
            </h3>
            <p className="fnx-text-soft mt-1.5" style={{ fontSize: '13px', lineHeight: 1.55 }}>
              vais ter acesso assim que for aprovado. recebes notificação.
            </p>
          </section>
        )}

        {/* Mantra editorial + Streak */}
        <section className="text-center px-2">
          <p className="fnx-mantra fnx-text-soft">
            <span className="fnx-text-ouro" style={{ fontFamily: 'var(--font-editorial)' }}>&ldquo;</span>
            cada escolha consciente aproxima-te da tua melhor versão
            <span className="fnx-text-ouro" style={{ fontFamily: 'var(--font-editorial)' }}>&rdquo;</span>
          </p>
          <p className="fnx-label-soft mt-3 fnx-tnum">
            {(() => {
              const semana = Math.floor((new Date() - new Date(client?.data_inicio || new Date())) / (7 * 24 * 60 * 60 * 1000)) + 1;
              const abordagem = plano?.abordagem || 'equilibrado';
              const faseNomes = {
                keto_if: { inducao: 'indução', transicao: 'transição', recomposicao: 'recomposição', manutencao: 'manutenção' },
                low_carb: { inducao: 'adaptação', transicao: 'transição', recomposicao: 'recomposição', manutencao: 'manutenção' },
                equilibrado: { inducao: 'arranque', transicao: 'progressão', recomposicao: 'consolidação', manutencao: 'manutenção' }
              };
              const nomes = faseNomes[abordagem] || faseNomes.equilibrado;
              const fase = (nomes[plano?.fase] || plano?.fase || 'inicial').toLowerCase();
              return `semana ${semana} · ${fase}`;
            })()}
          </p>
        </section>

        {/* Alerta de risco de desistência (aparece quando detectado) */}
        <AlertaDesistencia riskData={riskData} userId={userId} />

        {/* Quick Actions — acesso rápido editorial */}
        <section className="space-y-2">
          <span className="fnx-label-cap px-1">acesso rápido</span>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2 lg:grid-cols-8">
            {[
              { to: '/vitalis/plano', icon: ClipboardList, label: 'plano' },
              { to: '/vitalis/checkin', icon: CheckCircle2, label: 'check-in' },
              { to: '/vitalis/meals', icon: UtensilsCrossed, label: 'refeições' },
              { to: '/vitalis/calendario', icon: CalendarDays, label: 'menu' },
              { to: '/vitalis/receitas', icon: ChefHat, label: 'receitas' },
              { to: '/vitalis/tendencias', icon: Ruler, label: 'medidas' },
              { to: '/vitalis/sintomas', icon: Thermometer, label: 'adaptação' },
              { to: '/vitalis/treinos', icon: Dumbbell, label: 'treinos' },
              { to: '/vitalis/espaco-retorno', icon: Heart, label: 'retorno' },
              { to: '/vitalis/compromisso', icon: FileText, label: 'compromisso' },
              { to: '/vitalis/relatorios', icon: BarChart3, label: 'relatórios' },
              { to: '/vitalis/chat', icon: MessageCircle, label: 'coach' }
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="fnx-card-solid fnx-transition flex flex-col items-center justify-center gap-1.5 active:scale-95"
                style={{ padding: '12px', minHeight: '74px' }}
              >
                <Icon size={16} strokeWidth={1.3} className="fnx-text-ouro" />
                <span
                  className="fnx-text-soft"
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    fontSize: '11.5px',
                    letterSpacing: '-0.01em',
                    textAlign: 'center'
                  }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Conteúdo Educativo da Semana */}
        {conteudoSemanal && (
          <section className="fnx-card-feature">
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={14} strokeWidth={1.4} className="fnx-text-ouro" />
                <span className="fnx-label-cap">semana {semanaPrograma} no plano</span>
              </div>
            </div>
            <h3
              className="fnx-text-ink"
              style={{ fontFamily: 'var(--font-editorial)', fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.25 }}
            >
              {(conteudoSemanal.titulo || '').toLowerCase()}
            </h3>
            <p className="fnx-text-soft mt-2" style={{ fontSize: '13.5px', lineHeight: 1.65 }}>
              {conteudoSemanal.mensagem}
            </p>
            <hr className="fnx-hairline my-4" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="fnx-label-soft mb-1">o que esperar</p>
                <p className="fnx-text-soft" style={{ fontSize: '12.5px', lineHeight: 1.55 }}>{conteudoSemanal.expectativa}</p>
              </div>
              <div>
                <p className="fnx-label-soft mb-1">dica da semana</p>
                <p
                  className="fnx-text-soft italic"
                  style={{ fontSize: '12.5px', lineHeight: 1.55, fontFamily: 'var(--font-editorial)', fontWeight: 300 }}
                >
                  {conteudoSemanal.dica}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Regras de Ouro (por abordagem) */}
        <section className="fnx-card-solid !p-0">
          <button
            type="button"
            onClick={() => setRegrasExpandidas(!regrasExpandidas)}
            className="w-full flex items-center justify-between active:scale-[0.99] fnx-transition"
            style={{ padding: '20px' }}
            aria-expanded={regrasExpandidas}
            aria-controls="regras-ouro-list"
          >
            <div className="flex items-center gap-3 min-w-0 text-left">
              <FileText size={18} strokeWidth={1.4} className="fnx-text-ouro shrink-0" />
              <div className="min-w-0">
                <p className="fnx-label-cap mb-0.5">
                  {abordagemActual === 'keto_if' && 'keto + jejum'}
                  {abordagemActual === 'low_carb' && 'low carb'}
                  {abordagemActual === 'equilibrado' && 'equilibrado'}
                </p>
                <h3
                  className="fnx-text-ink truncate"
                  style={{ fontFamily: 'var(--font-editorial)', fontSize: '17px', fontWeight: 400, letterSpacing: '-0.015em' }}
                >
                  regras de ouro · {regrasOuro.length}
                </h3>
              </div>
            </div>
            <span className="fnx-text-ouro shrink-0 ml-2" aria-hidden="true">
              {regrasExpandidas ? '−' : '+'}
            </span>
          </button>
          {regrasExpandidas && (
            <>
              <hr className="fnx-hairline" />
              <ul id="regras-ouro-list" className="divide-y" style={{ borderColor: 'var(--fnx-hair)' }}>
                {regrasOuro.map((regra, idx) => (
                  <li key={idx} className="flex gap-4 px-5 py-3.5">
                    <span
                      className="fnx-tnum shrink-0"
                      style={{
                        fontFamily: 'var(--font-editorial)',
                        fontSize: '14px',
                        fontWeight: 300,
                        color: 'var(--fnx-ouro)',
                        minWidth: '24px'
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="fnx-text-ink" style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.01em' }}>
                        {(regra.titulo || '').toLowerCase()}
                      </p>
                      <p className="fnx-text-soft mt-0.5" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                        {regra.descricao}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Grid Principal */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* Coluna Esquerda */}
          <div className="col-span-12 md:col-span-4 space-y-4">
            
            {/* Círculo de Progresso */}
            <div className="rounded-3xl shadow-xl p-5 transition-all duration-300 hover:shadow-2xl"
              style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F0EB 100%)', borderTop: '3px solid #7C8B6F' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#7C8B6F' }}>{t('vitalis.dashboard.progress')} Hoje</h3>
              
              <div className="relative w-44 h-44 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="6"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#f3f4f6" strokeWidth="5"/>
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4"/>
                  
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad1)" strokeWidth="6" 
                          strokeDasharray="283" strokeDashoffset={283 - (283 * progressoRefeicoes / 100)} strokeLinecap="round"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#0ea5e9" strokeWidth="5" 
                          strokeDasharray="226" strokeDashoffset={226 - (226 * progressoAgua / 100)} strokeLinecap="round"/>
                  <circle cx="50" cy="50" r="28" fill="none" stroke="#10b981" strokeWidth="4" 
                          strokeDasharray="176" strokeDashoffset={176 - (176 * (treinoHoje ? 100 : 0) / 100)} strokeLinecap="round"/>
                  
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C8B6F"/>
                      <stop offset="100%" stopColor="#9CAF88"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">{progressoGeral}%</span>
                  <span className="text-xs text-gray-500">completo</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-[#F5F2ED] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] mx-auto mb-1"></div>
                  <p className="font-semibold text-[#4A4035]">{refeicoesConcluidas}/{totalRefeicoes}</p>
                  <p className="text-[#6B5C4C]">Refeições</p>
                </div>
                <div className="p-2 bg-sky-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-sky-500 mx-auto mb-1"></div>
                  <p className="font-semibold text-gray-700">{aguaHoje.toFixed(1)}L</p>
                  <p className="text-gray-500">Água</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto mb-1"></div>
                  <p className="font-semibold text-gray-700">{treinoHoje ? '✓' : '—'}</p>
                  <p className="text-gray-500">Treino</p>
                </div>
              </div>
            </div>

            {/* Quick Trackers */}
            <QuickTrackers
              aguaHoje={aguaHoje}
              metaAgua={metaAgua}
              abordagem={abordagemActual}
              treinoHoje={treinoHoje}
              ehDiaTreino={ehDiaTreino}
              sonoHoje={sonoHoje}
              humor={humor}
              onAddWater={adicionarAgua}
              onLogWorkout={registarTreino}
              onLogSleep={registarSono}
              onMoodSelect={registarHumor}
              dataTracking={dataTracking}
              onChangeDate={setDataTracking}
            />
          </div>

          {/* Coluna Central */}
          <div className="col-span-12 md:col-span-5 space-y-4 flex flex-col">
            
            {/* Timer de Jejum */}
            <FastingTimerCard
              jejumActual={jejumActual}
              jejumActivo={jejumActivo}
              protocoloJejum={protocoloJejum}
              horasJejum={horasJejum}
              janelaInicio={janelaInicio}
              onStartFasting={iniciarJejum}
              onEndFasting={terminarJejum}
            />

            {/* Refeições do Dia */}
            <MealsSection refeicoes={refeicoes} mealsHoje={mealsHoje} />
          </div>

          {/* Coluna Direita */}
          <div className="col-span-12 md:col-span-3 space-y-4">
            
            {/* Peso */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Peso</p>
                {pesoPerdido > 0 && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    ↓ {pesoPerdido.toFixed(1)}kg
                  </span>
                )}
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-gray-800">{pesoActual}</p>
                <p className="text-gray-500 text-sm mb-1">kg</p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Início: {pesoInicial}kg</span>
                  <span>Meta: {pesoMeta}kg</span>
                </div>
                <div className="h-2 bg-[#F5F2ED] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#9CAF88] to-[#7C8B6F] rounded-full transition-all"
                    style={{ width: `${Math.min(progressoPeso, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {pesoPerdido.toFixed(1)}kg perdidos • {pesoRestante.toFixed(1)}kg restantes
                </p>
              </div>
            </div>

            {/* Humor movido para QuickTrackers */}

            {/* Mini Calendário */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Esta Semana</p>
              
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {ultimaSemana.map((dia, i) => (
                  <span key={i} className="text-xs text-gray-400">{dia.diaSemana}</span>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {ultimaSemana.map((dia, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mx-auto ${
                      dia.status === 'verde' ? 'bg-[#7C8B6F] text-white' :
                      dia.status === 'amarelo' ? 'bg-[#9CAF88] text-white' :
                      dia.status === 'vermelho' ? 'bg-[#C4A484] text-white' :
                      dia.ehHoje ? 'bg-[#7C8B6F] text-white ring-2 ring-[#9CAF88] ring-offset-2' :
                      'bg-[#F5F2ED] text-[#6B5C4C]'
                    }`}
                  >
                    {dia.dia}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-[#E8E2D9]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#6B5C4C]">Aderência</span>
                  <span className="text-sm font-bold text-[#7C8B6F]">
                    {Math.round((ultimaSemana.filter(d => d.status === 'verde' || d.status === 'amarelo').length / 7) * 100)}%
                  </span>
                </div>
                {/* Pattern insight */}
                {(() => {
                  const vermelhos = ultimaSemana.filter(d => d.status === 'vermelho');
                  const vazios = ultimaSemana.filter(d => d.status === 'vazio' && !d.ehHoje);
                  if (vazios.length >= 3) return <p className="text-xs text-amber-600">Faltam registos em {vazios.length} dias</p>;
                  if (vermelhos.length >= 2) return <p className="text-xs text-red-500">{vermelhos.length} dias abaixo do ideal</p>;
                  if (ultimaSemana.filter(d => d.status === 'verde').length >= 5) return <p className="text-xs text-green-600">Semana excelente! Mantém assim</p>;
                  return null;
                })()}
                <Link to="/vitalis/relatorio-semanal" className="text-xs text-[#7C8B6F] hover:underline mt-1 block">
                  Ver relatório detalhado →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Macros */}
        <MacrosDisplay
          mealsHoje={mealsHoje}
          macrosAlvo={macrosAlvo}
          caloriasAlvo={caloriasAlvo}
        />

        {/* Banner Ramadan - Visível durante o período, apenas para quem observa */}
        {(() => {
          if (!observaRamadao()) return null;
          const { mostrar: mostrarBanner, dentroRamadan: dentroRamadao } = isNearRamadan(5);

          if (!mostrarBanner) return null;

          return (
            <Link to="/vitalis/guia-ramadao" className="fnx-card-solid fnx-transition flex items-center gap-4 hover:opacity-90">
              <Moon size={28} strokeWidth={1.4} className="fnx-text-ouro shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="fnx-label-cap">guia nutricional</span>
                <h3
                  className="fnx-text-ink mt-0.5"
                  style={{ fontFamily: 'var(--font-editorial)', fontSize: '17px', fontWeight: 400, letterSpacing: '-0.015em' }}
                >
                  {dentroRamadao ? 'ramadan mubarak' : 'o ramadan está a chegar'}
                </h3>
                <p className="fnx-text-soft mt-0.5" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                  {dentroRamadao ? 'suhoor, iftar e o mês sagrado' : 'prepara-te com o guia nutricional'}
                </p>
              </div>
              <ArrowRight size={16} strokeWidth={1.4} className="fnx-text-faint shrink-0" />
            </Link>
          );
        })()}

        {/* Funcionalidades — explorar a app */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <span className="fnx-label-cap">explorar</span>
            <span className="fnx-label-soft">funcionalidades</span>
          </div>

          {/* Guia em destaque */}
          <Link to="/vitalis/guia" className="fnx-card-feature fnx-transition flex items-center gap-4 hover:opacity-95">
            <BookOpen size={22} strokeWidth={1.4} className="fnx-text-ouro shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="fnx-label-cap">primeiro passo</span>
              <h3
                className="fnx-text-ink mt-0.5"
                style={{ fontFamily: 'var(--font-editorial)', fontSize: '18px', fontWeight: 400, letterSpacing: '-0.015em' }}
              >
                guia do utilizador
              </h3>
              <p className="fnx-text-soft mt-0.5" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
                aprende a usar tudo o que está aqui
              </p>
            </div>
            <ArrowRight size={16} strokeWidth={1.4} className="fnx-text-faint shrink-0" />
          </Link>

          {/* Grid de funcionalidades */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { to: '/vitalis/chat', icon: MessageCircle, label: 'coach', sub: 'fala comigo' },
              { to: '/vitalis/desafios', icon: Target, label: 'desafios', sub: 'semana a semana' },
              { to: '/vitalis/lista-compras', icon: ShoppingCart, label: 'compras', sub: 'lista automática' },
              { to: '/vitalis/sugestoes', icon: Wand2, label: 'sugestões', sub: 'o que comer' },
              { to: '/vitalis/calendario-progresso', icon: CalendarRange, label: 'diário', sub: 'ver por dia' },
              { to: '/vitalis/fotos-progresso', icon: Camera, label: 'fotos', sub: 'antes/depois' },
              { to: '/vitalis/tendencias', icon: TrendingUp, label: 'tendências', sub: 'peso, medidas' },
              { to: '/vitalis/notificacoes', icon: Bell, label: 'lembretes', sub: 'manhã, tarde' }
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link
                key={to}
                to={to}
                className="fnx-card-solid fnx-transition flex flex-col items-start gap-2 active:scale-95"
                style={{ padding: '14px' }}
              >
                <Icon size={16} strokeWidth={1.3} className="fnx-text-ouro" />
                <div className="min-w-0">
                  <p
                    className="fnx-text-ink"
                    style={{ fontFamily: 'var(--font-editorial)', fontSize: '14px', fontWeight: 400, letterSpacing: '-0.01em' }}
                  >
                    {label}
                  </p>
                  <p className="fnx-text-faint" style={{ fontSize: '11px', marginTop: '1px' }}>{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Meditações — link discreto */}
        <Link to="/vitalis/meditacoes" className="fnx-card-solid fnx-transition flex items-center gap-3 hover:opacity-90">
          <Wind size={18} strokeWidth={1.4} className="fnx-text-ouro shrink-0" />
          <div className="flex-1 min-w-0">
            <p
              className="fnx-text-ink"
              style={{ fontFamily: 'var(--font-editorial)', fontSize: '15px', fontWeight: 400, letterSpacing: '-0.01em' }}
            >
              meditações
            </p>
            <p className="fnx-text-faint" style={{ fontSize: '11.5px' }}>corpo e mente</p>
          </div>
          <ArrowRight size={14} strokeWidth={1.4} className="fnx-text-faint shrink-0" />
        </Link>

        {/* Secção de Conquistas */}
        <AchievementsPanel
          conquistasDesbloqueadas={conquistasDesbloqueadas}
          xpTotal={xpTotal}
        />

        {/* Paleta — escolha opcional, sempre disponível */}
        <PaletaSelector />

        {/* Vivianne Explica */}
        <div className="mb-6">
          <PodcastPlayer eco="vitalis" compact />
        </div>

      </main>
    </div>

    {/* Modais com position:fixed — FORA do container animado (transform quebra fixed) */}
    <CelebracaoModal
      conquista={conquistaActual}
      show={showCelebracao}
      onClose={() => {
        setShowCelebracao(false);
        setConquistaActual(null);
      }}
    />

    {showAvatarPicker && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAvatarPicker(false)} />
        <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-bounceIn">
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Escolhe o teu avatar</h3>
          <p className="text-sm text-gray-500 text-center mb-4">Representa o teu progresso na jornada</p>

          <div className="grid grid-cols-5 gap-3 mb-4">
            {['🌱', '🌿', '🌳', '🌻', '🌸', '🦋', '🔥', '⭐', '💎', '🏆', '👑', '🌙', '☀️', '🌈', '🍀'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setAvatarIcon(emoji);
                  localStorage.setItem('vitalis-avatar', emoji);
                  setShowAvatarPicker(false);
                }}
                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  avatarIcon === emoji
                    ? 'bg-[#7C8B6F] scale-110 shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAvatarPicker(false)}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )}

    </>
  );
}
