'use client'

import { useState } from 'react'
import { Plus, X, Wine, Pencil, Coffee } from 'lucide-react'
import Link from 'next/link'

export default function QuickLog() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label="Abrir registo rápido"
        className="fab"
      >
        <Plus size={22} strokeWidth={1.6} />
      </button>

      {aberto ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/30 backdrop-blur-sm sm:items-center" onClick={() => setAberto(false)}>
          <div
            className="w-full max-w-md rounded-t-2xl bg-[var(--bg-elev)] p-6 pb-8 shadow-ink animate-slide-up sm:rounded-2xl"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-[22px] font-light tracking-editorial">registo rápido</h2>
              <button onClick={() => setAberto(false)} aria-label="Fechar" className="rounded-full p-1 text-faint hover:opacity-80">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-2">
              <Atalho href="/alcool" Icone={Wine} titulo="Caderno antes do copo" sub="emoção · gatilho · decides" tone="terracota" onClose={() => setAberto(false)} />
              <Atalho href="/desabafo" Icone={Pencil} titulo="Desabafo" sub="só para ti · sem respostas" tone="ink" onClose={() => setAberto(false)} />
              <Atalho href="/diario" Icone={Coffee} titulo="Registar dia" sub="âncoras · sono · energia" tone="ouro" onClose={() => setAberto(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function Atalho({
  href,
  Icone,
  titulo,
  sub,
  tone,
  onClose
}: {
  href: string
  Icone: typeof Wine
  titulo: string
  sub: string
  tone: 'terracota' | 'ink' | 'ouro'
  onClose: () => void
}) {
  const colors = { terracota: 'text-terracota', ink: 'text-tinta dark:text-creme-escuro', ouro: 'text-ouro' }
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-4 rounded-lg p-3 transition-elegant hover:bg-[var(--surface-soft)]"
    >
      <Icone size={20} strokeWidth={1.4} className={colors[tone]} />
      <div className="flex-1">
        <p className="font-serif text-[16px]">{titulo}</p>
        <p className="text-faint text-[12px]">{sub}</p>
      </div>
    </Link>
  )
}
