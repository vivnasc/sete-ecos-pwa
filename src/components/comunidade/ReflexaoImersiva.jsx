import React, { useState, useRef, useCallback } from 'react'
import {
  TEMAS_REFLEXAO,
  ECOS_INFO,
  RESSONANCIA_TIPOS,
  ESPELHO_STARTERS,
  PROMPTS_REFLEXAO,
  tempoRelativo,
  darRessonancia,
  getEspelhos,
  criarEspelho,
  criarNotificacao
} from '../../lib/comunidade'
import {
  isGhostPost,
  toggleGhostRessonancia,
  getGhostEspelhos
} from '../../lib/ghost-users'

const RESSONANCIA_KEYS = Object.keys(RESSONANCIA_TIPOS)

// Dark gradient backgrounds per eco
const ECO_GRADIENTS = {
  vitalis: 'linear-gradient(160deg, #0a1f0a 0%, #1a3520 40%, #0d2810 100%)',
  aurea: 'linear-gradient(160deg, #1f1a08 0%, #352d12 40%, #1a1508 100%)',
  lumina: 'linear-gradient(160deg, #100a2e 0%, #1f1550 40%, #0a0820 100%)',
  serena: 'linear-gradient(160deg, #081a2e 0%, #123050 40%, #050d1a 100%)',
  ignis: 'linear-gradient(160deg, #2e1408 0%, #4a2010 40%, #1a0a05 100%)',
  ventis: 'linear-gradient(160deg, #0a2e1a 0%, #1a4a2d 40%, #051a0a 100%)',
  ecoa: 'linear-gradient(160deg, #0a1a3e 0%, #1a2d5e 40%, #05101a 100%)',
  geral: 'linear-gradient(160deg, #151020 0%, #201838 40%, #0a0815 100%)'
}

// Accent glow color per tema
const TEMA_GLOW = {
  gratidao: 'rgba(245,158,11,0.12)',
  desafio: 'rgba(239,68,68,0.12)',
  descoberta: 'rgba(139,92,246,0.12)',
  intencao: 'rgba(16,185,129,0.12)',
  transformacao: 'rgba(249,115,22,0.12)',
  conexao: 'rgba(236,72,153,0.12)',
  corpo: 'rgba(124,139,111,0.12)',
  valor: 'rgba(201,162,39,0.12)',
  visao: 'rgba(99,102,241,0.12)',
  emocao: 'rgba(14,165,233,0.12)',
  vontade: 'rgba(249,115,22,0.12)',
  livre: 'rgba(168,85,247,0.12)'
}

