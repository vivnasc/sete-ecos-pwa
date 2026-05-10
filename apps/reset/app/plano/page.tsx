'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Trash2,
  Target,
  Plus,
  X,
  Utensils,
  Dumbbell,
  Clock,
  Anchor,
  Printer
} from 'lucide-react'
import BackButton from '@/components/BackButton'
import {
  getObjectivos,
  adicionarObjectivo,
  removerObjectivo,
  getProfile,
  getAncorasActivas,
  type Objectivo,
  type ObjectivoTipo,
  type Profile
} from '@/lib/profile'
import { calcularProgresso, type ProgressoObjectivo } from '@/lib/objectivos'
import {
  getDia,
  streakAncoras,
  diasSemAlcool,
  variacaoPeso,
  jejumActualHoras,
  pesoUltimo,
  macrosDoDia,
  ancorasResolvidas
} from '@/lib/storage'
import { TREINO_SEMANAL } from '@/lib/data'
import { diaDoPlano, RESET_DAYS, diaSemana, isoDate, statusDoDia, RESET_START } from '@/lib/dates'

const TIPO_LABEL: Record<ObjectivoTipo, string> = {
  peso: 'Peso',
  cintura: 'Cintura',
  sono: 'Sono médio',
  proteina: 'Proteína média/dia',
  agua: 'Água/dia',
  alcool: 'Álcool/semana',
  treino: 'Treinos/semana',
  custom: 'Outro'
}

type Fase = { nome: string; intervalo: string; diaInicio: number; diaFim: number; foco: string }

const FASES: Fase[] = [
  { nome: 'Indução', intervalo: 'dias 1–7', diaInicio: 1, diaFim: 7, foco: 'tirar inflamação · keto estrito · hidratação' },
  { nome: 'Transição', intervalo: 'dias 8–21', diaInicio: 8, diaFim: 21, foco: 'corpo adapta-se · força a regressar · sono mais profundo' },
  { nome: 'Estabilização', intervalo: 'dias 22–50', diaInicio: 22, diaFim: 50, foco: 'ritmo · medidas a descer · refeed semanal' },
  { nome: 'Manutenção', intervalo: 'dias 51–60', diaInicio: 51, diaFim: 60, foco: 'consolidar · preparar continuidade' }
]

const MARCOS = [7, 14, 21, 30, 60]

function fasePara(dia: number): Fase | null {
  return FASES.find(f => dia >= f.diaInicio && dia <= f.diaFim) ?? null
}

function proxFase(dia: number): Fase | null {
  return FASES.find(f => f.diaInicio > dia) ?? null
}

function proxMarco(dia: number): number | null {
  return MARCOS.find(m => m > dia) ?? null
}

