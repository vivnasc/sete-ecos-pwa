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

  return (
    <div
      className={`bg-gray-900/95 backdrop-blur-xl text-white rounded-2xl px-4 py-3 shadow-2xl flex items-start gap-3 cursor-pointer
        border border-white/10 transition-all duration-300 ${exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      style={{ maxWidth: 380, animation: exiting ? undefined : 'slideInRight 0.3s ease-out' }}
      onClick={() => { onNavigate(alerta.user_id); onDismiss(); }}
    >
      <span className="text-xl flex-shrink-0">{alerta.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{alerta.titulo}</p>
        {alerta.detalhe && <p className="text-xs text-white/60 mt-0.5 truncate">{alerta.detalhe}</p>}
      </div>
      <button onClick={(e) => { e.stopPropagation(); setExiting(true); setTimeout(onDismiss, 300); }} className="text-white/40 hover:text-white flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

// ─── Avatar with gradient ───
function ClientAvatar({ nome, status, size = 'md' }) {
  const initials = (nome || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const gradients = {
    active: 'from-emerald-400 to-teal-500',
    trial: 'from-blue-400 to-indigo-500',
    tester: 'from-violet-400 to-purple-500',
    pending: 'from-amber-400 to-orange-500',
    expired: 'from-red-400 to-rose-500',
    cancelled: 'from-gray-400 to-gray-500',
  };
  const grad = gradients[status] || 'from-gray-400 to-gray-500';
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Tabs ───
const TABS = [
  { key: 'resumo', label: 'Resumo' },
  { key: 'vitalis', label: 'Vitalis' },
  { key: 'ecos', label: 'Ecos' },
  { key: 'comms', label: 'Comms' },
  { key: 'config', label: 'Config' },
];

// ─── Quick link config ───
const QUICK_LINKS = [
  { to: '/coach/marketing', label: 'Marketing' },
  { to: '/coach/analytics', label: 'Analytics' },
  { to: '/coach/chatbot-teste', label: 'Chatbot' },
  { to: '/coach/broadcast', label: 'Broadcast' },
  { to: '/coach/social', label: 'Social' },
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
  const [activeTab, setActiveTab] = useState('resumo');

  const [stats, setStats] = useState({ total: 0, active: 0, trial: 0, pending: 0, semPlano: 0, aguardaRevisao: 0, erros: 0 });
  const [multiEcoStats, setMultiEcoStats] = useState(null);
  const [selectedEco, setSelectedEco] = useState(null);
  const [ecoClients, setEcoClients] = useState([]);
  const [loadingEcoClients, setLoadingEcoClients] = useState(false);
  const [ecoAction, setEcoAction] = useState(null);

  const [notificacoes, setNotificacoes] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  const [toasts, setToasts] = useState([]);
  const seenAlertIds = useRef(new Set());
  const lastPollTime = useRef(null);
  const pollRef = useRef(null);

  const [pushStatus, setPushStatus] = useState(null);
  const [pushActivando, setPushActivando] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testando, setTestando] = useState(false);

  // ─── Push registration ───
  useEffect(() => { registerPushSubscription(); }, []);

  const registerPushSubscription = async (userInitiated = false) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setPushStatus('unsupported'); return; }
    if (userInitiated) setPushActivando(true);
    if (Notification.permission === 'default') {
      if (!userInitiated) { setPushStatus('failed'); return; }
      try {
        const result = await Notification.requestPermission();
        if (result !== 'granted') { setPushStatus('denied'); setPushActivando(false); return; }
      } catch { setPushStatus('failed'); setPushActivando(false); return; }
    } else if (Notification.permission === 'denied') { setPushStatus('denied'); setPushActivando(false); return; }
    try {
      const { registarPushSubscription: registar } = await import('../lib/pushSubscription');
      const result = await registar();
      if (result.ok) {
        setPushStatus('subscribed');
        if (userInitiated) {
          try { const reg = await navigator.serviceWorker.ready; reg.showNotification('Push activado!', { body: 'Vais receber alertas de clientes.', icon: '/logos/VITALIS_LOGO_V3.png', tag: 'coach-push-activado' }); } catch {}
        }
      } else { setPushStatus('failed'); }
    } catch { setPushStatus('failed'); } finally { setPushActivando(false); }
  };

  const testarNotificacoes = async () => {
    setTestando(true); setTestResult(null);
    try { setTestResult(await coachApi.testNotificacoes()); }
    catch (err) { setTestResult({ ok: false, erro: err.message }); }
    finally { setTestando(false); }
  };

  const showBrowserNotification = useCallback((alerta) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(alerta.titulo, { body: alerta.detalhe || '', icon: '/logos/VITALIS_LOGO_V3.png', tag: alerta.id, requireInteraction: alerta.prioridade === 'critica' });
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
        for (const a of newAlertas) { if (a.som || a.prioridade === 'critica') showBrowserNotification(a); }
        loadNotificacoes();
      }
    } catch {}
  }, [showBrowserNotification]);

  useEffect(() => {
    loadClients(); loadMultiEcoStats(); loadNotificacoes();
    const startPolling = () => { lastPollTime.current = new Date().toISOString(); pollRef.current = setInterval(pollAlertas, POLL_INTERVAL); };
    const timer = setTimeout(startPolling, 3000);
    return () => { clearTimeout(timer); if (pollRef.current) clearInterval(pollRef.current); };
  }, [pollAlertas]);

  // ─── Data loaders ───
  const loadMultiEcoStats = async () => {
    try {
      const ecoNames = ['serena', 'ignis', 'ventis', 'ecoa', 'imago', 'aurora', 'aurea'];
      const results = {};
      for (const eco of ecoNames) {
        const config = ECO_PLANS[eco]; if (!config) continue;
        const { data } = await supabase.from(config.table).select('subscription_status');
        if (data) {
          const s = { total: data.length, active: 0, trial: 0, pending: 0, tester: 0 };
          data.forEach(c => { if (c.subscription_status === 'active') s.active++; else if (c.subscription_status === 'trial') s.trial++; else if (c.subscription_status === 'pending') s.pending++; else if (c.subscription_status === 'tester') s.tester++; });
          results[eco] = s;
        }
      }
      setMultiEcoStats(results);
    } catch (err) { console.error('Erro multi-eco:', err); }
  };

  const loadEcoClients = async (eco) => {
    setLoadingEcoClients(true);
    try { const data = await coachApi.listarClientesEco(eco); setEcoClients(data.clients || []); setSelectedEco(eco); }
    catch { setEcoClients([]); }
    setLoadingEcoClients(false);
  };

  const handleEcoAction = async (eco, userId, actionType) => {
    setEcoAction({ userId, action: actionType, eco });
    try {
      if (actionType === 'tester') await coachApi.setTesterEco(eco, userId);
      else await coachApi.activarSubscricaoEco(eco, userId, actionType);
      await loadEcoClients(eco); await loadMultiEcoStats();
    } catch (err) { console.error('Erro:', err); }
    setEcoAction(null);
  };

  const loadClients = async () => {
    try {
      const data = await coachApi.listarClientes();
      const enriched = data.clients || [];
      setClients(enriched);
      setStats({
        total: enriched.length,
        active: enriched.filter(c => c.subscription_status === 'active').length,
        trial: enriched.filter(c => c.subscription_status === 'trial').length,
        pending: enriched.filter(c => c.subscription_status === 'pending').length,
        semPlano: enriched.filter(c => c.hasIntake && !c.hasPlan && c.planStatus !== 'erro').length,
        aguardaRevisao: enriched.filter(c => c.planStatus === 'pendente_revisao').length,
        erros: enriched.filter(c => c.planStatus === 'erro').length,
      });
    } catch (error) { console.error('Erro:', error); } finally { setLoading(false); }
  };

  const loadNotificacoes = async () => {
    setLoadingNotifs(true);
    try { setNotificacoes((await coachApi.buscarNotificacoes()).notificacoes || []); }
    catch {} finally { setLoadingNotifs(false); }
  };

  const filteredClients = useMemo(() => {
    let result = clients;
    if (search.trim()) { const s = search.toLowerCase(); result = result.filter(c => c.nome.toLowerCase().includes(s) || c.email.toLowerCase().includes(s)); }
    if (filterStatus !== 'all') result = result.filter(c => c.subscription_status === filterStatus);
    if (filterPlan === 'sem_intake') result = result.filter(c => !c.hasIntake);
    else if (filterPlan === 'sem_plano') result = result.filter(c => c.hasIntake && !c.hasPlan && c.planStatus !== 'erro');
    else if (filterPlan === 'aguarda_revisao') result = result.filter(c => c.planStatus === 'pendente_revisao');
    else if (filterPlan === 'plano_activo') result = result.filter(c => c.planStatus === 'activo');
    else if (filterPlan === 'erro') result = result.filter(c => c.planStatus === 'erro');
    return result;
  }, [clients, search, filterStatus, filterPlan]);

  // ─── Client actions ───
  const handleGerarPlano = async (client) => {
    if (!confirm(`Gerar plano nutricional para ${client.nome}?`)) return;
    setGerandoPlano(client.user_id);
    try {
      const result = await coachApi.gerarPlano(client.user_id);
      alert(`Plano gerado!\n${result.plano.calorias} kcal | P:${result.plano.macros.proteina}g C:${result.plano.macros.carboidratos}g G:${result.plano.macros.gordura}g`);
      loadClients();
    } catch (err) { alert('Erro: ' + err.message); } finally { setGerandoPlano(null); }
  };

  const handleDeleteClient = async (client) => {
    const nome = client.nome || client.email;
    if (!confirm(`APAGAR "${nome}"?\n\nRemove: vitalis_clients, planos, intake, habitos.\nIrreversivel!`)) return;
    if (!confirm(`Certeza ABSOLUTA? Ultima chance!`)) return;
    setDeletingClient(client.user_id);
    try { await coachApi.apagarCliente(client.user_id); alert(`"${nome}" apagado.`); loadClients(); }
    catch (err) { alert('Erro: ' + err.message); } finally { setDeletingClient(null); }
  };

  const handleActivate = async (client, planKey = 'MONTHLY') => {
    if (!confirm(`Activar ${SUBSCRIPTION_PLANS[planKey].name} para ${client.nome}?`)) return;
    try {
      const result = await coachApi.activarSubscricao(client.user_id, planKey);
      const validoAte = new Date(result.expiresAt).toLocaleDateString('pt-PT');
      alert(`Activada até ${validoAte}`);
      const plan = SUBSCRIPTION_PLANS[planKey];
      enviarBoasVindas(client.email, client.nome, client.sexo).catch(() => {});
      enviarConfirmacaoPagamento(client.email, { nome: client.nome, plano: plan.name, valor: `${plan.price_mzn?.toLocaleString('pt-MZ') || plan.price_usd} ${plan.price_mzn ? 'MZN' : 'USD'}`, data: new Date().toLocaleDateString('pt-PT'), validoAte, sexo: client.sexo }).catch(() => {});
      loadClients();
    } catch (err) { alert('Erro: ' + err.message); }
  };

  const handleSetTester = async (client) => {
    if (!confirm(`"${client.nome}" como tester (grátis)?`)) return;
    try { await coachApi.setTester(client.user_id); alert('Tester definido.'); loadClients(); }
    catch (err) { alert('Erro: ' + err.message); }
  };

  // ─── Helpers ───
  const tempoRelativo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };
  const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null;
  const notifsCount = notificacoes.filter(n => n.prioridade === 'critica' || n.prioridade === 'alta').length;

  // Computed data for Resumo
  const urgentItems = useMemo(() => {
    const items = [];
    const pendentes = clients.filter(c => c.subscription_status === 'pending' && c.payment_reference);
    if (pendentes.length > 0) items.push({ type: 'payments', count: pendentes.length, clients: pendentes, color: 'amber', icon: '💰', label: `${pendentes.length} pagamento${pendentes.length > 1 ? 's' : ''} pendente${pendentes.length > 1 ? 's' : ''}` });
    const inactive = clients.filter(c => { const d = daysSince(c.lastActivity); return d !== null && d >= 7 && ['active', 'trial'].includes(c.subscription_status); });
    if (inactive.length > 0) items.push({ type: 'inactive', count: inactive.length, clients: inactive, color: 'red', icon: '⚠️', label: `${inactive.length} cliente${inactive.length > 1 ? 's' : ''} inactivo${inactive.length > 1 ? 's' : ''} (7+ dias)` });
    if (stats.erros > 0) items.push({ type: 'errors', count: stats.erros, clients: clients.filter(c => c.planStatus === 'erro'), color: 'red', icon: '❌', label: `${stats.erros} erro${stats.erros > 1 ? 's' : ''} de plano` });
    if (stats.aguardaRevisao > 0) items.push({ type: 'review', count: stats.aguardaRevisao, clients: clients.filter(c => c.planStatus === 'pendente_revisao'), color: 'violet', icon: '👀', label: `${stats.aguardaRevisao} plano${stats.aguardaRevisao > 1 ? 's' : ''} aguarda revisão` });
    return items;
  }, [clients, stats]);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2" style={{ maxWidth: 380 }}>
          {toasts.map(t => <CoachToast key={t._key} alerta={t} onDismiss={() => setToasts(prev => prev.filter(x => x._key !== t._key))} onNavigate={(uid) => navigate(`/coach/cliente/${uid}`)} />)}
        </div>
      )}

      {/* ═══════ HEADER ═══════ */}
      <header className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 text-white relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/8 to-transparent rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

        <div className="max-w-6xl mx-auto px-4 pt-5 pb-2 relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/50 text-xs font-medium tracking-widest uppercase">Sete Ecos</p>
              <h1 className="text-xl font-bold tracking-tight mt-0.5">
                {saudacao}, Vivianne
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative p-2.5 rounded-2xl transition-all ${showNotifs ? 'bg-white/15' : 'hover:bg-white/8'}`}
              >
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-gray-900" />
                )}
              </button>
              <button
                onClick={() => { loadClients(); loadNotificacoes(); loadMultiEcoStats(); }}
                className="p-2.5 hover:bg-white/8 rounded-2xl transition-all"
              >
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3">
            {QUICK_LINKS.map(link => (
              <Link key={link.to} to={link.to} className="px-3 py-1.5 text-[11px] font-semibold bg-white/8 hover:bg-white/15 text-white/60 hover:text-white rounded-xl transition-all whitespace-nowrap flex-shrink-0 border border-white/5">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-violet-400 to-emerald-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ═══════ CONTENT ═══════ */}
      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">

        {/* Notification panel */}
        {showNotifs && (
          <section className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Actividade recente</h2>
              <button onClick={() => setShowNotifs(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
              {loadingNotifs ? (
                <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" /></div>
              ) : notificacoes.length === 0 ? (
                <p className="text-center py-10 text-gray-400 text-sm">Sem actividade</p>
              ) : notificacoes.map(n => (
                <Link key={n.id} to={`/coach/cliente/${n.user_id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                  <span className="text-base mt-0.5">{n.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{n.titulo}</p>
                    {n.detalhe && <p className="text-xs text-gray-500 mt-0.5">{n.detalhe}</p>}
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 mt-1 font-medium">{tempoRelativo(n.created_at)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  RESUMO                                */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'resumo' && (
          <>
            {/* Urgent action items */}
            {urgentItems.length > 0 && (
              <section className="space-y-2.5">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Atenção necessária</h2>
                {urgentItems.map(item => (
                  <div key={item.type} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {item.clients.slice(0, 3).map(c => c.nome).join(', ')}
                          {item.clients.length > 3 && ` +${item.clients.length - 3}`}
                        </p>
                      </div>
                      {item.type === 'payments' ? (
                        <button
                          onClick={() => { setActiveTab('vitalis'); setFilterStatus('pending'); }}
                          className="px-3 py-1.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors flex-shrink-0"
                        >
                          Ver
                        </button>
                      ) : item.type === 'errors' ? (
                        <button
                          onClick={() => { setActiveTab('vitalis'); setFilterPlan('erro'); }}
                          className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors flex-shrink-0"
                        >
                          Corrigir
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('vitalis')}
                          className="px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex-shrink-0"
                        >
                          Ver
                        </button>
                      )}
                    </div>
                    {/* Payment quick actions */}
                    {item.type === 'payments' && item.clients.map(c => (
                      <div key={c.user_id} className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50 bg-amber-50/30">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <ClientAvatar nome={c.nome} status="pending" size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{c.nome}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-mono">{c.payment_reference}</span>
                              {c.payment_amount && <span className="font-bold text-emerald-700">{Number(c.payment_amount).toLocaleString('pt-MZ')} MZN</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {['MONTHLY', 'SEMESTRAL', 'ANNUAL'].map(p => (
                            <button key={p} onClick={() => handleActivate(c, p)} className="px-2 py-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                              {p === 'MONTHLY' ? 'Mensal' : p === 'SEMESTRAL' ? '6m' : 'Anual'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            )}

            {/* Overview cards */}
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-3">Visão geral</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* Vitalis summary */}
                <button
                  onClick={() => setActiveTab('vitalis')}
                  className="bg-white rounded-3xl border border-gray-100 p-4 text-left hover:shadow-md transition-all group col-span-2 sm:col-span-1"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #7C8B6F, #5A6B4D)' }}>V</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Vitalis</p>
                      <p className="text-[11px] text-gray-500">Nutrição</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-xl px-2.5 py-2 text-center">
                      <p className="text-lg font-black text-gray-800">{stats.total}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Total</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl px-2.5 py-2 text-center">
                      <p className="text-lg font-black text-emerald-700">{stats.active}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Activos</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl px-2.5 py-2 text-center">
                      <p className="text-lg font-black text-blue-700">{stats.trial}</p>
                      <p className="text-[10px] text-blue-600 font-medium">Trial</p>
                    </div>
                  </div>
                </button>

                {/* Ecos summary */}
                <button
                  onClick={() => setActiveTab('ecos')}
                  className="bg-white rounded-3xl border border-gray-100 p-4 text-left hover:shadow-md transition-all group col-span-2 sm:col-span-1"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">7</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Outros Ecos</p>
                      <p className="text-[11px] text-gray-500">7 módulos</p>
                    </div>
                  </div>
                  {multiEcoStats && (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(multiEcoStats).map(([eco, s]) => {
                        const cfg = ECO_PLANS[eco];
                        if (!cfg) return null;
                        return (
                          <div key={eco} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                            <span className="text-[11px] font-medium text-gray-700">{cfg.name}</span>
                            <span className="text-[11px] font-bold text-gray-900">{s.total}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </button>
              </div>
            </section>

            {/* Recent activity */}
            {notificacoes.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-3">Actividade recente</h2>
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                  {notificacoes.slice(0, 5).map((n, i) => (
                    <Link key={n.id} to={`/coach/cliente/${n.user_id}`}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}
                    >
                      <span className="text-base">{n.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{n.titulo}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">{tempoRelativo(n.created_at)}</span>
                    </Link>
                  ))}
                  {notificacoes.length > 5 && (
                    <button onClick={() => setShowNotifs(true)} className="w-full px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-t border-gray-50 transition-colors">
                      Ver todas ({notificacoes.length})
                    </button>
                  )}
                </div>
              </section>
            )}

            {urgentItems.length === 0 && notificacoes.length === 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
                <p className="text-2xl mb-2">✨</p>
                <p className="text-sm font-medium text-gray-800">Tudo em dia!</p>
                <p className="text-xs text-gray-500 mt-1">Sem items urgentes. Bom trabalho.</p>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  VITALIS                               */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'vitalis' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { key: 'total', label: 'Total', value: stats.total, filter: () => { setFilterStatus('all'); setFilterPlan('all'); }, active: filterStatus === 'all' && filterPlan === 'all', gradient: 'from-gray-800 to-gray-900' },
                { key: 'active', label: 'Activos', value: stats.active, filter: () => { setFilterStatus('active'); setFilterPlan('all'); }, active: filterStatus === 'active', gradient: 'from-emerald-500 to-teal-600' },
                { key: 'trial', label: 'Trial', value: stats.trial, filter: () => { setFilterStatus('trial'); setFilterPlan('all'); }, active: filterStatus === 'trial', gradient: 'from-blue-500 to-indigo-600' },
                { key: 'pending', label: 'Pendentes', value: stats.pending, filter: () => { setFilterStatus('pending'); setFilterPlan('all'); }, active: filterStatus === 'pending', gradient: 'from-amber-400 to-orange-500' },
                { key: 'semPlano', label: 'Sem plano', value: stats.semPlano, filter: () => { setFilterStatus('all'); setFilterPlan('sem_plano'); }, active: filterPlan === 'sem_plano', gradient: 'from-orange-400 to-red-500' },
                { key: 'revisao', label: 'Revisão', value: stats.aguardaRevisao, filter: () => { setFilterStatus('all'); setFilterPlan('aguarda_revisao'); }, active: filterPlan === 'aguarda_revisao', gradient: 'from-violet-500 to-purple-600' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={s.filter}
                  className={`p-3 rounded-2xl text-center transition-all ${
                    s.active
                      ? `bg-gradient-to-br ${s.gradient} text-white shadow-lg scale-[1.03]`
                      : 'bg-white text-gray-700 hover:shadow-md border border-gray-100'
                  }`}
                >
                  <p className="text-xl font-black">{s.value}</p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${s.active ? 'text-white/70' : 'text-gray-500'}`}>{s.label}</p>
                </button>
              ))}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Procurar..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none">
                <option value="all">Todos</option><option value="active">Activos</option><option value="trial">Trial</option><option value="pending">Pendentes</option><option value="tester">Testers</option><option value="expired">Expirados</option>
              </select>
              <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none">
                <option value="all">Todos</option><option value="sem_intake">Sem intake</option><option value="sem_plano">Sem plano</option><option value="aguarda_revisao">Aguarda revisão</option><option value="plano_activo">Plano activo</option><option value="erro">Erro</option>
              </select>
            </div>

            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider px-1">
              {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
              {(filterStatus !== 'all' || filterPlan !== 'all' || search.trim()) && ` de ${clients.length}`}
            </p>

            {/* Client List */}
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
                  <p className="text-gray-400 text-sm">{clients.length === 0 ? 'Nenhum cliente.' : 'Nenhum resultado.'}</p>
                </div>
              ) : filteredClients.map(client => {
                const inactDays = daysSince(client.lastActivity);
                const isInactive = inactDays !== null && inactDays >= 5;
                return (
                  <div key={client.user_id} className={`bg-white rounded-2xl border transition-all hover:shadow-md ${isInactive ? 'border-red-200/50' : 'border-gray-100'}`}>
                    <div className="p-4 flex items-start gap-3">
                      <ClientAvatar nome={client.nome} status={client.subscription_status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link to={`/coach/cliente/${client.user_id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm">{client.nome}</Link>
                          <StatusBadge status={client.subscription_status} />
                          <PlanBadge hasIntake={client.hasIntake} hasPlan={client.hasPlan} planStatus={client.planStatus} planErro={client.planErro} />
                          {isInactive && <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-100 text-red-600">{inactDays}d</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{client.email}</p>
                        {client.subscription_status === 'pending' && client.payment_reference && (
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="font-mono text-[11px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-lg border border-amber-100">{client.payment_reference}</span>
                            {client.payment_amount && <span className="font-bold text-emerald-700">{Number(client.payment_amount).toLocaleString('pt-MZ')} MZN</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                          {client.planCalorias && <span>{client.planCalorias} kcal</span>}
                          {client.subscription_expires && <span>Exp: {new Date(client.subscription_expires).toLocaleDateString('pt-PT')}</span>}
                          <span>Reg: {new Date(client.created_at).toLocaleDateString('pt-PT')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link to={`/coach/cliente/${client.user_id}`} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">Ver</Link>
                        {client.hasIntake && (!client.hasPlan || client.planStatus === 'erro') && (
                          <button onClick={() => handleGerarPlano(client)} disabled={gerandoPlano === client.user_id}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 ${client.planStatus === 'erro' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                          >{gerandoPlano === client.user_id ? '...' : (client.planStatus === 'erro' ? 'Retry' : 'Gerar')}</button>
                        )}
                        <ClientActions client={client} onActivate={handleActivate} onSetTester={handleSetTester} onDelete={handleDeleteClient} onGeneratePlan={handleGerarPlano} isGenerating={gerandoPlano === client.user_id} isDeleting={deletingClient === client.user_id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  ECOS                                  */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'ecos' && (
          multiEcoStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(multiEcoStats).map(([eco, ecoStats]) => {
                  const config = ECO_PLANS[eco]; if (!config) return null;
                  const isSelected = selectedEco === eco;
                  return (
                    <button key={eco} onClick={() => isSelected ? setSelectedEco(null) : loadEcoClients(eco)}
                      className={`p-4 rounded-3xl border-2 text-left transition-all ${isSelected ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
                      style={{
                        borderColor: isSelected ? config.color : `${config.color}20`,
                        background: `linear-gradient(145deg, ${config.color}${isSelected ? '18' : '08'}, ${config.color}03)`,
                      }}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}bb)` }}
                        >{config.name[0]}</div>
                        <span className="font-bold text-gray-900">{config.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div className="bg-white/70 rounded-xl px-2 py-1.5"><span className="text-gray-500">Total </span><span className="font-black text-gray-800">{ecoStats.total}</span></div>
                        <div className="bg-white/70 rounded-xl px-2 py-1.5"><span className="text-emerald-600">Act. </span><span className="font-black text-emerald-700">{ecoStats.active}</span></div>
                        {ecoStats.trial > 0 && <div className="bg-white/70 rounded-xl px-2 py-1.5"><span className="text-blue-600">Trial </span><span className="font-black text-blue-700">{ecoStats.trial}</span></div>}
                        {ecoStats.tester > 0 && <div className="bg-white/70 rounded-xl px-2 py-1.5"><span className="text-purple-600">Test </span><span className="font-black text-purple-700">{ecoStats.tester}</span></div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedEco && (
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100"
                    style={{ background: `linear-gradient(135deg, ${ECO_PLANS[selectedEco]?.color}08, transparent)` }}>
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: ECO_PLANS[selectedEco]?.color }}>{ECO_PLANS[selectedEco]?.name?.[0]}</span>
                      {ECO_PLANS[selectedEco]?.name}
                    </h3>
                    <button onClick={() => setSelectedEco(null)} className="text-xs font-semibold text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Fechar</button>
                  </div>
                  <div className="p-4">
                    {loadingEcoClients ? (
                      <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" /></div>
                    ) : ecoClients.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-8">Sem clientes</p>
                    ) : (
                      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                        {ecoClients.map(client => (
                          <div key={client.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100/70 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <ClientAvatar nome={client.nome} status={client.subscription_status} size="sm" />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">{client.nome}</p>
                                <p className="text-[11px] text-gray-500 truncate">{client.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <StatusBadge status={client.subscription_status} />
                              <div className="flex gap-1">
                                {client.subscription_status !== 'tester' && (
                                  <button onClick={(e) => { e.stopPropagation(); handleEcoAction(selectedEco, client.user_id, 'tester'); }}
                                    disabled={ecoAction?.userId === client.user_id}
                                    className="px-2 py-1.5 text-[10px] font-bold rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 transition-colors">Tester</button>
                                )}
                                {client.subscription_status !== 'active' && (
                                  <button onClick={(e) => { e.stopPropagation(); handleEcoAction(selectedEco, client.user_id, 'MONTHLY'); }}
                                    disabled={ecoAction?.userId === client.user_id}
                                    className="px-2 py-1.5 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors">Activar</button>
                                )}
                              </div>
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
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" /></div>
          )
        )}

        {/* ══════════════════════════════════════ */}
        {/*  COMUNICAÇÕES                          */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'comms' && (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">Centro de Comunicações</h2>
              <p className="text-xs text-gray-500 mt-0.5">Emails, WhatsApp e push — tudo num só lugar</p>
            </div>
            <div className="p-4">
              <Suspense fallback={<div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" /></div>}>
                <CentroComunicacoes />
              </Suspense>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/*  CONFIG                                */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'config' && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm">Push Notifications</h3>
                <div className={`w-3 h-3 rounded-full ${pushStatus === 'subscribed' ? 'bg-emerald-400 shadow-sm shadow-emerald-200' : 'bg-gray-300'}`} />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {pushStatus === 'subscribed' && 'Activas — recebes alertas de clientes em tempo real.'}
                {pushStatus === 'denied' && 'Bloqueadas pelo browser. Vai às definições para permitir.'}
                {pushStatus === 'unsupported' && 'Browser não suporta push notifications.'}
                {pushStatus === 'failed' && 'Não activadas. Clica abaixo para activar.'}
                {!pushStatus && 'A verificar estado...'}
              </p>
              {pushStatus && pushStatus !== 'subscribed' && pushStatus !== 'denied' && (
                <button onClick={() => registerPushSubscription(true)} disabled={pushActivando}
                  className="mt-4 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl text-sm font-bold hover:from-gray-700 hover:to-gray-800 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-gray-200">
                  {pushActivando ? 'A activar...' : 'Activar push'}
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-1">Testar canais</h3>
              <p className="text-xs text-gray-500 mb-4">Envia uma notificação de teste para todos os canais configurados.</p>
              <button onClick={testarNotificacoes} disabled={testando}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl text-sm font-bold hover:from-indigo-600 hover:to-violet-700 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-100">
                {testando ? 'A testar...' : 'Testar agora'}
              </button>
              {testResult && (
                <div className={`mt-4 p-4 rounded-2xl text-xs space-y-1.5 ${testResult.ok ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                  <p className="font-bold text-sm">{testResult.ok ? '✅ Funciona!' : '❌ Falhou'}</p>
                  {testResult.resultados?.telegram && <p>{testResult.resultados.telegram.enviado ? '✅' : '❌'} Telegram: {testResult.resultados.telegram.enviado ? 'OK' : (testResult.resultados.telegram.erro || 'N/A')}</p>}
                  {testResult.resultados?.push && <p>{testResult.resultados.push.enviado ? '✅' : '❌'} Push: {testResult.resultados.push.enviado ? 'OK' : (testResult.resultados.push.erro || 'N/A')} ({testResult.resultados.push.subscricoes} devices)</p>}
                  {testResult.resultados?.whatsapp && <p>📱 WhatsApp: {testResult.resultados.whatsapp.configurado ? 'Configurado' : 'N/A'}</p>}
                  {testResult.resultados?.email && <p>📧 Email: {testResult.resultados.email.configurado ? 'Configurado' : 'N/A'}</p>}
                  {testResult.dica && <p className="mt-2 text-amber-700 font-semibold">{testResult.dica}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Status Badges ───
function StatusBadge({ status }) {
  const labels = {
    tester: { label: 'Tester', cls: 'bg-purple-100 text-purple-700' },
    trial: { label: 'Trial', cls: 'bg-blue-100 text-blue-700' },
    active: { label: 'Activo', cls: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Pendente', cls: 'bg-amber-100 text-amber-700' },
    expired: { label: 'Expirado', cls: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Cancelado', cls: 'bg-gray-100 text-gray-600' },
  };
  const c = labels[status] || { label: status || 'N/A', cls: 'bg-gray-100 text-gray-500' };
  return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide ${c.cls}`}>{c.label}</span>;
}

function PlanBadge({ hasIntake, hasPlan, planStatus, planErro }) {
  if (!hasIntake) return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500">Sem intake</span>;
  if (planStatus === 'erro') return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-100 text-red-700" title={planErro}>Erro plano</span>;
  if (!hasPlan) return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-orange-100 text-orange-700">Sem plano</span>;
  if (planStatus === 'pendente_revisao') return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700">Revisão</span>;
  return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700">Plano activo</span>;
}

// ─── Client dropdown ───
function ClientActions({ client, onActivate, onSetTester, onDelete, onGeneratePlan, isGenerating, isDeleting }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 text-sm overflow-hidden">
            <Link to={`/coach/cliente/${client.user_id}`} className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>Ver detalhes</Link>
            {client.hasIntake && <button onClick={() => { onGeneratePlan(client); setOpen(false); }} disabled={isGenerating} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50">{client.hasPlan ? 'Regenerar plano' : 'Gerar plano'}</button>}
            <div className="border-t border-gray-50 my-1" />
            <button onClick={() => { onActivate(client, 'MONTHLY'); setOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">Activar mensal</button>
            <button onClick={() => { onActivate(client, 'SEMESTRAL'); setOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">Activar semestral</button>
            <button onClick={() => { onActivate(client, 'ANNUAL'); setOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50">Activar anual</button>
            <div className="border-t border-gray-50 my-1" />
            <button onClick={() => { onSetTester(client); setOpen(false); }} className="block w-full text-left px-4 py-2 text-purple-700 hover:bg-purple-50">Definir tester</button>
            {client.email && <a href={`https://wa.me/?text=${encodeURIComponent(`Ola ${client.nome}!`)}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-green-700 hover:bg-green-50" onClick={() => setOpen(false)}>WhatsApp</a>}
            <div className="border-t border-gray-50 my-1" />
            <button onClick={() => { onDelete(client); setOpen(false); }} disabled={isDeleting} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50">{isDeleting ? 'A apagar...' : 'Apagar'}</button>
          </div>
        </>
      )}
    </div>
  );
}
