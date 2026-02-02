import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * SETE ECOS - Dashboard Coach
 * 
 * Painel de controlo para a coach ver:
 * - Utilizadores registados
 * - Progresso Lumina/Vitalis
 * - Alertas
 * - Waitlist
 * - Detalhes de cada cliente
 */

const CoachDashboard = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumo');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Dados
  const [stats, setStats] = useState({
    totalUsers: 0,
    novosHoje: 0,
    novosSemana: 0,
    comLumina: 0,
    comVitalis: 0,
    waitlistTotal: 0
  });
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadAlerts(),
      loadWaitlist()
    ]);
    setLoading(false);
  };

  // ============================================================
  // CARREGAR ESTATÍSTICAS
  // ============================================================
  const loadStats = async () => {
    try {
      // Total de utilizadores
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Novos hoje
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const { count: novosHoje } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hoje.toISOString());

      // Novos esta semana
      const semanaAtras = new Date();
      semanaAtras.setDate(semanaAtras.getDate() - 7);
      const { count: novosSemana } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', semanaAtras.toISOString());

      // Com Lumina
      const { count: comLumina } = await supabase
        .from('lumina_checkins')
        .select('user_id', { count: 'exact', head: true });

      // Com Vitalis
      const { count: comVitalis } = await supabase
        .from('vitalis_clients')
        .select('user_id', { count: 'exact', head: true });

      // Waitlist
      const { count: waitlistTotal } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        novosHoje: novosHoje || 0,
        novosSemana: novosSemana || 0,
        comLumina: comLumina || 0,
        comVitalis: comVitalis || 0,
        waitlistTotal: waitlistTotal || 0
      });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  // ============================================================
  // CARREGAR UTILIZADORES
  // ============================================================
  const loadUsers = async () => {
    try {
      // Buscar utilizadores
      const { data: usersData } = await supabase
        .from('users')
        .select('id, nome, email, created_at')
        .order('created_at', { ascending: false });

      if (!usersData) return;

      // Buscar quem tem Lumina
      const { data: luminaData } = await supabase
        .from('lumina_checkins')
        .select('user_id');
      const luminaUsers = new Set(luminaData?.map(l => l.user_id) || []);

      // Buscar quem tem Vitalis
      const { data: vitalisData } = await supabase
        .from('vitalis_clients')
        .select('user_id, objectivo_principal, fase_actual, ultimo_registo');
      const vitalisMap = new Map(vitalisData?.map(v => [v.user_id, v]) || []);

      // Combinar dados
      const combinedUsers = usersData.map(user => ({
        ...user,
        temLumina: luminaUsers.has(user.id),
        temVitalis: vitalisMap.has(user.id),
        vitalisInfo: vitalisMap.get(user.id) || null
      }));

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Erro ao carregar users:', error);
    }
  };

  // ============================================================
  // CARREGAR ALERTAS
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

  // ============================================================
  // CARREGAR WAITLIST
  // ============================================================
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
  // CARREGAR DETALHES DE UM UTILIZADOR
  // ============================================================
  const loadUserDetails = async (userId) => {
    setSelectedUser(userId);
    
    try {
      // Dados básicos
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Lumina
      const { data: lumina } = await supabase
        .from('lumina_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      // Vitalis Client
      const { data: vitalisClient } = await supabase
        .from('vitalis_clients')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Vitalis Plano
      const { data: vitalisPlano } = await supabase
        .from('vitalis_plano')
        .select('*')
        .eq('client_id', userId)
        .single();

      // PDFs gerados
      const { data: pdfs } = await supabase
        .from('vitalis_pdfs_gerados')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Tracking água (últimos 7 dias)
      const { data: agua } = await supabase
        .from('vitalis_agua_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(7);

      setUserDetails({
        user,
        lumina: lumina?.[0] || null,
        vitalisClient,
        vitalisPlano,
        pdfs: pdfs || [],
        agua: agua || []
      });
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  // ============================================================
  // MARCAR ALERTA COMO LIDO
  // ============================================================
  const markAlertAsRead = async (alertId) => {
    try {
      await supabase
        .from('vitalis_alerts')
        .update({ status: 'lido' })
        .eq('id', alertId);

      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Erro ao marcar alerta:', error);
    }
  };

  // ============================================================
  // FORMATADORES
  // ============================================================
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // ============================================================
  // RENDER - LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-900">A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER - MAIN
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-amber-900">
              🎯 Dashboard Coach
            </h1>
            <p className="text-sm text-gray-500">Sete Ecos - Painel de Controlo</p>
          </div>
          <button 
            onClick={loadAllData}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
          >
            🔄 Actualizar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard 
            icon="👥" 
            label="Total Users" 
            value={stats.totalUsers} 
            color="bg-blue-50 text-blue-700"
          />
          <StatCard 
            icon="🆕" 
            label="Novos Hoje" 
            value={stats.novosHoje} 
            color="bg-green-50 text-green-700"
          />
          <StatCard 
            icon="📅" 
            label="Esta Semana" 
            value={stats.novosSemana} 
            color="bg-purple-50 text-purple-700"
          />
          <StatCard 
            icon="💡" 
            label="Com Lumina" 
            value={stats.comLumina} 
            color="bg-yellow-50 text-yellow-700"
          />
          <StatCard 
            icon="🌱" 
            label="Com Vitalis" 
            value={stats.comVitalis} 
            color="bg-emerald-50 text-emerald-700"
          />
          <StatCard 
            icon="📋" 
            label="Waitlist" 
            value={stats.waitlistTotal} 
            color="bg-orange-50 text-orange-700"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-amber-200 pb-2">
          {[
            { id: 'resumo', label: '📊 Resumo', count: null },
            { id: 'alertas', label: '🔔 Alertas', count: alerts.length },
            { id: 'users', label: '👥 Utilizadores', count: users.length },
            { id: 'waitlist', label: '📋 Waitlist', count: waitlist.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedUser(null); }}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-gray-500 hover:text-amber-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo das Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* TAB: RESUMO */}
          {activeTab === 'resumo' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-amber-900 mb-4">
                Visão Geral
              </h2>
              
              {/* Últimos registos */}
              <div>
                <h3 className="font-medium text-amber-900 mb-3">Últimos Registos</h3>
                <div className="space-y-2">
                  {users.slice(0, 5).map(user => (
                    <div 
                      key={user.id}
                      onClick={() => { setActiveTab('users'); loadUserDetails(user.id); }}
                      className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg cursor-pointer hover:bg-amber-100/50 transition"
                    >
                      <div>
                        <p className="font-medium text-amber-900">{user.nome}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={user.temLumina ? 'text-green-500' : 'text-gray-300'}>
                          💡
                        </span>
                        <span className={user.temVitalis ? 'text-green-500' : 'text-gray-300'}>
                          🌱
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateShort(user.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas recentes */}
              {alerts.length > 0 && (
                <div>
                  <h3 className="font-medium text-amber-900 mb-3">
                    🔔 Alertas Pendentes ({alerts.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.slice(0, 3).map(alert => (
                      <div 
                        key={alert.id}
                        className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <p className="text-sm text-orange-800">{alert.descricao}</p>
                        <p className="text-xs text-orange-600 mt-1">
                          {formatDate(alert.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ALERTAS */}
          {activeTab === 'alertas' && (
            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-4">
                🔔 Alertas
              </h2>
              
              {alerts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum alerta pendente ✨
                </p>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id}
                      className="flex items-center justify-between p-4 bg-amber-50/50 rounded-lg border-l-4 border-amber-500"
                    >
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          alert.prioridade === 'alta' 
                            ? 'bg-red-100 text-red-700'
                            : alert.prioridade === 'media'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {alert.tipo_alerta}
                        </span>
                        <p className="text-amber-900 mt-2">{alert.descricao}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(alert.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition"
                      >
                        ✓ Marcar lido
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: UTILIZADORES */}
          {activeTab === 'users' && !selectedUser && (
            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-4">
                👥 Utilizadores ({users.length})
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-amber-200">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Nome</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Email</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Lumina</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Vitalis</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Registo</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Acções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr 
                        key={user.id} 
                        className="border-b border-amber-100 hover:bg-amber-50/50 transition"
                      >
                        <td className="py-3 px-2 font-medium text-amber-900">
                          {user.nome}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {user.temLumina ? '✅' : '❌'}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {user.temVitalis ? '✅' : '❌'}
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-500">
                          {formatDateShort(user.created_at)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => loadUserDetails(user.id)}
                            className="px-3 py-1 text-sm bg-amber-500 text-white rounded hover:bg-amber-600 transition"
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: UTILIZADORES - DETALHES */}
          {activeTab === 'users' && selectedUser && userDetails && (
            <div>
              <button
                onClick={() => { setSelectedUser(null); setUserDetails(null); }}
                className="mb-4 text-amber-600 hover:underline"
              >
                ← Voltar à lista
              </button>

              <div className="space-y-6">
                {/* Info básica */}
                <div className="bg-amber-50/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-amber-900 mb-4">
                    👤 {userDetails.user?.nome}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="text-amber-900">{userDetails.user?.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Registo:</span>
                      <p className="text-amber-900">{formatDate(userDetails.user?.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Lumina */}
                <div className="bg-yellow-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">
                    💡 Lumina
                  </h3>
                  {userDetails.lumina ? (
                    <div className="text-sm">
                      <p className="text-green-600 mb-2">✅ Completou em {formatDate(userDetails.lumina.created_at)}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">❌ Ainda não completou o Lumina</p>
                  )}
                </div>

                {/* Vitalis */}
                <div className="bg-emerald-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">
                    🌱 Vitalis
                  </h3>
                  {userDetails.vitalisClient ? (
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-gray-500">Objectivo:</span>
                          <p className="text-amber-900 font-medium">
                            {userDetails.vitalisClient.objectivo_principal || '-'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Fase:</span>
                          <p className="text-amber-900 font-medium">
                            {userDetails.vitalisClient.fase_actual || '-'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Peso Inicial:</span>
                          <p className="text-amber-900 font-medium">
                            {userDetails.vitalisClient.peso_inicial || '-'} kg
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Peso Actual:</span>
                          <p className="text-amber-900 font-medium">
                            {userDetails.vitalisClient.peso_actual || '-'} kg
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Último registo:</span>
                        <p className="text-amber-900">
                          {formatDate(userDetails.vitalisClient.ultimo_registo)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">❌ Ainda não entrou no Vitalis</p>
                  )}
                </div>

                {/* Vitalis Plano */}
                {userDetails.vitalisPlano && (
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4">
                      📋 Plano Alimentar
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Calorias:</span>
                        <p className="text-amber-900 font-medium">
                          {userDetails.vitalisPlano.calorias_diarias || '-'} kcal
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Proteína:</span>
                        <p className="text-amber-900 font-medium">
                          {userDetails.vitalisPlano.proteina_g || '-'} g
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Carboidratos:</span>
                        <p className="text-amber-900 font-medium">
                          {userDetails.vitalisPlano.carboidratos_g || '-'} g
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Gordura:</span>
                        <p className="text-amber-900 font-medium">
                          {userDetails.vitalisPlano.gordura_g || '-'} g
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PDFs */}
                {userDetails.pdfs?.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4">
                      📄 PDFs Gerados ({userDetails.pdfs.length})
                    </h3>
                    <div className="space-y-2">
                      {userDetails.pdfs.map((pdf, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg"
                        >
                          <span className="text-sm text-amber-900">
                            {formatDate(pdf.created_at)}
                          </span>
                          {pdf.pdf_url && (
                            <a
                              href={pdf.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-amber-600 hover:underline font-medium"
                            >
                              Ver PDF →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracking Água */}
                {userDetails.agua?.length > 0 && (
                  <div className="bg-cyan-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4">
                      💧 Água (últimos 7 dias)
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                      {userDetails.agua.map((log, index) => (
                        <div key={index} className="text-center p-2 bg-white rounded-lg">
                          <p className="text-xs text-gray-500">{formatDateShort(log.created_at)}</p>
                          <p className="text-lg font-medium text-cyan-600">{log.quantidade || 0}ml</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: WAITLIST */}
          {activeTab === 'waitlist' && (
            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-4">
                📋 Lista de Espera ({waitlist.length})
              </h2>
              
              {waitlist.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum registo na lista de espera
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-amber-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Nome</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Email</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">WhatsApp</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Produto</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlist.map(lead => (
                        <tr 
                          key={lead.id} 
                          className="border-b border-amber-100 hover:bg-amber-50/50 transition"
                        >
                          <td className="py-3 px-2 font-medium text-amber-900">
                            {lead.nome}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-500">
                            {lead.email}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-500">
                            {lead.whatsapp ? (
                              <a 
                                href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:underline"
                              >
                                {lead.whatsapp}
                              </a>
                            ) : '-'}
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                              {lead.produto || 'geral'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-500">
                            {formatDate(lead.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
// COMPONENTE: STAT CARD
// ============================================================
const StatCard = ({ icon, label, value, color }) => (
  <div className={`${color} rounded-xl p-4 text-center`}>
    <span className="text-2xl">{icon}</span>
    <p className="text-2xl font-bold mt-1">{value}</p>
    <p className="text-xs opacity-80">{label}</p>
  </div>
);

export default CoachDashboard;