export default function PlanoPage() {
  const [objectivos, setObjectivos] = useState<Objectivo[]>([])
  const [perfil, setPerfil] = useState<Profile>(() => getProfile())
  const [adicionando, setAdicionando] = useState(false)
  const [tick, setTick] = useState(0)

  const refresh = () => {
    setObjectivos(getObjectivos())
    setPerfil(getProfile())
  }

  useEffect(() => {
    refresh()
    window.addEventListener('fenixfit:profile', refresh)
    window.addEventListener('fenixfit:storage', refresh)
    const i = setInterval(() => setTick(t => t + 1), 60_000)
    return () => {
      window.removeEventListener('fenixfit:profile', refresh)
      window.removeEventListener('fenixfit:storage', refresh)
      clearInterval(i)
    }
  }, [])

  const status = statusDoDia()
  const dia = diaDoPlano()
  const fase = fasePara(dia)
  const proxima = proxFase(dia)
  const marco = proxMarco(dia)
  const ancoras = getAncorasActivas()
  const dia_log = getDia()
  const cumpridas = (() => {
    const r = ancorasResolvidas(dia_log.date, dia_log.ancoras)
    return ancoras.filter(a => r[a.id]).length
  })()
  const dow = diaSemana(new Date())
  const treinoHoje = TREINO_SEMANAL[dow]
  const macros = macrosDoDia()
  const jejum = jejumActualHoras()
  const variacao = variacaoPeso()

  const imprimir = () => window.print()

  // ignore tick (só para forçar re-render)
  void tick

  return (
    <div className="space-y-7 animate-fade-in print:space-y-5">
      <div className="print:hidden"><BackButton /></div>

      <header className="space-y-2 pt-4 print:pt-0">
        <div className="flex items-baseline justify-between">
          <p className="label-soft">plano · 60 dias</p>
          <button
            onClick={imprimir}
            aria-label="imprimir plano"
            className="text-faint hover:text-ouro transition-elegant active:scale-90 print:hidden flex items-center gap-1.5 text-[11px]"
          >
            <Printer size={13} strokeWidth={1.4} /> imprimir
          </button>
        </div>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          Onde Estás. <span className="text-faint">Onde Vais.</span>
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
      </header>

      {/* LINHA 60 DIAS */}
      <Linha60 dia={dia} status={status} />

      {/* ESTA SEMANA */}
      <SecaoEstaSemana
        streak={streakAncoras()}
        semAlcool={diasSemAlcool()}
        peso={pesoUltimo()}
        pesoSemana={variacao.semana}
        jejumHoras={jejum?.horas ?? null}
      />

      {/* ESTRUTURA · 4 cards */}
      <section className="space-y-3">
        <span className="label-cap px-1">Estrutura</span>
        <div className="grid gap-3">
          <CardComer metas={perfil.metas} hojeMacros={macros} />
          <CardTreino dow={dow} treino={treinoHoje} />
          <CardJejum jejumHoras={jejum?.horas ?? null} />
          <CardAncoras total={ancoras.length} cumpridas={cumpridas} />
        </div>
      </section>

      {/* OBJECTIVOS */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="label-cap px-1">Objectivos</span>
          {objectivos.length > 0 ? (
            <button
              onClick={() => setAdicionando(true)}
              className="flex items-center gap-1 text-ouro text-[11px] active:scale-95 transition-elegant print:hidden"
            >
              <Plus size={12} strokeWidth={1.5} /> novo
            </button>
          ) : null}
        </div>
        {objectivos.length === 0 ? (
          <div className="card-feature text-center py-8 space-y-3">
            <Target size={24} strokeWidth={1.3} className="text-ouro mx-auto" />
            <p className="text-soft text-[13px] leading-relaxed max-w-xs mx-auto">
              sem objectivos. diz à coach (ex: &ldquo;quero ir de 83 a 70kg em 60 dias&rdquo;) ou adiciona aqui.
            </p>
            <button onClick={() => setAdicionando(true)} className="btn-primary px-5 py-2 text-[12.5px] print:hidden">
              <Plus size={13} strokeWidth={1.5} /> adicionar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {objectivos.map(o => (
              <ObjectivoCard key={o.id} objectivo={o} onRemover={() => { removerObjectivo(o.id); refresh() }} />
            ))}
          </div>
        )}
      </section>

      {/* FASE actual + próxima */}
      {fase ? (
        <section className="space-y-3 print:break-inside-avoid">
          <span className="label-cap px-1">Fases do plano</span>
          <ul className="card-solid divide-y divide-[var(--hair)] !p-0">
            {FASES.map(f => {
              const actual = fase.nome === f.nome
              const passou = dia > f.diaFim
              return (
                <li key={f.nome} className={`flex items-start gap-3 px-4 py-3 ${actual ? 'bg-ouro/5' : ''}`}>
                  <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${actual ? 'bg-ouro' : passou ? 'bg-oliva/50' : 'bg-[var(--hair-strong)]'}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`font-serif text-[15px] ${actual ? 'text-tinta dark:text-creme' : passou ? 'text-faint line-through' : 'text-soft'}`}>{f.nome}</span>
                      <span className="text-faint text-[10.5px] tnum">{f.intervalo}</span>
                    </div>
                    <p className="text-faint text-[11px] mt-0.5 leading-snug">{f.foco}</p>
                  </div>
                </li>
              )
            })}
          </ul>
          {proxima ? (
            <p className="text-faint text-[11px] px-1 leading-relaxed">
              próxima fase: <span className="text-soft">{proxima.nome}</span> em {proxima.diaInicio - dia} dias
            </p>
          ) : null}
          {marco !== null ? (
            <p className="text-faint text-[11px] px-1 leading-relaxed">
              próximo marco: <span className="text-ouro">dia {marco}</span> em {marco - dia} dias
            </p>
          ) : null}
        </section>
      ) : null}

      <p className="text-faint text-center text-[10.5px] print:text-[10px]">FénixFit · {RESET_START.toLocaleDateString('pt-PT')} → {RESET_DAYS} dias</p>

      {adicionando ? <NovoObjectivoSheet onClose={() => setAdicionando(false)} onSave={() => { setAdicionando(false); refresh() }} /> : null}
    </div>
  )
}

function Linha60({ dia, status }: { dia: number; status: 'antes' | 'durante' | 'depois' }) {
  const total = RESET_DAYS
  const diaClamp = Math.max(0, Math.min(total, dia))
  const pct = (diaClamp / total) * 100

  return (
    <section className="card-solid space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="label-cap">{status === 'antes' ? 'antes de começar' : status === 'depois' ? 'depois do plano' : 'a meio'}</span>
        <span className="font-serif text-[13.5px] tnum">
          {status === 'antes' ? `começa em ${1 - dia}d` : status === 'depois' ? `terminou há ${dia - total}d` : `dia ${dia} de ${total}`}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-[var(--surface-soft)] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-ouro transition-all"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
        {/* marcos */}
        {MARCOS.map(m => (
          <span
            key={m}
            className="absolute top-0 bottom-0 w-px bg-tinta/30 dark:bg-creme/30"
            style={{ left: `${(m / total) * 100}%` }}
            aria-hidden
          />
        ))}
      </div>
      <div className="flex justify-between text-faint text-[10px] tnum">
        {[1, ...MARCOS].map(m => (
          <span key={m} style={{ color: m <= dia ? 'var(--ouro)' : undefined }}>d{m}</span>
        ))}
      </div>
    </section>
  )
}

function SecaoEstaSemana({
  streak,
  semAlcool,
  peso,
  pesoSemana,
  jejumHoras
}: {
  streak: number
  semAlcool: number
  peso: number | null
  pesoSemana: number | null
  jejumHoras: number | null
}) {
  return (
    <section className="space-y-2">
      <span className="label-cap px-1">Esta semana</span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Mini titulo="constância" valor={String(streak)} sub={streak === 1 ? 'dia' : 'dias'} />
        <Mini titulo="sem álcool" valor={String(semAlcool)} sub={semAlcool === 1 ? 'dia' : 'dias'} />
        <Mini
          titulo="peso"
          valor={peso !== null ? `${peso.toFixed(1)}` : '—'}
          sub={pesoSemana !== null ? `${pesoSemana > 0 ? '+' : ''}${pesoSemana.toFixed(1)}kg` : 'kg'}
        />
        <Mini
          titulo="jejum agora"
          valor={jejumHoras !== null ? `${Math.floor(jejumHoras)}` : '—'}
          sub={jejumHoras !== null ? 'horas' : 'a comer'}
        />
      </div>
    </section>
  )
}

function Mini({ titulo, valor, sub }: { titulo: string; valor: string; sub: string }) {
  return (
    <div className="card-solid !p-3 text-center">
      <p className="text-faint text-[9.5px] uppercase tracking-cap">{titulo}</p>
      <p className="editorial-num text-[24px] tnum mt-1.5 leading-none">{valor}</p>
      <p className="text-faint text-[10px] tnum mt-1">{sub}</p>
    </div>
  )
}

