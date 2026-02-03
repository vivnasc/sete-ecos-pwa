import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_CONFIG,
  setAsTester,
  startTrial,
  confirmManualPayment,
  getSubscriptionStats
} from '../lib/subscriptions';

/**
 * SETE ECOS - SUPER COACH DASHBOARD
 *
 * Centro de comando para a coach:
 * - Visao geral em tempo real
 * - Clientes que precisam de atencao
 * - WhatsApp comunidade
 * - Sistema de motivacoes automaticas
 * - Notificacoes importantes
 * - Quick actions
 */

// Link da comunidade WhatsApp
const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/FbHbQuDPGAZ3myiu29CmHO';

const CoachDashboard = () => {
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('command');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMotivationModal, setShowMotivationModal] = useState(false);
  const [selectedMotivationType, setSelectedMotivationType] = useState(null);

  // Dados
  const [stats, setStats] = useState({
    totalUsers: 0,
    novosHoje: 0,
    novosSemana: 0,
    comLumina: 0,
    comVitalis: 0,
    waitlistTotal: 0,
    activeToday: 0,
    needAttention: 0
  });
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [clientsNeedAttention, setClientsNeedAttention] = useState([]);
  const [coachNotifications, setCoachNotifications] = useState([]);
  const [motivationQueue, setMotivationQueue] = useState([]);

  // Subscricoes
  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [vitalisClients, setVitalisClients] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(null);

  // Auto-refresh
  const refreshInterval = useRef(null);

  useEffect(() => {
    loadAllData();
    // Auto-refresh a cada 60 segundos
    refreshInterval.current = setInterval(loadAllData, 60000);
    return () => clearInterval(refreshInterval.current);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadAlerts(),
      loadWaitlist(),
      loadActivityFeed(),
      loadClientsNeedAttention(),
      generateCoachNotifications(),
      loadSubscriptionData()
    ]);
    setLoading(false);
  };

  // ============================================================
  // CARREGAR ESTATISTICAS EXPANDIDAS
  // ============================================================
  const loadStats = async () => {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const semanaAtras = new Date();
      semanaAtras.setDate(semanaAtras.getDate() - 7);

      const [
        { count: totalUsers },
        { count: novosHoje },
        { count: novosSemana },
        { count: comLumina },
        { count: comVitalis },
        { count: waitlistTotal },
        { count: activeToday }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', hoje.toISOString()),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', semanaAtras.toISOString()),
        supabase.from('lumina_checkins').select('user_id', { count: 'exact', head: true }),
        supabase.from('vitalis_clients').select('user_id', { count: 'exact', head: true }),
        supabase.from('waitlist').select('*', { count: 'exact', head: true }),
        supabase.from('vitalis_registos').select('*', { count: 'exact', head: true }).gte('created_at', hoje.toISOString())
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        novosHoje: novosHoje || 0,
        novosSemana: novosSemana || 0,
        comLumina: comLumina || 0,
        comVitalis: comVitalis || 0,
        waitlistTotal: waitlistTotal || 0,
        activeToday: activeToday || 0,
        needAttention: 0 // Updated by loadClientsNeedAttention
      });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  // ============================================================
  // CARREGAR UTILIZADORES COM MAIS DADOS
  // ============================================================
  const loadUsers = async () => {
    try {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, nome, email, created_at')
        .order('created_at', { ascending: false });

      if (!usersData) return;

      const { data: luminaData } = await supabase.from('lumina_checkins').select('user_id, created_at');
      const { data: vitalisData } = await supabase.from('vitalis_clients').select('user_id, objectivo_principal, fase_actual, ultimo_registo, peso_inicial, peso_actual');
      const { data: registosData } = await supabase.from('vitalis_registos').select('user_id, data, created_at').order('created_at', { ascending: false });

      const luminaMap = new Map();
      luminaData?.forEach(l => {
        if (!luminaMap.has(l.user_id) || new Date(l.created_at) > new Date(luminaMap.get(l.user_id))) {
          luminaMap.set(l.user_id, l.created_at);
        }
      });

      const vitalisMap = new Map(vitalisData?.map(v => [v.user_id, v]) || []);

      const lastActivityMap = new Map();
      registosData?.forEach(r => {
        if (!lastActivityMap.has(r.user_id)) {
          lastActivityMap.set(r.user_id, r.created_at);
        }
      });

      const combinedUsers = usersData.map(user => {
        const vitalis = vitalisMap.get(user.id);
        const lastActivity = lastActivityMap.get(user.id) || user.created_at;
        const daysSinceActivity = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));

        return {
          ...user,
          temLumina: luminaMap.has(user.id),
          lastLumina: luminaMap.get(user.id),
          temVitalis: vitalisMap.has(user.id),
          vitalisInfo: vitalis || null,
          lastActivity,
          daysSinceActivity,
          status: daysSinceActivity === 0 ? 'active' : daysSinceActivity <= 2 ? 'recent' : daysSinceActivity <= 7 ? 'cooling' : 'inactive',
          progressoPeso: vitalis ? ((vitalis.peso_inicial - vitalis.peso_actual) / vitalis.peso_inicial * 100).toFixed(1) : null
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Erro ao carregar users:', error);
    }
  };

  // ============================================================
  // CARREGAR FEED DE ATIVIDADE EM TEMPO REAL
  // ============================================================
  const loadActivityFeed = async () => {
    try {
      const hoje = new Date();
      hoje.setDate(hoje.getDate() - 1); // Ultimas 24h

      const [
        { data: registos },
        { data: agua },
        { data: meals },
        { data: lumina }
      ] = await Promise.all([
        supabase.from('vitalis_registos').select('*, users(nome)').gte('created_at', hoje.toISOString()).order('created_at', { ascending: false }).limit(20),
        supabase.from('vitalis_agua_log').select('*, users(nome)').gte('created_at', hoje.toISOString()).order('created_at', { ascending: false }).limit(10),
        supabase.from('vitalis_meals_log').select('*, users(nome)').gte('created_at', hoje.toISOString()).order('created_at', { ascending: false }).limit(10),
        supabase.from('lumina_checkins').select('*, users(nome)').gte('created_at', hoje.toISOString()).order('created_at', { ascending: false }).limit(10)
      ]);

      const feed = [
        ...(registos || []).map(r => ({ type: 'checkin', data: r, time: r.created_at, icon: '✅', text: `${r.users?.nome || 'Alguem'} fez check-in diario` })),
        ...(agua || []).map(a => ({ type: 'agua', data: a, time: a.created_at, icon: '💧', text: `${a.users?.nome || 'Alguem'} registou agua` })),
        ...(meals || []).map(m => ({ type: 'meal', data: m, time: m.created_at, icon: '🍽️', text: `${m.users?.nome || 'Alguem'} registou refeicao` })),
        ...(lumina || []).map(l => ({ type: 'lumina', data: l, time: l.created_at, icon: '💡', text: `${l.users?.nome || 'Alguem'} completou Lumina` }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 20);

      setActivityFeed(feed);
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
    }
  };

  // ============================================================
  // CLIENTES QUE PRECISAM DE ATENCAO
  // ============================================================
  const loadClientsNeedAttention = async () => {
    try {
      const { data: vitalisClients } = await supabase
        .from('vitalis_clients')
        .select('*, users(nome, email)');

      if (!vitalisClients) return;

      const needAttention = [];

      for (const client of vitalisClients) {
        const { data: lastRegisto } = await supabase
          .from('vitalis_registos')
          .select('created_at, aderencia_1a10')
          .eq('user_id', client.user_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const daysSinceActivity = lastRegisto
          ? Math.floor((new Date() - new Date(lastRegisto.created_at)) / (1000 * 60 * 60 * 24))
          : 999;

        const reasons = [];

        if (daysSinceActivity >= 3) {
          reasons.push({ type: 'inactive', text: `Inativo ha ${daysSinceActivity} dias`, priority: daysSinceActivity >= 7 ? 'high' : 'medium' });
        }

        if (lastRegisto?.aderencia_1a10 && lastRegisto.aderencia_1a10 <= 4) {
          reasons.push({ type: 'struggling', text: `Aderencia baixa (${lastRegisto.aderencia_1a10}/10)`, priority: 'high' });
        }

        if (client.peso_actual && client.peso_inicial && client.peso_actual > client.peso_inicial) {
          reasons.push({ type: 'weight_gain', text: 'Ganhou peso desde o inicio', priority: 'medium' });
        }

        if (reasons.length > 0) {
          needAttention.push({
            ...client,
            nome: client.users?.nome,
            email: client.users?.email,
            daysSinceActivity,
            reasons,
            priority: reasons.some(r => r.priority === 'high') ? 'high' : 'medium'
          });
        }
      }

      // Ordenar por prioridade e dias de inatividade
      needAttention.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
        return b.daysSinceActivity - a.daysSinceActivity;
      });

      setClientsNeedAttention(needAttention);
      setStats(prev => ({ ...prev, needAttention: needAttention.length }));
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  // ============================================================
  // GERAR NOTIFICACOES PARA A COACH
  // ============================================================
  const generateCoachNotifications = async () => {
    const notifications = [];
    const hoje = new Date();

    // Novos registos na waitlist
    const { data: newWaitlist } = await supabase
      .from('waitlist')
      .select('*')
      .gte('created_at', new Date(hoje.getTime() - 24 * 60 * 60 * 1000).toISOString());

    if (newWaitlist?.length > 0) {
      notifications.push({
        type: 'waitlist',
        icon: '📋',
        title: `${newWaitlist.length} novos na waitlist!`,
        text: newWaitlist.map(w => w.nome).join(', '),
        priority: 'high',
        action: () => setActiveTab('waitlist')
      });
    }

    // Clientes inativos ha muito tempo
    const { data: inactiveCheck } = await supabase
      .from('vitalis_clients')
      .select('user_id, users(nome)')
      .lt('ultimo_registo', new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (inactiveCheck?.length > 0) {
      notifications.push({
        type: 'inactive',
        icon: '⚠️',
        title: `${inactiveCheck.length} clientes inativos`,
        text: 'Ha mais de 7 dias sem atividade',
        priority: 'high',
        action: () => setActiveTab('attention')
      });
    }

    // Alertas do sistema
    const { count: alertCount } = await supabase
      .from('vitalis_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente');

    if (alertCount > 0) {
      notifications.push({
        type: 'alerts',
        icon: '🔔',
        title: `${alertCount} alertas pendentes`,
        text: 'Requerem a tua atencao',
        priority: 'medium',
        action: () => setActiveTab('alertas')
      });
    }

    setCoachNotifications(notifications);
  };

  // ============================================================
  // CARREGAR DADOS DE SUBSCRICOES
  // ============================================================
  const loadSubscriptionData = async () => {
    try {
      // Stats de subscricao
      const stats = await getSubscriptionStats();
      setSubscriptionStats(stats);

      // Clientes Vitalis com info de subscricao
      const { data: clients } = await supabase
        .from('vitalis_clients')
        .select('*, users(nome, email)')
        .order('subscription_updated', { ascending: false });

      setVitalisClients(clients || []);

      // Pagamentos pendentes
      const pending = (clients || []).filter(c => c.subscription_status === 'pending');
      setPendingPayments(pending);

      // Notificacao para pagamentos pendentes
      if (pending.length > 0) {
        setCoachNotifications(prev => {
          const filtered = prev.filter(n => n.type !== 'pending_payment');
          return [...filtered, {
            type: 'pending_payment',
            icon: '💰',
            title: `${pending.length} pagamento(s) pendente(s)`,
            text: 'Aguardam confirmacao',
            priority: 'high',
            action: () => setActiveTab('subscriptions')
          }];
        });
      }
    } catch (error) {
      console.error('Erro ao carregar subscricoes:', error);
    }
  };

  // Marcar como tester
  const handleSetAsTester = async (userId, notes = '') => {
    const result = await setAsTester(userId, notes);
    if (result.success) {
      await loadSubscriptionData();
    }
    return result;
  };

  // Iniciar trial
  const handleStartTrial = async (userId) => {
    const result = await startTrial(userId);
    if (result.success) {
      await loadSubscriptionData();
    }
    return result;
  };

  // Confirmar pagamento manual
  const handleConfirmPayment = async (userId, paymentDetails) => {
    const result = await confirmManualPayment(userId, paymentDetails);
    if (result.success) {
      setShowConfirmPaymentModal(null);
      await loadSubscriptionData();
    }
    return result;
  };

  // ============================================================
  // ALERTAS E WAITLIST
  // ============================================================
  const loadAlerts = async () => {
    try {
      const { data } = await supabase
        .from('vitalis_alerts')
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false })
        .limit(20);
      setAlerts(data || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const loadWaitlist = async () => {
    try {
      const { data } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false });
      setWaitlist(data || []);
    } catch (error) {
      console.error('Erro ao carregar waitlist:', error);
    }
  };

  // ============================================================
  // ACOES RAPIDAS
  // ============================================================
  const markAlertAsRead = async (alertId) => {
    await supabase.from('vitalis_alerts').update({ status: 'lido' }).eq('id', alertId);
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const sendMotivation = async (userId, type, customMessage = null) => {
    // Guardar na fila de motivacoes
    const motivationTemplates = {
      comeback: '🌟 Ola! Senti a tua falta por aqui. Lembra-te: cada dia e uma nova oportunidade para cuidares de ti. Estou aqui para te apoiar!',
      progress: '💪 Parabens pelo teu progresso! Continua assim, estas a fazer um trabalho incrivel!',
      struggle: '💜 Sei que nem todos os dias sao faceis. Lembra-te que pequenos passos tambem contam. Estou aqui contigo.',
      weekly: '✨ Nova semana, novas possibilidades! Vamos definir uma intencao para esta semana?',
      celebration: '🎉 Que conquista! Estou tao orgulhosa do teu caminho. Continua a brilhar!'
    };

    const message = customMessage || motivationTemplates[type];

    // Aqui poderia integrar com WhatsApp Business API ou email
    // Por agora, guardamos na base de dados
    await supabase.from('vitalis_alerts').insert({
      user_id: userId,
      tipo_alerta: 'motivacao_coach',
      descricao: message,
      prioridade: 'baixa',
      status: 'enviado'
    });

    setMotivationQueue(prev => [...prev, { userId, type, message, sentAt: new Date() }]);
  };

  const loadUserDetails = async (userId) => {
    setSelectedUser(userId);

    try {
      const [
        { data: user },
        { data: lumina },
        { data: vitalisClient },
        { data: vitalisPlano },
        { data: pdfs },
        { data: agua },
        { data: registos },
        { data: meals }
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('lumina_checkins').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('vitalis_clients').select('*').eq('user_id', userId).single(),
        supabase.from('vitalis_plano').select('*').eq('client_id', userId).single(),
        supabase.from('vitalis_pdfs_gerados').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('vitalis_agua_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(14),
        supabase.from('vitalis_registos').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(14),
        supabase.from('vitalis_meals_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30)
      ]);

      // Calcular metricas
      const avgAderencia = registos?.length > 0
        ? (registos.reduce((sum, r) => sum + (r.aderencia_1a10 || 0), 0) / registos.length).toFixed(1)
        : null;

      const avgAgua = agua?.length > 0
        ? (agua.reduce((sum, a) => sum + (a.quantidade_ml || 0), 0) / agua.length / 1000).toFixed(1)
        : null;

      const mealsFollowed = meals?.filter(m => m.seguiu_plano === 'sim').length || 0;
      const mealsTotal = meals?.length || 0;
      const mealAdherence = mealsTotal > 0 ? Math.round(mealsFollowed / mealsTotal * 100) : 0;

      setUserDetails({
        user,
        lumina: lumina || [],
        vitalisClient,
        vitalisPlano,
        pdfs: pdfs || [],
        agua: agua || [],
        registos: registos || [],
        meals: meals || [],
        metrics: {
          avgAderencia,
          avgAgua,
          mealAdherence,
          totalCheckins: registos?.length || 0,
          streak: calculateStreak(registos)
        }
      });
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const calculateStreak = (registos) => {
    if (!registos || registos.length === 0) return 0;
    let streak = 0;
    const sorted = [...registos].sort((a, b) => new Date(b.data) - new Date(a.data));
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const registo of sorted) {
      const registoDate = new Date(registo.data);
      registoDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((currentDate - registoDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        currentDate = registoDate;
      } else {
        break;
      }
    }
    return streak;
  };

  // ============================================================
  // FORMATADORES
  // ============================================================
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDateShort = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  };

  const formatTimeAgo = (date) => {
    if (!date) return '-';
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // ============================================================
  // RENDER - LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300 text-lg">A carregar o teu centro de comando...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - MAIN DASHBOARD
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Premium */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-purple-500/20 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
              🎯
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Super Coach Dashboard
              </h1>
              <p className="text-sm text-purple-300">Sete Ecos • Centro de Comando</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notificacoes */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <span className="text-xl">🔔</span>
              {coachNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {coachNotifications.length}
                </span>
              )}
            </button>

            {/* WhatsApp Comunidade */}
            <a
              href={WHATSAPP_COMMUNITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-all border border-green-500/30"
            >
              <span className="text-xl">💬</span>
              <span className="hidden md:inline font-medium">Comunidade</span>
            </a>

            {/* Refresh */}
            <button
              onClick={loadAllData}
              className="p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-all"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Dropdown Notificacoes */}
        {showNotifications && coachNotifications.length > 0 && (
          <div className="absolute right-6 top-20 w-80 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden z-50">
            <div className="p-4 border-b border-purple-500/20">
              <h3 className="font-bold text-white">Notificacoes</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {coachNotifications.map((notif, i) => (
                <button
                  key={i}
                  onClick={() => { notif.action?.(); setShowNotifications(false); }}
                  className="w-full p-4 hover:bg-white/5 transition-all text-left border-b border-purple-500/10 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-xl ${notif.priority === 'high' ? 'animate-pulse' : ''}`}>{notif.icon}</span>
                    <div>
                      <p className="font-medium text-white">{notif.title}</p>
                      <p className="text-sm text-purple-300">{notif.text}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards - Command View */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <StatCardPremium icon="👥" label="Total" value={stats.totalUsers} color="blue" />
          <StatCardPremium icon="🆕" label="Hoje" value={stats.novosHoje} color="green" highlight={stats.novosHoje > 0} />
          <StatCardPremium icon="📅" label="Semana" value={stats.novosSemana} color="purple" />
          <StatCardPremium icon="⚡" label="Ativos Hoje" value={stats.activeToday} color="yellow" />
          <StatCardPremium icon="💡" label="Lumina" value={stats.comLumina} color="amber" />
          <StatCardPremium icon="🌱" label="Vitalis" value={stats.comVitalis} color="emerald" />
          <StatCardPremium icon="📋" label="Waitlist" value={stats.waitlistTotal} color="orange" highlight={stats.waitlistTotal > 0} />
          <StatCardPremium icon="⚠️" label="Atencao" value={stats.needAttention} color="red" highlight={stats.needAttention > 0} />
        </div>

        {/* Tabs Premium */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'command', label: '🎯 Comando', count: null },
            { id: 'attention', label: '⚠️ Atencao', count: clientsNeedAttention.length },
            { id: 'subscriptions', label: '💰 Subscricoes', count: pendingPayments.length },
            { id: 'users', label: '👥 Clientes', count: users.length },
            { id: 'waitlist', label: '📋 Waitlist', count: waitlist.length },
            { id: 'alertas', label: '🔔 Alertas', count: alerts.length },
            { id: 'motivations', label: '💜 Motivacoes', count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedUser(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/10 text-purple-300 hover:bg-white/20'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-purple-500/30'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-purple-500/20 overflow-hidden">

          {/* TAB: CENTRO DE COMANDO */}
          {activeTab === 'command' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Feed de Atividade */}
                <div className="lg:col-span-2 bg-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-2xl">⚡</span> Atividade em Tempo Real
                    </h3>
                    <span className="text-xs text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full">
                      Ultimas 24h
                    </span>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activityFeed.length === 0 ? (
                      <p className="text-center text-purple-400 py-8">Sem atividade recente</p>
                    ) : (
                      activityFeed.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                          <span className="text-xl">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{item.text}</p>
                          </div>
                          <span className="text-xs text-purple-400 whitespace-nowrap">{formatTimeAgo(item.time)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/5 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🚀</span> Acoes Rapidas
                  </h3>

                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('attention')}
                      className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-left transition-all border border-red-500/20 group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">⚠️ Clientes que precisam de ti</p>
                          <p className="text-sm text-red-300">{clientsNeedAttention.length} clientes</p>
                        </div>
                        <span className="text-red-400 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('waitlist')}
                      className="w-full p-4 bg-orange-500/20 hover:bg-orange-500/30 rounded-xl text-left transition-all border border-orange-500/20 group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">📋 Ver Waitlist</p>
                          <p className="text-sm text-orange-300">{waitlist.length} interessados</p>
                        </div>
                        <span className="text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowMotivationModal(true)}
                      className="w-full p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-left transition-all border border-purple-500/20 group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">💜 Enviar Motivacao</p>
                          <p className="text-sm text-purple-300">Mensagem automatica</p>
                        </div>
                        <span className="text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </button>

                    <a
                      href={WHATSAPP_COMMUNITY_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full p-4 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-left transition-all border border-green-500/20 group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">💬 Abrir Comunidade</p>
                          <p className="text-sm text-green-300">WhatsApp grupo</p>
                        </div>
                        <span className="text-green-400 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </a>
                  </div>

                  {/* Mini Stats */}
                  <div className="mt-6 pt-4 border-t border-purple-500/20">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-400">{stats.activeToday}</p>
                        <p className="text-xs text-purple-300">Ativos hoje</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-purple-400">{users.filter(u => u.temVitalis).length}</p>
                        <p className="text-xs text-purple-300">Total Vitalis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLIENTES QUE PRECISAM DE ATENCAO */}
          {activeTab === 'attention' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">⚠️</span> Clientes que Precisam de Atencao
              </h2>

              {clientsNeedAttention.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🎉</span>
                  <p className="text-purple-300 text-lg">Todos os clientes estao bem!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientsNeedAttention.map((client, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border transition-all ${
                        client.priority === 'high'
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-yellow-500/10 border-yellow-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-white text-lg">{client.nome}</p>
                          <p className="text-sm text-purple-300">{client.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {client.reasons.map((reason, j) => (
                              <span
                                key={j}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  reason.priority === 'high'
                                    ? 'bg-red-500/30 text-red-300'
                                    : 'bg-yellow-500/30 text-yellow-300'
                                }`}
                              >
                                {reason.text}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => sendMotivation(client.user_id, 'comeback')}
                            className="px-3 py-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 rounded-lg text-sm transition-all"
                          >
                            💜 Motivar
                          </button>
                          <button
                            onClick={() => loadUserDetails(client.user_id)}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
                          >
                            Ver →
                          </button>
                          {client.users?.email && (
                            <a
                              href={`https://wa.me/?text=Ola ${client.nome}! Como estas? Senti a tua falta no Vitalis 🌱`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-green-500/30 hover:bg-green-500/50 text-green-300 rounded-lg text-sm transition-all"
                            >
                              💬
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SUBSCRICOES */}
          {activeTab === 'subscriptions' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                💰 Gestao de Subscricoes
              </h2>

              {/* Stats de Subscricao */}
              {subscriptionStats && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                  <div className="bg-emerald-500/20 rounded-xl p-4 text-center border border-emerald-500/30">
                    <p className="text-2xl font-bold text-emerald-400">{subscriptionStats.testers}</p>
                    <p className="text-xs text-purple-300">Testers</p>
                  </div>
                  <div className="bg-blue-500/20 rounded-xl p-4 text-center border border-blue-500/30">
                    <p className="text-2xl font-bold text-blue-400">{subscriptionStats.trial}</p>
                    <p className="text-xs text-purple-300">Trial</p>
                  </div>
                  <div className="bg-green-500/20 rounded-xl p-4 text-center border border-green-500/30">
                    <p className="text-2xl font-bold text-green-400">{subscriptionStats.active}</p>
                    <p className="text-xs text-purple-300">Ativos</p>
                  </div>
                  <div className="bg-yellow-500/20 rounded-xl p-4 text-center border border-yellow-500/30">
                    <p className="text-2xl font-bold text-yellow-400">{subscriptionStats.pending}</p>
                    <p className="text-xs text-purple-300">Pendentes</p>
                  </div>
                  <div className="bg-red-500/20 rounded-xl p-4 text-center border border-red-500/30">
                    <p className="text-2xl font-bold text-red-400">{subscriptionStats.expired}</p>
                    <p className="text-xs text-purple-300">Expirados</p>
                  </div>
                  <div className="bg-gray-500/20 rounded-xl p-4 text-center border border-gray-500/30">
                    <p className="text-2xl font-bold text-gray-400">{subscriptionStats.none}</p>
                    <p className="text-xs text-purple-300">Sem Sub</p>
                  </div>
                </div>
              )}

              {/* Pagamentos Pendentes */}
              {pendingPayments.length > 0 && (
                <div className="mb-6 bg-yellow-500/10 rounded-2xl p-5 border border-yellow-500/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    ⏳ Pagamentos Pendentes ({pendingPayments.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingPayments.map(client => (
                      <div key={client.user_id} className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{client.users?.nome}</p>
                          <p className="text-sm text-purple-300">{client.users?.email}</p>
                          <p className="text-xs text-yellow-400 mt-1">
                            {client.payment_method === 'paypal' ? '💳 PayPal' :
                             client.payment_method === 'mpesa' ? '📱 M-Pesa' :
                             client.payment_method === 'transfer' ? '🏦 Transferencia' :
                             '❓ ' + (client.payment_method || 'Metodo desconhecido')}
                            {client.payment_reference && ` - Ref: ${client.payment_reference}`}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowConfirmPaymentModal(client)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
                        >
                          ✓ Confirmar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de Clientes Vitalis */}
              <div className="bg-white/5 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-4">
                  🌱 Clientes Vitalis ({vitalisClients.length})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left py-3 px-3 text-sm font-medium text-purple-300">Nome</th>
                        <th className="text-center py-3 px-3 text-sm font-medium text-purple-300">Status</th>
                        <th className="text-center py-3 px-3 text-sm font-medium text-purple-300">Metodo</th>
                        <th className="text-center py-3 px-3 text-sm font-medium text-purple-300">Expira</th>
                        <th className="text-right py-3 px-3 text-sm font-medium text-purple-300">Acoes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitalisClients.map(client => (
                        <tr key={client.user_id} className="border-b border-purple-500/10 hover:bg-white/5 transition-all">
                          <td className="py-3 px-3">
                            <p className="font-medium text-white">{client.users?.nome}</p>
                            <p className="text-xs text-purple-400">{client.users?.email}</p>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              client.subscription_status === 'tester' ? 'bg-emerald-500/30 text-emerald-300' :
                              client.subscription_status === 'trial' ? 'bg-blue-500/30 text-blue-300' :
                              client.subscription_status === 'active' ? 'bg-green-500/30 text-green-300' :
                              client.subscription_status === 'pending' ? 'bg-yellow-500/30 text-yellow-300' :
                              client.subscription_status === 'expired' ? 'bg-red-500/30 text-red-300' :
                              'bg-gray-500/30 text-gray-300'
                            }`}>
                              {client.subscription_status || 'sem status'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-sm text-purple-300">
                            {client.payment_method || '-'}
                          </td>
                          <td className="py-3 px-3 text-center text-sm text-purple-300">
                            {client.subscription_expires ? formatDateShort(client.subscription_expires) : '-'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex gap-2 justify-end">
                              {(!client.subscription_status || client.subscription_status === 'expired' || !client.subscription_status) && (
                                <>
                                  <button
                                    onClick={() => handleSetAsTester(client.user_id, 'Via Coach Dashboard')}
                                    className="px-3 py-1 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 rounded-lg text-xs transition-all"
                                  >
                                    Tester
                                  </button>
                                  <button
                                    onClick={() => handleStartTrial(client.user_id)}
                                    className="px-3 py-1 bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 rounded-lg text-xs transition-all"
                                  >
                                    Trial
                                  </button>
                                </>
                              )}
                              {client.subscription_status === 'pending' && (
                                <button
                                  onClick={() => setShowConfirmPaymentModal(client)}
                                  className="px-3 py-1 bg-green-500/30 hover:bg-green-500/50 text-green-300 rounded-lg text-xs transition-all"
                                >
                                  Confirmar $
                                </button>
                              )}
                              {client.subscription_status === 'trial' && (
                                <button
                                  onClick={() => handleSetAsTester(client.user_id, 'Upgrade de trial')}
                                  className="px-3 py-1 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 rounded-lg text-xs transition-all"
                                >
                                  → Tester
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <h4 className="font-medium text-white mb-2">ℹ️ Sobre os Status</h4>
                <ul className="text-sm text-purple-300 space-y-1">
                  <li>• <span className="text-emerald-400">Tester</span>: Acesso gratuito permanente (para testers)</li>
                  <li>• <span className="text-blue-400">Trial</span>: {SUBSCRIPTION_CONFIG.TRIAL_DAYS} dias de teste gratuito</li>
                  <li>• <span className="text-green-400">Active</span>: Pagamento confirmado (1 mes)</li>
                  <li>• <span className="text-yellow-400">Pending</span>: Aguarda confirmacao de pagamento</li>
                  <li>• <span className="text-red-400">Expired</span>: Trial ou subscricao expirou</li>
                  <li>• <strong>Precos</strong>: {SUBSCRIPTION_CONFIG.PRICE_USD} USD / {SUBSCRIPTION_CONFIG.PRICE_MZN} MZN</li>
                </ul>
              </div>
            </div>
          )}

          {/* Modal Confirmar Pagamento */}
          {showConfirmPaymentModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-4">✓ Confirmar Pagamento</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-purple-300 text-sm">Cliente</p>
                    <p className="text-white font-medium">{showConfirmPaymentModal.users?.nome}</p>
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">Metodo</p>
                    <p className="text-white">{showConfirmPaymentModal.payment_method || 'Nao especificado'}</p>
                  </div>
                  {showConfirmPaymentModal.payment_reference && (
                    <div>
                      <p className="text-purple-300 text-sm">Referencia</p>
                      <p className="text-white">{showConfirmPaymentModal.payment_reference}</p>
                    </div>
                  )}
                  <div className="bg-yellow-500/10 p-3 rounded-xl">
                    <p className="text-yellow-300 text-sm">
                      Ao confirmar, o cliente tera acesso por 1 mes a partir de hoje.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowConfirmPaymentModal(null)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleConfirmPayment(showConfirmPaymentModal.user_id, {
                      method: showConfirmPaymentModal.payment_method,
                      reference: showConfirmPaymentModal.payment_reference,
                      amount: SUBSCRIPTION_CONFIG.PRICE_USD
                    })}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
                  >
                    ✓ Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLIENTES */}
          {activeTab === 'users' && !selectedUser && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                👥 Todos os Clientes ({users.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-500/20">
                      <th className="text-left py-3 px-3 text-sm font-medium text-purple-300">Nome</th>
                      <th className="text-center py-3 px-3 text-sm font-medium text-purple-300">Status</th>
                      <th className="text-center py-3 px-3 text-sm font-medium text-purple-300">Lumina</th>
                      <th className="text-center py-3 px-3 text-sm font-medium text-purple-300">Vitalis</th>
                      <th className="text-center py-3 px-3 text-sm font-medium text-purple-300">Progresso</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-purple-300">Ultima Atividade</th>
                      <th className="text-right py-3 px-3 text-sm font-medium text-purple-300">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-purple-500/10 hover:bg-white/5 transition-all">
                        <td className="py-3 px-3">
                          <p className="font-medium text-white">{user.nome}</p>
                          <p className="text-xs text-purple-400">{user.email}</p>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block w-3 h-3 rounded-full ${
                            user.status === 'active' ? 'bg-green-500' :
                            user.status === 'recent' ? 'bg-yellow-500' :
                            user.status === 'cooling' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} title={`${user.daysSinceActivity} dias`}></span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {user.temLumina ? '✅' : '❌'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {user.temVitalis ? '✅' : '❌'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {user.progressoPeso && user.progressoPeso > 0 ? (
                            <span className="text-green-400 text-sm">↓{user.progressoPeso}%</span>
                          ) : user.progressoPeso && user.progressoPeso < 0 ? (
                            <span className="text-red-400 text-sm">↑{Math.abs(user.progressoPeso)}%</span>
                          ) : (
                            <span className="text-purple-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-sm text-purple-300">
                          {formatTimeAgo(user.lastActivity)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => loadUserDetails(user.id)}
                            className="px-3 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 rounded-lg text-sm transition-all"
                          >
                            Ver →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: USER DETAILS */}
          {activeTab === 'users' && selectedUser && userDetails && (
            <div className="p-6">
              <button
                onClick={() => { setSelectedUser(null); setUserDetails(null); }}
                className="mb-6 text-purple-400 hover:text-purple-300 flex items-center gap-2"
              >
                ← Voltar
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Principal */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Header do Cliente */}
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{userDetails.user?.nome}</h2>
                        <p className="text-purple-300">{userDetails.user?.email}</p>
                        <p className="text-sm text-purple-400 mt-1">Desde {formatDateShort(userDetails.user?.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendMotivation(selectedUser, 'progress')}
                          className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 rounded-xl transition-all"
                        >
                          💜 Enviar Motivacao
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metricas */}
                  {userDetails.metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-purple-400">{userDetails.metrics.avgAderencia || '-'}</p>
                        <p className="text-sm text-purple-300">Aderencia Media</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-blue-400">{userDetails.metrics.avgAgua || '-'}L</p>
                        <p className="text-sm text-purple-300">Agua Media</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-green-400">{userDetails.metrics.mealAdherence}%</p>
                        <p className="text-sm text-purple-300">Refeicoes Seguidas</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-orange-400">{userDetails.metrics.streak}</p>
                        <p className="text-sm text-purple-300">Dias Streak</p>
                      </div>
                    </div>
                  )}

                  {/* Vitalis Info */}
                  {userDetails.vitalisClient && (
                    <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        🌱 Vitalis
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-purple-400">Objectivo</p>
                          <p className="text-white font-medium">{userDetails.vitalisClient.objectivo_principal || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-400">Fase</p>
                          <p className="text-white font-medium">{userDetails.vitalisClient.fase_actual || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-400">Peso Inicial</p>
                          <p className="text-white font-medium">{userDetails.vitalisClient.peso_inicial || '-'} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-400">Peso Atual</p>
                          <p className="text-white font-medium">{userDetails.vitalisClient.peso_actual || '-'} kg</p>
                        </div>
                      </div>
                      {userDetails.vitalisClient.peso_inicial && userDetails.vitalisClient.peso_actual && (
                        <div className="mt-4 pt-4 border-t border-emerald-500/20">
                          <p className="text-sm text-purple-400">Progresso</p>
                          <p className={`text-xl font-bold ${
                            userDetails.vitalisClient.peso_actual < userDetails.vitalisClient.peso_inicial
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}>
                            {userDetails.vitalisClient.peso_actual < userDetails.vitalisClient.peso_inicial ? '↓' : '↑'}
                            {Math.abs(userDetails.vitalisClient.peso_inicial - userDetails.vitalisClient.peso_actual).toFixed(1)} kg
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lumina Info */}
                  {userDetails.lumina?.length > 0 && (
                    <div className="bg-yellow-500/10 rounded-2xl p-5 border border-yellow-500/20">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        💡 Lumina ({userDetails.lumina.length} check-ins)
                      </h3>
                      <div className="space-y-2">
                        {userDetails.lumina.slice(0, 3).map((l, i) => (
                          <div key={i} className="p-3 bg-white/5 rounded-xl">
                            <p className="text-sm text-purple-300">{formatDate(l.created_at)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Acoes Rapidas */}
                  <div className="bg-white/5 rounded-2xl p-5">
                    <h3 className="text-lg font-bold text-white mb-4">🎯 Acoes</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => sendMotivation(selectedUser, 'progress')}
                        className="w-full p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-left text-purple-300 transition-all"
                      >
                        💜 Parabens pelo progresso
                      </button>
                      <button
                        onClick={() => sendMotivation(selectedUser, 'struggle')}
                        className="w-full p-3 bg-pink-500/20 hover:bg-pink-500/30 rounded-xl text-left text-pink-300 transition-all"
                      >
                        🤗 Apoio emocional
                      </button>
                      <button
                        onClick={() => sendMotivation(selectedUser, 'weekly')}
                        className="w-full p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-left text-blue-300 transition-all"
                      >
                        ✨ Motivacao semanal
                      </button>
                    </div>
                  </div>

                  {/* PDFs */}
                  {userDetails.pdfs?.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-5">
                      <h3 className="text-lg font-bold text-white mb-4">📄 PDFs ({userDetails.pdfs.length})</h3>
                      <div className="space-y-2">
                        {userDetails.pdfs.slice(0, 3).map((pdf, i) => (
                          <a
                            key={i}
                            href={pdf.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-white/5 hover:bg-white/10 rounded-xl text-purple-300 text-sm transition-all"
                          >
                            {formatDateShort(pdf.created_at)} →
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: WAITLIST */}
          {activeTab === 'waitlist' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                📋 Lista de Espera ({waitlist.length})
              </h2>

              {waitlist.length === 0 ? (
                <p className="text-center text-purple-400 py-12">Nenhum registo na lista de espera</p>
              ) : (
                <div className="space-y-3">
                  {waitlist.map(lead => (
                    <div key={lead.id} className="p-4 bg-white/5 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{lead.nome}</p>
                          <p className="text-sm text-purple-300">{lead.email}</p>
                          <p className="text-xs text-purple-400 mt-1">{formatDate(lead.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full">
                            {lead.produto || 'geral'}
                          </span>
                          {lead.whatsapp && (
                            <a
                              href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}?text=Ola ${lead.nome}! Obrigada pelo interesse no Vitalis 🌱`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-green-500/30 hover:bg-green-500/50 text-green-300 rounded-xl text-sm transition-all flex items-center gap-2"
                            >
                              💬 WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ALERTAS */}
          {activeTab === 'alertas' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                🔔 Alertas Pendentes ({alerts.length})
              </h2>

              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">✨</span>
                  <p className="text-purple-300">Nenhum alerta pendente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className="p-4 bg-white/5 rounded-xl border-l-4 border-purple-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            alert.prioridade === 'alta' ? 'bg-red-500/30 text-red-300' :
                            alert.prioridade === 'media' ? 'bg-yellow-500/30 text-yellow-300' :
                            'bg-gray-500/30 text-gray-300'
                          }`}>
                            {alert.tipo_alerta}
                          </span>
                          <p className="text-white mt-2">{alert.descricao}</p>
                          <p className="text-xs text-purple-400 mt-1">{formatDate(alert.created_at)}</p>
                        </div>
                        <button
                          onClick={() => markAlertAsRead(alert.id)}
                          className="px-3 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 rounded-lg text-sm transition-all"
                        >
                          ✓ Marcar lido
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: MOTIVACOES */}
          {activeTab === 'motivations' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                💜 Sistema de Motivacoes Automaticas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Templates */}
                <div className="bg-white/5 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-white mb-4">📝 Templates de Motivacao</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'comeback', emoji: '🌟', title: 'Volta ao Caminho', desc: 'Para clientes inativos' },
                      { id: 'progress', emoji: '💪', title: 'Parabens', desc: 'Celebrar progresso' },
                      { id: 'struggle', emoji: '💜', title: 'Apoio', desc: 'Dias dificeis' },
                      { id: 'weekly', emoji: '✨', title: 'Semanal', desc: 'Nova semana' },
                      { id: 'celebration', emoji: '🎉', title: 'Celebracao', desc: 'Conquistas' }
                    ].map(template => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedMotivationType(template.id)}
                        className={`w-full p-4 rounded-xl text-left transition-all border ${
                          selectedMotivationType === template.id
                            ? 'bg-purple-500/30 border-purple-500'
                            : 'bg-white/5 border-purple-500/20 hover:border-purple-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{template.emoji}</span>
                          <div>
                            <p className="font-medium text-white">{template.title}</p>
                            <p className="text-sm text-purple-300">{template.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enviar para quem */}
                <div className="bg-white/5 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-white mb-4">🎯 Enviar Motivacao</h3>

                  {selectedMotivationType ? (
                    <div className="space-y-4">
                      <p className="text-purple-300">Seleciona os clientes para enviar:</p>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {users.filter(u => u.temVitalis).map(user => (
                          <label key={user.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer">
                            <input type="checkbox" className="rounded" />
                            <span className="text-white">{user.nome}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                              user.status === 'active' ? 'bg-green-500/30 text-green-300' :
                              user.status === 'inactive' ? 'bg-red-500/30 text-red-300' :
                              'bg-yellow-500/30 text-yellow-300'
                            }`}>
                              {user.daysSinceActivity}d
                            </span>
                          </label>
                        ))}
                      </div>

                      <button className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all">
                        💜 Enviar Motivacao
                      </button>
                    </div>
                  ) : (
                    <p className="text-purple-400 text-center py-8">
                      Seleciona um template primeiro
                    </p>
                  )}
                </div>
              </div>

              {/* Historico */}
              {motivationQueue.length > 0 && (
                <div className="mt-6 bg-white/5 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-white mb-4">📨 Enviadas Recentemente</h3>
                  <div className="space-y-2">
                    {motivationQueue.map((m, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                        <span className="text-purple-300">{m.type}</span>
                        <span className="text-xs text-purple-400">{formatTimeAgo(m.sentAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ============================================================
// COMPONENTE: STAT CARD PREMIUM
// ============================================================
const StatCardPremium = ({ icon, label, value, color, highlight = false }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-3 text-center border ${highlight ? 'animate-pulse' : ''}`}>
      <span className="text-xl">{icon}</span>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
      <p className="text-xs text-purple-300">{label}</p>
    </div>
  );
};

export default CoachDashboard;
