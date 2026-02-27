import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { Link, useNavigate } from 'react-router-dom';
import { StreakDisplay, CelebracaoModal, ConquistasSection, NivelProgresso, CONQUISTAS } from './Gamificacao.jsx';
import { useOnboarding, OnboardingWrapper } from './OnboardingTutorial.jsx';
import { EmailTriggers } from '../../lib/emails';
import WelcomeTutorial from '../WelcomeTutorial.jsx';
import { isCoach } from '../../lib/coach';
import { g, setSexo } from '../../utils/genero';
import { isNearRamadan, setObservaRamadao, observaRamadao } from '../../utils/ramadao';
import { useTheme } from '../../contexts/ThemeContext';
import { useI18n } from '../../contexts/I18nContext';
import { temPermissao, activarLembretes, contarLembretesHoje } from '../../utils/notifications';
import { pedirPermissaoERegistar, guardarPreferencias } from '../../lib/pushSubscription';
import { checkVitalisAccess } from '../../lib/subscriptions';
import { calcularPorcoesDiarias } from '../../lib/vitalis/calcularPorcoes.js';
import QuickTrackers from './QuickTrackers';
import FastingTimerCard from './FastingTimerCard';
import MealsSection from './MealsSection';
import MacrosDisplay from './MacrosDisplay';
import AchievementsPanel from './AchievementsPanel';

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

  // Hook do onboarding
  const { mostrarOnboarding, completarOnboarding } = useOnboarding();

  // Ref para controlar se já enviamos notificação do jejum
  const notificacaoJejumEnviada = useRef(false);
  const jejumTimerRef = useRef(null);

  // Conquistas já celebradas — persistente via localStorage (não useRef que reseta a cada mount)
  const getConquistasCelebradas = () => {
    try { return new Set(JSON.parse(localStorage.getItem('vitalis-conquistas-celebradas') || '[]')); }
    catch { return new Set(); }
  };
  const marcarConquistaCelebrada = (id) => {
    const set = getConquistasCelebradas();
    set.add(id);
    localStorage.setItem('vitalis-conquistas-celebradas', JSON.stringify([...set]));
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

  const hoje = new Date().toISOString().split('T')[0];
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

    // Re-registar push e activar lembretes locais (só como fallback se push não estiver activo)
    if (temPermissao()) {
      // Re-registar push subscription silenciosamente (garante que está na DB)
      import('../../lib/pushSubscription').then(({ registarPushSubscription }) => {
        registarPushSubscription().catch(() => {});
      });
      // activarLembretes é async — verifica se push está activo e só agenda localmente se não
      activarLembretes().then(ids => {
        if (ids.length > 0) console.log('Dashboard: lembretes locais (fallback):', ids.length);
      }).catch(() => {});
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
        .select('sexo, observa_ramadao, altura_cm, peso_actual, idade')
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
          planoData = {
            ...mealPlan,
            client_id: activeClientData.id,
            calorias_diarias: mealPlan.calorias_alvo,
            porcoes_proteina: porcoesDiarias.proteina,
            porcoes_hidratos: porcoesDiarias.hidratos,
            porcoes_gordura: porcoesDiarias.gordura,
            porcoes_legumes: porcoesDiarias.legumes,
            horas_jejum: mealPlan.abordagem === 'keto_if' ? 16 : null,
            aceita_jejum: mealPlan.abordagem === 'keto_if',
            protocolo_jejum: mealPlan.abordagem === 'keto_if' ? '16_8' : null,
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

      const { data: mealsData } = await supabase
        .from('vitalis_meals_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje);
      setMealsHoje(mealsData || []);

      const { data: aguaData } = await supabase
        .from('vitalis_agua_log')
        .select('quantidade_ml')
        .eq('user_id', userData.id)
        .eq('data', hoje);
      
      const totalAgua = (aguaData || []).reduce((sum, a) => sum + a.quantidade_ml, 0) / 1000;
      setAguaHoje(totalAgua);

      // Usar maybeSingle() para evitar crashes quando não há dados
      const { data: treinoData } = await supabase
        .from('vitalis_workouts_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .limit(1)
        .maybeSingle();

      setTreinoHoje(treinoData || null);

      const { data: sonoData } = await supabase
        .from('vitalis_sono_log')
        .select('*')
        .eq('user_id', userData.id)
        .eq('data', hoje)
        .limit(1)
        .maybeSingle();

      setSonoHoje(sonoData || null);

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

      // Conquistas de água
      if ((aguaCount.count || 0) >= 1) { conquistas.push('agua_1'); xp += 50; }
      if ((aguaCount.count || 0) >= 50) { conquistas.push('agua_50'); xp += 150; }

      // Conquistas de treino
      if ((treinoCount.count || 0) >= 1) { conquistas.push('treino_1'); xp += 75; }
      if ((treinoCount.count || 0) >= 10) { conquistas.push('treino_10'); xp += 200; }

      // Conquistas de refeições
      if ((mealsCount.count || 0) >= 10) { conquistas.push('refeicoes_10'); xp += 100; }
      if ((mealsCount.count || 0) >= 50) { conquistas.push('refeicoes_50'); xp += 250; }

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

      // Verificar novas conquistas para enviar email
      const conquistasNotificadas = JSON.parse(localStorage.getItem('vitalis-conquistas-notificadas') || '[]');
      const novasConquistas = conquistas.filter(c => !conquistasNotificadas.includes(c));

      // Se há novas conquistas, notificar por email
      if (novasConquistas.length > 0 && email) {
        // UNION: juntar antigas + novas (nunca perder conquistas já notificadas)
        const todasNotificadas = [...new Set([...conquistasNotificadas, ...conquistas])];
        localStorage.setItem('vitalis-conquistas-notificadas', JSON.stringify(todasNotificadas));

        const celebradas = getConquistasCelebradas();

        for (const conquistaId of novasConquistas) {
          const conquista = CONQUISTAS[conquistaId];
          if (conquista) {
            // Verificar se já celebrámos esta conquista (persistente entre sessões)
            if (!celebradas.has(conquistaId) && !showCelebracao) {
              marcarConquistaCelebrada(conquistaId);
              setConquistaActual(conquistaId);
              setShowCelebracao(true);
            }

            // Enviar email (async, não bloqueia)
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

        // Verificar conquistas de streak
        const streakMilestones = [3, 7, 14, 30, 60];
        for (const milestone of streakMilestones) {
          if (count >= milestone && melhor < milestone) {
            const conquistaId = `streak_${milestone}`;
            setConquistaActual(conquistaId);
            setShowCelebracao(true);
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
          data: hoje,
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
  const registarTreino = async () => {
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
      
      const { data, error } = await supabase
        .from('vitalis_workouts_log')
        .insert({
          user_id: userId,
          data: hoje,
          tipo: 'geral'
        })
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
          data: hoje,
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

  const metaAgua = 2;
  const progressoAgua = (aguaHoje / metaAgua) * 100;

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
    <div className={`min-h-screen pb-20 transition-colors duration-500 animate-page-enter ${
      isDarkMode
        ? 'bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]'
        : 'bg-gradient-to-b from-[#C5D1BC] via-[#E8E4DC] to-[#FAF7F2]'
    }`}>

      {/* Tutorial de Boas-vindas - Primeira vez */}
      <WelcomeTutorial eco="vitalis" />

      {/* Header com Perfil — premium animated gradient */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7C8B6F] via-[#8B9A7A] to-[#6B7A5D] hero-gradient-animated"></div>
        <div className="absolute inset-0 opacity-8">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,50 Q25,30 50,50 T100,50 V100 H0 Z" fill="white"/>
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="relative max-w-6xl mx-auto px-4 py-5">
          {/* Top bar com logo e ações */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img
                src="/logos/VITALIS_LOGO_V3.png"
                alt="Vitalis"
                className="w-10 h-10 object-contain drop-shadow-lg"
              />
              <h1 className="text-xl font-bold text-white premium-label" style={{ fontFamily: 'var(--font-titulos)', letterSpacing: '0.2em', fontSize: '1.1rem' }}>VITALIS</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Notificações */}
              <Link
                to="/vitalis/notificacoes"
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-base border border-white/20 hover:bg-white/25 transition-all duration-300"
                title="Notificações"
              >
                🔔
              </Link>
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-base border border-white/20 hover:bg-white/25 transition-all duration-300"
                title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Perfil do Utilizador */}
          <div className="flex items-center gap-4">
            {/* Avatar - Clicável para mudar ícone */}
            <div className="relative group">
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/30 border-3 border-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-white/40 transition-colors"
                title="Clica para mudar o avatar"
              >
                {client?.foto_url ? (
                  <img src={client.foto_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl md:text-4xl">{avatarIcon}</span>
                )}
              </button>
              {/* Badge de nível */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs font-bold shadow-md">
                {Math.floor(xpTotal / 500) + 1}
              </div>
              {/* Indicador de editar */}
              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity">
                ✏️
              </div>
            </div>

            {/* Info do utilizador */}
            <div className="flex-1">
              <p className="text-white/70 text-sm">Olá,</p>
              <Link to="/vitalis/perfil" className="block hover:opacity-80 transition-opacity">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {userName?.split(' ')[0] || client?.nome_completo?.split(' ')[0] || userEmail?.split('@')[0] || g('Guerreiro', 'Guerreira')}! 👋
                </h2>
              </Link>
              <p className="text-white/80 text-sm capitalize">{diaSemana}, {dataFormatada}</p>

              {/* Barra de XP */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden max-w-[150px]">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${(xpTotal % 500) / 500 * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-white/80">{xpTotal} XP</span>
              </div>
            </div>

            {/* Streak compacto no header */}
            {streak > 0 && (
              <div className="hidden md:flex flex-col items-center bg-white/20 rounded-xl px-4 py-2">
                <span className="text-2xl">🔥</span>
                <span className="text-white font-bold">{streak}</span>
                <span className="text-white/70 text-xs">dias</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">

        {/* Banner PWA e Notificações */}
        {mostrarBannerPWA && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="0" cy="100" r="60" fill="white"/>
                <circle cx="100" cy="0" r="40" fill="white"/>
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Instala o Vitalis!</h3>
                    <p className="text-white/80 text-sm">Acede offline e recebe notificações</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMostrarBannerPWA(false);
                    localStorage.setItem('vitalis-pwa-banner-fechado', new Date().toISOString());
                  }}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Botão de instalação - só aparece se tiver deferredPrompt (Chrome/Edge/etc) */}
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
                    className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-md"
                  >
                    <span>⬇️</span>
                    <span>Instalar App</span>
                  </button>
                )}

                {/* Botão para ativar notificações */}
                {!notificacoesAtivas && (
                  <button
                    onClick={async () => {
                      const resultado = await pedirPermissaoERegistar();
                      setNotificacoesAtivas(resultado);
                      if (resultado) {
                        // Guardar preferências no servidor para push real via cron
                        const { carregarLembretes } = await import('../../utils/notifications');
                        guardarPreferencias(carregarLembretes()).catch(() => {});
                        // activarLembretes verifica push e só agenda localmente se necessário
                        await activarLembretes();
                        enviarNotificacao('Notificações activadas!', {
                          body: 'Vais receber lembretes mesmo com a app fechada!'
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors border border-white/30"
                  >
                    <span>🔔</span>
                    <span>Ativar Notificações</span>
                  </button>
                )}

                {/* Link para o guia (especialmente para iOS) */}
                <Link
                  to="/vitalis/guia"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors border border-white/20"
                >
                  <span>📖</span>
                  <span>Ver Guia</span>
                </Link>
              </div>

              {/* Dica para iOS */}
              {!deferredPrompt && (
                <p className="text-white/70 text-xs mt-3 flex items-center gap-1">
                  <span>💡</span>
                  <span>iPhone/iPad: Usa Safari → Partilhar → "Adicionar ao ecrã inicial"</span>
                </p>
              )}

              {/* Indicadores de status */}
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${isPWAInstalled ? 'bg-green-400' : 'bg-white/40'}`}></span>
                  <span className="text-white/80">{isPWAInstalled ? 'App instalada' : 'Não instalada'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${notificacoesAtivas ? 'bg-green-400' : 'bg-white/40'}`}></span>
                  <span className="text-white/80">{notificacoesAtivas ? 'Notificações ativas' : 'Notificações off'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banner Trial - Contador de Dias */}
        {subscriptionStatus === 'trial' && trialDaysLeft !== null && (
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="20" cy="80" r="40" fill="white"/>
                <circle cx="80" cy="20" r="30" fill="white"/>
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🎁</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Trial Gratuito Ativo</h3>
                  <p className="text-white/90 text-sm mt-1">
                    {trialDaysLeft === 1 ? (
                      <span className="font-bold">⏰ Último dia! Subscreve para continuar</span>
                    ) : trialDaysLeft <= 3 ? (
                      <span>Faltam <strong>{trialDaysLeft} dias</strong> • Depois perde acesso</span>
                    ) : (
                      <span>Faltam <strong>{trialDaysLeft} dias</strong> de acesso completo</span>
                    )}
                  </p>
                </div>
              </div>
              <Link
                to="/vitalis/pagamento"
                className="px-5 py-2.5 bg-white text-green-600 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors shadow-lg whitespace-nowrap"
              >
                Ver Planos →
              </Link>
            </div>

            {/* Barra de progresso */}
            <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(trialDaysLeft / 7) * 100}%` }}
              />
            </div>

            {trialExpiresAt && (
              <p className="text-white/70 text-xs mt-2 text-center">
                Expira em {new Date(trialExpiresAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        )}

        {/* Banner Intake - Sugerir completar */}
        {subscriptionStatus === 'trial' && !hasIntake && (
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="30" cy="70" r="35" fill="white"/>
                <circle cx="70" cy="30" r="25" fill="white"/>
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">Personaliza a Tua Experiência</h3>
                  <p className="text-white/90 text-sm mb-3">
                    Completa o questionário inicial (5 min) para receberes:
                  </p>
                  <ul className="space-y-1 text-white/90 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      <span>Plano alimentar personalizado para o teu objetivo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      <span>Treinos adaptados à tua fase e condição</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      <span>Calorias e macros calculados para ti</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                to="/vitalis/intake"
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg"
              >
                <span>📋</span>
                <span>Começar Questionário (5 min)</span>
              </Link>
            </div>
          </div>
        )}

        {/* Banner Plano Pendente Revisao */}
        {planoPendenteRevisao && !plano && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👩‍⚕️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">Plano em revisao</h3>
                <p className="text-white/90 text-sm">
                  O teu plano nutricional foi gerado e esta a ser revisto pela tua coach.
                  Vais ter acesso assim que for aprovado!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem + Streak */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #F0FDF4 100%)', borderLeft: '4px solid #7C8B6F' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(124,139,111,0.15)' }}>✨</div>
              <div>
                <p className="text-gray-800 font-medium text-sm md:text-base" style={{ fontFamily: 'var(--font-titulos)' }}>"Cada escolha consciente te aproxima da melhor versão de ti."</p>
                <p className="text-xs text-gray-500 mt-1">
                  Dia {Math.floor((new Date() - new Date(client?.data_inicio || new Date())) / (1000 * 60 * 60 * 24)) + 1} da tua jornada •
                  {t('vitalis.dashboard.week')} {Math.floor((new Date() - new Date(client?.data_inicio || new Date())) / (7 * 24 * 60 * 60 * 1000)) + 1} •
                  {(() => {
                    const abordagem = plano?.abordagem || intake?.abordagem_preferida || 'equilibrado';
                    const faseNomes = {
                      keto_if: { inducao: 'Indução', transicao: 'Transição', recomposicao: 'Recomposição', manutencao: 'Manutenção' },
                      low_carb: { inducao: 'Adaptação', transicao: 'Transição', recomposicao: 'Recomposição', manutencao: 'Manutenção' },
                      equilibrado: { inducao: 'Arranque', transicao: 'Progressão', recomposicao: 'Consolidação', manutencao: 'Manutenção' }
                    };
                    const nomes = faseNomes[abordagem] || faseNomes.equilibrado;
                    return nomes[plano?.fase] || plano?.fase || 'Inicial';
                  })()}
                </p>
              </div>
            </div>
          </div>
          
          {streak > 0 && (
            <div className="md:w-64">
              <StreakDisplay streak={streak} melhorStreak={melhorStreak} compacto={false} />
            </div>
          )}
        </div>

        {/* Quick Actions - Navegação Principal */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
          {[
            { to: '/vitalis/plano', emoji: '📋', label: t('vitalis.dashboard.meal_plan'), cor: '#7C8B6F', bg: 'linear-gradient(145deg, #F0FDF4, #DCFCE7)' },
            { to: '/vitalis/checkin', emoji: '✅', label: t('vitalis.dashboard.daily_checkin'), cor: '#059669', bg: 'linear-gradient(145deg, #ECFDF5, #D1FAE5)' },
            { to: '/vitalis/meals', emoji: '🍽️', label: 'Refeições', cor: '#D97706', bg: 'linear-gradient(145deg, #FFFBEB, #FEF3C7)' },
            { to: '/vitalis/receitas', emoji: '🍳', label: t('vitalis.dashboard.recipes'), cor: '#EA580C', bg: 'linear-gradient(145deg, #FFF7ED, #FFEDD5)' },
            { to: '/vitalis/tendencias', emoji: '📏', label: 'Medidas', cor: '#F59E0B', bg: 'linear-gradient(145deg, #FFFBEB, #FEF3C7)' },
            { to: '/vitalis/espaco-retorno', emoji: '💜', label: 'Espaço Retorno', cor: '#9333EA', bg: 'linear-gradient(145deg, #FAF5FF, #F3E8FF)' },
            { to: '/vitalis/relatorios', emoji: '📊', label: 'Relatórios', cor: '#0891B2', bg: 'linear-gradient(145deg, #ECFEFF, #CFFAFE)' },
            { to: '/vitalis/treinos', emoji: '💪', label: t('vitalis.workouts.title'), cor: '#DC2626', bg: 'linear-gradient(145deg, #FEF2F2, #FECACA)' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="group rounded-2xl p-4 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 text-center"
              style={{ background: item.bg, borderBottom: `3px solid ${item.cor}` }}>
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <p className="font-semibold text-[#4A4035] text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>{item.label}</p>
            </Link>
          ))}
        </div>

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
              treinoHoje={treinoHoje}
              ehDiaTreino={ehDiaTreino}
              sonoHoje={sonoHoje}
              humor={humor}
              onAddWater={adicionarAgua}
              onLogWorkout={registarTreino}
              onLogSleep={registarSono}
              onMoodSelect={registarHumor}
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
            <Link to="/vitalis/guia-ramadao" className="block">
              <div className="bg-gradient-to-r from-[#1a1a3e] via-[#2d2d5e] to-[#1a3a4e] rounded-3xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-2 right-4 text-5xl opacity-20">🌙</div>
                <div className="absolute top-8 right-16 text-xl opacity-15">⭐</div>
                <div className="relative flex items-center gap-4">
                  <div className="text-4xl">🌙</div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">
                      {dentroRamadao ? 'Ramadan Mubarak!' : 'O Ramadan está a chegar!'}
                    </h3>
                    <p className="text-white/70 text-sm mt-1">
                      {dentroRamadao
                        ? 'Guia nutricional completo para o mês sagrado - Suhoor, Iftar e mais'
                        : 'Prepara-te com o nosso guia nutricional para o mês sagrado'}
                    </p>
                  </div>
                  <div className="text-white/60 text-xl">→</div>
                </div>
              </div>
            </Link>
          );
        })()}

        {/* Funcionalidades Premium - NOVAS */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">Funcionalidades Premium</h3>
              <p className="text-white/70 text-sm">Explora todas as ferramentas</p>
            </div>
            <span className="text-3xl">✨</span>
          </div>

          {/* Guia do Utilizador - Destacado no topo */}
          <Link to="/vitalis/guia" className="group flex items-center gap-4 bg-white/30 hover:bg-white/40 rounded-xl p-4 transition-all backdrop-blur-sm mb-3">
            <div className="text-4xl group-hover:scale-110 transition-transform">📖</div>
            <div className="flex-1">
              <p className="font-bold text-white">Guia do Utilizador</p>
              <p className="text-white/80 text-sm">Aprende a usar todas as funcionalidades da app</p>
            </div>
            <span className="text-white/60 text-xl">→</span>
          </Link>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {/* Chat Coach */}
            <Link to="/vitalis/chat" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💬</div>
              <p className="font-semibold text-white text-sm">{t('vitalis.dashboard.coach_chat')}</p>
              <p className="text-white/70 text-xs mt-1">Fala com a coach</p>
            </Link>

            {/* Desafios */}
            <Link to="/vitalis/desafios" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎯</div>
              <p className="font-semibold text-white text-sm">Desafios</p>
              <p className="text-white/70 text-xs mt-1">Desafios semanais</p>
            </Link>

            {/* Lista de Compras */}
            <Link to="/vitalis/lista-compras" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛒</div>
              <p className="font-semibold text-white text-sm">{t('vitalis.dashboard.shopping_list')}</p>
              <p className="text-white/70 text-xs mt-1">Lista automática</p>
            </Link>

            {/* Sugestões */}
            <Link to="/vitalis/sugestoes" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💡</div>
              <p className="font-semibold text-white text-sm">Sugestões</p>
              <p className="text-white/70 text-xs mt-1">O que comer</p>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Calendário de Refeições */}
            <Link to="/vitalis/calendario" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</div>
              <p className="font-semibold text-white text-sm">Calendário</p>
              <p className="text-white/70 text-xs mt-1">Planear semana</p>
            </Link>

            {/* Fotos Progresso */}
            <Link to="/vitalis/fotos-progresso" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📸</div>
              <p className="font-semibold text-white text-sm">Fotos</p>
              <p className="text-white/70 text-xs mt-1">Antes e depois</p>
            </Link>

            {/* Gráficos de Tendência */}
            <Link to="/vitalis/tendencias" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📈</div>
              <p className="font-semibold text-white text-sm">Tendências</p>
              <p className="text-white/70 text-xs mt-1">Peso, medidas, água</p>
            </Link>

            {/* Notificações */}
            <Link to="/vitalis/notificacoes" className="group bg-white/20 hover:bg-white/30 rounded-xl p-4 transition-all text-center backdrop-blur-sm">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔔</div>
              <p className="font-semibold text-white text-sm">Lembretes</p>
              <p className="text-white/70 text-xs mt-1">Configurar alertas</p>
            </Link>
          </div>
        </div>

        {/* Secção de Conquistas */}
        <AchievementsPanel
          conquistasDesbloqueadas={conquistasDesbloqueadas}
          xpTotal={xpTotal}
        />

      </main>

      {/* Modal de Celebração de Conquistas */}
      <CelebracaoModal
        conquista={conquistaActual}
        show={showCelebracao}
        onClose={() => {
          setShowCelebracao(false);
          setConquistaActual(null);
        }}
      />

      {/* Modal de Seleção de Avatar */}
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

      {/* Modal de Conquistas agora está dentro de AchievementsPanel */}

      {/* Onboarding para novos utilizadores */}
      {mostrarOnboarding && (
        <OnboardingWrapper onComplete={completarOnboarding} />
      )}
    </div>
  );
}
