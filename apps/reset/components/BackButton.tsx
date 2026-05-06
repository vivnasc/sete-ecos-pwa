'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function BackButton({ to = '/mais', label = 'voltar' }: { to?: string; label?: string }) {
  const router = useRouter()

  const onClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(to)
    }
  }

  return (
    <button
      onClick={onClick}
      className="-ml-1 flex items-center gap-1 text-faint text-[12px] tracking-cap uppercase transition-elegant hover:text-soft active:scale-95"
      aria-label={label}
    >
      <ChevronLeft size={14} strokeWidth={1.5} />
      {label}
    </button>
  )
}
