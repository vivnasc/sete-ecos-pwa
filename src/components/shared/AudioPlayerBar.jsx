import { useState, useRef, useEffect } from 'react'
import { getAudioUrl } from '../../lib/shared/audioStorage'

/**
 * Barra de áudio para meditações — tenta carregar MP3 do Supabase Storage.
 * Se o áudio existir, mostra player inline. Se não, não renderiza nada.
 *
 * Props:
 *  - eco: string (vitalis, ignis, etc.)
 *  - slug: string (ex: '30-gratidao-corpo')
 *  - accentColor: string (cor do eco)
 *  - onPlay: callback quando áudio começa
 *  - onEnd: callback quando áudio termina
 */
export default function AudioPlayerBar({ eco, slug, accentColor = '#4B0082', onPlay, onEnd, titulo, autoPlay, onPlayingChange, onNotAvailable, onAvailable }) {
  const audioRef = useRef(null)
  const [disponivel, setDisponivel] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const autoPlayedRef = useRef(false)

  const url = slug ? getAudioUrl(eco, slug) : null

  useEffect(() => {
    if (!url) return
    setDisponivel(false)
    setPlaying(false)
    setProgress(0)

    // Verificar se o áudio existe com HEAD request
    fetch(url, { method: 'HEAD' })
      .then(res => {
        if (res.ok) {
          setDisponivel(true)
          onAvailable?.()
        } else {
          onNotAvailable?.()
        }
      })
      .catch(() => { onNotAvailable?.() })
  }, [url])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }
    const onLoadedMeta = () => setDuration(audio.duration)
    const onEnded = () => {
      setPlaying(false)
      setProgress(100)
      onEnd?.()
    }
    const onError = () => {
      setDisponivel(false)
      setPlaying(false)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMeta)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMeta)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [disponivel, onEnd])

  // Auto-play when disponivel and autoPlay prop is set
  useEffect(() => {
    if (autoPlay && disponivel && audioRef.current && !autoPlayedRef.current) {
      autoPlayedRef.current = true
      audioRef.current.play().then(() => {
        setPlaying(true)
        onPlay?.()
        onPlayingChange?.(true)
      }).catch(() => {})
    }
  }, [autoPlay, disponivel])

  // Notify parent of playing state changes
  useEffect(() => {
    onPlayingChange?.(playing)
  }, [playing])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().catch(() => setDisponivel(false))
      setPlaying(true)
      onPlay?.()
    }
  }

  const handleDownload = async () => {
    if (!url || downloading) return
    setDownloading(true)
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = titulo
        ? `${titulo.replace(/[^a-zA-Z0-9À-ú\s-]/g, '').trim()}.mp3`
        : `${eco}-${slug}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch {
      // silently fail
    } finally {
      setDownloading(false)
    }
  }

  const formatTime = (s) => {
    if (!s || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (!disponivel || !url) return null

  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3"
      style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}33` }}
    >
      <audio ref={audioRef} src={url} preload="metadata" />

      <button
        onClick={togglePlay}
        className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{ background: accentColor }}
        aria-label={playing ? 'Pausar áudio' : 'Reproduzir áudio'}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${accentColor}22` }}>
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${progress}%`, background: accentColor }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px]" style={{ color: `${accentColor}aa` }}>
            {formatTime(audioRef.current?.currentTime || 0)}
          </span>
          <span className="text-[10px]" style={{ color: `${accentColor}aa` }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
        style={{ background: `${accentColor}22` }}
        aria-label="Baixar áudio"
      >
        {downloading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5">
            <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill={accentColor} className="w-4 h-4">
            <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 2h14v2H5v-2z" />
          </svg>
        )}
      </button>
    </div>
  )
}
