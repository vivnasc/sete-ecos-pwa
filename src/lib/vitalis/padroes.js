/**
 * padroes.js — detector de padrões nos registos do Vitalis.
 *
 * Recebe um array de registos brutos (refeições, check-ins, peso,
 * jejum, água, sono) e devolve uma lista de "padrões" detectados
 * em texto humano + tom educativo.
 *
 * Ex.: "jantares depois das 21h ligados a 1h menos de sono em 4/5 vezes"
 *
 * Regras simples (não IA) — para insights baratos e instantâneos.
 * Para análise IA semanal, ver api/insights-semanal.js.
 */

const DIA_MS = 86_400_000

function dataIsoDia(date) {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return null
  return d.toISOString().split('T')[0]
}

function diasUltimos(n, inicio = new Date()) {
  const arr = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(inicio)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    arr.push(d.toISOString().split('T')[0])
  }
  return arr
}

/**
 * Detectar padrões comuns.
 * @param {Object} dados — { refeicoes, registos, pesos, jejuns, aguas, sonos }
 *   cada um é array de objectos com pelo menos { data } ou { created_at }.
 * @param {number} dias — janela em dias (default 14)
 * @returns {Array<{ id, texto, importancia }>}
 */
export function detectarPadroes(dados = {}, dias = 14) {
  const {
    refeicoes = [],
    registos = [],
    pesos = [],
    jejuns = [],
    aguas = [],
    sonos = []
  } = dados

  const padroes = []
  const ultimosDias = diasUltimos(dias)
  const ultimosSet = new Set(ultimosDias)

  // 1. Frequência de registo de refeições
  const refeicoesPorDia = new Map()
  refeicoes.forEach(r => {
    const dia = dataIsoDia(r.data || r.created_at)
    if (!dia || !ultimosSet.has(dia)) return
    refeicoesPorDia.set(dia, (refeicoesPorDia.get(dia) || 0) + 1)
  })

  const diasComMeals = refeicoesPorDia.size
  const diasSemMeals = dias - diasComMeals

  if (diasComMeals >= dias * 0.8) {
    padroes.push({
      id: 'meals-consistente',
      texto: `registaste refeições em ${diasComMeals} dos últimos ${dias} dias. consistência rara.`,
      importancia: 'alta'
    })
  } else if (diasSemMeals >= dias * 0.5) {
    padroes.push({
      id: 'meals-falta',
      texto: `nos últimos ${dias} dias, ${diasSemMeals} ficaram sem refeições registadas. o que se vê melhora.`,
      importancia: 'media'
    })
  }

  // 2. Refeições registadas tarde (após 21h)
  let refeicoesTarde = 0
  let refeicoesTotal = 0
  refeicoes.forEach(r => {
    const dia = dataIsoDia(r.data || r.created_at)
    if (!dia || !ultimosSet.has(dia)) return
    refeicoesTotal++
    const hora = new Date(r.created_at || r.data).getHours()
    if (hora >= 21) refeicoesTarde++
  })

  if (refeicoesTotal > 5 && refeicoesTarde / refeicoesTotal > 0.3) {
    padroes.push({
      id: 'refeicoes-tarde',
      texto: `${Math.round((refeicoesTarde / refeicoesTotal) * 100)}% das refeições foram depois das 21h. fechar a janela mais cedo melhora sono e peso.`,
      importancia: 'media'
    })
  }

  // 3. Peso — tendência (descida vs subida)
  const pesosOrdenados = pesos
    .map(p => ({ data: dataIsoDia(p.data || p.created_at), peso: parseFloat(p.peso_kg || p.peso) }))
    .filter(p => p.data && !isNaN(p.peso) && ultimosSet.has(p.data))
    .sort((a, b) => a.data.localeCompare(b.data))

  if (pesosOrdenados.length >= 3) {
    const primeiro = pesosOrdenados[0].peso
    const ultimo = pesosOrdenados[pesosOrdenados.length - 1].peso
    const delta = ultimo - primeiro
    if (delta <= -0.5) {
      padroes.push({
        id: 'peso-desce',
        texto: `peso desceu ${Math.abs(delta).toFixed(1)}kg nos últimos ${dias} dias. devagar é o caminho.`,
        importancia: 'alta'
      })
    } else if (delta >= 0.5) {
      padroes.push({
        id: 'peso-sobe',
        texto: `peso subiu ${delta.toFixed(1)}kg nos últimos ${dias} dias. revê hidratação, sal e sono — não é necessariamente gordura.`,
        importancia: 'media'
      })
    } else {
      padroes.push({
        id: 'peso-estavel',
        texto: 'peso estável nas últimas duas semanas. plateau natural — confia no processo.',
        importancia: 'baixa'
      })
    }
  }

  // 4. Água diária — média
  const aguaPorDia = new Map()
  aguas.forEach(a => {
    const dia = dataIsoDia(a.data || a.created_at)
    if (!dia || !ultimosSet.has(dia)) return
    const ml = parseFloat(a.ml || a.quantidade || 0)
    aguaPorDia.set(dia, (aguaPorDia.get(dia) || 0) + ml)
  })

  if (aguaPorDia.size >= 3) {
    const total = [...aguaPorDia.values()].reduce((a, b) => a + b, 0)
    const media = total / aguaPorDia.size
    const litros = (media / 1000).toFixed(1)
    if (media < 1500) {
      padroes.push({
        id: 'agua-baixa',
        texto: `média de ${litros}L de água por dia. abaixo do recomendado — começa o dia com 2 copos.`,
        importancia: 'media'
      })
    } else if (media >= 2000) {
      padroes.push({
        id: 'agua-ok',
        texto: `média de ${litros}L de água por dia. hidratação no caminho certo.`,
        importancia: 'baixa'
      })
    }
  }

  // 5. Sono — média
  const sonosOrdenados = sonos
    .map(s => ({ data: dataIsoDia(s.data || s.created_at), h: parseFloat(s.horas || s.duracao_h || 0) }))
    .filter(s => s.data && s.h > 0 && ultimosSet.has(s.data))

  if (sonosOrdenados.length >= 3) {
    const media = sonosOrdenados.reduce((acc, s) => acc + s.h, 0) / sonosOrdenados.length
    if (media < 6) {
      padroes.push({
        id: 'sono-baixo',
        texto: `média de ${media.toFixed(1)}h de sono. cravings sobem quando dormes menos. tenta deitar 30 min mais cedo.`,
        importancia: 'alta'
      })
    } else if (media >= 7) {
      padroes.push({
        id: 'sono-ok',
        texto: `média de ${media.toFixed(1)}h de sono. dormir é alimentar.`,
        importancia: 'baixa'
      })
    }
  }

  // 6. Jejum — cumprimento
  const jejunsCumpridos = jejuns.filter(j => {
    const dia = dataIsoDia(j.data || j.created_at)
    return dia && ultimosSet.has(dia) && j.completou
  })
  if (jejunsCumpridos.length >= dias * 0.5) {
    padroes.push({
      id: 'jejum-consistente',
      texto: `cumpriste a janela alimentar em ${jejunsCumpridos.length} de ${dias} dias. forte.`,
      importancia: 'media'
    })
  }

  // 7. Check-ins — frequência
  const checkinsDias = new Set()
  registos.forEach(r => {
    const dia = dataIsoDia(r.data || r.created_at)
    if (dia && ultimosSet.has(dia)) checkinsDias.add(dia)
  })

  if (checkinsDias.size >= dias * 0.5 && checkinsDias.size < dias * 0.8) {
    padroes.push({
      id: 'checkin-pode-mais',
      texto: `check-in em ${checkinsDias.size}/${dias} dias. mais consistência aqui revela padrões que ainda escapam.`,
      importancia: 'baixa'
    })
  }

  // Ordenar por importância (alta → baixa)
  const ordem = { alta: 0, media: 1, baixa: 2 }
  padroes.sort((a, b) => (ordem[a.importancia] ?? 9) - (ordem[b.importancia] ?? 9))

  return padroes
}

/**
 * Calcula a "intensidade" de aderência num dia para o Heatmap60.
 * 0 = nada, 4 = tudo (refeição + check-in + água + treino + sono).
 */
export function intensidadeDia({
  temRefeicao = false,
  temCheckin = false,
  temAgua = false,
  temTreino = false,
  temSono = false
} = {}) {
  return [temRefeicao, temCheckin, temAgua, temTreino, temSono].filter(Boolean).length
}
