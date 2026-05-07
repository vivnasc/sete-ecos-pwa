'use client'

// Tool use da coach · schemas (enviados ao Claude) + executores (cliente)
// O servidor recebe os schemas via /api/coach. Quando o Claude responde com
// tool_use, o cliente executa via TOOL_EXECUTORS e devolve tool_result.

import { isoDate } from './dates'
import { ANCORAS } from './data'
import {
  saveDia,
  getDia,
  toggleAncora,
  addAlcoolRegisto,
  savePeso,
  saveJejum,
  getJejumHoje,
  saveCiclo,
  addRefeicao,
  getPesos,
  getRefeicoesDoDia,
  macrosDoDia,
  getJejuns,
  getCiclos,
  getAlcoolRegistos,
  getTodosDias,
  pesoUltimo,
  variacaoPeso,
  faseActualCiclo,
  diaActualCiclo,
  nomeFase,
  streakAncoras,
  diasSemAlcool,
  sonoMedio,
  type RefeicaoTipo
} from './storage'

// ===== SCHEMAS (enviados ao Claude) =====

export const COACH_TOOLS = [
  {
    name: 'registar_peso',
    description: 'Regista a pesagem da Vivianne. Usa quando ela disser o peso (ex: "pesei 72.4", "estou com 73 hoje"). Cintura é opcional, só nas sextas.',
    input_schema: {
      type: 'object',
      properties: {
        peso: { type: 'number', description: 'Peso em kg, ex: 72.4' },
        cintura: { type: 'number', description: 'Cintura em cm, opcional' },
        hora: { type: 'string', description: 'Hora HH:MM, opcional · default agora' },
        notas: { type: 'string', description: 'Nota opcional' }
      },
      required: ['peso']
    }
  },
  {
    name: 'registar_refeicao',
    description: 'Regista uma refeição que ela comeu. Tipo: pa (pequeno-almoço), almoco, snack, jantar. Estima macros se possível com base na descrição (keto: alta gordura, proteína moderada, carbo baixo).',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['pa', 'almoco', 'snack', 'jantar'], description: 'Tipo de refeição' },
        descricao: { type: 'string', description: 'O que comeu, ex: "3 ovos mexidos com abacate e folhas"' },
        hora: { type: 'string', description: 'Hora ISO ou HH:MM, opcional · default agora' },
        proteina_g: { type: 'number', description: 'Proteína estimada em gramas' },
        carbo_g: { type: 'number', description: 'Hidratos estimados em gramas' },
        gordura_g: { type: 'number', description: 'Gordura estimada em gramas' },
        calorias: { type: 'number', description: 'Calorias estimadas' },
        contexto: { type: 'string', description: 'Contexto: em casa, fora, viagem, etc' },
        sentir: { type: 'string', description: 'Como se sentiu depois: saciada, com fome, etc' }
      },
      required: ['tipo', 'descricao']
    }
  },
  {
    name: 'registar_alcool',
    description: 'Caderno antes do copo. Usa quando ela mencionar vontade de beber ou que bebeu. Regista emoção e gatilho.',
    input_schema: {
      type: 'object',
      properties: {
        decidiu_beber: { type: 'boolean', description: 'true se bebeu, false se decidiu não beber' },
        emocao: { type: 'string', description: 'Emoção dominante: cansaço, ansiedade, celebração, etc' },
        gatilho: { type: 'string', description: 'O que despoletou o impulso, opcional' },
        unidades: { type: 'number', description: 'Unidades bebidas, opcional · só se decidiu_beber=true' }
      },
      required: ['decidiu_beber', 'emocao']
    }
  },
  {
    name: 'registar_dia',
    description: 'Regista métricas do dia: sono, energia (1-5), humor (1-5), notas. Faz merge com o que já está registado.',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Data YYYY-MM-DD, default hoje' },
        sono_horas: { type: 'number', description: 'Horas dormidas, ex: 6.5' },
        energia: { type: 'integer', description: 'Energia 1-5' },
        humor: { type: 'integer', description: 'Humor 1-5' },
        notas: { type: 'string', description: 'Nota livre' }
      },
      required: []
    }
  },
  {
    name: 'registar_jejum',
    description: 'Marca início do jejum (última refeição da véspera) ou fim (primeira refeição de hoje). Se ela disser "comecei o jejum às 19h", tipo=inicio. Se ela disser "vou romper agora" ou "comi o PA", tipo=fim.',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['inicio', 'fim'], description: 'inicio (última refeição) ou fim (primeira refeição do dia)' },
        timestamp: { type: 'string', description: 'ISO timestamp ou HH:MM. Default agora.' }
      },
      required: ['tipo']
    }
  },
  {
    name: 'registar_ciclo',
    description: 'Regista início de período menstrual. Usar quando ela disser "começou o período".',
    input_schema: {
      type: 'object',
      properties: {
        data_inicio: { type: 'string', description: 'Data YYYY-MM-DD do primeiro dia, default hoje' },
        fluxo: { type: 'string', enum: ['leve', 'moderado', 'intenso'], description: 'Intensidade do fluxo' },
        sintomas: { type: 'array', items: { type: 'string' }, description: 'Lista de sintomas' },
        cravings: { type: 'array', items: { type: 'string' }, description: 'Lista de cravings' },
        notas: { type: 'string', description: 'Notas livres' }
      },
      required: []
    }
  },
  {
    name: 'marcar_ancora',
    description: 'Marca uma das 7 âncoras do dia. IDs disponíveis: ecra_21h, pa_proteina, janela_9_19, carbos_zero, eletrolitos, treino_feito, caderno_copo.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID da âncora' },
        feita: { type: 'boolean', description: 'true para marcar como feita, false para desmarcar' }
      },
      required: ['id', 'feita']
    }
  },
  {
    name: 'registar_agua',
    description: 'Adiciona ou define copos de água do dia. action=adicionar adiciona N copos; action=definir define o total.',
    input_schema: {
      type: 'object',
      properties: {
        copos: { type: 'number', description: 'Número de copos' },
        action: { type: 'string', enum: ['adicionar', 'definir'], description: 'Default: adicionar' }
      },
      required: ['copos']
    }
  },
  {
    name: 'registar_suplemento',
    description: 'Marca um suplemento como tomado hoje. IDs sugeridos: magnesio, vit_d, omega3, electrolitos. Aceita IDs novos.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Ex: magnesio, vit_d, omega3, electrolitos' },
        tomou: { type: 'boolean', description: 'true para marcar, false para desmarcar' }
      },
      required: ['id', 'tomou']
    }
  },
  {
    name: 'registar_transito',
    description: 'Regista trânsito intestinal do dia. Importante em keto · obstipação é sinal de eletrólitos baixos ou pouca fibra.',
    input_schema: {
      type: 'object',
      properties: {
        teve: { type: 'boolean', description: 'true se teve, false se não teve' }
      },
      required: ['teve']
    }
  },
  {
    name: 'consultar_dados',
    description: 'Consulta dados específicos sem ter de ler todo o contexto. Áreas: peso, jejum, ciclo, alcool, refeicoes_hoje, macros_hoje, ancoras_hoje, resumo.',
    input_schema: {
      type: 'object',
      properties: {
        area: { type: 'string', enum: ['peso', 'jejum', 'ciclo', 'alcool', 'refeicoes_hoje', 'macros_hoje', 'ancoras_hoje', 'resumo'] },
        dias: { type: 'integer', description: 'Quantos dias para trás, default 7' }
      },
      required: ['area']
    }
  }
] as const

