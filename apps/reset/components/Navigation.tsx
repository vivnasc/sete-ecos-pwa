'use client'

import { usePathname } from 'next/navigation'
import { Home, Calendar, MessageCircle, Target, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Hoje', icon: Home },
  { href: '/diario', label: 'Diário', icon: Calendar },
  { href: '/coach', label: 'Coach', icon: MessageCircle, destaque: true },
  { href: '/plano', label: 'Plano', icon: Target },
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
        {links.map(item => {
          const { href, label, icon: Icon } = item
          const destaque = 'destaque' in item && item.destaque
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <a
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-md py-2 transition-elegant active:scale-95',
                  active ? 'text-tinta dark:text-creme' : 'text-faint hover:text-soft'
                )}
              >
                <span className={cn(
                  'flex items-center justify-center',
                  destaque && !active && 'rounded-full bg-ouro/10 p-1.5 -mt-0.5',
                  destaque && active && 'rounded-full bg-ouro p-1.5 -mt-0.5 text-creme dark:text-tinta'
                )}>
                  <Icon size={destaque ? 18 : 18} strokeWidth={1.3} aria-hidden />
                </span>
                <span className="text-[10px] tracking-wide">{label}</span>
                {active ? <span className="mt-0.5 h-px w-3 bg-ouro" aria-hidden /> : <span className="mt-0.5 h-px w-3 bg-transparent" />}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
