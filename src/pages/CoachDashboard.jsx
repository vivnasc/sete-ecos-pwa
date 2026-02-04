import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_CONFIG,
  SUBSCRIPTION_PLANS,
  setAsTester,
  startTrial,
  confirmManualPayment,
  getSubscriptionStats
} from '../lib/subscriptions';
import { enviarNotificacao, pedirPermissao, temPermissao } from '../utils/notifications';
import { enviarEmail } from '../lib/emails';
import { WhatsAppAlertas } from '../lib/whatsapp';

/**
 * SETE ECOS - COACH DASHBOARD v3
 * Design sofisticado, cores equilibradas, UX profissional
 * Paleta: Sage (#7C8B6F), Terracota (#C4A484), Cream (#FAF8F5)
 */

const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/FbHbQuDPGAZ3myiu29CmHO';

// Paleta de cores
const colors = {
  sage: '#7C8B6F',
  sageDark: '#5A6B4F',
  sageLight: '#A8B89A',
  terracota: '#C4A484',
  terracotaDark: '#A68B6A',
  cream: '#FAF8F5',
  warmGray: '#6B6560',
  warmGrayLight: '#9A938C',
};

// Templates de motivação
const MOTIVATION_TEMPLATES = [
  { id: 'comeback', emoji: '🌿', title: 'Regresso', message: 'Olá! Senti a tua falta por aqui. Lembra-te: cada dia é uma nova oportunidade para cuidares de ti. Estou aqui para te apoiar!' },
  { id: 'progress', emoji: '🌱', title: 'Progresso', message: 'Parabéns pelo teu progresso! Continua assim, estás a fazer um trabalho incrível! O teu esforço está a dar frutos.' },
  { id: 'struggle', emoji: '🤍', title: 'Apoio', message: 'Sei que nem todos os dias são fáceis. Lembra-te que pequenos passos também contam. Estou aqui contigo, não desistas!' },
  { id: 'weekly', emoji: '✨', title: 'Semanal', message: 'Nova semana, novas possibilidades! Vamos definir uma intenção para esta semana? Estou aqui para te ajudar a alcançar os teus objetivos.' },
  { id: 'celebration', emoji: '🎉', title: 'Celebração', message: 'Que conquista! Estou tão orgulhosa do teu caminho. Continua a brilhar!' },
];

