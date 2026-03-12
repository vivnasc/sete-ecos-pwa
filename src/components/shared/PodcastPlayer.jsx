import React, { useState, useRef, useEffect } from 'react'
import { getAudioUrl } from '../../lib/shared/audioStorage'

// ─── Catálogo de episódios ─────────────────────────────────────
const EPISODIOS = [
  { slug: 'ep01-fome-emocional',    titulo: 'Fome Emocional',        eco: 'vitalis',  emoji: '🌿', desc: 'Porque comes quando não tens fome — e o que fazer.' },
  { slug: 'ep02-valor-proprio',     titulo: 'Valor Próprio',         eco: 'aurea',    emoji: '✨', desc: 'Colocar-te em primeiro não é egoísmo.' },
  { slug: 'ep03-silenciamento',     titulo: 'A Voz Que Perdeste',    eco: 'ecoa',     emoji: '🔊', desc: 'Como aprendeste a calar-te — e como desaprender.' },
  { slug: 'ep04-corpo-sinal',       titulo: 'O Corpo Fala Primeiro', eco: 'vitalis',  emoji: '🌿', desc: 'Os sinais que o teu corpo te envia todos os dias.' },
  { slug: 'ep05-mascara-essencia',  titulo: 'Máscara vs Essência',   eco: 'imago',    emoji: '⭐', desc: 'Quem és quando ninguém está a ver?' },
  { slug: 'ep06-fuga-frente',       titulo: 'Fugir Para a Frente',   eco: 'ignis',    emoji: '🔥', desc: 'Estar ocupada não é estar a avançar.' },
  { slug: 'ep07-ciclo-emocional',   titulo: 'O Ciclo Emocional',     eco: 'serena',   emoji: '💧', desc: 'Porque há dias mais difíceis — e a culpa não é tua.' },
  { slug: 'ep08-espelho-mente',     titulo: 'O Espelho Mente',       eco: 'lumina',   emoji: '🔮', desc: 'A percepção que tens de ti não é a realidade.' },
  { slug: 'ep09-burnout-invisivel', titulo: 'Burnout Invisível',     eco: 'ventis',   emoji: '🍃', desc: 'Quando estás esgotada mas "bem".' },
  { slug: 'ep10-auto-sacrificio',   titulo: 'O Custo de Dar Tudo',   eco: 'aurea',    emoji: '✨', desc: 'Dar tudo aos outros não te faz boa pessoa. Faz-te vazia.' },
]

const ECO_CORES = {
  vitalis: '#2D6A4F',
  aurea:   '#B8860B',
  serena:  '#1A6B9A',
  ignis:   '#C0392B',
  ventis:  '#27AE60',
  ecoa:    '#2980B9',
  imago:   '#6C3483',
  lumina:  '#4B0082',
}

// ─── Mini player individual ────────────────────────────────────
function EpisodioCard({ ep, isPlaying, onPlay, onPause, compact, progress, duration }) {
  const cor = ECO_CORES[ep.eco] || '#4B0082'

  const formatTime = (s) => {
    if (!s || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${compact ? 'p-3' : 'p-4'} ${isPlaying ? 'shadow-lg scale-[1.01]' : 'shadow-sm hover:shadow-md'}`}
      style={{
        background: isPlaying
          ? `linear-gradient(135deg, ${cor}08 0%, ${cor}15 100%)`
          : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isPlaying ? cor + '30' : 'rgba(0,0,0,0.04)'}`,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={() => isPlaying ? onPause() : onPlay(ep)}
          className="flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            width: compact ? 40 : 48,
            height: compact ? 40 : 48,
            background: isPlaying
              ? `linear-gradient(135deg, ${cor} 0%, ${cor}CC 100%)`
              : `${cor}15`,
            color: isPlaying ? '#FFF' : cor,
          }}
          aria-label={isPlaying ? 'Pausar' : `Ouvir: ${ep.titulo}`}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs">{ep.emoji}</span>
            <h3 className={`font-bold truncate ${compact ? 'text-xs' : 'text-sm'}`}
              style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
              {ep.titulo}
            </h3>
          </div>
          {!compact && (
            <p className="text-[11px] text-gray-500 line-clamp-1" style={{ fontFamily: 'var(--font-corpo)' }}>
              {ep.desc}
            </p>
          )}
        </div>

        {/* Duration badge */}
        <span className={`flex-shrink-0 ${compact ? 'text-[9px]' : 'text-[10px]'} font-medium px-2 py-0.5 rounded-full`}
          style={{ background: `${cor}10`, color: cor }}>
          {isPlaying && duration > 0 ? formatTime(duration) : '2-3 min'}
        </span>
      </div>

      {/* Progress bar when playing */}
      {isPlaying && (
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: `${cor}15` }}>
          <div className="h-full rounded-full transition-[width] duration-300" style={{ background: cor, width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────
/**
 * PodcastPlayer — "Vivianne Explica"
 *
 * @param {Object} props
 * @param {string} [props.eco] - Filtrar por eco (ex: 'vitalis'). Se omitido, mostra todos.
 * @param {number} [props.max] - Máximo de episódios a mostrar (default: todos)
 * @param {boolean} [props.compact] - Modo compacto para dashboards
 * @param {boolean} [props.showTitle] - Mostrar título da secção (default: true)
 * @param {string} [props.className] - Classes extra
 */
export default function PodcastPlayer({ eco, max, compact = false, showTitle = true, className = '' }) {
  const [playing, setPlaying] = useState(null) // slug do episódio a tocar
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  // Filtrar episódios
  let episodios = eco
    ? EPISODIOS.filter(e => e.eco === eco)
    : EPISODIOS

  if (max) episodios = episodios.slice(0, max)

  // Se filtrado por eco e não há episódios, não renderizar
  if (episodios.length === 0) return null

  const handlePlay = (ep) => {
    // Parar áudio anterior
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const url = getAudioUrl('podcast', ep.slug)
    const audio = new Audio(url)

    audio.addEventListener('ended', () => {
      setPlaying(null)
      setProgress(100)
    })
    audio.addEventListener('error', () => {
      setPlaying(null)
      setProgress(0)
    })
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    })
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })

    audio.play().then(() => {
      setPlaying(ep.slug)
      setProgress(0)
      audioRef.current = audio
    }).catch(() => {
      setPlaying(null)
    })
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setPlaying(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎙️</span>
          <h2 className={`font-bold tracking-tight ${compact ? 'text-sm' : 'text-base'}`}
            style={{ fontFamily: 'var(--font-titulos)', color: '#292524' }}>
            Vivianne Explica
          </h2>
          {!compact && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: '#4B008215', color: '#4B0082' }}>
              {episodios.length} episódios
            </span>
          )}
        </div>
      )}

      <div className={`space-y-${compact ? '2' : '2.5'}`}>
        {episodios.map(ep => (
          <EpisodioCard
            key={ep.slug}
            ep={ep}
            isPlaying={playing === ep.slug}
            onPlay={handlePlay}
            onPause={handlePause}
            compact={compact}
            progress={playing === ep.slug ? progress : 0}
            duration={playing === ep.slug ? duration : 0}
          />
        ))}
      </div>
    </div>
  )
}

// Exportar catálogo para uso noutros componentes
export { EPISODIOS, ECO_CORES }
