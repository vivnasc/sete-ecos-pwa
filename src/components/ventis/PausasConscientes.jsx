import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'
import { EXERCICIOS_PAUSA } from '../../lib/ventis/gamificacao'

// ===== CONSTANTES =====
const VENTIS_COLOR = '#5D9B84'
const VENTIS_DARK = '#1a2e24'
const FOLHAS_POR_PAUSA = 5

const SENSACOES = [
  { id: 'refreshed', label: g('Refrescado', 'Refrescada'), icon: '✨' },
  { id: 'calm', label: 'Calmo/a', icon: '🌿' },
  { id: 'same', label: 'Igual', icon: '😐' },
  { id: 'tired', label: g('Cansado', 'Cansada'), icon: '😴' }
]

// ===== ICONES SVG =====

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

// ===== COMPONENTE: CIRCULO DE RESPIRACAO ANIMADO =====

function BreathingCircle({ active }) {
  if (!active) return null

  return (
    <div className="flex justify-center my-6">
      <div className="relative w-32 h-32">
        {/* Circulo exterior pulsante */}
        <div
          className="absolute inset-0 rounded-full breathing-circle"
          style={{
            border: `2px solid ${VENTIS_COLOR}40`,
            backgroundColor: `${VENTIS_COLOR}08`
          }}
        />
        {/* Circulo interior */}
        <div
          className="absolute inset-4 rounded-full breathing-circle-inner flex items-center justify-center"
          style={{
            backgroundColor: `${VENTIS_COLOR}15`,
            border: `1px solid ${VENTIS_COLOR}30`
          }}
        >
          <span className="text-white/40 text-xs breathing-text">Respira</span>
        </div>
      </div>
    </div>
  )
}

// ===== COMPONENTE: TIMER DA PAUSA =====

function PauseTimer({ exercicio, onComplete }) {
  const totalSeconds = exercicio.duracao * 60
  const [remaining, setRemaining] = useState(totalSeconds)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, onComplete])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100

  return (
    <div className="flex flex-col items-center gap-6 py-6 pausas-fadeIn">
      {/* Icone do exercicio */}
      <div className="text-5xl">{exercicio.icon}</div>

      {/* Nome */}
      <h2
        className="text-xl text-white/90 text-center"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {exercicio.nome}
      </h2>

      {/* Descricao / Instrucoes */}
      <p
        className="text-white/60 text-center max-w-xs leading-relaxed"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem' }}
      >
        {exercicio.descricao}
      </p>

      {/* Circulo de respiracao */}
      <BreathingCircle active={!paused} />

      {/* Timer circular */}
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="rgba(93,155,132,0.15)"
            strokeWidth="6"
          />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={VENTIS_COLOR}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Controlos */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setPaused(!paused)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label={paused ? 'Continuar' : 'Pausar'}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
        <button
          onClick={onComplete}
          className="px-5 py-2 rounded-full text-sm font-medium transition-all"
          style={{ backgroundColor: `${VENTIS_COLOR}33`, color: VENTIS_COLOR }}
        >
          Concluir agora
        </button>
      </div>
    </div>
  )
}

// ===== ESTILOS CSS =====

function PausasStyles() {
  return (
    <style>{`
      @keyframes pausas-fadeIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pausas-fadeIn { animation: pausas-fadeIn 0.4s ease-out; }

      @keyframes breathing-expand {
        0% { transform: scale(0.85); opacity: 0.5; }
        50% { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(0.85); opacity: 0.5; }
      }
      .breathing-circle {
        animation: breathing-expand 6s ease-in-out infinite;
      }

      @keyframes breathing-inner {
        0% { transform: scale(0.9); }
        50% { transform: scale(1.1); }
        100% { transform: scale(0.9); }
      }
      .breathing-circle-inner {
        animation: breathing-inner 6s ease-in-out infinite;
      }

      @keyframes breathing-text-fade {
        0%, 100% { opacity: 0.3; }
        25% { opacity: 0.8; }
        50% { opacity: 0.3; }
        75% { opacity: 0.8; }
      }
      .breathing-text {
        animation: breathing-text-fade 6s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .breathing-circle,
        .breathing-circle-inner,
        .breathing-text {
          animation: none;
        }
      }
    `}</style>
  )
}

// ===== COMPONENTE PRINCIPAL =====

