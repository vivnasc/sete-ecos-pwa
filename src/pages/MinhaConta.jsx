import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SUBSCRIPTION_PLANS } from '../lib/subscriptions';
import { isCoach } from '../lib/coach';
import { useTheme } from '../contexts/ThemeContext';

/**
 * MINHA CONTA - Central Account Management
 * View subscriptions, manage account settings
 */
export default function MinhaConta() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
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
      active: { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', label: 'Activo', dot: 'bg-emerald-500' },
      tester: { bg: 'bg-violet-500/15', text: 'text-violet-700 dark:text-violet-400', label: 'Tester', dot: 'bg-violet-500' },
      trial: { bg: 'bg-sky-500/15', text: 'text-sky-700 dark:text-sky-400', label: 'Trial', dot: 'bg-sky-500' },
      pending: { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', label: 'Pendente', dot: 'bg-amber-500' },
      expired: { bg: 'bg-red-500/15', text: 'text-red-700 dark:text-red-400', label: 'Expirado', dot: 'bg-red-500' },
      cancelled: { bg: 'bg-gray-500/15', text: 'text-gray-600 dark:text-gray-400', label: 'Cancelado', dot: 'bg-gray-400' }
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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#1a1a2e]' : ''}`} style={!isDark ? { background: 'linear-gradient(135deg, #FAF6F0 0%, #F0E6D4 50%, #E8D5A3 100%)' } : undefined}>
        <div className="relative">
          <div className="w-14 h-14 border-4 border-[#C9A227]/20 rounded-full"></div>
          <div className="w-14 h-14 border-4 border-transparent border-t-[#C9A227] rounded-full animate-spin absolute inset-0"></div>
        </div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const renderSubscriptionRow = (key, name, logo, colors, link, payLink) => {
    const sub = subscriptions[key];
    const badge = sub ? getStatusBadge(sub.subscription_status) : null;
    const hasAccess = sub && ['active', 'tester', 'trial'].includes(sub.subscription_status);

    return (
      <div className="flex items-center gap-3 p-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
          <img src={logo} alt={name} className="w-6 h-6" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${isDark ? 'text-gray-100' : 'text-[#4A3728]'}`}>{name}</span>
            {badge && (
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
                {badge.label}
              </span>
            )}
          </div>
          {sub?.subscription_expires && (
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#6B5344]/40'}`}>Expira: {formatDate(sub.subscription_expires)}</p>
          )}
          {!sub && <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-[#6B5344]/40'}`}>Sem subscrição</p>}
        </div>
        {hasAccess ? (
          <Link to={link} className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
            Abrir
          </Link>
        ) : (
          <Link to={payLink || link} className="text-xs font-semibold text-[#C9A227] px-3 py-1.5 rounded-xl bg-[#C9A227]/10 flex-shrink-0">
            Subscrever
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24" style={{ fontFamily: 'var(--font-corpo)' }}>
      {/* Background */}
      <div className={`fixed inset-0 -z-10 ${isDark ? 'bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23]' : ''}`}
        style={!isDark ? { background: 'linear-gradient(135deg, #FAF6F0 0%, #F0E6D4 50%, #E8D5A3 100%)' } : undefined}
      >
        {!isDark && (
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #C9A227 0%, transparent 70%)', filter: 'blur(60px)' }} />
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="px-5 pt-8 pb-2">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/')} className={`w-10 h-10 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-colors shadow-sm border ${isDark ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-white/50 border-white/60 hover:bg-white/70'}`}>
              <svg className={`w-5 h-5 ${isDark ? 'text-gray-200' : 'text-[#4A3728]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="text-[#C9A227] text-xs tracking-widest uppercase font-semibold">Minha Conta</p>
            <div className="w-10" />
          </div>
        </header>

        {/* Profile card */}
        <section className="px-5 py-6">
          <div className={`backdrop-blur-md rounded-3xl border shadow-lg p-5 ${isDark ? 'bg-white/10 border-white/15' : 'bg-white/50 border-white/60'}`}>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#8B6914] flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-titulos)' }}>{initials}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className={`text-xl font-bold truncate ${isDark ? 'text-gray-100' : 'text-[#4A3728]'}`} style={{ fontFamily: 'var(--font-titulos)' }}>
                  {displayName}
                </h1>
                <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-[#6B5344]/50'}`}>{user?.email}</p>
                <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-[#6B5344]/30'}`}>
                  Membro desde {formatDate(user?.created_at)}
                </p>
              </div>
              <Link to="/perfil" className="w-9 h-9 bg-[#C9A227]/10 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-[#C9A227]/20 transition-colors">
                <svg className="w-4 h-4 text-[#C9A227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Subscriptions */}
        <section className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gradient-to-b from-[#C9A227] to-[#C9A227]/30 rounded-full" />
            <h2 className={`text-sm font-semibold tracking-widest uppercase ${isDark ? 'text-gray-200' : 'text-[#4A3728]'}`}>Os meus Ecos</h2>
          </div>

          <div className={`backdrop-blur-md rounded-3xl border shadow-lg overflow-hidden ${isDark ? 'bg-white/10 border-white/15 divide-y divide-white/10' : 'bg-white/50 border-white/60 divide-y divide-[#E8D5A3]/15'}`}>
            {renderSubscriptionRow('vitalis', 'VITALIS', '/logos/VITALIS_LOGO_V3.png', ['#7C8B6F', '#3D4D35'], '/vitalis/dashboard', '/vitalis/pagamento')}
            {renderSubscriptionRow('aurea', 'AUREA', '/logos/logo_aurea.png', ['#C9A227', '#8B6914'], '/aurea/dashboard', '/aurea/pagamento')}

            {/* Lumina - always free */}
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8B5CF6, #5B21B6)' }}>
                <img src="/logos/lumina-logo_v2.png" alt="Lumina" className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${isDark ? 'text-gray-100' : 'text-[#4A3728]'}`}>LUMINA</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-700 dark:text-violet-400">Gratuito</span>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-[#6B5344]/40'}`}>Diagnóstico diário</p>
              </div>
              <Link to="/lumina" className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8B5CF6, #5B21B6)' }}>
                Abrir
              </Link>
            </div>
          </div>
        </section>

        {/* Settings */}
        <section className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-1 h-5 bg-gradient-to-b rounded-full ${isDark ? 'from-gray-400 to-gray-400/30' : 'from-[#6B5344] to-[#6B5344]/30'}`} />
            <h2 className={`text-sm font-semibold tracking-widest uppercase ${isDark ? 'text-gray-200' : 'text-[#4A3728]'}`}>Definições</h2>
          </div>

          <div className={`backdrop-blur-md rounded-3xl border shadow-lg overflow-hidden ${isDark ? 'bg-white/10 border-white/15 divide-y divide-white/10' : 'bg-white/50 border-white/60 divide-y divide-[#E8D5A3]/15'}`}>
            {isCoach(user?.email) && (
              <Link to="/coach" className={`flex items-center gap-3 p-3.5 transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-white/40'}`}>
                <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-[#4A3728]'}`}>Coach Dashboard</span>
                </div>
                <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-[#6B5344]/25'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            <Link to="/perfil" className={`flex items-center gap-3 p-3.5 transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-white/40'}`}>
              <div className="w-9 h-9 bg-[#C9A227]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#C9A227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-[#4A3728]'}`}>Editar Perfil</span>
              </div>
              <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-[#6B5344]/25'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link to="/recuperar-password" className={`flex items-center gap-3 p-3.5 transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-white/40'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-gray-500/15' : 'bg-[#6B5344]/10'}`}>
                <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-[#6B5344]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-[#4A3728]'}`}>Alterar Password</span>
              </div>
              <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-[#6B5344]/25'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <button onClick={handleLogout} className={`w-full flex items-center gap-3 p-3.5 transition-colors ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50/40'}`}>
              <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <span className="text-red-400 font-medium text-sm">Terminar Sessão</span>
              </div>
            </button>
          </div>
        </section>

        {/* Support */}
        <div className="text-center px-5 pb-4">
          <p className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-[#6B5344]/30'}`}>Precisas de ajuda?</p>
          <a href="mailto:suporte@seteecos.com" className={`text-xs font-medium transition-colors ${isDark ? 'text-[#C9A227]/80 hover:text-[#C9A227]' : 'text-[#C9A227]/60 hover:text-[#C9A227]'}`}>
            suporte@seteecos.com
          </a>
        </div>
      </div>
    </div>
  );
}
