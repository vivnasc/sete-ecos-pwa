/**
 * MarcoCard — selo editorial discreto que celebra dias-marco
 * da jornada da cliente (7, 14, 21, 30, 45, 60, 90, 120, 180, 365).
 *
 * Aparece no Dashboard apenas no DIA do marco. Não persiste —
 * desaparece no dia seguinte. A celebração celebrada vai para o
 * AchievementsPanel via state habitual.
 */

import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'

const MARCOS = [
  { dia: 7, label: 'primeira semana', mensagem: 'a primeira é a mais difícil. estás cá.' },
  { dia: 14, label: 'duas semanas', mensagem: 'o hábito está a desenhar-se.' },
  { dia: 21, label: 'vinte e um dias', mensagem: 'já é teu. já não pensas — fazes.' },
  { dia: 30, label: 'um mês', mensagem: 'olha para trás. mudaste muito mais do que vês.' },
  { dia: 45, label: 'mês e meio', mensagem: 'estás na fase onde os outros desistem. tu, não.' },
  { dia: 60, label: 'dois meses', mensagem: 'o corpo já regista. dá-lhe tempo de te mostrar.' },
  { dia: 90, label: 'três meses', mensagem: 'já não é um plano. é a tua forma de viver.' },
  { dia: 120, label: 'quatro meses', mensagem: 'a constância está a falar por ti.' },
  { dia: 180, label: 'meio ano', mensagem: 'meio caminho de uma vida nova.' },
  { dia: 365, label: 'um ano', mensagem: 'um ano. és outra mulher.' }
]

export default function MarcoCard({ dataInicio }) {
  const marcoHoje = useMemo(() => {
    if (!dataInicio) return null
    const inicio = new Date(dataInicio)
    if (isNaN(inicio.getTime())) return null
    const agora = new Date()
    const dia = Math.floor((agora - inicio) / 86400000) + 1
    return MARCOS.find(m => m.dia === dia) || null
  }, [dataInicio])

  if (!marcoHoje) return null

  return (
    <section
      className="fnx-card-feature relative overflow-hidden fnx-fade-in"
      aria-label={`Marco do dia ${marcoHoje.dia} da jornada`}
    >
      {/* Selo decorativo subtil */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 fnx-breathe"
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, color-mix(in srgb, var(--fnx-ouro) 22%, transparent) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div className="relative flex items-start gap-3">
        <Sparkles size={18} strokeWidth={1.4} className="fnx-text-ouro shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="fnx-label-cap">marco do dia</span>
          <h3
            className="fnx-text-ink mt-1"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: '22px',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}
          >
            <em style={{ fontWeight: 300 }}>{marcoHoje.label}</em>
          </h3>
          <p
            className="fnx-text-soft mt-2 italic"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 300,
              fontSize: '14.5px',
              lineHeight: 1.55
            }}
          >
            {marcoHoje.mensagem}
          </p>
          <div
            aria-hidden
            className="mt-3"
            style={{ height: '1px', width: '24px', background: 'var(--fnx-ouro)' }}
          />
        </div>
        <div className="text-right">
          <p
            className="fnx-editorial-num fnx-tnum"
            style={{ fontSize: '40px', lineHeight: 1, color: 'var(--fnx-ouro)' }}
          >
            {marcoHoje.dia}
          </p>
          <p className="fnx-label-soft mt-1">dia</p>
        </div>
      </div>
    </section>
  )
}

// Para outras partes da app saberem se hoje é um dia de marco
export function eMarcoHoje(dataInicio) {
  if (!dataInicio) return null
  const inicio = new Date(dataInicio)
  if (isNaN(inicio.getTime())) return null
  const dia = Math.floor((new Date() - inicio) / 86400000) + 1
  return MARCOS.find(m => m.dia === dia) || null
}
