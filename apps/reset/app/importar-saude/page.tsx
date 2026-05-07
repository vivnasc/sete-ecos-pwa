'use client'

import { useState } from 'react'
import { Upload, Check, AlertCircle, FileText } from 'lucide-react'
import BackButton from '@/components/BackButton'
import { getDia, saveDia } from '@/lib/storage'

type EntradaPreview = {
  date: string
  steps?: number
  rhr?: number
  sonoHoras?: number
}

// Aceita formatos flexíveis:
// 1. { steps: [{date, value}], sleep: [{date, hours}], rhr: [{date, value}] }
// 2. Auto Health Export-like: { data: { metrics: [...] } }
// 3. Array simples [{ date, steps?, rhr?, sleep_hours? }]
function parsearJson(json: unknown): EntradaPreview[] {
  const mapa = new Map<string, EntradaPreview>()
  const meter = (date: string, patch: Partial<EntradaPreview>) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return
    const cur = mapa.get(date) ?? { date }
    Object.assign(cur, patch)
    mapa.set(date, cur)
  }

  if (Array.isArray(json)) {
    json.forEach((item: unknown) => {
      const e = item as Record<string, unknown>
      const d = String(e.date ?? e.day ?? '')
      if (!d) return
      meter(d, {
        steps: typeof e.steps === 'number' ? e.steps : undefined,
        rhr: typeof e.rhr === 'number' ? e.rhr : typeof e.resting_heart_rate === 'number' ? e.resting_heart_rate : undefined,
        sonoHoras: typeof e.sleep_hours === 'number' ? e.sleep_hours : typeof e.sleep === 'number' ? e.sleep : undefined
      })
    })
  } else if (json && typeof json === 'object') {
    const obj = json as Record<string, unknown>
    // Formato 1
    if (Array.isArray(obj.steps)) {
      obj.steps.forEach((s: unknown) => {
        const e = s as Record<string, unknown>
        meter(String(e.date ?? ''), { steps: typeof e.value === 'number' ? e.value : Number(e.value) || undefined })
      })
    }
    if (Array.isArray(obj.sleep)) {
      obj.sleep.forEach((s: unknown) => {
        const e = s as Record<string, unknown>
        meter(String(e.date ?? ''), { sonoHoras: typeof e.hours === 'number' ? e.hours : Number(e.hours) || undefined })
      })
    }
    if (Array.isArray(obj.rhr)) {
      obj.rhr.forEach((s: unknown) => {
        const e = s as Record<string, unknown>
        meter(String(e.date ?? ''), { rhr: typeof e.value === 'number' ? e.value : Number(e.value) || undefined })
      })
    }
    // Formato Auto Health Export · { data: { metrics: [{ name, units, data }] } }
    const metrics = (obj.data as { metrics?: Array<Record<string, unknown>> } | undefined)?.metrics
    if (Array.isArray(metrics)) {
      metrics.forEach(m => {
        const nome = String(m.name ?? '').toLowerCase()
        const datapoints = Array.isArray(m.data) ? m.data : []
        datapoints.forEach((dp: unknown) => {
          const p = dp as Record<string, unknown>
          const d = String(p.date ?? '').slice(0, 10)
          if (!d) return
          if (nome.includes('step')) meter(d, { steps: Number(p.qty) || undefined })
          else if (nome.includes('sleep') && nome.includes('asleep')) meter(d, { sonoHoras: Number(p.qty) ? Number(p.qty) / 60 : undefined })
          else if (nome.includes('resting') && nome.includes('heart')) meter(d, { rhr: Number(p.qty) || undefined })
        })
      })
    }
  }

  return [...mapa.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export default function ImportarSaudePage() {
  const [preview, setPreview] = useState<EntradaPreview[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [importado, setImportado] = useState<number | null>(null)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setErro(null)
    setImportado(null)
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const json = JSON.parse(String(ev.target?.result ?? ''))
        const entradas = parsearJson(json)
        if (entradas.length === 0) {
          setErro('não encontrei dados reconhecíveis no ficheiro')
          setPreview([])
        } else {
          setPreview(entradas)
        }
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'JSON inválido')
        setPreview([])
      }
    }
    reader.readAsText(file)
  }

  const importar = () => {
    let n = 0
    preview.forEach(e => {
      const dia = getDia(e.date)
      if (e.steps !== undefined) dia.steps = Math.round(e.steps)
      if (e.rhr !== undefined) dia.rhr = Math.round(e.rhr)
      if (e.sonoHoras !== undefined) dia.sonoHoras = Math.round(e.sonoHoras * 10) / 10
      saveDia(dia)
      n++
    })
    setImportado(n)
    setPreview([])
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">importar saúde</p>
        <h1 className="font-serif text-[36px] font-light leading-[1.05] tracking-editorial sm:text-[44px]">
          do iPhone para aqui
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          passos · sono · ritmo cardíaco em repouso · de Apple Health ou wearable.
        </p>
      </header>

      <section className="card-feature space-y-3">
        <span className="label-cap">como exportar do iPhone</span>
        <ol className="list-decimal pl-5 space-y-2 text-soft text-[12.5px] leading-relaxed">
          <li>
            instala a app gratuita <em>Auto Health Export</em> da App Store, ou usa um Shortcut
            (mais detalhe abaixo).
          </li>
          <li>configura para exportar os últimos 7 ou 30 dias em JSON.</li>
          <li>partilha o ficheiro contigo (AirDrop, email, iCloud Drive).</li>
          <li>abre aqui e carrega o JSON.</li>
        </ol>
        <details className="rounded-lg bg-[var(--surface-soft)] p-3">
          <summary className="label-cap cursor-pointer">ou faz um Shortcut próprio</summary>
          <ol className="list-decimal pl-5 space-y-1.5 mt-2 text-soft text-[11.5px] leading-relaxed">
            <li>app Shortcuts → novo Shortcut → adicionar acção &ldquo;Find Health Samples&rdquo;</li>
            <li>filtros: tipo = Steps, Resting Heart Rate, Sleep Analysis · últimos 7 dias</li>
            <li>acção &ldquo;Get Dictionary from Output&rdquo; → guardar como JSON em Files</li>
            <li>partilha o ficheiro JSON contigo</li>
          </ol>
        </details>
      </section>

      <label className="card-solid flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-elegant hover:bg-[var(--surface-soft)] active:scale-[0.99]">
        <Upload size={24} strokeWidth={1.3} className="text-ouro" />
        <span className="text-[13px] text-soft">escolher ficheiro JSON</span>
        <input type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
      </label>

      {erro ? (
        <div className="rounded-lg bg-terracota/10 p-3 text-[12px] text-terracota flex items-start gap-2">
          <AlertCircle size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          <span>{erro}</span>
        </div>
      ) : null}

      {importado !== null ? (
        <div className="rounded-lg bg-oliva/15 p-3 text-[12px] text-oliva flex items-center gap-2">
          <Check size={14} strokeWidth={1.6} />
          {importado} dias importados.
        </div>
      ) : null}

      {preview.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="label-cap">prévia · {preview.length} dias</span>
            <button onClick={importar} className="btn-primary px-4 py-2 text-[12px]">
              <FileText size={13} strokeWidth={1.5} /> importar
            </button>
          </div>
          <ul className="space-y-1.5 max-h-80 overflow-y-auto">
            {preview.map(e => (
              <li key={e.date} className="card-solid !p-3 flex items-baseline justify-between gap-3">
                <span className="font-serif text-[13.5px] tnum">{e.date}</span>
                <span className="text-faint text-[11.5px] tnum">
                  {e.steps !== undefined ? `${e.steps.toLocaleString('pt-PT')} passos · ` : ''}
                  {e.sonoHoras !== undefined ? `${e.sonoHoras.toFixed(1)}h sono · ` : ''}
                  {e.rhr !== undefined ? `${e.rhr} bpm` : ''}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-faint text-[10.5px] leading-relaxed">
            os campos sobrescrevem o que tens registado. notas e âncoras ficam como estão.
          </p>
        </section>
      ) : null}
    </div>
  )
}
