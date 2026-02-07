// Sistema de progresso para a Escola do Breno
// Usa localStorage para persistencia local (sem necessidade de servidor)

const STORAGE_KEY = 'escola-breno-progresso'

function getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Marcar uma actividade como completada
export function marcarProgresso(dominio, camada, actividade, detalhe) {
  const data = getAll()
  const chave = `${dominio}.${camada}.${actividade}`

  if (!data[chave]) {
    data[chave] = { completados: [], ultimaVez: null, vezes: 0 }
  }

  if (!data[chave].completados.includes(detalhe)) {
    data[chave].completados.push(detalhe)
  }
  data[chave].ultimaVez = new Date().toISOString()
  data[chave].vezes = (data[chave].vezes || 0) + 1

  saveAll(data)
  return data[chave]
}

// Obter progresso de uma actividade
export function getProgresso(dominio, camada, actividade) {
  const data = getAll()
  const chave = `${dominio}.${camada}.${actividade}`
  return data[chave] || { completados: [], ultimaVez: null, vezes: 0 }
}

// Obter percentagem de progresso
export function getPercentagem(dominio, camada, actividade, total) {
  const prog = getProgresso(dominio, camada, actividade)
  if (total === 0) return 0
  return Math.round((prog.completados.length / total) * 100)
}

// Obter progresso geral de um dominio
export function getProgressoDominio(dominio) {
  const data = getAll()
  let total = 0
  let completados = 0

  Object.keys(data).forEach(chave => {
    if (chave.startsWith(dominio + '.')) {
      total += 1
      if (data[chave].completados.length > 0) {
        completados += 1
      }
    }
  })

  return { total, completados, percentagem: total > 0 ? Math.round((completados / total) * 100) : 0 }
}

// Total de estrelas (cada 5 items = 1 estrela)
export function getTotalEstrelas() {
  const data = getAll()
  let totalItems = 0
  Object.values(data).forEach(prog => {
    totalItems += prog.completados.length
  })
  return Math.floor(totalItems / 5)
}

// Verificar se um item foi completado
export function foiCompletado(dominio, camada, actividade, detalhe) {
  const prog = getProgresso(dominio, camada, actividade)
  return prog.completados.includes(detalhe)
}