// Ícones SVG minimalistas
const Icons = {
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Leaf: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

const CoachDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showMotivationPanel, setShowMotivationPanel] = useState(false);
  const [motivationHistory, setMotivationHistory] = useState([]);
  const [sendingMotivation, setSendingMotivation] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Data
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
  const [vitalisClients, setVitalisClients] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [clientsNeedAttention, setClientsNeedAttention] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState(null);

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
        loadUsers(),
        loadVitalisClients(),
        loadWaitlist(),
        loadClientsNeedAttention(),
        loadMotivationHistory()
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
        activeToday: 0,
        needAttention: 0
      });
    } catch (error) {
      console.error('Erro stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*, vitalis_clients(*), lumina_checkins(created_at)')
        .order('created_at', { ascending: false })
        .limit(100);
      setUsers(data || []);
    } catch (error) {
      console.error('Erro users:', error);
    }
  };

  const loadVitalisClients = async () => {
    try {
      const { data } = await supabase
        .from('vitalis_clients')
        .select('*, users(id, nome, email, created_at)')
        .order('created_at', { ascending: false });
      setVitalisClients(data || []);
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
            reasons.push({ text: `${daysSince} dias inativo`, priority: daysSince >= 7 ? 'high' : 'medium' });
          }
        } else {
          reasons.push({ text: 'Sem registos ainda', priority: 'medium' });
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

  const loadMotivationHistory = async () => {
    try {
      const { data } = await supabase
        .from('vitalis_alerts')
        .select('*, users(nome, email)')
        .eq('tipo_alerta', 'motivacao_coach')
        .order('created_at', { ascending: false })
        .limit(50);
      setMotivationHistory(data || []);
    } catch (error) {
      console.error('Erro motivation history:', error);
    }
  };

  const loadClientDetails = async (client) => {
    setSelectedClient(client);
    setActiveView('client-detail');
  };

  const sendMotivation = async (client, template, customMsg = '') => {
    setSendingMotivation(true);
    try {
      const message = customMsg || template.message;
      const clientName = client.users?.nome || client.nome_completo || 'Cliente';
      const clientEmail = client.users?.email || '';

      if (!clientEmail) {
        alert('Cliente sem email registado');
        setSendingMotivation(false);
        return;
      }

      await supabase.from('vitalis_alerts').insert({
        user_id: client.user_id,
        tipo_alerta: 'motivacao_coach',
        descricao: message,
        prioridade: 'baixa',
        status: 'enviado'
      });

      const emailResult = await enviarEmail('lembrete-checkin', clientEmail, {
        nome: clientName,
        dias: 'alguns',
        mensagem: message
      });

      const whatsappResult = await WhatsAppAlertas.motivacaoEnviada(
        { nome: clientName, email: clientEmail },
        message
      );

      let feedback = `Motivação enviada para ${clientName}`;
      if (emailResult.success) feedback += '\nEmail enviado com sucesso';
      if (whatsappResult.success) feedback += '\nWhatsApp notificado';

      alert(feedback);

      await loadMotivationHistory();
      setCustomMessage('');
      setShowMotivationPanel(false);
    } catch (error) {
      console.error('Erro ao enviar motivação:', error);
      alert('Erro ao enviar motivação: ' + error.message);
    } finally {
      setSendingMotivation(false);
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'tester': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'trial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // ========== RENDER ==========

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.cream }}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 rounded-full animate-spin mx-auto mb-4"
               style={{ borderColor: `${colors.sageLight} transparent ${colors.sage} transparent` }}></div>
          <p style={{ color: colors.warmGray }}>A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F3EF' }}>
      {/* Header */}
      <header className="border-b px-4 lg:px-8 py-4 sticky top-0 z-50"
              style={{ backgroundColor: 'rgba(250, 248, 245, 0.95)', backdropFilter: 'blur(8px)', borderColor: '#E8E4DC' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                 style={{ backgroundColor: colors.sage }}>
              <Icons.Leaf />
              <style>{`.w-10.h-10.rounded-xl svg { color: white; }`}</style>
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: colors.warmGray }}>Coach Dashboard</h1>
              <p className="text-sm" style={{ color: colors.warmGrayLight }}>Sete Ecos • Vitalis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={WHATSAPP_COMMUNITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm"
              style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
            >
              <span className="hidden sm:inline">Comunidade</span>
              <span className="sm:hidden">WA</span>
            </a>
            <button
              onClick={loadAllData}
              className="p-2 rounded-lg transition-all hover:shadow-sm"
              style={{ backgroundColor: '#F0EDE8', color: colors.warmGray }}
              title="Atualizar"
            >
              <Icons.Refresh />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg" style={{ backgroundColor: '#F3E8FF' }}>
                <Icons.Users />
              </span>
              <span className="text-2xl font-bold" style={{ color: colors.warmGray }}>{stats.totalUsers}</span>
            </div>
            <p className="text-sm" style={{ color: colors.warmGrayLight }}>Total Utilizadores</p>
          </div>

          <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg" style={{ backgroundColor: '#E8F5E9' }}>
                <Icons.Leaf />
              </span>
              <span className="text-2xl font-bold" style={{ color: colors.warmGray }}>{stats.comVitalis}</span>
            </div>
            <p className="text-sm" style={{ color: colors.warmGrayLight }}>Clientes Vitalis</p>
          </div>

          <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg" style={{ backgroundColor: '#FFF3E0' }}>
                <Icons.AlertCircle />
              </span>
              <span className="text-2xl font-bold" style={{ color: clientsNeedAttention.length > 0 ? '#E65100' : colors.warmGray }}>
                {clientsNeedAttention.length}
              </span>
            </div>
            <p className="text-sm" style={{ color: colors.warmGrayLight }}>Precisam Atenção</p>
          </div>

          <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg" style={{ backgroundColor: '#FBE9E7' }}>
                <Icons.List />
              </span>
              <span className="text-2xl font-bold" style={{ color: colors.warmGray }}>{waitlist.length}</span>
            </div>
            <p className="text-sm" style={{ color: colors.warmGrayLight }}>Waitlist</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column - Navigation & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Navigation */}
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: 'white' }}>
              <div className="p-4 border-b" style={{ borderColor: '#E8E4DC' }}>
                <h2 className="font-semibold" style={{ color: colors.warmGray }}>Menu</h2>
              </div>
              <nav className="p-2">
                {[
                  { id: 'overview', icon: <Icons.Users />, label: 'Resumo' },
                  { id: 'clients', icon: <Icons.Leaf />, label: `Clientes (${vitalisClients.length})` },
                  { id: 'attention', icon: <Icons.AlertCircle />, label: `Atenção (${clientsNeedAttention.length})`, highlight: clientsNeedAttention.length > 0 },
                  { id: 'waitlist', icon: <Icons.List />, label: `Waitlist (${waitlist.length})` },
                  { id: 'motivations', icon: <Icons.Heart />, label: 'Motivações' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setSelectedClient(null); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 transition-all ${
                      activeView === item.id ? 'shadow-sm' : 'hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: activeView === item.id ? colors.sage : 'transparent',
                      color: activeView === item.id ? 'white' : colors.warmGray
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.highlight && activeView !== item.id && (
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    )}
                    <Icons.ChevronRight />
                  </button>
                ))}
              </nav>
            </div>

            {/* Subscriptions Summary */}
            <div className="rounded-2xl shadow-sm p-4" style={{ backgroundColor: 'white' }}>
              <h3 className="font-semibold mb-4" style={{ color: colors.warmGray }}>Subscrições</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors.warmGrayLight }}>Testers</span>
                  <span className="font-semibold px-2 py-1 rounded-lg text-sm"
                        style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                    {subscriptionStats?.testers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors.warmGrayLight }}>Ativos</span>
                  <span className="font-semibold px-2 py-1 rounded-lg text-sm"
                        style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}>
                    {subscriptionStats?.active || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors.warmGrayLight }}>Pendentes</span>
                  <span className="font-semibold px-2 py-1 rounded-lg text-sm"
                        style={{ backgroundColor: '#FFF8E1', color: '#F57F17' }}>
                    {subscriptionStats?.pending || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: 'white' }}>

              {/* OVERVIEW */}
              {activeView === 'overview' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6" style={{ color: colors.warmGray }}>
                    Resumo Geral
                  </h2>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Hoje', value: stats.novosHoje, color: '#4CAF50' },
                      { label: 'Semana', value: stats.novosSemana, color: '#2196F3' },
                      { label: 'Lumina', value: stats.comLumina, color: '#FF9800' },
                      { label: 'Testers', value: subscriptionStats?.testers || 0, color: '#9C27B0' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                        <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-xs" style={{ color: colors.warmGrayLight }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Attention Alert */}
                  {clientsNeedAttention.length > 0 && (
                    <button
                      onClick={() => setActiveView('attention')}
                      className="w-full p-4 rounded-xl mb-6 flex items-center justify-between transition-all hover:shadow-md"
                      style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFE0B2' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFE0B2' }}>
                          <Icons.AlertCircle />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold" style={{ color: '#E65100' }}>
                            {clientsNeedAttention.length} cliente{clientsNeedAttention.length !== 1 ? 's' : ''} precisa{clientsNeedAttention.length !== 1 ? 'm' : ''} de atenção
                          </p>
                          <p className="text-sm" style={{ color: '#F57C00' }}>Clica para ver detalhes</p>
                        </div>
                      </div>
                      <Icons.ChevronRight />
                    </button>
                  )}

                  {/* Recent Motivations */}
                  <div>
                    <h3 className="font-semibold mb-4" style={{ color: colors.warmGray }}>
                      Motivações Recentes
                    </h3>
                    {motivationHistory.length === 0 ? (
                      <div className="text-center py-8 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                        <Icons.Heart />
                        <p className="mt-2" style={{ color: colors.warmGrayLight }}>Nenhuma motivação enviada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {motivationHistory.slice(0, 4).map((m, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                 style={{ backgroundColor: colors.sage }}>
                              {m.users?.nome?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate" style={{ color: colors.warmGray }}>
                                {m.users?.nome || 'Cliente'}
                              </p>
                              <p className="text-sm truncate" style={{ color: colors.warmGrayLight }}>
                                {m.descricao}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-xs" style={{ color: colors.warmGrayLight }}>
                              <Icons.Clock />
                              <span>{formatTimeAgo(m.created_at)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CLIENTS LIST */}
              {activeView === 'clients' && !selectedClient && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6" style={{ color: colors.warmGray }}>
                    Clientes Vitalis ({vitalisClients.length})
                  </h2>

                  {vitalisClients.length === 0 ? (
                    <div className="text-center py-12">
                      <Icons.Leaf />
                      <p className="mt-2" style={{ color: colors.warmGrayLight }}>Nenhum cliente ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vitalisClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-sm"
                          style={{ backgroundColor: '#F9F7F4' }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-medium"
                                 style={{ backgroundColor: colors.sage }}>
                              {client.users?.nome?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: colors.warmGray }}>
                                {client.users?.nome || client.nome_completo || 'Sem nome'}
                              </p>
                              <p className="text-sm" style={{ color: colors.warmGrayLight }}>
                                {client.users?.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(client.subscription_status)}`}>
                              {client.subscription_status || 'sem status'}
                            </span>

                            <button
                              onClick={() => loadClientDetails(client)}
                              className="p-2 rounded-lg transition-all hover:shadow-sm"
                              style={{ backgroundColor: '#E8E4DC', color: colors.warmGray }}
                            >
                              <Icons.ChevronRight />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CLIENT DETAIL */}
              {activeView === 'client-detail' && selectedClient && (
                <div className="p-6">
                  <button
                    onClick={() => { setSelectedClient(null); setActiveView('clients'); }}
                    className="flex items-center gap-2 mb-6 transition-all hover:opacity-70"
                    style={{ color: colors.sage }}
                  >
                    <Icons.ArrowLeft />
                    <span className="font-medium">Voltar</span>
                  </button>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white font-bold"
                         style={{ backgroundColor: colors.sage }}>
                      {selectedClient.users?.nome?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: colors.warmGray }}>
                        {selectedClient.users?.nome || selectedClient.nome_completo || 'Cliente'}
                      </h2>
                      <p style={{ color: colors.warmGrayLight }}>{selectedClient.users?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                      <p className="text-sm mb-1" style={{ color: colors.warmGrayLight }}>Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(selectedClient.subscription_status)}`}>
                        {selectedClient.subscription_status || 'N/A'}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                      <p className="text-sm mb-1" style={{ color: colors.warmGrayLight }}>Expira</p>
                      <p className="font-semibold" style={{ color: colors.warmGray }}>
                        {formatDate(selectedClient.subscription_expires)}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                      <p className="text-sm mb-1" style={{ color: colors.warmGrayLight }}>Pagamento</p>
                      <p className="font-semibold" style={{ color: colors.warmGray }}>
                        {selectedClient.payment_method || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                      <p className="text-sm mb-1" style={{ color: colors.warmGrayLight }}>Registo</p>
                      <p className="font-semibold" style={{ color: colors.warmGray }}>
                        {formatDate(selectedClient.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowMotivationPanel(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-all hover:shadow-md"
                      style={{ backgroundColor: colors.sage }}
                    >
                      <Icons.Heart />
                      Enviar Motivação
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?text=Olá ${selectedClient.users?.nome || 'Cliente'}! Como estás?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:shadow-md"
                      style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
                    >
                      WhatsApp
                    </a>
                    {(!selectedClient.subscription_status || selectedClient.subscription_status === 'expired') && (
                      <button
                        onClick={() => handleSetAsTester(selectedClient.user_id, 'Via Dashboard')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:shadow-md"
                        style={{ backgroundColor: '#E3F2FD', color: '#1565C0' }}
                      >
                        Tornar Tester
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ATTENTION LIST */}
              {activeView === 'attention' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6" style={{ color: colors.warmGray }}>
                    Clientes que Precisam de Atenção ({clientsNeedAttention.length})
                  </h2>

                  {clientsNeedAttention.length === 0 ? (
                    <div className="text-center py-12 rounded-xl" style={{ backgroundColor: '#E8F5E9' }}>
                      <span className="text-4xl block mb-2">🎉</span>
                      <p style={{ color: '#2E7D32' }}>Todos os clientes estão bem!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientsNeedAttention.map((client, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border-l-4"
                          style={{
                            backgroundColor: client.priority === 'high' ? '#FFF3E0' : '#FFFDE7',
                            borderLeftColor: client.priority === 'high' ? '#E65100' : '#F9A825'
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-lg" style={{ color: colors.warmGray }}>{client.nome}</p>
                              <p className="text-sm" style={{ color: colors.warmGrayLight }}>{client.email}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {client.reasons.map((r, j) => (
                                  <span
                                    key={j}
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                      backgroundColor: r.priority === 'high' ? '#FFCCBC' : '#FFF9C4',
                                      color: r.priority === 'high' ? '#BF360C' : '#F57F17'
                                    }}
                                  >
                                    {r.text}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => { setSelectedClient(client); setShowMotivationPanel(true); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-all hover:shadow-md"
                                style={{ backgroundColor: colors.sage }}
                              >
                                <Icons.Heart />
                                Motivar
                              </button>
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
                  <h2 className="text-xl font-semibold mb-6" style={{ color: colors.warmGray }}>
                    Waitlist ({waitlist.length})
                  </h2>

                  {waitlist.length === 0 ? (
                    <div className="text-center py-12 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                      <Icons.List />
                      <p className="mt-2" style={{ color: colors.warmGrayLight }}>Waitlist vazia</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {waitlist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                          <div>
                            <p className="font-medium" style={{ color: colors.warmGray }}>{item.nome}</p>
                            <p className="text-sm" style={{ color: colors.warmGrayLight }}>{item.email}</p>
                            {item.whatsapp && (
                              <p className="text-sm" style={{ color: '#2E7D32' }}>📱 {item.whatsapp}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>
                              {item.produto || 'Vitalis'}
                            </span>
                            <p className="text-xs mt-1" style={{ color: colors.warmGrayLight }}>{formatDate(item.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MOTIVATIONS */}
              {activeView === 'motivations' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6" style={{ color: colors.warmGray }}>
                    Sistema de Motivações
                  </h2>

                  <div className="mb-8">
                    <h3 className="font-semibold mb-4" style={{ color: colors.warmGray }}>Templates</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {MOTIVATION_TEMPLATES.map((t) => (
                        <div key={t.id} className="p-4 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{t.emoji}</span>
                            <span className="font-semibold" style={{ color: colors.sage }}>{t.title}</span>
                          </div>
                          <p className="text-sm line-clamp-2" style={{ color: colors.warmGrayLight }}>{t.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <button
                      onClick={() => setActiveView('attention')}
                      className="w-full p-4 rounded-xl flex items-center justify-between transition-all hover:shadow-md"
                      style={{ backgroundColor: '#FFF3E0', border: '1px solid #FFE0B2' }}
                    >
                      <div className="flex items-center gap-3">
                        <Icons.AlertCircle />
                        <span className="font-medium" style={{ color: '#E65100' }}>
                          Ver {clientsNeedAttention.length} cliente{clientsNeedAttention.length !== 1 ? 's' : ''} que precisa{clientsNeedAttention.length !== 1 ? 'm' : ''} de atenção
                        </span>
                      </div>
                      <Icons.ChevronRight />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4" style={{ color: colors.warmGray }}>Histórico</h3>
                    {motivationHistory.length === 0 ? (
                      <div className="text-center py-8 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                        <p style={{ color: colors.warmGrayLight }}>Nenhuma motivação enviada</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {motivationHistory.map((m, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F9F7F4' }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                                 style={{ backgroundColor: colors.sage }}>
                              {m.users?.nome?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium" style={{ color: colors.warmGray }}>{m.users?.nome || 'Cliente'}</p>
                              <p className="text-sm" style={{ color: colors.warmGrayLight }}>{m.descricao}</p>
                              <p className="text-xs mt-1" style={{ color: colors.warmGrayLight }}>{formatDate(m.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Motivation Panel Modal */}
      {showMotivationPanel && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'white' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.warmGray }}>Enviar Motivação</h3>
                  <p style={{ color: colors.sage }}>
                    Para: {selectedClient.users?.nome || selectedClient.nome_completo || selectedClient.nome}
                  </p>
                </div>
                <button
                  onClick={() => { setShowMotivationPanel(false); setCustomMessage(''); }}
                  className="p-2 rounded-lg transition-all hover:bg-gray-100"
                  style={{ color: colors.warmGray }}
                >
                  <Icons.X />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium mb-3" style={{ color: colors.warmGray }}>Escolhe um template:</p>
                <div className="space-y-2">
                  {MOTIVATION_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => sendMotivation(selectedClient, t)}
                      disabled={sendingMotivation}
                      className="w-full p-4 rounded-xl text-left transition-all hover:shadow-md disabled:opacity-50"
                      style={{ backgroundColor: '#F9F7F4' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{t.emoji}</span>
                        <span className="font-semibold" style={{ color: colors.sage }}>{t.title}</span>
                      </div>
                      <p className="text-sm line-clamp-2" style={{ color: colors.warmGrayLight }}>{t.message}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium mb-3" style={{ color: colors.warmGray }}>Ou mensagem personalizada:</p>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Escreve aqui..."
                  className="w-full p-4 rounded-xl resize-none focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#F9F7F4', focusRing: colors.sage }}
                  rows={4}
                />
                {customMessage && (
                  <button
                    onClick={() => sendMotivation(selectedClient, { message: customMessage }, customMessage)}
                    disabled={sendingMotivation}
                    className="mt-3 w-full py-3 rounded-xl text-white font-medium transition-all hover:shadow-md disabled:opacity-50"
                    style={{ backgroundColor: colors.sage }}
                  >
                    {sendingMotivation ? 'A enviar...' : 'Enviar Mensagem'}
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl" style={{ backgroundColor: '#E3F2FD' }}>
                <p className="text-sm" style={{ color: '#1565C0' }}>
                  <Icons.Mail /> A motivação será enviada por email e guardada no histórico.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;
