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

// Verifica se há token guardado em localStorage · evita redirect para /login
// quando getSession() ainda não respondeu (ligação lenta).
function temTokenLocal(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem('fenixfit:auth')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return Boolean(parsed?.access_token || parsed?.currentSession?.access_token)
  } catch { return false }
}

// Lê a sessão guardada em localStorage para uso optimista enquanto getSession()
// ainda corre. Se o token estiver expirado o autoRefreshToken trata disso.
function lerSessaoLocal(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('fenixfit:auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const s = parsed?.currentSession ?? parsed
    if (s?.access_token && s?.user) return s as Session
    return null
  } catch { return null }
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  // Sessão optimista: lê do localStorage logo ao montar para abrir a app
  // imediatamente. getSession() valida em background.
  const [session, setSession] = useState<Session | null>(() => lerSessaoLocal())
  const [loading, setLoading] = useState(false)
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

    // Hard timeout: 12s · em ligações lentas o getSession pode demorar.
    // Mesmo que dispare, o redirect agora respeita o token em localStorage.
    const hardTimeout = setTimeout(() => {
      console.warn('[fenixfit] auth timeout · libertando app')
      setLoading(false)
      setHidratado(true)
    }, 12000)

    const init = async () => {
      try {
        const { data } = await sb.auth.getSession()
        if (data.session) {
          setSession(data.session)
          await hidratarComTimeout()
        } else if (!temTokenLocal()) {
          // Não há sessão E não há token guardado · realmente desautenticada
          setSession(null)
        }
        // else: mantém sessão optimista, supabase autoRefresh trata em background
      } catch (e) {
        console.error('[fenixfit] auth init falhou:', e)
      } finally {
        clearTimeout(hardTimeout)
        setLoading(false)
        setHidratado(true)
      }
    }
    init()

    const { data: sub } = sb.auth.onAuthStateChange((event, sess) => {
      // INITIAL_SESSION: só actualiza se trouxer sessão · não sobrescreve a
      // que já temos com null em race conditions.
      if (event === 'INITIAL_SESSION' && !sess) return
      setSession(sess)
      if (sess) {
        setHidratado(false)
        hidratarComTimeout().finally(() => setHidratado(true))
      } else if (event === 'SIGNED_OUT') {
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
    // Só redireciona para /login se não houver sessão actual E não houver token
    // guardado · evita falsos logouts em ligações lentas e em navegação com
    // full reload onde a sessão demora a hidratar.
    if (!session && !temTokenLocal() && !publica) router.replace('/login')
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
