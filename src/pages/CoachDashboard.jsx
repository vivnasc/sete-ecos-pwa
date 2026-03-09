import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coachApi } from '../lib/coachApi';
import { SUBSCRIPTION_PLANS } from '../lib/subscriptions';
import { enviarBoasVindas, enviarConfirmacaoPagamento } from '../lib/emails';
import { supabase } from '../lib/supabase';
import { ECO_PLANS } from '../lib/shared/subscriptionPlans';

const CentroComunicacoes = lazy(() => import('../components/CentroComunicacoes'));

// ─── Real-time toast notifications ───
const POLL_INTERVAL = 30_000;

function CoachToast({ alerta, onDismiss, onNavigate }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setExiting(true); setTimeout(onDismiss, 300); }, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bgColor = alerta.prioridade === 'critica'
    ? 'bg-red-600' : alerta.prioridade === 'alta'
    ? 'bg-amber-500' : 'bg-gray-700';

  return (
    <div
      className={`${bgColor} text-white rounded-2xl px-4 py-3 shadow-2xl flex items-start gap-3 cursor-pointer backdrop-blur-sm
        transition-all duration-300 ${exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      style={{ maxWidth: 380, animation: exiting ? undefined : 'slideInRight 0.3s ease-out' }}
      onClick={() => { onNavigate(alerta.user_id); onDismiss(); }}
    >
      <span className="text-xl flex-shrink-0">{alerta.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{alerta.titulo}</p>
        {alerta.detalhe && <p className="text-xs opacity-80 mt-0.5 truncate">{alerta.detalhe}</p>}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setExiting(true); setTimeout(onDismiss, 300); }}
        className="text-white/60 hover:text-white flex-shrink-0 mt-0.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

const STATUS_LABELS = {
  tester: { label: 'Tester', cor: 'bg-purple-100 text-purple-700' },
  trial: { label: 'Trial', cor: 'bg-blue-100 text-blue-700' },
  active: { label: 'Activo', cor: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pendente', cor: 'bg-amber-100 text-amber-700' },
  expired: { label: 'Expirado', cor: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelado', cor: 'bg-gray-100 text-gray-700' },
};

function StatusBadge({ status }) {
  const config = STATUS_LABELS[status] || { label: status || 'N/A', cor: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${config.cor}`}>
      {config.label}
    </span>
  );
}

function PlanBadge({ hasIntake, hasPlan, planStatus, planErro }) {
  if (!hasIntake) return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">Sem intake</span>;
  if (planStatus === 'erro') return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700" title={planErro || 'Erro na geracao'}>Erro no plano</span>;
  if (!hasPlan) return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-700">Sem plano</span>;
  if (planStatus === 'pendente_revisao') return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">Aguarda revisao</span>;
  return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Plano activo</span>;
}

// ─── TABS ───
const TABS = [
  { key: 'clientes', label: 'Clientes', icon: '👥' },
  { key: 'ecos', label: 'Ecos', icon: '🌍' },
  { key: 'comms', label: 'Comunicações', icon: '📡' },
  { key: 'config', label: 'Config', icon: '⚙️' },
];

