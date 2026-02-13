import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { checkVitalisAccess, SUBSCRIPTION_STATUS, isTrialRestrictedRoute, getRenewalIncentive } from '../../lib/subscriptions';
import { isCoach } from '../../lib/coach';
import { useAuth } from '../../contexts/AuthContext';

/**
 * VITALIS ACCESS GUARD
 *
 * Componente que verifica se o utilizador tem acesso ao Vitalis.
 * Se nao tiver, redireciona para a pagina de pagamento.
 */

const VitalisAccessGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);
  const location = useLocation();
  const { user, userRecord } = useAuth();

  useEffect(() => {
    checkAccess();
  }, [user, userRecord]);

  const checkAccess = async () => {
    try {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Bypass emails têm acesso directo
      const coachCheck = isCoach(user.email);

      if (coachCheck) {
        // Garantir que coach tem registo na tabela users
        const { data: coachUser, error: coachError } = await supabase
          .from('users')
          .upsert({
            auth_id: user.id,
            email: user.email,
            nome: user.user_metadata?.name || user.email.split('@')[0]
          }, { onConflict: 'auth_id' })
          .select('id')
          .maybeSingle();

        if (coachError) {
          console.error('Coach user upsert error:', coachError);
        }

        if (coachUser) {
          // Garantir que coach tem registo vitalis_clients com status activo + tester
          const { error: clientError } = await supabase
            .from('vitalis_clients')
            .upsert({
              user_id: coachUser.id,
              status: 'activo',
              subscription_status: 'tester'
            }, { onConflict: 'user_id' });

          if (clientError) {
            console.error('Coach vitalis_clients upsert error:', clientError);
          }
        }

        // Coach SEMPRE tem acesso, mesmo se upserts falharem
        setAccessInfo({ hasAccess: true, status: 'bypass', reason: 'bypass_email' });
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Usar userRecord do contexto, ou buscar se necessário
      let userId = userRecord?.id;
      if (!userId) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle();
        userId = userData?.id;
      }

      if (!userId) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Verificar acesso ao Vitalis
      const access = await checkVitalisAccess(userId);
      setAccessInfo(access);
      setHasAccess(access.hasAccess);
    } catch (error) {
      console.error('VitalisAccessGuard - CATCH ERROR:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-300">A verificar acesso...</p>
        </div>
      </div>
    );
  }

  // Sem acesso - redirecionar para pagamento
  // NOTA: PENDING agora TEM ACESSO (cliente que pagou merece acesso imediato)
  // Coach pode revogar se pagamento não confirmar
  if (!hasAccess) {
    return <Navigate to="/vitalis/pagamento" state={{ from: location }} replace />;
  }

  // TRIAL: Verificar se a rota actual esta restrita durante o trial
  const isTrial = accessInfo?.status === SUBSCRIPTION_STATUS.TRIAL;
  const isRestricted = isTrial && isTrialRestrictedRoute(location.pathname);

  if (isRestricted) {
    const daysLeft = accessInfo?.daysLeft || 0;
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #0f1f0f 50%, #1a2e1a 100%)' }}>
        <div className="max-w-lg mx-auto px-5 py-12">
          {/* Trial banner */}
          <div className="bg-[#7C8B6F]/20 border border-[#7C8B6F]/30 rounded-2xl px-5 py-3 mb-8 text-center">
            <p className="text-[#A8B89A] text-sm">
              Trial gratuito - {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
            </p>
          </div>

          {/* Upgrade prompt */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#7C8B6F]/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#7C8B6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Conteudo Premium
            </h1>
            <p className="text-[#A8B89A]/80 text-sm leading-relaxed max-w-sm mx-auto mb-2">
              Esta funcionalidade faz parte do plano completo Vitalis.
              Subscreve para desbloquear o teu plano alimentar personalizado, relatorios detalhados e muito mais.
            </p>
            <p className="text-[#7C8B6F] text-xs">
              O trial inclui: Dashboard, Check-in, Receitas, Desafios e Chat com a Coach.
            </p>
          </div>

          {/* What they get */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 mb-8">
            <h3 className="text-white font-semibold text-sm mb-4">Com a subscricao completa, desbloqueia:</h3>
            <div className="space-y-3">
              {[
                { icon: '🍽️', text: 'Plano alimentar 100% personalizado' },
                { icon: '📊', text: 'Relatorios semanais e tendencias' },
                { icon: '📸', text: 'Registo de fotos de progresso' },
                { icon: '🛒', text: 'Lista de compras automatica' },
                { icon: '💡', text: 'Sugestoes inteligentes de refeicoes' },
                { icon: '📄', text: 'Exportar plano em PDF' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-white/80 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/vitalis/pagamento"
            className="block w-full text-center py-4 px-6 rounded-2xl font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #7C8B6F 0%, #5A6B4F 100%)' }}
          >
            Subscrever Vitalis
          </Link>

          <Link
            to="/vitalis/dashboard"
            className="block w-full text-center py-3 mt-3 text-[#A8B89A]/70 text-sm hover:text-[#A8B89A] transition-colors"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Mostrar aviso se subscricao vai expirar em breve
  const showExpiryWarning = accessInfo?.expiresAt &&
    new Date(accessInfo.expiresAt) - new Date() < 14 * 24 * 60 * 60 * 1000; // 14 dias

  const renewalIncentive = accessInfo?.expiresAt ? getRenewalIncentive(accessInfo.expiresAt) : null;

  return (
    <>
      {/* Banner de trial com dias restantes */}
      {isTrial && (
        <div className="bg-[#7C8B6F]/20 border-b border-[#7C8B6F]/30 px-4 py-2 text-center">
          <p className="text-[#A8B89A] text-sm">
            Trial gratuito - {accessInfo.daysLeft || 0} dias restantes.{' '}
            <Link to="/vitalis/pagamento" className="underline font-medium text-white">Subscrever agora</Link>
          </p>
        </div>
      )}

      {/* Banner de renovacao com incentivo/desconto */}
      {showExpiryWarning && !isTrial && accessInfo.status !== SUBSCRIPTION_STATUS.TESTER && (
        <div className={`${renewalIncentive ? 'bg-green-500/20 border-green-500/30' : 'bg-yellow-500/20 border-yellow-500/30'} border-b px-4 py-2 text-center`}>
          <p className={`${renewalIncentive ? 'text-green-200' : 'text-yellow-200'} text-sm`}>
            {renewalIncentive ? (
              <>
                {renewalIncentive.label}: {renewalIncentive.discount_pct}% desconto na renovacao!{' '}
                <Link to="/vitalis/pagamento" className="underline font-medium">Renovar agora</Link>
              </>
            ) : (
              <>
                A tua subscricao expira em {Math.ceil((new Date(accessInfo.expiresAt) - new Date()) / (24 * 60 * 60 * 1000))} dias.{' '}
                <Link to="/vitalis/pagamento" className="underline font-medium">Renovar agora</Link>
              </>
            )}
          </p>
        </div>
      )}

      {/* Banner para pagamento pendente */}
      {accessInfo?.status === SUBSCRIPTION_STATUS.PENDING && (
        <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-2 text-center">
          <p className="text-blue-200 text-sm">
            O teu pagamento esta em verificacao. Recebes confirmacao em breve!
          </p>
        </div>
      )}

      {/* Conteudo protegido */}
      {children}
    </>
  );
};

export default VitalisAccessGuard;
