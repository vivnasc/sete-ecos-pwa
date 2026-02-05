import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { checkVitalisAccess, SUBSCRIPTION_STATUS } from '../../lib/subscriptions';
import { isCoach } from '../../lib/coach';

/**
 * VITALIS ACCESS GUARD
 *
 * Componente que verifica se o utilizador tem acesso ao Vitalis.
 * Se nao tiver, redireciona para a pagina de pagamento.
 *
 * Fluxo:
 * 1. User vai para /vitalis/dashboard (ou outra pagina protegida)
 * 2. VitalisAccessGuard verifica se tem subscricao ativa
 * 3. Se SIM -> mostra o conteudo
 * 4. Se NAO -> redireciona para /vitalis/pagamento
 *
 * Status com acesso:
 * - tester (acesso permanente)
 * - active (pagamento confirmado)
 * - pending (aguarda confirmacao - acesso temporario)
 */

const VitalisAccessGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // Verificar se esta autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Bypass emails têm acesso directo
      if (isCoach(user.email)) {
        // Garantir que coach tem registo na tabela users
        const { data: coachUser } = await supabase
          .from('users')
          .upsert({
            auth_id: user.id,
            email: user.email,
            nome: user.user_metadata?.name || user.email.split('@')[0]
          }, { onConflict: 'auth_id' })
          .select('id')
          .single();

        if (coachUser) {
          // Garantir que coach tem registo vitalis_clients com status tester
          await supabase
            .from('vitalis_clients')
            .upsert({
              user_id: coachUser.id,
              subscription_status: 'tester',
              status: 'activo'
            }, { onConflict: 'user_id' });
        }

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
        .maybeSingle();

      if (!userData) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Verificar acesso ao Vitalis
      const access = await checkVitalisAccess(userData.id);
      setAccessInfo(access);
      setHasAccess(access.hasAccess);
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
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
  if (!hasAccess) {
    // Se nao tem cliente Vitalis ainda, pode ir para intake primeiro? Ou direto para pagamento?
    // Decisao: direto para pagamento, porque o intake so faz sentido depois de pagar
    return <Navigate to="/vitalis/pagamento" state={{ from: location }} replace />;
  }

  // Mostrar aviso se subscricao vai expirar em breve
  const showExpiryWarning = accessInfo?.expiresAt &&
    new Date(accessInfo.expiresAt) - new Date() < 7 * 24 * 60 * 60 * 1000; // 7 dias

  return (
    <>
      {/* Banner de aviso de expiracao */}
      {showExpiryWarning && accessInfo.status !== SUBSCRIPTION_STATUS.TESTER && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 text-center">
          <p className="text-yellow-200 text-sm">
            ⚠️ A tua subscricao expira em {accessInfo.daysLeft || Math.ceil((new Date(accessInfo.expiresAt) - new Date()) / (24 * 60 * 60 * 1000))} dias.{' '}
            <a href="/vitalis/pagamento" className="underline font-medium">Renovar agora</a>
          </p>
        </div>
      )}

      {/* Banner para pagamento pendente */}
      {accessInfo?.status === SUBSCRIPTION_STATUS.PENDING && (
        <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-2 text-center">
          <p className="text-blue-200 text-sm">
            ⏳ O teu pagamento esta em verificacao. Recebes confirmacao em breve!
          </p>
        </div>
      )}

      {/* Conteudo protegido */}
      {children}
    </>
  );
};

export default VitalisAccessGuard;
