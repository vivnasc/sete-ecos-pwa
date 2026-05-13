'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, X, Camera, Trash2 } from 'lucide-react'
import { addMedida, getMedidas, type MedidaRegisto } from '@/lib/storage'
import BackButton from '@/components/BackButton'
import ComposicaoCorporal from '@/components/ComposicaoCorporal'
import { isoDate, fromIso, formatarData } from '@/lib/dates'
import { cn } from '@/lib/utils'

async function comprimirFoto(file: File, maxLado = 800, qualidade = 0.82): Promise<string> {
  const img = new Image()
  const url = URL.createObjectURL(file)
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('imagem inválida'))
    img.src = url
  })
  const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
  const w = Math.round(img.width * escala)
  const h = Math.round(img.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas sem contexto')
  ctx.drawImage(img, 0, 0, w, h)
  URL.revokeObjectURL(url)
  return canvas.toDataURL('image/jpeg', qualidade)
}

export default function MedidasPage() {
  const [medidas, setMedidas] = useState<MedidaRegisto[]>([])
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    setMedidas(getMedidas())
    const refresh = () => setMedidas(getMedidas())
    window.addEventListener('fenixfit:storage', refresh)
    return () => window.removeEventListener('fenixfit:storage', refresh)
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
    <div className="space-y-7 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">medidas</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          a fita não mente
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px]">balança opcional · cintura é o que importa</p>
      </header>

      <ComposicaoCorporal />

      <button onClick={() => setAberto(true)} className="btn-primary w-full">
        <Plus size={14} strokeWidth={1.6} /> nova medição
      </button>

      <AntesDepois medidas={medidas} />

      {medidas.length >= 2 ? (
        <section className="card-solid">
          <span className="label-cap">Variação</span>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
            <Variacao label="Cintura" valor={variacao('cintura')} />
            <Variacao label="Ancas" valor={variacao('ancas')} />
            <Variacao label="Coxa" valor={variacao('coxa')} />
            <Variacao label="Braço" valor={variacao('braco')} />
            <Variacao label="Pescoço" valor={variacao('pescoco')} />
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <span className="label-cap px-1">Histórico</span>
        {medidas.length === 0 ? (
          <div className="card text-center">
            <p className="text-soft text-[13px]">sem medições ainda.</p>
            <p className="text-faint mt-1 text-[12px]">a primeira é o teu ponto de partida.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {[...medidas].reverse().map(m => (
              <li key={m.id} className="card-solid">
                <div className="flex items-baseline justify-between">
                  <p className="font-serif text-[16px] tracking-editorial">{formatarData(fromIso(m.date), true)}</p>
                  {m.peso ? <span className="text-faint text-[12px] tnum">{m.peso} kg</span> : null}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                  {m.cintura !== null ? <Linha label="Cintura" v={m.cintura} /> : null}
                  {m.ancas !== null ? <Linha label="Ancas" v={m.ancas} /> : null}
                  {m.coxa !== null ? <Linha label="Coxa" v={m.coxa} /> : null}
                  {m.braco !== null ? <Linha label="Braço" v={m.braco} /> : null}
                  {m.pescoco !== null ? <Linha label="Pescoço" v={m.pescoco} /> : null}
                </div>
                {m.sentir ? (
                  <p className="mt-3 border-t border-[var(--hair)] pt-3 text-[13px] italic text-soft">
                    &ldquo;{m.sentir}&rdquo;
                  </p>
                ) : null}
                {m.mudou ? <p className="text-soft mt-1 text-[13px]">{m.mudou}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {aberto ? <NovaMedidaSheet onClose={() => setAberto(false)} onSave={() => setAberto(false)} /> : null}
    </div>
  )
}

function AntesDepois({ medidas }: { medidas: MedidaRegisto[] }) {
  const comFoto = medidas.filter(m => m.fotoUrl)
  if (comFoto.length < 2) {
    if (comFoto.length === 1) {
      return (
        <section className="card-solid space-y-3">
          <span className="label-cap">primeira foto</span>
          <img src={comFoto[0].fotoUrl ?? ''} alt="" className="w-full rounded-lg" />
          <p className="text-faint text-[11px] text-center">tira uma segunda foto noutro dia para comparares.</p>
        </section>
      )
    }
    return null
  }
  const primeira = comFoto[0]
  const ultima = comFoto[comFoto.length - 1]
  const dias = Math.round((new Date(ultima.date).getTime() - new Date(primeira.date).getTime()) / 86400000)
  return (
    <section className="card-solid space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="label-cap">antes · depois</span>
        <span className="text-faint text-[11px]">{dias} dias</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <p className="text-faint text-[10px] uppercase tracking-cap text-center">{formatarData(fromIso(primeira.date), true)}</p>
          <img src={primeira.fotoUrl ?? ''} alt="antes" className="w-full rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <p className="text-ouro text-[10px] uppercase tracking-cap text-center">{formatarData(fromIso(ultima.date), true)}</p>
          <img src={ultima.fotoUrl ?? ''} alt="depois" className="w-full rounded-lg" />
        </div>
      </div>
      {primeira.cintura !== null && ultima.cintura !== null ? (
        <p className="text-soft text-[12.5px] text-center italic">
          cintura: {primeira.cintura}cm → {ultima.cintura}cm
          {' · '}
          <span className={ultima.cintura < primeira.cintura ? 'text-oliva' : ultima.cintura > primeira.cintura ? 'text-terracota' : 'text-faint'}>
            {ultima.cintura > primeira.cintura ? '+' : ''}{(ultima.cintura - primeira.cintura).toFixed(1)}cm
          </span>
        </p>
      ) : null}
    </section>
  )
}

function Linha({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[var(--hair)] pb-1">
      <span className="text-faint text-[11px] uppercase tracking-cap">{label}</span>
      <span className="font-serif text-[16px] tnum">
        {v}
        <span className="ml-0.5 text-[10px] text-faint">cm</span>
      </span>
    </div>
  )
}

function Variacao({ label, valor }: { label: string; valor: number | null }) {
  if (valor === null) {
    return (
      <div>
        <span className="label-cap">{label}</span>
        <p className="font-serif text-[24px] text-faint">—</p>
      </div>
    )
  }
  const positivo = valor > 0
  const zero = valor === 0
  return (
    <div>
      <span className="label-cap">{label}</span>
      <p className={cn('editorial-num text-[24px]', zero ? 'text-faint' : positivo ? 'text-terracota' : 'text-oliva')}>
        {positivo ? '+' : ''}
        {valor}
        <span className="ml-1 text-[10px] text-faint">cm</span>
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
    pescoco: '',
    peso: '',
    sentir: '',
    mudou: ''
  })
  const [foto, setFoto] = useState<string | null>(null)
  const fotoRef = useRef<HTMLInputElement>(null)

  const onFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const compressed = await comprimirFoto(file)
      setFoto(compressed)
    } catch {
      window.alert('não consegui ler a foto')
    }
  }

  const submit = () => {
    addMedida({
      date: data.date,
      cintura: data.cintura ? Number(data.cintura) : null,
      ancas: data.ancas ? Number(data.ancas) : null,
      coxa: data.coxa ? Number(data.coxa) : null,
      braco: data.braco ? Number(data.braco) : null,
      pescoco: data.pescoco ? Number(data.pescoco) : null,
      peso: data.peso ? Number(data.peso) : null,
      sentir: data.sentir.trim(),
      mudou: data.mudou.trim(),
      fotoUrl: foto
    })
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/40 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl bg-[var(--bg-elev)] p-6 shadow-ink animate-slide-up sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-[22px] font-light tracking-editorial">nova medição</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-faint hover:opacity-70">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Data">
            <input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} className="input-base text-[14px]" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cintura · cm">
              <input type="number" inputMode="decimal" step="0.5" value={data.cintura} onChange={e => setData({ ...data, cintura: e.target.value })} className="input-base text-[14px]" placeholder="—" />
            </Field>
            <Field label="Ancas · cm">
              <input type="number" inputMode="decimal" step="0.5" value={data.ancas} onChange={e => setData({ ...data, ancas: e.target.value })} className="input-base text-[14px]" placeholder="—" />
            </Field>
            <Field label="Coxa · cm">
              <input type="number" inputMode="decimal" step="0.5" value={data.coxa} onChange={e => setData({ ...data, coxa: e.target.value })} className="input-base text-[14px]" placeholder="—" />
            </Field>
            <Field label="Braço · cm">
              <input type="number" inputMode="decimal" step="0.5" value={data.braco} onChange={e => setData({ ...data, braco: e.target.value })} className="input-base text-[14px]" placeholder="—" />
            </Field>
            <Field label="Pescoço · cm">
              <input type="number" inputMode="decimal" step="0.5" value={data.pescoco} onChange={e => setData({ ...data, pescoco: e.target.value })} className="input-base text-[14px]" placeholder="—" />
            </Field>
          </div>
          <p className="text-faint text-[10.5px] leading-relaxed -mt-2">
            cintura · à volta do umbigo · não apertar.<br />
            ancas · ponto mais largo das nádegas.<br />
            pescoço · logo abaixo da maçã de adão · fita horizontal.
          </p>
          <Field label="Peso · kg · opcional">
            <input type="number" inputMode="decimal" step="0.1" value={data.peso} onChange={e => setData({ ...data, peso: e.target.value })} className="input-base text-[14px]" placeholder="—" />
          </Field>
          <Field label="Como te sentes">
            <textarea rows={2} value={data.sentir} onChange={e => setData({ ...data, sentir: e.target.value })} className="input-base resize-none text-[14px]" placeholder="uma frase, sem julgamento" />
          </Field>
          <Field label="O que mudou">
            <textarea rows={2} value={data.mudou} onChange={e => setData({ ...data, mudou: e.target.value })} className="input-base resize-none text-[14px]" placeholder="roupa, energia, espelho..." />
          </Field>

          {/* Foto de progresso */}
          <div>
            <span className="label-cap mb-1.5 block">Foto de progresso · opcional</span>
            {foto ? (
              <div className="relative">
                <img src={foto} alt="preview" className="w-full rounded-lg" />
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  aria-label="remover foto"
                  className="absolute top-2 right-2 rounded-full bg-tinta/80 p-1.5 text-creme backdrop-blur"
                >
                  <Trash2 size={12} strokeWidth={1.6} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fotoRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-[var(--hair-strong)] py-6 text-soft transition-elegant hover:bg-[var(--surface-soft)] active:scale-95"
              >
                <Camera size={16} strokeWidth={1.4} />
                <span className="text-[12.5px]">tirar foto</span>
              </button>
            )}
            <input
              ref={fotoRef}
              type="file"
              accept="image/*"
              
              onChange={onFoto}
              className="hidden"
            />
            <p className="text-faint mt-1.5 text-[10.5px] leading-relaxed">
              tira sempre na mesma posição e luz para o antes/depois ser comparável.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">cancelar</button>
          <button onClick={submit} className="btn-primary flex-1">guardar</button>
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
