'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { getUltimoErroSync } from '@/lib/sync'

const KEY_DISMISS = 'fenixfit:syncErrorDismiss'

export default function SyncErrorBanner() {
  const [erro, setErro] = useState<{ area: string; msg: string; at: string } | null>(null)
  const [dismissedAt, setDismissedAt] = useState<string | null>(null)

  useEffect(() => {
    setErro(getUltimoErroSync())
    setDismissedAt(typeof window !== 'undefined' ? localStorage.getItem(KEY_DISMISS) : null)
    const onErr = (e: Event) => {
      const detail = (e as CustomEvent).detail as { area: string; msg: string; at: string } | null
      setErro(detail)
    }
    window.addEventListener('fenixfit:syncError', onErr)
    return () => window.removeEventListener('fenixfit:syncError', onErr)
  }, [])

  if (!erro) return null
  // Se já dispensou este erro específico (mesmo timestamp), esconde
  if (dismissedAt === erro.at) return null

  const fechar = () => {
    if (typeof window === 'undefined') return
    localStorage.setItem(KEY_DISMISS, erro.at)
    setDismissedAt(erro.at)
  }

  // Detectar erros típicos para mensagem mais útil
  const colunaInexistente = /column .* does not exist|Could not find the .* column/i.test(erro.msg)
  const tabelaInexistente = /relation .* does not exist|Could not find the table/i.test(erro.msg)
  const titulo = colunaInexistente || tabelaInexistente
    ? 'sync falhou · falta migração SQL'
    : 'sync falhou'
  const dica = colunaInexistente || tabelaInexistente
    ? 'aplica as migrações em apps/reset/CONTEXT.md no SQL editor do Supabase'
    : `${erro.area}: ${erro.msg.slice(0, 90)}`

  return (
    <div className="fixed top-0 inset-x-0 z-50 px-3 pt-[env(safe-area-inset-top)]">
      <div className="container-app pt-2">
        <div className="rounded-lg bg-terracota/15 border border-terracota/30 px-3 py-2 flex items-start gap-2 backdrop-blur">
          <AlertTriangle size={14} strokeWidth={1.6} className="text-terracota shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] text-terracota font-medium">{titulo}</p>
            <p className="text-[10.5px] text-soft mt-0.5 leading-relaxed">{dica}</p>
            <p className="text-[10px] text-faint mt-0.5">os dados estão guardados localmente · só falhou enviar para o servidor</p>
          </div>
          <button onClick={fechar} aria-label="dispensar" className="shrink-0 p-0.5 text-faint hover:text-soft">
            <X size={12} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  )
}