export default function PausasConscientes() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id

  // Estado
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null)
  const [fase, setFase] = useState('picker') // picker | guided | sensation | done
  const [sensacao, setSensacao] = useState(null)
  const [salvando, setSalvando] = useState(false)

  // Dados
  const [pausasHoje, setPausasHoje] = useState([])
  const [stats, setStats] = useState({ mediaDia: 0, maisUsado: null, streak: 0 })
  const [carregando, setCarregando] = useState(true)

  // ===== CARREGAR DADOS =====
  const carregarDados = useCallback(async () => {
    if (!userId) return
    try {
      const hoje = new Date().toISOString().split('T')[0]

      // Pausas de hoje
      const { data: hojeData } = await supabase
        .from('ventis_pausas_log')
        .select('*')
        .eq('user_id', userId)
        .eq('data', hoje)
        .order('hora', { ascending: false })

      setPausasHoje(hojeData || [])

      // Stats: ultimos 30 dias
      const trintaDiasAtras = new Date()
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

      const { data: allData } = await supabase
        .from('ventis_pausas_log')
        .select('*')
        .eq('user_id', userId)
        .gte('data', trintaDiasAtras.toISOString().split('T')[0])
        .order('data', { ascending: false })

      if (allData && allData.length > 0) {
        // Media de pausas por dia
        const diasUnicos = new Set(allData.map(p => p.data))
        const mediaDia = Math.round((allData.length / diasUnicos.size) * 10) / 10

        // Exercicio mais usado
        const contagens = {}
        allData.forEach(p => {
          contagens[p.exercicio] = (contagens[p.exercicio] || 0) + 1
        })
        const maisUsadoId = Object.entries(contagens).sort((a, b) => b[1] - a[1])[0]?.[0]
        const maisUsado = EXERCICIOS_PAUSA.find(e => e.id === maisUsadoId) || null

        // Streak: dias consecutivos com pelo menos 1 pausa
        let streak = 0
        const diaCheck = new Date()
        while (true) {
          const dateStr = diaCheck.toISOString().split('T')[0]
          if (diasUnicos.has(dateStr)) {
            streak++
            diaCheck.setDate(diaCheck.getDate() - 1)
          } else {
            break
          }
        }

        setStats({ mediaDia, maisUsado, streak })
      }
    } catch (err) {
      console.error('Erro ao carregar pausas:', err)
    } finally {
      setCarregando(false)
    }
  }, [userId])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // ===== INICIAR PAUSA =====
  const iniciarPausa = (exercicio) => {
    setExercicioSelecionado(exercicio)
    setFase('guided')
    setSensacao(null)
  }

  // ===== PAUSA CONCLUIDA (timer terminou) =====
  const handlePausaComplete = useCallback(() => {
    setFase('sensation')
  }, [])

  // ===== GUARDAR PAUSA =====
  const guardarPausa = async (sensacaoEscolhida) => {
    if (!userId || !exercicioSelecionado) return
    setSalvando(true)

    try {
      const agora = new Date()
      const hoje = agora.toISOString().split('T')[0]
      const hora = agora.toTimeString().slice(0, 5) // HH:MM

      await supabase.from('ventis_pausas_log').insert({
        user_id: userId,
        data: hoje,
        hora,
        tipo_pausa: exercicioSelecionado.id,
        duracao_minutos: exercicioSelecionado.duracao,
        exercicio: exercicioSelecionado.nome,
        sensacao: sensacaoEscolhida
      })

      // Tentar incrementar folhas
      const { data: clientData } = await supabase
        .from('ventis_clients')
        .select('folhas_total')
        .eq('user_id', userId)
        .maybeSingle()

      if (clientData) {
        await supabase
          .from('ventis_clients')
          .update({ folhas_total: (clientData.folhas_total || 0) + FOLHAS_POR_PAUSA })
          .eq('user_id', userId)
      }

      setFase('done')
      await carregarDados()
    } catch (err) {
      console.error('Erro ao guardar pausa:', err)
    } finally {
      setSalvando(false)
    }
  }

  // ===== RESETAR =====
  const resetar = () => {
    setExercicioSelecionado(null)
    setFase('picker')
    setSensacao(null)
  }

  // ===== CALCULOS =====
  const totalMinutosHoje = pausasHoje.reduce((acc, p) => acc + (p.duracao_minutos || 0), 0)

  // ===== RENDER: PAUSA GUIADA =====

  if (fase === 'guided' && exercicioSelecionado) {
    return (
      <div className="min-h-screen pb-24" style={{ background: `linear-gradient(135deg, ${VENTIS_DARK} 0%, #243d30 50%, ${VENTIS_DARK} 100%)` }}>
        <PausasStyles />
        <ModuleHeader
          eco="ventis"
          title="Pausa Consciente"
          compact
          backTo="#"
          showHomeButton={false}
          rightAction={
            <button
              onClick={resetar}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
              aria-label="Cancelar pausa"
            >
              <CloseIcon />
            </button>
          }
        />

        <main className="max-w-lg mx-auto px-4">
          <PauseTimer
            exercicio={exercicioSelecionado}
            onComplete={handlePausaComplete}
          />
        </main>
      </div>
    )
  }

  // ===== RENDER: ESCOLHA DE SENSACAO =====

  if (fase === 'sensation') {
    return (
      <div className="min-h-screen pb-24" style={{ background: `linear-gradient(135deg, ${VENTIS_DARK} 0%, #243d30 50%, ${VENTIS_DARK} 100%)` }}>
        <PausasStyles />
        <ModuleHeader eco="ventis" title="Pausa Consciente" compact showHomeButton={false} />

        <main className="max-w-lg mx-auto px-4 py-8 pausas-fadeIn">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🍃</div>
            <h2
              className="text-2xl text-white/90 mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Como te sentes agora?
            </h2>
            <p className="text-white/50 text-sm">
              {exercicioSelecionado?.nome} — {exercicioSelecionado?.duracao} min
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8">
            {SENSACOES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSensacao(s.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  sensacao === s.id
                    ? 'border-[#5D9B84] bg-[#5D9B84]/15 shadow-lg'
                    : 'border-white/10 bg-white/5 hover:border-[#5D9B84]/30'
                }`}
                aria-pressed={sensacao === s.id}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-sm ${sensacao === s.id ? 'text-white' : 'text-white/60'}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => guardarPausa(sensacao)}
            disabled={salvando || !sensacao}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-lg transition-all ${
              !salvando && sensacao
                ? 'hover:scale-[1.01] active:scale-[0.99] shadow-lg'
                : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: (!salvando && sensacao) ? VENTIS_COLOR : 'rgba(255,255,255,0.1)',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            {salvando ? 'A guardar...' : `Guardar (+${FOLHAS_POR_PAUSA} 🍃)`}
          </button>
        </main>
      </div>
    )
  }

  // ===== RENDER: CONCLUSAO =====

  if (fase === 'done') {
    return (
      <div className="min-h-screen pb-24" style={{ background: `linear-gradient(135deg, ${VENTIS_DARK} 0%, #243d30 50%, ${VENTIS_DARK} 100%)` }}>
        <PausasStyles />
        <ModuleHeader eco="ventis" title="Pausas Conscientes" compact />

        <main className="max-w-lg mx-auto px-4 py-12 text-center pausas-fadeIn">
          <div className="text-6xl mb-6">🌿</div>
          <h2
            className="text-2xl text-white/90 mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Pausa {g('registado', 'registada')}
          </h2>
          <p className="text-white/50 mb-2">
            Cada pausa e um acto de presenca.
          </p>
          <p className="text-sm mb-8" style={{ color: VENTIS_COLOR }}>
            +{FOLHAS_POR_PAUSA} Folhas 🍃
          </p>
          <button
            onClick={resetar}
            className="px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
            style={{ backgroundColor: VENTIS_COLOR }}
          >
            Voltar as pausas
          </button>
        </main>
      </div>
    )
  }

  // ===== RENDER PRINCIPAL: PICKER =====

  return (
    <div className="min-h-screen pb-24" style={{ background: `linear-gradient(135deg, ${VENTIS_DARK} 0%, #243d30 50%, ${VENTIS_DARK} 100%)` }}>
      <PausasStyles />

      <ModuleHeader
        eco="ventis"
        title="Pausas Conscientes"
        subtitle="Micro-exercicios de presenca"
      />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* ===== GRELHA DE EXERCICIOS ===== */}
        <section>
          <h3
            className="text-white/80 text-lg mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Escolhe a tua pausa
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {EXERCICIOS_PAUSA.map((exercicio) => {
              const vezesHoje = pausasHoje.filter(p => p.tipo_pausa === exercicio.id).length

              return (
                <button
                  key={exercicio.id}
                  onClick={() => setExercicioSelecionado(
                    exercicioSelecionado?.id === exercicio.id ? null : exercicio
                  )}
                  className={`relative p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    exercicioSelecionado?.id === exercicio.id
                      ? 'border-[#5D9B84] bg-[#5D9B84]/15 shadow-lg shadow-[#5D9B84]/20'
                      : 'border-white/10 bg-white/5 hover:border-[#5D9B84]/30'
                  }`}
                  style={{ border: `1px solid ${exercicioSelecionado?.id === exercicio.id ? VENTIS_COLOR : 'rgba(255,255,255,0.1)'}` }}
                  aria-pressed={exercicioSelecionado?.id === exercicio.id}
                >
                  <span className="text-3xl block mb-2">{exercicio.icon}</span>
                  <h4 className="text-white/90 text-sm font-medium mb-1">{exercicio.nome}</h4>
                  <p className="text-white/40 text-xs">{exercicio.duracao} min</p>

                  {vezesHoje > 0 && (
                    <span
                      className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${VENTIS_COLOR}33`, color: VENTIS_COLOR }}
                    >
                      {vezesHoje}x
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* ===== BOTAO INICIAR ===== */}
        {exercicioSelecionado && fase === 'picker' && (
          <div className="pausas-fadeIn">
            {/* Preview do exercicio */}
            <div className="bg-white/5 border border-[#5D9B84]/30 rounded-xl p-4 mb-3">
              <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {exercicioSelecionado.descricao}
              </p>
            </div>
            <button
              onClick={() => iniciarPausa(exercicioSelecionado)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg"
              style={{ backgroundColor: VENTIS_COLOR, fontFamily: "'Cormorant Garamond', serif" }}
            >
              <PlayIcon />
              Iniciar Pausa
            </button>
          </div>
        )}

        {/* ===== PAUSAS DE HOJE ===== */}
        {!carregando && pausasHoje.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3
                className="text-white/80 text-lg"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Hoje
              </h3>
              <div className="flex items-center gap-2 bg-[#5D9B84]/15 border border-[#5D9B84]/30 rounded-lg px-3 py-1.5">
                <span className="text-sm" style={{ color: VENTIS_COLOR }}>
                  {totalMinutosHoje} min de pausa
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {pausasHoje.map((pausa, idx) => {
                const exercicio = EXERCICIOS_PAUSA.find(e => e.id === pausa.tipo_pausa)
                const sensacaoObj = SENSACOES.find(s => s.id === pausa.sensacao)

                return (
                  <div
                    key={pausa.id || idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span className="text-xl">{exercicio?.icon || '🍃'}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-white/70 text-sm block">
                        {exercicio?.nome || pausa.exercicio}
                      </span>
                      <span className="text-white/40 text-xs">
                        {pausa.hora} — {pausa.duracao_minutos} min
                      </span>
                    </div>
                    {sensacaoObj && (
                      <span className="text-lg" title={sensacaoObj.label}>{sensacaoObj.icon}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ===== ESTATISTICAS ===== */}
        {!carregando && (stats.mediaDia > 0 || stats.streak > 0) && (
          <section className="space-y-3">
            <h3
              className="text-white/80 text-lg"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Estatisticas
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {/* Media por dia */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: VENTIS_COLOR }}>{stats.mediaDia}</p>
                <p className="text-white/40 text-xs mt-1">pausas/dia</p>
              </div>

              {/* Streak */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: VENTIS_COLOR }}>{stats.streak}</p>
                <p className="text-white/40 text-xs mt-1">{stats.streak === 1 ? 'dia seguido' : 'dias seguidos'}</p>
              </div>

              {/* Exercicio favorito */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                {stats.maisUsado ? (
                  <>
                    <p className="text-2xl">{stats.maisUsado.icon}</p>
                    <p className="text-white/40 text-[10px] mt-1 truncate">{stats.maisUsado.nome}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl">—</p>
                    <p className="text-white/40 text-xs mt-1">favorito</p>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===== ESTADO VAZIO ===== */}
        {!carregando && pausasHoje.length === 0 && stats.mediaDia === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🍃</div>
            <p className="text-white/40 text-sm">
              Ainda sem pausas registadas.
            </p>
            <p className="text-white/25 text-xs mt-1">
              Escolhe um exercicio acima para comecar.
            </p>
          </div>
        )}

        {/* ===== CARREGANDO ===== */}
        {carregando && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-[#5D9B84]/30 border-t-[#5D9B84] rounded-full animate-spin mx-auto" />
            <p className="text-white/30 text-sm mt-3">A carregar pausas...</p>
          </div>
        )}

      </main>
    </div>
  )
}
