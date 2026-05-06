'use client'

import {
  getTodosDias,
  getAlcoolRegistos,
  getJejuns,
  getPesos,
  getCiclos,
  type DiaLog,
  type AlcoolRegisto,
  type JejumLog,
  type PesoLog
} from './storage'
import { ANCORAS } from './data'
import { fromIso, isoDate } from './dates'

// ===== UTILITÁRIOS =====

function correlacao(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 4) return 0
  const mx = xs.slice(0, n).reduce((a, b) => a + b, 0) / n
  const my = ys.slice(0, n).reduce((a, b) => a + b, 0) / n
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my)
    dx += (xs[i] - mx) ** 2
    dy += (ys[i] - my) ** 2
  }
  if (dx === 0 || dy === 0) return 0
  return num / Math.sqrt(dx * dy)
}

function media(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length
}

function desvioPadrao(xs: number[]): number {
  if (xs.length < 2) return 0
  const m = media(xs)
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length)
}

// ===== PONTUAÇÃO DO DIA =====

export type PontuacaoDia = {
  date: string
  total: number // 0-100
  componentes: { label: string; score: number; max: number; emoji?: string }[]
  qualitativo: 'excelente' | 'bom' | 'médio' | 'fraco'
}

export function pontuarDia(date: string): PontuacaoDia | null {
  const dias = getTodosDias()
  const dia = dias.find(d => d.date === date)
  if (!dia) return null

  const ancorasCumpridas = ANCORAS.filter(a => dia.ancoras[a.id]).length
  const ancorasMax = ANCORAS.length

  const sonoScore = dia.sonoHoras !== null ? Math.min(10, Math.max(0, (dia.sonoHoras - 4) * 2.5)) : 0
  const energiaScore = dia.energia !== null ? dia.energia * 2 : 0
  const humorScore = dia.humor !== null ? dia.humor * 2 : 0

  const jejum = getJejuns().find(j => j.date === date)
  const jejumScore = jejum?.completou ? 10 : jejum?.duracaoHoras ? Math.min(10, jejum.duracaoHoras / 1.4) : 0

  const alcoolDoDia = getAlcoolRegistos().filter(a => a.timestamp.slice(0, 10) === date && a.decidiuBeber)
  const alcoolUnidades = alcoolDoDia.reduce((acc, a) => acc + a.unidades, 0)
  const alcoolScore = alcoolUnidades === 0 ? 10 : Math.max(0, 10 - alcoolUnidades * 3)

  const componentes = [
    { label: 'âncoras', score: (ancorasCumpridas / ancorasMax) * 30, max: 30 },
    { label: 'sono', score: sonoScore * 1.5, max: 15 },
    { label: 'energia', score: energiaScore * 1.0, max: 10 },
    { label: 'humor', score: humorScore * 1.0, max: 10 },
    { label: 'jejum', score: jejumScore * 1.5, max: 15 },
    { label: 'álcool', score: alcoolScore * 2.0, max: 20 }
  ]

  const total = Math.round(componentes.reduce((a, c) => a + c.score, 0))
  const qualitativo = total >= 85 ? 'excelente' : total >= 65 ? 'bom' : total >= 45 ? 'médio' : 'fraco'

  return { date, total, componentes, qualitativo }
}

export function pontuacaoMedia7d(): number | null {
  const dias = getTodosDias().slice(-7)
  if (dias.length === 0) return null
  const pontos = dias.map(d => pontuarDia(d.date)).filter((p): p is PontuacaoDia => p !== null)
  if (pontos.length === 0) return null
  return Math.round(pontos.reduce((a, p) => a + p.total, 0) / pontos.length)
}

// ===== CORRELAÇÕES MULTI-VARIÁVEL =====

export type Correlacao = {
  id: string
  titulo: string
  descricao: string
  forca: 'fraco' | 'moderado' | 'forte'
  tipo: 'positivo' | 'negativo' | 'observacao'
  confianca: number // 0-1
}

