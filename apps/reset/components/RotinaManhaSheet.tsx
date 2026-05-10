'use client'

// Painel único da manhã · peso / sono / fim de jejum / intestino / treino
// Pensado para ela registar tudo em ~30s sem saltar entre páginas.

import { useEffect, useState } from 'react'
import { X, Weight, Moon, Sun, Activity, Check } from 'lucide-react'
import { isoDate } from '@/lib/dates'
import {
  savePeso,
  getDia,
  saveDia,
  getJejuns,
  saveJejum,
  pesoUltimo,
  toggleAncora
} from '@/lib/storage'
import { cn } from '@/lib/utils'

type Props = { onClose: () => void }

export default function RotinaManhaSheet({ onClose }: Props) {
  const hojeIso = isoDate()
  const dia = getDia(hojeIso)
  const ultPeso = pesoUltimo()

  const [peso, setPeso] = useState<string>('')
  const [sonoHoras, setSonoHoras] = useState<string>(dia.sonoHoras !== null ? String(dia.sonoHoras) : '')
  const [qualSono, setQualSono] = useState<number | null>(dia.qualidadeSono)
  const [acordou, setAcordou] = useState<string>(dia.acordouVezes !== null ? String(dia.acordouVezes) : '')
  const [horaQuebra, setHoraQuebra] = useState<string>('')
  const [intestino, setIntestino] = useState<'sim' | 'nao' | null>(dia.transitoIntestinal ?? null)
  const [treinoFeito, setTreinoFeito] = useState<boolean>(!!dia.ancoras['treino_feito'])
  const [estado, setEstado] = useState<'edit' | 'saving' | 'done'>('edit')

  // Detecta jejum em curso para oferecer 'comi às'
  const jejumEmCurso = (() => {
    const all = getJejuns()
    return all.find(j => j.ultimaRefeicao && !j.primeiraRefeicao)
  })()

  useEffect(() => {
    // hint inicial · hora actual
    if (jejumEmCurso) {
      const d = new Date()
      setHoraQuebra(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    }
  }, [])

  const guardar = () => {
    setEstado('saving')

    // 1. Peso
    const p = parseFloat(peso.replace(',', '.'))
    if (!Number.isNaN(p) && p > 20 && p < 250) {
      const agora = new Date()
      savePeso({
        date: hojeIso,
        peso: p,
        hora: `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`,
        cintura: null,
        notas: ''
      })
    }

    // 2. Sono · acumula no dia
    const sH = parseFloat(sonoHoras.replace(',', '.'))
    const aV = parseInt(acordou)
    const dia_log = getDia(hojeIso)
    saveDia({
      ...dia_log,
      sonoHoras: !Number.isNaN(sH) && sH > 0 && sH < 16 ? sH : dia_log.sonoHoras,
      qualidadeSono: qualSono ?? dia_log.qualidadeSono,
      acordouVezes: !Number.isNaN(aV) && aV >= 0 ? aV : dia_log.acordouVezes,
      transitoIntestinal: intestino ?? dia_log.transitoIntestinal
    })

    // 3. Fim de jejum (se há um em curso e ela meteu hora)
    if (jejumEmCurso && /^\d{1,2}:\d{2}$/.test(horaQuebra)) {
      const [h, m] = horaQuebra.split(':').map(Number)
      const d = new Date()
      d.setHours(h, m, 0, 0)
      if (d.getTime() > Date.now()) d.setDate(d.getDate() - 1)
      saveJejum({
        date: jejumEmCurso.date,
        ultimaRefeicao: jejumEmCurso.ultimaRefeicao,
        primeiraRefeicao: d.toISOString(),
        duracaoHoras: null,
        meta: jejumEmCurso.meta,
        completou: false
      })
    }

    // 4. Treino (toggle âncora se mudou)
    if (treinoFeito !== !!dia_log.ancoras['treino_feito']) {
      toggleAncora(hojeIso, 'treino_feito')
    }

    setEstado('done')
    setTimeout(onClose, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        className="card-feature w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <span className="label-cap">rotina · manhã</span>
            <p className="font-serif text-[20px] mt-1 leading-tight">tudo num só sítio</p>
          </div>
          <button onClick={onClose} className="text-faint active:scale-90"><X size={18} strokeWidth={1.5} /></button>
        </div>

        {/* Peso */}
        <Bloco icone={<Weight size={13} strokeWidth={1.5} />} titulo="peso" sub={ultPeso !== null ? `último: ${ultPeso}kg` : 'primeira pesagem'}>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder={ultPeso !== null ? String(ultPeso) : 'kg'}
            value={peso}
            onChange={e => setPeso(e.target.value)}
            className="w-full rounded-md border border-[var(--hair)] bg-transparent p-2.5 text-[16px] tnum focus:border-ouro focus:outline-none"
          />
        </Bloco>

        {/* Sono */}
        <Bloco icone={<Moon size={13} strokeWidth={1.5} />} titulo="sono" sub="ontem à noite">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              placeholder="horas"
              value={sonoHoras}
              onChange={e => setSonoHoras(e.target.value)}
              className="rounded-md border border-[var(--hair)] bg-transparent p-2.5 text-[15px] tnum focus:border-ouro focus:outline-none"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="acordou × vezes"
              value={acordou}
              onChange={e => setAcordou(e.target.value)}
              className="rounded-md border border-[var(--hair)] bg-transparent p-2.5 text-[15px] tnum focus:border-ouro focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setQualSono(qualSono === n ? null : n)}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-[12px] tnum transition-elegant active:scale-95',
                  qualSono === n ? 'bg-ouro text-tinta' : 'bg-[var(--surface-soft)] text-soft'
                )}
              >{n}</button>
            ))}
          </div>
          <p className="text-faint text-[10px] tracking-cap uppercase">qualidade /5</p>
        </Bloco>

        {/* Fim de jejum */}
        {jejumEmCurso ? (
          <Bloco icone={<Sun size={13} strokeWidth={1.5} />} titulo="fim do jejum" sub={`em curso desde ${new Date(jejumEmCurso.ultimaRefeicao!).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={horaQuebra}
                onChange={e => setHoraQuebra(e.target.value)}
                className="rounded-md border border-[var(--hair)] bg-transparent p-2.5 text-[15px] tnum focus:border-ouro focus:outline-none"
              />
              <button
                onClick={() => {
                  const d = new Date()
                  setHoraQuebra(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
                }}
                className="rounded-md bg-[var(--surface-soft)] py-2.5 text-[12px] text-soft active:scale-95"
              >agora</button>
            </div>
            <p className="text-faint text-[10px] leading-relaxed">deixa em branco se ainda não comeste.</p>
          </Bloco>
        ) : null}

        {/* Intestino */}
        <Bloco icone={<Activity size={13} strokeWidth={1.5} />} titulo="intestino" sub="hoje">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIntestino(intestino === 'sim' ? null : 'sim')}
              className={cn(
                'rounded-md py-2.5 text-[13px] transition-elegant active:scale-95',
                intestino === 'sim' ? 'bg-oliva text-creme' : 'bg-[var(--surface-soft)] text-soft'
              )}
            >sim</button>
            <button
              onClick={() => setIntestino(intestino === 'nao' ? null : 'nao')}
              className={cn(
                'rounded-md py-2.5 text-[13px] transition-elegant active:scale-95',
                intestino === 'nao' ? 'bg-tinta text-creme dark:bg-creme/30' : 'bg-[var(--surface-soft)] text-soft'
              )}
            >não</button>
          </div>
        </Bloco>

        {/* Treino */}
        <Bloco icone={<Activity size={13} strokeWidth={1.5} />} titulo="treino · hoje" sub="marca quando fizeres">
          <button
            onClick={() => setTreinoFeito(t => !t)}
            className={cn(
              'w-full rounded-md py-3 text-[14px] transition-elegant active:scale-95 flex items-center justify-center gap-2',
              treinoFeito ? 'bg-oliva text-creme' : 'bg-[var(--surface-soft)] text-soft'
            )}
          >
            {treinoFeito ? <Check size={14} strokeWidth={2} /> : null}
            {treinoFeito ? 'treino feito' : 'marcar treino feito'}
          </button>
        </Bloco>

        <div className="pt-2 sticky bottom-0 bg-[var(--bg-elev)]">
          <button
            onClick={guardar}
            disabled={estado !== 'edit'}
            className={cn(
              'btn-primary w-full',
              estado === 'done' && 'bg-oliva',
              estado !== 'edit' && 'opacity-70'
            )}
          >
            {estado === 'edit' ? 'guardar tudo' : estado === 'saving' ? 'a guardar...' : 'guardado ✓'}
          </button>
          <p className="text-faint text-[10.5px] text-center mt-2 leading-relaxed">
            só guarda os campos que preencheres · em branco fica como estava.
          </p>
        </div>
      </div>
    </div>
  )
}

function Bloco({ icone, titulo, sub, children }: { icone: React.ReactNode; titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <span className="text-ouro">{icone}</span>
          <span className="label-cap">{titulo}</span>
        </div>
        {sub ? <span className="text-faint text-[10.5px]">{sub}</span> : null}
      </div>
      {children}
    </div>
  )
}