// ===== EXECUTORES (cliente) =====

type ToolInput = Record<string, unknown>

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function bool(v: unknown): boolean {
  return v === true || v === 'true'
}

function resolveTimestamp(v: unknown): string {
  if (typeof v !== 'string' || !v) return new Date().toISOString()
  // ISO completo
  if (v.includes('T')) return v
  // HH:MM → hoje a essa hora
  if (/^\d{1,2}:\d{2}$/.test(v)) {
    const [h, m] = v.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }
  return new Date().toISOString()
}

function fmtPeso(p: number): string {
  return p.toFixed(1).replace('.', ',') + 'kg'
}

export type ToolResult = { ok: true; texto: string } | { ok: false; erro: string }

export const TOOL_EXECUTORS: Record<string, (input: ToolInput) => ToolResult> = {
  registar_peso(input) {
    const peso = num(input.peso)
    if (peso === null) return { ok: false, erro: 'peso inválido' }
    const cintura = num(input.cintura)
    const hora = str(input.hora) || new Date().toTimeString().slice(0, 5)
    const notas = str(input.notas)
    const date = isoDate()
    savePeso({ date, peso, cintura, hora, notas })
    const v = variacaoPeso()
    const delta = v.ultima !== null ? ` · ${v.ultima > 0 ? '+' : ''}${v.ultima.toFixed(1)}kg desde ontem` : ''
    return { ok: true, texto: `peso ${fmtPeso(peso)} registado às ${hora}${cintura !== null ? ` · cintura ${cintura}cm` : ''}${delta}` }
  },

  registar_refeicao(input) {
    const tipo = str(input.tipo) as RefeicaoTipo
    if (!['pa', 'almoco', 'snack', 'jantar'].includes(tipo)) return { ok: false, erro: 'tipo inválido' }
    const descricao = str(input.descricao)
    if (!descricao) return { ok: false, erro: 'descrição vazia' }
    const timestamp = resolveTimestamp(input.hora)
    addRefeicao({
      tipo,
      descricao,
      timestamp,
      proteinaG: num(input.proteina_g),
      carboG: num(input.carbo_g),
      gorduraG: num(input.gordura_g),
      calorias: num(input.calorias),
      contexto: str(input.contexto),
      sentir: str(input.sentir)
    })
    // Marca âncora do PA com proteína se aplicável
    if (tipo === 'pa' && (num(input.proteina_g) ?? 0) >= 25) {
      const dia = getDia()
      if (!dia.ancoras['pa_proteina']) {
        dia.ancoras['pa_proteina'] = true
        saveDia(dia)
      }
    }
    const m = macrosDoDia()
    return { ok: true, texto: `${tipo} registado · hoje: ${m.refeicoes}× refeições · ${Math.round(m.proteina)}g proteína · ${Math.round(m.carbo)}g carbo · ${Math.round(m.gordura)}g gordura` }
  },

  registar_alcool(input) {
    const decidiuBeber = bool(input.decidiu_beber)
    const emocao = str(input.emocao)
    const gatilho = str(input.gatilho)
    const unidades = num(input.unidades) ?? 0
    addAlcoolRegisto({ decidiuBeber, emocao, gatilho, unidades })
    if (!decidiuBeber) {
      const dia = getDia()
      if (!dia.ancoras['caderno_copo']) {
        dia.ancoras['caderno_copo'] = true
        saveDia(dia)
      }
    }
    return { ok: true, texto: decidiuBeber ? `registado · bebeu ${unidades}u · ${emocao}` : `registado · não bebeu · ${emocao} · âncora caderno_copo ✓` }
  },

  registar_dia(input) {
    const date = str(input.date) || isoDate()
    const dia = getDia(date)
    const sonoHoras = num(input.sono_horas)
    const energia = num(input.energia)
    const humor = num(input.humor)
    const notas = str(input.notas)
    if (sonoHoras !== null) dia.sonoHoras = sonoHoras
    if (energia !== null) dia.energia = Math.max(1, Math.min(5, Math.round(energia)))
    if (humor !== null) dia.humor = Math.max(1, Math.min(5, Math.round(humor)))
    if (notas) dia.notas = dia.notas ? dia.notas + '\n' + notas : notas
    saveDia(dia)
    const partes: string[] = []
    if (sonoHoras !== null) partes.push(`sono ${sonoHoras}h`)
    if (energia !== null) partes.push(`energia ${dia.energia}/5`)
    if (humor !== null) partes.push(`humor ${dia.humor}/5`)
    if (notas) partes.push('nota guardada')
    return { ok: true, texto: `dia ${date} · ${partes.join(' · ') || 'sem alterações'}` }
  },

  registar_jejum(input) {
    const tipo = str(input.tipo)
    if (!['inicio', 'fim'].includes(tipo)) return { ok: false, erro: 'tipo deve ser inicio ou fim' }
    const ts = resolveTimestamp(input.timestamp)
    const hoje = isoDate()
    const j = getJejumHoje() ?? { date: hoje, ultimaRefeicao: null, primeiraRefeicao: null, duracaoHoras: null, meta: 14, completou: false }
    if (tipo === 'inicio') j.ultimaRefeicao = ts
    else j.primeiraRefeicao = ts
    const saved = saveJejum({
      date: j.date,
      ultimaRefeicao: j.ultimaRefeicao,
      primeiraRefeicao: j.primeiraRefeicao,
      duracaoHoras: null,
      meta: j.meta,
      completou: false
    })
    if (tipo === 'fim' && saved.duracaoHoras !== null) {
      const ok = saved.completou ? '✓ meta cumprida' : `${saved.duracaoHoras}h · ${saved.meta - saved.duracaoHoras}h abaixo da meta`
      // âncora janela_9_19 se completou
      if (saved.completou) {
        const dia = getDia()
        if (!dia.ancoras['janela_9_19']) {
          dia.ancoras['janela_9_19'] = true
          saveDia(dia)
        }
      }
      return { ok: true, texto: `jejum fechado às ${ts.slice(11, 16)} · ${saved.duracaoHoras}h · ${ok}` }
    }
    return { ok: true, texto: tipo === 'inicio' ? `jejum começou às ${ts.slice(11, 16)}` : `jejum fechado às ${ts.slice(11, 16)}` }
  },

  registar_ciclo(input) {
    const dataInicio = str(input.data_inicio) || isoDate()
    const fluxo = str(input.fluxo) as 'leve' | 'moderado' | 'intenso' | ''
    const sintomas = Array.isArray(input.sintomas) ? input.sintomas.filter((s): s is string => typeof s === 'string') : []
    const cravings = Array.isArray(input.cravings) ? input.cravings.filter((s): s is string => typeof s === 'string') : []
    const notas = str(input.notas)
    saveCiclo({
      dataInicio,
      duracaoCiclo: null,
      duracaoMenstruacao: null,
      fluxo: fluxo || null,
      sintomas,
      cravings,
      notas
    })
    return { ok: true, texto: `ciclo registado · início ${dataInicio}${fluxo ? ' · fluxo ' + fluxo : ''}${sintomas.length ? ' · sintomas: ' + sintomas.join(', ') : ''}` }
  },

  registar_agua(input) {
    const copos = num(input.copos)
    if (copos === null) return { ok: false, erro: 'copos inválido' }
    const action = str(input.action) || 'adicionar'
    const dia = getDia()
    if (action === 'definir') dia.aguaCopos = Math.max(0, Math.round(copos))
    else dia.aguaCopos = Math.max(0, Math.min(20, dia.aguaCopos + Math.round(copos)))
    saveDia(dia)
    return { ok: true, texto: `água: ${dia.aguaCopos} copo${dia.aguaCopos === 1 ? '' : 's'} hoje` }
  },

  registar_suplemento(input) {
    const id = str(input.id).toLowerCase().replace(/\s+/g, '_')
    if (!id) return { ok: false, erro: 'id em falta' }
    const tomou = bool(input.tomou)
    const dia = getDia()
    const tem = dia.suplementos.includes(id)
    if (tomou && !tem) dia.suplementos = [...dia.suplementos, id]
    if (!tomou && tem) dia.suplementos = dia.suplementos.filter(s => s !== id)
    saveDia(dia)
    return { ok: true, texto: `${id}${tomou ? ' ✓' : ' · desmarcado'} · ${dia.suplementos.length} hoje` }
  },

  registar_transito(input) {
    const teve = bool(input.teve)
    const dia = getDia()
    dia.transitoIntestinal = teve ? 'sim' : 'nao'
    saveDia(dia)
    return { ok: true, texto: teve ? 'trânsito registado · sim' : 'trânsito registado · não' }
  },

  marcar_ancora(input) {
    const id = str(input.id)
    const feita = bool(input.feita)
    const valida = ANCORAS.find(a => a.id === id)
    if (!valida) return { ok: false, erro: `âncora desconhecida: ${id}` }
    const dia = getDia()
    dia.ancoras[id] = feita
    saveDia(dia)
    const total = Object.values(dia.ancoras).filter(Boolean).length
    return { ok: true, texto: `${valida.titulo}${feita ? ' ✓' : ' · desmarcada'} · ${total}/7 hoje` }
  },

  consultar_dados(input) {
    const area = str(input.area)
    const dias = num(input.dias) ?? 7
    const linhas: string[] = []
    switch (area) {
      case 'peso': {
        const ps = getPesos().slice(-dias)
        ps.forEach(p => linhas.push(`${p.date}: ${p.peso}kg${p.cintura ? ` · cintura ${p.cintura}cm` : ''}`))
        const v = variacaoPeso()
        if (v.semana !== null) linhas.push(`var semana: ${v.semana}kg · total: ${v.total}kg`)
        break
      }
      case 'jejum': {
        const js = getJejuns().slice(-dias)
        js.forEach(j => linhas.push(`${j.date}: ${j.duracaoHoras ?? '?'}h${j.completou ? ' ✓' : ''}`))
        break
      }
      case 'ciclo': {
        const cs = getCiclos().slice(-3)
        const fase = faseActualCiclo()
        const dia = diaActualCiclo()
        if (fase) linhas.push(`fase actual: ${nomeFase(fase)} · dia ${dia}`)
        cs.forEach(c => linhas.push(`${c.dataInicio}: ${c.duracaoCiclo ?? '?'}d · ${c.sintomas.join(', ') || 'sem sintomas'}`))
        break
      }
      case 'alcool': {
        const as_ = getAlcoolRegistos().slice(0, dias)
        as_.forEach(a => linhas.push(`${a.timestamp.slice(0, 16).replace('T', ' ')} · ${a.decidiuBeber ? a.unidades + 'u' : 'não'} · ${a.emocao}`))
        break
      }
      case 'refeicoes_hoje': {
        const lista = getRefeicoesDoDia()
        if (lista.length === 0) linhas.push('sem refeições registadas hoje')
        lista.forEach(r => linhas.push(`${r.timestamp.slice(11, 16)} · ${r.tipo} · ${r.descricao}${r.proteinaG ? ` · ${r.proteinaG}gP/${r.gorduraG}gG/${r.carboG}gC` : ''}`))
        break
      }
      case 'macros_hoje': {
        const m = macrosDoDia()
        linhas.push(`hoje: ${m.refeicoes}× · ${Math.round(m.proteina)}g proteína · ${Math.round(m.carbo)}g carbo · ${Math.round(m.gordura)}g gordura · ${m.calorias} kcal`)
        break
      }
      case 'ancoras_hoje': {
        const dia = getDia()
        ANCORAS.forEach(a => linhas.push(`${dia.ancoras[a.id] ? '✓' : '·'} ${a.id}: ${a.titulo}`))
        break
      }
      case 'resumo': {
        linhas.push(`hoje ${isoDate()}`)
        const peso = pesoUltimo()
        if (peso !== null) {
          const v = variacaoPeso()
          linhas.push(`peso: ${peso}kg · sem ${v.semana ?? '?'}kg · total ${v.total ?? '?'}kg`)
        }
        linhas.push(`streak âncoras: ${streakAncoras()}d · sem álcool: ${diasSemAlcool()}d`)
        const sm = sonoMedio()
        if (sm !== null) linhas.push(`sono médio 7d: ${sm}h`)
        const fase = faseActualCiclo()
        if (fase) linhas.push(`fase ciclo: ${nomeFase(fase)} · dia ${diaActualCiclo()}`)
        const m = macrosDoDia()
        linhas.push(`refeições hoje: ${m.refeicoes}× · ${Math.round(m.proteina)}gP · ${Math.round(m.carbo)}gC · ${Math.round(m.gordura)}gG`)
        break
      }
      default:
        return { ok: false, erro: `área desconhecida: ${area}` }
    }
    return { ok: true, texto: linhas.join('\n') || 'sem dados' }
  }
}

export function executeTool(name: string, input: ToolInput): ToolResult {
  const fn = TOOL_EXECUTORS[name]
  if (!fn) return { ok: false, erro: `tool desconhecida: ${name}` }
  try {
    return fn(input)
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'erro' }
  }
}

// Indica se há dados a forçar recarregar (usado por outras vistas via storage event)
export function hasMutatingTools(toolNames: string[]): boolean {
  return toolNames.some(n => n !== 'consultar_dados')
}
