'use client'

// Constrói o contexto que vai para a coach (dados recentes + análise opcional).
// Partilhado entre /coach (chat texto) e VoiceModeOverlay (modo voz).

import { isoDate, horaLocal, dataLocal } from './dates'
import { executeTool } from './coachTools'
import { getProfile, getAncorasActivas, getObjectivos } from './profile'
import {
  getTodosDias,
  getAlcoolRegistos,
  getJejuns,
  getCiclos,
  getMedidas,
  faseActualCiclo,
  diaActualCiclo,
  nomeFase,
  pesoUltimo,
  variacaoPeso,
  streakAncoras,
  diasSemAlcool,
  sonoMedio,
  getRefeicoesDoDia,
  macrosDoDia,
  ancorasResolvidas
} from './storage'

export function construirContexto(comAnalise = false): string {
  const dias = getTodosDias()
  const ultimos7 = dias.slice(-7)
  const linhas: string[] = []

  linhas.push(`Hoje: ${isoDate()}`)
  const profile = getProfile()
  if (profile.modoViagem) {
    linhas.push('⚠ MODO VIAGEM ACTIVO · ela está fora da rotina habitual. Não cobres streaks. Suaviza exigências. Foco no que controla.')
  }
  if (profile.metas.calorias !== null || profile.metas.proteinaG !== null) {
    const m = profile.metas
    linhas.push(`Metas: ${m.calorias ?? '—'} kcal · ${m.proteinaG ?? '—'}g P · ${m.carboG ?? '—'}g C · ${m.gorduraG ?? '—'}g G`)
  } else {
    linhas.push('Metas: ainda não definidas (podes propor calcular sugestão)')
  }

  // Objectivos pessoais · referencia sempre, mede progresso
  const objectivos = getObjectivos()
  if (objectivos.length > 0) {
    linhas.push('OBJECTIVOS DA VIVIANNE (guardados por ela):')
    objectivos.forEach(o => {
      const dias = Math.floor((Date.now() - new Date(o.criadoEm).getTime()) / 86400000)
      linhas.push(`· [${o.id.slice(0, 8)}] "${o.texto}" · há ${dias}d`)
    })
    linhas.push('IMPORTANTE: mede progresso destes objectivos com dados actuais. Refere-os.')
  } else {
    linhas.push('OBJECTIVOS: nenhum guardado · propõe capturar 1-3 concretos.')
  }
  const dia = diaActualCiclo()
  const fase = faseActualCiclo()
  if (dia !== null && fase !== null) linhas.push(`Ciclo: dia ${dia}, fase ${nomeFase(fase)}`)

  const peso = pesoUltimo()
  if (peso !== null) {
    const v = variacaoPeso()
    linhas.push(`Peso actual: ${peso}kg · semana: ${v.semana ?? '?'}kg · total: ${v.total ?? '?'}kg`)
  }

  linhas.push(`Streak âncoras: ${streakAncoras()} dias`)
  linhas.push(`Dias sem álcool: ${diasSemAlcool()}`)
  const sm = sonoMedio()
  if (sm !== null) linhas.push(`Sono médio 7d: ${sm}h`)

  const m = macrosDoDia()
  linhas.push(`Refeições hoje: ${m.refeicoes}× · ${Math.round(m.proteina)}g P · ${Math.round(m.carbo)}g C · ${Math.round(m.gordura)}g G`)

  const diaHoje = ultimos7[ultimos7.length - 1]
  if (diaHoje) {
    linhas.push(`Água hoje: ${diaHoje.aguaCopos}/8 copos`)
    if (diaHoje.suplementos.length > 0) linhas.push(`Suplementos: ${diaHoje.suplementos.join(', ')}`)
    if (diaHoje.transitoIntestinal !== null) linhas.push(`Trânsito: ${diaHoje.transitoIntestinal}`)
    if (diaHoje.horaDeitar || diaHoje.qualidadeSono !== null || diaHoje.acordouVezes !== null) {
      const partes: string[] = []
      if (diaHoje.horaDeitar) partes.push(`deitou ${diaHoje.horaDeitar}`)
      if (diaHoje.qualidadeSono !== null) partes.push(`qualidade ${diaHoje.qualidadeSono}/5`)
      if (diaHoje.acordouVezes !== null) partes.push(`acordou ${diaHoje.acordouVezes}×`)
      linhas.push(`Sono detalhe: ${partes.join(' · ')}`)
    }
    if (diaHoje.sintomasPeri.length > 0) linhas.push(`Sintomas peri hoje: ${diaHoje.sintomasPeri.join(', ')}`)
    if (diaHoje.steps !== null) linhas.push(`Passos: ${diaHoje.steps}`)
    if (diaHoje.rhr !== null) linhas.push(`RHR: ${diaHoje.rhr} bpm`)
  }

  const refHoje = getRefeicoesDoDia()
  if (refHoje.length > 0) {
    linhas.push('REFEIÇÕES HOJE:')
    refHoje.forEach(r => {
      linhas.push(`· ${horaLocal(r.timestamp)} ${r.tipo}: ${r.descricao.slice(0, 80)}`)
    })
  }

  if (ultimos7.length > 0) {
    linhas.push('')
    linhas.push('ÚLTIMOS 7 DIAS:')
    ultimos7.forEach(d => {
      const r = ancorasResolvidas(d.date, d.ancoras)
      const a = getAncorasActivas().filter(x => r[x.id]).length
      const partes = [
        `${d.date}: âncoras ${a}/7`,
        d.sonoHoras !== null ? `sono ${d.sonoHoras}h` : '',
        d.energia !== null ? `energia ${d.energia}/5` : '',
        d.humor !== null ? `humor ${d.humor}/5` : ''
      ].filter(Boolean)
      linhas.push('· ' + partes.join(' · '))
      if (d.notas) linhas.push(`  notas: ${d.notas.slice(0, 150)}`)
    })

    // TREINO · contagem explícita para evitar inventar
    // A app NÃO tem registo de treino além da âncora 'treino_feito' marcada
    const treinosFeitos = ultimos7.filter(d => d.ancoras['treino_feito']).length
    linhas.push('')
    if (treinosFeitos === 0) {
      linhas.push('TREINO · ÚLTIMOS 7 DIAS: 0 registos. A Vivianne NÃO MARCOU treino_feito em nenhum dia. Não digas que ela treinou. Se for relevante, sugere registar treino para a leitura ser real.')
    } else {
      const diasTreino = ultimos7.filter(d => d.ancoras['treino_feito']).map(d => d.date)
      linhas.push(`TREINO · ÚLTIMOS 7 DIAS: ${treinosFeitos}× registos (âncora treino_feito): ${diasTreino.join(', ')}`)
    }
  }

  const alcool = getAlcoolRegistos().slice(0, 10)
  if (alcool.length > 0) {
    linhas.push('')
    linhas.push('ÁLCOOL · últimos 10 registos:')
    alcool.forEach(a => {
      linhas.push(`· ${dataLocal(a.timestamp)} ${horaLocal(a.timestamp)} · ${a.decidiuBeber ? `${a.unidades}u` : 'não'} · ${a.emocao}${a.gatilho ? ` · "${a.gatilho.slice(0, 80)}"` : ''}`)
    })
  }

  const jejuns = getJejuns().slice(-7)
  if (jejuns.length > 0) {
    linhas.push('')
    linhas.push('JEJUM · últimos 7 dias:')
    jejuns.forEach(j => {
      linhas.push(`· ${j.date}: ${j.duracaoHoras ? j.duracaoHoras + 'h' : 'em curso'}${j.completou ? ' ✓' : ''}`)
    })
  }

  const ciclos = getCiclos().slice(-3)
  if (ciclos.length > 0) {
    linhas.push('')
    linhas.push('CICLO · últimos 3 períodos:')
    ciclos.forEach(c => {
      linhas.push(`· ${c.dataInicio}${c.duracaoCiclo ? ` (${c.duracaoCiclo}d)` : ''} · sintomas: ${c.sintomas.join(', ') || 'nenhum'}${c.cravings.length ? ` · cravings: ${c.cravings.join(', ')}` : ''}`)
    })
  }

  const medidas = getMedidas().slice(-3)
  if (medidas.length > 0) {
    linhas.push('')
    linhas.push('MEDIDAS · últimas 3:')
    medidas.forEach(m => {
      linhas.push(`· ${m.date}: cintura ${m.cintura ?? '?'}cm${m.peso ? `, peso ${m.peso}kg` : ''}`)
    })
  }

  if (comAnalise) {
    const r = executeTool('analisar_padroes', { area: 'tudo', dias: 14 })
    if (r.ok) {
      linhas.push('')
      linhas.push('ANÁLISE 14 DIAS:')
      linhas.push(r.texto)
    }
  }

  return linhas.join('\n')
}
