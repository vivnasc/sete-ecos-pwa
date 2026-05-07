'use client'

import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

const ESCONDIDA = ['/coach', '/login', '/onboarding', '/limpar', '/logos']

export default function QuickLog() {
  const path = usePathname() || '/'
  if (ESCONDIDA.some(p => path.startsWith(p))) return null

  return (
    <a
      href="/coach"
      aria-label="Abrir coach"
      className="fab"
      title="fala com a coach"
    >
      <MessageCircle size={20} strokeWidth={1.6} />
    </a>
  )
}