function CardComer({ metas, hojeMacros }: { metas: { calorias: number | null; proteinaG: number | null; carboG: number | null; gorduraG: number | null }; hojeMacros: { proteina: number; carbo: number; gordura: number; calorias: number; refeicoes: number } }) {
  return (
    <a href="/refeicoes" className="card-solid block transition-elegant hover:bg-[var(--surface-soft)]">
      <div className="flex items-center gap-2 mb-2">
        <Utensils size={14} strokeWidth={1.4} className="text-ouro" />
        <span className="label-cap">Comer</span>
      </div>
      <p className="font-serif text-[15px] mb-2 leading-snug">keto cíclico · janela 9h–19h · proteína primeiro</p>
      {metas.calorias === null ? (
        <p className="text-faint text-[11px]">sem metas · diz à coach &ldquo;define metas&rdquo;.</p>
      ) : (
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <CardMacro label="kcal" valor={hojeMacros.calorias} alvo={metas.calorias} />
          <CardMacro label="P" valor={Math.round(hojeMacros.proteina)} alvo={metas.proteinaG} />
          <CardMacro label="C" valor={Math.round(hojeMacros.carbo)} alvo={metas.carboG} />
          <CardMacro label="G" valor={Math.round(hojeMacros.gordura)} alvo={metas.gorduraG} />
        </div>
      )}
    </a>
  )
}

function CardMacro({ label, valor, alvo }: { label: string; valor: number; alvo: number | null }) {
  return (
    <div>
      <p className="text-faint text-[9px] uppercase tracking-cap">{label}</p>
      <p className="font-serif text-[13.5px] tnum mt-0.5">
        {valor}{alvo !== null ? <span className="text-faint text-[10px]">/{alvo}</span> : null}
      </p>
    </div>
  )
}

function CardTreino({ dow, treino }: { dow: string; treino: { tipo: string; descricao: string; descanso: boolean } }) {
  return (
    <a href="/treino" className="card-solid block transition-elegant hover:bg-[var(--surface-soft)]">
      <div className="flex items-center gap-2 mb-2">
        <Dumbbell size={14} strokeWidth={1.4} className="text-ouro" />
        <span className="label-cap">Treino</span>
        <span className="text-faint text-[10.5px] ml-auto">{dow}</span>
      </div>
      <p className={`font-serif text-[15px] leading-snug ${treino.descanso ? 'text-soft italic' : ''}`}>{treino.tipo}</p>
      <p className="text-faint text-[11px] mt-1 leading-snug">{treino.descricao}</p>
    </a>
  )
}

function CardJejum({ jejumHoras }: { jejumHoras: number | null }) {
  return (
    <a href="/jejum" className="card-solid block transition-elegant hover:bg-[var(--surface-soft)]">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={14} strokeWidth={1.4} className="text-ouro" />
        <span className="label-cap">Jejum</span>
      </div>
      <p className="font-serif text-[15px] leading-snug">janela alimentar · meta ≥14h</p>
      <p className="text-faint text-[11px] mt-1">
        {jejumHoras !== null ? `actual: ${Math.floor(jejumHoras)}h${Math.round((jejumHoras - Math.floor(jejumHoras)) * 60)}min` : 'janela aberta · a comer'}
      </p>
    </a>
  )
}

function CardAncoras({ total, cumpridas }: { total: number; cumpridas: number }) {
  return (
    <a href="/definicoes" className="card-solid block transition-elegant hover:bg-[var(--surface-soft)]">
      <div className="flex items-center gap-2 mb-2">
        <Anchor size={14} strokeWidth={1.4} className="text-ouro" />
        <span className="label-cap">Âncoras</span>
        <span className="text-faint text-[10.5px] ml-auto tnum">{cumpridas}/{total} hoje</span>
      </div>
      <p className="font-serif text-[15px] leading-snug">{total} âncoras activas</p>
      <p className="text-faint text-[11px] mt-1">tocar para escolher do pool ou criar nova</p>
    </a>
  )
}

function ObjectivoCard({ objectivo, onRemover }: { objectivo: Objectivo; onRemover: () => void }) {
  const progresso = calcularProgresso(objectivo)
  const apagar = () => {
    if (window.confirm(`apagar objectivo "${objectivo.texto}"?`)) onRemover()
  }
  const inicioDate = new Date(objectivo.criadoEm)
  const fimDate = objectivo.prazoDias ? (() => {
    const d = new Date(inicioDate)
    d.setDate(d.getDate() + objectivo.prazoDias)
    return d
  })() : null
  const fmtData = (d: Date) => d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })

  return (
    <article className="card-feature space-y-3 print:break-inside-avoid">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="label-cap">{objectivo.tipo ? TIPO_LABEL[objectivo.tipo] : 'objectivo'}</p>
          <p className="font-serif text-[18px] leading-tight tracking-editorial mt-1">{objectivo.texto}</p>
          {fimDate ? (
            <p className="text-faint text-[11px] tnum mt-1">{fmtData(inicioDate)} → {fmtData(fimDate)}</p>
          ) : null}
        </div>
        <button onClick={apagar} aria-label="apagar" className="text-faint hover:text-terracota active:scale-90 shrink-0 p-1 print:hidden">
          <Trash2 size={14} strokeWidth={1.4} />
        </button>
      </div>

      {progresso ? <ProgressoView p={progresso} inicio={inicioDate} fim={fimDate} /> : (
        <p className="text-faint text-[11.5px] italic">sem tracking automático · diz à coach para adicionar números (ex: &ldquo;de X para Y em Zd&rdquo;).</p>
      )}
    </article>
  )
}

