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

      // Get user record
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .maybeSingle();

      if (userData) {
        // Get Vitalis subscription
        const { data: vitalisData } = await supabase
          .from('vitalis_clients')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();

        // Get Aurea subscription (if exists)
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
      active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Activo' },
      tester: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Tester' },
      trial: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Trial' },
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pendente' },
      expired: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Expirado' },
      cancelled: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Cancelado' }
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #E8D5A3 100%)' }}>
        <div className="w-10 h-10 border-4 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #E8D5A3 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logos/CENTRO_7ECOS.png" alt="Sete Ecos" className="w-8 h-8" />
            <span className="text-lg font-bold text-[#4A3728]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              SETE ECOS
            </span>
          </Link>
          <h1 className="text-lg font-semibold text-[#4A3728]">Minha Conta</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#E8D5A3]/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C9A227] to-[#B8911E] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#4A3728]">
                {user?.user_metadata?.name || user?.email?.split('@')[0]}
              </h2>
              <p className="text-[#6B5344] text-sm">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-[#E8D5A3]/50 pt-4 space-y-2">
            <p className="text-sm text-[#6B5344]">
              <span className="font-medium">Conta criada:</span> {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        {/* Subscriptions Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#4A3728] flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            As Minhas Subscrições
          </h3>

          {/* Vitalis Subscription */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E8D5A3]/50">
            <div className="bg-gradient-to-r from-[#7C8B6F] to-[#5D6B4F] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logos/logo_vitalis_b.png" alt="Vitalis" className="w-10 h-10" />
                <span className="text-white font-semibold text-lg">VITALIS</span>
              </div>
              {subscriptions.vitalis && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(subscriptions.vitalis.subscription_status).bg} ${getStatusBadge(subscriptions.vitalis.subscription_status).text}`}>
                  {getStatusBadge(subscriptions.vitalis.subscription_status).label}
                </span>
              )}
            </div>

            <div className="p-4">
              {subscriptions.vitalis ? (
                <div className="space-y-3">
                  {subscriptions.vitalis.subscription_plan && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B5344]">Plano:</span>
                      <span className="text-[#4A3728] font-medium">
                        {SUBSCRIPTION_PLANS[subscriptions.vitalis.subscription_plan.toUpperCase()]?.name || subscriptions.vitalis.subscription_plan}
                      </span>
                    </div>
                  )}
                  {subscriptions.vitalis.subscription_expires && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B5344]">Expira em:</span>
                      <span className="text-[#4A3728] font-medium">
                        {formatDate(subscriptions.vitalis.subscription_expires)}
                      </span>
                    </div>
                  )}
                  {subscriptions.vitalis.training_phase && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B5344]">Fase:</span>
                      <span className="text-[#4A3728] font-medium capitalize">
                        {subscriptions.vitalis.training_phase === 'discovery' ? 'Descoberta' :
                         subscriptions.vitalis.training_phase === 'stabilization' ? 'Estabilização' :
                         subscriptions.vitalis.training_phase === 'autonomy' ? 'Autonomia' :
                         subscriptions.vitalis.training_phase}
                      </span>
                    </div>
                  )}

                  <Link
                    to="/vitalis/dashboard"
                    className="mt-4 block w-full py-3 bg-gradient-to-r from-[#7C8B6F] to-[#5D6B4F] text-white text-center rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Ir para Vitalis
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[#6B5344] mb-4">Ainda não tens acesso ao Vitalis</p>
                  <Link
                    to="/vitalis/pagamento"
                    className="inline-block px-6 py-2 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Subscrever Vitalis
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Aurea Subscription */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E8D5A3]/50">
            <div className="bg-gradient-to-r from-[#C9A227] to-[#B8911E] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logos/logo_aurea.png" alt="Áurea" className="w-10 h-10" onError={(e) => e.target.style.display = 'none'} />
                <span className="text-white font-semibold text-lg">ÁUREA</span>
              </div>
              {subscriptions.aurea && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(subscriptions.aurea.subscription_status).bg} ${getStatusBadge(subscriptions.aurea.subscription_status).text}`}>
                  {getStatusBadge(subscriptions.aurea.subscription_status).label}
                </span>
              )}
            </div>

            <div className="p-4">
              {subscriptions.aurea ? (
                <div className="space-y-3">
                  {subscriptions.aurea.subscription_expires && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B5344]">Expira em:</span>
                      <span className="text-[#4A3728] font-medium">
                        {formatDate(subscriptions.aurea.subscription_expires)}
                      </span>
                    </div>
                  )}

                  <Link
                    to="/aurea/dashboard"
                    className="mt-4 block w-full py-3 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white text-center rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Ir para Áurea
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[#6B5344] mb-4">Ainda não tens acesso ao Áurea</p>
                  <Link
                    to="/aurea/pagamento"
                    className="inline-block px-6 py-2 bg-gradient-to-r from-[#C9A227] to-[#B8911E] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Subscrever Áurea
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Lumina - Free */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E8D5A3]/50">
            <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logos/logo_lumina.png" alt="Lumina" className="w-10 h-10" onError={(e) => e.target.style.display = 'none'} />
                <span className="text-white font-semibold text-lg">LUMINA</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                Gratuito
              </span>
            </div>

            <div className="p-4">
              <p className="text-[#6B5344] text-sm mb-4">
                Diagnóstico diário gratuito - disponível para todos
              </p>
              <Link
                to="/lumina"
                className="block w-full py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white text-center rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Ir para Lumina
              </Link>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[#4A3728]">Definições</h3>

          <Link
            to="/perfil"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E8D5A3]/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FAF6F0] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#4A3728]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-[#4A3728] font-medium">Editar Perfil</span>
            </div>
            <svg className="w-5 h-5 text-[#6B5344]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            to="/recuperar-password"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E8D5A3]/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FAF6F0] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#4A3728]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <span className="text-[#4A3728] font-medium">Alterar Password</span>
            </div>
            <svg className="w-5 h-5 text-[#6B5344]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-red-200 hover:bg-red-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-red-600 font-medium">Terminar Sessão</span>
            </div>
          </button>
        </div>

        {/* Support */}
        <div className="bg-[#FAF6F0] rounded-2xl p-4 text-center">
          <p className="text-[#6B5344] text-sm mb-2">Precisas de ajuda?</p>
          <a
            href="mailto:suporte@seteecos.com"
            className="text-[#C9A227] font-medium hover:underline"
          >
            suporte@seteecos.com
          </a>
        </div>
      </main>
    </div>
  );
}
