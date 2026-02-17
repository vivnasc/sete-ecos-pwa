import React, { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { checkAuroraAccess, AURORA_CONFIG } from '../../lib/aurora/subscriptions'
import { isCoach } from '../../lib/coach'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'

/**
 * AURORA ACCESS GUARD — Aurora é gratuita, desbloqueia ao completar todos os 7 ecos.
 * Não redireciona para pagamento — mostra progresso dos ecos completados.
 */
const AuroraAccessGuard = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [accessInfo, setAccessInfo] = useState(null)
  const { user, userRecord } = useAuth()

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

      // Coaches têm acesso directo
      if (isCoach(user.email)) {
        setAccessInfo({ hasAccess: true, status: 'bypass', reason: 'bypass_email' })
        setHasAccess(true)
        setLoading(false)
        return
      }

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

      const access = await checkAuroraAccess(userId)
      setAccessInfo(access)
      setHasAccess(access.hasAccess)
    } catch (error) {
      console.error('AuroraAccessGuard - erro:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  // Loading
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #2e1a1a 0%, #2e1a1add 50%, #2e1a1a 100%)' }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#D4A5A588', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#D4A5A5cc' }}>A verificar acesso...</p>
        </div>
      </div>
    )
  }

  // Sem acesso — mostrar progresso dos ecos (não redireciona para pagamento)
  if (!hasAccess) {
    const ecosCompleted = accessInfo?.ecosCompleted || []
    const ecosRemaining = accessInfo?.ecosRemaining || AURORA_CONFIG.REQUIRED_ECOS
    const count = accessInfo?.count || 0
    const total = AURORA_CONFIG.ECOS_REQUIRED

    const ecoNames = {
      vitalis: { name: 'Vitalis', icon: '🌿', color: '#7C8B6F' },
      aurea: { name: 'Áurea', icon: '✨', color: '#C4A265' },
      serena: { name: 'Serena', icon: '🌊', color: '#6B8E9B' },
      ignis: { name: 'Ignis', icon: '🔥', color: '#C1634A' },
      ventis: { name: 'Ventis', icon: '🍃', color: '#5D9B84' },
      ecoa: { name: 'Ecoa', icon: '🗣️', color: '#4A90A4' },
      imago: { name: 'Imago', icon: '🔮', color: '#8B7BA5' }
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #2e1a1a 0%, #3e2a2a 50%, #2e1a1a 100%)' }}
      >
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-[#D4A5A5]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">☀️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Aurora — A Tua Recompensa
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            A Aurora é <strong>gratuita</strong> e desbloqueia automaticamente quando completares todos os 7 ecos.
            Já completaste <strong>{count} de {total}</strong>.
          </p>

          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${(count / total) * 100}%`,
                background: 'linear-gradient(135deg, #D4A5A5, #a07070)'
              }}
            />
          </div>

          {/* Lista de ecos */}
          <div className="grid grid-cols-1 gap-2 mb-6 text-left">
            {AURORA_CONFIG.REQUIRED_ECOS.map(eco => {
              const info = ecoNames[eco]
              const completed = ecosCompleted.includes(eco)
              return (
                <div
                  key={eco}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="text-xl">{info.icon}</span>
                  <span className={`font-medium ${completed ? 'text-green-700' : 'text-gray-500'}`}>
                    {info.name}
                  </span>
                  <span className="ml-auto">
                    {completed ? '✅' : '🔒'}
                  </span>
                </div>
              )
            })}
          </div>

          {ecosRemaining.length > 0 && (
            <Link
              to={`/${ecosRemaining[0]}`}
              className="block w-full py-3 px-6 text-white rounded-xl font-semibold hover:shadow-lg transition-all mb-3"
              style={{ background: `linear-gradient(135deg, ${ecoNames[ecosRemaining[0]]?.color || '#D4A5A5'}, #333)` }}
            >
              Continuar com {ecoNames[ecosRemaining[0]]?.name || ecosRemaining[0]}
            </Link>
          )}

          <Link
            to="/landing"
            className="block w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Ver todos os ecos
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuroraAccessGuard
