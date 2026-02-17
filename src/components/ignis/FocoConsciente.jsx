import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

// ===== CONSTANTES =====
const DURACOES = [
  { minutos: 25, label: '25 min', fogo: 1 },
  { minutos: 50, label: '50 min', fogo: 2 },
  { minutos: 90, label: '90 min', fogo: 3 }
]

const CHAMAS_POR_SESSAO = 10

// ===== ICONES SVG =====
const FlameIcon = ({ size = 24, className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={size} height={size}>
    <path d="M12 23c-4.97 0-8-3.03-8-7 0-2.66 1.34-5.36 4-8 0 3 2 5 4 5s3-1.5 3-3.5c0-1.5-.5-3-2-4.5 3.5 2 6 5.5 6 10 0 3.97-3.03 7-7 7z" />
  </svg>
)

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M8 5v14l11-7z" />
  </svg>
)

// ===== CSS KEYFRAMES (inline style tag) =====
const AnimationStyles = () => (
  <style>{`
    @keyframes ignis-flame-dance {
      0%, 100% { transform: scaleY(1) scaleX(1); }
      25% { transform: scaleY(1.08) scaleX(0.95); }
      50% { transform: scaleY(0.95) scaleX(1.05); }
      75% { transform: scaleY(1.05) scaleX(0.97); }
    }
    @keyframes ignis-flame-glow {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
    @keyframes ignis-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(193,99,74,0.4); }
      50% { box-shadow: 0 0 0 12px rgba(193,99,74,0); }
    }
    @keyframes ignis-ember {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-40px) scale(0.3); opacity: 0; }
    }
    .ignis-flame-dance { animation: ignis-flame-dance 2s ease-in-out infinite; }
    .ignis-flame-glow { animation: ignis-flame-glow 3s ease-in-out infinite; }
    .ignis-pulse { animation: ignis-pulse 2s ease-in-out infinite; }
    .ignis-ember { animation: ignis-ember 1.5s ease-out forwards; }
  `}</style>
)

// ===== FORMATAR TEMPO =====
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// ===== FORMATAR DATA =====
function formatData(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
}