export default function ReflexaoImersiva({
  post,
  userId,
  onPerfilClick,
  onPostDeleted,
  onAbrirEspelhos,
  ressoou: initialRessoou = false
}) {
  const [ressoou, setRessoou] = useState(initialRessoou)
  const [ressonanciaActiva, setRessonanciaActiva] = useState(null)
  const [ressonanciaCount, setRessonanciaCount] = useState(post.ressonancia_count || post.likes_count || 0)
  const [espelhosCount, setEspelhosCount] = useState(post.comments_count || 0)
  const [showTipos, setShowTipos] = useState(false)
  const [doubleTapEmoji, setDoubleTapEmoji] = useState(null)
  const [tapPulseId, setTapPulseId] = useState(null)

  const lastTapRef = useRef(0)
  const tapTimerRef = useRef(null)

  const isGhost = isGhostPost(post)
  const perfil = post.community_profiles
  const temaInfo = TEMAS_REFLEXAO[post.tipo] || TEMAS_REFLEXAO.livre
  const ecoInfo = post.eco ? ECOS_INFO[post.eco] : null
  const isAnonymous = post.is_anonymous

  const promptOrigem = post.prompt_id
    ? PROMPTS_REFLEXAO.find(p => p.id === post.prompt_id)
    : null

  const bgGradient = ECO_GRADIENTS[post.eco] || ECO_GRADIENTS.geral
  const glowColor = TEMA_GLOW[post.tipo] || TEMA_GLOW.livre

  // ───── Double-tap detection ─────
  const handleContentTap = useCallback((e) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap! Give ressoo
      clearTimeout(tapTimerRef.current)
      handleRessonancia('ressoo')
      // Show floating emoji at tap position
      const rect = e.currentTarget.getBoundingClientRect()
      setDoubleTapEmoji({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        id: Date.now()
      })
      setTimeout(() => setDoubleTapEmoji(null), 900)
    }
    lastTapRef.current = now
  }, [])

  // ───── Ressonancia ─────
  const handleRessonancia = async (tipo) => {
    setTapPulseId(tipo + Date.now())
    setTimeout(() => setTapPulseId(null), 300)

    try {
      if (isGhost) {
        const resultado = toggleGhostRessonancia(post.id, tipo)
        if (resultado) {
          setRessoou(true)
          setRessonanciaActiva(tipo)
          setRessonanciaCount(prev => prev + 1)
        } else {
          setRessoou(false)
          setRessonanciaActiva(null)
          setRessonanciaCount(prev => Math.max(0, prev - 1))
        }
        return
      }
      const resultado = await darRessonancia(post.id, userId, tipo)
      if (resultado) {
        setRessoou(true)
        setRessonanciaActiva(tipo)
        setRessonanciaCount(prev => prev + 1)
        if (post.user_id !== userId) {
          criarNotificacao(post.user_id, userId, 'ressonancia', post.id, RESSONANCIA_TIPOS[tipo]?.label || '')
        }
      } else {
        setRessoou(false)
        setRessonanciaActiva(null)
        setRessonanciaCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro na ressonancia:', error)
    }
  }

  const handleEspelhosClick = () => {
    onAbrirEspelhos?.(post)
  }

  // ───── Text sizing based on content length ─────
  const conteudo = post.conteudo || ''
  const textClass = conteudo.length < 80
    ? 'text-2xl leading-relaxed'
    : conteudo.length < 200
      ? 'text-xl leading-relaxed'
      : conteudo.length < 400
        ? 'text-base leading-relaxed'
        : 'text-sm leading-relaxed'

  return (
    <div className="relative h-full w-full overflow-hidden select-none" style={{ background: bgGradient }}>

      {/* ───── Bokeh decorations ───── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full animate-bokeh"
          style={{
            width: 180, height: 180, top: '10%', right: '-5%',
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
          }}
        />
        <div
          className="absolute rounded-full animate-bokeh-slow"
          style={{
            width: 120, height: 120, bottom: '25%', left: '-3%',
            background: `radial-gradient(circle, ${ecoInfo?.cor || '#8B5CF6'}15 0%, transparent 70%)`
          }}
        />
        <div
          className="absolute rounded-full animate-bokeh-fast"
          style={{
            width: 80, height: 80, top: '45%', right: '15%',
            background: `radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)`
          }}
        />
      </div>

      {/* ───── Tap area for double-tap ───── */}
      <div
        className="relative z-10 h-full flex flex-col"
        onClick={handleContentTap}
      >
        {/* Top badges */}
        <div className="flex items-center justify-between px-5 pt-5">
          {ecoInfo && (
            <span
              className="text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-md"
              style={{ backgroundColor: ecoInfo.cor + '30', color: ecoInfo.cor, border: `1px solid ${ecoInfo.cor}25` }}
            >
              {ecoInfo.emoji} {ecoInfo.label}
            </span>
          )}
          {temaInfo && (
            <span
              className="text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-md"
              style={{ backgroundColor: temaInfo.cor + '25', color: temaInfo.cor + 'cc', border: `1px solid ${temaInfo.cor}20` }}
            >
              {temaInfo.emoji} {temaInfo.label}
            </span>
          )}
        </div>

        {/* ───── Center: reflexão content ───── */}
        <div className="flex-1 flex flex-col items-start justify-center px-6 pr-16">
          {promptOrigem && (
            <p
              className="text-sm italic mb-4 leading-relaxed max-w-[85%]"
              style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-titulos)' }}
            >
              "{promptOrigem.texto}"
            </p>
          )}
          <p
            className={`text-white ${textClass} max-w-[90%]`}
            style={{ fontFamily: 'var(--font-titulos)', fontWeight: 400, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            {conteudo}
          </p>
        </div>

        {/* ───── Bottom: author info ───── */}
        <div className="px-5 pb-28">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!isAnonymous && !isGhost) onPerfilClick?.(post.user_id)
            }}
            className="flex items-center gap-3 group"
            disabled={isAnonymous || isGhost}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 border-white/20"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' }}>
              {isAnonymous ? '🌙' : (perfil?.avatar_emoji || '🌸')}
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90" style={{ fontFamily: 'var(--font-corpo)' }}>
                {isAnonymous ? 'Alma Anónima' : (perfil?.display_name || 'Utilizadora')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">{tempoRelativo(post.created_at)}</span>
                {ressonanciaCount > 0 && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-xs text-white/40">
                      {ressonanciaCount} {ressonanciaCount === 1 ? 'ressonância' : 'ressonâncias'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ───── Right sidebar: actions ───── */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-3 z-20">
        {/* Main ressonancia button (ressoo) */}
        <button
          onClick={() => handleRessonancia('ressoo')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            ressoou ? 'scale-110' : 'active:scale-125'
          }`}
          style={{
            background: ressoou
              ? 'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(168,85,247,0.3) 100%)'
              : 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            border: ressoou ? '1.5px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <span className={`text-xl ${tapPulseId ? 'animate-tap-pulse' : ''}`}>🫧</span>
        </button>
        {ressonanciaCount > 0 && (
          <span className="text-xs font-semibold text-white/60 -mt-1">{ressonanciaCount}</span>
        )}

        {/* More ressonancia types toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowTipos(!showTipos) }}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)'
          }}
        >
          <span className="text-sm">✨</span>
        </button>

        {/* Expanded ressonancia types */}
        {showTipos && (
          <div className="flex flex-col gap-2 animate-fadeIn">
            {RESSONANCIA_KEYS.filter(k => k !== 'ressoo').map(tipo => {
              const info = RESSONANCIA_TIPOS[tipo]
              const isActive = ressonanciaActiva === tipo
              return (
                <button
                  key={tipo}
                  onClick={(e) => { e.stopPropagation(); handleRessonancia(tipo) }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-125 ${
                    isActive ? 'ring-2 ring-purple-400/50 scale-110' : ''
                  }`}
                  style={{
                    background: isActive ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.12)'
                  }}
                  title={info.label}
                >
                  <span className="text-sm">{info.emoji}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Espelhos button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleEspelhosClick() }}
          className="w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all active:scale-110"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)'
          }}
        >
          <span className="text-lg">🪞</span>
        </button>
        {espelhosCount > 0 && (
          <span className="text-xs font-semibold text-white/60 -mt-1">{espelhosCount}</span>
        )}
      </div>

      {/* ───── Double-tap floating emoji ───── */}
      {doubleTapEmoji && (
        <div
          className="absolute z-50 animate-ressonancia-float"
          style={{ left: doubleTapEmoji.x - 24, top: doubleTapEmoji.y - 24 }}
        >
          <span className="text-5xl">🫧</span>
        </div>
      )}

      {/* ───── Image overlay (if post has image) ───── */}
      {post.imagem_url && (
        <div className="absolute inset-0 z-0">
          <img
            src={post.imagem_url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%)' }} />
        </div>
      )}
    </div>
  )
}
