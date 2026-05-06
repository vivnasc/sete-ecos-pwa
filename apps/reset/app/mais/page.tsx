'use client'

import Link from 'next/link'
import { ArrowUpRight, Salad, Dumbbell, Sparkles, Pencil, Ruler, Settings, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthGate'

const SECCOES = [
  {
    titulo: 'Práticas',
    items: [
      { href: '/medidas', label: 'Medidas', sub: 'cintura · ancas · foto', icon: Ruler },
      { href: '/desabafo', label: 'Desabafo', sub: 'só para ti', icon: Pencil },
      { href: '/insights', label: 'Insights', sub: 'leitura semanal', icon: Sparkles }
    ]
  },
  {
    titulo: 'Referências',
    items: [
      { href: '/receitas', label: 'Comer', sub: 'keto · janela 9–19h', icon: Salad },
      { href: '/treino', label: 'Treino', sub: '4× semana · 30min', icon: Dumbbell }
    ]
  }
]

export default function MaisPage() {
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()
  const { configurado, session } = useAuth()

  useEffect(() => {
    setEmail(session?.user?.email ?? null)
  }, [session])

  const sair = async () => {
    await signOut()
    router.replace('/login')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="space-y-2 pt-4">
        <p className="label-soft">mais</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">tudo o resto</h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
      </header>

      {SECCOES.map(s => (
        <section key={s.titulo} className="space-y-2">
          <span className="label-cap px-1">{s.titulo}</span>
          <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
            {s.items.map(item => (
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
      ))}

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

      <p className="text-faint text-center text-[11px]">reset · 60 dias</p>
    </div>
  )
}
