'use client'

import { useEffect, useState } from 'react'
import { Trash2, TrendingDown, TrendingUp, Target, Calendar, Plus, X } from 'lucide-react'
import BackButton from '@/components/BackButton'
import { getObjectivos, adicionarObjectivo, removerObjectivo, type Objectivo, type ObjectivoTipo } from '@/lib/profile'
import { calcularProgresso, type ProgressoObjectivo } from '@/lib/objectivos'

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

export default function PlanoPage() {
  const [objectivos, setObjectivos] = useState<Objectivo[]>([])
  const [adicionando, setAdicionando] = useState(false)

  const refresh = () => setObjectivos(getObjectivos())

  useEffect(() => {
    refresh()
    window.addEventListener('fenixfit:profile', refresh)
    window.addEventListener('fenixfit:storage', refresh)
    return () => {
      window.removeEventListener('fenixfit:profile', refresh)
      window.removeEventListener('fenixfit:storage', refresh)
    }
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />

      <header className="space-y-2 pt-4">
        <p className="label-soft">plano</p>
        <h1 className="font-serif text-[40px] font-light leading-[1.05] tracking-editorial sm:text-[48px]">
          onde queres chegar
        </h1>
        <div className="h-px w-12 bg-ouro" aria-hidden />
        <p className="text-faint mt-3 text-[12.5px] leading-relaxed">
          objectivos com gráficos · vês onde estás e onde devias estar todos os dias.
        </p>
      </header>

      {objectivos.length === 0 ? (
        <section className="card-feature text-center py-10 space-y-3">
          <Target size={28} strokeWidth={1.3} className="text-ouro mx-auto" />
          <p className="font-serif text-[18px] tracking-editorial italic">sem objectivos guardados</p>
          <p className="text-soft text-[12.5px] leading-relaxed max-w-xs mx-auto">
            diz à coach o que queres (ex: &ldquo;quero ir de 83 a 70kg em 60 dias&rdquo;) ou adiciona aqui.
          </p>
          <button onClick={() => setAdicionando(true)} className="btn-primary px-5 py-2 text-[12.5px]">
            <Plus size={13} strokeWidth={1.5} /> adicionar objectivo
          </button>
        </section>
      ) : (
        <>
          <button onClick={() => setAdicionando(true)} className="card-solid flex w-full items-center justify-center gap-2 py-3 text-[12.5px] text-soft transition-elegant hover:bg-[var(--surface-soft)] active:scale-95">
            <Plus size={14} strokeWidth={1.4} /> novo objectivo
          </button>
          <div className="space-y-4">
            {objectivos.map(o => (
              <ObjectivoCard key={o.id} objectivo={o} onRemover={() => { removerObjectivo(o.id); refresh() }} />
            ))}
          </div>
        </>
      )}

      {adicionando ? <NovoObjectivoSheet onClose={() => setAdicionando(false)} onSave={() => { setAdicionando(false); refresh() }} /> : null}
    </div>
  )
}

function ObjectivoCard({ objectivo, onRemover }: { objectivo: Objectivo; onRemover: () => void }) {
  const progresso = calcularProgresso(objectivo)
  const apagar = () => {
    if (window.confirm(`apagar objectivo "${objectivo.texto}"?`)) onRemover()
  }
  // Datas legíveis
  const inicioDate = new Date(objectivo.criadoEm)
  const fimDate = objectivo.prazoDias ? (() => {
    const d = new Date(inicioDate)
    d.setDate(d.getDate() + objectivo.prazoDias)
    return d
  })() : null
  const fmtData = (d: Date) => d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })

  return (
    <article className="card-feature space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="label-cap">{objectivo.tipo ? TIPO_LABEL[objectivo.tipo] : 'objectivo'}</p>
          <p className="font-serif text-[18px] leading-tight tracking-editorial mt-1">{objectivo.texto}</p>
          {fimDate ? (
            <p className="text-faint text-[11px] tnum mt-1">
              {fmtData(inicioDate)} → {fmtData(fimDate)}
            </p>
          ) : null}
        </div>
        <button onClick={apagar} aria-label="apagar" className="text-faint hover:text-terracota active:scale-90 shrink-0 p-1">
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
      {/* Big numbers · onde devias estar vs onde estás */}
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

      {/* Status + delta */}
      <div className="flex items-baseline justify-between border-y border-[var(--hair)] py-2.5">
        <span className={`text-[11px] uppercase tracking-cap ${corStatus}`}>{labelStatus}</span>
        {p.delta !== null ? (
          <span className="text-[11px] tnum text-soft">
            {p.delta > 0 ? '+' : ''}{p.delta.toFixed(1)}{p.unidade} vs alvo de hoje
          </span>
        ) : null}
      </div>

      {/* Gráfico */}
      <Grafico p={p} inicio={inicio} fim={fim} />

      {/* Métricas · com datas */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Mini label={`dia ${p.diasDecorridos}/${p.diasTotais}`} valor={inicio ? inicio.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }) : '—'} />
        <Mini label={`fim em ${p.diasRestantes}d`} valor={fim ? fim.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }) : '—'} />
        <Mini label="ritmo necessário" valor={p.ritmoNecessario !== null ? `${p.ritmoNecessario > 0 ? '+' : ''}${p.ritmoNecessario.toFixed(2)}${p.unidade}/d` : '—'} />
      </div>

      {/* Projecção */}
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

