import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SUBSCRIPTION_PLANS } from '../lib/subscriptions';

/**
 * MINHA CONTA - Central Account Management
 * View subscriptions, manage account settings
 */
export default function MinhaConta() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState({
    vitalis: null,
    aurea: null
  });

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { state: { from: '/conta' } });
        return;
      }

      setUser(session.user);

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .maybeSingle();

      if (userData) {
        const { data: vitalisData } = await supabase
          .from('vitalis_clients')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();

        const { data: aureaData } = await supabase
          .from('aurea_clients')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();

        setSubscriptions({
          vitalis: vitalisData || null,
          aurea: aureaData || null
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-emerald-500/20', text: 'text-emerald-600', label: 'Activo', dot: 'bg-emerald-500' },
      tester: { bg: 'bg-violet-500/20', text: 'text-violet-600', label: 'Tester', dot: 'bg-violet-500' },
      trial: { bg: 'bg-sky-500/20', text: 'text-sky-600', label: 'Trial', dot: 'bg-sky-500' },
      pending: { bg: 'bg-amber-500/20', text: 'text-amber-600', label: 'Pendente', dot: 'bg-amber-500' },
      expired: { bg: 'bg-red-500/20', text: 'text-red-600', label: 'Expirado', dot: 'bg-red-500' },
      cancelled: { bg: 'bg-gray-500/20', text: 'text-gray-600', label: 'Cancelado', dot: 'bg-gray-500' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #F0E6D4 50%, #E8D5A3 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-[#C9A227]/20 rounded-full"></div>
            <div className="w-14 h-14 border-4 border-transparent border-t-[#C9A227] rounded-full animate-spin absolute inset-0"></div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen pb-24" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #F0E6D4 50%, #E8D5A3 100%)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Profile hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #4A3728 0%, #2A1F18 100%)' }} />
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10" style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10" style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }} />

        <div className="relative px-5 pt-8 pb-20">
          {/* Top row */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="text-white/60 text-xs tracking-widest uppercase font-semibold">Minha Conta</p>
            <div className="w-10" /> {/* spacer */}
          </div>

          {/* Avatar and name */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#C9A227] to-[#8B6914] flex items-center justify-center shadow-2xl">
                <span className="text-white text-2xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-xl border-2 border-[#4A3728] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {displayName}
            </h1>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <p className="text-white/25 text-xs mt-2">
              Membro desde {formatDate(user?.created_at)}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-5 -mt-10 relative z-10 space-y-6">
        {/* Subscription Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-[#C9A227] to-[#C9A227]/30 rounded-full" />
            <h2 className="text-sm font-semibold text-[#4A3728] tracking-widest uppercase">Subscricoes</h2>
          </div>

          {/* Vitalis */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl overflow-hidden">
            <div className="relative overflow-hidden p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7C8B6F] to-[#3D4D35]" />
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg tracking-wide">VITALIS</h3>
                    <p className="text-white/50 text-xs">Corpo & Nutricao</p>
                  </div>
                </div>
                {subscriptions.vitalis && (() => {
                  const badge = getStatusBadge(subscriptions.vitalis.subscription_status);
                  return (
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text} backdrop-blur-sm`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="p-5">
              {subscriptions.vitalis ? (
                <div className="space-y-3">
                  {subscriptions.vitalis.subscription_plan && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6B5344]/60">Plano</span>
                      <span className="text-[#4A3728] font-medium bg-[#7C8B6F]/10 px-3 py-1 rounded-full text-xs">
                        {SUBSCRIPTION_PLANS[subscriptions.vitalis.subscription_plan.toUpperCase()]?.name || subscriptions.vitalis.subscription_plan}
                      </span>
                    </div>
                  )}
                  {subscriptions.vitalis.subscription_expires && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6B5344]/60">Expira</span>
                      <span className="text-[#4A3728] font-medium text-xs">
                        {formatDate(subscriptions.vitalis.subscription_expires)}
                      </span>
                    </div>
                  )}
                  {subscriptions.vitalis.training_phase && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6B5344]/60">Fase</span>
                      <span className="text-[#4A3728] font-medium bg-[#8B5CF6]/10 px-3 py-1 rounded-full text-xs">
                        {subscriptions.vitalis.training_phase === 'discovery' ? 'Descoberta' :
                         subscriptions.vitalis.training_phase === 'stabilization' ? 'Estabilizacao' :
                         subscriptions.vitalis.training_phase === 'autonomy' ? 'Autonomia' :
                         subscriptions.vitalis.training_phase}
                      </span>
                    </div>
                  )}
                  <Link
                    to="/vitalis/dashboard"
                    className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#7C8B6F] to-[#5D6B4F] text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    Ir para Vitalis
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-[#6B5344]/50 text-sm mb-4">Ainda nao tens acesso ao Vitalis</p>
                  <Link
                    to="/vitalis/pagamento"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    Subscrever
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Aurea */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl overflow-hidden">
            <div className="relative overflow-hidden p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227] to-[#8B6914]" />
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <img src="/logos/logo_aurea.png" alt="Aurea" className="w-8 h-8" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg tracking-wide">AUREA</h3>
                    <p className="text-white/50 text-xs">Autocuidado & Beleza</p>
                  </div>
                </div>
                {subscriptions.aurea && (() => {
                  const badge = getStatusBadge(subscriptions.aurea.subscription_status);
                  return (
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text} backdrop-blur-sm`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="p-5">
              {subscriptions.aurea ? (
                <div className="space-y-3">
                  {subscriptions.aurea.subscription_expires && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6B5344]/60">Expira</span>
                      <span className="text-[#4A3728] font-medium text-xs">
                        {formatDate(subscriptions.aurea.subscription_expires)}
                      </span>
                    </div>
                  )}
                  <Link
                    to="/aurea/dashboard"
                    className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    Ir para Aurea
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-[#6B5344]/50 text-sm mb-4">Ainda nao tens acesso ao Aurea</p>
                  <Link
                    to="/aurea/pagamento"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    Subscrever
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Lumina */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl overflow-hidden">
            <div className="relative overflow-hidden p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] to-[#5B21B6]" />
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-8 h-8" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg tracking-wide">LUMINA</h3>
                    <p className="text-white/50 text-xs">Diagnostico diario</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white/80 backdrop-blur-sm">
                  Gratuito
                </span>
              </div>
            </div>

            <div className="p-5">
              <p className="text-[#6B5344]/50 text-sm mb-4">
                Diagnostico diario gratuito — disponivel para todos
              </p>
              <Link
                to="/lumina"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Ir para Lumina
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-[#6B5344] to-[#6B5344]/30 rounded-full" />
            <h2 className="text-sm font-semibold text-[#4A3728] tracking-widest uppercase">Definicoes</h2>
          </div>

          <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/60 shadow-lg overflow-hidden">
            <Link
              to="/perfil"
              className="flex items-center justify-between p-4 hover:bg-white/50 transition-colors border-b border-[#E8D5A3]/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#C9A227]/15 to-[#C9A227]/5 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#C9A227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[#4A3728] font-medium text-sm">Editar Perfil</span>
                  <p className="text-[#6B5344]/50 text-xs">Nome, foto e dados pessoais</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-[#6B5344]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/recuperar-password"
              className="flex items-center justify-between p-4 hover:bg-white/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6B5344]/15 to-[#6B5344]/5 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#6B5344]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[#4A3728] font-medium text-sm">Alterar Password</span>
                  <p className="text-[#6B5344]/50 text-xs">Seguranca da conta</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-[#6B5344]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-red-200/50 hover:bg-red-50/50 transition-all group"
        >
          <svg className="w-5 h-5 text-red-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-red-400 group-hover:text-red-500 font-medium text-sm transition-colors">Terminar Sessao</span>
        </button>

        {/* Support */}
        <div className="text-center pb-4">
          <p className="text-[#6B5344]/40 text-xs mb-1">Precisas de ajuda?</p>
          <a
            href="mailto:suporte@seteecos.com"
            className="text-[#C9A227]/70 text-xs font-medium hover:text-[#C9A227] transition-colors"
          >
            suporte@seteecos.com
          </a>
        </div>
      </main>
    </div>
  );
}
