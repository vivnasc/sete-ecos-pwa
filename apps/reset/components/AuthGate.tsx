'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getSupabase, supabaseConfigurado } from '@/lib/supabase'
import { hidratarTudo } from '@/lib/sync'
import type { Session } from '@supabase/supabase-js'

const AuthCtx = createContext<{
  session: Session | null
  loading: boolean
  configurado: boolean
  hidratado: boolean
}>({
  session: null,
  loading: true,
  configurado: false,
  hidratado: false
})

export function useAuth() {
  return useContext(AuthCtx)
}

const ROTAS_PUBLICAS = ['/login', '/sobre']

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hidratado, setHidratado] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const configurado = supabaseConfigurado()

  useEffect(() => {
    if (!configurado) {
      setLoading(false)
      setHidratado(true)
      return
    }
    const sb = getSupabase()
    if (!sb) {
      setLoading(false)
      setHidratado(true)
      return
    }

    const init = async () => {
      const { data } = await sb.auth.getSession()
      setSession(data.session)
      setLoading(false)
      if (data.session) {
        await hidratarTudo()
      }
      setHidratado(true)
    }
    init()

    const { data: sub } = sb.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      if (sess) {
        setHidratado(false)
        hidratarTudo().finally(() => setHidratado(true))
      } else {
        setHidratado(true)
      }
    })

    return () => { sub.subscription.unsubscribe() }
  }, [configurado])

  useEffect(() => {
    if (loading) return
    if (!configurado) return
    const publica = ROTAS_PUBLICAS.includes(pathname || '')
    if (!session && !publica) router.replace('/login')
    if (session && publica) router.replace('/')
  }, [session, loading, pathname, router, configurado])

  if (!configurado) {
    return (
      <AuthCtx.Provider value={{ session: null, loading: false, configurado: false, hidratado: true }}>
        {children}
      </AuthCtx.Provider>
    )
  }

  if (loading) {
    return (
      <div className="container-app flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <div className="h-2 w-2 animate-breathe rounded-full bg-ouro" />
        <p className="label-soft">a abrir</p>
      </div>
    )
  }

  return (
    <AuthCtx.Provider value={{ session, loading, configurado, hidratado }}>
      {children}
    </AuthCtx.Provider>
  )
}
