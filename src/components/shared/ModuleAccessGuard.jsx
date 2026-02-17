import React, { useState, useEffect } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { checkEcoAccess, SUBSCRIPTION_STATUS, getEcoTheme } from '../../lib/shared/subscriptionPlans'
import { isCoach } from '../../lib/coach'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'

/**
 * MODULE ACCESS GUARD — Componente genérico de protecção de acesso
 *
 * Uso: <ModuleAccessGuard eco="serena">{children}</ModuleAccessGuard>
 *
 * Funciona para qualquer eco: serena, ignis, ventis, ecoa, imago
 * Verifica subscrição, mostra trial banner, redireciona para pagamento se necessário.
 */
const ModuleAccessGuard = ({ eco, children, features = [] }) => {
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [accessInfo, setAccessInfo] = useState(null)
  const location = useLocation()
  const { user, userRecord } = useAuth()
  const theme = getEcoTheme(eco)

  useEffect(() => {
    verifyAccess()
  }, [user, userRecord])

  const verifyAccess = async () => {
    try {
      if (!user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      // Coaches tem acesso directo a todos os ecos
      if (isCoach(user.email)) {
        setAccessInfo({ hasAccess: true, status: 'bypass', reason: 'bypass_email' })
        setHasAccess(true)
        setLoading(false)
        return
      }

      // Buscar userId
      let userId = userRecord?.id
      if (!userId) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle()
        userId = userData?.id
      }

      if (!userId) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      // Verificar acesso ao eco
      const access = await checkEcoAccess(eco, userId)
      setAccessInfo(access)
      setHasAccess(access.hasAccess)
    } catch (error) {
      console.error(`${theme.name}AccessGuard - erro:`, error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${theme.colorDark} 0%, ${theme.colorDark}dd 50%, ${theme.colorDark} 100%)` }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${theme.color}88`, borderTopColor: 'transparent' }}
          />
          <p style={{ color: `${theme.color}cc` }}>A verificar acesso...</p>
        </div>
      </div>
    )
  }

  // Pagamento pendente
  if (!hasAccess && accessInfo?.status === SUBSCRIPTION_STATUS.PENDING) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${theme.colorDark} 0%, ${theme.colorDark}ee 100%)` }}
      >
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl" role="img" aria-label="Ampulheta">&#9203;</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Pagamento em Análise</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Recebemos o teu registo de pagamento! A Coach Vivianne vai confirmar em até 24 horas.
          </p>
          <Link
            to={`/${eco}`}
            className="block w-full py-3 px-6 text-white rounded-xl font-semibold hover:shadow-lg transition-all mb-3"
            style={{ background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.colorDark} 100%)` }}
          >
            Voltar
          </Link>
          <a
            href={`https://wa.me/258851006473?text=Olá! Fiz um pagamento para o ${theme.name} e estou a aguardar aprovação.`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 px-6 bg-[#25D366] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Contactar Coach via WhatsApp
          </a>
        </div>
      </div>
    )
  }

  // Sem acesso — redirecionar para pagamento
  if (!hasAccess) {
    return <Navigate to={`/${eco}/pagamento`} state={{ from: location }} replace />
  }

  const isTrial = accessInfo?.status === SUBSCRIPTION_STATUS.TRIAL
  const daysLeft = accessInfo?.daysLeft || 0

  // Banner de aviso de expiração (14 dias antes)
  const showExpiryWarning = accessInfo?.expiresAt &&
    new Date(accessInfo.expiresAt) - new Date() < 14 * 24 * 60 * 60 * 1000

  return (
    <>
      {/* Banner de trial */}
      {isTrial && (
        <div
          className="border-b px-4 py-2 text-center"
          style={{
            background: `${theme.color}20`,
            borderColor: `${theme.color}30`
          }}
        >
          <p className="text-sm" style={{ color: `${theme.color}dd` }}>
            Trial gratuito — {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}.{' '}
            <Link to={`/${eco}/pagamento`} className="underline font-medium text-white">
              Subscrever agora
            </Link>
          </p>
        </div>
      )}

      {/* Banner de expiração */}
      {showExpiryWarning && !isTrial && accessInfo.status !== SUBSCRIPTION_STATUS.TESTER && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2 text-center">
          <p className="text-yellow-200 text-sm">
            A tua subscrição expira em {Math.ceil((new Date(accessInfo.expiresAt) - new Date()) / (24 * 60 * 60 * 1000))} dias.{' '}
            <Link to={`/${eco}/pagamento`} className="underline font-medium">Renovar agora</Link>
          </p>
        </div>
      )}

      {/* Banner pendente */}
      {accessInfo?.status === SUBSCRIPTION_STATUS.PENDING && (
        <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-2 text-center">
          <p className="text-blue-200 text-sm">
            O teu pagamento está em verificação. Recebes confirmação em breve!
          </p>
        </div>
      )}

      {children}
    </>
  )
}

export default ModuleAccessGuard
