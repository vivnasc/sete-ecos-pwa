/**
 * PadroesCard — mostra padrões detectados automaticamente
 * (sem chamada IA — lógica local em lib/vitalis/padroes.js).
 *
 * Apresentação editorial: lista de até 3 padrões com importância
 * codificada por cor (ouro = alta, ink-soft = média, faint = baixa).
 */

import { Eye } from 'lucide-react'

export default function PadroesCard({ padroes = [], titulo = 'o que se vê' }) {
  if (!padroes || padroes.length === 0) return null

  const top = padroes.slice(0, 3)

  return (
    <section className="fnx-card-solid" aria-label={titulo}>
      <div className="flex items-center gap-2 mb-3">
        <Eye size={14} strokeWidth={1.4} className="fnx-text-ouro" />
        <span className="fnx-label-cap">{titulo}</span>
      </div>

      <ul className="space-y-3 list-none p-0">
        {top.map(p => {
          const cor = p.importancia === 'alta'
            ? 'var(--fnx-ouro)'
            : p.importancia === 'media'
              ? 'var(--fnx-ink-soft)'
              : 'var(--fnx-ink-faint)'
          return (
            <li key={p.id} className="flex gap-3">
              <span
                aria-hidden
                className="mt-2 shrink-0"
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: cor
                }}
              />
              <p
                className="italic"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontWeight: 300,
                  fontSize: '14px',
                  lineHeight: 1.55,
                  color: cor
                }}
              >
                {p.texto}
              </p>
            </li>
          )
        })}
      </ul>

      {padroes.length > 3 && (
        <p
          className="fnx-text-faint mt-3 italic"
          style={{ fontSize: '11.5px', letterSpacing: '0.01em' }}
        >
          + {padroes.length - 3} {padroes.length - 3 === 1 ? 'outro' : 'outros'} {padroes.length - 3 === 1 ? 'padrão' : 'padrões'} subtis
        </p>
      )}
    </section>
  )
}
