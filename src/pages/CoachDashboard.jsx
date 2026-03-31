import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coachApi } from '../lib/coachApi';
import { SUBSCRIPTION_PLANS } from '../lib/subscriptions';
import { enviarBoasVindas, enviarConfirmacaoPagamento } from '../lib/emails';
import { supabase } from '../lib/supabase';
import { ECO_PLANS } from '../lib/shared/subscriptionPlans';

const CentroComunicacoes = lazy(() => import('../components/CentroComunicacoes'));
const CoachPromoManager = lazy(() => import('../components/CoachPromoManager'));

const POLL_INTERVAL = 30_000;

// ─── Animated number counter ───
function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (typeof value !== 'number') return;
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => ref.current && cancelAnimationFrame(ref.current);
  }, [value]);
  return <span>{display}</span>;
}

// ─── SVG Progress Ring ───
function ProgressRing({ value, max, size = 48, strokeWidth = 3.5, color = '#a78bfa' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - progress);
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
}

// ─── Skeleton loader ───
function Skeleton({ className = '' }) {
  return <div className={`coach-skeleton rounded-2xl ${className}`} />;
}

// ─── Toast ───
function CoachToast({ alerta, onDismiss, onNavigate }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => { setExiting(true); setTimeout(onDismiss, 300); }, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  return (
    <div className={`coach-glass text-white rounded-2xl px-4 py-3 shadow-2xl flex items-start gap-3 cursor-pointer transition-all duration-300
      ${exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      style={{ maxWidth: 380, animation: exiting ? undefined : 'slideInRight 0.3s ease-out' }}
      onClick={() => { onNavigate(alerta.user_id); onDismiss(); }}>
      <span className="text-xl flex-shrink-0">{alerta.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{alerta.titulo}</p>
        {alerta.detalhe && <p className="text-xs text-white/40 mt-0.5 truncate">{alerta.detalhe}</p>}
      </div>
      <button onClick={(e) => { e.stopPropagation(); setExiting(true); setTimeout(onDismiss, 300); }} className="text-white/30 hover:text-white/60 flex-shrink-0 p-0.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

// ─── Avatar ───
function ClientAvatar({ nome, status, size = 'md' }) {
  const initials = (nome || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = {
    active: ['#34d399', '#059669'], trial: ['#60a5fa', '#4f46e5'], tester: ['#a78bfa', '#7c3aed'],
    pending: ['#fbbf24', '#d97706'], expired: ['#f87171', '#dc2626'], cancelled: ['#6b7280', '#4b5563'],
  };
  const [c1, c2] = colors[status] || colors.cancelled;
  const sizes = { sm: 32, md: 40, lg: 48 };
  const s = sizes[size];
  const fs = size === 'sm' ? 11 : size === 'md' ? 13 : 15;
  return (
    <div className="flex-shrink-0 relative group">
      <div className="rounded-2xl flex items-center justify-center text-white font-bold"
        style={{ width: s, height: s, fontSize: fs, background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
        {initials}
      </div>
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-md"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }} />
    </div>
  );
}

// ─── Tabs ───
const TABS = [
  { key: 'resumo', label: 'Resumo', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { key: 'vitalis', label: 'Vitalis', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { key: 'ecos', label: 'Ecos', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
  { key: 'comms', label: 'Comms', icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z' },
  { key: 'config', label: 'Config', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z' },
];

const QUICK_LINKS = [
  { to: '/coach/marketing', label: 'Marketing', gradient: 'from-pink-500/20 to-rose-500/20' },
  { to: '/coach/analytics', label: 'Analytics', gradient: 'from-cyan-500/20 to-blue-500/20' },
  { to: '/coach/chatbot-teste', label: 'Chatbot', gradient: 'from-green-500/20 to-emerald-500/20' },
  { to: '/coach/broadcast', label: 'Broadcast', gradient: 'from-amber-500/20 to-orange-500/20' },
  { to: '/coach/social', label: 'Social', gradient: 'from-violet-500/20 to-purple-500/20' },
  { to: '/coach/audio-meditacoes', label: 'Áudios', gradient: 'from-fuchsia-500/20 to-purple-500/20' },
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

  // ─── Push ───
  useEffect(() => { registerPushSubscription(); }, []);
  const registerPushSubscription = async (userInitiated = false) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setPushStatus('unsupported'); return; }
    if (userInitiated) setPushActivando(true);
    if (Notification.permission === 'default') {
      if (!userInitiated) { setPushStatus('failed'); return; }
      try { const r = await Notification.requestPermission(); if (r !== 'granted') { setPushStatus('denied'); setPushActivando(false); return; } }
      catch { setPushStatus('failed'); setPushActivando(false); return; }
    } else if (Notification.permission === 'denied') { setPushStatus('denied'); setPushActivando(false); return; }
    try {
      const { registarPushSubscription: registar } = await import('../lib/pushSubscription');
      const result = await registar();
      if (result.ok) { setPushStatus('subscribed'); if (userInitiated) { try { const reg = await navigator.serviceWorker.ready; reg.showNotification('Push activado!', { body: 'Alertas em tempo real.', icon: '/logos/VITALIS_LOGO_V3.png', tag: 'coach-push-activado' }); } catch {} } }
      else { setPushStatus('failed'); }
    } catch { setPushStatus('failed'); } finally { setPushActivando(false); }
  };
  const testarNotificacoes = async () => {
    setTestando(true); setTestResult(null);
    try { setTestResult(await coachApi.testNotificacoes()); } catch (err) { setTestResult({ ok: false, erro: err.message }); } finally { setTestando(false); }
  };

  const showBrowserNotification = useCallback((alerta) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification(alerta.titulo, { body: alerta.detalhe || '', icon: '/logos/VITALIS_LOGO_V3.png', tag: alerta.id, requireInteraction: alerta.prioridade === 'critica' });
      n.onclick = () => { window.focus(); navigate(`/coach/cliente/${alerta.user_id}`); n.close(); };
    }
  }, [navigate]);

  const pollAlertas = useCallback(async () => {
    try {
      const desde = lastPollTime.current || new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const data = await coachApi.buscarAlertasRT(desde);
      lastPollTime.current = new Date().toISOString();
      const news = (data.alertas || []).filter(a => !seenAlertIds.current.has(a.id));
      if (news.length > 0) {
        for (const a of news) seenAlertIds.current.add(a.id);
        setToasts(prev => [...news.map(a => ({ ...a, _key: a.id + '_' + Date.now() })), ...prev].slice(0, 5));
        for (const a of news) { if (a.som || a.prioridade === 'critica') showBrowserNotification(a); }
        loadNotificacoes();
      }
    } catch {}
  }, [showBrowserNotification]);

  useEffect(() => {
    loadClients(); loadMultiEcoStats(); loadNotificacoes();
    const timer = setTimeout(() => { lastPollTime.current = new Date().toISOString(); pollRef.current = setInterval(pollAlertas, POLL_INTERVAL); }, 3000);
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
    catch { setEcoClients([]); } setLoadingEcoClients(false);
  };
  const handleEcoAction = async (eco, userId, actionType) => {
    setEcoAction({ userId, action: actionType, eco });
    try {
      if (actionType === 'tester') await coachApi.setTesterEco(eco, userId);
      else await coachApi.activarSubscricaoEco(eco, userId, actionType);
      await loadEcoClients(eco); await loadMultiEcoStats();
    } catch (err) { console.error('Erro:', err); } setEcoAction(null);
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
    try { setNotificacoes((await coachApi.buscarNotificacoes()).notificacoes || []); } catch {} finally { setLoadingNotifs(false); }
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
    if (!confirm(`APAGAR "${client.nome}"?\nIrreversivel!`)) return;
    if (!confirm(`Certeza ABSOLUTA?`)) return;
    setDeletingClient(client.user_id);
    try { await coachApi.apagarCliente(client.user_id); alert(`"${client.nome}" apagado.`); loadClients(); }
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
    if (!confirm(`"${client.nome}" como tester?`)) return;
    try { await coachApi.setTester(client.user_id); alert('Tester definido.'); loadClients(); } catch (err) { alert('Erro: ' + err.message); }
  };

  // ─── Helpers ───
  const tempoRelativo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };
  const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null;
  const notifsCount = notificacoes.filter(n => n.prioridade === 'critica' || n.prioridade === 'alta').length;

  const urgentItems = useMemo(() => {
    const items = [];
    const pendentes = clients.filter(c => c.subscription_status === 'pending' && c.payment_reference);
    if (pendentes.length > 0) items.push({ type: 'payments', count: pendentes.length, clients: pendentes, color: '#fbbf24', label: `${pendentes.length} pagamento${pendentes.length > 1 ? 's' : ''} pendente${pendentes.length > 1 ? 's' : ''}` });
    const inactive = clients.filter(c => { const d = daysSince(c.lastActivity); return d !== null && d >= 7 && ['active', 'trial'].includes(c.subscription_status); });
    if (inactive.length > 0) items.push({ type: 'inactive', count: inactive.length, clients: inactive, color: '#f87171', label: `${inactive.length} inactivo${inactive.length > 1 ? 's' : ''} (7+ dias)` });
    if (stats.erros > 0) items.push({ type: 'errors', count: stats.erros, clients: clients.filter(c => c.planStatus === 'erro'), color: '#ef4444', label: `${stats.erros} erro${stats.erros > 1 ? 's' : ''} de plano` });
    if (stats.aguardaRevisao > 0) items.push({ type: 'review', count: stats.aguardaRevisao, clients: clients.filter(c => c.planStatus === 'pendente_revisao'), color: '#a78bfa', label: `${stats.aguardaRevisao} aguarda${stats.aguardaRevisao > 1 ? 'm' : ''} revisão` });
    return items;
  }, [clients, stats]);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="coach-dark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 animate-spin" style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)' }} />
            <div className="absolute inset-[3px] rounded-full bg-[#0a0a12]" />
          </div>
          <p className="text-white/30 text-sm tracking-wider">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-dark min-h-screen pb-24">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2" style={{ maxWidth: 380 }}>
          {toasts.map(t => <CoachToast key={t._key} alerta={t} onDismiss={() => setToasts(p => p.filter(x => x._key !== t._key))} onNavigate={(uid) => navigate(`/coach/cliente/${uid}`)} />)}
        </div>
      )}

      {/* ═══════ HEADER ═══════ */}
      <header className="relative overflow-hidden border-b border-white/[0.04]">
        {/* Background gradient mesh */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,80,200,0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(52,211,153,0.06), transparent)' }} />

        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 relative">
          {/* Top row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase mb-1">Sete Ecos Coach</p>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="coach-gradient-text">{saudacao}</span>
                <span className="text-white/80">, Vivianne</span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Notification bell */}
              <button onClick={() => setShowNotifs(!showNotifs)}
                className={`relative p-2.5 rounded-2xl transition-all ${showNotifs ? 'bg-white/10' : 'hover:bg-white/[0.05]'}`}>
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notifsCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0a0a12] animate-pulse" />}
              </button>
              {/* Refresh */}
              <button onClick={() => { loadClients(); loadNotificacoes(); loadMultiEcoStats(); }}
                className="p-2.5 hover:bg-white/[0.05] rounded-2xl transition-all group">
                <svg className="w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
            {QUICK_LINKS.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-3.5 py-2 text-[11px] font-semibold bg-gradient-to-r ${link.gradient} text-white/60 hover:text-white/90 rounded-xl transition-all whitespace-nowrap flex-shrink-0 border border-white/[0.06] hover:border-white/[0.12] backdrop-blur-sm`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all rounded-t-xl ${
                  activeTab === tab.key ? 'text-white bg-white/[0.06]' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
                }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} /></svg>
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.key && <span className="absolute bottom-0 left-3 right-3 h-[2px] coach-gradient-bar rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ═══════ CONTENT ═══════ */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Notification panel */}
        {showNotifs && (
          <section className="coach-glass rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
              <h2 className="text-sm font-bold text-white/90">Actividade recente</h2>
              <button onClick={() => setShowNotifs(false)} className="p-1 text-white/30 hover:text-white/60 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="max-h-[320px] overflow-y-auto divide-y divide-white/[0.03]">
              {loadingNotifs ? (
                <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" /></div>
              ) : notificacoes.length === 0 ? (
                <p className="text-center py-10 text-white/20 text-sm">Sem actividade</p>
              ) : notificacoes.map(n => (
                <Link key={n.id} to={`/coach/cliente/${n.user_id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors">
                  <span className="text-base mt-0.5">{n.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80">{n.titulo}</p>
                    {n.detalhe && <p className="text-xs text-white/30 mt-0.5">{n.detalhe}</p>}
                  </div>
                  <span className="text-[10px] text-white/20 flex-shrink-0 mt-1 font-medium tabular-nums">{tempoRelativo(n.created_at)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ══════ RESUMO ══════ */}
        {activeTab === 'resumo' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Urgent items */}
            {urgentItems.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[10px] font-bold tracking-[0.25em] text-white/20 uppercase">Requer atenção</h2>
                {urgentItems.map(item => (
                  <div key={item.type} className="coach-glass rounded-2xl overflow-hidden" style={{ borderLeft: `3px solid ${item.color}` }}>
                    <div className="flex items-center gap-3.5 px-4 py-3.5">
                      <div className="relative">
                        <ProgressRing value={item.count} max={Math.max(item.count, 5)} size={44} color={item.color} />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white/90">{item.count}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/90">{item.label}</p>
                        <p className="text-xs text-white/30 mt-0.5 truncate">
                          {item.clients.slice(0, 3).map(c => c.nome).join(', ')}{item.clients.length > 3 && ` +${item.clients.length - 3}`}
                        </p>
                      </div>
                      <button onClick={() => { setActiveTab('vitalis'); if (item.type === 'payments') setFilterStatus('pending'); else if (item.type === 'errors') setFilterPlan('erro'); }}
                        className="px-3.5 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 hover:brightness-110"
                        style={{ background: `${item.color}20`, color: item.color }}>
                        {item.type === 'errors' ? 'Corrigir' : 'Ver'}
                      </button>
                    </div>
                    {/* Payment quick-actions */}
                    {item.type === 'payments' && item.clients.map(c => (
                      <div key={c.user_id} className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]" style={{ background: `${item.color}06` }}>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <ClientAvatar nome={c.nome} status="pending" size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white/80 truncate">{c.nome}</p>
                            <div className="flex items-center gap-2 text-xs text-white/30">
                              <span className="font-mono text-[11px]">{c.payment_reference}</span>
                              {c.payment_amount && <span className="font-bold text-emerald-400">{Number(c.payment_amount).toLocaleString('pt-MZ')} MZN</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {['MONTHLY', 'SEMESTRAL', 'ANNUAL'].map(p => (
                            <button key={p} onClick={() => handleActivate(c, p)}
                              className="px-2.5 py-1.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 active:scale-95 transition-all">
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

            {/* Overview — Bento Grid */}
            <section>
              <h2 className="text-[10px] font-bold tracking-[0.25em] text-white/20 uppercase mb-4">Visão geral</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Main stat cards */}
                {[
                  { label: 'Total', value: stats.total, color: '#a78bfa', ring: true },
                  { label: 'Activos', value: stats.active, color: '#34d399', ring: true },
                  { label: 'Trial', value: stats.trial, color: '#60a5fa', ring: true },
                  { label: 'Pendentes', value: stats.pending, color: '#fbbf24', ring: true },
                ].map(s => (
                  <button key={s.label} onClick={() => { setActiveTab('vitalis'); if (s.label === 'Activos') setFilterStatus('active'); else if (s.label === 'Trial') setFilterStatus('trial'); else if (s.label === 'Pendentes') setFilterStatus('pending'); else { setFilterStatus('all'); setFilterPlan('all'); } }}
                    className="coach-glass rounded-2xl p-4 text-left group hover:border-white/[0.12] transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <ProgressRing value={s.value} max={Math.max(stats.total, 1)} size={40} color={s.color} />
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">{s.label}</span>
                    </div>
                    <p className="text-3xl font-black text-white/90 tabular-nums">
                      <AnimatedNumber value={s.value} />
                    </p>
                    {/* Glow on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ boxShadow: `inset 0 0 30px ${s.color}08, 0 0 20px ${s.color}06` }} />
                  </button>
                ))}
              </div>
            </section>

            {/* Vitalis + Ecos cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setActiveTab('vitalis')}
                className="coach-glass rounded-2xl p-5 text-left group hover:border-white/[0.12] transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                    style={{ background: 'linear-gradient(135deg, #7C8B6F, #5A6B4D)', boxShadow: '0 4px 15px rgba(124,139,111,0.3)' }}>V</div>
                  <div>
                    <p className="text-sm font-bold text-white/90">Vitalis</p>
                    <p className="text-[11px] text-white/30">Nutrição &amp; Corpo</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs">
                  <div><span className="text-white/30">Sem plano </span><span className="font-bold text-amber-400">{stats.semPlano}</span></div>
                  <div><span className="text-white/30">Revisão </span><span className="font-bold text-violet-400">{stats.aguardaRevisao}</span></div>
                  <div><span className="text-white/30">Erros </span><span className="font-bold text-red-400">{stats.erros}</span></div>
                </div>
              </button>

              <button onClick={() => setActiveTab('ecos')}
                className="coach-glass rounded-2xl p-5 text-left group hover:border-white/[0.12] transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                    style={{ background: 'linear-gradient(135deg, #a78bfa, #6366f1)', boxShadow: '0 4px 15px rgba(167,139,250,0.3)' }}>7</div>
                  <div>
                    <p className="text-sm font-bold text-white/90">Outros Ecos</p>
                    <p className="text-[11px] text-white/30">7 módulos activos</p>
                  </div>
                </div>
                {multiEcoStats && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(multiEcoStats).map(([eco, s]) => {
                      const cfg = ECO_PLANS[eco]; if (!cfg) return null;
                      return (
                        <div key={eco} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: `${cfg.color}15` }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}60` }} />
                          <span className="text-[10px] font-bold text-white/60">{cfg.name}</span>
                          <span className="text-[10px] font-black text-white/80">{s.total}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </button>
            </div>

            {/* Recent activity */}
            {notificacoes.length > 0 && (
              <section>
                <h2 className="text-[10px] font-bold tracking-[0.25em] text-white/20 uppercase mb-3">Actividade recente</h2>
                <div className="coach-glass rounded-2xl overflow-hidden">
                  {notificacoes.slice(0, 5).map((n, i) => (
                    <Link key={n.id} to={`/coach/cliente/${n.user_id}`}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                      <span className="text-base">{n.emoji}</span>
                      <p className="text-sm font-medium text-white/70 truncate flex-1">{n.titulo}</p>
                      <span className="text-[10px] text-white/20 font-medium flex-shrink-0 tabular-nums">{tempoRelativo(n.created_at)}</span>
                    </Link>
                  ))}
                  {notificacoes.length > 5 && (
                    <button onClick={() => setShowNotifs(true)} className="w-full px-4 py-2.5 text-xs font-semibold text-white/30 hover:text-white/50 hover:bg-white/[0.02] border-t border-white/[0.04] transition-colors">
                      Ver todas ({notificacoes.length})
                    </button>
                  )}
                </div>
              </section>
            )}

            {urgentItems.length === 0 && notificacoes.length === 0 && (
              <div className="coach-glass rounded-3xl p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.15), transparent)' }}>
                  <span className="text-3xl">✨</span>
                </div>
                <p className="text-sm font-semibold text-white/80">Tudo em dia!</p>
                <p className="text-xs text-white/25 mt-1">Sem items urgentes.</p>
              </div>
            )}
          </div>
        )}

        {/* ══════ VITALIS ══════ */}
        {activeTab === 'vitalis' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Stats grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { key: 'total', label: 'Total', value: stats.total, color: '#a78bfa', filter: () => { setFilterStatus('all'); setFilterPlan('all'); }, active: filterStatus === 'all' && filterPlan === 'all' },
                { key: 'active', label: 'Activos', value: stats.active, color: '#34d399', filter: () => { setFilterStatus('active'); setFilterPlan('all'); }, active: filterStatus === 'active' },
                { key: 'trial', label: 'Trial', value: stats.trial, color: '#60a5fa', filter: () => { setFilterStatus('trial'); setFilterPlan('all'); }, active: filterStatus === 'trial' },
                { key: 'pending', label: 'Pendentes', value: stats.pending, color: '#fbbf24', filter: () => { setFilterStatus('pending'); setFilterPlan('all'); }, active: filterStatus === 'pending' },
                { key: 'semPlano', label: 'Sem plano', value: stats.semPlano, color: '#fb923c', filter: () => { setFilterStatus('all'); setFilterPlan('sem_plano'); }, active: filterPlan === 'sem_plano' },
                { key: 'revisao', label: 'Revisão', value: stats.aguardaRevisao, color: '#c084fc', filter: () => { setFilterStatus('all'); setFilterPlan('aguarda_revisao'); }, active: filterPlan === 'aguarda_revisao' },
              ].map(s => (
                <button key={s.key} onClick={s.filter}
                  className={`relative p-3 rounded-2xl text-center transition-all active:scale-95 ${
                    s.active ? 'ring-1' : 'hover:bg-white/[0.04]'
                  }`}
                  style={{
                    background: s.active ? `${s.color}15` : 'rgba(255,255,255,0.03)',
                    borderColor: s.active ? `${s.color}40` : 'rgba(255,255,255,0.06)',
                    boxShadow: s.active ? `0 0 20px ${s.color}10, inset 0 0 20px ${s.color}05` : undefined,
                    ringColor: s.active ? `${s.color}40` : undefined,
                  }}>
                  <p className="text-xl font-black tabular-nums" style={{ color: s.active ? s.color : 'rgba(255,255,255,0.8)' }}>
                    <AnimatedNumber value={s.value} />
                  </p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: s.active ? `${s.color}cc` : 'rgba(255,255,255,0.25)' }}>{s.label}</p>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Procurar cliente..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-white/90 placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="coach-select px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-white/70 focus:outline-none">
                <option value="all">Todos</option><option value="active">Activos</option><option value="trial">Trial</option><option value="pending">Pendentes</option><option value="tester">Testers</option><option value="expired">Expirados</option>
              </select>
              <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                className="coach-select px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-white/70 focus:outline-none">
                <option value="all">Plano: Todos</option><option value="sem_intake">Sem intake</option><option value="sem_plano">Sem plano</option><option value="aguarda_revisao">Revisão</option><option value="plano_activo">Plano activo</option><option value="erro">Erro</option>
              </select>
            </div>

            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] px-1">
              {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}
              {(filterStatus !== 'all' || filterPlan !== 'all' || search.trim()) && ` de ${clients.length}`}
            </p>

            {/* Client list */}
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <div className="coach-glass rounded-3xl p-12 text-center">
                  <p className="text-white/20 text-sm">{clients.length === 0 ? 'Nenhum cliente.' : 'Nenhum resultado.'}</p>
                </div>
              ) : filteredClients.map(client => {
                const inactDays = daysSince(client.lastActivity);
                const isInactive = inactDays !== null && inactDays >= 5;
                return (
                  <div key={client.user_id}
                    className={`coach-glass rounded-2xl transition-all hover:border-white/[0.12] group ${isInactive ? 'border-red-500/20' : ''}`}>
                    <div className="p-4 flex items-start gap-3">
                      <ClientAvatar nome={client.nome} status={client.subscription_status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link to={`/coach/cliente/${client.user_id}`} className="font-semibold text-white/90 hover:text-violet-400 transition-colors text-sm">{client.nome}</Link>
                          <StatusBadge status={client.subscription_status} />
                          <PlanBadge hasIntake={client.hasIntake} hasPlan={client.hasPlan} planStatus={client.planStatus} planErro={client.planErro} />
                          {isInactive && <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-500/15 text-red-400">{inactDays}d</span>}
                        </div>
                        <p className="text-xs text-white/25 mt-0.5 truncate">{client.email}</p>
                        {client.subscription_status === 'pending' && client.payment_reference && (
                          <div className="flex items-center gap-2 mt-1.5 text-xs">
                            <span className="font-mono text-[11px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg">{client.payment_reference}</span>
                            {client.payment_amount && <span className="font-bold text-emerald-400">{Number(client.payment_amount).toLocaleString('pt-MZ')} MZN</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/15">
                          {client.planCalorias && <span>{client.planCalorias} kcal</span>}
                          {client.subscription_expires && <span>Exp: {new Date(client.subscription_expires).toLocaleDateString('pt-PT')}</span>}
                          <span>Reg: {new Date(client.created_at).toLocaleDateString('pt-PT')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Link to={`/coach/cliente/${client.user_id}`} className="px-3 py-1.5 text-xs font-semibold bg-white/[0.06] text-white/60 rounded-xl hover:bg-white/[0.1] hover:text-white/80 transition-all active:scale-95">Ver</Link>
                        {client.hasIntake && (!client.hasPlan || client.planStatus === 'erro') && (
                          <button onClick={() => handleGerarPlano(client)} disabled={gerandoPlano === client.user_id}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 ${
                              client.planStatus === 'erro' ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            }`}>
                            {gerandoPlano === client.user_id ? '...' : (client.planStatus === 'erro' ? 'Retry' : 'Gerar')}
                          </button>
                        )}
                        <ClientActions client={client} onActivate={handleActivate} onSetTester={handleSetTester} onDelete={handleDeleteClient} onGeneratePlan={handleGerarPlano} isGenerating={gerandoPlano === client.user_id} isDeleting={deletingClient === client.user_id} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════ ECOS ══════ */}
        {activeTab === 'ecos' && (
          <div className="space-y-5 animate-fadeIn">
            {multiEcoStats ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(multiEcoStats).map(([eco, ecoStats]) => {
                    const config = ECO_PLANS[eco]; if (!config) return null;
                    const isSelected = selectedEco === eco;
                    return (
                      <button key={eco} onClick={() => isSelected ? setSelectedEco(null) : loadEcoClients(eco)}
                        className={`coach-glass rounded-2xl p-4 text-left transition-all group ${isSelected ? 'ring-1' : ''}`}
                        style={{
                          borderColor: isSelected ? `${config.color}60` : undefined,
                          boxShadow: isSelected ? `0 0 30px ${config.color}15, inset 0 0 30px ${config.color}08` : undefined,
                          ringColor: isSelected ? `${config.color}60` : undefined,
                        }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                            style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}99)`, boxShadow: `0 4px 15px ${config.color}40` }}>
                            {config.name[0]}
                          </div>
                          <span className="font-bold text-white/90">{config.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div className="bg-white/[0.04] rounded-xl px-2 py-1.5"><span className="text-white/30">Total </span><span className="font-black text-white/80">{ecoStats.total}</span></div>
                          <div className="bg-white/[0.04] rounded-xl px-2 py-1.5"><span className="text-emerald-400/60">Act. </span><span className="font-black text-emerald-400">{ecoStats.active}</span></div>
                          {ecoStats.trial > 0 && <div className="bg-white/[0.04] rounded-xl px-2 py-1.5"><span className="text-blue-400/60">Trial </span><span className="font-black text-blue-400">{ecoStats.trial}</span></div>}
                          {ecoStats.tester > 0 && <div className="bg-white/[0.04] rounded-xl px-2 py-1.5"><span className="text-purple-400/60">Test </span><span className="font-black text-purple-400">{ecoStats.tester}</span></div>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedEco && (
                  <div className="coach-glass rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]"
                      style={{ background: `linear-gradient(135deg, ${ECO_PLANS[selectedEco]?.color}10, transparent)` }}>
                      <h3 className="font-bold text-white/90 text-sm flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: ECO_PLANS[selectedEco]?.color, boxShadow: `0 2px 10px ${ECO_PLANS[selectedEco]?.color}40` }}>
                          {ECO_PLANS[selectedEco]?.name?.[0]}
                        </span>
                        {ECO_PLANS[selectedEco]?.name}
                      </h3>
                      <button onClick={() => setSelectedEco(null)} className="text-xs font-semibold text-white/30 hover:text-white/60 px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-colors">Fechar</button>
                    </div>
                    <div className="p-4">
                      {loadingEcoClients ? (
                        <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" /></div>
                      ) : ecoClients.length === 0 ? (
                        <p className="text-white/20 text-sm text-center py-8">Sem clientes</p>
                      ) : (
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                          {ecoClients.map(client => (
                            <div key={client.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <ClientAvatar nome={client.nome} status={client.subscription_status} size="sm" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-white/80 text-sm truncate">{client.nome}</p>
                                  <p className="text-[11px] text-white/25 truncate">{client.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                <StatusBadge status={client.subscription_status} />
                                <div className="flex gap-1">
                                  {client.subscription_status !== 'tester' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleEcoAction(selectedEco, client.user_id, 'tester'); }}
                                      disabled={ecoAction?.userId === client.user_id}
                                      className="px-2 py-1.5 text-[10px] font-bold rounded-lg bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 disabled:opacity-50 transition-all active:scale-95">Tester</button>
                                  )}
                                  {client.subscription_status !== 'active' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleEcoAction(selectedEco, client.user_id, 'MONTHLY'); }}
                                      disabled={ecoAction?.userId === client.user_id}
                                      className="px-2 py-1.5 text-[10px] font-bold rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50 transition-all active:scale-95">Activar</button>
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
              </>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
              </div>
            )}
          </div>
        )}

        {/* ══════ COMMS ══════ */}
        {activeTab === 'comms' && (
          <div className="coach-glass rounded-2xl overflow-hidden animate-fadeIn">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-bold text-white/90 text-sm">Centro de Comunicações</h2>
              <p className="text-xs text-white/25 mt-0.5">Emails, WhatsApp e push</p>
            </div>
            <div className="p-4">
              <Suspense fallback={<div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" /></div>}>
                <CentroComunicacoes />
              </Suspense>
            </div>
          </div>
        )}

        {/* ══════ CONFIG ══════ */}
        {activeTab === 'config' && (
          <div className="space-y-4 max-w-xl animate-fadeIn">
            <div className="coach-glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white/90 text-sm">Push Notifications</h3>
                <div className={`w-3 h-3 rounded-full ${pushStatus === 'subscribed' ? 'bg-emerald-400 animate-pulse' : 'bg-white/10'}`}
                  style={pushStatus === 'subscribed' ? { boxShadow: '0 0 10px rgba(52,211,153,0.5)' } : {}} />
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                {pushStatus === 'subscribed' && 'Activas — alertas em tempo real.'}
                {pushStatus === 'denied' && 'Bloqueadas pelo browser.'}
                {pushStatus === 'unsupported' && 'Browser não suporta.'}
                {pushStatus === 'failed' && 'Não activadas.'}
                {!pushStatus && 'A verificar...'}
              </p>
              {pushStatus && pushStatus !== 'subscribed' && pushStatus !== 'denied' && (
                <button onClick={() => registerPushSubscription(true)} disabled={pushActivando}
                  className="mt-4 px-5 py-2.5 coach-gradient-bar text-white rounded-2xl text-sm font-bold hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
                  style={{ boxShadow: '0 4px 20px rgba(120,80,200,0.3)' }}>
                  {pushActivando ? 'A activar...' : 'Activar push'}
                </button>
              )}
            </div>

            <div className="coach-glass rounded-2xl p-5">
              <h3 className="font-bold text-white/90 text-sm mb-1">Testar canais</h3>
              <p className="text-xs text-white/25 mb-4">Envia teste para todos os canais.</p>
              <button onClick={testarNotificacoes} disabled={testando}
                className="px-5 py-2.5 text-white rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                {testando ? 'A testar...' : 'Testar agora'}
              </button>
              {testResult && (
                <div className={`mt-4 p-4 rounded-2xl text-xs space-y-1.5 ${testResult.ok ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <p className="font-bold text-sm text-white/80">{testResult.ok ? '✅ Funciona!' : '❌ Falhou'}</p>
                  {testResult.resultados?.telegram && <p className="text-white/50">{testResult.resultados.telegram.enviado ? '✅' : '❌'} Telegram: {testResult.resultados.telegram.enviado ? 'OK' : (testResult.resultados.telegram.erro || 'N/A')}</p>}
                  {testResult.resultados?.push && <p className="text-white/50">{testResult.resultados.push.enviado ? '✅' : '❌'} Push: {testResult.resultados.push.enviado ? 'OK' : (testResult.resultados.push.erro || 'N/A')} ({testResult.resultados.push.subscricoes} devices)</p>}
                  {testResult.resultados?.whatsapp && <p className="text-white/50">📱 WA: {testResult.resultados.whatsapp.configurado ? 'OK' : 'N/A'}</p>}
                  {testResult.resultados?.email && <p className="text-white/50">📧 Email: {testResult.resultados.email.configurado ? 'OK' : 'N/A'}</p>}
                  {testResult.dica && <p className="mt-2 text-amber-400 font-semibold">{testResult.dica}</p>}
                </div>
              )}
            </div>

            {/* Gestão de Códigos Promo */}
            <Suspense fallback={<div className="h-32 rounded-2xl bg-white/[0.04] animate-pulse" />}>
              <CoachPromoManager />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───

function StatusBadge({ status }) {
  const map = {
    tester: { label: 'Tester', bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
    trial: { label: 'Trial', bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
    active: { label: 'Activo', bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
    pending: { label: 'Pendente', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
    expired: { label: 'Expirado', bg: 'rgba(248,113,113,0.15)', color: '#f87171' },
    cancelled: { label: 'Cancelado', bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
  };
  const c = map[status] || { label: status || 'N/A', bg: 'rgba(107,114,128,0.15)', color: '#6b7280' };
  return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
}

function PlanBadge({ hasIntake, hasPlan, planStatus, planErro }) {
  if (!hasIntake) return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/[0.06] text-white/30">Sem intake</span>;
  if (planStatus === 'erro') return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-500/15 text-red-400" title={planErro}>Erro plano</span>;
  if (!hasPlan) return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-400">Sem plano</span>;
  if (planStatus === 'pendente_revisao') return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-400">Revisão</span>;
  return <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400">Plano activo</span>;
}

function ClientActions({ client, onActivate, onSetTester, onDelete, onGeneratePlan, isGenerating, isDeleting }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1.5 text-white/25 hover:text-white/50 hover:bg-white/[0.06] rounded-xl transition-colors">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-2xl shadow-2xl border border-white/[0.08] py-1.5 text-sm overflow-hidden"
            style={{ background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(20px)' }}>
            <Link to={`/coach/cliente/${client.user_id}`} className="block px-4 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white/90" onClick={() => setOpen(false)}>Ver detalhes</Link>
            {client.hasIntake && <button onClick={() => { onGeneratePlan(client); setOpen(false); }} disabled={isGenerating} className="block w-full text-left px-4 py-2 text-white/70 hover:bg-white/[0.06] hover:text-white/90 disabled:opacity-50">{client.hasPlan ? 'Regenerar plano' : 'Gerar plano'}</button>}
            <div className="border-t border-white/[0.06] my-1" />
            <button onClick={() => { onActivate(client, 'MONTHLY'); setOpen(false); }} className="block w-full text-left px-4 py-2 text-white/70 hover:bg-white/[0.06]">Activar mensal</button>
            <button onClick={() => { onActivate(client, 'SEMESTRAL'); setOpen(false); }} className="block w-full text-left px-4 py-2 text-white/70 hover:bg-white/[0.06]">Activar semestral</button>
            <button onClick={() => { onActivate(client, 'ANNUAL'); setOpen(false); }} className="block w-full text-left px-4 py-2 text-white/70 hover:bg-white/[0.06]">Activar anual</button>
            <div className="border-t border-white/[0.06] my-1" />
            <button onClick={() => { onSetTester(client); setOpen(false); }} className="block w-full text-left px-4 py-2 text-purple-400 hover:bg-purple-500/10">Definir tester</button>
            {client.email && <a href={`https://wa.me/?text=${encodeURIComponent(`Ola ${client.nome}!`)}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-green-400 hover:bg-green-500/10" onClick={() => setOpen(false)}>WhatsApp</a>}
            <div className="border-t border-white/[0.06] my-1" />
            <button onClick={() => { onDelete(client); setOpen(false); }} disabled={isDeleting} className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 disabled:opacity-50">{isDeleting ? 'A apagar...' : 'Apagar'}</button>
          </div>
        </>
      )}
    </div>
  );
}
