import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { checkAureaAccess, SUBSCRIPTION_STATUS } from '../../lib/aurea/subscriptions';
import { isCoach } from '../../lib/coach';

/**
 * ÁUREA ACCESS GUARD
 *
 * Componente que verifica se o utilizador tem acesso ao ÁUREA.
 * Se não tiver, redireciona para a página de pagamento.
 *
 * Fluxo:
 * 1. User vai para /aurea/dashboard (ou outra página protegida)
 * 2. AureaAccessGuard verifica se tem subscrição activa ou trial
 * 3. Se SIM -> mostra o conteúdo
 * 4. Se NAO -> redireciona para /aurea/pagamento
 *
 * Status com acesso:
 * - tester (acesso permanente)
 * - active (pagamento confirmado)
 * - trial (7 dias grátis)
 * - pending (aguarda confirmação - acesso temporário)
 */

const AureaAccessGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // Verificar se está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Bypass - coaches têm acesso directo
      if (isCoach(user.email)) {
        setAccessInfo({ hasAccess: true, status: 'bypass', reason: 'bypass_email' });
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Obter o ID do utilizador na tabela users
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Verificar acesso ao ÁUREA
      const access = await checkAureaAccess(userData.id);
      setAccessInfo(access);
      setHasAccess(access.hasAccess);
    } catch (error) {
      console.error('Erro ao verificar acesso ÁUREA:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Loading state com visual dourado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-200">A verificar acesso...</p>
        </div>
      </div>
    );
  }

  // Sem acesso - redirecionar para pagamento
  if (!hasAccess) {
    return <Navigate to="/aurea/pagamento" state={{ from: location }} replace />;
  }

  // Calcular dias restantes para avisos
  const showExpiryWarning = accessInfo?.expiresAt &&
    new Date(accessInfo.expiresAt) - new Date() < 7 * 24 * 60 * 60 * 1000; // 7 dias

  const daysLeft = accessInfo?.daysLeft ||
    (accessInfo?.expiresAt ? Math.ceil((new Date(accessInfo.expiresAt) - new Date()) / (24 * 60 * 60 * 1000)) : null);

  return (
    <>
      {/* Banner de trial activo */}
      {accessInfo?.status === SUBSCRIPTION_STATUS.TRIAL && (
        <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center">
          <p className="text-amber-200 text-sm">
            ✨ Trial gratuito: {accessInfo.daysLeft} {accessInfo.daysLeft === 1 ? 'dia' : 'dias'} restantes.{' '}
            <a href="/aurea/pagamento" className="underline font-medium hover:text-amber-100">
              Subscrever agora
            </a>
          </p>
        </div>
      )}

      {/* Banner de aviso de expiração (não trial) */}
      {showExpiryWarning && accessInfo.status !== SUBSCRIPTION_STATUS.TESTER && accessInfo.status !== SUBSCRIPTION_STATUS.TRIAL && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 text-center">
          <p className="text-yellow-200 text-sm">
            A tua subscrição expira em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}.{' '}
            <a href="/aurea/pagamento" className="underline font-medium">Renovar agora</a>
          </p>
        </div>
      )}

      {/* Banner para pagamento pendente */}
      {accessInfo?.status === SUBSCRIPTION_STATUS.PENDING && (
        <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-2 text-center">
          <p className="text-blue-200 text-sm">
            O teu pagamento está em verificação. Recebes confirmação em breve!
          </p>
        </div>
      )}

      {/* Conteúdo protegido */}
      {children}
    </>
  );
};

export default AureaAccessGuard;
