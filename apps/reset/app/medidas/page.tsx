'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { addMedida, getMedidas, type MedidaRegisto } from '@/lib/storage'
import { isoDate, fromIso, formatarData } from '@/lib/dates'
import { cn } from '@/lib/utils'

export default function MedidasPage() {
  const [medidas, setMedidas] = useState<MedidaRegisto[]>([])
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    setMedidas(getMedidas())
    const refresh = () => setMedidas(getMedidas())
    window.addEventListener('reset:storage', refresh)
    return () => window.removeEventListener('reset:storage', refresh)
  }, [])

  const ultima = medidas[medidas.length - 1]
  const primeira = medidas[0]
  const variacao = (campo: keyof MedidaRegisto): number | null => {
    if (!primeira || !ultima || primeira.id === ultima.id) return null
    const a = primeira[campo] as number | null
    const b = ultima[campo] as number | null
    if (a === null || b === null) return null
    return Math.round((b - a) * 10) / 10
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="label-cap">Medidas</p>
        <h1 className="titulo-serif text-3xl sm:text-4xl">a fita não mente</h1>
        <div className="mx-auto divisor-ouro" aria-hidden />
        <p className="mx-auto max-w-xs text-xs text-cinza">balança opcional · cintura é o que importa</p>
      </header>

      <button onClick={() => setAberto(true)} className="btn-ouro w-full gap-2">
        <Plus size={16} />
        Nova medição
      </button>

      {medidas.length >= 2 ? (
        <section className="card-solid space-y-3">
          <span className="label-cap">Variação total</span>
          <div className="grid grid-cols-2 gap-3">
            <Variacao label="Cintura" valor={variacao('cintura')} unit="cm" />
            <Variacao label="Ancas" valor={variacao('ancas')} unit="cm" />
            <Variacao label="Coxa" valor={variacao('coxa')} unit="cm" />
            <Variacao label="Braço" valor={variacao('braco')} unit="cm" />
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <span className="label-cap px-1">Histórico</span>
        {medidas.length === 0 ? (
          <div className="card text-center text-sm text-cinza">
            sem medições ainda. <br />
            faz a primeira agora — ponto de partida.
          </div>
        ) : (
          <ul className="space-y-2">
            {[...medidas].reverse().map(m => (
              <li key={m.id} className="card-solid">
                <div className="flex items-baseline justify-between">
                  <p className="font-serif text-base text-castanho">{formatarData(fromIso(m.date), true)}</p>
                  {m.peso ? <span className="text-xs text-cinza">{m.peso}kg</span> : null}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {m.cintura ? <Linha label="Cintura" v={m.cintura} /> : null}
                  {m.ancas ? <Linha label="Ancas" v={m.ancas} /> : null}
                  {m.coxa ? <Linha label="Coxa" v={m.coxa} /> : null}
                  {m.braco ? <Linha label="Braço" v={m.braco} /> : null}
                </div>
                {m.sentir ? (
                  <p className="mt-3 border-t border-creme-escuro pt-2 text-sm italic text-cinza">&ldquo;{m.sentir}&rdquo;</p>
                ) : null}
                {m.mudou ? <p className="mt-1 text-sm text-castanho/70">{m.mudou}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {aberto ? <NovaMedidaSheet onClose={() => setAberto(false)} onSave={() => setAberto(false)} /> : null}
    </div>
  )
}

function Linha({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-cinza">{label}</span>
      <span className="font-serif text-castanho">
        {v}
        <span className="ml-0.5 text-xs text-cinza">cm</span>
      </span>
    </div>
  )
}

function Variacao({ label, valor, unit }: { label: string; valor: number | null; unit: string }) {
  if (valor === null)
    return (
      <div>
        <span className="label-cap">{label}</span>
        <p className="font-serif text-2xl text-cinza">—</p>
      </div>
    )
  const positivo = valor > 0
  const zero = valor === 0
  return (
    <div>
      <span className="label-cap">{label}</span>
      <p className={cn('font-serif text-2xl', zero ? 'text-cinza' : positivo ? 'text-terracota' : 'text-oliva')}>
        {positivo ? '+' : ''}
        {valor}
        <span className="ml-1 text-xs text-cinza">{unit}</span>
      </p>
    </div>
  )
}

function NovaMedidaSheet({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [data, setData] = useState({
    date: isoDate(),
    cintura: '',
    ancas: '',
    coxa: '',
    braco: '',
    peso: '',
    sentir: '',
    mudou: ''
  })

  const submit = () => {
    addMedida({
      date: data.date,
      cintura: data.cintura ? Number(data.cintura) : null,
      ancas: data.ancas ? Number(data.ancas) : null,
      coxa: data.coxa ? Number(data.coxa) : null,
      braco: data.braco ? Number(data.braco) : null,
      peso: data.peso ? Number(data.peso) : null,
      sentir: data.sentir.trim(),
      mudou: data.mudou.trim()
    })
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-castanho/40 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl bg-creme p-5 shadow-xl animate-slide-up sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="titulo-serif text-xl">Nova medição</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-2 text-cinza hover:bg-creme-escuro">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Data">
            <input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} className="input-base" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cintura (cm)">
              <input type="number" inputMode="decimal" step="0.5" value={data.cintura} onChange={e => setData({ ...data, cintura: e.target.value })} className="input-base" placeholder="—" />
            </Field>
            <Field label="Ancas (cm)">
              <input type="number" inputMode="decimal" step="0.5" value={data.ancas} onChange={e => setData({ ...data, ancas: e.target.value })} className="input-base" placeholder="—" />
            </Field>
            <Field label="Coxa (cm)">
              <input type="number" inputMode="decimal" step="0.5" value={data.coxa} onChange={e => setData({ ...data, coxa: e.target.value })} className="input-base" placeholder="—" />
            </Field>
            <Field label="Braço (cm)">
              <input type="number" inputMode="decimal" step="0.5" value={data.braco} onChange={e => setData({ ...data, braco: e.target.value })} className="input-base" placeholder="—" />
            </Field>
          </div>
          <Field label="Peso (kg) · opcional">
            <input type="number" inputMode="decimal" step="0.1" value={data.peso} onChange={e => setData({ ...data, peso: e.target.value })} className="input-base" placeholder="—" />
          </Field>
          <Field label="Como te sentes hoje">
            <textarea rows={2} value={data.sentir} onChange={e => setData({ ...data, sentir: e.target.value })} className="input-base resize-none" placeholder="uma frase, sem julgamento" />
          </Field>
          <Field label="O que mudou desde a última">
            <textarea rows={2} value={data.mudou} onChange={e => setData({ ...data, mudou: e.target.value })} className="input-base resize-none" placeholder="roupa, energia, espelho..." />
          </Field>
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">cancelar</button>
          <button onClick={submit} className="btn-ouro flex-1">guardar</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-cap mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}
