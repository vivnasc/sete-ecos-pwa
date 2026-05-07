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

// Timeout curto: 4s para hidratação, app não fica presa
function hidratarComTimeout(ms = 4000): Promise<void> {
  return Promise.race([
    hidratarTudo().then(() => {}),
    new Promise<void>(resolve => setTimeout(resolve, ms))
  ])
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [hidratado, setHidratado] = useState(false)
  const [tempoEspera, setTempoEspera] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const configurado = supabaseConfigurado()

  useEffect(() => {
    if (!configurado) {
      setLoading(false)
      setHidratado(true)
      return
    }

    let sb
    try {
      sb = getSupabase()
    } catch (e) {
      console.error('[fenixfit] supabase init falhou:', e)
      setLoading(false)
      setHidratado(true)
      return
    }
    if (!sb) {
      setLoading(false)
      setHidratado(true)
      return
    }

    // Hard timeout reduzido: 5s
    const hardTimeout = setTimeout(() => {
      console.warn('[fenixfit] auth timeout · libertando app')
      setLoading(false)
      setHidratado(true)
    }, 5000)

    const init = async () => {
      try {
        const { data } = await sb.auth.getSession()
        setSession(data.session)
        setLoading(false)
        if (data.session) {
          await hidratarComTimeout()
        }
      } catch (e) {
        console.error('[fenixfit] auth init falhou:', e)
        setLoading(false)
      } finally {
        clearTimeout(hardTimeout)
        setHidratado(true)
      }
    }
    init()

    const { data: sub } = sb.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      if (sess) {
        setHidratado(false)
        hidratarComTimeout().finally(() => setHidratado(true))
      } else {
        setHidratado(true)
      }
    })

    return () => {
      clearTimeout(hardTimeout)
      sub.subscription.unsubscribe()
    }
  }, [configurado])

  // Conta segundos de espera para mostrar botão de skip
  useEffect(() => {
    if (!loading) return
    const i = setInterval(() => setTempoEspera(t => t + 1), 1000)
    return () => clearInterval(i)
  }, [loading])

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
    const forcarAbrir = () => {
      setLoading(false)
      setHidratado(true)
    }
    return (
      <div className="container-app flex min-h-[80vh] flex-col items-center justify-center gap-6">
        <div className="h-2 w-2 animate-breathe rounded-full bg-ouro" />
        <p className="label-soft">a abrir{tempoEspera > 1 ? ` · ${tempoEspera}s` : ''}</p>
        {tempoEspera >= 3 ? (
          <div className="space-y-3 text-center animate-fade-in">
            <p className="text-faint text-[12px] max-w-[280px] leading-relaxed">
              está a demorar mais do que devia.
            </p>
            <button onClick={forcarAbrir} className="btn-primary text-[12px]">
              continuar mesmo assim
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <AuthCtx.Provider value={{ session, loading, configurado, hidratado }}>
      {children}
    </AuthCtx.Provider>
  )
}
