import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRecord, setUserRecord] = useState(null)
  const [vitalisAccess, setVitalisAccess] = useState(false)
  const [aureaAccess, setAureaAccess] = useState(false)

  // Garantir que utilizador existe na tabela users
  const ensureUserRecord = async (user) => {
    if (!user) return null
    try {
      await supabase.from('users').upsert({
        auth_id: user.id,
        email: user.email,
        created_at: new Date().toISOString()
      }, { onConflict: 'auth_id' })

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .maybeSingle()

      return userData
    } catch (error) {
      console.error('Erro ao sincronizar user:', error)
      return null
    }
  }

  // Verificar acesso aos módulos
  const checkModuleAccess = async (userId) => {
    if (!userId) {
      setVitalisAccess(false)
      setAureaAccess(false)
      return
    }

    const activeStatuses = ['active', 'trial', 'tester', 'pending']

    try {
      // Check Vitalis
      const { data: vitalisData } = await supabase
        .from('vitalis_clients')
        .select('subscription_status')
        .eq('user_id', userId)
        .maybeSingle()

      setVitalisAccess(vitalisData && activeStatuses.includes(vitalisData.subscription_status))

      // Check Aurea
      const { data: aureaData } = await supabase
        .from('aurea_clients')
        .select('subscription_status')
        .eq('user_id', userId)
        .maybeSingle()

      setAureaAccess(aureaData && activeStatuses.includes(aureaData.subscription_status))
    } catch (error) {
      console.error('Erro ao verificar acesso módulos:', error)
    }
  }

  // Refresh module access (can be called after subscription changes)
  const refreshAccess = async () => {
    if (userRecord?.id) {
      await checkModuleAccess(userRecord.id)
    }
  }

  // Load user record and module access in background (non-blocking)
  const loadUserData = async (user) => {
    if (!user) {
      setUserRecord(null)
      setVitalisAccess(false)
      setAureaAccess(false)
      return
    }
    try {
      const userData = await ensureUserRecord(user)
      setUserRecord(userData)
      await checkModuleAccess(userData?.id)
    } catch (error) {
      console.error('Erro ao carregar dados do utilizador:', error)
    }
  }

  useEffect(() => {
    // Get initial session - set loading false IMMEDIATELY, load extras in background
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session?.user) {
        loadUserData(session.user)
      }
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      loadUserData(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      user: session?.user || null,
      userRecord,
      vitalisAccess,
      aureaAccess,
      refreshAccess
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export default AuthContext