export function correlacoesProfundas(): Correlacao[] {
  const correlacoes: Correlacao[] = []
  const dias = getTodosDias()
  if (dias.length < 5) return correlacoes

  // 1. SONO ↔ ENERGIA
  const ts1 = dias.filter(d => d.sonoHoras !== null && d.energia !== null)
  if (ts1.length >= 5) {
    const r = correlacao(ts1.map(d => d.sonoHoras as number), ts1.map(d => d.energia as number))
    if (Math.abs(r) > 0.35) {
      correlacoes.push({
        id: 'sono-energia',
        titulo: r > 0 ? 'mais sono = mais energia' : 'sono não traz energia (rever qualidade)',
        descricao: `correlação ${Math.round(Math.abs(r) * 100)}% em ${ts1.length} dias.`,
        forca: Math.abs(r) > 0.7 ? 'forte' : 'moderado',
        tipo: r > 0 ? 'positivo' : 'observacao',
        confianca: Math.abs(r)
      })
    }
  }

  // 2. SONO ↔ HUMOR (lag 0)
  const ts2 = dias.filter(d => d.sonoHoras !== null && d.humor !== null)
  if (ts2.length >= 5) {
    const r = correlacao(ts2.map(d => d.sonoHoras as number), ts2.map(d => d.humor as number))
    if (Math.abs(r) > 0.35) {
      correlacoes.push({
        id: 'sono-humor',
        titulo: 'sono e humor caminham juntos',
        descricao: `${Math.round(Math.abs(r) * 100)}% de correlação. dormir mal afecta directamente o humor do dia.`,
        forca: Math.abs(r) > 0.7 ? 'forte' : 'moderado',
        tipo: r > 0 ? 'positivo' : 'negativo',
        confianca: Math.abs(r)
      })
    }
  }

  // 3. TREINO ↔ HUMOR (mesmo dia)
  const comTreino = dias.filter(d => d.humor !== null)
  if (comTreino.length >= 8) {
    const treinaram = comTreino.filter(d => !!d.ancoras['treino_feito'])
    const naoTreinaram = comTreino.filter(d => !d.ancoras['treino_feito'])
    if (treinaram.length >= 3 && naoTreinaram.length >= 3) {
      const m1 = media(treinaram.map(d => d.humor as number))
      const m2 = media(naoTreinaram.map(d => d.humor as number))
      const diff = m1 - m2
      if (Math.abs(diff) > 0.4) {
        correlacoes.push({
          id: 'treino-humor',
          titulo: diff > 0 ? 'treinar levanta o humor' : 'treinar correlaciona com humor mais baixo (cansaço?)',
          descricao: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} pontos em dias de treino vs descanso (${treinaram.length} vs ${naoTreinaram.length} dias).`,
          forca: Math.abs(diff) > 1 ? 'forte' : 'moderado',
          tipo: diff > 0 ? 'positivo' : 'observacao',
          confianca: Math.min(1, Math.abs(diff) / 2)
        })
      }
    }
  }

  // 4. ÁLCOOL ↔ SONO PRÓXIMA NOITE (lag +1)
  const alcool = getAlcoolRegistos().filter(a => a.decidiuBeber)
  if (alcool.length >= 3 && dias.length >= 7) {
    const diasComAlc = new Set(alcool.map(a => a.timestamp.slice(0, 10)))
    const sonoLag = dias.slice(1).map((d, i) => {
      const ontem = dias[i].date
      return diasComAlc.has(ontem) ? { v: d.sonoHoras, alcool: true } : { v: d.sonoHoras, alcool: false }
    }).filter(x => x.v !== null) as Array<{ v: number; alcool: boolean }>

    const comAlc = sonoLag.filter(x => x.alcool).map(x => x.v)
    const semAlc = sonoLag.filter(x => !x.alcool).map(x => x.v)

    if (comAlc.length >= 2 && semAlc.length >= 2) {
      const diff = media(semAlc) - media(comAlc)
      if (Math.abs(diff) > 0.4) {
        correlacoes.push({
          id: 'alcool-sono-lag',
          titulo: diff > 0 ? 'beber custa-te sono na noite seguinte' : 'beber não afecta o teu sono',
          descricao: `dormes ${Math.abs(diff).toFixed(1)}h ${diff > 0 ? 'menos' : 'mais'} após beber. ${comAlc.length} noites com álcool, ${semAlc.length} sem.`,
          forca: Math.abs(diff) > 1 ? 'forte' : 'moderado',
          tipo: diff > 0 ? 'negativo' : 'observacao',
          confianca: Math.min(1, Math.abs(diff) / 2)
        })
      }
    }
  }

  // 5. ÂNCORAS ↔ ENERGIA DIA SEGUINTE (lag +1)
  if (dias.length >= 8) {
    const seq: Array<{ ancoras: number; energiaSeguinte: number }> = []
    for (let i = 0; i < dias.length - 1; i++) {
      const a = ANCORAS.filter(x => dias[i].ancoras[x.id]).length
      const e = dias[i + 1].energia
      if (e !== null) seq.push({ ancoras: a, energiaSeguinte: e })
    }
    if (seq.length >= 5) {
      const r = correlacao(seq.map(s => s.ancoras), seq.map(s => s.energiaSeguinte))
      if (Math.abs(r) > 0.35) {
        correlacoes.push({
          id: 'ancoras-energia-lag',
          titulo: r > 0 ? 'cumprir âncoras hoje paga energia amanhã' : 'âncoras vs energia seguinte: sem padrão',
          descricao: `correlação ${Math.round(r * 100)}% em ${seq.length} pares de dias.`,
          forca: Math.abs(r) > 0.7 ? 'forte' : 'moderado',
          tipo: r > 0 ? 'positivo' : 'observacao',
          confianca: Math.abs(r)
        })
      }
    }
  }

  // 6. JEJUM ↔ PESO MANHÃ SEGUINTE
  const jejuns = getJejuns().filter(j => j.duracaoHoras !== null)
  const pesos = getPesos()
  if (jejuns.length >= 5 && pesos.length >= 5) {
    const pares: Array<{ jejum: number; peso: number | null }> = []
    jejuns.forEach(j => {
      const proxData = (() => {
        const d = fromIso(j.date)
        d.setDate(d.getDate() + 1)
        return isoDate(d)
      })()
      const peso = pesos.find(p => p.date === proxData)?.peso
      if (peso !== undefined) pares.push({ jejum: j.duracaoHoras as number, peso })
    })
    if (pares.length >= 4) {
      const r = correlacao(pares.map(p => p.jejum), pares.map(p => p.peso as number))
      if (Math.abs(r) > 0.35) {
        correlacoes.push({
          id: 'jejum-peso',
          titulo: r < 0 ? 'jejuns mais longos = peso mais baixo na manhã' : 'jejum sem efeito directo no peso',
          descricao: `correlação ${Math.round(r * 100)}% em ${pares.length} pares.`,
          forca: Math.abs(r) > 0.7 ? 'forte' : 'moderado',
          tipo: r < 0 ? 'positivo' : 'observacao',
          confianca: Math.abs(r)
        })
      }
    }
  }

  // 7. DIA DA SEMANA (álcool e desempenho)
  if (alcool.length >= 7) {
    const porDia: Record<number, number> = {}
    alcool.forEach(a => {
      const dow = new Date(a.timestamp).getDay()
      porDia[dow] = (porDia[dow] ?? 0) + 1
    })
    const top = Object.entries(porDia).sort(([, x], [, y]) => y - x)
    const nomes = ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados']
    if (top.length > 0 && top[0][1] >= 3) {
      correlacoes.push({
        id: 'alcool-dow',
        titulo: `${nomes[Number(top[0][0])]} são o teu dia de risco`,
        descricao: `${top[0][1]} de ${alcool.length} registos. preparar o dia ajuda.`,
        forca: 'moderado',
        tipo: 'negativo',
        confianca: top[0][1] / alcool.length
      })
    }
  }

  return correlacoes.sort((a, b) => b.confianca - a.confianca)
}

// ===== ANOMALIAS =====

export type Anomalia = {
  date: string
  campo: string
  valor: number
  esperado: string
  pergunta: string
}

export function detectarAnomalias(): Anomalia[] {
  const dias = getTodosDias()
  if (dias.length < 7) return []

  const anomalias: Anomalia[] = []

  // Sono fora do normal
  const sonos = dias.map(d => d.sonoHoras).filter((s): s is number => s !== null)
  if (sonos.length >= 5) {
    const m = media(sonos)
    const sd = desvioPadrao(sonos)
    const recentes = dias.slice(-7).filter(d => d.sonoHoras !== null)
    recentes.forEach(d => {
      const v = d.sonoHoras as number
      if (sd > 0 && Math.abs(v - m) > 2 * sd) {
        anomalias.push({
          date: d.date,
          campo: 'sono',
          valor: v,
          esperado: `${m.toFixed(1)}h ± ${sd.toFixed(1)}`,
          pergunta: v < m ? `dormiste ${v}h. o que aconteceu?` : `dormiste ${v}h. estavas exausta?`
        })
      }
    })
  }

  // Energia inesperada (alto sono mas baixa energia, ou vice-versa)
  const recentes = dias.slice(-14).filter(d => d.sonoHoras !== null && d.energia !== null)
  recentes.forEach(d => {
    const sono = d.sonoHoras as number
    const energia = d.energia as number
    if (sono >= 7 && energia <= 2) {
      anomalias.push({
        date: d.date,
        campo: 'energia',
        valor: energia,
        esperado: `>3 com ${sono}h sono`,
        pergunta: 'dormiste bem mas energia baixa. faltou comer? hormonas?'
      })
    }
    if (sono <= 5 && energia >= 4) {
      anomalias.push({
        date: d.date,
        campo: 'energia',
        valor: energia,
        esperado: `<3 com ${sono}h sono`,
        pergunta: 'dormiste pouco mas estás bem. cortisol? café? adrenalina?'
      })
    }
  })

  return anomalias.slice(0, 5).sort((a, b) => b.date.localeCompare(a.date))
}

// ===== MELHORES DIAS =====

export function melhoresDias(top = 5): PontuacaoDia[] {
  const dias = getTodosDias()
  const pontos = dias.map(d => pontuarDia(d.date)).filter((p): p is PontuacaoDia => p !== null)
  return pontos.sort((a, b) => b.total - a.total).slice(0, top)
}

// ===== PROJECÇÃO =====

export type Projeccao = {
  diasNoPlano: number
  pontuacaoMedia: number
  pesoEstimado: number | null
  pesoMudanca: number | null
  cinturaEstimada: number | null
  cinturaMudanca: number | null
  ritmoMantido: boolean
}

export function projeccao14d(): Projeccao | null {
  const dias = getTodosDias()
  if (dias.length < 7) return null

  const media7 = pontuacaoMedia7d() ?? 0
  const ritmoMantido = media7 >= 60

  const pesos = getPesos()
  let pesoMudanca: number | null = null
  let pesoEstimado: number | null = null
  if (pesos.length >= 7) {
    const ult = pesos[pesos.length - 1].peso
    const ha7 = pesos[Math.max(0, pesos.length - 8)].peso
    const ritmoSemanal = ult - ha7
    pesoMudanca = Math.round(ritmoSemanal * 2 * 10) / 10 // projecção 14d
    pesoEstimado = Math.round((ult + pesoMudanca) * 10) / 10
  }

  // Cintura — se houver pelo menos 2 medições recentes
  let cinturaMudanca: number | null = null
  let cinturaEstimada: number | null = null

  return {
    diasNoPlano: dias.length,
    pontuacaoMedia: media7,
    pesoEstimado,
    pesoMudanca,
    cinturaEstimada,
    cinturaMudanca,
    ritmoMantido
  }
}
