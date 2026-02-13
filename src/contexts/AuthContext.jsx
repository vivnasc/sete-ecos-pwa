import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { isCoach } from '../lib/coach'

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
      }, { onConflict: 'auth_id' }).select('id')

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome, genero')
        .eq('auth_id', user.id)
        .maybeSingle()

      return userData
    } catch (error) {
      console.error('Erro ao sincronizar user:', error)
      return null
    }
  }

  // Verificar acesso aos módulos
  const checkModuleAccess = async (userId, userEmail) => {
    // Coaches têm acesso a todos os módulos
    if (isCoach(userEmail)) {
      setVitalisAccess(true)
      setAureaAccess(true)
      return
    }

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
    await checkModuleAccess(userRecord?.id, session?.user?.email)
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
      await checkModuleAccess(userData?.id, user.email)
    } catch (error) {
      console.error('Erro ao carregar dados do utilizador:', error)
    }
  }

  useEffect(() => {
    // Safety timeout - NEVER stay stuck on loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // onAuthStateChange fires INITIAL_SESSION immediately on setup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(safetyTimeout)
      setSession(session)
      setLoading(false)
      if (session?.user) {
        loadUserData(session.user)
      } else {
        setUserRecord(null)
        setVitalisAccess(false)
        setAureaAccess(false)
      }
    })

    return () => {
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      user: session?.user || null,
      userRecord,
      vitalisAccess,
      aureaAccess,
      isCoachUser: isCoach(session?.user?.email),
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