// ===== COMPONENTE PRINCIPAL =====
export default function FocoConsciente() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id

  // Estado de fase: 'intencao' | 'timer' | 'reflexao'
  const [fase, setFase] = useState('intencao')

  // Intencao
  const [intencao, setIntencao] = useState('')
  const [duracaoIdx, setDuracaoIdx] = useState(0)

  // Timer
  const [tempoRestante, setTempoRestante] = useState(0)
  const [emPausa, setEmPausa] = useState(false)
  const [mostrarConfirmAbandonar, setMostrarConfirmAbandonar] = useState(false)
  const timerRef = useRef(null)
  const duracaoTotalRef = useRef(0)

  // Reflexao
  const [aproximou, setAproximou] = useState(null) // 'sim' | 'nao' | 'parcialmente'
  const [reflexao, setReflexao] = useState('')
  const [focoNivel, setFocoNivel] = useState(5)
  const [salvando, setSalvando] = useState(false)

  // Historico
  const [sessoes, setSessoes] = useState([])
  const [totalSemanal, setTotalSemanal] = useState(0)
  const [carregando, setCarregando] = useState(true)

  // ===== CARREGAR HISTORICO =====
  const carregarHistorico = useCallback(async () => {
    if (!userId) return
    try {
      const umaSemanaAtras = new Date()
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7)

      const { data, error } = await supabase
        .from('ignis_foco_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Erro ao carregar sessoes:', error)
        return
      }

      setSessoes(data || [])

      // Calcular total semanal
      const semanais = (data || []).filter(s => {
        const d = new Date(s.data)
        return d >= umaSemanaAtras
      })
      const total = semanais.reduce((acc, s) => acc + (s.duracao_minutos || 0), 0)
      setTotalSemanal(total)
    } catch (err) {
      console.error('Erro ao carregar historico:', err)
    } finally {
      setCarregando(false)
    }
  }, [userId])

  useEffect(() => {
    carregarHistorico()
  }, [carregarHistorico])

  // ===== TIMER LOGIC =====
  useEffect(() => {
    if (fase !== 'timer' || emPausa) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setFase('reflexao')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fase, emPausa])

  // ===== INICIAR TIMER =====
  const iniciarFoco = () => {
    const duracao = DURACOES[duracaoIdx]
    const totalSeg = duracao.minutos * 60
    duracaoTotalRef.current = totalSeg
    setTempoRestante(totalSeg)
    setEmPausa(false)
    setMostrarConfirmAbandonar(false)
    setFase('timer')
  }

  // ===== ABANDONAR =====
  const abandonarSessao = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setFase('intencao')
    setMostrarConfirmAbandonar(false)
    setIntencao('')
    setTempoRestante(0)
  }

  // ===== GUARDAR REFLEXAO =====
  const guardarReflexao = async () => {
    if (!userId) return
    setSalvando(true)

    try {
      const duracao = DURACOES[duracaoIdx]
      const hoje = new Date().toISOString().split('T')[0]

      // Inserir sessao
      const { error: insertError } = await supabase
        .from('ignis_foco_sessions')
        .insert({
          user_id: userId,
          data: hoje,
          duracao_minutos: duracao.minutos,
          intencao_antes: intencao.trim() || null,
          reflexao_depois: reflexao.trim() || null,
          aproximou_do_importante: aproximou,
          foco_nivel: focoNivel
        })

      if (insertError) {
        console.error('Erro ao guardar sessao:', insertError)
        setSalvando(false)
        return
      }

      // Incrementar chamas
      const { error: updateError } = await supabase.rpc('increment_field', {
        table_name: 'ignis_clients',
        field_name: 'chamas_total',
        increment_value: CHAMAS_POR_SESSAO,
        user_id_value: userId
      }).catch(() => {
        // Se a RPC nao existir, tentar update directo
        return supabase
          .from('ignis_clients')
          .update({ chamas_total: supabase.rpc ? undefined : 0 })
          .eq('user_id', userId)
      })

      // Fallback: update simples se RPC falhar
      if (updateError) {
        // Buscar valor actual e incrementar
        const { data: clientData } = await supabase
          .from('ignis_clients')
          .select('chamas_total')
          .eq('user_id', userId)
          .maybeSingle()

        if (clientData) {
          await supabase
            .from('ignis_clients')
            .update({ chamas_total: (clientData.chamas_total || 0) + CHAMAS_POR_SESSAO })
            .eq('user_id', userId)
        }
      }

      // Reset e recarregar
      setFase('intencao')
      setIntencao('')
      setReflexao('')
      setAproximou(null)
      setFocoNivel(5)
      await carregarHistorico()
    } catch (err) {
      console.error('Erro ao guardar reflexao:', err)
    } finally {
      setSalvando(false)
    }
  }

  // ===== PROGRESSO DO TIMER =====
  const progresso = duracaoTotalRef.current > 0
    ? 1 - (tempoRestante / duracaoTotalRef.current)
    : 0

  // ===== RENDER =====
  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #2e1a14 0%, #1a0f0a 100%)' }}>
      <AnimationStyles />

      <ModuleHeader
        eco="ignis"
        title="Foco Consciente"
        subtitle="Acende a tua chama interior"
      />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ===== FASE 1: INTENCAO ===== */}
        {fase === 'intencao' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Pergunta provocadora */}
            <div className="bg-white/5 backdrop-blur-sm border border-[#C1634A]/30 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <FlameIcon size={28} className="text-[#C1634A] flex-shrink-0 mt-1" />
                <div>
                  <p
                    className="text-[#C1634A] text-lg leading-relaxed"
                    style={{ fontFamily: 'var(--font-titulos)' }}
                  >
                    &ldquo;Isto e realmente importante ou estou a evitar algo?&rdquo;
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    Para antes de comecar. Responde com honestidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Input de intencao */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm block">
                Nesta sessao, o meu foco e...
              </label>
              <textarea
                value={intencao}
                onChange={(e) => setIntencao(e.target.value)}
                placeholder={g(
                  'Escreve aqui a tua intencao para esta sessao...',
                  'Escreve aqui a tua intencao para esta sessao...'
                )}
                rows={3}
                className="w-full bg-white/10 border border-[#C1634A]/30 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C1634A]/60 focus:ring-1 focus:ring-[#C1634A]/30 resize-none transition-colors"
                aria-label="Intencao para esta sessao de foco"
              />
            </div>

            {/* Selector de duracao */}
            <div className="space-y-3">
              <p className="text-white/70 text-sm">Duracao da sessao</p>
              <div className="grid grid-cols-3 gap-3">
                {DURACOES.map((d, idx) => (
                  <button
                    key={d.minutos}
                    onClick={() => setDuracaoIdx(idx)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      duracaoIdx === idx
                        ? 'bg-[#C1634A]/20 border-[#C1634A] shadow-lg shadow-[#C1634A]/20'
                        : 'bg-white/5 border-white/10 hover:border-[#C1634A]/40'
                    }`}
                    aria-label={`${d.label} de foco`}
                    aria-pressed={duracaoIdx === idx}
                  >
                    {/* Chamas visuais - mais chamas = mais tempo */}
                    <div className="flex items-end gap-0.5">
                      {Array.from({ length: d.fogo }).map((_, i) => (
                        <FlameIcon
                          key={i}
                          size={d.fogo === 1 ? 28 : d.fogo === 2 ? 24 : 20}
                          className={`transition-colors ${
                            duracaoIdx === idx ? 'text-[#C1634A]' : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-medium ${
                      duracaoIdx === idx ? 'text-[#C1634A]' : 'text-white/60'
                    }`}>
                      {d.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Botao iniciar */}
            <button
              onClick={iniciarFoco}
              disabled={!intencao.trim()}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
                intencao.trim()
                  ? 'bg-[#C1634A] hover:bg-[#a8523c] shadow-lg shadow-[#C1634A]/30 active:scale-[0.98]'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Acender o Foco
            </button>
          </div>
        )}

        {/* ===== FASE 2: TIMER ===== */}
        {fase === 'timer' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Intencao actual */}
            <div className="text-center">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">A tua intencao</p>
              <p className="text-white/80 text-sm italic">&ldquo;{intencao}&rdquo;</p>
            </div>

            {/* Circulo do timer com chama */}
            <div className="flex justify-center py-4">
              <div className="relative w-64 h-64">
                {/* Glow de fundo */}
                <div
                  className="absolute inset-0 rounded-full ignis-flame-glow"
                  style={{
                    background: `radial-gradient(circle, rgba(193,99,74,${0.15 + progresso * 0.25}) 0%, transparent 70%)`
                  }}
                />

                {/* Circulo SVG */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="3"
                  />
                  {/* Progresso */}
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="url(#ignis-grad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progresso)}`}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                  <defs>
                    <linearGradient id="ignis-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C1634A" />
                      <stop offset="50%" stopColor="#E88A6D" />
                      <stop offset="100%" stopColor="#F5A623" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Centro com chama e tempo */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Chama animada que cresce com progresso */}
                  <div
                    className="ignis-flame-dance"
                    style={{
                      transform: `scale(${0.7 + progresso * 0.6})`,
                      transition: 'transform 2s ease'
                    }}
                  >
                    <FlameIcon
                      size={48}
                      className="text-[#C1634A] drop-shadow-lg"
                      style={{ filter: `drop-shadow(0 0 ${8 + progresso * 16}px rgba(193,99,74,${0.4 + progresso * 0.4}))` }}
                    />
                  </div>

                  {/* Tempo restante */}
                  <p className="text-white text-4xl font-light tracking-widest mt-2"
                     style={{ fontFamily: 'var(--font-titulos)' }}>
                    {formatTime(tempoRestante)}
                  </p>

                  <p className="text-white/30 text-xs mt-1">
                    {DURACOES[duracaoIdx].label}
                  </p>
                </div>

                {/* Brasas subindo (embers) quando progresso > 30% */}
                {progresso > 0.3 && !emPausa && (
                  <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 pointer-events-none">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-[#F5A623] ignis-ember"
                        style={{
                          left: `${-8 + i * 8}px`,
                          animationDelay: `${i * 0.5}s`,
                          animationDuration: `${1.5 + i * 0.3}s`,
                          animationIterationCount: 'infinite'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pulse indicator */}
            {!emPausa && (
              <div className="flex justify-center">
                <div className="w-3 h-3 rounded-full bg-[#C1634A] ignis-pulse" />
              </div>
            )}

            {/* Controlos */}
            <div className="flex items-center justify-center gap-4">
              {/* Pausa / Retomar */}
              <button
                onClick={() => setEmPausa(p => !p)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
                aria-label={emPausa ? 'Retomar sessao' : 'Pausar sessao'}
              >
                {emPausa ? <PlayIcon /> : <PauseIcon />}
                <span className="text-sm">{emPausa ? 'Retomar' : 'Pausa'}</span>
              </button>

              {/* Abandonar */}
              <button
                onClick={() => setMostrarConfirmAbandonar(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white/70 hover:bg-white/10 transition-colors"
                aria-label="Abandonar sessao"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                <span className="text-sm">Abandonar</span>
              </button>
            </div>

            {/* Modal de confirmacao de abandono */}
            {mostrarConfirmAbandonar && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setMostrarConfirmAbandonar(false)}
                />
                <div className="relative bg-[#2e1a14] border border-[#C1634A]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <FlameIcon size={32} className="text-[#C1634A]/50 mx-auto mb-3" />
                  <p className="text-white text-center text-lg mb-2"
                     style={{ fontFamily: 'var(--font-titulos)' }}>
                    Tens a certeza?
                  </p>
                  <p className="text-white/50 text-center text-sm mb-6">
                    As vezes parar e a escolha certa.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMostrarConfirmAbandonar(false)}
                      className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors"
                    >
                      Continuar
                    </button>
                    <button
                      onClick={abandonarSessao}
                      className="flex-1 py-3 rounded-xl bg-[#C1634A]/20 border border-[#C1634A]/40 text-[#C1634A] text-sm hover:bg-[#C1634A]/30 transition-colors"
                    >
                      Sim, parar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== FASE 3: REFLEXAO ===== */}
        {fase === 'reflexao' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Header de celebracao */}
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C1634A]/20 mb-3">
                <FlameIcon size={36} className="text-[#C1634A]" />
              </div>
              <h2
                className="text-white text-2xl"
                style={{ fontFamily: 'var(--font-titulos)' }}
              >
                Sessao {g('completo', 'completa')}
              </h2>
              <p className="text-white/50 text-sm mt-1">
                {DURACOES[duracaoIdx].label} de foco {g('dedicado', 'dedicada')}
              </p>
            </div>

            {/* Pergunta: aproximou do importante? */}
            <div className="bg-white/5 border border-[#C1634A]/20 rounded-2xl p-5 space-y-4">
              <p className="text-white/80 text-sm"
                 style={{ fontFamily: 'var(--font-titulos)', fontSize: '1.05rem' }}>
                Isto aproximou-me do que importa?
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'sim', label: 'Sim', icon: '~' },
                  { value: 'parcialmente', label: 'Parcialmente', icon: '~' },
                  { value: 'nao', label: 'Nao', icon: '~' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAproximou(opt.value)}
                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                      aproximou === opt.value
                        ? 'bg-[#C1634A] text-white shadow-lg shadow-[#C1634A]/30'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:border-[#C1634A]/30'
                    }`}
                    aria-pressed={aproximou === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea reflexao */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm block">
                O que descobri durante o foco?
              </label>
              <textarea
                value={reflexao}
                onChange={(e) => setReflexao(e.target.value)}
                placeholder="Anota aqui as tuas descobertas, pensamentos ou insights..."
                rows={3}
                className="w-full bg-white/10 border border-[#C1634A]/30 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#C1634A]/60 focus:ring-1 focus:ring-[#C1634A]/30 resize-none transition-colors"
                aria-label="Reflexao apos sessao de foco"
              />
            </div>

            {/* Slider nivel de foco */}
            <div className="bg-white/5 border border-[#C1634A]/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white/70 text-sm">Como avalias o teu nivel de foco?</p>
                <span className="text-[#C1634A] font-bold text-lg">{focoNivel}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={focoNivel}
                onChange={(e) => setFocoNivel(Number(e.target.value))}
                className="w-full accent-[#C1634A]"
                aria-label="Nivel de foco de 1 a 10"
              />
              <div className="flex justify-between text-xs text-white/30">
                <span>{g('Disperso', 'Dispersa')}</span>
                <span>{g('Absorvido', 'Absorvida')}</span>
              </div>
            </div>

            {/* Botao guardar */}
            <button
              onClick={guardarReflexao}
              disabled={salvando || !aproximou}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all ${
                !salvando && aproximou
                  ? 'bg-[#C1634A] hover:bg-[#a8523c] shadow-lg shadow-[#C1634A]/30 active:scale-[0.98]'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              {salvando ? 'A guardar...' : `Guardar Reflexao (+${CHAMAS_POR_SESSAO} chamas)`}
            </button>
          </div>
        )}

        {/* ===== HISTORICO ===== */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-white/80 text-lg"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Historico de Sessoes
            </h3>
            {totalSemanal > 0 && (
              <div className="flex items-center gap-2 bg-[#C1634A]/15 border border-[#C1634A]/30 rounded-lg px-3 py-1.5">
                <FlameIcon size={16} className="text-[#C1634A]" />
                <span className="text-[#C1634A] text-sm font-medium">
                  {totalSemanal} min esta semana
                </span>
              </div>
            )}
          </div>

          {carregando ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#C1634A]/30 border-t-[#C1634A] rounded-full animate-spin mx-auto" />
              <p className="text-white/30 text-sm mt-3">A carregar sessoes...</p>
            </div>
          ) : sessoes.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <FlameIcon size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">
                Ainda sem sessoes de foco.
              </p>
              <p className="text-white/25 text-xs mt-1">
                Inicia a tua primeira sessao acima.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessoes.map((sessao) => (
                <div
                  key={sessao.id || sessao.data}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#C1634A]/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Data e duracao */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white/40 text-xs">{formatData(sessao.data)}</span>
                        <span className="text-white/20">|</span>
                        <span className="text-[#C1634A] text-xs font-medium">{sessao.duracao_minutos} min</span>
                      </div>
                      {/* Intencao */}
                      {sessao.intencao_antes && (
                        <p className="text-white/60 text-sm truncate">
                          {sessao.intencao_antes}
                        </p>
                      )}
                    </div>
                    {/* Nivel de foco */}
                    {sessao.foco_nivel && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <FlameIcon size={14} className="text-[#C1634A]" />
                        <span className="text-white/60 text-xs">{sessao.foco_nivel}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
