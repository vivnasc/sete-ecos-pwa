import React, { useState, useEffect, useCallback } from 'react'
import ModuleHeader from '../shared/ModuleHeader'
import { g } from '../../utils/genero'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// ===== VALORES SUGERIDOS =====

const VALORES_SUGERIDOS = [
  'Honestidade', 'Liberdade', 'Família', 'Criatividade', 'Coragem',
  'Compaixão', 'Justiça', 'Autonomia', 'Amor', 'Crescimento',
  'Saúde', 'Respeito', 'Autenticidade', 'Conexão', 'Paz',
  'Aventura', 'Sabedoria', 'Generosidade', 'Disciplina', 'Alegria'
]

// ===== SVG ICONS =====

const FireIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 23c-3.9 0-7-3.1-7-7 0-3.2 2.1-5.8 3.8-7.8L12 4l3.2 4.2C16.9 10.2 19 12.8 19 16c0 3.9-3.1 7-7 7z" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

// ===== COMPASS STAR VISUAL =====

function CompassStar({ valores, alinhamento }) {
  const size = 300
  const cx = size / 2
  const cy = size / 2
  const outerR = 120
  const innerR = 40

  // 5 points evenly spaced, starting from top (-90 degrees)
  const pontos = valores.map((v, i) => {
    const angle = ((2 * Math.PI) / 5) * i - Math.PI / 2
    const score = alinhamento?.[i] ?? 10
    const dynamicR = innerR + (outerR - innerR) * (score / 10)
    return {
      nome: v.nome,
      significado: v.significado,
      score,
      x: cx + dynamicR * Math.cos(angle),
      y: cy + dynamicR * Math.sin(angle),
      labelX: cx + (outerR + 28) * Math.cos(angle),
      labelY: cy + (outerR + 28) * Math.sin(angle),
      outerX: cx + outerR * Math.cos(angle),
      outerY: cy + outerR * Math.sin(angle)
    }
  })

  // Build polygon path for the filled area
  const shapePath = pontos.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z'

  // Build outer reference pentagon
  const outerPath = pontos.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.outerX} ${p.outerY}`
  ).join(' ') + ' Z'

  return (
    <div className="flex justify-center py-4">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[300px]"
        role="img"
        aria-label={`Bússola de valores com ${valores.length} pontos`}
      >
        {/* Ambient glow */}
        <defs>
          <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C1634A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C1634A" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={cx} cy={cy} r={outerR + 20} fill="url(#fireGlow)" />

        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={innerR + (outerR - innerR) * scale}
            fill="none"
            stroke="rgba(193,99,74,0.12)"
            strokeWidth="0.5"
            strokeDasharray="3,3"
          />
        ))}

        {/* Outer reference pentagon */}
        <path
          d={outerPath}
          fill="none"
          stroke="rgba(193,99,74,0.2)"
          strokeWidth="1"
        />

        {/* Radial lines from center to each point */}
        {pontos.map((p, i) => (
          <line
            key={`line-${i}`}
            x1={cx}
            y1={cy}
            x2={p.outerX}
            y2={p.outerY}
            stroke="rgba(193,99,74,0.15)"
            strokeWidth="0.5"
          />
        ))}

        {/* Filled value shape */}
        <path
          d={shapePath}
          fill="rgba(193,99,74,0.15)"
          stroke="#C1634A"
          strokeWidth="2"
          filter="url(#glow)"
          style={{ transition: 'all 0.6s ease-out' }}
        />

        {/* Points and labels */}
        {pontos.map((p, i) => (
          <g key={`point-${i}`}>
            {/* Point dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#C1634A"
              stroke="#2e1a14"
              strokeWidth="2"
              style={{ transition: 'all 0.6s ease-out' }}
            />
            {/* Ember glow on point */}
            <circle
              cx={p.x}
              cy={p.y}
              r="8"
              fill="none"
              stroke="#C1634A"
              strokeWidth="1"
              opacity="0.3"
              style={{ transition: 'all 0.6s ease-out' }}
            />
            {/* Label */}
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize="11"
              fontWeight="600"
            >
              {p.nome}
            </text>
          </g>
        ))}

        {/* Center fire emblem */}
        <circle cx={cx} cy={cy} r="12" fill="#C1634A" opacity="0.2" />
        <circle cx={cx} cy={cy} r="6" fill="#C1634A" opacity="0.5" />
        <circle cx={cx} cy={cy} r="3" fill="#C1634A" />
      </svg>
    </div>
  )
}

// ===== SETUP: DEFINIR SIGNIFICADO =====

function DefinirSignificados({ valoresSelecionados, onComplete, onBack }) {
  const [significados, setSignificados] = useState(
    valoresSelecionados.map(nome => ({ nome, significado: '' }))
  )
  const [currentIdx, setCurrentIdx] = useState(0)

  const handleChange = (texto) => {
    setSignificados(prev => {
      const novo = [...prev]
      novo[currentIdx] = { ...novo[currentIdx], significado: texto }
      return novo
    })
  }

  const canAdvance = significados[currentIdx]?.significado.trim().length >= 3

  const handleNext = () => {
    if (currentIdx < valoresSelecionados.length - 1) {
      setCurrentIdx(prev => prev + 1)
    } else {
      onComplete(significados)
    }
  }

  const isLast = currentIdx === valoresSelecionados.length - 1

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Valor {currentIdx + 1} de {valoresSelecionados.length}</span>
          <span>{valoresSelecionados[currentIdx]}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentIdx + 1) / valoresSelecionados.length) * 100}%`,
              backgroundColor: '#C1634A'
            }}
          />
        </div>
      </div>

      {/* Current value */}
      <div
        className="text-center mb-8"
        key={currentIdx}
        style={{ animation: 'fadeInUp 0.4s ease-out' }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C1634A]/20 border border-[#C1634A]/30 mb-4">
          <FireIcon />
          <span className="text-[#C1634A] font-medium">{valoresSelecionados[currentIdx]}</span>
        </div>
        <h3
          className="text-xl text-white/90 mb-2"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          O que este valor significa para ti?
        </h3>
        <p className="text-white/40 text-sm">
          Não há respostas certas. É a tua verdade.
        </p>
      </div>

      {/* Textarea */}
      <textarea
        value={significados[currentIdx]?.significado || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`O que ${valoresSelecionados[currentIdx]} significa na tua vida...`}
        rows={4}
        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#C1634A]/50 resize-none"
        style={{ fontFamily: 'var(--font-titulos)', fontSize: '1.05rem', lineHeight: '1.7' }}
        autoFocus
      />

      {/* Nav buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => currentIdx > 0 ? setCurrentIdx(prev => prev - 1) : onBack()}
          className="px-5 py-2.5 rounded-full text-white/50 bg-white/5 hover:bg-white/10 text-sm transition-colors"
        >
          {currentIdx > 0 ? 'Anterior' : 'Voltar'}
        </button>
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-medium transition-all disabled:opacity-30"
          style={{ backgroundColor: canAdvance ? '#C1634A' : 'rgba(255,255,255,0.1)' }}
        >
          {isLast ? (
            <>
              <CheckIcon />
              <span>Guardar</span>
            </>
          ) : (
            <span>Próximo</span>
          )}
        </button>
      </div>
    </div>
  )
}

// ===== ALIGNMENT CHECK =====

function VerificacaoAlinhamento({ valores, onComplete, onCancel, saving }) {
  const [scores, setScores] = useState(valores.map(() => 5))
  const [currentIdx, setCurrentIdx] = useState(0)

  const handleScore = (val) => {
    setScores(prev => {
      const novo = [...prev]
      novo[currentIdx] = val
      return novo
    })
  }

  const handleNext = () => {
    if (currentIdx < valores.length - 1) {
      setCurrentIdx(prev => prev + 1)
    } else {
      onComplete(scores)
    }
  }

  const isLast = currentIdx === valores.length - 1
  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Valor {currentIdx + 1} de {valores.length}</span>
          <span>Média: {overall}/10</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentIdx + 1) / valores.length) * 100}%`,
              backgroundColor: '#C1634A'
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div
        className="text-center mb-8"
        key={currentIdx}
        style={{ animation: 'fadeInUp 0.4s ease-out' }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C1634A]/20 border border-[#C1634A]/30 mb-4">
          <FireIcon />
          <span className="text-[#C1634A] font-medium">{valores[currentIdx].nome}</span>
        </div>
        <h3
          className="text-lg text-white/90 mb-2"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          Esta semana, vivi de acordo com este valor?
        </h3>
        <p className="text-white/30 text-xs italic max-w-xs mx-auto">
          &quot;{valores[currentIdx].significado}&quot;
        </p>
      </div>

      {/* Score selector (1-10) */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
          <button
            key={val}
            onClick={() => handleScore(val)}
            className="w-11 h-11 rounded-full font-semibold text-sm transition-all"
            style={{
              backgroundColor: scores[currentIdx] === val ? '#C1634A' : 'rgba(193,99,74,0.1)',
              color: scores[currentIdx] === val ? 'white' : 'rgba(255,255,255,0.5)',
              border: scores[currentIdx] === val ? '2px solid #C1634A' : '1px solid rgba(193,99,74,0.2)',
              transform: scores[currentIdx] === val ? 'scale(1.15)' : 'scale(1)'
            }}
          >
            {val}
          </button>
        ))}
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-white/30 px-2 mb-8">
        <span>Nada {g('alinhado', 'alinhada')}</span>
        <span>Totalmente {g('alinhado', 'alinhada')}</span>
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => currentIdx > 0 ? setCurrentIdx(prev => prev - 1) : onCancel()}
          className="px-5 py-2.5 rounded-full text-white/50 bg-white/5 hover:bg-white/10 text-sm transition-colors"
        >
          {currentIdx > 0 ? 'Anterior' : 'Cancelar'}
        </button>
        <button
          onClick={handleNext}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-medium transition-all disabled:opacity-50"
          style={{ backgroundColor: '#C1634A' }}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isLast ? (
            <>
              <CheckIcon />
              <span>Concluir</span>
            </>
          ) : (
            <span>Próximo</span>
          )}
        </button>
      </div>
    </div>
  )
}

