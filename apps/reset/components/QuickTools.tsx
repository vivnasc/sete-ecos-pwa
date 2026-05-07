'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Scale, Clock, Droplet, Activity, MessageCircle, Wine } from 'lucide-react'
import { getProfile } from '@/lib/profile'

const TODAS = [
  { href: '/peso', label: 'peso', icon: Scale },
  { href: '/jejum', label: 'jejum', icon: Clock },
  { href: '/ciclo', label: 'ciclo', icon: Droplet, soFeminino: true },
  { href: '/scanner', label: 'scanner', icon: Activity },
  { href: '/coach', label: 'coach', icon: MessageCircle },
  { href: '/alcool', label: 'copo', icon: Wine }
] as const

export default function QuickTools() {
  const [sexo, setSexo] = useState<'F' | 'M' | 'O'>('F')

  useEffect(() => {
    setSexo(getProfile().sexo)
    const onUpdate = () => setSexo(getProfile().sexo)
    window.addEventListener('fenixfit:profile', onUpdate)
    return () => window.removeEventListener('fenixfit:profile', onUpdate)
  }, [])

  const itens = TODAS.filter(t => !('soFeminino' in t && t.soFeminino) || sexo !== 'M')

  return (
    <section className="space-y-2">
      <span className="label-cap px-1">acesso rápido</span>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {itens.map(t => {
          const Icon = t.icon
          return (
            <Link
              key={t.href}
              href={t.href}
              className="card-solid flex flex-col items-center justify-center gap-2 !p-4 transition-elegant hover:shadow-hair-strong active:scale-95"
            >
              <Icon size={18} strokeWidth={1.3} className="text-ouro" />
              <span className="font-serif text-[13px] tracking-editorial text-soft">{t.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