function Mini({ label, valor }: { label: string; valor: string }) {
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

  // Combinar trajectória + serie para escalas
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

  // Linha trajectória
  const trajPath = p.trajectoria.map((t, i) => `${i === 0 ? 'M' : 'L'}${x(t.date).toFixed(1)},${y(t.valor).toFixed(1)}`).join(' ')
  // Linha serie actual
  const seriePath = p.serie.length > 0
    ? p.serie.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.date).toFixed(1)},${y(s.valor).toFixed(1)}`).join(' ')
    : ''

  // Marca hoje
  const hoje = isoDateLocal()
  const xHoje = x(hoje)
  const yHojeAlvo = p.valorAlvoHoje !== null ? y(p.valorAlvoHoje) : null
  const yHojeActual = p.valorActual !== null ? y(p.valorActual) : null

  return (
    <div className="-mx-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none" aria-label="gráfico de progresso">
        {/* eixos · linha base */}
        <line x1={padding.left} y1={padding.top + chartH} x2={w - padding.right} y2={padding.top + chartH} stroke="var(--hair)" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke="var(--hair)" />
        {/* trajectória ideal · linha pontilhada dourada */}
        <path d={trajPath} fill="none" stroke="var(--ouro)" strokeWidth={1.2} strokeDasharray="3 3" opacity={0.6} />
        {/* serie real · linha sólida */}
        {seriePath ? <path d={seriePath} fill="none" stroke="var(--ink)" strokeWidth={1.6} className="dark:stroke-creme" /> : null}
        {/* pontos da série */}
        {p.serie.map((s, i) => (
          <circle key={i} cx={x(s.date)} cy={y(s.valor)} r={2} fill="var(--ink)" className="dark:fill-creme" />
        ))}
        {/* linha vertical · hoje */}
        <line x1={xHoje} y1={padding.top} x2={xHoje} y2={padding.top + chartH} stroke="var(--ouro)" strokeWidth={0.5} opacity={0.5} />
        {yHojeActual !== null ? <circle cx={xHoje} cy={yHojeActual} r={3.5} fill="var(--ouro)" /> : null}
        {yHojeAlvo !== null ? <circle cx={xHoje} cy={yHojeAlvo} r={2.5} fill="none" stroke="var(--ouro)" strokeWidth={1} /> : null}
        {/* labels eixo Y · vMin e vMax */}
        <text x={padding.left - 4} y={padding.top + 4} fontSize="9" fill="var(--ink-faint)" textAnchor="end">{yMax.toFixed(0)}</text>
        <text x={padding.left - 4} y={padding.top + chartH} fontSize="9" fill="var(--ink-faint)" textAnchor="end">{yMin.toFixed(0)}</text>
        {/* labels eixo X · datas reais */}
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
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-px bg-ouro" style={{ borderTop: '1px dashed var(--ouro)' }} />alvo</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-px bg-tinta dark:bg-creme" />real</span>
      </div>
    </div>
  )
}

function isoDateLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function NovoObjectivoSheet({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<ObjectivoTipo>('peso')
  const [valorInicial, setValorInicial] = useState('')
  const [valorAlvo, setValorAlvo] = useState('')
  const [prazoDias, setPrazoDias] = useState('60')

  const submit = () => {
    let textoFinal = texto.trim()
    // Se a descrição está vazia, constrói uma a partir dos números
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
