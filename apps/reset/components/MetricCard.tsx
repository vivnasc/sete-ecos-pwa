import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: string | number
  unit?: string
  hint?: string
  tone?: 'ouro' | 'oliva' | 'terracota' | 'castanho'
}

const toneClasses: Record<NonNullable<Props['tone']>, string> = {
  ouro: 'text-ouro',
  oliva: 'text-oliva',
  terracota: 'text-terracota',
  castanho: 'text-castanho'
}

export default function MetricCard({ label, value, unit, hint, tone = 'ouro' }: Props) {
  return (
    <div className="card-solid flex flex-col gap-1">
      <span className="label-cap">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('font-serif text-3xl leading-none sm:text-4xl', toneClasses[tone])}>{value}</span>
        {unit ? <span className="text-sm text-cinza">{unit}</span> : null}
      </div>
      {hint ? <span className="text-xs text-cinza">{hint}</span> : null}
    </div>
  )
}
