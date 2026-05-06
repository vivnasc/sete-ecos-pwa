'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, BarChart3, Wine, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Hoje', icon: Home },
  { href: '/diario', label: 'Diário', icon: Calendar },
  { href: '/metricas', label: 'Sinais', icon: BarChart3 },
  { href: '/alcool', label: 'Copo', icon: Wine },
  { href: '/mais', label: 'Mais', icon: MoreHorizontal }
] as const

const ESCONDIDA = ['/login', '/onboarding']

export default function Navigation() {
  const path = usePathname() || '/'

  if (ESCONDIDA.some(p => path.startsWith(p))) return null

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--hair)] bg-[var(--bg)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="container-app flex items-stretch justify-between gap-1 py-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-md py-2 transition-elegant active:scale-95',
                  active ? 'text-tinta dark:text-creme' : 'text-faint hover:text-soft'
                )}
              >
                <Icon size={18} strokeWidth={1.3} aria-hidden />
                <span className="text-[10px] tracking-wide">{label}</span>
                {active ? <span className="mt-0.5 h-px w-3 bg-ouro" aria-hidden /> : <span className="mt-0.5 h-px w-3 bg-transparent" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
