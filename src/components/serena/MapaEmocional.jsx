import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import { EMOCOES } from '../../lib/serena/gamificacao'
import ModuleHeader from '../shared/ModuleHeader'

/**
 * SERENA — Mapa Emocional
 * Mapa de calor emocional ao longo do tempo.
 * Visualização mensal com cores por emoção,
 * identificação de padrões recorrentes.
 */

const SERENA_COLOR = '#6B8E9B'
const SERENA_DARK = '#1a2e3a'

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function MapaEmocional() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [registos, setRegistos] = useState([])
  const [mesOffset, setMesOffset] = useState(0) // 0 = mes actual
  const [emocaoFiltro, setEmocaoFiltro] = useState(null)

  // Mes em visualizacao
  const mesActual = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - mesOffset)
    return d
  }, [mesOffset])

  const mesLabel = `${MESES[mesActual.getMonth()]} ${mesActual.getFullYear()}`

  // Carregar dados
  useEffect(() => {
    loadData()
  }, [session, mesOffset])

  async function loadData() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (!userData) return
      setUserId(userData.id)

      // Buscar registos do mes
      const inicioMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1)
      const fimMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0)

      const { data } = await supabase
        .from('serena_emocoes_log')
        .select('data, emocao, intensidade, created_at')
        .eq('user_id', userData.id)
        .gte('data', inicioMes.toISOString().split('T')[0])
        .lte('data', fimMes.toISOString().split('T')[0])
        .order('created_at', { ascending: true })

      setRegistos(data || [])
    } catch (error) {
      console.error('MapaEmocional: Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }

  // Organizar dados por dia
  const dadosPorDia = useMemo(() => {
    const mapa = {}
    registos.forEach(r => {
      if (!mapa[r.data]) {
        mapa[r.data] = []
      }
      mapa[r.data].push(r)
    })
    return mapa
  }, [registos])

  // Gerar grid do calendario
  const diasDoMes = useMemo(() => {
    const ano = mesActual.getFullYear()
    const mes = mesActual.getMonth()
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const totalDias = ultimoDia.getDate()

    // Dia da semana do primeiro dia (0=dom, converter para seg=0)
    let diaSemanaInicio = primeiroDia.getDay()
    diaSemanaInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1

    const dias = []

    // Espacos vazios antes do primeiro dia
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push({ dia: null, data: null })
    }

    // Dias do mes
    for (let d = 1; d <= totalDias; d++) {
      const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      dias.push({ dia: d, data: dataStr })
    }

    return dias
  }, [mesActual])

  // Emocao dominante de um dia
  function getEmocaoDominante(dataStr) {
    const regs = dadosPorDia[dataStr]
    if (!regs || regs.length === 0) return null

    // Contar frequencia de cada emocao
    const contagem = {}
    regs.forEach(r => {
      contagem[r.emocao] = (contagem[r.emocao] || 0) + 1
    })

    // Emocao mais frequente
    let max = 0
    let dominante = null
    Object.entries(contagem).forEach(([emocao, count]) => {
      if (count > max) {
        max = count
        dominante = emocao
      }
    })

    return EMOCOES.find(e => e.value === dominante) || null
  }

  // Intensidade media de um dia
  function getIntensidadeMedia(dataStr) {
    const regs = dadosPorDia[dataStr]
    if (!regs || regs.length === 0) return 0
    const soma = regs.reduce((acc, r) => acc + (r.intensidade || 5), 0)
    return Math.round(soma / regs.length)
  }

  // Estatisticas do mes
  const estatisticas = useMemo(() => {
    if (registos.length === 0) return null

    // Emocao mais frequente
    const contagem = {}
    registos.forEach(r => {
      contagem[r.emocao] = (contagem[r.emocao] || 0) + 1
    })

    const sorted = Object.entries(contagem).sort((a, b) => b[1] - a[1])
    const topEmocoes = sorted.slice(0, 5).map(([emocao, count]) => ({
      emocao: EMOCOES.find(e => e.value === emocao),
      count,
      percent: Math.round((count / registos.length) * 100)
    }))

    // Intensidade media
    const intensidadeMedia = registos.reduce((acc, r) => acc + (r.intensidade || 5), 0) / registos.length

    // Dias com registo
    const diasComRegisto = new Set(registos.map(r => r.data)).size

    return {
      total: registos.length,
      diasComRegisto,
      intensidadeMedia: intensidadeMedia.toFixed(1),
      topEmocoes
    }
  }, [registos])

  // Loading
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${SERENA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🗺️</div>
          <p className="text-white/60 text-sm">A carregar o teu mapa...</p>
        </div>
      </div>
    )
  }

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: `linear-gradient(180deg, ${SERENA_DARK} 0%, #0f0f0f 100%)` }}
    >
      <ModuleHeader
        eco="serena"
        title="Mapa Emocional"
        subtitle="Visualiza as tuas emoções ao longo do tempo"
        backTo="/serena/dashboard"
      />

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Navegação de mês */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setMesOffset(prev => prev + 1)}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            aria-label="Mês anterior"
          >
            <span className="text-white/60 text-lg">←</span>
          </button>

          <h2 className="text-white text-lg font-medium">{mesLabel}</h2>

          <button
            onClick={() => setMesOffset(prev => Math.max(0, prev - 1))}
            disabled={mesOffset === 0}
            className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-30"
            aria-label="Mês seguinte"
          >
            <span className="text-white/60 text-lg">→</span>
          </button>
        </div>

        {/* Legenda dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS_SEMANA.map(dia => (
            <div key={dia} className="text-center text-white/30 text-xs py-1">
              {dia}
            </div>
          ))}
        </div>

        {/* Grid do calendario/mapa de calor */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {diasDoMes.map((item, idx) => {
            if (item.dia === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />
            }

            const emocao = getEmocaoDominante(item.data)
            const intensidade = getIntensidadeMedia(item.data)
            const isHoje = item.data === hoje
            const temDados = !!dadosPorDia[item.data]
            const numRegistos = (dadosPorDia[item.data] || []).length

            // Filtro activo
            if (emocaoFiltro && temDados) {
              const temEmocao = (dadosPorDia[item.data] || []).some(r => r.emocao === emocaoFiltro)
              if (!temEmocao) {
                return (
                  <div
                    key={item.data}
                    className="aspect-square rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <span className="text-white/15 text-xs">{item.dia}</span>
                  </div>
                )
              }
            }

            return (
              <button
                key={item.data}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all relative ${
                  isHoje ? 'ring-2' : ''
                }`}
                style={{
                  background: emocao
                    ? `${emocao.cor}${Math.min(90, 20 + intensidade * 7).toString(16).padStart(2, '0')}`
                    : 'rgba(255,255,255,0.03)',
                  ringColor: isHoje ? SERENA_COLOR : 'transparent'
                }}
                aria-label={`${item.dia}: ${emocao ? emocao.label : 'Sem registo'}`}
                title={emocao ? `${emocao.label} (${intensidade}/10) — ${numRegistos} registo(s)` : 'Sem registo'}
              >
                {emocao ? (
                  <span className="text-sm">{emocao.icon}</span>
                ) : (
                  <span className="text-white/20 text-[10px]">{item.dia}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Filtro por emoção */}
        <div
          className="rounded-2xl border p-4 mb-6"
          style={{ background: `${SERENA_COLOR}08`, borderColor: `${SERENA_COLOR}15` }}
        >
          <h3 className="text-white/70 text-sm font-medium mb-3">Filtrar por emoção</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEmocaoFiltro(null)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                !emocaoFiltro ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
              style={{
                background: !emocaoFiltro ? `${SERENA_COLOR}40` : 'transparent',
                border: `1px solid ${!emocaoFiltro ? SERENA_COLOR : 'rgba(255,255,255,0.1)'}`
              }}
            >
              Todas
            </button>
            {EMOCOES.map(emocao => {
              const temRegistos = registos.some(r => r.emocao === emocao.value)
              if (!temRegistos) return null
              return (
                <button
                  key={emocao.value}
                  onClick={() => setEmocaoFiltro(emocaoFiltro === emocao.value ? null : emocao.value)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    emocaoFiltro === emocao.value ? 'text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                  style={{
                    background: emocaoFiltro === emocao.value ? `${emocao.cor}40` : 'transparent',
                    border: `1px solid ${emocaoFiltro === emocao.value ? emocao.cor : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  {emocao.icon} {emocao.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Estatisticas do mes */}
        {estatisticas ? (
          <div
            className="rounded-2xl border p-5 mb-6"
            style={{ background: `${SERENA_COLOR}10`, borderColor: `${SERENA_COLOR}25` }}
          >
            <h3
              className="text-white text-lg font-semibold mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Resumo do Mês
            </h3>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center">
                <p className="text-white text-xl font-bold">{estatisticas.total}</p>
                <p className="text-white/40 text-xs">Registos</p>
              </div>
              <div className="text-center">
                <p className="text-white text-xl font-bold">{estatisticas.diasComRegisto}</p>
                <p className="text-white/40 text-xs">Dias activos</p>
              </div>
              <div className="text-center">
                <p className="text-white text-xl font-bold">{estatisticas.intensidadeMedia}</p>
                <p className="text-white/40 text-xs">Int. média</p>
              </div>
            </div>

            {/* Top emoções */}
            <h4 className="text-white/60 text-sm mb-3">Emoções mais frequentes</h4>
            <div className="space-y-2">
              {estatisticas.topEmocoes.map(({ emocao, count, percent }) => (
                <div key={emocao.value} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{emocao.icon}</span>
                  <span className="text-white/80 text-sm flex-1">{emocao.label}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: `${emocao.cor}20` }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, background: emocao.cor }}
                    />
                  </div>
                  <span className="text-white/40 text-xs w-12 text-right">{percent}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Estado vazio */
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ background: `${SERENA_COLOR}08`, borderColor: `${SERENA_COLOR}15` }}
          >
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-white text-lg font-medium mb-2">
              Sem registos este mês
            </h3>
            <p className="text-white/50 text-sm">
              Começa a registar as tuas emoções no Diário Emocional para ver o mapa ganhar vida.
            </p>
          </div>
        )}

        {/* Legenda de cores */}
        <div
          className="rounded-2xl border p-4"
          style={{ background: `${SERENA_COLOR}05`, borderColor: `${SERENA_COLOR}10` }}
        >
          <h4 className="text-white/50 text-xs mb-3">Legenda</h4>
          <div className="grid grid-cols-4 gap-2">
            {EMOCOES.slice(0, 8).map(emocao => (
              <div key={emocao.value} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: emocao.cor }}
                />
                <span className="text-white/40 text-[10px]">{emocao.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}
