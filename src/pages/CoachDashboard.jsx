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

/**
 * SETE ECOS - COACH DASHBOARD v2
 * Design moderno, cores suaves, UX melhorada
 */

const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/FbHbQuDPGAZ3myiu29CmHO';

// Templates de motivação
const MOTIVATION_TEMPLATES = [
  { id: 'comeback', emoji: '🌟', title: 'Regresso', message: 'Olá! Senti a tua falta por aqui. Lembra-te: cada dia é uma nova oportunidade para cuidares de ti. Estou aqui para te apoiar! 💜' },
  { id: 'progress', emoji: '💪', title: 'Progresso', message: 'Parabéns pelo teu progresso! Continua assim, estás a fazer um trabalho incrível! O teu esforço está a dar frutos. 🌱' },
  { id: 'struggle', emoji: '💜', title: 'Apoio', message: 'Sei que nem todos os dias são fáceis. Lembra-te que pequenos passos também contam. Estou aqui contigo, não desistas!' },
  { id: 'weekly', emoji: '✨', title: 'Semanal', message: 'Nova semana, novas possibilidades! Vamos definir uma intenção para esta semana? Estou aqui para te ajudar a alcançar os teus objetivos.' },
  { id: 'celebration', emoji: '🎉', title: 'Celebração', message: 'Que conquista! Estou tão orgulhosa do teu caminho. Continua a brilhar! 🌟' },
];

const CoachDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [activeFilter, setActiveFilter] = useState(null);
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

        // Verificar última atividade
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

  // Enviar motivação por email e guardar
  const sendMotivation = async (client, template, customMsg = '') => {
    setSendingMotivation(true);
    try {
      const message = customMsg || template.message;
      const clientName = client.users?.nome || client.nome_completo || 'Cliente';
      const clientEmail = client.users?.email || '';

      if (!clientEmail) {
        alert('❌ Cliente não tem email registado');
        setSendingMotivation(false);
        return;
      }

      // 1. Guardar na base de dados
      await supabase.from('vitalis_alerts').insert({
        user_id: client.user_id,
        tipo_alerta: 'motivacao_coach',
        descricao: message,
        prioridade: 'baixa',
        status: 'enviado'
      });

      // 2. Enviar email via Resend API
      const emailResult = await enviarEmail('lembrete-checkin', clientEmail, {
        nome: clientName,
        dias: 'alguns',
        mensagem: message
      });

      if (emailResult.success) {
        alert(`✅ Motivação enviada com sucesso!\n\n👤 Para: ${clientName}\n📧 Email: ${clientEmail}\n💬 Mensagem enviada!`);
      } else {
        // Email falhou mas guardámos na base de dados
        alert(`⚠️ Motivação guardada mas email pode não ter sido enviado.\n\nVerifica se RESEND_API_KEY está configurada no Vercel.`);
      }

      await loadMotivationHistory();
      setCustomMessage('');
      setShowMotivationPanel(false);
    } catch (error) {
      console.error('Erro ao enviar motivação:', error);
      alert('❌ Erro ao enviar motivação: ' + error.message);
    } finally {
      setSendingMotivation(false);
    }
  };

  const handleSetAsTester = async (userId, reason) => {
    try {
      await setAsTester(userId, reason);
      alert('✅ Utilizador definido como tester!');
      loadVitalisClients();
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTimeAgo = (date) => {
    if (!date) return '-';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // ========== RENDER ==========

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600">A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 px-4 md:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xl md:text-2xl shadow-lg">
              🎯
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">Coach Dashboard</h1>
              <p className="text-xs md:text-sm text-purple-600">Sete Ecos • Vitalis</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={WHATSAPP_COMMUNITY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-all border border-green-200"
            >
              💬 <span className="hidden sm:inline">Comunidade</span>
            </a>
            <button
              onClick={loadAllData}
              className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-all"
              title="Atualizar"
            >
              🔄
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Stats Cards - Clicáveis */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {[
            { key: 'total', icon: '👥', label: 'Total', value: stats.totalUsers, color: 'purple' },
            { key: 'hoje', icon: '🆕', label: 'Hoje', value: stats.novosHoje, color: 'green' },
            { key: 'semana', icon: '📅', label: 'Semana', value: stats.novosSemana, color: 'blue' },
            { key: 'lumina', icon: '💡', label: 'Lumina', value: stats.comLumina, color: 'amber' },
            { key: 'vitalis', icon: '🌱', label: 'Vitalis', value: stats.comVitalis, color: 'emerald' },
            { key: 'waitlist', icon: '📋', label: 'Waitlist', value: stats.waitlistTotal, color: 'orange' },
            { key: 'atencao', icon: '⚠️', label: 'Atenção', value: stats.needAttention, color: 'red' },
            { key: 'testers', icon: '🧪', label: 'Testers', value: subscriptionStats?.testers || 0, color: 'cyan' },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => {
                setActiveFilter(activeFilter === stat.key ? null : stat.key);
                if (stat.key === 'atencao') setActiveView('attention');
                else if (stat.key === 'waitlist') setActiveView('waitlist');
                else if (stat.key === 'vitalis') setActiveView('clients');
                else setActiveView('overview');
              }}
              className={`p-3 md:p-4 rounded-xl text-center transition-all hover:scale-105 ${
                activeFilter === stat.key
                  ? `bg-${stat.color}-100 border-2 border-${stat.color}-400 shadow-lg`
                  : 'bg-white border border-gray-100 hover:border-purple-200 shadow-sm'
              }`}
            >
              <div className="text-xl md:text-2xl mb-1">{stat.icon}</div>
              <div className={`text-lg md:text-2xl font-bold ${activeFilter === stat.key ? `text-${stat.color}-600` : 'text-gray-800'}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: '📊 Resumo' },
            { id: 'clients', label: `🌱 Clientes (${vitalisClients.length})` },
            { id: 'attention', label: `⚠️ Atenção (${clientsNeedAttention.length})` },
            { id: 'waitlist', label: `📋 Waitlist (${waitlist.length})` },
            { id: 'motivations', label: '💜 Motivações' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveView(tab.id); setSelectedClient(null); }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${
                activeView === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* OVERVIEW */}
          {activeView === 'overview' && (
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 Resumo Geral
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Subscrições */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-800 mb-3">💰 Subscrições</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-emerald-600">{subscriptionStats?.testers || 0}</div>
                      <div className="text-xs text-gray-500">Testers</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{subscriptionStats?.active || 0}</div>
                      <div className="text-xs text-gray-500">Ativos</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-yellow-600">{subscriptionStats?.pending || 0}</div>
                      <div className="text-xs text-gray-500">Pendentes</div>
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h3 className="font-semibold text-indigo-800 mb-3">🚀 Ações Rápidas</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveView('attention')}
                      className="w-full p-3 bg-white rounded-lg text-left hover:bg-red-50 transition-all flex items-center justify-between"
                    >
                      <span>⚠️ Ver clientes que precisam de atenção</span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">{clientsNeedAttention.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveView('motivations')}
                      className="w-full p-3 bg-white rounded-lg text-left hover:bg-purple-50 transition-all flex items-center justify-between"
                    >
                      <span>💜 Enviar motivações</span>
                      <span className="text-purple-400">→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Últimas Motivações Enviadas */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">📨 Últimas Motivações Enviadas</h3>
                {motivationHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma motivação enviada ainda</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {motivationHistory.slice(0, 5).map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-xl">💜</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{m.users?.nome || 'Cliente'}</p>
                          <p className="text-sm text-gray-500 truncate">{m.descricao}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{formatTimeAgo(m.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CLIENTS LIST */}
          {activeView === 'clients' && !selectedClient && (
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🌱 Clientes Vitalis ({vitalisClients.length})</h2>

              {vitalisClients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum cliente ainda</p>
              ) : (
                <div className="space-y-3">
                  {vitalisClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg">
                          {client.users?.nome?.[0]?.toUpperCase() || '👤'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{client.users?.nome || client.nome_completo || 'Sem nome'}</p>
                          <p className="text-sm text-gray-500">{client.users?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.subscription_status === 'tester' ? 'bg-emerald-100 text-emerald-700' :
                          client.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
                          client.subscription_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {client.subscription_status || 'sem status'}
                        </span>

                        <button
                          onClick={() => loadClientDetails(client)}
                          className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-all"
                        >
                          👁️ Ver detalhes
                        </button>

                        <button
                          onClick={() => { setSelectedClient(client); setShowMotivationPanel(true); }}
                          className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm font-medium transition-all"
                        >
                          💜 Motivar
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
            <div className="p-4 md:p-6">
              {/* Header com nome do cliente em destaque */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <button
                  onClick={() => { setSelectedClient(null); setActiveView('clients'); }}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  ←
                </button>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-2xl text-white font-bold">
                  {selectedClient.users?.nome?.[0]?.toUpperCase() || '👤'}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    {selectedClient.users?.nome || selectedClient.nome_completo || 'Cliente'}
                  </h2>
                  <p className="text-gray-500">{selectedClient.users?.email}</p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-600 mb-1">Status</div>
                  <div className="font-bold text-purple-800">{selectedClient.subscription_status || 'N/A'}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-600 mb-1">Método Pagamento</div>
                  <div className="font-bold text-blue-800">{selectedClient.payment_method || 'N/A'}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-green-600 mb-1">Expira em</div>
                  <div className="font-bold text-green-800">{formatDate(selectedClient.subscription_expires)}</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="text-sm text-amber-600 mb-1">Registado em</div>
                  <div className="font-bold text-amber-800">{formatDate(selectedClient.created_at)}</div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowMotivationPanel(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                >
                  💜 Enviar Motivação
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=Olá ${selectedClient.users?.nome || 'Cliente'}! Como estás?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-all"
                >
                  💬 WhatsApp
                </a>
                {(!selectedClient.subscription_status || selectedClient.subscription_status === 'expired') && (
                  <button
                    onClick={() => handleSetAsTester(selectedClient.user_id, 'Via Dashboard')}
                    className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-medium transition-all"
                  >
                    🧪 Tornar Tester
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ATTENTION LIST */}
          {activeView === 'attention' && (
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">⚠️ Clientes que Precisam de Atenção ({clientsNeedAttention.length})</h2>

              {clientsNeedAttention.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">🎉</span>
                  <p className="text-gray-600">Todos os clientes estão bem!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientsNeedAttention.map((client, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border-2 ${
                        client.priority === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{client.nome}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {client.reasons.map((r, j) => (
                              <span
                                key={j}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  r.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {r.text}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => { setSelectedClient(client); setShowMotivationPanel(true); }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all"
                          >
                            💜 Motivar {client.nome.split(' ')[0]}
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?text=Olá ${client.nome}! Como estás? Senti a tua falta no Vitalis 🌱`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-all"
                          >
                            💬 WhatsApp
                          </a>
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
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Waitlist ({waitlist.length})</h2>

              {waitlist.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Waitlist vazia</p>
              ) : (
                <div className="space-y-3">
                  {waitlist.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-orange-50 rounded-xl gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">{item.nome}</p>
                        <p className="text-sm text-gray-500">{item.email}</p>
                        {item.whatsapp && <p className="text-sm text-green-600">📱 {item.whatsapp}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          {item.produto || 'Vitalis'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MOTIVATIONS */}
          {activeView === 'motivations' && (
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">💜 Sistema de Motivações</h2>

              {/* Templates */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">📝 Templates Disponíveis</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOTIVATION_TEMPLATES.map((t) => (
                    <div key={t.id} className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{t.emoji}</span>
                        <span className="font-semibold text-purple-800">{t.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{t.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escolher cliente para motivar */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">👥 Enviar Motivação</h3>
                <p className="text-sm text-gray-500 mb-3">Seleciona um cliente da lista para enviar uma motivação:</p>
                <button
                  onClick={() => setActiveView('attention')}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-all"
                >
                  ⚠️ Ver clientes que precisam de atenção ({clientsNeedAttention.length})
                </button>
              </div>

              {/* Histórico */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">📨 Histórico de Motivações</h3>
                {motivationHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-xl">Nenhuma motivação enviada ainda</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {motivationHistory.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-xl mt-1">💜</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800">{m.users?.nome || 'Cliente'}</p>
                          <p className="text-sm text-gray-600">{m.descricao}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(m.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Motivation Panel Modal */}
      {showMotivationPanel && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">💜 Enviar Motivação</h3>
                  <p className="text-purple-600 font-medium">
                    Para: {selectedClient.users?.nome || selectedClient.nome_completo || selectedClient.nome}
                  </p>
                </div>
                <button
                  onClick={() => { setShowMotivationPanel(false); setCustomMessage(''); }}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Templates */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Escolhe um template:</p>
                <div className="space-y-2">
                  {MOTIVATION_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => sendMotivation(selectedClient, t)}
                      disabled={sendingMotivation}
                      className="w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-all border border-purple-100 disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{t.emoji}</span>
                        <span className="font-semibold text-purple-800">{t.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{t.message}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Ou escreve uma mensagem personalizada:</p>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Escreve aqui a tua mensagem..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                  rows={4}
                />
                {customMessage && (
                  <button
                    onClick={() => sendMotivation(selectedClient, { message: customMessage }, customMessage)}
                    disabled={sendingMotivation}
                    className="mt-2 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    {sendingMotivation ? 'A enviar...' : '📧 Enviar Mensagem Personalizada'}
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  📧 A motivação será enviada por email e guardada no histórico.
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
