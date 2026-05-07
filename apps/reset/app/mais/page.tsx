'use client'

import Link from 'next/link'
import { ArrowUpRight, Salad, Dumbbell, Sparkles, Pencil, Ruler, Settings, LogOut, Scale, Clock, Droplet, Activity, MessageCircle, Image as ImageIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthGate'
import { getProfile } from '@/lib/profile'

export default function MaisPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [sexo, setSexo] = useState<'F' | 'M' | 'O'>('F')
  const router = useRouter()
  const { configurado, session } = useAuth()

  useEffect(() => {
    setEmail(session?.user?.email ?? null)
    setSexo(getProfile().sexo)
  }, [session])

  const sair = async () => {
    await signOut()
    router.replace('/login')
  }

  const trackingItems = [
    { href: '/peso', label: 'Peso', sub: 'pesagem diária · tendência', icon: Scale },
    { href: '/jejum', label: 'Jejum', sub: 'janela 9–19h · streak', icon: Clock },
    ...(sexo !== 'M' ? [{ href: '/ciclo', label: 'Ciclo', sub: 'fases · sintomas · correlações', icon: Droplet }] : []),
    { href: '/medidas', label: 'Medidas', sub: 'cintura · ancas · foto', icon: Ruler }
  ]

  const praticas = [
    { href: '/scanner', label: 'Scanner', sub: 'análise multi-variável · padrões cruzados', icon: Activity },
    { href: '/coach', label: 'Coach', sub: 'conversa com os teus dados · IA', icon: MessageCircle },
    { href: '/desabafo', label: 'Desabafo', sub: 'só para ti', icon: Pencil },
    { href: '/insights', label: 'Insights', sub: 'leitura semanal', icon: Sparkles }
  ]

  const referencias = [
    { href: '/receitas', label: 'Comer', sub: 'keto · janela 9–19h', icon: Salad },
    { href: '/treino', label: 'Treino', sub: '4× semana · 30min', icon: Dumbbell },
    { href: '/logos', label: 'Marca', sub: '3 logos · escolhe um', icon: ImageIcon }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="space-y-2 pt-4">
        <p className="label-soft">mais</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">tudo o resto</h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
      </header>

      <Seccao titulo="Tracking" itens={trackingItems} />
      <Seccao titulo="Práticas" itens={praticas} />
      <Seccao titulo="Referências" itens={referencias} />

      <section className="space-y-2">
        <span className="label-cap px-1">Conta</span>
        <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
          <li>
            <Link
              href="/definicoes"
              className="flex items-center gap-4 px-5 py-4 transition-elegant hover:bg-[var(--surface-soft)]"
            >
              <Settings size={18} strokeWidth={1.3} className="text-soft" />
              <div className="flex-1">
                <p className="font-serif text-[17px]">Definições</p>
                <p className="text-faint text-[12px]">tema · perfil · lembretes · backup</p>
              </div>
              <ArrowUpRight size={16} strokeWidth={1.3} className="text-faint" />
            </Link>
          </li>
          {configurado && session ? (
            <li>
              <button
                onClick={sair}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-elegant hover:bg-[var(--surface-soft)]"
              >
                <LogOut size={18} strokeWidth={1.3} className="text-soft" />
                <div className="flex-1">
                  <p className="font-serif text-[17px]">Sair</p>
                  <p className="text-faint text-[12px]">{email ?? ''}</p>
                </div>
              </button>
            </li>
          ) : null}
        </ul>
      </section>

      <p className="text-faint text-center text-[11px]">fénixfit · 60 dias</p>
    </div>
  )
}

type Item = { href: string; label: string; sub: string; icon: typeof Scale }

function Seccao({ titulo, itens }: { titulo: string; itens: Item[] }) {
  return (
    <section className="space-y-2">
      <span className="label-cap px-1">{titulo}</span>
      <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
        {itens.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-4 px-5 py-4 transition-elegant hover:bg-[var(--surface-soft)]"
            >
              <item.icon size={18} strokeWidth={1.3} className="text-ouro" />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[17px]">{item.label}</p>
                <p className="text-faint text-[12px]">{item.sub}</p>
              </div>
              <ArrowUpRight size={16} strokeWidth={1.3} className="text-faint" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
