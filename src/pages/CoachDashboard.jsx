import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import {
  setAsTester,
  getSubscriptionStats,
  confirmManualPayment,
  generateInviteCode,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS
} from '../lib/subscriptions';
import { pedirPermissao } from '../utils/notifications';
import { enviarEmail } from '../lib/emails';
import { gerarPlanoAutomatico } from '../lib/vitalis/planoGenerator';

/**
 * SETE ECOS - COACH DASHBOARD v4
 * Design Premium - Interface Profissional para Coaching
 */

const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/FbHbQuDPGAZ3myiu29CmHO';

// Categorias de Interação organizadas
const INTERACTION_CATEGORIES = {
  boasVindas: {
    name: 'Boas-vindas',
    icon: '👋',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    templates: [
      { id: 'welcome-new', title: 'Novo cliente', message: 'Bem-vindo/a ao Vitalis! Estou muito feliz por começares esta jornada comigo. Qualquer dúvida, estou aqui. Vamos nesta jornada!' },
      { id: 'welcome-back', title: 'Retorno', message: 'Que bom ver-te de volta! A tua jornada continua, e estou aqui para te apoiar. Vamos retomar com calma.' },
    ]
  },
  checkin: {
    name: 'Check-in',
    icon: '💬',
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-teal-50',
    templates: [
      { id: 'checkin-how', title: 'Como estás?', message: 'Olá! Só a passar para saber como te estás a sentir. Como está a correr a semana?' },
      { id: 'checkin-goals', title: 'Objetivos', message: 'Como estão os teus objetivos? Precisas de ajustar algo no plano? Estou aqui para te ajudar.' },
      { id: 'checkin-weekend', title: 'Fim de semana', message: 'Bom fim de semana! Lembra-te: descansar também faz parte do processo. Como estás?' },
    ]
  },
  motivacao: {
    name: 'Motivação',
    icon: '🔥',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    templates: [
      { id: 'motivation-daily', title: 'Diária', message: 'Novo dia, nova oportunidade! Tu consegues. Cada pequeno passo conta. Vamos lá!' },
      { id: 'motivation-progress', title: 'Progresso', message: 'Estou a ver o teu progresso e estou orgulhosa! Continua assim, estás no caminho certo.' },
      { id: 'motivation-push', title: 'Impulso', message: 'Sei que às vezes é difícil, mas lembra-te do porquê começaste. A tua versão futura vai agradecer!' },
    ]
  },
  celebracao: {
    name: 'Celebração',
    icon: '🎉',
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50',
    templates: [
      { id: 'celebrate-milestone', title: 'Marco atingido', message: 'PARABÉNS! Que conquista incrível! Estou tão feliz por ti. Mereces toda a celebração!' },
      { id: 'celebrate-streak', title: 'Streak', message: 'Que consistência! A tua dedicação está a dar frutos. Continua a brilhar!' },
      { id: 'celebrate-goal', title: 'Meta alcançada', message: 'Conseguiste! Este momento é teu. Celebra cada vitória, por menor que pareça!' },
    ]
  },
  suporte: {
    name: 'Suporte',
    icon: '🤗',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    templates: [
      { id: 'support-hard', title: 'Dia difícil', message: 'Sei que nem todos os dias são fáceis. Está tudo bem. Estou aqui contigo. Vamos com calma.' },
      { id: 'support-slip', title: 'Recaída', message: 'Um deslize não apaga o teu progresso. Amanhã é um novo dia. Levanta-te e continua. Estou aqui.' },
      { id: 'support-listen', title: 'Ouvir', message: 'Quero que saibas que estou aqui para te ouvir. Se precisares de falar, é só dizer.' },
    ]
  },
  lembrete: {
    name: 'Lembrete',
    icon: '⏰',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    templates: [
      { id: 'reminder-checkin', title: 'Check-in', message: 'Ainda não fizeste o check-in de hoje. Quando puderes, passa por lá. Cada registo ajuda!' },
      { id: 'reminder-water', title: 'Hidratação', message: 'Lembrete amigo: já bebeste água hoje? A hidratação é fundamental. Vai buscar um copo!' },
      { id: 'reminder-meal', title: 'Refeição', message: 'Não te esqueças de fazer as tuas refeições com calma e atenção. O teu corpo agradece.' },
    ]
  }
};

// Configurações de automação
const AUTOMATION_SETTINGS = {
  inactivityReminder: { days: 3, enabled: true },
  weeklyMotivation: { dayOfWeek: 'monday', enabled: true },
  streakCelebration: { minStreak: 7, enabled: true },
  welcomeMessage: { delay: 0, enabled: true },
};

const CoachDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showInteractionPanel, setShowInteractionPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [interactionHistory, setInteractionHistory] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [showAutomation, setShowAutomation] = useState(false);
  const [gerandoPlano, setGerandoPlano] = useState(null); // user_id do cliente

  // Data
  const [stats, setStats] = useState({
    totalUsers: 0,
    novosHoje: 0,
    novosSemana: 0,
    comLumina: 0,
    comVitalis: 0,
    waitlistTotal: 0,
    needAttention: 0
  });
  const [vitalisClients, setVitalisClients] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [clientsNeedAttention, setClientsNeedAttention] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState(null);

  // Pagamentos
  const [pendingPayments, setPendingPayments] = useState([]);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [revenueStats, setRevenueStats] = useState({ thisMonth: 0, lastMonth: 0, total: 0 });
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activateClient, setActivateClient] = useState(null);
  const [activatePlan, setActivatePlan] = useState('SEMESTRAL');
  const [activateRef, setActivateRef] = useState('');
  const [activateMethod, setActivateMethod] = useState('mpesa');
  const [processingPayment, setProcessingPayment] = useState(false);

  const refreshInterval = useRef(null);

  useEffect(() => {
    pedirPermissao();
    loadAllData();
    refreshInterval.current = setInterval(loadAllData, 60000);
    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadVitalisClients(),
        loadWaitlist(),
        loadClientsNeedAttention(),
        loadInteractionHistory(),
        loadPendingPayments(),
        loadExpiringSubscriptions(),
        loadPaymentHistory(),
        loadInviteCodes()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [
        { count: totalUsers },
        { count: novosHoje },
        { count: novosSemana },
        { count: comLumina },
        { count: comVitalis },
        { count: waitlistTotal }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', hoje),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', semanaAtras),
        supabase.from('lumina_checkins').select('user_id', { count: 'exact', head: true }),
        supabase.from('vitalis_clients').select('*', { count: 'exact', head: true }),
        supabase.from('waitlist').select('*', { count: 'exact', head: true })
      ]);

      const subStats = await getSubscriptionStats();
      setSubscriptionStats(subStats);

      setStats({
        totalUsers: totalUsers || 0,
        novosHoje: novosHoje || 0,
        novosSemana: novosSemana || 0,
        comLumina: comLumina || 0,
        comVitalis: comVitalis || 0,
        waitlistTotal: waitlistTotal || 0,
        needAttention: 0
      });
    } catch (error) {
      console.error('Erro stats:', error);
    }
  };

  const loadVitalisClients = async () => {
    try {
      const { data } = await supabase
        .from('vitalis_clients')
        .select('*, users(id, nome, email, created_at), telefone, whatsapp')
        .order('created_at', { ascending: false });

      // Enriquecer com info de intake e plano
      if (data) {
        const enrichedData = await Promise.all(
          data.map(async (client) => {
            const userId = client.user_id;

            // Verificar intake
            const { data: intake } = await supabase
              .from('vitalis_intake')
              .select('altura_cm, peso_actual, idade')
              .eq('user_id', userId)
              .maybeSingle();

            const has_intake = intake && intake.altura_cm && intake.peso_actual && intake.idade;

            // Verificar plano
            const { data: plano } = await supabase
              .from('vitalis_meal_plans')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();

            const has_plan = !!plano;

            return {
              ...client,
              has_intake,
              has_plan
            };
          })
        );
        setVitalisClients(enrichedData);
      } else {
        setVitalisClients([]);
      }
    } catch (error) {
      console.error('Erro vitalis clients:', error);
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
      console.error('Erro waitlist:', error);
    }
  };

  const loadClientsNeedAttention = async () => {
    try {
      const { data: clients } = await supabase
        .from('vitalis_clients')
        .select('*, users(id, nome, email)');

      if (!clients) return;

      const needAttention = [];

      for (const client of clients) {
        const reasons = [];

        const [registosRes, aguaRes] = await Promise.all([
          supabase.from('vitalis_registos').select('created_at').eq('user_id', client.user_id).order('created_at', { ascending: false }).limit(1).single(),
          supabase.from('vitalis_agua_log').select('created_at').eq('user_id', client.user_id).order('created_at', { ascending: false }).limit(1).single()
        ]);

        const lastActivity = registosRes.data?.created_at || aguaRes.data?.created_at;
        if (lastActivity) {
          const daysSince = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSince >= 3) {
            reasons.push({
              text: `${daysSince} dias sem atividade`,
              priority: daysSince >= 7 ? 'high' : 'medium',
              type: 'inactivity'
            });
          }
        } else {
          reasons.push({ text: 'Nunca registou', priority: 'medium', type: 'new' });
        }

        if (reasons.length > 0) {
          needAttention.push({
            ...client,
            nome: client.users?.nome || client.nome_completo || 'Sem nome',
            email: client.users?.email || '',
            reasons,
            priority: reasons.some(r => r.priority === 'high') ? 'high' : 'medium'
          });
        }
      }

      setClientsNeedAttention(needAttention.sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0)));
      setStats(prev => ({ ...prev, needAttention: needAttention.length }));
    } catch (error) {
      console.error('Erro attention:', error);
    }
  };

  const loadInteractionHistory = async () => {
    try {
      const { data } = await supabase
        .from('vitalis_alerts')
        .select('*, users(nome, email)')
        .in('tipo_alerta', ['motivacao_coach', 'interaction_coach'])
        .order('created_at', { ascending: false })
        .limit(100);
      setInteractionHistory(data || []);
    } catch (error) {
      console.error('Erro interaction history:', error);
    }
  };

  // ========== PAYMENT FUNCTIONS ==========

  const loadPendingPayments = async () => {
    try {
      const { data } = await supabase
        .from('vitalis_clients')
        .select('*, users(id, nome, email)')
        .eq('subscription_status', 'pending')
        .order('subscription_updated', { ascending: false });
      setPendingPayments(data || []);
    } catch (error) {
      console.error('Erro pending payments:', error);
    }
  };

  const loadExpiringSubscriptions = async () => {
    try {
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { data } = await supabase
        .from('vitalis_clients')
        .select('*, users(id, nome, email)')
        .eq('subscription_status', 'active')
        .not('subscription_expires', 'is', null)
        .lte('subscription_expires', in30Days.toISOString())
        .order('subscription_expires', { ascending: true });

      // Categorizar por urgência
      const categorized = (data || []).map(client => {
        const expires = new Date(client.subscription_expires);
        const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
        return {
          ...client,
          daysLeft,
          urgency: daysLeft <= 7 ? 'critical' : daysLeft <= 14 ? 'warning' : 'info'
        };
      });

      setExpiringSubscriptions(categorized);
    } catch (error) {
      console.error('Erro expiring subscriptions:', error);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const { data } = await supabase
        .from('vitalis_subscription_log')
        .select('*, users(nome, email)')
        .order('created_at', { ascending: false })
        .limit(100);

      setPaymentHistory(data || []);

      // Calcular receita
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      let thisMonth = 0, lastMonth = 0, total = 0;

      (data || []).forEach(log => {
        try {
          const details = JSON.parse(log.details || '{}');
          const amount = parseFloat(details.amount) || 0;
          const currency = details.currency || 'USD';
          const amountUSD = currency === 'MZN' ? amount / 65 : amount; // Aproximação

          if (details.action === 'payment_confirmed' || details.action === 'payment_automatic') {
            total += amountUSD;
            const logDate = new Date(log.created_at);
            if (logDate >= thisMonthStart) thisMonth += amountUSD;
            else if (logDate >= lastMonthStart && logDate <= lastMonthEnd) lastMonth += amountUSD;
          }
        } catch (e) { /* ignore parse errors */ }
      });

      setRevenueStats({
        thisMonth: Math.round(thisMonth),
        lastMonth: Math.round(lastMonth),
        total: Math.round(total)
      });
    } catch (error) {
      console.error('Erro payment history:', error);
    }
  };

  const loadInviteCodes = async () => {
    try {
      const { data } = await supabase
        .from('vitalis_invite_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setInviteCodes(data || []);
    } catch (error) {
      console.error('Erro invite codes:', error);
    }
  };

  const handleApprovePayment = async (client) => {
    if (!confirm(`Aprovar pagamento de ${client.users?.nome || 'Cliente'}?`)) return;

    setProcessingPayment(true);
    try {
      const result = await confirmManualPayment(client.user_id, {
        method: client.payment_method || 'manual',
        reference: client.payment_reference || 'Aprovado manualmente',
        amount: client.payment_amount,
        currency: client.payment_currency || 'MZN',
        planId: client.subscription_plan || 'monthly'
      });

      if (result.success) {
        alert(`✅ Pagamento aprovado! Válido até ${result.expiresAt.toLocaleDateString('pt-PT')}`);
        loadAllData();
      } else {
        alert('Erro ao aprovar pagamento');
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleManualActivation = async () => {
    if (!activateClient) return;

    setProcessingPayment(true);
    try {
      const result = await confirmManualPayment(activateClient.user_id, {
        method: activateMethod,
        reference: activateRef || `Manual-${Date.now()}`,
        amount: SUBSCRIPTION_PLANS[activatePlan].price_usd,
        currency: 'USD',
        planId: activatePlan
      });

      if (result.success) {
        alert(`✅ Subscrição ativada! Válida até ${result.expiresAt.toLocaleDateString('pt-PT')}`);
        setShowActivateModal(false);
        setActivateClient(null);
        setActivateRef('');
        loadAllData();
      } else {
        alert('Erro ao ativar subscrição');
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleGenerateCode = async (type) => {
    const notes = prompt('Notas para este código (opcional):');
    const result = await generateInviteCode(type, 1, notes || '');
    if (result.success) {
      alert(`✅ Código gerado: ${result.code}`);
      loadInviteCodes();
    } else {
      alert('Erro ao gerar código');
    }
  };

  const sendRenewalReminder = async (client) => {
    const clientName = client.users?.nome || 'Cliente';
    const clientEmail = client.users?.email;
    const daysLeft = client.daysLeft;

    if (!clientEmail) {
      alert('Cliente sem email');
      return;
    }

    try {
      await enviarEmail('lembrete-checkin', clientEmail, {
        nome: clientName,
        dias: daysLeft,
        mensagem: `A tua subscrição Vitalis expira em ${daysLeft} dias. Renova agora para continuar a tua transformação!`
      });
      alert(`✅ Lembrete enviado para ${clientName}`);
    } catch (error) {
      alert('Erro ao enviar lembrete');
    }
  };

  const handleGerarPlano = async (client) => {
    const userId = client.user_id || client.users?.id;
    const clientName = client.users?.nome || 'Cliente';

    if (!userId) {
      alert('❌ Cliente sem user_id');
      return;
    }

    if (!confirm(`Gerar plano para ${clientName}?`)) {
      return;
    }

    setGerandoPlano(userId);
    try {
      console.log('🔄 Gerando plano para userId:', userId);
      const resultado = await gerarPlanoAutomatico(userId);

      if (resultado?.success) {
        alert(`✅ Plano gerado com sucesso para ${clientName}!`);
        loadAllData(); // Recarregar dados
      } else {
        alert(`❌ Erro ao gerar plano: ${resultado?.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setGerandoPlano(null);
    }
  };

  const sendInteraction = async (client, template, customMsg = '', viaWhatsApp = false) => {
    setSendingMessage(true);
    try {
      const message = customMsg || template.message;
      const clientName = client.users?.nome || client.nome_completo || client.nome || 'Cliente';
      const clientEmail = client.users?.email || client.email || '';
      // user_id pode vir de diferentes fontes dependendo do contexto
      const userId = client.user_id || client.users?.id;

      if (!clientEmail && !viaWhatsApp) {
        alert('Cliente sem email registado');
        setSendingMessage(false);
        return;
      }

      // Se for WhatsApp, abrir link directo
      if (viaWhatsApp) {
        const phone = client.telefone || client.whatsapp || '';
        if (!phone) {
          alert('Cliente sem número de telefone registado');
          setSendingMessage(false);
          return;
        }
        // Limpar número (remover +, espaços, etc)
        const cleanPhone = phone.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');

        // Guardar no histórico mesmo assim
        if (userId) {
          await supabase.from('vitalis_alerts').insert({
            user_id: userId,
            tipo_alerta: 'interaction_whatsapp',
            descricao: `[WhatsApp] ${message}`,
            prioridade: 'baixa',
            status: 'enviado'
          });
        }

        await loadInteractionHistory();
        setCustomMessage('');
        setShowInteractionPanel(false);
        setSelectedCategory(null);
        setSendingMessage(false);
        return;
      }

      // Guardar na base de dados
      if (userId) {
        const { error: insertError } = await supabase.from('vitalis_alerts').insert({
          user_id: userId,
          tipo_alerta: 'interaction_coach',
          descricao: message,
          prioridade: 'baixa',
          status: 'enviado'
        });

        if (insertError) {
          console.error('Erro ao guardar alerta:', insertError);
        }
      } else {
        console.warn('user_id não encontrado para o cliente:', client);
      }

      // Enviar email
      const emailResult = await enviarEmail('lembrete-checkin', clientEmail, {
        nome: clientName,
        dias: 'alguns',
        mensagem: message
      });

      alert(emailResult.success
        ? `✅ Mensagem enviada para ${clientName}!`
        : `⚠️ Mensagem guardada, mas email pode não ter sido enviado.`
      );

      await loadInteractionHistory();
      setCustomMessage('');
      setShowInteractionPanel(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert('Erro ao enviar: ' + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSetAsTester = async (userId, reason) => {
    try {
      await setAsTester(userId, reason);
      alert('Utilizador definido como tester');
      loadVitalisClients();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  };

  const formatTimeAgo = (date) => {
    if (!date) return '-';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      tester: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      trial: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      expired: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // ========== RENDER ==========

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200">A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
      {/* Header Premium */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Coach Dashboard</h1>
                <p className="text-sm text-purple-300">Sete Ecos • Gestão de Clientes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/vitalis/dashboard"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium transition-all border border-white/10"
              >
                Vitalis
              </Link>
              <Link
                to="/coach/marketing"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 text-sm font-medium transition-all border border-pink-500/30"
              >
                Marketing
              </Link>
              <Link
                to="/coach/analytics"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300 text-sm font-medium transition-all border border-blue-500/30"
              >
                Analytics
              </Link>
              <a
                href={WHATSAPP_COMMUNITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm font-medium transition-all border border-green-500/30"
              >
                WhatsApp
              </a>
              <button
                onClick={loadAllData}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10 flex items-center justify-center"
                title="Atualizar"
              >
                ↻
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Stats Cards - Visão Rápida */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { icon: '👥', label: 'Total', value: stats.totalUsers, gradient: 'from-blue-500 to-cyan-500' },
            { icon: '✨', label: 'Hoje', value: stats.novosHoje, gradient: 'from-green-500 to-emerald-500' },
            { icon: '📅', label: 'Semana', value: stats.novosSemana, gradient: 'from-teal-500 to-cyan-500' },
            { icon: '👁️', label: 'Lumina', value: stats.comLumina, gradient: 'from-indigo-500 to-purple-500' },
            { icon: '🌿', label: 'Vitalis', value: stats.comVitalis, gradient: 'from-green-500 to-lime-500' },
            { icon: '⚠️', label: 'Atenção', value: stats.needAttention, gradient: 'from-orange-500 to-red-500', highlight: stats.needAttention > 0 },
            { icon: '📋', label: 'Waitlist', value: waitlist.length, gradient: 'from-purple-500 to-pink-500' },
          ].map((stat, i) => (
            <button
              key={i}
              onClick={() => {
                if (stat.label === 'Atenção') setActiveView('attention');
                else if (stat.label === 'Waitlist') setActiveView('waitlist');
                else if (stat.label === 'Vitalis') setActiveView('clients');
                else setActiveView('overview');
              }}
              className={`relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group ${stat.highlight ? 'ring-2 ring-orange-500/50' : ''}`}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Navigation */}
          <div className="lg:col-span-1 space-y-4">
            {/* Menu */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Menu</h3>
              <nav className="space-y-1">
                {[
                  { id: 'overview', icon: '📊', label: 'Resumo' },
                  { id: 'payments', icon: '💰', label: `Pagamentos${pendingPayments.length > 0 ? ` (${pendingPayments.length})` : ''}`, alert: pendingPayments.length > 0 },
                  { id: 'clients', icon: '🌿', label: `Clientes (${vitalisClients.length})` },
                  { id: 'attention', icon: '⚠️', label: `Atenção (${clientsNeedAttention.length})`, alert: clientsNeedAttention.length > 0 },
                  { id: 'waitlist', icon: '📋', label: `Waitlist (${waitlist.length})` },
                  { id: 'interactions', icon: '💬', label: 'Interações' },
                  { id: 'automation', icon: '⚡', label: 'Automação' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeView === item.id
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {item.alert && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Subscrições</h3>
              <div className="space-y-2">
                {[
                  { label: 'Testers', value: subscriptionStats?.testers || 0, color: 'text-emerald-400' },
                  { label: 'Ativos', value: subscriptionStats?.active || 0, color: 'text-green-400' },
                  { label: 'Pendentes', value: subscriptionStats?.pending || 0, color: 'text-amber-400' },
                  { label: 'A Expirar', value: expiringSubscriptions.length, color: 'text-orange-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                    <span className="text-white/60 text-sm">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-green-300/60 uppercase tracking-wider mb-3">Receita</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20">
                  <span className="text-green-200/60 text-sm">Este mes</span>
                  <span className="font-bold text-green-300">${revenueStats.thisMonth}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20">
                  <span className="text-green-200/60 text-sm">Mes passado</span>
                  <span className="font-bold text-green-300/70">${revenueStats.lastMonth}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20">
                  <span className="text-green-200/60 text-sm">Total</span>
                  <span className="font-bold text-green-200">${revenueStats.total}</span>
                </div>
              </div>
            </div>

            {/* Funil de Conversao */}
            <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-purple-300/60 uppercase tracking-wider mb-3">Funil de Conversao</h3>
              <div className="space-y-2">
                {(() => {
                  const totalU = stats.totalUsers || 1;
                  const lumina = stats.comLumina || 0;
                  const vitalis = subscriptionStats?.active || 0;
                  const trial = subscriptionStats?.trial || 0;
                  const trialToActive = vitalis > 0 && trial + vitalis > 0 ? Math.round((vitalis / (trial + vitalis)) * 100) : 0;
                  return [
                    { label: 'Registo → Lumina', value: `${Math.round((lumina / totalU) * 100)}%`, color: 'text-indigo-300' },
                    { label: 'Trial activos', value: trial, color: 'text-purple-300' },
                    { label: 'Trial → Pago', value: `${trialToActive}%`, color: 'text-pink-300' },
                    { label: 'ARPU', value: totalU > 0 ? `$${Math.round(revenueStats.total / Math.max(vitalis, 1))}` : '$0', color: 'text-green-300' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20">
                      <span className="text-purple-200/60 text-sm">{item.label}</span>
                      <span className={`font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-[600px]">

              {/* OVERVIEW */}
              {activeView === 'overview' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Resumo do Dia</h2>

                  {/* Alert Banner */}
                  {clientsNeedAttention.length > 0 && (
                    <button
                      onClick={() => setActiveView('attention')}
                      className="w-full p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-6 flex items-center gap-4 hover:from-orange-500/30 hover:to-red-500/30 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-orange-500/30 flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-orange-200">
                          {clientsNeedAttention.length} cliente{clientsNeedAttention.length !== 1 ? 's' : ''} precisa{clientsNeedAttention.length !== 1 ? 'm' : ''} de atenção
                        </p>
                        <p className="text-sm text-orange-300/70">Clica para ver e enviar mensagens</p>
                      </div>
                      <span className="text-orange-300">→</span>
                    </button>
                  )}

                  {/* Categorias de Interação - Quick Access */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white/60 mb-3">Enviar Interação Rápida</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {Object.entries(INTERACTION_CATEGORIES).map(([key, cat]) => (
                        <button
                          key={key}
                          onClick={() => { setSelectedCategory(key); setActiveView('interactions'); }}
                          className={`p-3 rounded-xl bg-gradient-to-br ${cat.color} opacity-80 hover:opacity-100 transition-all text-center`}
                        >
                          <span className="text-2xl block mb-1">{cat.icon}</span>
                          <span className="text-xs text-white font-medium">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Interactions */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/60 mb-3">Interações Recentes</h3>
                    {interactionHistory.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-xl">
                        <span className="text-4xl block mb-2">💬</span>
                        <p className="text-white/40">Nenhuma interação ainda</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {interactionHistory.slice(0, 5).map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                              {item.users?.nome?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{item.users?.nome || 'Cliente'}</p>
                              <p className="text-white/40 text-sm truncate">{item.descricao}</p>
                            </div>
                            <span className="text-white/30 text-xs">{formatTimeAgo(item.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PAYMENTS */}
              {activeView === 'payments' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">💰 Gestão de Pagamentos</h2>

                  {/* Pending Payments Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                      ⏳ Pagamentos Pendentes
                      {pendingPayments.length > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-sm rounded-full">
                          {pendingPayments.length}
                        </span>
                      )}
                    </h3>

                    {pendingPayments.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-3xl block mb-2">✅</span>
                        <p className="text-white/40">Nenhum pagamento pendente</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingPayments.map((client) => (
                          <div key={client.id} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-200 font-bold">
                                  {client.users?.nome?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="text-white font-semibold">{client.users?.nome || 'Cliente'}</p>
                                  <p className="text-white/50 text-sm">{client.users?.email}</p>
                                  <div className="flex gap-2 mt-1 text-xs">
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-white/60">
                                      {client.payment_method || 'Método?'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-white/60">
                                      {client.payment_amount} {client.payment_currency || 'MZN'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-white/60">
                                      {client.subscription_plan || 'Plano?'}
                                    </span>
                                  </div>
                                  {client.payment_reference && (
                                    <p className="text-amber-300/70 text-xs mt-1">Ref: {client.payment_reference}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprovePayment(client)}
                                  disabled={processingPayment}
                                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                  ✓ Aprovar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expiring Subscriptions */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
                      ⏰ A Expirar (próximos 30 dias)
                      {expiringSubscriptions.length > 0 && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-sm rounded-full">
                          {expiringSubscriptions.length}
                        </span>
                      )}
                    </h3>

                    {expiringSubscriptions.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-3xl block mb-2">🎉</span>
                        <p className="text-white/40">Nenhuma subscrição a expirar</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {expiringSubscriptions.map((client) => (
                          <div
                            key={client.id}
                            className={`p-4 rounded-xl border-l-4 ${
                              client.urgency === 'critical'
                                ? 'bg-red-500/10 border-l-red-500'
                                : client.urgency === 'warning'
                                ? 'bg-orange-500/10 border-l-orange-500'
                                : 'bg-yellow-500/10 border-l-yellow-500'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                                  client.urgency === 'critical' ? 'bg-red-500/30 text-red-200' :
                                  client.urgency === 'warning' ? 'bg-orange-500/30 text-orange-200' :
                                  'bg-yellow-500/30 text-yellow-200'
                                }`}>
                                  {client.daysLeft}d
                                </div>
                                <div>
                                  <p className="text-white font-semibold">{client.users?.nome || 'Cliente'}</p>
                                  <p className="text-white/50 text-sm">{client.users?.email}</p>
                                  <p className={`text-sm mt-1 ${
                                    client.urgency === 'critical' ? 'text-red-300' :
                                    client.urgency === 'warning' ? 'text-orange-300' : 'text-yellow-300'
                                  }`}>
                                    Expira em {client.daysLeft} dias ({new Date(client.subscription_expires).toLocaleDateString('pt-PT')})
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => sendRenewalReminder(client)}
                                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
                                >
                                  📧 Lembrete
                                </button>
                                <button
                                  onClick={() => { setActivateClient(client); setShowActivateModal(true); }}
                                  className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm font-medium transition-all border border-green-500/30"
                                >
                                  🔄 Renovar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Manual Activation */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-blue-300 mb-4">⚡ Ativação Manual</h3>
                    <p className="text-white/50 text-sm mb-4">Seleciona um cliente da lista abaixo para ativar manualmente:</p>

                    <div className="grid md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                      {vitalisClients.filter(c => c.subscription_status !== 'active' && c.subscription_status !== 'tester').map((client) => (
                        <button
                          key={client.id}
                          onClick={() => { setActivateClient(client); setShowActivateModal(true); }}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all text-left"
                        >
                          <p className="text-white font-medium">{client.users?.nome || 'Sem nome'}</p>
                          <p className="text-white/40 text-xs">{client.users?.email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${getStatusBadge(client.subscription_status)}`}>
                            {client.subscription_status || 'sem status'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Invite Codes */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center justify-between">
                      <span>🎟️ Códigos de Convite</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGenerateCode('promo')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium transition-all border border-emerald-500/30"
                        >
                          + Promo 1 Mes
                        </button>
                        <button
                          onClick={() => handleGenerateCode('tester')}
                          className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-all border border-purple-500/30"
                        >
                          + Tester
                        </button>
                      </div>
                    </h3>

                    {inviteCodes.length === 0 ? (
                      <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-white/40">Nenhum código gerado</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {inviteCodes.map((code) => (
                          <div key={code.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div>
                              <p className="text-white font-mono font-medium">{code.code}</p>
                              <p className="text-white/40 text-xs">{code.type} • {code.uses_count}/{code.max_uses} usos</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs ${code.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                              {code.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment History */}
                  <div>
                    <h3 className="text-lg font-semibold text-white/80 mb-4">📜 Histórico de Pagamentos</h3>

                    {paymentHistory.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-white/40">Nenhum pagamento registado</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {paymentHistory.filter(log => {
                          try {
                            const details = JSON.parse(log.details || '{}');
                            return details.action?.includes('payment');
                          } catch { return false; }
                        }).slice(0, 20).map((log) => {
                          const details = JSON.parse(log.details || '{}');
                          return (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-300">
                                  💰
                                </div>
                                <div>
                                  <p className="text-white font-medium">{log.users?.nome || 'Cliente'}</p>
                                  <p className="text-white/40 text-xs">
                                    {details.method || 'Manual'} • {details.plan || 'Plano'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-green-300 font-medium">${details.amount || '?'}</p>
                                <p className="text-white/30 text-xs">{formatDate(log.created_at)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CLIENTS */}
              {activeView === 'clients' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Clientes Vitalis ({vitalisClients.length})</h2>

                  {vitalisClients.length === 0 ? (
                    <div className="text-center py-16">
                      <span className="text-5xl block mb-4">🌿</span>
                      <p className="text-white/40">Nenhum cliente ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vitalisClients.map((client) => {
                        const userId = client.user_id || client.users?.id;
                        const temIntake = client.has_intake || false;
                        const temPlano = client.has_plan || false;

                        return (
                          <div
                            key={client.id}
                            className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                          >
                            {/* Header do cliente */}
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                                {client.users?.nome?.[0]?.toUpperCase() || '🌿'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold">{client.users?.nome || client.nome_completo || 'Sem nome'}</p>
                                <p className="text-white/40 text-sm truncate">{client.users?.email}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(client.subscription_status)}`}>
                                {client.subscription_status || 'sem status'}
                              </span>
                            </div>

                            {/* Indicadores de status */}
                            <div className="flex gap-2 text-xs">
                              <span className={`px-2 py-1 rounded ${temIntake ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {temIntake ? '✅' : '❌'} Intake
                              </span>
                              <span className={`px-2 py-1 rounded ${temPlano ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {temPlano ? '✅' : '❌'} Plano
                              </span>
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => { setSelectedClient(client); setShowInteractionPanel(true); }}
                                className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-all border border-purple-500/30"
                                title="Enviar por Email"
                              >
                                📧 Email
                              </button>
                              {(client.telefone || client.whatsapp) && (
                                <button
                                  onClick={() => {
                                    const phone = (client.telefone || client.whatsapp || '').replace(/\D/g, '');
                                    window.open(`https://wa.me/${phone}`, '_blank');
                                  }}
                                  className="px-3 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm font-medium transition-all border border-green-500/30"
                                  title="Abrir WhatsApp"
                                >
                                  💬 WhatsApp
                                </button>
                              )}
                              {/* Botão Gerar Plano */}
                              {temIntake && !temPlano && userId && (
                                <button
                                  onClick={() => handleGerarPlano(client)}
                                  disabled={gerandoPlano === userId}
                                  className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm font-medium transition-all border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Gerar Plano Alimentar"
                                >
                                  {gerandoPlano === userId ? '⏳ Gerando...' : '🍽️ Gerar Plano'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ATTENTION */}
              {activeView === 'attention' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Clientes que Precisam de Atenção ({clientsNeedAttention.length})</h2>

                  {clientsNeedAttention.length === 0 ? (
                    <div className="text-center py-16 bg-green-500/10 rounded-xl border border-green-500/20">
                      <span className="text-5xl block mb-4">🎉</span>
                      <p className="text-green-300 font-semibold">Todos os clientes estão bem!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientsNeedAttention.map((client, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border-l-4 ${
                            client.priority === 'high'
                              ? 'bg-red-500/10 border-l-red-500'
                              : 'bg-orange-500/10 border-l-orange-500'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                client.priority === 'high' ? 'bg-red-500/30' : 'bg-orange-500/30'
                              }`}>
                                {client.nome?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-lg">{client.nome}</p>
                                <p className="text-white/50 text-sm">{client.email}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {client.reasons.map((r, j) => (
                                    <span
                                      key={j}
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        r.priority === 'high' ? 'bg-red-500/30 text-red-200' : 'bg-orange-500/30 text-orange-200'
                                      }`}
                                    >
                                      {r.text}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setSelectedClient(client); setShowInteractionPanel(true); }}
                                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                              >
                                📧 Email
                              </button>
                              {(client.telefone || client.whatsapp) && (
                                <button
                                  onClick={() => {
                                    const phone = (client.telefone || client.whatsapp || '').replace(/\D/g, '');
                                    const msg = encodeURIComponent(`Olá ${client.nome}! `);
                                    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                                  }}
                                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all"
                                >
                                  💬 WhatsApp
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* WAITLIST */}
              {activeView === 'waitlist' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Waitlist ({waitlist.length})</h2>

                  {waitlist.length === 0 ? (
                    <div className="text-center py-16">
                      <span className="text-5xl block mb-4">📋</span>
                      <p className="text-white/40">Waitlist vazia</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {waitlist.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                            {item.nome?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold">{item.nome}</p>
                            <p className="text-white/40 text-sm">{item.email}</p>
                            {item.whatsapp && (
                              <p className="text-green-400 text-sm">📱 {item.whatsapp}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                              {item.produto || 'Vitalis'}
                            </span>
                            <p className="text-white/30 text-xs mt-1">{formatDate(item.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* INTERACTIONS */}
              {activeView === 'interactions' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Central de Interações</h2>

                  {/* Categories Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {Object.entries(INTERACTION_CATEGORIES).map(([key, cat]) => (
                      <div key={key} className={`rounded-xl ${cat.bgColor} p-4`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{cat.icon}</span>
                          <h3 className="font-bold text-gray-800">{cat.name}</h3>
                        </div>
                        <div className="space-y-2">
                          {cat.templates.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                if (selectedClient) {
                                  sendInteraction(selectedClient, t);
                                } else {
                                  setActiveView('clients');
                                  alert('Seleciona primeiro um cliente');
                                }
                              }}
                              className="w-full p-3 bg-white/80 hover:bg-white rounded-lg text-left transition-all"
                            >
                              <p className="font-medium text-gray-800 text-sm">{t.title}</p>
                              <p className="text-gray-500 text-xs line-clamp-2">{t.message}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* History */}
                  <h3 className="text-sm font-semibold text-white/60 mb-3">Histórico de Interações</h3>
                  {interactionHistory.length === 0 ? (
                    <div className="text-center py-8 bg-white/5 rounded-xl">
                      <p className="text-white/40">Nenhuma interação registada</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {interactionHistory.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                            {item.users?.nome?.[0]?.toUpperCase() || 'C'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{item.users?.nome || 'Cliente'}</p>
                            <p className="text-white/50 text-sm">{item.descricao}</p>
                            <p className="text-white/30 text-xs mt-1">{formatDate(item.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AUTOMATION */}
              {activeView === 'automation' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-2">Automacoes Ativas</h2>
                  <p className="text-white/50 mb-6">Todos os sistemas automaticos a funcionar para ti</p>

                  {/* WhatsApp Chatbot Status */}
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-green-500/30 flex items-center justify-center">
                        <span className="text-3xl">💬</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-lg">Chatbot WhatsApp</p>
                        <p className="text-green-200/70 text-sm">Responde automaticamente a clientes e interessadas 24/7</p>
                        <p className="text-green-300 text-xs mt-1 font-mono">wa.me/258851006473</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/30 text-green-200 border border-green-500/40 animate-pulse">
                        ATIVO 24/7
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        icon: '📧',
                        title: 'Sequencia Waitlist (30 dias)',
                        description: '6 emails automaticos: Boas-vindas, Lumina, Valor, Vitalis, Testemunho, Oferta Final com codigo VEMVITALIS20',
                        setting: 'Dia 0-30',
                        enabled: true,
                        cron: '10h UTC'
                      },
                      {
                        icon: '⏰',
                        title: 'Lembrete de Inatividade',
                        description: 'Email motivacional + link WhatsApp apos 2+ dias sem check-in',
                        setting: '2+ dias',
                        enabled: true,
                        cron: '9h UTC'
                      },
                      {
                        icon: '📊',
                        title: 'Resumo Diario (Coach)',
                        description: 'Metricas do dia anterior: clientes activas, check-ins, alertas, novas',
                        setting: 'Diario',
                        enabled: true,
                        cron: '9h UTC'
                      },
                      {
                        icon: '🔔',
                        title: 'Avisos de Expiracao',
                        description: 'Email automatico 7 dias antes da subscricao expirar',
                        setting: '7 dias antes',
                        enabled: true,
                        cron: '9h UTC'
                      },
                      {
                        icon: '🎯',
                        title: 'Trial Expiring Lifecycle',
                        description: 'Emails em -3d, -1d, dia 0 e +3d (win-back com 15% desconto)',
                        setting: '4 emails',
                        enabled: true,
                        cron: '8h UTC'
                      },
                      {
                        icon: '🔥',
                        title: 'Email Inativos com Motivacao',
                        description: 'Email provocador + curiosidade + WhatsApp directo para clientes inactivas 5+ dias',
                        setting: '5+ dias',
                        enabled: true,
                        cron: '9h UTC'
                      },
                      {
                        icon: '📢',
                        title: 'Broadcast Interessados',
                        description: 'Envia catalogo, novidades e curiosidades a toda a lista de interessados',
                        setting: 'Manual',
                        enabled: true,
                        cron: 'Sob demanda'
                      },
                    ].map((auto, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <span className="text-2xl">{auto.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{auto.title}</p>
                          <p className="text-white/50 text-sm">{auto.description}</p>
                          {auto.cron && <p className="text-purple-300/50 text-xs mt-1">Cron: {auto.cron}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-purple-300 text-sm font-medium">{auto.setting}</p>
                          <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                            auto.enabled
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {auto.enabled ? 'Ativo' : 'Inativo'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Marketing Summary */}
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                    <h4 className="text-pink-200 font-semibold mb-2">Resumo do Marketing Intenso</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-black/20">
                        <p className="text-white/40">Codigo Promo</p>
                        <p className="text-pink-300 font-mono font-bold">VEMVITALIS20</p>
                      </div>
                      <div className="p-2 rounded-lg bg-black/20">
                        <p className="text-white/40">Desconto</p>
                        <p className="text-green-300 font-bold">20%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-black/20">
                        <p className="text-white/40">WhatsApp Chatbot</p>
                        <p className="text-green-300 font-bold">24/7</p>
                      </div>
                      <div className="p-2 rounded-lg bg-black/20">
                        <p className="text-white/40">Emails Auto</p>
                        <p className="text-purple-300 font-bold">7 fluxos</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Interaction Panel Modal */}
      {showInteractionPanel && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                    {selectedClient.users?.nome?.[0]?.toUpperCase() || selectedClient.nome?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedClient.users?.nome || selectedClient.nome_completo || selectedClient.nome || 'Cliente'}
                    </h3>
                    <p className="text-purple-300">{selectedClient.users?.email || selectedClient.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowInteractionPanel(false); setSelectedCategory(null); setCustomMessage(''); }}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Category Selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(INTERACTION_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      selectedCategory === key
                        ? `bg-gradient-to-r ${cat.color} text-white`
                        : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              {/* Templates */}
              {selectedCategory && (
                <div className="space-y-3 mb-6">
                  {INTERACTION_CATEGORIES[selectedCategory].templates.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-white/10 bg-white/5"
                    >
                      <p className="font-medium text-white">{t.title}</p>
                      <p className="text-white/50 text-sm mt-1 mb-3">{t.message}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendInteraction(selectedClient, t, '', false)}
                          disabled={sendingMessage}
                          className="flex-1 py-2 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-all disabled:opacity-50 border border-purple-500/30"
                        >
                          📧 Email
                        </button>
                        <button
                          onClick={() => sendInteraction(selectedClient, t, '', true)}
                          disabled={sendingMessage}
                          className="flex-1 py-2 px-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm font-medium transition-all disabled:opacity-50 border border-green-500/30"
                        >
                          💬 WhatsApp
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Message */}
              <div>
                <p className="text-sm font-medium text-white/60 mb-2">Ou escreve uma mensagem personalizada:</p>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Escreve aqui a tua mensagem..."
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/50"
                  rows={4}
                />
                {customMessage && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => sendInteraction(selectedClient, { message: customMessage }, customMessage, false)}
                      disabled={sendingMessage}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                    >
                      {sendingMessage ? 'A enviar...' : '📧 Email'}
                    </button>
                    <button
                      onClick={() => sendInteraction(selectedClient, { message: customMessage }, customMessage, true)}
                      disabled={sendingMessage}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
                    >
                      {sendingMessage ? 'A enviar...' : '💬 WhatsApp'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-white/40">📧 Email</span>
                <span className="text-white/20">|</span>
                <span className="text-green-400/70">💬 WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activation Modal */}
      {showActivateModal && activateClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-green-500/20 to-emerald-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">⚡ Ativar Subscrição</h3>
                <button
                  onClick={() => { setShowActivateModal(false); setActivateClient(null); }}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-green-200 mt-1">{activateClient.users?.nome || 'Cliente'}</p>
              <p className="text-green-200/60 text-sm">{activateClient.users?.email}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Plan Selection */}
              <div>
                <label className="block text-white/60 text-sm mb-2">Plano</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                    <button
                      key={key}
                      onClick={() => setActivatePlan(key)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        activatePlan === key
                          ? 'bg-green-500/20 border-green-500 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                      }`}
                    >
                      <p className="font-bold">{plan.name}</p>
                      <p className="text-xs">${plan.price_usd}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-white/60 text-sm mb-2">Método de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mpesa', label: 'M-Pesa', icon: '📱' },
                    { id: 'paypal', label: 'PayPal', icon: '💳' },
                    { id: 'transfer', label: 'Transf.', icon: '🏦' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setActivateMethod(method.id)}
                      className={`p-2 rounded-xl border-2 transition-all ${
                        activateMethod === method.id
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                      }`}
                    >
                      <span className="text-lg">{method.icon}</span>
                      <p className="text-xs mt-1">{method.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-white/60 text-sm mb-2">Referência (opcional)</label>
                <input
                  type="text"
                  value={activateRef}
                  onChange={(e) => setActivateRef(e.target.value)}
                  placeholder="ID transação, comprovativo..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50"
                />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Plano:</span>
                  <span className="text-white font-medium">{SUBSCRIPTION_PLANS[activatePlan].name}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/60">Duração:</span>
                  <span className="text-white font-medium">{SUBSCRIPTION_PLANS[activatePlan].duration} meses</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/60">Valor:</span>
                  <span className="text-green-300 font-bold">${SUBSCRIPTION_PLANS[activatePlan].price_usd}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowActivateModal(false); setActivateClient(null); }}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleManualActivation}
                  disabled={processingPayment}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
                >
                  {processingPayment ? 'A processar...' : '✓ Ativar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;
