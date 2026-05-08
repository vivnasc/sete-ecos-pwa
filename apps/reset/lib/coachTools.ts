'use client'

// Tool use da coach · schemas (enviados ao Claude) + executores (cliente)
// O servidor recebe os schemas via /api/coach. Quando o Claude responde com
// tool_use, o cliente executa via TOOL_EXECUTORS e devolve tool_result.

import { isoDate, horaLocal, dataLocal } from './dates'
import { getProfile, saveProfile, sugerirMetas, getAncorasActivas, getObjectivos, adicionarObjectivo, removerObjectivo, type Metas } from './profile'
import { syncProfile } from './sync'
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
  updateRefeicao,
  removeRefeicao,
  getRefeicoes,
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
  type Refeicao,
  type RefeicaoTipo
} from './storage'

function getRefeicoesNoIntervalo(desdeIso: string): Refeicao[] {
  return getRefeicoes().filter(r => r.timestamp >= desdeIso)
}

function prevDate(d: string): string {
  const dt = new Date(d)
  dt.setDate(dt.getDate() - 1)
  return dt.toISOString().slice(0, 10)
}

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
    name: 'actualizar_refeicao_recente',
    description: 'Actualiza a refeição MAIS RECENTE de hoje (opcionalmente do tipo especificado) com novos valores. USA ISTO em vez de registar_refeicao quando a Vivianne está a CORRIGIR ou COMPLETAR uma refeição já registada (ex: "afinal foram 4 ovos", "junta também o abacate", "estimei mal a proteína"). Só preencher os campos a alterar.',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['pa', 'almoco', 'snack', 'jantar'], description: 'Filtrar pela refeição mais recente deste tipo · opcional' },
        descricao: { type: 'string' },
        proteina_g: { type: 'number' },
        carbo_g: { type: 'number' },
        gordura_g: { type: 'number' },
        calorias: { type: 'number' },
        hora: { type: 'string', description: 'Nova hora HH:MM se a primeira estava errada' },
        sentir: { type: 'string' }
      },
      required: []
    }
  },
  {
    name: 'apagar_refeicao_recente',
    description: 'Apaga a refeição MAIS RECENTE de hoje (ou do tipo dado). Usar quando ela disser "tira isso", "apaga a última refeição", "registei errado, apaga".',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['pa', 'almoco', 'snack', 'jantar'] }
      },
      required: []
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
    name: 'registar_sono_detalhe',
    description: 'Regista detalhes do sono da noite passada: hora a que se deitou, horas dormidas, qualidade 1-5, quantas vezes acordou. Substitui registar_dia para sono.',
    input_schema: {
      type: 'object',
      properties: {
        hora_deitar: { type: 'string', description: 'HH:MM' },
        horas: { type: 'number', description: 'Total dormido' },
        qualidade: { type: 'integer', description: '1 (péssimo) a 5 (óptimo)' },
        acordou_vezes: { type: 'integer', description: 'Quantas vezes acordou' }
      },
      required: []
    }
  },
  {
    name: 'registar_sintoma_peri',
    description: 'Regista um sintoma peri/menopausa do dia. IDs: afrontamentos, suores_nocturnos, brain_fog, irritabilidade, ansiedade, fadiga, dores_articulares, libido_baixa, palpitacoes. Aceita IDs novos.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        teve: { type: 'boolean' }
      },
      required: ['id', 'teve']
    }
  },
  {
    name: 'registar_steps',
    description: 'Regista número de passos do dia (ex: do iPhone Health).',
    input_schema: {
      type: 'object',
      properties: {
        steps: { type: 'integer' }
      },
      required: ['steps']
    }
  },
  {
    name: 'registar_rhr',
    description: 'Regista frequência cardíaca em repouso (RHR) em bpm.',
    input_schema: {
      type: 'object',
      properties: {
        rhr: { type: 'integer', description: 'Batimentos por minuto em repouso' }
      },
      required: ['rhr']
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
    name: 'adicionar_objectivo',
    description: 'Guarda um objectivo pessoal. SEMPRE que ela mencionar uma meta/intenção/plano · não esperes pedido explícito. Sempre que possível, PREENCHE os campos estruturados (tipo, valor_inicial, valor_alvo, prazo_dias) para que a app construa um dashboard com gráficos automáticos. Ex: "quero ir de 83kg para 70kg em 60 dias" → tipo=peso, valor_inicial=83, valor_alvo=70, prazo_dias=60. Se não houver números claros, deixa só o texto.',
    input_schema: {
      type: 'object',
      properties: {
        texto: { type: 'string', description: 'Frase clara · usa as palavras dela.' },
        tipo: { type: 'string', enum: ['peso', 'cintura', 'sono', 'proteina', 'agua', 'alcool', 'treino', 'custom'] },
        valor_inicial: { type: 'number', description: 'Valor onde está hoje (peso actual, sono actual, etc)' },
        valor_alvo: { type: 'number', description: 'Valor a atingir' },
        prazo_dias: { type: 'integer', description: 'Dias para atingir o alvo' }
      },
      required: ['texto']
    }
  },
  {
    name: 'remover_objectivo',
    description: 'Remove um objectivo pelo id. Lista primeiro com listar_objectivos para descobrir o id certo.',
    input_schema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id']
    }
  },
  {
    name: 'listar_objectivos',
    description: 'Devolve os objectivos pessoais guardados. Sempre que a abertura é gerada, lista isto e mede progresso de cada um contra os dados actuais.',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'definir_perfil',
    description: 'Guarda dados pessoais essenciais para cálculo TMB/TDEE: idade, altura (cm), nível de actividade. Usa SEMPRE que a Vivianne mencionar a sua idade ou altura, ou quando precisares de fazer cálculos e faltarem. Pergunta se ainda não os tens.',
    input_schema: {
      type: 'object',
      properties: {
        idade: { type: 'integer', description: 'Idade em anos' },
        altura_cm: { type: 'integer', description: 'Altura em cm (1m65 = 165)' },
        nivel_actividade: { type: 'string', enum: ['sedentaria', 'leve', 'moderada', 'activa'] }
      },
      required: []
    }
  },
  {
    name: 'definir_metas',
    description: 'Define ou ajusta as metas diárias da Vivianne (calorias, proteína, carbo, gordura). Usar quando ela pedir para definir/ajustar metas, ou quando os dados mostrarem que devem mudar. Se não souberes os números, usa sugerir_metas primeiro. Passar null num campo para limpar.',
    input_schema: {
      type: 'object',
      properties: {
        calorias: { type: 'number' },
        proteina_g: { type: 'number' },
        carbo_g: { type: 'number' },
        gordura_g: { type: 'number' },
        motivo: { type: 'string', description: 'Razão curta para ela (ex: "perder devagar 0.3kg/sem", "manter actual")' }
      },
      required: []
    }
  },
  {
    name: 'sugerir_metas',
    description: 'Calcula sugestão de metas baseada no peso actual + objectivo + actividade. Devolve os números sem os definir. Usa quando ela perguntar "quanto devo comer".',
    input_schema: {
      type: 'object',
      properties: {
        objectivo: { type: 'string', enum: ['manter', 'perder_devagar', 'perder', 'ganhar'] },
        actividade: { type: 'string', enum: ['sedentaria', 'leve', 'activa'], description: 'Default: leve' }
      },
      required: ['objectivo']
    }
  },
  {
    name: 'analisar_padroes',
    description: 'Devolve padrões dos últimos N dias para basear recomendações. Áreas: alimentos_frequentes, macros_media, nutrientes, sono_padrao, sintomas_padrao, suplementos_padrao, alcool_padrao, peso_tendencia, correlacoes, comparar_semanas, tudo. correlacoes deteta ligações entre álcool/sono/humor/sintomas. comparar_semanas mostra esta semana vs anterior.',
    input_schema: {
      type: 'object',
      properties: {
        area: { type: 'string', enum: ['alimentos_frequentes', 'macros_media', 'nutrientes', 'sono_padrao', 'sintomas_padrao', 'suplementos_padrao', 'alcool_padrao', 'peso_tendencia', 'correlacoes', 'comparar_semanas', 'tudo'] },
        dias: { type: 'integer', description: 'Janela em dias, default 14' }
      },
      required: ['area']
    }
  },
  {
    name: 'gerar_lista_compras',
    description: 'Gera sugestão de lista de compras com base nas refeições mais frequentes dos últimos N dias. Quantidades estimadas para uma semana. Não impõe plano.',
    input_schema: {
      type: 'object',
      properties: {
        dias_analise: { type: 'integer', description: 'Janela para analisar padrão · default 14' },
        pessoas: { type: 'integer', description: 'Número de pessoas · default 1' }
      },
      required: []
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

  actualizar_refeicao_recente(input) {
    const tipoFiltro = str(input.tipo) as RefeicaoTipo | ''
    const lista = getRefeicoesDoDia()
    const candidatas = tipoFiltro ? lista.filter(r => r.tipo === tipoFiltro) : lista
    if (candidatas.length === 0) {
      return { ok: false, erro: tipoFiltro ? `sem refeição de ${tipoFiltro} hoje para actualizar` : 'sem refeições registadas hoje' }
    }
    // mais recente
    const recente = candidatas[candidatas.length - 1]
    const patch: Partial<Omit<Refeicao, 'id'>> = {}
    if (typeof input.descricao === 'string' && input.descricao) patch.descricao = input.descricao
    const p = num(input.proteina_g); if (p !== null) patch.proteinaG = p
    const c = num(input.carbo_g); if (c !== null) patch.carboG = c
    const g = num(input.gordura_g); if (g !== null) patch.gorduraG = g
    const k = num(input.calorias); if (k !== null) patch.calorias = Math.round(k)
    const sentir = str(input.sentir); if (sentir) patch.sentir = sentir
    const horaRaw = str(input.hora)
    if (horaRaw && /^\d{1,2}:\d{2}$/.test(horaRaw)) {
      const [h, mn] = horaRaw.split(':').map(Number)
      const d = new Date(recente.timestamp)
      d.setHours(h, mn, 0, 0)
      patch.timestamp = d.toISOString()
    }
    if (Object.keys(patch).length === 0) return { ok: false, erro: 'nada para actualizar · indica pelo menos um campo' }
    const r = updateRefeicao(recente.id, patch)
    if (!r) return { ok: false, erro: 'refeição não encontrada' }
    const m = macrosDoDia()
    return { ok: true, texto: `actualizado · ${r.tipo}: ${r.descricao}${r.proteinaG !== null ? ` · ${Math.round(r.proteinaG)}gP` : ''}${r.carboG !== null ? ` · ${Math.round(r.carboG)}gC` : ''}${r.gorduraG !== null ? ` · ${Math.round(r.gorduraG)}gG` : ''} · total dia: ${Math.round(m.calorias)}kcal` }
  },

  apagar_refeicao_recente(input) {
    const tipoFiltro = str(input.tipo) as RefeicaoTipo | ''
    const lista = getRefeicoesDoDia()
    const candidatas = tipoFiltro ? lista.filter(r => r.tipo === tipoFiltro) : lista
    if (candidatas.length === 0) {
      return { ok: false, erro: tipoFiltro ? `sem refeição de ${tipoFiltro} hoje para apagar` : 'sem refeições hoje' }
    }
    const recente = candidatas[candidatas.length - 1]
    removeRefeicao(recente.id)
    return { ok: true, texto: `apagado · ${recente.tipo}: ${recente.descricao}` }
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
      return { ok: true, texto: `jejum fechado às ${horaLocal(ts)} · ${saved.duracaoHoras}h · ${ok}` }
    }
    return { ok: true, texto: tipo === 'inicio' ? `jejum começou às ${horaLocal(ts)}` : `jejum fechado às ${horaLocal(ts)}` }
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

  registar_sono_detalhe(input) {
    const dia = getDia()
    const horaDeitar = str(input.hora_deitar)
    const horas = num(input.horas)
    const qualidade = num(input.qualidade)
    const acordouVezes = num(input.acordou_vezes)
    if (horaDeitar) dia.horaDeitar = horaDeitar
    if (horas !== null) dia.sonoHoras = horas
    if (qualidade !== null) dia.qualidadeSono = Math.max(1, Math.min(5, Math.round(qualidade)))
    if (acordouVezes !== null) dia.acordouVezes = Math.max(0, Math.round(acordouVezes))
    saveDia(dia)
    const partes: string[] = []
    if (dia.horaDeitar) partes.push(`deitou ${dia.horaDeitar}`)
    if (dia.sonoHoras !== null) partes.push(`${dia.sonoHoras}h`)
    if (dia.qualidadeSono !== null) partes.push(`qualidade ${dia.qualidadeSono}/5`)
    if (dia.acordouVezes !== null && dia.acordouVezes > 0) partes.push(`acordou ${dia.acordouVezes}×`)
    return { ok: true, texto: `sono · ${partes.join(' · ') || 'sem alterações'}` }
  },

  registar_sintoma_peri(input) {
    const id = str(input.id).toLowerCase().replace(/\s+/g, '_')
    if (!id) return { ok: false, erro: 'id em falta' }
    const teve = bool(input.teve)
    const dia = getDia()
    const tem = dia.sintomasPeri.includes(id)
    if (teve && !tem) dia.sintomasPeri = [...dia.sintomasPeri, id]
    if (!teve && tem) dia.sintomasPeri = dia.sintomasPeri.filter(s => s !== id)
    saveDia(dia)
    return { ok: true, texto: `${id.replace('_', ' ')}${teve ? ' ✓' : ' · desmarcado'} · ${dia.sintomasPeri.length} sintomas hoje` }
  },

  registar_steps(input) {
    const steps = num(input.steps)
    if (steps === null) return { ok: false, erro: 'steps inválido' }
    const dia = getDia()
    dia.steps = Math.max(0, Math.round(steps))
    saveDia(dia)
    return { ok: true, texto: `${dia.steps.toLocaleString('pt-PT')} passos hoje` }
  },

  registar_rhr(input) {
    const rhr = num(input.rhr)
    if (rhr === null) return { ok: false, erro: 'rhr inválido' }
    const dia = getDia()
    dia.rhr = Math.max(30, Math.min(150, Math.round(rhr)))
    saveDia(dia)
    return { ok: true, texto: `RHR ${dia.rhr} bpm` }
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
    const valida = getAncorasActivas().find(a => a.id === id)
    if (!valida) return { ok: false, erro: `âncora desconhecida: ${id}` }
    const dia = getDia()
    dia.ancoras[id] = feita
    saveDia(dia)
    const total = Object.values(dia.ancoras).filter(Boolean).length
    return { ok: true, texto: `${valida.titulo}${feita ? ' ✓' : ' · desmarcada'} · ${total}/7 hoje` }
  },

  adicionar_objectivo(input) {
    const texto = str(input.texto)
    if (!texto.trim()) return { ok: false, erro: 'texto vazio' }
    // Dedup · se já existe um objectivo com texto muito similar nos últimos 10 min, devolve o existente
    const recentes = getObjectivos().filter(o => {
      const idade = Date.now() - new Date(o.criadoEm).getTime()
      return idade < 10 * 60 * 1000
    })
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
    const dup = recentes.find(o => norm(o.texto) === norm(texto))
    if (dup) {
      return { ok: true, texto: `objectivo já estava guardado: "${dup.texto}" · não dupliquei` }
    }
    const tipo = str(input.tipo) as 'peso' | 'cintura' | 'sono' | 'proteina' | 'agua' | 'alcool' | 'treino' | 'custom' | ''
    const valorInicial = num(input.valor_inicial) ?? undefined
    const valorAlvo = num(input.valor_alvo) ?? undefined
    const prazoDias = num(input.prazo_dias) ?? undefined
    const novo = adicionarObjectivo(texto, {
      tipo: tipo || undefined,
      valorInicial,
      valorAlvo,
      prazoDias: prazoDias ? Math.round(prazoDias) : undefined
    })
    const partes: string[] = [`"${novo.texto}"`]
    if (tipo && valorInicial !== undefined && valorAlvo !== undefined && prazoDias) {
      partes.push(`tracking: ${tipo} ${valorInicial}→${valorAlvo} em ${prazoDias}d`)
    }
    return { ok: true, texto: `objectivo guardado · ${partes.join(' · ')}` }
  },

  remover_objectivo(input) {
    const id = str(input.id)
    if (!id) return { ok: false, erro: 'id em falta' }
    const lista = getObjectivos()
    const o = lista.find(x => x.id === id)
    if (!o) return { ok: false, erro: 'objectivo não encontrado' }
    removerObjectivo(id)
    return { ok: true, texto: `objectivo removido: "${o.texto}"` }
  },

  listar_objectivos() {
    const lista = getObjectivos()
    if (lista.length === 0) return { ok: true, texto: 'sem objectivos guardados ainda' }
    return { ok: true, texto: lista.map(o => `${o.id}: ${o.texto}`).join('\n') }
  },

  definir_perfil(input) {
    const idade = num(input.idade)
    const alturaCm = num(input.altura_cm)
    const nivelAct = str(input.nivel_actividade) as 'sedentaria' | 'leve' | 'moderada' | 'activa' | ''
    const patch: Partial<{ idade: number; alturaCm: number; nivelActividade: 'sedentaria' | 'leve' | 'moderada' | 'activa' }> = {}
    const partes: string[] = []
    if (idade !== null && idade > 10 && idade < 100) {
      patch.idade = Math.round(idade)
      partes.push(`idade ${patch.idade}`)
    }
    if (alturaCm !== null && alturaCm > 100 && alturaCm < 220) {
      patch.alturaCm = Math.round(alturaCm)
      partes.push(`altura ${patch.alturaCm}cm`)
    }
    if (nivelAct && ['sedentaria', 'leve', 'moderada', 'activa'].includes(nivelAct)) {
      patch.nivelActividade = nivelAct
      partes.push(`actividade ${nivelAct}`)
    }
    if (partes.length === 0) return { ok: false, erro: 'nenhum campo válido para guardar' }
    const guardado = saveProfile(patch)
    void syncProfile(guardado as unknown as Record<string, unknown>).catch(() => {})
    return { ok: true, texto: `perfil actualizado · ${partes.join(' · ')}` }
  },

  definir_metas(input) {
    const perfil = getProfile()
    const novas: Metas = { ...perfil.metas }
    const cal = input.calorias === null ? null : num(input.calorias)
    const p = input.proteina_g === null ? null : num(input.proteina_g)
    const c = input.carbo_g === null ? null : num(input.carbo_g)
    const g = input.gordura_g === null ? null : num(input.gordura_g)
    if (cal !== undefined) novas.calorias = cal === null ? null : Math.round(cal)
    if (p !== undefined) novas.proteinaG = p === null ? null : Math.round(p)
    if (c !== undefined) novas.carboG = c === null ? null : Math.round(c)
    if (g !== undefined) novas.gorduraG = g === null ? null : Math.round(g)
    const guardado = saveProfile({ metas: novas })
    void syncProfile(guardado as unknown as Record<string, unknown>).catch(() => {})
    const motivo = str(input.motivo)
    const partes: string[] = []
    if (novas.calorias !== null) partes.push(`${novas.calorias} kcal`)
    if (novas.proteinaG !== null) partes.push(`${novas.proteinaG}g P`)
    if (novas.carboG !== null) partes.push(`${novas.carboG}g C`)
    if (novas.gorduraG !== null) partes.push(`${novas.gorduraG}g G`)
    return { ok: true, texto: `metas: ${partes.join(' · ') || 'limpas'}${motivo ? ' · ' + motivo : ''}` }
  },

  sugerir_metas(input) {
    const peso = pesoUltimo()
    if (!peso) return { ok: false, erro: 'sem peso registado · pesa-te primeiro ou diz-me o teu peso' }
    const objectivo = str(input.objectivo) as 'manter' | 'perder_devagar' | 'perder' | 'ganhar'
    if (!['manter', 'perder_devagar', 'perder', 'ganhar'].includes(objectivo)) return { ok: false, erro: 'objectivo inválido' }
    const profile = getProfile()
    const actividade = (str(input.actividade) || profile.nivelActividade || 'leve') as 'sedentaria' | 'leve' | 'moderada' | 'activa'
    const sug = sugerirMetas({
      pesoKg: peso,
      objectivo,
      actividade,
      alturaCm: profile.alturaCm,
      idade: profile.idade,
      sexo: profile.sexo
    })
    const protGperKg = objectivo === 'perder' ? 2.2 : objectivo === 'perder_devagar' ? 2.0 : objectivo === 'ganhar' ? 1.8 : 1.6
    const gordGperKg = (objectivo === 'perder' || objectivo === 'perder_devagar') ? 0.8 : 1.0
    const kcalTotal = sug.calorias ?? 0
    const protG = sug.proteinaG ?? 0
    const gordG = sug.gorduraG ?? 0
    const carbG = sug.carboG ?? 0
    const protKcal = protG * 4
    const gordKcal = gordG * 9
    const linhas: string[] = [`cálculo (${sug.metodo}):`]
    if (sug.aviso) linhas.push(`⚠ ${sug.aviso}`)
    if (sug.tmb && sug.tdee) {
      const factorMap = { sedentaria: 1.2, leve: 1.375, moderada: 1.55, activa: 1.725 } as const
      const ajusteMap = { manter: 0, perder_devagar: -250, perder: -500, ganhar: +300 } as const
      linhas.push(`· TMB: 10×${peso} + 6.25×${profile.alturaCm} − 5×${profile.idade}${profile.sexo === 'M' ? ' + 5' : ' − 161'} = ${sug.tmb} kcal`)
      linhas.push(`· TDEE: ${sug.tmb} × ${factorMap[actividade]} (${actividade}) = ${sug.tdee} kcal`)
      linhas.push(`· objectivo (${objectivo}): TDEE ${ajusteMap[objectivo] >= 0 ? '+' : ''}${ajusteMap[objectivo]} = ${sug.tdee + ajusteMap[objectivo]} → ${kcalTotal}${sug.aviso ? ' (com floor aplicado)' : ''}`)
    } else {
      linhas.push(`· kcal: heurística kcal/kg sem altura+idade. Recomendo preencher /definicoes para Mifflin-St Jeor.`)
    }
    linhas.push(`· proteína: ${peso}kg × ${protGperKg} g/kg (${objectivo === 'perder' || objectivo === 'perder_devagar' ? 'mais alta em déficit · preserva massa magra' : 'manutenção'}) = ${protG}g (${protKcal} kcal)`)
    linhas.push(`· gordura: ${peso}kg × ${gordGperKg} g/kg = ${gordG}g (${gordKcal} kcal)`)
    linhas.push(`· carbo: resto = ${kcalTotal} − ${protKcal} − ${gordKcal} = ${kcalTotal - protKcal - gordKcal} kcal → ${carbG}g`)
    return { ok: true, texto: `sugestão (${objectivo}, ${actividade}): ${kcalTotal} kcal · ${protG}g P · ${carbG}g C · ${gordG}g G\n\n${linhas.join('\n')}` }
  },

  analisar_padroes(input) {
    const area = str(input.area)
    const dias = num(input.dias) ?? 14
    const desde = new Date()
    desde.setDate(desde.getDate() - dias)
    const desdeIso = desde.toISOString()
    const linhas: string[] = []

    const fazAlimentos = () => {
      const refeicoes = getRefeicoesNoIntervalo(desdeIso)
      if (refeicoes.length === 0) {
        linhas.push('alimentos: sem refeições registadas no período')
        return
      }
      // contagem por descrição (palavras-chave normalizadas)
      const contagem = new Map<string, number>()
      refeicoes.forEach(r => {
        const norm = r.descricao.toLowerCase()
          .replace(/[^a-záéíóúâêôãõç\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 3 && !['mexidos', 'grelhado', 'grelhada', 'cozido', 'cozida', 'assado', 'assada', 'salada', 'pequeno', 'almoço'].includes(w))
        norm.forEach(w => contagem.set(w, (contagem.get(w) ?? 0) + 1))
      })
      const top = [...contagem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
      linhas.push(`alimentos top ${dias}d: ${top.map(([w, n]) => `${w}(${n})`).join(', ')}`)
    }

    const fazMacros = () => {
      const refeicoes = getRefeicoesNoIntervalo(desdeIso)
      if (refeicoes.length === 0) {
        linhas.push('macros: sem dados')
        return
      }
      // agregar por dia
      const porDia = new Map<string, { p: number; c: number; g: number; k: number; n: number }>()
      refeicoes.forEach(r => {
        const date = r.timestamp.slice(0, 10)
        const cur = porDia.get(date) ?? { p: 0, c: 0, g: 0, k: 0, n: 0 }
        cur.p += r.proteinaG ?? 0
        cur.c += r.carboG ?? 0
        cur.g += r.gorduraG ?? 0
        cur.k += r.calorias ?? 0
        cur.n += 1
        porDia.set(date, cur)
      })
      const total = [...porDia.values()].reduce((acc, d) => ({ p: acc.p + d.p, c: acc.c + d.c, g: acc.g + d.g, k: acc.k + d.k, n: acc.n + d.n }), { p: 0, c: 0, g: 0, k: 0, n: 0 })
      const ndias = porDia.size
      linhas.push(`macros média/dia (${ndias}d com registo): ${Math.round(total.k / ndias)} kcal · ${Math.round(total.p / ndias)}g P · ${Math.round(total.c / ndias)}g C · ${Math.round(total.g / ndias)}g G · ${(total.n / ndias).toFixed(1)} refeições/dia`)
      // vs metas
      const metas = getProfile().metas
      if (metas.calorias) {
        const med = total.k / ndias
        const delta = med - metas.calorias
        linhas.push(`vs meta kcal: ${delta > 0 ? '+' : ''}${Math.round(delta)} (${Math.round(med)}/${metas.calorias})`)
      }
      if (metas.proteinaG) {
        const med = total.p / ndias
        const delta = med - metas.proteinaG
        linhas.push(`vs meta proteína: ${delta > 0 ? '+' : ''}${Math.round(delta)}g (${Math.round(med)}/${metas.proteinaG})`)
      }
    }

    const fazSono = () => {
      const ds = getTodosDias().filter(d => d.date >= desdeIso.slice(0, 10))
      const comSono = ds.filter(d => d.sonoHoras !== null)
      if (comSono.length === 0) { linhas.push('sono: sem dados'); return }
      const med = comSono.reduce((s, d) => s + (d.sonoHoras ?? 0), 0) / comSono.length
      const qual = ds.filter(d => d.qualidadeSono !== null)
      const medQ = qual.length > 0 ? qual.reduce((s, d) => s + (d.qualidadeSono ?? 0), 0) / qual.length : null
      const acordou = ds.filter(d => d.acordouVezes !== null)
      const medA = acordou.length > 0 ? acordou.reduce((s, d) => s + (d.acordouVezes ?? 0), 0) / acordou.length : null
      linhas.push(`sono ${dias}d: média ${med.toFixed(1)}h${medQ ? ` · qualidade ${medQ.toFixed(1)}/5` : ''}${medA !== null ? ` · acordou ${medA.toFixed(1)}×/noite` : ''} (${comSono.length}/${ds.length} dias)`)
    }

    const fazSintomas = () => {
      const ds = getTodosDias().filter(d => d.date >= desdeIso.slice(0, 10))
      const contagem = new Map<string, number>()
      ds.forEach(d => d.sintomasPeri.forEach(s => contagem.set(s, (contagem.get(s) ?? 0) + 1)))
      if (contagem.size === 0) { linhas.push('sintomas peri: nenhum registado'); return }
      const top = [...contagem.entries()].sort((a, b) => b[1] - a[1])
      linhas.push(`sintomas peri ${dias}d: ${top.map(([s, n]) => `${s.replace('_', ' ')}(${n}x)`).join(', ')}`)
    }

    const fazSuplementos = () => {
      const ds = getTodosDias().filter(d => d.date >= desdeIso.slice(0, 10))
      const contagem = new Map<string, number>()
      ds.forEach(d => d.suplementos.forEach(s => contagem.set(s, (contagem.get(s) ?? 0) + 1)))
      if (contagem.size === 0) { linhas.push('suplementos: nenhum registado'); return }
      const ndias = ds.length
      const linha = [...contagem.entries()].map(([s, n]) => `${s.replace('_', ' ')} ${n}/${ndias}d`).join(' · ')
      linhas.push(`suplementos ${dias}d: ${linha}`)
    }

    const fazAlcool = () => {
      const al = getAlcoolRegistos().filter(a => a.timestamp >= desdeIso)
      if (al.length === 0) { linhas.push(`álcool ${dias}d: nenhum registo`); return }
      const bebeu = al.filter(a => a.decidiuBeber)
      const naoBebeu = al.filter(a => !a.decidiuBeber)
      const totalUnidades = bebeu.reduce((s, a) => s + a.unidades, 0)
      const emocoes = new Map<string, number>()
      al.forEach(a => emocoes.set(a.emocao, (emocoes.get(a.emocao) ?? 0) + 1))
      const topEmocoes = [...emocoes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
      linhas.push(`álcool ${dias}d: ${bebeu.length}× bebeu (${totalUnidades}u total) · ${naoBebeu.length}× resistiu · emoções: ${topEmocoes.map(([e, n]) => `${e}(${n})`).join(', ')}`)
    }

    const fazPeso = () => {
      const ps = getPesos().filter(p => p.date >= desdeIso.slice(0, 10))
      if (ps.length < 2) { linhas.push('peso: sem dados suficientes'); return }
      const primeiro = ps[0].peso
      const ultimo = ps[ps.length - 1].peso
      const delta = ultimo - primeiro
      linhas.push(`peso ${dias}d: ${primeiro}→${ultimo} (${delta > 0 ? '+' : ''}${delta.toFixed(1)}kg em ${ps.length} pesagens)`)
    }

    const fazNutrientes = () => {
      const refeicoes = getRefeicoesNoIntervalo(desdeIso)
      const ds = getTodosDias().filter(d => d.date >= desdeIso.slice(0, 10))
      if (refeicoes.length === 0) {
        linhas.push('nutrientes: sem refeições para analisar')
        return
      }
      const peso = pesoUltimo() ?? 70
      // Proteína média/dia
      const porDia = new Map<string, { p: number }>()
      refeicoes.forEach(r => {
        const date = r.timestamp.slice(0, 10)
        const cur = porDia.get(date) ?? { p: 0 }
        cur.p += r.proteinaG ?? 0
        porDia.set(date, cur)
      })
      const ndias = porDia.size
      const proteinaMedia = ndias > 0 ? [...porDia.values()].reduce((s, d) => s + d.p, 0) / ndias : 0
      const proteinaTarget = peso * 1.6
      const flagsProteina = proteinaMedia < proteinaTarget * 0.8
      // Variedade de descrições
      const todasDesc = refeicoes.map(r => r.descricao.toLowerCase())
      const palavras = new Set<string>()
      todasDesc.forEach(d => d.split(/[\s,]+/).filter(w => w.length > 3).forEach(w => palavras.add(w)))
      const variedade = palavras.size
      // Greens / vegetais (heurística por palavras-chave)
      const greens = ['espinafre', 'brócol', 'couve', 'alface', 'rúcula', 'agrião', 'matapa', 'folhas', 'salada', 'curgete', 'courgette', 'pepino', 'tomate']
      const refsComGreens = refeicoes.filter(r => greens.some(g => r.descricao.toLowerCase().includes(g)))
      const pctGreens = (refsComGreens.length / refeicoes.length) * 100
      // Ómega-3 (peixes gordos)
      const peixes = ['salmão', 'sardinha', 'cavala', 'atum', 'truta']
      const refsComPeixe = refeicoes.filter(r => peixes.some(p => r.descricao.toLowerCase().includes(p)))
      // Suplementos médios
      const totalSupDias = ds.length
      const magnesioFreq = ds.filter(d => d.suplementos.includes('magnesio')).length
      const vitDFreq = ds.filter(d => d.suplementos.includes('vit_d')).length
      // Trânsito / fibra
      const transitoNao = ds.filter(d => d.transitoIntestinal === 'nao').length
      // Hidratação
      const aguaMedia = ds.length > 0 ? ds.reduce((s, d) => s + d.aguaCopos, 0) / ds.length : 0

      const sinais: string[] = []
      sinais.push(`proteína média: ${Math.round(proteinaMedia)}g/d (alvo ${Math.round(proteinaTarget)}g · ${(proteinaMedia / proteinaTarget * 100).toFixed(0)}%)${flagsProteina ? ' ⚠ baixa' : ''}`)
      sinais.push(`variedade alimentar: ${variedade} palavras únicas em ${refeicoes.length} refeições`)
      sinais.push(`vegetais/folhas: ${refsComGreens.length}/${refeicoes.length} refeições (${Math.round(pctGreens)}%)${pctGreens < 40 ? ' ⚠ pouca' : ''}`)
      sinais.push(`peixes ómega-3: ${refsComPeixe.length}/${refeicoes.length}${refsComPeixe.length === 0 ? ' ⚠ ausente' : ''}`)
      if (totalSupDias > 0) {
        sinais.push(`magnésio: ${magnesioFreq}/${totalSupDias}d${magnesioFreq < totalSupDias * 0.5 ? ' ⚠ irregular' : ''}`)
        sinais.push(`vit D: ${vitDFreq}/${totalSupDias}d${vitDFreq < totalSupDias * 0.5 ? ' ⚠ irregular' : ''}`)
      }
      if (transitoNao > 2) sinais.push(`trânsito não em ${transitoNao}d ⚠ atenção fibra/eletrólitos`)
      sinais.push(`água: ${aguaMedia.toFixed(1)} copos/d${aguaMedia < 6 ? ' ⚠ baixa' : ''}`)
      linhas.push(`nutrientes ${dias}d:`)
      sinais.forEach(s => linhas.push('· ' + s))
    }

    const fazCorrelacoes = () => {
      const ds = getTodosDias().filter(d => d.date >= desdeIso.slice(0, 10))
      const al = getAlcoolRegistos().filter(a => a.timestamp >= desdeIso)
      if (ds.length < 5) { linhas.push('correlações: dados insuficientes (mínimo 5 dias)'); return }
      // Map álcool por dia
      const alcoolPorDia = new Map<string, number>()
      al.filter(a => a.decidiuBeber).forEach(a => {
        const d = a.timestamp.slice(0, 10)
        alcoolPorDia.set(d, (alcoolPorDia.get(d) ?? 0) + a.unidades)
      })
      const linhasC: string[] = []
      // Álcool → sono próximo dia
      const paresAlcoolSono: { alcool: number; sono: number | null }[] = []
      ds.forEach(d => {
        const alcoolOntem = alcoolPorDia.get(prevDate(d.date)) ?? 0
        if (d.sonoHoras !== null) paresAlcoolSono.push({ alcool: alcoolOntem, sono: d.sonoHoras })
      })
      const comAlcool = paresAlcoolSono.filter(p => p.alcool > 0)
      const semAlcool = paresAlcoolSono.filter(p => p.alcool === 0)
      if (comAlcool.length >= 2 && semAlcool.length >= 2) {
        const sonoCom = comAlcool.reduce((s, p) => s + (p.sono ?? 0), 0) / comAlcool.length
        const sonoSem = semAlcool.reduce((s, p) => s + (p.sono ?? 0), 0) / semAlcool.length
        const delta = sonoCom - sonoSem
        linhasC.push(`álcool → sono: noites a seguir a beber dormiste ${sonoCom.toFixed(1)}h, sem álcool ${sonoSem.toFixed(1)}h (delta ${delta > 0 ? '+' : ''}${delta.toFixed(1)}h)`)
      }
      // Sono → humor
      const paresSonoHumor = ds.filter(d => d.sonoHoras !== null && d.humor !== null)
      if (paresSonoHumor.length >= 5) {
        const sonoBaixo = paresSonoHumor.filter(d => (d.sonoHoras ?? 0) < 6)
        const sonoBom = paresSonoHumor.filter(d => (d.sonoHoras ?? 0) >= 7)
        if (sonoBaixo.length >= 2 && sonoBom.length >= 2) {
          const humorMau = sonoBaixo.reduce((s, d) => s + (d.humor ?? 0), 0) / sonoBaixo.length
          const humorBom = sonoBom.reduce((s, d) => s + (d.humor ?? 0), 0) / sonoBom.length
          linhasC.push(`sono → humor: <6h dormido = humor ${humorMau.toFixed(1)}/5; ≥7h = humor ${humorBom.toFixed(1)}/5`)
        }
      }
      // Sintomas peri ↔ álcool
      const sintomasComAlcool: number[] = []
      const sintomasSemAlcool: number[] = []
      ds.forEach(d => {
        const teveAlcoolOntem = (alcoolPorDia.get(prevDate(d.date)) ?? 0) > 0
        if (teveAlcoolOntem) sintomasComAlcool.push(d.sintomasPeri.length)
        else sintomasSemAlcool.push(d.sintomasPeri.length)
      })
      if (sintomasComAlcool.length >= 2 && sintomasSemAlcool.length >= 2) {
        const a = sintomasComAlcool.reduce((s, n) => s + n, 0) / sintomasComAlcool.length
        const b = sintomasSemAlcool.reduce((s, n) => s + n, 0) / sintomasSemAlcool.length
        if (Math.abs(a - b) >= 0.5) {
          linhasC.push(`álcool → sintomas peri: a seguir a beber ${a.toFixed(1)} sintomas, sem ${b.toFixed(1)}`)
        }
      }
      // Magnésio → sono
      const comMag = ds.filter(d => d.suplementos.includes('magnesio') && d.sonoHoras !== null)
      const semMag = ds.filter(d => !d.suplementos.includes('magnesio') && d.sonoHoras !== null)
      if (comMag.length >= 3 && semMag.length >= 3) {
        const sCom = comMag.reduce((s, d) => s + (d.sonoHoras ?? 0), 0) / comMag.length
        const sSem = semMag.reduce((s, d) => s + (d.sonoHoras ?? 0), 0) / semMag.length
        if (Math.abs(sCom - sSem) >= 0.3) {
          linhasC.push(`magnésio → sono: com ${sCom.toFixed(1)}h, sem ${sSem.toFixed(1)}h (delta ${(sCom - sSem).toFixed(1)})`)
        }
      }
      if (linhasC.length === 0) linhas.push('correlações: nenhum padrão claro ainda · precisa mais dados')
      else { linhas.push('correlações detectadas:'); linhasC.forEach(l => linhas.push('· ' + l)) }
    }

    const fazComparar = () => {
      const hoje = new Date()
      const fim = new Date(hoje); fim.setHours(0, 0, 0, 0)
      const inicio = new Date(fim); inicio.setDate(inicio.getDate() - 7)
      const inicioPrevia = new Date(inicio); inicioPrevia.setDate(inicioPrevia.getDate() - 7)
      const fmtIso = (d: Date) => d.toISOString().slice(0, 10)
      const dsTodos = getTodosDias()
      const semAct = dsTodos.filter(d => d.date >= fmtIso(inicio) && d.date < fmtIso(fim))
      const semPrev = dsTodos.filter(d => d.date >= fmtIso(inicioPrevia) && d.date < fmtIso(inicio))
      if (semAct.length === 0 || semPrev.length === 0) { linhas.push('comparar semanas: dados insuficientes'); return }
      const med = (arr: (number | null)[]) => {
        const v = arr.filter((n): n is number => n !== null)
        return v.length > 0 ? v.reduce((s, n) => s + n, 0) / v.length : null
      }
      const sonoAct = med(semAct.map(d => d.sonoHoras))
      const sonoPrev = med(semPrev.map(d => d.sonoHoras))
      const energiaAct = med(semAct.map(d => d.energia))
      const energiaPrev = med(semPrev.map(d => d.energia))
      const humorAct = med(semAct.map(d => d.humor))
      const humorPrev = med(semPrev.map(d => d.humor))
      const aguaAct = med(semAct.map(d => d.aguaCopos))
      const aguaPrev = med(semPrev.map(d => d.aguaCopos))
      // Álcool
      const alAct = getAlcoolRegistos().filter(a => a.timestamp.slice(0, 10) >= fmtIso(inicio) && a.timestamp.slice(0, 10) < fmtIso(fim) && a.decidiuBeber)
      const alPrev = getAlcoolRegistos().filter(a => a.timestamp.slice(0, 10) >= fmtIso(inicioPrevia) && a.timestamp.slice(0, 10) < fmtIso(inicio) && a.decidiuBeber)
      const uAct = alAct.reduce((s, a) => s + a.unidades, 0)
      const uPrev = alPrev.reduce((s, a) => s + a.unidades, 0)
      // Refeições proteína média
      const refTodas = getRefeicoesNoIntervalo(inicioPrevia.toISOString())
      const protPorSem = (lista: Refeicao[], ini: string, fim: string): number => {
        const r = lista.filter(x => x.timestamp.slice(0, 10) >= ini && x.timestamp.slice(0, 10) < fim)
        const dias = new Set(r.map(x => x.timestamp.slice(0, 10)))
        const total = r.reduce((s, x) => s + (x.proteinaG ?? 0), 0)
        return dias.size > 0 ? total / dias.size : 0
      }
      const pAct = protPorSem(refTodas, fmtIso(inicio), fmtIso(fim))
      const pPrev = protPorSem(refTodas, fmtIso(inicioPrevia), fmtIso(inicio))
      const dl = (a: number | null, b: number | null) => {
        if (a === null || b === null) return '—'
        const d = a - b
        return `${a.toFixed(1)} ← ${b.toFixed(1)} (${d > 0 ? '+' : ''}${d.toFixed(1)})`
      }
      linhas.push('comparar 7d actuais vs 7d anteriores:')
      linhas.push(`· sono: ${dl(sonoAct, sonoPrev)} h`)
      linhas.push(`· energia: ${dl(energiaAct, energiaPrev)} /5`)
      linhas.push(`· humor: ${dl(humorAct, humorPrev)} /5`)
      linhas.push(`· água: ${dl(aguaAct, aguaPrev)} copos`)
      linhas.push(`· álcool: ${uAct}u ← ${uPrev}u (${uAct - uPrev > 0 ? '+' : ''}${uAct - uPrev})`)
      linhas.push(`· proteína: ${dl(pAct, pPrev)} g/d`)
    }

    if (area === 'alimentos_frequentes' || area === 'tudo') fazAlimentos()
    if (area === 'macros_media' || area === 'tudo') fazMacros()
    if (area === 'nutrientes' || area === 'tudo') fazNutrientes()
    if (area === 'correlacoes' || area === 'tudo') fazCorrelacoes()
    if (area === 'comparar_semanas' || area === 'tudo') fazComparar()
    if (area === 'sono_padrao' || area === 'tudo') fazSono()
    if (area === 'sintomas_padrao' || area === 'tudo') fazSintomas()
    if (area === 'suplementos_padrao' || area === 'tudo') fazSuplementos()
    if (area === 'alcool_padrao' || area === 'tudo') fazAlcool()
    if (area === 'peso_tendencia' || area === 'tudo') fazPeso()
    if (linhas.length === 0) return { ok: false, erro: `área desconhecida: ${area}` }
    return { ok: true, texto: linhas.join('\n') }
  },

  gerar_lista_compras(input) {
    const dias = num(input.dias_analise) ?? 14
    const pessoas = num(input.pessoas) ?? 1
    const desde = new Date()
    desde.setDate(desde.getDate() - dias)
    const refeicoes = getRefeicoesNoIntervalo(desde.toISOString())
    if (refeicoes.length === 0) return { ok: false, erro: 'sem refeições registadas para gerar lista' }
    // Conta palavras-chave
    const ingredientes: Record<string, number> = {}
    const ALVO: Array<[RegExp, string]> = [
      [/ovo|ovos/, 'ovos'],
      [/frango/, 'frango'],
      [/peixe|salmão|sardinha|atum|cavala/, 'peixe'],
      [/carne|bife|vaca|porco/, 'carne'],
      [/abacate/, 'abacate'],
      [/folhas|alface|rúcula|espinafre/, 'folhas verdes'],
      [/brócol|couve|repolho/, 'couve/brócolos'],
      [/courgette|curgete/, 'curgete'],
      [/tomate/, 'tomate'],
      [/cebola/, 'cebola'],
      [/azeite/, 'azeite'],
      [/manteiga/, 'manteiga'],
      [/queijo/, 'queijo'],
      [/iogurte/, 'iogurte grego'],
      [/frutos secos|nozes|amêndoa/, 'frutos secos'],
      [/azeitona/, 'azeitonas'],
      [/matapa/, 'matapa'],
      [/xima/, 'xima/farinha de milho']
    ]
    refeicoes.forEach(r => {
      const desc = r.descricao.toLowerCase()
      ALVO.forEach(([rx, nome]) => {
        if (rx.test(desc)) ingredientes[nome] = (ingredientes[nome] ?? 0) + 1
      })
    })
    const ndias = new Set(refeicoes.map(r => r.timestamp.slice(0, 10))).size
    const linhas: string[] = []
    linhas.push(`lista para 7 dias · base ${refeicoes.length} refeições / ${ndias}d · ${pessoas} pessoa${pessoas > 1 ? 's' : ''}:`)
    Object.entries(ingredientes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([nome, n]) => {
        const proporcao = (n / refeicoes.length) * 7 * pessoas
        let qtd = ''
        if (nome === 'ovos') qtd = `${Math.ceil(proporcao * 2)} unidades`
        else if (nome === 'frango' || nome === 'peixe' || nome === 'carne') qtd = `${Math.round(proporcao * 0.15 * 10) / 10} kg`
        else if (nome === 'folhas verdes' || nome === 'couve/brócolos') qtd = `${Math.ceil(proporcao)} molhos/embalagens`
        else if (nome === 'abacate') qtd = `${Math.ceil(proporcao)} unidades`
        else qtd = `~${Math.ceil(proporcao / 2)} doses`
        linhas.push(`· ${nome}: ${qtd}`)
      })
    if (Object.keys(ingredientes).length === 0) linhas.push('· (descrições demasiado vagas para sugerir quantidades · descreve com mais detalhe)')
    return { ok: true, texto: linhas.join('\n') }
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
        as_.forEach(a => linhas.push(`${dataLocal(a.timestamp)} ${horaLocal(a.timestamp)} · ${a.decidiuBeber ? a.unidades + 'u' : 'não'} · ${a.emocao}`))
        break
      }
      case 'refeicoes_hoje': {
        const lista = getRefeicoesDoDia()
        if (lista.length === 0) linhas.push('sem refeições registadas hoje')
        lista.forEach(r => linhas.push(`${horaLocal(r.timestamp)} · ${r.tipo} · ${r.descricao}${r.proteinaG ? ` · ${r.proteinaG}gP/${r.gorduraG}gG/${r.carboG}gC` : ''}`))
        break
      }
      case 'macros_hoje': {
        const m = macrosDoDia()
        linhas.push(`hoje: ${m.refeicoes}× · ${Math.round(m.proteina)}g proteína · ${Math.round(m.carbo)}g carbo · ${Math.round(m.gordura)}g gordura · ${m.calorias} kcal`)
        break
      }
      case 'ancoras_hoje': {
        const dia = getDia()
        getAncorasActivas().forEach(a => linhas.push(`${dia.ancoras[a.id] ? '✓' : '·'} ${a.id}: ${a.titulo}`))
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
