// src/components/vitalis/CalendarioProgresso.jsx
// Calendário mensal de progresso — clica num dia e vê tudo o que registaste

import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { g } from '../../utils/genero'

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

// Helpers de data
const formatDate = (d) => d.toISOString().split('T')[0]
const isSameDay = (a, b) => formatDate(a) === formatDate(b)

function getDaysInMonth(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Dia da semana do 1º dia (0=Dom, ajustar para Seg=0)
  let startWeekday = firstDay.getDay() - 1
  if (startWeekday < 0) startWeekday = 6

  const days = []
  // Dias vazios antes do 1º
  for (let i = 0; i < startWeekday; i++) {
    days.push(null)
  }
  // Dias do mês
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  return days
}

export default function CalendarioProgresso() {
  const hoje = new Date()
  const [mesActual, setMesActual] = useState(hoje.getMonth())
  const [anoActual, setAnoActual] = useState(hoje.getFullYear())
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [dadosMes, setDadosMes] = useState({}) // { 'YYYY-MM-DD': { meals, agua, treino, sono, peso } }
  const [diaSelecionado, setDiaSelecionado] = useState(null) // 'YYYY-MM-DD'
  const [detalhesDia, setDetalhesDia] = useState(null)
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)

  // Buscar userId
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        if (userData) setUserId(userData.id)
      }
    }
    getUser()
  }, [])

  // Buscar resumo do mês
  const carregarMes = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const dataInicio = formatDate(new Date(anoActual, mesActual, 1))
    const dataFim = formatDate(new Date(anoActual, mesActual + 1, 0))

    try {
      const [meals, agua, treinos, sono, checkins] = await Promise.all([
        supabase.from('vitalis_meals_log').select('data, refeicao, seguiu_plano')
          .eq('user_id', userId).gte('data', dataInicio).lte('data', dataFim),
        supabase.from('vitalis_agua_log').select('data, quantidade_ml')
          .eq('user_id', userId).gte('data', dataInicio).lte('data', dataFim),
        supabase.from('vitalis_workouts_log').select('data, tipo, duracao_min')
          .eq('user_id', userId).gte('data', dataInicio).lte('data', dataFim),
        supabase.from('vitalis_sono_log').select('data, duracao_min, qualidade_1a5')
          .eq('user_id', userId).gte('data', dataInicio).lte('data', dataFim),
        supabase.from('vitalis_registos').select('data, peso_kg, energia_1a10, humor_1a10')
          .eq('user_id', userId).gte('data', dataInicio).lte('data', dataFim),
      ])

      const mapa = {}

      // Processar refeições
      ;(meals.data || []).forEach(m => {
        if (!mapa[m.data]) mapa[m.data] = {}
        if (!mapa[m.data].meals) mapa[m.data].meals = []
        mapa[m.data].meals.push(m)
      })

      // Processar água
      ;(agua.data || []).forEach(a => {
        if (!mapa[a.data]) mapa[a.data] = {}
        mapa[a.data].agua = (mapa[a.data].agua || 0) + (a.quantidade_ml || 0)
      })

      // Processar treinos
      ;(treinos.data || []).forEach(t => {
        if (!mapa[t.data]) mapa[t.data] = {}
        if (!mapa[t.data].treinos) mapa[t.data].treinos = []
        mapa[t.data].treinos.push(t)
      })

      // Processar sono
      ;(sono.data || []).forEach(s => {
        if (!mapa[s.data]) mapa[s.data] = {}
        mapa[s.data].sono = s
      })

      // Processar check-ins (peso, energia, humor)
      ;(checkins.data || []).forEach(c => {
        if (!mapa[c.data]) mapa[c.data] = {}
        if (c.peso_kg) mapa[c.data].peso = c.peso_kg
        if (c.energia_1a10) mapa[c.data].energia = c.energia_1a10
        if (c.humor_1a10) mapa[c.data].humor = c.humor_1a10
      })

      setDadosMes(mapa)
    } catch (err) {
      console.error('Erro ao carregar calendário:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, mesActual, anoActual])

  useEffect(() => { carregarMes() }, [carregarMes])

  // Ao clicar num dia, carregar detalhes completos
  const abrirDia = async (dataStr) => {
    if (diaSelecionado === dataStr) {
      setDiaSelecionado(null)
      setDetalhesDia(null)
      return
    }
    setDiaSelecionado(dataStr)
    setLoadingDetalhes(true)

    try {
      const [meals, agua, treinos, sono, checkin] = await Promise.all([
        supabase.from('vitalis_meals_log').select('*')
          .eq('user_id', userId).eq('data', dataStr).order('created_at'),
        supabase.from('vitalis_agua_log').select('*')
          .eq('user_id', userId).eq('data', dataStr),
        supabase.from('vitalis_workouts_log').select('*')
          .eq('user_id', userId).eq('data', dataStr),
        supabase.from('vitalis_sono_log').select('*')
          .eq('user_id', userId).eq('data', dataStr).maybeSingle(),
        supabase.from('vitalis_registos').select('*')
          .eq('user_id', userId).eq('data', dataStr).maybeSingle(),
      ])

      setDetalhesDia({
        meals: meals.data || [],
        agua: agua.data || [],
        treinos: treinos.data || [],
        sono: sono.data,
        checkin: checkin.data,
      })
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err)
    } finally {
      setLoadingDetalhes(false)
    }
  }

  const mudarMes = (delta) => {
    let novoMes = mesActual + delta
    let novoAno = anoActual
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    if (novoMes > 11) { novoMes = 0; novoAno++ }
    setMesActual(novoMes)
    setAnoActual(novoAno)
    setDiaSelecionado(null)
    setDetalhesDia(null)
  }

  const dias = getDaysInMonth(anoActual, mesActual)
  const hojeStr = formatDate(hoje)

  // Contar indicadores para um dia
  const getIndicadores = (dataStr) => {
    const d = dadosMes[dataStr]
    if (!d) return null
    const ind = []
    if (d.meals?.length > 0) ind.push('🍽️')
    if (d.agua > 0) ind.push('💧')
    if (d.treinos?.length > 0) ind.push('💪')
    if (d.sono) ind.push('😴')
    if (d.peso) ind.push('⚖️')
    return ind.length > 0 ? ind : null
  }

  // Calcular "score" do dia para colorir
  const getDiaScore = (dataStr) => {
    const d = dadosMes[dataStr]
    if (!d) return 0
    let score = 0
    if (d.meals?.length > 0) score++
    if (d.agua >= 1500) score++ // 1.5L mínimo
    if (d.treinos?.length > 0) score++
    if (d.sono) score++
    return score
  }

  const getDiaBg = (dataStr, isHoje, isSelecionado) => {
    if (isSelecionado) return 'bg-[#7C8B6F] text-white'
    if (isHoje) return 'bg-[#7C8B6F]/10 text-[#7C8B6F] font-bold ring-2 ring-[#7C8B6F]'
    const score = getDiaScore(dataStr)
    if (score >= 3) return 'bg-green-100 text-green-800'
    if (score >= 2) return 'bg-emerald-50 text-emerald-700'
    if (score >= 1) return 'bg-amber-50 text-amber-700'
    return 'text-gray-700'
  }

  const totalAgua = (items) => items.reduce((s, a) => s + (a.quantidade_ml || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f0eb] to-[#e8e0d8] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white px-4 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <Link to="/vitalis/dashboard" className="text-white/80 text-sm mb-2 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-xl font-bold">Calendário de Progresso</h1>
          <p className="text-white/70 text-sm mt-1">Clica num dia para ver tudo</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Navegação do mês */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => mudarMes(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Mês anterior"
            >
              <span className="text-lg">◀</span>
            </button>
            <h2 className="text-lg font-bold text-[#6B5C4C]">
              {MESES[mesActual]} {anoActual}
            </h2>
            <button
              onClick={() => mudarMes(1)}
              className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Próximo mês"
              disabled={mesActual === hoje.getMonth() && anoActual === hoje.getFullYear()}
            >
              <span className={`text-lg ${mesActual === hoje.getMonth() && anoActual === hoje.getFullYear() ? 'opacity-30' : ''}`}>▶</span>
            </button>
          </div>

          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          {loading ? (
            <div className="h-48 flex items-center justify-center" role="status" aria-live="polite">
              <div className="text-gray-400 text-sm">A carregar...</div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {dias.map((dia, i) => {
                if (!dia) return <div key={`empty-${i}`} />

                const dataStr = formatDate(dia)
                const isHoje = dataStr === hojeStr
                const isSelecionado = dataStr === diaSelecionado
                const isFuturo = dia > hoje
                const indicadores = getIndicadores(dataStr)

                return (
                  <button
                    key={dataStr}
                    onClick={() => !isFuturo && abrirDia(dataStr)}
                    disabled={isFuturo}
                    className={`
                      relative aspect-square rounded-xl flex flex-col items-center justify-center
                      text-sm transition-all active:scale-95
                      ${isFuturo ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                      ${getDiaBg(dataStr, isHoje, isSelecionado)}
                    `}
                    aria-label={`${dia.getDate()} ${MESES[mesActual]}${indicadores ? ` — ${indicadores.length} registos` : ''}`}
                  >
                    <span className="text-sm font-medium">{dia.getDate()}</span>
                    {indicadores && (
                      <div className="flex gap-0.5 mt-0.5">
                        {indicadores.slice(0, 3).map((ind, j) => (
                          <span key={j} className="text-[8px] leading-none">{ind}</span>
                        ))}
                        {indicadores.length > 3 && (
                          <span className="text-[7px] leading-none text-gray-400">+{indicadores.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Legenda */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 flex-wrap">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">🍽️ Refeições</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">💧 Água</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">💪 Treino</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">😴 Sono</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">⚖️ Peso</span>
          </div>
        </div>

        {/* Detalhes do dia selecionado */}
        {diaSelecionado && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-[#7C8B6F] text-white px-4 py-3">
              <h3 className="font-bold text-sm">
                {new Date(diaSelecionado + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>

            {loadingDetalhes ? (
              <div className="p-6 text-center text-gray-400 text-sm" role="status" aria-live="polite">
                A carregar detalhes...
              </div>
            ) : detalhesDia ? (
              <div className="p-4 space-y-4">
                {/* Sem dados */}
                {detalhesDia.meals.length === 0 && detalhesDia.agua.length === 0 &&
                 detalhesDia.treinos.length === 0 && !detalhesDia.sono && !detalhesDia.checkin && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Nenhum registo neste dia
                  </p>
                )}

                {/* Peso / Check-in */}
                {detalhesDia.checkin && (
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <h4 className="text-xs font-semibold text-purple-700 uppercase mb-2">Check-in</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {detalhesDia.checkin.peso_kg && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-800">{detalhesDia.checkin.peso_kg}</p>
                          <p className="text-[10px] text-purple-600">kg</p>
                        </div>
                      )}
                      {detalhesDia.checkin.energia_1a10 && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-800">{detalhesDia.checkin.energia_1a10}/10</p>
                          <p className="text-[10px] text-purple-600">Energia</p>
                        </div>
                      )}
                      {detalhesDia.checkin.humor_1a10 && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-800">{detalhesDia.checkin.humor_1a10}/10</p>
                          <p className="text-[10px] text-purple-600">Humor</p>
                        </div>
                      )}
                    </div>
                    {detalhesDia.checkin.vitorias_semana && (
                      <p className="text-xs text-purple-600 mt-2 italic">{detalhesDia.checkin.vitorias_semana}</p>
                    )}
                  </div>
                )}

                {/* Refeições */}
                {detalhesDia.meals.length > 0 && (
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <h4 className="text-xs font-semibold text-orange-700 uppercase mb-2">
                      Refeições ({detalhesDia.meals.length})
                    </h4>
                    <div className="space-y-2">
                      {detalhesDia.meals.map((m, i) => {
                        const statusIcon = m.seguiu_plano === 'sim' ? '✅' :
                          m.seguiu_plano === 'parcial' ? '🟡' :
                          m.seguiu_plano === 'nao' ? '❌' : '⚪'
                        let items = []
                        try { items = JSON.parse(m.notas || '{}').items || [] } catch { /* ignore */ }
                        return (
                          <div key={m.id || i} className="flex items-start gap-2">
                            <span className="text-sm mt-0.5">{statusIcon}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-orange-800 capitalize">{m.refeicao}</p>
                              {items.length > 0 && (
                                <p className="text-xs text-orange-600 truncate">
                                  {items.map(it => it.nome || it.name).filter(Boolean).join(', ')}
                                </p>
                              )}
                              {(m.calorias || m.proteina) && (
                                <p className="text-[10px] text-orange-500 mt-0.5">
                                  {m.calorias ? `${Math.round(m.calorias)} kcal` : ''}
                                  {m.proteina ? ` · ${Math.round(m.proteina)}g prot` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Água */}
                {detalhesDia.agua.length > 0 && (
                  <div className="p-3 bg-sky-50 rounded-xl">
                    <h4 className="text-xs font-semibold text-sky-700 uppercase mb-2">Água</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💧</span>
                      <div>
                        <p className="text-lg font-bold text-sky-800">
                          {(totalAgua(detalhesDia.agua) / 1000).toFixed(1)}L
                        </p>
                        <p className="text-[10px] text-sky-600">
                          {detalhesDia.agua.length} {detalhesDia.agua.length === 1 ? 'registo' : 'registos'}
                        </p>
                      </div>
                      {/* Mini barra de progresso (meta 2L) */}
                      <div className="flex-1 h-2 bg-sky-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (totalAgua(detalhesDia.agua) / 2000) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Treino */}
                {detalhesDia.treinos.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-xl">
                    <h4 className="text-xs font-semibold text-red-700 uppercase mb-2">Treino</h4>
                    {detalhesDia.treinos.map((t, i) => (
                      <div key={t.id || i} className="flex items-center gap-2">
                        <span className="text-lg">💪</span>
                        <div>
                          <p className="text-sm font-medium text-red-800 capitalize">{t.tipo || 'Exercício'}</p>
                          {t.duracao_min && (
                            <p className="text-xs text-red-600">{t.duracao_min} min</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sono */}
                {detalhesDia.sono && (
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <h4 className="text-xs font-semibold text-indigo-700 uppercase mb-2">Sono</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">😴</span>
                      <div>
                        <p className="text-lg font-bold text-indigo-800">
                          {Math.floor((detalhesDia.sono.duracao_min || 0) / 60)}h{(detalhesDia.sono.duracao_min || 0) % 60 > 0 ? `${(detalhesDia.sono.duracao_min || 0) % 60}m` : ''}
                        </p>
                        {detalhesDia.sono.qualidade_1a5 && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(n => (
                              <span key={n} className={`text-xs ${n <= detalhesDia.sono.qualidade_1a5 ? 'text-indigo-500' : 'text-gray-300'}`}>★</span>
                            ))}
                            <span className="text-[10px] text-indigo-500 ml-1">qualidade</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Resumo do mês */}
        {!loading && (
          <div className="bg-white rounded-2xl shadow-md p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Resumo de {MESES[mesActual]}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ResumoCard
                emoji="🍽️"
                label="Dias com refeições"
                valor={Object.values(dadosMes).filter(d => d.meals?.length > 0).length}
                total={new Date(anoActual, mesActual + 1, 0).getDate()}
              />
              <ResumoCard
                emoji="💧"
                label="Dias com água"
                valor={Object.values(dadosMes).filter(d => d.agua > 0).length}
                total={new Date(anoActual, mesActual + 1, 0).getDate()}
              />
              <ResumoCard
                emoji="💪"
                label="Treinos"
                valor={Object.values(dadosMes).filter(d => d.treinos?.length > 0).length}
                total={new Date(anoActual, mesActual + 1, 0).getDate()}
              />
              <ResumoCard
                emoji="😴"
                label="Noites registadas"
                valor={Object.values(dadosMes).filter(d => d.sono).length}
                total={new Date(anoActual, mesActual + 1, 0).getDate()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ResumoCard({ emoji, label, valor, total }) {
  const perc = total > 0 ? Math.round((valor / total) * 100) : 0
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <span className="text-xl">{emoji}</span>
      <p className="text-lg font-bold text-[#6B5C4C] mt-1">{valor}<span className="text-xs text-gray-400 font-normal">/{total}</span></p>
      <p className="text-[10px] text-gray-500">{label}</p>
      <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-[#7C8B6F] rounded-full transition-all"
          style={{ width: `${perc}%` }}
        />
      </div>
    </div>
  )
}