function ProgressoView({ p, inicio, fim }: { p: ProgressoObjectivo; inicio: Date; fim: Date | null }) {
  const corStatus = p.status === 'no_caminho' ? 'text-oliva' : p.status === 'a_frente' ? 'text-ouro' : p.status === 'atrasada' ? 'text-terracota' : 'text-faint'
  const labelStatus = p.status === 'no_caminho' ? 'no caminho' : p.status === 'a_frente' ? 'à frente' : p.status === 'atrasada' ? 'atrasada' : 'sem dados'
  const querDescer = p.valorAlvoFinal !== null && p.valorInicial !== null && p.valorAlvoFinal < p.valorInicial

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="label-cap">hoje deve ser</p>
          <p className="editorial-num text-[32px] tnum mt-1 leading-none">
            {p.valorAlvoHoje !== null ? p.valorAlvoHoje.toFixed(1) : '—'}
            <span className="ml-1 text-[12px] text-faint">{p.unidade}</span>
          </p>
        </div>
        <div>
          <p className="label-cap">estás em</p>
          <p className={`editorial-num text-[32px] tnum mt-1 leading-none ${corStatus}`}>
            {p.valorActual !== null ? p.valorActual.toFixed(1) : '—'}
            <span className="ml-1 text-[12px] text-faint">{p.unidade}</span>
          </p>
        </div>
      </div>
      <div className="flex items-baseline justify-between border-y border-[var(--hair)] py-2.5">
        <span className={`text-[11px] uppercase tracking-cap ${corStatus}`}>{labelStatus}</span>
        {p.delta !== null ? (
          <span className="text-[11px] tnum text-soft">
            {p.delta > 0 ? '+' : ''}{p.delta.toFixed(1)}{p.unidade} vs alvo de hoje
          </span>
        ) : null}
      </div>
      <Grafico p={p} inicio={inicio} fim={fim} />
      <div className="grid grid-cols-3 gap-2 text-center">
        <MiniInfo label={`dia ${p.diasDecorridos}/${p.diasTotais}`} valor={inicio ? inicio.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }) : '—'} />
        <MiniInfo label={`fim em ${p.diasRestantes}d`} valor={fim ? fim.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }) : '—'} />
        <MiniInfo label="ritmo necessário" valor={p.ritmoNecessario !== null ? `${p.ritmoNecessario > 0 ? '+' : ''}${p.ritmoNecessario.toFixed(2)}${p.unidade}/d` : '—'} />
      </div>
      {p.projeccao !== null ? (
        <div className="card-solid !bg-[var(--surface-soft)] !p-3 space-y-1">
          <p className="text-faint text-[10px] uppercase tracking-cap">projecção · ao ritmo actual</p>
          <p className="font-serif text-[15px] tnum">
            {p.projeccao.toFixed(1)}{p.unidade}
            <span className="text-faint text-[11px] italic ml-2">no fim do prazo</span>
          </p>
          {p.valorAlvoFinal !== null ? (
            <p className="text-[11px] text-soft tnum">
              alvo final: <span className={querDescer ? (p.projeccao <= p.valorAlvoFinal ? 'text-oliva' : 'text-terracota') : (p.projeccao >= p.valorAlvoFinal ? 'text-oliva' : 'text-terracota')}>
                {p.valorAlvoFinal.toFixed(1)}{p.unidade}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function MiniInfo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="card-solid !p-2">
      <p className="text-faint text-[9.5px] uppercase tracking-cap">{label}</p>
      <p className="font-serif text-[13px] tnum mt-0.5">{valor}</p>
    </div>
  )
}

function Grafico({ p, inicio, fim }: { p: ProgressoObjectivo; inicio: Date; fim: Date | null }) {
  const w = 320
  const h = 120
  const padding = { top: 10, right: 10, bottom: 18, left: 32 }
  const chartW = w - padding.left - padding.right
  const chartH = h - padding.top - padding.bottom

  const todosValores = [...p.trajectoria.map(t => t.valor), ...p.serie.map(s => s.valor)]
  if (todosValores.length === 0) return null
  const vMin = Math.min(...todosValores)
  const vMax = Math.max(...todosValores)
  const range = vMax - vMin || 1
  const yPad = range * 0.15
  const yMin = vMin - yPad
  const yMax = vMax + yPad
  const yRange = yMax - yMin

  const tInicio = new Date(p.trajectoria[0]?.date ?? new Date()).getTime()
  const tFim = new Date(p.trajectoria[p.trajectoria.length - 1]?.date ?? new Date()).getTime()
  const tRange = tFim - tInicio || 1

  const x = (d: string) => padding.left + ((new Date(d).getTime() - tInicio) / tRange) * chartW
  const y = (v: number) => padding.top + chartH - ((v - yMin) / yRange) * chartH

  const trajPath = p.trajectoria.map((t, i) => `${i === 0 ? 'M' : 'L'}${x(t.date).toFixed(1)},${y(t.valor).toFixed(1)}`).join(' ')
  const seriePath = p.serie.length > 0
    ? p.serie.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.date).toFixed(1)},${y(s.valor).toFixed(1)}`).join(' ')
    : ''

  const hojeIso = isoDate()
  const xHoje = x(hojeIso)
  const yHojeAlvo = p.valorAlvoHoje !== null ? y(p.valorAlvoHoje) : null
  const yHojeActual = p.valorActual !== null ? y(p.valorActual) : null

  return (
    <div className="-mx-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none" aria-label="gráfico de progresso">
        <line x1={padding.left} y1={padding.top + chartH} x2={w - padding.right} y2={padding.top + chartH} stroke="var(--hair)" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke="var(--hair)" />
        <path d={trajPath} fill="none" stroke="var(--ouro)" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.6} />
        {seriePath ? <path d={seriePath} fill="none" stroke="var(--ink)" strokeWidth={1.6} className="dark:stroke-creme" /> : null}
        {p.serie.map((s, i) => (
          <circle key={i} cx={x(s.date)} cy={y(s.valor)} r={2} fill="var(--ink)" className="dark:fill-creme" />
        ))}
        <line x1={xHoje} y1={padding.top} x2={xHoje} y2={padding.top + chartH} stroke="var(--ouro)" strokeWidth={0.5} opacity={0.5} />
        {yHojeActual !== null ? <circle cx={xHoje} cy={yHojeActual} r={3.5} fill="var(--ouro)" /> : null}
        {yHojeAlvo !== null ? <circle cx={xHoje} cy={yHojeAlvo} r={2.5} fill="none" stroke="var(--ouro)" strokeWidth={1} /> : null}
        <text x={padding.left - 4} y={padding.top + 4} fontSize="9" fill="var(--ink-faint)" textAnchor="end">{yMax.toFixed(0)}</text>
        <text x={padding.left - 4} y={padding.top + chartH} fontSize="9" fill="var(--ink-faint)" textAnchor="end">{yMin.toFixed(0)}</text>
        <text x={padding.left} y={h - 4} fontSize="9" fill="var(--ink-faint)" textAnchor="start">
          {inicio.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
        </text>
        <text x={Math.min(w - padding.right - 18, Math.max(padding.left + 18, xHoje))} y={h - 4} fontSize="9" fill="var(--ouro)" textAnchor="middle">
          hoje
        </text>
        <text x={w - padding.right} y={h - 4} fontSize="9" fill="var(--ink-faint)" textAnchor="end">
          {fim ? fim.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }) : 'fim'}
        </text>
      </svg>
      <div className="flex items-center justify-center gap-4 text-[10px] mt-1 text-faint">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-px bg-ouro" />alvo</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-px bg-tinta dark:bg-creme" />real</span>
      </div>
    </div>
  )
}

function NovoObjectivoSheet({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<ObjectivoTipo>('peso')
  const [valorInicial, setValorInicial] = useState('')
  const [valorAlvo, setValorAlvo] = useState('')
  const [prazoDias, setPrazoDias] = useState('60')

  const submit = () => {
    let textoFinal = texto.trim()
    if (!textoFinal && tipo !== 'custom' && valorInicial && valorAlvo) {
      const unidade = tipo === 'peso' ? 'kg' : tipo === 'cintura' ? 'cm' : tipo === 'sono' ? 'h' : tipo === 'proteina' ? 'g' : tipo === 'agua' ? 'copos' : tipo === 'alcool' ? 'u/sem' : tipo === 'treino' ? '×/sem' : ''
      const verbo = Number(valorAlvo) < Number(valorInicial) ? 'baixar' : 'aumentar'
      textoFinal = `${verbo} ${tipo} de ${valorInicial}${unidade} para ${valorAlvo}${unidade} em ${prazoDias || 60} dias`
    }
    if (!textoFinal) {
      window.alert('escreve uma descrição ou preenche os números.')
      return
    }
    adicionarObjectivo(textoFinal, {
      tipo,
      valorInicial: valorInicial ? Number(valorInicial) : undefined,
      valorAlvo: valorAlvo ? Number(valorAlvo) : undefined,
      prazoDias: prazoDias ? Number(prazoDias) : undefined
    })
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/40 backdrop-blur-sm sm:items-center" role="dialog">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl bg-[var(--bg-elev)] p-6 shadow-ink animate-slide-up sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-[22px] font-light tracking-editorial">novo objectivo</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-faint hover:opacity-70">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="label-cap mb-1.5 block">Descrição</span>
            <input type="text" value={texto} onChange={e => setTexto(e.target.value)} placeholder="quero ir de 83 a 70kg em 60 dias" className="input-base" />
          </label>
          <label className="block">
            <span className="label-cap mb-1.5 block">Tipo</span>
            <select value={tipo} onChange={e => setTipo(e.target.value as ObjectivoTipo)} className="input-base">
              <option value="peso">Peso · kg</option>
              <option value="cintura">Cintura · cm</option>
              <option value="sono">Sono médio · h</option>
              <option value="proteina">Proteína média/dia · g</option>
              <option value="agua">Água/dia · copos</option>
              <option value="alcool">Álcool/semana · u</option>
              <option value="treino">Treinos/semana · ×</option>
              <option value="custom">Outro · só texto</option>
            </select>
          </label>
          {tipo !== 'custom' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label-cap mb-1.5 block">Onde estás</span>
                  <input type="number" inputMode="decimal" step="0.1" value={valorInicial} onChange={e => setValorInicial(e.target.value)} className="input-base" placeholder="83" />
                </label>
                <label className="block">
                  <span className="label-cap mb-1.5 block">Alvo</span>
                  <input type="number" inputMode="decimal" step="0.1" value={valorAlvo} onChange={e => setValorAlvo(e.target.value)} className="input-base" placeholder="70" />
                </label>
              </div>
              <label className="block">
                <span className="label-cap mb-1.5 block">Prazo · dias</span>
                <input type="number" inputMode="numeric" min="1" value={prazoDias} onChange={e => setPrazoDias(e.target.value)} className="input-base" />
              </label>
            </>
          ) : null}
        </div>

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">cancelar</button>
          <button onClick={submit} disabled={!texto.trim() && (!valorInicial || !valorAlvo)} className="btn-primary flex-1 disabled:opacity-40">guardar</button>
        </div>
      </div>
    </div>
  )
}
