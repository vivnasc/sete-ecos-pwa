'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Ruler, Wine, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Hoje', icon: Home },
  { href: '/diario', label: 'Diário', icon: Calendar },
  { href: '/medidas', label: 'Medidas', icon: Ruler },
  { href: '/alcool', label: 'Copo', icon: Wine },
  { href: '/desabafo', label: 'Desabafo', icon: BookOpen }
] as const

export default function Navigation() {
  const path = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ouro/20 bg-creme/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="container-app flex justify-between gap-1 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path?.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl py-2 transition active:scale-95',
                  active ? 'text-ouro' : 'text-castanho/50 hover:text-castanho/70'
                )}
              >
                <Icon size={20} strokeWidth={1.6} aria-hidden />
                <span className="text-[10px] tracking-wide">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
