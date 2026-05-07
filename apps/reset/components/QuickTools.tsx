'use client'

import { useEffect, useState } from 'react'
import { Scale, Clock, Droplet, Wine, UtensilsCrossed } from 'lucide-react'
import { getProfile } from '@/lib/profile'

type Tool = { href: string; label: string; icon: typeof Scale; soFeminino?: boolean }

// Coach já é a aba central da nav com destaque · scanner está em "aprofundar".
// Aqui só ferramentas de registo rápido que abres todos os dias.
const TODAS: Tool[] = [
  { href: '/refeicoes', label: 'refeições', icon: UtensilsCrossed },
  { href: '/peso', label: 'peso', icon: Scale },
  { href: '/jejum', label: 'jejum', icon: Clock },
  { href: '/ciclo', label: 'ciclo', icon: Droplet, soFeminino: true },
  { href: '/alcool', label: 'copo', icon: Wine }
]

export default function QuickTools() {
  const [sexo, setSexo] = useState<'F' | 'M' | 'O'>('F')

  useEffect(() => {
    setSexo(getProfile().sexo)
    const onUpdate = () => setSexo(getProfile().sexo)
    window.addEventListener('fenixfit:profile', onUpdate)
    return () => window.removeEventListener('fenixfit:profile', onUpdate)
  }, [])

  const itens = TODAS.filter(t => !t.soFeminino || sexo !== 'M')

  return (
    <section className="space-y-2">
      <span className="label-cap px-1">acesso rápido</span>
      <div
        className="grid gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${itens.length}, minmax(0, 1fr))` }}
      >
        {itens.map(t => {
          const Icon = t.icon
          return (
            <a
              key={t.href}
              href={t.href}
              className="card-solid flex flex-col items-center justify-center gap-1.5 !p-3 transition-elegant hover:shadow-hair-strong active:scale-95"
            >
              <Icon size={16} strokeWidth={1.3} className="text-ouro" />
              <span className="font-serif text-[11.5px] tracking-editorial text-soft">{t.label}</span>
            </a>
          )
        })}
      </div>
    </section>
  )
}

