'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp, resetPassword } from '@/lib/auth'
import { supabaseConfigurado } from '@/lib/supabase'

type Modo = 'entrar' | 'criar' | 'recuperar'

export default function LoginPage() {
  const router = useRouter()
  const [modo, setModo] = useState<Modo>('entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const configurado = supabaseConfigurado()

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setInfo(null)
    setCarregando(true)

    if (modo === 'entrar') {
      const r = await signIn(email, password)
      if (r.error) setErro(traduzirErro(r.error))
      else router.replace('/')
    } else if (modo === 'criar') {
      const r = await signUp(email, password)
      if (r.error) setErro(traduzirErro(r.error))
      else setInfo('conta criada. confirma o email se aplicável e entra.')
    } else {
      const r = await resetPassword(email)
      if (r.error) setErro(traduzirErro(r.error))
      else setInfo('se essa conta existir, vai chegar email para recuperar.')
    }

    setCarregando(false)
  }

  if (!configurado) {
    return (
      <div className="container-app flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-serif text-3xl">a configurar</h1>
        <p className="text-soft max-w-[280px] text-[14px]">supabase ainda não está ligado. adiciona <span className="font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_URL</span> e <span className="font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> no Netlify e volta.</p>
      </div>
    )
  }

  return (
    <div className="container-app flex min-h-[80vh] flex-col justify-center gap-10 animate-fade-in py-10">
      <header className="text-center">
        <p className="label-cap mb-3">FénixFit</p>
        <h1 className="font-serif text-[44px] font-light leading-[1.1] tracking-editorial sm:text-5xl">
          {modo === 'entrar' && 'entrar'}
          {modo === 'criar' && 'criar conta'}
          {modo === 'recuperar' && 'recuperar'}
        </h1>
        <div className="mx-auto mt-4 h-px w-10 bg-ouro" aria-hidden />
      </header>

      <form onSubmit={submeter} className="space-y-4">
        <div>
          <label className="label-cap mb-2 block">email</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-base"
            placeholder="o teu email"
          />
        </div>

        {modo !== 'recuperar' ? (
          <div>
            <label className="label-cap mb-2 block">password</label>
            <input
              type="password"
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-base"
              placeholder={modo === 'criar' ? 'mínimo 8 caracteres' : 'a tua password'}
            />
          </div>
        ) : null}

        {erro ? <p className="text-[13px] text-terracota">{erro}</p> : null}
        {info ? <p className="text-[13px] text-oliva">{info}</p> : null}

        <button type="submit" disabled={carregando} className="btn-primary w-full">
          {carregando ? '...' : modo === 'entrar' ? 'entrar' : modo === 'criar' ? 'criar conta' : 'enviar link'}
        </button>
      </form>

      <div className="space-y-3 text-center">
        <div className="h-px w-full bg-[var(--hair)]" />
        {modo === 'entrar' ? (
          <>
            <button onClick={() => { setModo('criar'); setErro(null); setInfo(null) }} className="btn-ghost">
              não tens conta · criar
            </button>
            <button onClick={() => { setModo('recuperar'); setErro(null); setInfo(null) }} className="block w-full text-[12px] text-faint underline-offset-4 hover:underline">
              esqueci a password
            </button>
          </>
        ) : (
          <button onClick={() => { setModo('entrar'); setErro(null); setInfo(null) }} className="btn-ghost">
            voltar a entrar
          </button>
        )}
      </div>
    </div>
  )
}

function traduzirErro(msg: string): string {
  if (msg.toLowerCase().includes('invalid login')) return 'email ou password incorretos.'
  if (msg.toLowerCase().includes('user already')) return 'já existe conta com este email. entra em vez de criar.'
  if (msg.toLowerCase().includes('email rate')) return 'demasiadas tentativas. espera uns minutos.'
  if (msg.toLowerCase().includes('password')) return 'password tem de ter pelo menos 8 caracteres.'
  return msg
}