// ===== MAIN COMPONENT =====

export default function BussolaValores() {
  const { user } = useAuth()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Data
  const [valoresData, setValoresData] = useState(null) // { valores: [{nome, significado, score?}], updated_at }
  const [fase, setFase] = useState('loading') // loading | setup | significados | compass | alinhamento | edit-confirm

  // Setup state
  const [selecionados, setSelecionados] = useState([])
  const [customValue, setCustomValue] = useState('')

  // ===== LOAD DATA =====

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .maybeSingle()

        if (!userData) {
          setLoading(false)
          return
        }

        setUserId(userData.id)

        // Load valores
        const { data: valoresRow } = await supabase
          .from('ignis_valores')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle()

        if (valoresRow && valoresRow.valores && valoresRow.valores.length > 0) {
          setValoresData(valoresRow)
          setFase('compass')
        } else {
          setFase('setup')
        }
      } catch (err) {
        console.error('Erro ao carregar valores:', err)
        setFase('setup')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // ===== CHIP TOGGLE =====

  const toggleValor = (nome) => {
    setSelecionados(prev => {
      if (prev.includes(nome)) {
        return prev.filter(v => v !== nome)
      }
      if (prev.length >= 5) return prev
      return [...prev, nome]
    })
  }

  // ===== ADD CUSTOM VALUE =====

  const addCustom = () => {
    const trimmed = customValue.trim()
    if (!trimmed || selecionados.length >= 5) return
    if (selecionados.includes(trimmed)) {
      setCustomValue('')
      return
    }
    setSelecionados(prev => [...prev, trimmed])
    setCustomValue('')
  }

  // ===== SAVE VALORES =====

  const handleSaveValores = useCallback(async (significados) => {
    if (!userId) return
    setSaving(true)

    try {
      // Upsert to ignis_valores
      const { error } = await supabase
        .from('ignis_valores')
        .upsert({
          user_id: userId,
          valores: significados,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error

      // Award chamas: 8 per valor = 40
      await supabase.rpc('increment_field', {
        table_name: 'ignis_clients',
        field_name: 'chamas_total',
        increment_value: 40,
        user_id_param: userId
      }).catch(() => {
        // Fallback: direct update if rpc doesn't exist
        supabase
          .from('ignis_clients')
          .update({
            chamas_total: supabase.rpc ? undefined : 0,
            valores_definidos: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .then(() => {})
      })

      // Set valores_definidos = true and award chamas
      const { data: clientData } = await supabase
        .from('ignis_clients')
        .select('chamas_total')
        .eq('user_id', userId)
        .maybeSingle()

      const currentChamas = clientData?.chamas_total || 0

      await supabase
        .from('ignis_clients')
        .update({
          valores_definidos: true,
          chamas_total: currentChamas + 40,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      setValoresData({
        user_id: userId,
        valores: significados,
        updated_at: new Date().toISOString()
      })

      setFase('compass')
    } catch (err) {
      console.error('Erro ao guardar valores:', err)
    } finally {
      setSaving(false)
    }
  }, [userId])

  // ===== SAVE ALIGNMENT =====

  const handleSaveAlinhamento = useCallback(async (scores) => {
    if (!userId || !valoresData) return
    setSaving(true)

    try {
      const updatedValores = valoresData.valores.map((v, i) => ({
        ...v,
        score: scores[i]
      }))

      const { error } = await supabase
        .from('ignis_valores')
        .update({
          valores: updatedValores,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error

      // Award chamas: +5 per alignment check
      const { data: clientData } = await supabase
        .from('ignis_clients')
        .select('chamas_total')
        .eq('user_id', userId)
        .maybeSingle()

      const currentChamas = clientData?.chamas_total || 0

      await supabase
        .from('ignis_clients')
        .update({
          chamas_total: currentChamas + 5,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      setValoresData(prev => ({
        ...prev,
        valores: updatedValores,
        updated_at: new Date().toISOString()
      }))

      setFase('compass')
    } catch (err) {
      console.error('Erro ao guardar alinhamento:', err)
    } finally {
      setSaving(false)
    }
  }, [userId, valoresData])

  // ===== EDIT: RESET VALUES =====

  const handleConfirmEdit = () => {
    const nomes = valoresData?.valores?.map(v => v.nome) || []
    setSelecionados(nomes)
    setValoresData(null)
    setFase('setup')
  }

  // ===== RENDER: LOADING =====

  if (loading || fase === 'loading') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #3d2319 50%, #2e1a14 100%)' }}>
        <ModuleHeader eco="ignis" title="Bússola de Valores" />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-[#C1634A] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // ===== RENDER: EDIT CONFIRMATION =====

  if (fase === 'edit-confirm') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #3d2319 50%, #2e1a14 100%)' }}>
        <ModuleHeader eco="ignis" title="Bússola de Valores" compact />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#C1634A]/20 flex items-center justify-center mb-6">
            <EditIcon />
          </div>
          <h2
            className="text-2xl text-white/90 mb-3"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Mudar os teus valores é sério.
          </h2>
          <p className="text-white/50 mb-2 max-w-xs">
            Os teus valores definem a tua direcção. Tens a certeza que queres redefinir?
          </p>
          <p className="text-white/30 text-sm mb-8 max-w-xs">
            O histórico de alinhamento será {g('reiniciado', 'reiniciada')}.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setFase('compass')}
              className="px-6 py-3 rounded-full text-white/60 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmEdit}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
              style={{ backgroundColor: '#C1634A' }}
            >
              <EditIcon />
              <span>Sim, redefinir</span>
            </button>
          </div>
        </div>
        <BussolaStyles />
      </div>
    )
  }

  // ===== RENDER: SIGNIFICADOS STEP =====

  if (fase === 'significados') {
    return (
      <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #3d2319 50%, #2e1a14 100%)' }}>
        <ModuleHeader
          eco="ignis"
          title="Significado dos Valores"
          compact
        />
        <DefinirSignificados
          valoresSelecionados={selecionados}
          onComplete={handleSaveValores}
          onBack={() => setFase('setup')}
        />
        <BussolaStyles />
      </div>
    )
  }

  // ===== RENDER: ALIGNMENT CHECK =====

  if (fase === 'alinhamento') {
    return (
      <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #3d2319 50%, #2e1a14 100%)' }}>
        <ModuleHeader
          eco="ignis"
          title="Verificação de Alinhamento"
          compact
        />
        <VerificacaoAlinhamento
          valores={valoresData.valores}
          onComplete={handleSaveAlinhamento}
          onCancel={() => setFase('compass')}
          saving={saving}
        />
        <BussolaStyles />
      </div>
    )
  }

  // ===== RENDER: SETUP MODE =====

  if (fase === 'setup') {
    return (
      <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #3d2319 50%, #2e1a14 100%)' }}>
        <ModuleHeader
          eco="ignis"
          title="Bússola de Valores"
          subtitle="Identifica o que te guia"
        />

        <main className="max-w-lg mx-auto px-4 py-6">
          {/* Introduction */}
          <div className="text-center mb-8" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <p
              className="text-lg text-white/80 leading-relaxed"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              A tua bússola interior precisa de direcção. Identifica 5 valores que são essenciais para ti.
            </p>
          </div>

          {/* Counter */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/50 text-sm">
              {g('Seleccionado', 'Seleccionada')}s: {selecionados.length}/5
            </span>
            {selecionados.length === 5 && (
              <span className="text-[#C1634A] text-xs font-medium flex items-center gap-1">
                <CheckIcon /> Completo
              </span>
            )}
          </div>

          {/* Selected chips */}
          {selecionados.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 p-3 rounded-xl bg-[#C1634A]/10 border border-[#C1634A]/20">
              {selecionados.map(nome => (
                <button
                  key={nome}
                  onClick={() => toggleValor(nome)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{ backgroundColor: '#C1634A', color: 'white' }}
                >
                  <span>{nome}</span>
                  <CloseIcon />
                </button>
              ))}
            </div>
          )}

          {/* Suggested values grid */}
          <div className="mb-6">
            <span className="text-white/40 text-xs uppercase tracking-wide mb-3 block">Sugestões</span>
            <div className="flex flex-wrap gap-2">
              {VALORES_SUGERIDOS.map(nome => {
                const isSelected = selecionados.includes(nome)
                const isDisabled = !isSelected && selecionados.length >= 5

                return (
                  <button
                    key={nome}
                    onClick={() => toggleValor(nome)}
                    disabled={isDisabled}
                    className="px-3.5 py-2 rounded-full text-sm transition-all disabled:opacity-25"
                    style={{
                      backgroundColor: isSelected ? '#C1634A' : 'rgba(193,99,74,0.1)',
                      color: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                      border: isSelected ? '1px solid #C1634A' : '1px solid rgba(193,99,74,0.2)'
                    }}
                  >
                    {nome}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom value input */}
          {selecionados.length < 5 && (
            <div className="mb-8">
              <span className="text-white/40 text-xs uppercase tracking-wide mb-3 block">Ou escreve o teu</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                  placeholder="Outro valor..."
                  maxLength={30}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#C1634A]/50 text-sm"
                />
                <button
                  onClick={addCustom}
                  disabled={!customValue.trim()}
                  className="px-4 py-3 rounded-xl transition-all disabled:opacity-25"
                  style={{ backgroundColor: 'rgba(193,99,74,0.2)', color: '#C1634A' }}
                  aria-label="Adicionar valor"
                >
                  <PlusIcon />
                </button>
              </div>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={() => setFase('significados')}
            disabled={selecionados.length !== 5}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-medium text-lg transition-all disabled:opacity-30"
            style={{
              background: selecionados.length === 5
                ? 'linear-gradient(135deg, #C1634A, #E07A5F)'
                : 'rgba(255,255,255,0.05)',
              fontFamily: 'var(--font-titulos)'
            }}
          >
            <FireIcon />
            <span>Definir significados</span>
          </button>
        </main>

        <BussolaStyles />
      </div>
    )
  }

  // ===== RENDER: COMPASS VIEW =====

  const valores = valoresData?.valores || []
  const alinhamento = valores.map(v => v.score ?? 10)
  const overallScore = valores.length > 0
    ? Math.round(alinhamento.reduce((a, b) => a + b, 0) / valores.length * 10) / 10
    : 0

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #2e1a14 0%, #3d2319 50%, #2e1a14 100%)' }}>
      <ModuleHeader
        eco="ignis"
        title="Bússola de Valores"
        subtitle={`${g('Alinhado', 'Alinhada')} com o que importa`}
        rightAction={
          <button
            onClick={() => setFase('edit-confirm')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Editar valores"
          >
            <EditIcon />
          </button>
        }
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Overall Score */}
        <div className="text-center mb-2" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <span className="text-white/40 text-xs uppercase tracking-wide">Alinhamento geral</span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span
              className="text-4xl font-bold"
              style={{ color: '#C1634A', fontFamily: 'var(--font-titulos)' }}
            >
              {overallScore}
            </span>
            <span className="text-white/30 text-lg">/10</span>
          </div>
        </div>

        {/* Compass Visualization */}
        <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <CompassStar valores={valores} alinhamento={alinhamento} />
        </div>

        {/* Values List */}
        <div className="space-y-3 mt-6" style={{ animation: 'fadeInUp 1s ease-out' }}>
          {valores.map((v, i) => (
            <div
              key={v.nome}
              className="p-4 rounded-xl transition-all"
              style={{
                background: 'rgba(193,99,74,0.08)',
                border: '1px solid rgba(193,99,74,0.15)'
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: '#C1634A', opacity: 0.4 + (v.score || 10) * 0.06 }}
                  />
                  <span className="text-white/90 font-medium text-sm">{v.nome}</span>
                </div>
                {v.score != null && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `rgba(193,99,74,${0.1 + v.score * 0.03})`,
                      color: '#C1634A'
                    }}
                  >
                    {v.score}/10
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs leading-relaxed pl-4.5 italic">
                &quot;{v.significado}&quot;
              </p>
            </div>
          ))}
        </div>

        {/* Alignment Check Button */}
        <button
          onClick={() => setFase('alinhamento')}
          className="w-full flex items-center justify-center gap-2 py-4 mt-8 rounded-xl text-white font-medium text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #C1634A, #E07A5F)',
            fontFamily: 'var(--font-titulos)'
          }}
        >
          <FireIcon />
          <span>Verificação de Alinhamento</span>
        </button>

        {/* Last updated */}
        {valoresData?.updated_at && (
          <p className="text-white/20 text-xs text-center mt-4">
            Última actualização: {new Date(valoresData.updated_at).toLocaleDateString('pt-PT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        )}
      </main>

      <BussolaStyles />
    </div>
  )
}

// ===== STYLES =====

function BussolaStyles() {
  return (
    <style>{`
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
  )
}
