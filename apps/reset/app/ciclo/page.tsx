'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Droplet, Moon, Sun, Sparkles } from 'lucide-react'
import {
  getCiclos,
  saveCiclo,
  diaActualCiclo,
  faseActualCiclo,
  nomeFase,
  getAlcoolRegistos,
  getTodosDias,
  type CicloLog,
  type CicloFase
} from '@/lib/storage'
import { isoDate, fromIso, formatarData } from '@/lib/dates'
import { getProfile } from '@/lib/profile'
import { cn } from '@/lib/utils'

const SINTOMAS = ['cabeça', 'mama', 'cólica', 'inchaço', 'fadiga', 'irritação', 'tristeza', 'ansiedade', 'acne', 'sono fragmentado'] as const
const CRAVINGS = ['açúcar', 'salgado', 'álcool', 'chocolate', 'gordura', 'carbohidratos'] as const

export default function CicloPage() {
  const [ciclos, setCiclos] = useState<CicloLog[]>([])
  const [aberto, setAberto] = useState(false)
  const [profile, setProfile] = useState(getProfile())

  useEffect(() => {
    setCiclos(getCiclos())
    setProfile(getProfile())
    const refresh = () => {
      setCiclos(getCiclos())
      setProfile(getProfile())
    }
    window.addEventListener('fenixfit:storage', refresh)
    window.addEventListener('fenixfit:profile', refresh)
    return () => {
      window.removeEventListener('fenixfit:storage', refresh)
      window.removeEventListener('fenixfit:profile', refresh)
    }
  }, [])

  const dia = useMemo(() => diaActualCiclo(), [ciclos])
  const fase = useMemo(() => faseActualCiclo(), [ciclos])
  const correlacoes = useMemo(() => calcularCorrelacoes(ciclos), [ciclos])

  // Hide for males
  if (profile.sexo === 'M') {
    return (
      <div className="container-app pt-10">
        <p className="text-soft text-center text-[14px]">esta secção não se aplica.</p>
      </div>
    )
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="space-y-2 pt-4">
        <p className="label-soft">ciclo</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          o teu corpo em fases
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
      </header>

      {/* Estado actual */}
      {dia !== null && fase !== null ? (
        <section className="card-feature text-center">
          <span className="label-cap">hoje</span>
          <p className="editorial-num mt-3 text-[60px] leading-none">
            dia {dia}
          </p>
          <p className="font-serif mt-3 text-[20px] italic text-ouro tracking-editorial">
            {nomeFase(fase)}
          </p>
          <div className="mx-auto mt-4 h-px w-8 bg-ouro" aria-hidden />
          <p className="text-soft mt-4 text-[13px] leading-relaxed">
            {textoFase(fase)}
          </p>
        </section>
      ) : (
        <section className="card-feature text-center">
          <p className="text-soft text-[14px] leading-relaxed">
            regista o início da menstruação para saber em que fase estás.
          </p>
        </section>
      )}

      <button onClick={() => setAberto(true)} className="btn-primary w-full">
        <Plus size={14} strokeWidth={1.6} /> registar início de menstruação
      </button>

      {/* Fases — referência editorial */}
      <section className="space-y-2">
        <span className="label-cap px-1">As 4 fases</span>
        <div className="card-solid space-y-3 text-[13px] leading-relaxed">
          <FaseInfo
            nome="menstruação"
            dias="1–5"
            descricao="estrogénio e progesterona baixos. energia mais baixa. introspecção. lentidão pode ser saudável."
            activa={fase === 'menstruacao'}
          />
          <FaseInfo
            nome="folicular"
            dias="6–13"
            descricao="estrogénio sobe. energia, foco, força. melhor fase para tarefas exigentes e decisões."
            activa={fase === 'folicular'}
          />
          <FaseInfo
            nome="ovulação"
            dias="14–16"
            descricao="pico hormonal. comunicação, sociabilidade, libido. corpo aberto."
            activa={fase === 'ovulacao'}
          />
          <FaseInfo
            nome="lútea"
            dias="17–28"
            descricao="progesterona alta depois cai. tendência a inchaço, irritabilidade, cravings de açúcar/álcool. cuidado redobrado com gatilhos."
            activa={fase === 'lutea'}
          />
        </div>
      </section>

      {/* Correlações */}
      {correlacoes.length > 0 ? (
        <section className="space-y-2">
          <span className="label-cap px-1">Padrões teus</span>
          <ul className="space-y-2">
            {correlacoes.map((c, i) => (
              <li key={i} className="card-solid flex items-start gap-3">
                <Sparkles size={14} strokeWidth={1.4} className="mt-1 shrink-0 text-ouro" />
                <p className="text-[13.5px] leading-relaxed">{c}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Histórico */}
      <section className="space-y-2">
        <span className="label-cap px-1">Histórico</span>
        {ciclos.length === 0 ? (
          <div className="card text-center text-soft text-[13px]">
            sem registos. o primeiro define o ponto de referência.
          </div>
        ) : (
          <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
            {[...ciclos].reverse().slice(0, 12).map(c => (
              <li key={c.id} className="px-5 py-3">
                <div className="flex items-baseline justify-between">
                  <p className="font-serif text-[15px] tracking-editorial">
                    {formatarData(fromIso(c.dataInicio), true)}
                  </p>
                  <span className="text-faint text-[11px] tnum">
                    {c.duracaoCiclo ? `${c.duracaoCiclo}d` : 'em curso'}
                  </span>
                </div>
                {c.fluxo ? <p className="text-soft mt-1 text-[12px]">fluxo: {c.fluxo}</p> : null}
                {c.sintomas.length > 0 ? (
                  <p className="text-faint mt-1 text-[11px]">{c.sintomas.join(' · ')}</p>
                ) : null}
                {c.cravings.length > 0 ? (
                  <p className="text-terracota mt-1 text-[11px]">cravings: {c.cravings.join(' · ')}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {aberto ? <NovoCicloSheet onClose={() => setAberto(false)} /> : null}
    </div>
  )
}

function FaseInfo({ nome, dias, descricao, activa }: { nome: string; dias: string; descricao: string; activa: boolean }) {
  return (
    <div className={cn('rounded-md p-3 transition-elegant', activa ? 'bg-ouro/10 shadow-hair-strong' : '')}>
      <div className="flex items-baseline justify-between">
        <span className={cn('font-serif text-[15px] tracking-editorial', activa && 'text-ouro')}>
          {nome}
        </span>
        <span className="text-faint text-[10px] tnum tracking-cap">dia {dias}</span>
      </div>
      <p className="text-soft mt-1 text-[12.5px] leading-relaxed">{descricao}</p>
    </div>
  )
}

function textoFase(f: CicloFase): string {
  if (f === 'menstruacao') return 'descansa o que precisares. comida quente. movimento gentil. inhibidos baixos hoje.'
  if (f === 'folicular') return 'janela de força. treina pesado se quiseres. decide o que estiver pendente.'
  if (f === 'ovulacao') return 'energia ao máximo. boa altura para conversas difíceis ou criativas.'
  if (f === 'lutea') return 'cuidado com o copo, com o açúcar e contigo. progesterona a cair pode trazer névoa.'
  return ''
}

function calcularCorrelacoes(ciclos: CicloLog[]): string[] {
  if (ciclos.length === 0) return []
  const correlacoes: string[] = []

  // álcool por fase
  const alcool = getAlcoolRegistos().filter(a => a.decidiuBeber)
  if (alcool.length >= 5 && ciclos.length >= 1) {
    const porFase: Record<string, number> = { menstruacao: 0, folicular: 0, ovulacao: 0, lutea: 0 }
    alcool.forEach(a => {
      const f = faseDoCicloEm(new Date(a.timestamp), ciclos)
      if (f) porFase[f]++
    })
    const top = Object.entries(porFase).sort(([, x], [, y]) => y - x)
    if (top[0][1] >= 3) {
      const nomes: Record<string, string> = {
        menstruacao: 'menstruação',
        folicular: 'folicular',
        ovulacao: 'ovulação',
        lutea: 'lútea'
      }
      correlacoes.push(`bebes mais durante a fase ${nomes[top[0][0]]} (${top[0][1]} de ${alcool.length} registos).`)
    }
  }

  // humor por fase
  const dias = getTodosDias().filter(d => d.humor !== null)
  if (dias.length >= 7 && ciclos.length >= 1) {
    const porFase: Record<string, { soma: number; n: number }> = {
      menstruacao: { soma: 0, n: 0 },
      folicular: { soma: 0, n: 0 },
      ovulacao: { soma: 0, n: 0 },
      lutea: { soma: 0, n: 0 }
    }
    dias.forEach(d => {
      const f = faseDoCicloEm(fromIso(d.date), ciclos)
      if (f) {
        porFase[f].soma += d.humor as number
        porFase[f].n++
      }
    })
    const medias = Object.entries(porFase)
      .filter(([, v]) => v.n >= 2)
      .map(([f, v]) => ({ fase: f, media: v.soma / v.n }))
      .sort((a, b) => b.media - a.media)
    if (medias.length >= 2) {
      const diff = medias[0].media - medias[medias.length - 1].media
      if (diff >= 0.7) {
        const nomes: Record<string, string> = {
          menstruacao: 'menstruação',
          folicular: 'folicular',
          ovulacao: 'ovulação',
          lutea: 'lútea'
        }
        correlacoes.push(`o teu humor é mais alto na fase ${nomes[medias[0].fase]} e mais baixo na ${nomes[medias[medias.length - 1].fase]}.`)
      }
    }
  }

  return correlacoes
}

function faseDoCicloEm(data: Date, ciclos: CicloLog[]): string | null {
  // procurar o ciclo aplicável
  const aplicavel = [...ciclos].reverse().find(c => fromIso(c.dataInicio) <= data)
  if (!aplicavel) return null
  const dia = Math.floor((data.getTime() - fromIso(aplicavel.dataInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1
  const ovulacao = aplicavel.duracaoCiclo ? aplicavel.duracaoCiclo - 14 : 14
  const ultMens = aplicavel.duracaoMenstruacao ?? 5
  if (dia <= 0) return null
  if (dia <= ultMens) return 'menstruacao'
  if (dia < ovulacao - 1) return 'folicular'
  if (dia <= ovulacao + 2) return 'ovulacao'
  if (dia <= (aplicavel.duracaoCiclo ?? 28)) return 'lutea'
  return null
}

function NovoCicloSheet({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState({
    dataInicio: isoDate(),
    duracaoMenstruacao: '5',
    fluxo: 'moderado' as 'leve' | 'moderado' | 'intenso',
    sintomas: [] as string[],
    cravings: [] as string[],
    notas: ''
  })

  const toggle = (campo: 'sintomas' | 'cravings', valor: string) => {
    setData(d => ({
      ...d,
      [campo]: d[campo].includes(valor) ? d[campo].filter(x => x !== valor) : [...d[campo], valor]
    }))
  }

  const submit = () => {
    saveCiclo({
      dataInicio: data.dataInicio,
      duracaoCiclo: null,
      duracaoMenstruacao: data.duracaoMenstruacao ? Number(data.duracaoMenstruacao) : null,
      fluxo: data.fluxo,
      sintomas: data.sintomas,
      cravings: data.cravings,
      notas: data.notas.trim()
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/40 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl bg-[var(--bg-elev)] p-6 shadow-ink animate-slide-up sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-[22px] font-light tracking-editorial">novo ciclo</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-faint hover:opacity-70">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-4">
          <label>
            <span className="label-cap mb-1.5 block">primeiro dia</span>
            <input
              type="date"
              value={data.dataInicio}
              onChange={e => setData({ ...data, dataInicio: e.target.value })}
              className="input-base text-[14px]"
            />
          </label>

          <label>
            <span className="label-cap mb-1.5 block">duração da menstruação · dias</span>
            <input
              type="number"
              min="1"
              max="14"
              value={data.duracaoMenstruacao}
              onChange={e => setData({ ...data, duracaoMenstruacao: e.target.value })}
              className="input-base text-[14px]"
            />
          </label>

          <div>
            <span className="label-cap mb-2 block">fluxo</span>
            <div className="grid grid-cols-3 gap-2">
              {(['leve', 'moderado', 'intenso'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setData({ ...data, fluxo: f })}
                  className={cn(
                    'rounded-md py-2 text-[12px] uppercase tracking-cap transition-elegant',
                    data.fluxo === f ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta' : 'shadow-hair text-faint'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label-cap mb-2 block">sintomas</span>
            <div className="flex flex-wrap gap-1.5">
              {SINTOMAS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle('sintomas', s)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[12px] transition-elegant active:scale-95',
                    data.sintomas.includes(s)
                      ? 'bg-tinta text-[var(--bg)] dark:bg-ouro dark:text-tinta'
                      : 'shadow-hair'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label-cap mb-2 block">cravings</span>
            <div className="flex flex-wrap gap-1.5">
              {CRAVINGS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle('cravings', c)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[12px] transition-elegant active:scale-95',
                    data.cravings.includes(c)
                      ? 'bg-terracota text-creme'
                      : 'shadow-hair'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <label>
            <span className="label-cap mb-1.5 block">notas · opcional</span>
            <textarea
              rows={2}
              value={data.notas}
              onChange={e => setData({ ...data, notas: e.target.value })}
              className="input-base resize-none text-[14px]"
            />
          </label>
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">cancelar</button>
          <button onClick={submit} className="btn-primary flex-1">guardar</button>
        </div>
      </div>
    </div>
  )
}
