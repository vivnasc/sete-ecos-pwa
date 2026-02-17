import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'

// ===== CONSTANTES =====
const VENTIS_COLOR = '#5D9B84'
const VENTIS_DARK = '#1a2e24'
const FOLHAS_POR_ROTINA = 8

// ===== ICONES SVG =====

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const ArrowUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M18 15l-6-6-6 6" />
  </svg>
)

const ArrowDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M8 5v14l11-7z" />
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

const LeafIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="20" height="20">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
  </svg>
)

// ===== COMPONENTE: FORMULARIO DE BLOCO =====

function BlocoForm({ onAdd }) {
  const [nome, setNome] = useState('')
  const [duracao, setDuracao] = useState('')
  const [descricao, setDescricao] = useState('')

  const handleAdd = () => {
    if (!nome.trim() || !duracao) return
    onAdd({
      id: Date.now().toString(),
      nome: nome.trim(),
      duracao: parseInt(duracao, 10),
      descricao: descricao.trim() || null
    })
    setNome('')
    setDuracao('')
    setDescricao('')
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <p className="text-white/60 text-xs uppercase tracking-wider">Novo bloco</p>
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do bloco (ex: Meditacao)"
        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#5D9B84]/50 transition-colors"
        aria-label="Nome do bloco"
      />
      <div className="flex gap-3">
        <input
          type="number"
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          placeholder="Minutos"
          min="1"
          max="120"
          className="w-28 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#5D9B84]/50 transition-colors"
          aria-label="Duracao em minutos"
        />
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descricao (opcional)"
          className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#5D9B84]/50 transition-colors"
          aria-label="Descricao do bloco"
        />
      </div>
      <button
        onClick={handleAdd}
        disabled={!nome.trim() || !duracao}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          nome.trim() && duracao
            ? 'bg-[#5D9B84] text-white hover:bg-[#4e8a74]'
            : 'bg-white/5 text-white/30 cursor-not-allowed'
        }`}
      >
        <PlusIcon />
        Adicionar bloco
      </button>
    </div>
  )
}

// ===== COMPONENTE: CARD DE BLOCO =====

function BlocoCard({ bloco, index, total, onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 transition-all hover:border-[#5D9B84]/30">
      {/* Numero */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: `${VENTIS_COLOR}33`, color: VENTIS_COLOR }}
      >
        {index + 1}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-sm font-medium truncate">{bloco.nome}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-white/40 text-xs">{bloco.duracao} min</span>
          {bloco.descricao && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-white/40 text-xs truncate">{bloco.descricao}</span>
            </>
          )}
        </div>
      </div>

      {/* Accoes */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 disabled:opacity-20 transition-colors"
          aria-label="Mover para cima"
        >
          <ArrowUpIcon />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 disabled:opacity-20 transition-colors"
          aria-label="Mover para baixo"
        >
          <ArrowDownIcon />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
          aria-label="Remover bloco"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

// ===== COMPONENTE: TIMER DE EXECUCAO =====

function ExecutionTimer({ bloco, onComplete }) {
  const totalSeconds = bloco.duracao * 60
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
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Circulo de progresso */}
      <div className="relative w-48 h-48">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white tabular-nums">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className="text-white/40 text-xs mt-1">{bloco.nome}</span>
        </div>
      </div>

      {/* Descricao */}
      {bloco.descricao && (
        <p className="text-white/50 text-sm text-center max-w-xs italic">
          {bloco.descricao}
        </p>
      )}

      {/* Controlos */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setPaused(!paused)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label={paused ? 'Continuar' : 'Pausar'}
        >
          {paused ? <PlayIcon /> : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          )}
        </button>
        <button
          onClick={onComplete}
          className="px-5 py-2 rounded-full text-sm font-medium transition-all"
          style={{ backgroundColor: `${VENTIS_COLOR}33`, color: VENTIS_COLOR }}
        >
          Saltar bloco
        </button>
      </div>
    </div>
  )
}

// ===== COMPONENTE: CALENDARIO SEMANAL (DOTS) =====

function CalendarioSemanal({ logs }) {
  const hoje = new Date()
  const dias = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const feito = logs.some(l => l.data === dateStr)
    dias.push({
      date: d,
      dateStr,
      feito,
      label: d.toLocaleDateString('pt-PT', { weekday: 'short' }).slice(0, 3)
    })
  }

  const completados = dias.filter(d => d.feito).length

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white/70 text-sm font-medium">Ultimos 7 dias</h4>
        <span className="text-sm font-bold" style={{ color: VENTIS_COLOR }}>
          {completados}/7
        </span>
      </div>
      <div className="flex justify-between">
        {dias.map((dia) => (
          <div key={dia.dateStr} className="flex flex-col items-center gap-1.5">
            <span className="text-white/30 text-[10px] uppercase">{dia.label}</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                dia.feito
                  ? 'shadow-lg'
                  : 'bg-white/5 border border-white/10'
              }`}
              style={dia.feito ? { backgroundColor: VENTIS_COLOR, boxShadow: `0 0 12px ${VENTIS_COLOR}40` } : {}}
            >
              {dia.feito && <CheckIcon />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== ESTILOS CSS =====

function RotinasStyles() {
  return (
    <style>{`
      @keyframes ventis-fadeIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .ventis-fadeIn { animation: ventis-fadeIn 0.4s ease-out; }
    `}</style>
  )
}

// ===== COMPONENTE PRINCIPAL =====

export default function RotinasBuilder() {
  const { userRecord } = useAuth()
  const userId = userRecord?.id

  // Tabs
  const [tab, setTab] = useState('matinal') // matinal | nocturna

  // Estado do formulario de criacao/edicao
  const [criando, setCriando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [nomeRotina, setNomeRotina] = useState('')
  const [blocos, setBlocos] = useState([])
  const [eRitual, setERitual] = useState(false)

  // Rotinas guardadas
  const [rotinas, setRotinas] = useState([])
  const [carregando, setCarregando] = useState(true)

  // Execucao
  const [executando, setExecutando] = useState(null) // rotina em execucao
  const [blocoActual, setBlocoActual] = useState(0)
  const [blocosCompletados, setBlocosCompletados] = useState([])
  const [inicioExecucao, setInicioExecucao] = useState(null)

  // Pos-execucao
  const [faseExecucao, setFaseExecucao] = useState('idle') // idle | running | sensation | done
  const [sensacao, setSensacao] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Logs de historico
  const [logs, setLogs] = useState([])

  // ===== CARREGAR ROTINAS =====
  const carregarDados = useCallback(async () => {
    if (!userId) return
    try {
      // Carregar rotinas
      const { data: rotinasData } = await supabase
        .from('ventis_rotinas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setRotinas(rotinasData || [])

      // Carregar logs dos ultimos 7 dias
      const seteDiasAtras = new Date()
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

      const { data: logsData } = await supabase
        .from('ventis_rotinas_log')
        .select('*')
        .eq('user_id', userId)
        .gte('data', seteDiasAtras.toISOString().split('T')[0])
        .order('data', { ascending: false })

      setLogs(logsData || [])
    } catch (err) {
      console.error('Erro ao carregar rotinas:', err)
    } finally {
      setCarregando(false)
    }
  }, [userId])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // ===== GESTAO DE BLOCOS =====
  const addBloco = (bloco) => {
    setBlocos(prev => [...prev, bloco])
  }

  const removeBloco = (id) => {
    setBlocos(prev => prev.filter(b => b.id !== id))
  }

  const moveBloco = (index, direction) => {
    const newBlocos = [...blocos]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newBlocos.length) return
    const temp = newBlocos[index]
    newBlocos[index] = newBlocos[targetIndex]
    newBlocos[targetIndex] = temp
    setBlocos(newBlocos)
  }

  // ===== GUARDAR ROTINA =====
  const guardarRotina = async () => {
    if (!userId || !nomeRotina.trim() || blocos.length === 0) return
    setSalvando(true)

    try {
      const payload = {
        user_id: userId,
        tipo: tab,
        nome: nomeRotina.trim(),
        blocos: JSON.stringify(blocos),
        e_ritual: eRitual
      }

      if (editandoId) {
        await supabase
          .from('ventis_rotinas')
          .update(payload)
          .eq('id', editandoId)
      } else {
        await supabase
          .from('ventis_rotinas')
          .insert(payload)
      }

      // Reset form
      setCriando(false)
      setEditandoId(null)
      setNomeRotina('')
      setBlocos([])
      setERitual(false)
      await carregarDados()
    } catch (err) {
      console.error('Erro ao guardar rotina:', err)
    } finally {
      setSalvando(false)
    }
  }

  // ===== EDITAR ROTINA =====
  const editarRotina = (rotina) => {
    setEditandoId(rotina.id)
    setNomeRotina(rotina.nome)
    setTab(rotina.tipo)
    setERitual(rotina.e_ritual || false)
    try {
      const b = typeof rotina.blocos === 'string' ? JSON.parse(rotina.blocos) : rotina.blocos
      setBlocos(b || [])
    } catch {
      setBlocos([])
    }
    setCriando(true)
  }

  // ===== ELIMINAR ROTINA =====
  const eliminarRotina = async (id) => {
    try {
      await supabase.from('ventis_rotinas').delete().eq('id', id)
      await carregarDados()
    } catch (err) {
      console.error('Erro ao eliminar rotina:', err)
    }
  }

  // ===== INICIAR EXECUCAO =====
  const iniciarExecucao = (rotina) => {
    let blocosParsed
    try {
      blocosParsed = typeof rotina.blocos === 'string' ? JSON.parse(rotina.blocos) : rotina.blocos
    } catch {
      blocosParsed = []
    }

    setExecutando({ ...rotina, blocosParsed })
    setBlocoActual(0)
    setBlocosCompletados([])
    setInicioExecucao(Date.now())
    setFaseExecucao('running')
    setSensacao('')
  }

  // ===== BLOCO COMPLETADO =====
  const handleBlocoComplete = useCallback(() => {
    if (!executando) return

    const blocoNome = executando.blocosParsed[blocoActual]?.nome
    setBlocosCompletados(prev => [...prev, blocoNome])

    if (blocoActual < executando.blocosParsed.length - 1) {
      setBlocoActual(prev => prev + 1)
    } else {
      setFaseExecucao('sensation')
    }
  }, [executando, blocoActual])

  // ===== GUARDAR LOG DE EXECUCAO =====
  const guardarExecucao = async () => {
    if (!userId || !executando) return
    setSalvando(true)

    try {
      const hoje = new Date().toISOString().split('T')[0]
      const duracaoMin = Math.round((Date.now() - inicioExecucao) / 60000)

      await supabase.from('ventis_rotinas_log').insert({
        user_id: userId,
        rotina_id: executando.id,
        data: hoje,
        blocos_completados: JSON.stringify(blocosCompletados),
        duracao_minutos: duracaoMin || 1,
        sensacao: sensacao.trim() || null
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
          .update({ folhas_total: (clientData.folhas_total || 0) + FOLHAS_POR_ROTINA })
          .eq('user_id', userId)
      }

      setFaseExecucao('done')
      await carregarDados()
    } catch (err) {
      console.error('Erro ao guardar execucao:', err)
    } finally {
      setSalvando(false)
    }
  }

  // ===== CANCELAR/RESETAR =====
  const resetExecucao = () => {
    setExecutando(null)
    setBlocoActual(0)
    setBlocosCompletados([])
    setInicioExecucao(null)
    setFaseExecucao('idle')
    setSensacao('')
  }

  const cancelarCriacao = () => {
    setCriando(false)
    setEditandoId(null)
    setNomeRotina('')
    setBlocos([])
    setERitual(false)
  }

  // ===== ROTINAS FILTRADAS POR TAB =====
  const rotinasFiltradas = rotinas.filter(r => r.tipo === tab)

  // ===== RENDER: EXECUCAO ACTIVA =====

  if (faseExecucao === 'running' && executando) {
    const blocoAtual = executando.blocosParsed[blocoActual]
    if (!blocoAtual) return null

    return (
      <div className="min-h-screen pb-24" style={{ background: `linear-gradient(135deg, ${VENTIS_DARK} 0%, #243d30 50%, ${VENTIS_DARK} 100%)` }}>
        <RotinasStyles />
        <ModuleHeader
          eco="ventis"
          title={executando.nome}
          compact
          backTo="#"
          showHomeButton={false}
          rightAction={
            <button
              onClick={resetExecucao}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
              aria-label="Cancelar execucao"
            >
              <CloseIcon />
            </button>
          }
        />

        <main className="max-w-lg mx-auto px-4 py-4">
          {/* Progresso dos blocos */}
          <div className="flex items-center gap-1.5 mb-6">
            {executando.blocosParsed.map((b, idx) => (
              <div
                key={b.id || idx}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: idx < blocoActual
                    ? VENTIS_COLOR
                    : idx === blocoActual
                      ? `${VENTIS_COLOR}80`
                      : 'rgba(255,255,255,0.1)'
                }}
              />
            ))}
          </div>

          <p className="text-white/40 text-xs text-center mb-2">
            Bloco {blocoActual + 1} de {executando.blocosParsed.length}
          </p>

          <ExecutionTimer
            key={blocoActual}
            bloco={blocoAtual}
            onComplete={handleBlocoComplete}
          />
        </main>
      </div>
    )
  }

  // ===== RENDER: SENSACAO POS-EXECUCAO =====

  if (faseExecucao === 'sensation') {
    return (
      <div className="min-h-screen pb-24" style={{ background: `linear-gradient(135deg, ${VENTIS_DARK} 0%, #243d30 50%, ${VENTIS_DARK} 100%)` }}>
        <RotinasStyles />
        <ModuleHeader eco="ventis" title="Reflexao" compact showHomeButton={false} />

        <main className="max-w-lg mx-auto px-4 py-8 ventis-fadeIn">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🍃</div>
            <h2
              className="text-2xl text-white/90 mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Rotina {g('completo', 'completa')}!
            </h2>
            <p className="text-white/50 text-sm">
              {blocosCompletados.length} de {executando?.blocosParsed?.length || 0} blocos {g('completados', 'completados')}
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-white/70 text-sm block">
              Como te sentes?
            </label>
            <textarea
              value={sensacao}
              onChange={(e) => setSensacao(e.target.value)}
              placeholder={g('Descreve como te sentes agora...', 'Descreve como te sentes agora...')}
              rows={4}
              className="w-full bg-white/10 border border-[#5D9B84]/30 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#5D9B84]/60 focus:ring-1 focus:ring-[#5D9B84]/30 resize-none transition-colors"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem' }}
              aria-label="Como te sentes apos a rotina"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setSensacao(''); guardarExecucao() }}
                className="px-6 py-2.5 rounded-full text-white/50 bg-white/5 hover:bg-white/10 text-sm transition-colors"
              >
                Saltar
              </button>
              <button
                onClick={guardarExecucao}
                disabled={salvando}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-white font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: VENTIS_COLOR }}
              >
                {salvando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckIcon />
                )}
                <span>{salvando ? 'A guardar...' : `Guardar (+${FOLHAS_POR_ROTINA} 🍃)`}</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ===== RENDER: CONCLUSAO =====

  if (faseExecucao === 'done') {
    return (
      <div className="min-h-screen pb-24" style={{ background: `linear-gradient(135deg, ${VENTIS_DARK} 0%, #243d30 50%, ${VENTIS_DARK} 100%)` }}>
        <RotinasStyles />
        <ModuleHeader eco="ventis" title="Rotinas" compact />

        <main className="max-w-lg mx-auto px-4 py-12 text-center ventis-fadeIn">
          <div className="text-6xl mb-6">🌿</div>
          <h2
            className="text-2xl text-white/90 mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {g('Magnifico', 'Magnifica')}!
          </h2>
          <p className="text-white/50 mb-2">
            A tua rotina foi {g('registado', 'registada')} com sucesso.
          </p>
          <p className="text-sm mb-8" style={{ color: VENTIS_COLOR }}>
            +{FOLHAS_POR_ROTINA} Folhas 🍃 {g('ganhos', 'ganhas')}
          </p>
          <button
            onClick={resetExecucao}
            className="px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
            style={{ backgroundColor: VENTIS_COLOR }}
          >
            Voltar as rotinas
          </button>
        </main>
      </div>
    )
  }

  // ===== RENDER PRINCIPAL =====

  return (
    <div className="min-h-screen pb-24" style={{ background: `linear-gradient(135deg, ${VENTIS_DARK} 0%, #243d30 50%, ${VENTIS_DARK} 100%)` }}>
      <RotinasStyles />

      <ModuleHeader
        eco="ventis"
        title="Rotinas"
        subtitle={executando ? executando.nome : 'Constroi os teus rituais diarios'}
      />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* ===== TABS ===== */}
        <div className="flex bg-white/5 rounded-xl p-1">
          {[
            { id: 'matinal', label: '🌅 Matinal' },
            { id: 'nocturna', label: '🌙 Nocturna' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (criando) cancelarCriacao() }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'text-white shadow-lg'
                  : 'text-white/50 hover:text-white/70'
              }`}
              style={tab === t.id ? { backgroundColor: VENTIS_COLOR } : {}}
              aria-pressed={tab === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== FORMULARIO DE CRIACAO/EDICAO ===== */}
        {criando && (
          <div className="space-y-4 ventis-fadeIn">
            <div className="flex items-center justify-between">
              <h3
                className="text-white/90 text-lg"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {editandoId ? 'Editar rotina' : 'Nova rotina'}
              </h3>
              <button
                onClick={cancelarCriacao}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 transition-colors"
                aria-label="Cancelar"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Nome da rotina */}
            <input
              type="text"
              value={nomeRotina}
              onChange={(e) => setNomeRotina(e.target.value)}
              placeholder="Nome da rotina (ex: Ritual da Manha)"
              className="w-full bg-white/10 border border-[#5D9B84]/30 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#5D9B84]/60 focus:ring-1 focus:ring-[#5D9B84]/30 transition-colors"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem' }}
              aria-label="Nome da rotina"
            />

            {/* Toggle ritual */}
            <button
              onClick={() => setERitual(!eRitual)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${
                eRitual
                  ? 'border-[#5D9B84]/50 bg-[#5D9B84]/10'
                  : 'border-white/10 bg-white/5'
              }`}
              aria-pressed={eRitual}
            >
              <div
                className={`w-10 h-6 rounded-full relative transition-all ${
                  eRitual ? 'bg-[#5D9B84]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    eRitual ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </div>
              <div className="text-left">
                <p className="text-white/90 text-sm font-medium">E um ritual?</p>
                <p className="text-white/40 text-xs">
                  Um ritual e consciente e intencional, nao automatico.
                </p>
              </div>
            </button>

            {/* Lista de blocos */}
            {blocos.length > 0 && (
              <div className="space-y-2">
                <p className="text-white/60 text-xs uppercase tracking-wider">
                  Blocos ({blocos.length}) — {blocos.reduce((s, b) => s + b.duracao, 0)} min total
                </p>
                {blocos.map((bloco, idx) => (
                  <BlocoCard
                    key={bloco.id}
                    bloco={bloco}
                    index={idx}
                    total={blocos.length}
                    onMoveUp={() => moveBloco(idx, -1)}
                    onMoveDown={() => moveBloco(idx, 1)}
                    onRemove={() => removeBloco(bloco.id)}
                  />
                ))}
              </div>
            )}

            {/* Adicionar bloco */}
            <BlocoForm onAdd={addBloco} />

            {/* Botao guardar */}
            <button
              onClick={guardarRotina}
              disabled={salvando || !nomeRotina.trim() || blocos.length === 0}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-lg transition-all ${
                !salvando && nomeRotina.trim() && blocos.length > 0
                  ? 'hover:scale-[1.01] active:scale-[0.99] shadow-lg'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              style={{
                backgroundColor: (!salvando && nomeRotina.trim() && blocos.length > 0) ? VENTIS_COLOR : 'rgba(255,255,255,0.1)',
                fontFamily: "'Cormorant Garamond', serif"
              }}
            >
              {salvando ? 'A guardar...' : (editandoId ? 'Actualizar rotina' : 'Guardar rotina')}
            </button>
          </div>
        )}

        {/* ===== BOTAO CRIAR NOVA ===== */}
        {!criando && (
          <button
            onClick={() => setCriando(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#5D9B84]/40 text-[#5D9B84] hover:bg-[#5D9B84]/10 transition-all"
          >
            <PlusIcon />
            <span className="text-sm font-medium">Criar nova rotina {tab === 'matinal' ? 'matinal' : 'nocturna'}</span>
          </button>
        )}

        {/* ===== LISTA DE ROTINAS ===== */}
        {!criando && (
          <div className="space-y-3">
            {carregando ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-[#5D9B84]/30 border-t-[#5D9B84] rounded-full animate-spin mx-auto" />
                <p className="text-white/30 text-sm mt-3">A carregar rotinas...</p>
              </div>
            ) : rotinasFiltradas.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">{tab === 'matinal' ? '🌅' : '🌙'}</div>
                <p className="text-white/40 text-sm">
                  Ainda sem rotinas {tab === 'matinal' ? 'matinais' : 'nocturnas'}.
                </p>
                <p className="text-white/25 text-xs mt-1">
                  Cria a tua primeira rotina acima.
                </p>
              </div>
            ) : (
              rotinasFiltradas.map((rotina) => {
                let blocosParsed = []
                try {
                  blocosParsed = typeof rotina.blocos === 'string' ? JSON.parse(rotina.blocos) : (rotina.blocos || [])
                } catch { /* ignore */ }
                const duracaoTotal = blocosParsed.reduce((s, b) => s + (b.duracao || 0), 0)

                return (
                  <div
                    key={rotina.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:border-[#5D9B84]/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white/90 font-medium">{rotina.nome}</h4>
                          {rotina.e_ritual && (
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${VENTIS_COLOR}22`, color: VENTIS_COLOR }}>
                              Ritual
                            </span>
                          )}
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">
                          {blocosParsed.length} {blocosParsed.length === 1 ? 'bloco' : 'blocos'} — {duracaoTotal} min
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => editarRotina(rotina)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/40 transition-colors"
                          aria-label="Editar rotina"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => eliminarRotina(rotina.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                          aria-label="Eliminar rotina"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    {/* Blocos em miniatura */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {blocosParsed.map((b, idx) => (
                        <span
                          key={b.id || idx}
                          className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/50 border border-white/5"
                        >
                          {b.nome} ({b.duracao}m)
                        </span>
                      ))}
                    </div>

                    {/* Botao iniciar */}
                    <button
                      onClick={() => iniciarExecucao(rotina)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{ backgroundColor: VENTIS_COLOR }}
                    >
                      <PlayIcon />
                      <span>Iniciar Rotina</span>
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ===== HISTORICO SEMANAL ===== */}
        {!criando && !carregando && logs.length > 0 && (
          <section className="space-y-4 pt-2">
            <h3
              className="text-white/80 text-lg"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Historico
            </h3>
            <CalendarioSemanal logs={logs} />
          </section>
        )}

      </main>
    </div>
  )
}