export default function CoachDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [gerandoPlano, setGerandoPlano] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [activeTab, setActiveTab] = useState('clientes');

  // Quick stats
  const [stats, setStats] = useState({ total: 0, active: 0, trial: 0, pending: 0, semPlano: 0, aguardaRevisao: 0, erros: 0 });
  const [multiEcoStats, setMultiEcoStats] = useState(null);
  const [selectedEco, setSelectedEco] = useState(null);
  const [ecoClients, setEcoClients] = useState([]);
  const [loadingEcoClients, setLoadingEcoClients] = useState(false);
  const [ecoAction, setEcoAction] = useState(null);

  // Coach notifications (static feed)
  const [notificacoes, setNotificacoes] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  // Real-time alerts (polling)
  const [toasts, setToasts] = useState([]);
  const seenAlertIds = useRef(new Set());
  const lastPollTime = useRef(null);
  const pollRef = useRef(null);

  // Push Notification subscription
  const [pushStatus, setPushStatus] = useState(null);
  const [pushActivando, setPushActivando] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testando, setTestando] = useState(false);

  useEffect(() => {
    registerPushSubscription();
  }, []);

  const registerPushSubscription = async (userInitiated = false) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported');
      return;
    }

    if (userInitiated) setPushActivando(true);

    if (Notification.permission === 'default') {
      if (!userInitiated) { setPushStatus('failed'); return; }
      try {
        const result = await Notification.requestPermission();
        if (result !== 'granted') { setPushStatus('denied'); setPushActivando(false); return; }
      } catch (e) {
        console.error('[Coach Push] Erro ao pedir permissão:', e);
        setPushStatus('failed'); setPushActivando(false); return;
      }
    } else if (Notification.permission === 'denied') {
      setPushStatus('denied');
      setPushActivando(false);
      return;
    }

    try {
      const { registarPushSubscription: registar } = await import('../lib/pushSubscription');
      const result = await registar();
      if (result.ok) {
        setPushStatus('subscribed');
        if (userInitiated) {
          try {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification('Push activado!', {
              body: 'Vais receber alertas de clientes a partir de agora.',
              icon: '/logos/VITALIS_LOGO_V3.png',
              tag: 'coach-push-activado',
            });
          } catch {}
        }
      } else {
        setPushStatus('failed');
      }
    } catch (err) {
      console.error('[Coach Push] Erro ao registar:', err);
      setPushStatus('failed');
    } finally {
      setPushActivando(false);
    }
  };

  const testarNotificacoes = async () => {
    setTestando(true);
    setTestResult(null);
    try {
      const result = await coachApi.testNotificacoes();
      setTestResult(result);
    } catch (err) {
      setTestResult({ ok: false, erro: err.message });
    } finally {
      setTestando(false);
    }
  };

  const showBrowserNotification = useCallback((alerta) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(alerta.titulo, {
        body: alerta.detalhe || '',
        icon: '/logos/VITALIS_LOGO_V3.png',
        tag: alerta.id,
        requireInteraction: alerta.prioridade === 'critica',
      });
      notif.onclick = () => { window.focus(); navigate(`/coach/cliente/${alerta.user_id}`); notif.close(); };
    }
  }, [navigate]);

  const pollAlertas = useCallback(async () => {
    try {
      const desde = lastPollTime.current || new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const data = await coachApi.buscarAlertasRT(desde);
      lastPollTime.current = new Date().toISOString();

      const newAlertas = (data.alertas || []).filter(a => !seenAlertIds.current.has(a.id));
      if (newAlertas.length > 0) {
        for (const a of newAlertas) seenAlertIds.current.add(a.id);
        setToasts(prev => [...newAlertas.map(a => ({ ...a, _key: a.id + '_' + Date.now() })), ...prev].slice(0, 5));
        for (const a of newAlertas) {
          if (a.som || a.prioridade === 'critica') showBrowserNotification(a);
        }
        loadNotificacoes();
      }
    } catch (err) {}
  }, [showBrowserNotification]);

  useEffect(() => {
    loadClients();
    loadMultiEcoStats();
    loadNotificacoes();

    const startPolling = () => {
      lastPollTime.current = new Date().toISOString();
      pollRef.current = setInterval(pollAlertas, POLL_INTERVAL);
    };
    const timer = setTimeout(startPolling, 3000);
    return () => { clearTimeout(timer); if (pollRef.current) clearInterval(pollRef.current); };
  }, [pollAlertas]);

  const loadMultiEcoStats = async () => {
    try {
      const ecoNames = ['serena', 'ignis', 'ventis', 'ecoa', 'imago', 'aurora', 'aurea'];
      const results = {};

      for (const eco of ecoNames) {
        const config = ECO_PLANS[eco];
        if (!config) continue;

        const { data } = await supabase
          .from(config.table)
          .select('subscription_status');

        if (data) {
          const ecoStats = { total: data.length, active: 0, trial: 0, pending: 0, tester: 0 };
          data.forEach(c => {
            if (c.subscription_status === 'active') ecoStats.active++;
            else if (c.subscription_status === 'trial') ecoStats.trial++;
            else if (c.subscription_status === 'pending') ecoStats.pending++;
            else if (c.subscription_status === 'tester') ecoStats.tester++;
          });
          results[eco] = ecoStats;
        }
      }

      setMultiEcoStats(results);
    } catch (err) {
      console.error('Erro ao carregar stats multi-eco:', err);
    }
  };

  const loadEcoClients = async (eco) => {
    setLoadingEcoClients(true);
    try {
      const data = await coachApi.listarClientesEco(eco);
      setEcoClients(data.clients || []);
      setSelectedEco(eco);
    } catch (err) {
      console.error('Erro ao carregar clientes ' + eco + ':', err);
      setEcoClients([]);
    }
    setLoadingEcoClients(false);
  };

  const handleEcoAction = async (eco, userId, actionType) => {
    setEcoAction({ userId, action: actionType, eco });
    try {
      if (actionType === 'tester') {
        await coachApi.setTesterEco(eco, userId);
      } else {
        await coachApi.activarSubscricaoEco(eco, userId, actionType);
      }
      await loadEcoClients(eco);
      await loadMultiEcoStats();
    } catch (err) {
      console.error('Erro:', err);
    }
    setEcoAction(null);
  };

  const loadClients = async () => {
    try {
      const data = await coachApi.listarClientes();
      const enriched = data.clients || [];
      const statsCalc = {
        total: enriched.length,
        active: enriched.filter(c => c.subscription_status === 'active').length,
        trial: enriched.filter(c => c.subscription_status === 'trial').length,
        pending: enriched.filter(c => c.subscription_status === 'pending').length,
        semPlano: enriched.filter(c => c.hasIntake && !c.hasPlan && c.planStatus !== 'erro').length,
        aguardaRevisao: enriched.filter(c => c.planStatus === 'pendente_revisao').length,
        erros: enriched.filter(c => c.planStatus === 'erro').length,
      };
      setClients(enriched);
      setStats(statsCalc);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificacoes = async () => {
    setLoadingNotifs(true);
    try {
      const data = await coachApi.buscarNotificacoes();
      setNotificacoes(data.notificacoes || []);
    } catch (err) {
      console.error('Erro ao carregar notificacoes coach:', err);
    }
    setLoadingNotifs(false);
  };

  const filteredClients = useMemo(() => {
    let result = clients;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(c => c.nome.toLowerCase().includes(s) || c.email.toLowerCase().includes(s));
    }
    if (filterStatus !== 'all') result = result.filter(c => c.subscription_status === filterStatus);
    if (filterPlan === 'sem_intake') result = result.filter(c => !c.hasIntake);
    else if (filterPlan === 'sem_plano') result = result.filter(c => c.hasIntake && !c.hasPlan && c.planStatus !== 'erro');
    else if (filterPlan === 'aguarda_revisao') result = result.filter(c => c.planStatus === 'pendente_revisao');
    else if (filterPlan === 'plano_activo') result = result.filter(c => c.planStatus === 'activo');
    else if (filterPlan === 'erro') result = result.filter(c => c.planStatus === 'erro');
    return result;
  }, [clients, search, filterStatus, filterPlan]);

  const handleGerarPlano = async (client) => {
    if (!confirm(`Gerar plano nutricional para ${client.nome}?`)) return;
    setGerandoPlano(client.user_id);
    try {
      const result = await coachApi.gerarPlano(client.user_id);
      alert(`Plano gerado com sucesso!\n${result.plano.calorias} kcal | P:${result.plano.macros.proteina}g C:${result.plano.macros.carboidratos}g G:${result.plano.macros.gordura}g\n\nPlano fica em revisao ate aprovares.`);
      loadClients();
    } catch (err) {
      alert('Erro ao gerar plano: ' + err.message);
    } finally {
      setGerandoPlano(null);
    }
  };

  const handleDeleteClient = async (client) => {
    const nome = client.nome || client.email;
    if (!confirm(`APAGAR cliente "${nome}"?\n\nIsto vai remover:\n- Registo vitalis_clients\n- Planos (vitalis_meal_plans)\n- Intake (vitalis_intake)\n- Habitos (vitalis_habitos)\n\nEsta accao e irreversivel!`)) return;
    if (!confirm(`Tens a certeza ABSOLUTA que queres apagar "${nome}"? Ultima chance!`)) return;
    setDeletingClient(client.user_id);
    try {
      await coachApi.apagarCliente(client.user_id);
      alert(`Cliente "${nome}" apagado com sucesso.`);
      loadClients();
    } catch (err) {
      alert('Erro ao apagar cliente: ' + err.message);
    } finally {
      setDeletingClient(null);
    }
  };

  const handleActivate = async (client, planKey = 'MONTHLY') => {
    if (!confirm(`Activar subscrição ${SUBSCRIPTION_PLANS[planKey].name} para ${client.nome}?`)) return;
    try {
      const result = await coachApi.activarSubscricao(client.user_id, planKey);
      const validoAte = new Date(result.expiresAt).toLocaleDateString('pt-PT');
      alert(`Subscrição activada até ${validoAte}`);
      const plan = SUBSCRIPTION_PLANS[planKey];
      enviarBoasVindas(client.email, client.nome, client.sexo).catch(() => {});
      enviarConfirmacaoPagamento(client.email, {
        nome: client.nome,
        plano: plan.name,
        valor: `${plan.price_mzn?.toLocaleString('pt-MZ') || plan.price_usd} ${plan.price_mzn ? 'MZN' : 'USD'}`,
        data: new Date().toLocaleDateString('pt-PT'),
        validoAte,
        sexo: client.sexo
      }).catch(() => {});
      loadClients();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const handleSetTester = async (client) => {
    if (!confirm(`Definir "${client.nome}" como tester (acesso gratuito)?`)) return;
    try {
      await coachApi.setTester(client.user_id);
      alert('Cliente definido como tester.');
      loadClients();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const tempoRelativo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const dias = Math.floor(hrs / 24);
    return `${dias}d`;
  };

  const notifsCount = notificacoes.filter(n => n.prioridade === 'critica' || n.prioridade === 'alta').length;

  const daysSince = (dateStr) => {
    if (!dateStr) return null;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  };

  const multiEcoTotal = multiEcoStats ? Object.values(multiEcoStats).reduce((acc, s) => acc + s.total, 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gray-600 border-t-white rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-400 text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ═══════ TOASTS ═══════ */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2" style={{ maxWidth: 380 }}>
          {toasts.map(t => (
            <CoachToast
              key={t._key}
              alerta={t}
              onDismiss={() => setToasts(prev => prev.filter(x => x._key !== t._key))}
              onNavigate={(uid) => navigate(`/coach/cliente/${uid}`)}
            />
          ))}
        </div>
      )}

      {/* ═══════ HEADER ═══════ */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <img src="/logos/VITALIS_LOGO_V3.png" alt="" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  Painel Coach
                  {pushStatus === 'subscribed' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Push activo" />
                  )}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Bell */}
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative p-2 rounded-xl transition-all ${showNotifs ? 'bg-white/20' : 'hover:bg-white/10'}`}
                title="Notificações"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-gray-900">
                    {notifsCount > 9 ? '9+' : notifsCount}
                  </span>
                )}
              </button>
              {/* Refresh */}
              <button
                onClick={() => { loadClients(); loadNotificacoes(); loadMultiEcoStats(); }}
                className="p-2 hover:bg-white/10 rounded-xl transition-all"
                title="Actualizar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-1">
            {[
              { to: '/coach/marketing', label: 'Marketing', color: 'pink' },
              { to: '/coach/analytics', label: 'Analytics', color: 'indigo' },
              { to: '/coach/chatbot-teste', label: 'Chatbot', color: 'emerald' },
              { to: '/coach/broadcast', label: 'Broadcast', color: 'green' },
              { to: '/coach/social', label: 'Social', color: 'purple' },
              { to: '/vitalis/dashboard', label: 'Vitalis', color: 'gray' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-all whitespace-nowrap flex-shrink-0 backdrop-blur-sm border border-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════ TABS ═══════ */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.key === 'ecos' && multiEcoTotal > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key ? 'bg-gray-200 text-gray-600' : 'bg-white/15 text-white/70'
                  }`}>{multiEcoTotal}</span>
                )}
                {tab.key === 'clientes' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key ? 'bg-gray-200 text-gray-600' : 'bg-white/15 text-white/70'
                  }`}>{stats.total}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">

        {/* Push banner — always visible if not subscribed */}
        {pushStatus && pushStatus !== 'subscribed' && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200/60">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 text-sm">🔕</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">Push desactivado</p>
              <p className="text-xs text-red-600/80">
                {pushStatus === 'denied' ? 'Bloqueado no browser.' : 'Sem alertas de clientes.'}
              </p>
            </div>
            {pushStatus !== 'denied' && (
              <button
                onClick={() => registerPushSubscription(true)}
                disabled={pushActivando}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all active:scale-95 disabled:opacity-60 flex-shrink-0"
              >
                {pushActivando ? '...' : 'Activar'}
              </button>
            )}
          </div>
        )}

        {/* ═══════ NOTIFICATION SLIDE ═══════ */}
        {showNotifs && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/60">
              <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <span>🔔</span> Actividade (7 dias)
              </h2>
              <button onClick={() => setShowNotifs(false)} className="text-amber-400 hover:text-amber-600 p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-50">
              {loadingNotifs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">Sem actividade recente</div>
              ) : (
                notificacoes.map(n => (
                  <Link
                    key={n.id}
                    to={`/coach/cliente/${n.user_id}`}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors ${
                      n.prioridade === 'critica' ? 'bg-red-50/40' : n.prioridade === 'alta' ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">{n.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${n.prioridade === 'critica' ? 'text-red-800' : 'text-gray-800'}`}>
                        {n.titulo}
                      </p>
                      {n.detalhe && <p className="text-xs text-gray-500 mt-0.5">{n.detalhe}</p>}
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 mt-1">{tempoRelativo(n.created_at)}</span>
                    {n.prioridade === 'critica' && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 mt-2" />}
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: CLIENTES                          */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'clientes' && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { key: 'total', label: 'Total', value: stats.total, filter: () => { setFilterStatus('all'); setFilterPlan('all'); }, active: filterStatus === 'all' && filterPlan === 'all', bg: 'from-gray-800 to-gray-900', ring: 'ring-gray-300' },
                { key: 'active', label: 'Activos', value: stats.active, filter: () => { setFilterStatus('active'); setFilterPlan('all'); }, active: filterStatus === 'active', bg: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-300' },
                { key: 'trial', label: 'Trial', value: stats.trial, filter: () => { setFilterStatus('trial'); setFilterPlan('all'); }, active: filterStatus === 'trial', bg: 'from-blue-500 to-blue-600', ring: 'ring-blue-300' },
                { key: 'pending', label: 'Pendentes', value: stats.pending, filter: () => { setFilterStatus('pending'); setFilterPlan('all'); }, active: filterStatus === 'pending', bg: 'from-amber-400 to-amber-500', ring: 'ring-amber-300' },
                { key: 'semPlano', label: 'Sem plano', value: stats.semPlano, filter: () => { setFilterStatus('all'); setFilterPlan('sem_plano'); }, active: filterPlan === 'sem_plano', bg: 'from-orange-400 to-orange-500', ring: 'ring-orange-300' },
                { key: 'revisao', label: 'Revisão', value: stats.aguardaRevisao, filter: () => { setFilterStatus('all'); setFilterPlan('aguarda_revisao'); }, active: filterPlan === 'aguarda_revisao', bg: 'from-violet-400 to-violet-500', ring: 'ring-violet-300' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={s.filter}
                  className={`relative p-3 rounded-2xl text-center transition-all overflow-hidden ${
                    s.active
                      ? `bg-gradient-to-br ${s.bg} text-white shadow-lg ring-2 ${s.ring} ring-offset-1`
                      : 'bg-white text-gray-700 hover:shadow-md border border-gray-100'
                  }`}
                >
                  <p className={`text-2xl font-black ${s.active ? '' : 'text-gray-800'}`}>{s.value}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${s.active ? 'text-white/80' : 'text-gray-500'}`}>{s.label}</p>
                </button>
              ))}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Procurar por nome ou email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-300 transition-all"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800/20"
              >
                <option value="all">Todos os estados</option>
                <option value="active">Activos</option>
                <option value="trial">Trial</option>
                <option value="pending">Pendentes</option>
                <option value="tester">Testers</option>
                <option value="expired">Expirados</option>
              </select>
              <select
                value={filterPlan}
                onChange={e => setFilterPlan(e.target.value)}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-800/20"
              >
                <option value="all">Todos os planos</option>
                <option value="sem_intake">Sem intake</option>
                <option value="sem_plano">Sem plano</option>
                <option value="aguarda_revisao">Aguarda revisão</option>
                <option value="plano_activo">Plano activo</option>
                <option value="erro">Erro no plano</option>
              </select>
            </div>

            {/* Pending payments */}
            {(() => {
              const pendentes = clients.filter(c => c.subscription_status === 'pending' && c.payment_reference);
              if (pendentes.length === 0) return null;
              return (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/60 rounded-2xl p-4">
                  <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2 text-sm">
                    <span>💰</span>
                    {pendentes.length} pagamento{pendentes.length !== 1 ? 's' : ''} pendente{pendentes.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-2">
                    {pendentes.map(c => (
                      <div key={c.user_id} className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-amber-100">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{c.nome}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                            <span className="text-amber-700 font-medium">📱 {c.payment_method || 'M-Pesa'}</span>
                            <span className="font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-lg border border-amber-200/60 text-[11px]">
                              {c.payment_reference}
                            </span>
                            {c.payment_amount && (
                              <span className="text-emerald-700 font-bold">
                                {Number(c.payment_amount).toLocaleString('pt-MZ')} {c.payment_currency || 'MZN'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          {['MONTHLY', 'SEMESTRAL', 'ANNUAL'].map(plan => (
                            <button
                              key={plan}
                              onClick={() => handleActivate(c, plan)}
                              className="px-2.5 py-1.5 text-[11px] font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                            >
                              {plan === 'MONTHLY' ? 'Mensal' : plan === 'SEMESTRAL' ? 'Semest.' : 'Anual'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Results count */}
            <p className="text-xs text-gray-400 font-medium">
              {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
              {(filterStatus !== 'all' || filterPlan !== 'all' || search.trim()) && ` (de ${clients.length})`}
            </p>

            {/* Client List */}
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm border border-gray-100">
                  {clients.length === 0 ? 'Nenhum cliente registado.' : 'Nenhum cliente corresponde aos filtros.'}
                </div>
              ) : (
                filteredClients.map(client => {
                  const inactivityDays = daysSince(client.lastActivity);
                  const isInactive = inactivityDays !== null && inactivityDays >= 5;
                  return (
                    <div
                      key={client.user_id}
                      className={`bg-white rounded-2xl border transition-all hover:shadow-md group ${
                        isInactive ? 'border-red-200/60' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                to={`/coach/cliente/${client.user_id}`}
                                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                              >
                                {client.nome}
                              </Link>
                              <StatusBadge status={client.subscription_status} />
                              <PlanBadge hasIntake={client.hasIntake} hasPlan={client.hasPlan} planStatus={client.planStatus} planErro={client.planErro} />
                              {isInactive && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                                  {inactivityDays}d inactivo
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate mt-0.5">{client.email}</p>
                            {client.planErro && (
                              <p className="text-xs text-red-500 mt-0.5 truncate">{client.planErro}</p>
                            )}
                            {client.subscription_status === 'pending' && client.payment_reference && (
                              <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                                <span className="text-amber-700 font-medium">📱 {client.payment_method || 'M-Pesa'}</span>
                                <span className="font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200/60 text-[11px]">
                                  {client.payment_reference}
                                </span>
                                {client.payment_amount && (
                                  <span className="text-emerald-700 font-semibold">
                                    {Number(client.payment_amount).toLocaleString('pt-MZ')} {client.payment_currency || 'MZN'}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                              {client.planCalorias && <span>{client.planCalorias} kcal</span>}
                              {client.subscription_expires && (
                                <span>Exp: {new Date(client.subscription_expires).toLocaleDateString('pt-PT')}</span>
                              )}
                              <span>Reg: {new Date(client.created_at).toLocaleDateString('pt-PT')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Link
                              to={`/coach/cliente/${client.user_id}`}
                              className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Ver
                            </Link>
                            {client.hasIntake && (!client.hasPlan || client.planStatus === 'erro') && (
                              <button
                                onClick={() => handleGerarPlano(client)}
                                disabled={gerandoPlano === client.user_id}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                                  client.planStatus === 'erro'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                }`}
                              >
                                {gerandoPlano === client.user_id ? '...' : (client.planStatus === 'erro' ? 'Retry' : 'Gerar')}
                              </button>
                            )}
                            <ClientActions
                              client={client}
                              onActivate={handleActivate}
                              onSetTester={handleSetTester}
                              onDelete={handleDeleteClient}
                              onGeneratePlan={handleGerarPlano}
                              isGenerating={gerandoPlano === client.user_id}
                              isDeleting={deletingClient === client.user_id}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: ECOS                              */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'ecos' && (
          <>
            {multiEcoStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(multiEcoStats).map(([eco, ecoStats]) => {
                    const config = ECO_PLANS[eco];
                    if (!config) return null;
                    const isSelected = selectedEco === eco;
                    return (
                      <button
                        key={eco}
                        onClick={() => isSelected ? setSelectedEco(null) : loadEcoClients(eco)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          isSelected ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md hover:scale-[1.01]'
                        }`}
                        style={{
                          borderColor: isSelected ? config.color : `${config.color}25`,
                          background: isSelected
                            ? `linear-gradient(135deg, ${config.color}12, ${config.color}06)`
                            : `linear-gradient(135deg, ${config.color}08, transparent)`,
                        }}
                      >
                        <div className="flex items-center gap-2.5 mb-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}
                          >
                            {config.name[0]}
                          </div>
                          <span className="font-bold text-gray-800">{config.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div className="bg-white/60 rounded-lg px-2 py-1">
                            <span className="text-gray-500">Total</span>
                            <span className="font-bold text-gray-800 ml-1">{ecoStats.total}</span>
                          </div>
                          <div className="bg-white/60 rounded-lg px-2 py-1">
                            <span className="text-emerald-600">Activos</span>
                            <span className="font-bold text-emerald-700 ml-1">{ecoStats.active}</span>
                          </div>
                          {ecoStats.trial > 0 && (
                            <div className="bg-white/60 rounded-lg px-2 py-1">
                              <span className="text-blue-600">Trial</span>
                              <span className="font-bold text-blue-700 ml-1">{ecoStats.trial}</span>
                            </div>
                          )}
                          {ecoStats.tester > 0 && (
                            <div className="bg-white/60 rounded-lg px-2 py-1">
                              <span className="text-purple-600">Tester</span>
                              <span className="font-bold text-purple-700 ml-1">{ecoStats.tester}</span>
                            </div>
                          )}
                          {ecoStats.pending > 0 && (
                            <div className="bg-white/60 rounded-lg px-2 py-1">
                              <span className="text-amber-600">Pend.</span>
                              <span className="font-bold text-amber-700 ml-1">{ecoStats.pending}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Eco Client List */}
                {selectedEco && (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
                      style={{ background: `linear-gradient(135deg, ${ECO_PLANS[selectedEco]?.color}08, transparent)` }}
                    >
                      <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: ECO_PLANS[selectedEco]?.color }}
                        >
                          {ECO_PLANS[selectedEco]?.name?.[0]}
                        </span>
                        Clientes {ECO_PLANS[selectedEco]?.name}
                      </h3>
                      <button
                        onClick={() => setSelectedEco(null)}
                        className="text-gray-400 hover:text-gray-600 text-xs font-medium px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Fechar
                      </button>
                    </div>

                    <div className="p-4">
                      {loadingEcoClients ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : ecoClients.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">Sem clientes neste eco</p>
                      ) : (
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                          {ecoClients.map(client => (
                            <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-colors">
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-800 text-sm truncate">{client.nome}</p>
                                <p className="text-xs text-gray-500 truncate">{client.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    client.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                    client.subscription_status === 'trial' ? 'bg-blue-100 text-blue-700' :
                                    client.subscription_status === 'tester' ? 'bg-purple-100 text-purple-700' :
                                    client.subscription_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    client.subscription_status === 'expired' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {client.subscription_status || 'sem status'}
                                  </span>
                                  {client.subscription_expires && (
                                    <span className="text-[11px] text-gray-400">
                                      exp: {new Date(client.subscription_expires).toLocaleDateString('pt')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2 shrink-0">
                                {client.subscription_status !== 'tester' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEcoAction(selectedEco, client.user_id, 'tester'); }}
                                    disabled={ecoAction?.userId === client.user_id}
                                    className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 transition-colors"
                                  >
                                    Tester
                                  </button>
                                )}
                                {client.subscription_status !== 'active' && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEcoAction(selectedEco, client.user_id, 'MONTHLY'); }}
                                    disabled={ecoAction?.userId === client.user_id}
                                    className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors"
                                  >
                                    Activar
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: COMUNICAÇÕES                      */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'comms' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
              <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <span>📡</span> Centro de Comunicações
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Emails, WhatsApp e push — tudo num só lugar</p>
            </div>
            <div className="p-4">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <CentroComunicacoes />
              </Suspense>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB: CONFIG                            */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'config' && (
          <div className="space-y-4 max-w-xl">
            {/* Push status */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <span>🔔</span> Notificações Push
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {pushStatus === 'subscribed' && 'Activas — recebes alertas de clientes em tempo real.'}
                    {pushStatus === 'denied' && 'Bloqueadas no browser. Vai às definições para permitir.'}
                    {pushStatus === 'unsupported' && 'Não suportado neste browser.'}
                    {pushStatus === 'failed' && 'Não activadas. Clica para activar.'}
                    {!pushStatus && 'A verificar...'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  pushStatus === 'subscribed' ? 'bg-emerald-400' : 'bg-gray-300'
                }`} />
              </div>
              {pushStatus && pushStatus !== 'subscribed' && pushStatus !== 'denied' && (
                <button
                  onClick={() => registerPushSubscription(true)}
                  disabled={pushActivando}
                  className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-60"
                >
                  {pushActivando ? 'A activar...' : 'Activar push'}
                </button>
              )}
            </div>

            {/* Test notifications */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
                <span>🧪</span> Testar notificações
              </h3>
              <p className="text-xs text-gray-500 mb-3">Envia teste para todos os canais configurados (Telegram, Push, etc.)</p>
              <button
                onClick={testarNotificacoes}
                disabled={testando}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60"
              >
                {testando ? 'A testar...' : 'Testar agora'}
              </button>
              {testResult && (
                <div className={`mt-3 p-3 rounded-xl text-xs space-y-1 ${testResult.ok ? 'bg-emerald-50 border border-emerald-200/60' : 'bg-red-50 border border-red-200/60'}`}>
                  <div className="font-bold">{testResult.ok ? '✅ Pelo menos 1 canal funciona!' : '❌ Nenhum canal funcionou'}</div>
                  {testResult.resultados?.telegram && (
                    <div>{testResult.resultados.telegram.enviado ? '✅' : '❌'} Telegram: {testResult.resultados.telegram.enviado ? 'OK' : (testResult.resultados.telegram.erro || 'Não configurado')}</div>
                  )}
                  {testResult.resultados?.push && (
                    <div>{testResult.resultados.push.enviado ? '✅' : '❌'} Push: {testResult.resultados.push.enviado ? 'OK' : (testResult.resultados.push.erro || 'Não configurado')} ({testResult.resultados.push.subscricoes} devices)</div>
                  )}
                  {testResult.resultados?.whatsapp && (
                    <div>📱 WhatsApp: {testResult.resultados.whatsapp.configurado ? `Configurado (${testResult.resultados.whatsapp.numero_destino})` : 'Não configurado'}</div>
                  )}
                  {testResult.resultados?.email && (
                    <div>📧 Email: {testResult.resultados.email.configurado ? 'Configurado' : 'Não configurado'}</div>
                  )}
                  {testResult.dica && <div className="mt-1 text-amber-700 font-medium">{testResult.dica}</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Client action dropdown
function ClientActions({ client, onActivate, onSetTester, onDelete, onGeneratePlan, isGenerating, isDeleting }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 text-sm overflow-hidden">
            <Link
              to={`/coach/cliente/${client.user_id}`}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Ver detalhes
            </Link>

            {client.hasIntake && (
              <button
                onClick={() => { onGeneratePlan(client); setOpen(false); }}
                disabled={isGenerating}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {client.hasPlan ? 'Regenerar plano' : 'Gerar plano'}
              </button>
            )}

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => { onActivate(client, 'MONTHLY'); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Activar mensal
            </button>
            <button
              onClick={() => { onActivate(client, 'SEMESTRAL'); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Activar semestral
            </button>
            <button
              onClick={() => { onActivate(client, 'ANNUAL'); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Activar anual
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => { onSetTester(client); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-purple-700 hover:bg-purple-50 transition-colors"
            >
              Definir como tester
            </button>

            {client.email && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Ola ${client.nome}!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-green-700 hover:bg-green-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                WhatsApp
              </a>
            )}

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => { onDelete(client); setOpen(false); }}
              disabled={isDeleting}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? 'A apagar...' : 'Apagar cliente'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
