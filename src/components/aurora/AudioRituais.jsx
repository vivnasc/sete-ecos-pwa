import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { g } from '../../utils/genero'
import { getAudioUrl } from '../../lib/shared/audioStorage'

/**
 * AURORA — Áudios dos Rituais
 * 7 meditações guiadas, uma por cada eco do ritual integrado
 * Tema escuro com rosa Aurora (#D4A5A5)
 */

const AURORA_COLOR = '#D4A5A5'
const AURORA_DARK = '#2e1a1a'

const RITUAIS_AUDIOS = [
  {
    id: 'ritual_respiracao',
    slug: '88-ritual-respiracao',
    titulo: 'Ritual — Respiração',
    descricao: 'O sopro que te mantém viva. Inspira, solta, e pousa na terra.',
    duracao: '3-4 min',
    eco: 'Serena',
    ecoIcon: '💧',
    ecoColor: '#1A6B9A',
    icone: '🌬️',
    ordem: 1,
  },
  {
    id: 'ritual_movimento',
    slug: '89-ritual-movimento',
    titulo: 'Ritual — Movimento',
    descricao: 'Acorda o corpo com gentileza. Ombros, pescoço, braços — sem regras.',
    duracao: '3-4 min',
    eco: 'Ventis',
    ecoIcon: '🍃',
    ecoColor: '#27AE60',
    icone: '🤸',
    ordem: 2,
  },
  {
    id: 'ritual_checkin_emocional',
    slug: '90-ritual-checkin-emocional',
    titulo: 'Ritual — Check-in Emocional',
    descricao: 'Como te sentes realmente? Dá um nome. Sem julgamento, só presença.',
    duracao: '3-4 min',
    eco: 'Serena',
    ecoIcon: '💧',
    ecoColor: '#1A6B9A',
    icone: '💜',
    ordem: 3,
  },
  {
    id: 'ritual_afirmacao_voz',
    slug: '91-ritual-afirmacao-voz',
    titulo: 'Ritual — Afirmação com Voz',
    descricao: '"Hoje escolho ser eu." Usa a tua voz. Em voz alta. Isso é poder.',
    duracao: '3-4 min',
    eco: 'Ecoa',
    ecoIcon: '🔊',
    ecoColor: '#2980B9',
    icone: '🗣️',
    ordem: 4,
  },
  {
    id: 'ritual_escolha_consciente',
    slug: '92-ritual-escolha-consciente',
    titulo: 'Ritual — Escolha Consciente',
    descricao: 'Acende o fogo da intenção. Uma prioridade. Uma escolha. Uma direcção.',
    duracao: '3-4 min',
    eco: 'Ignis',
    ecoIcon: '🔥',
    ecoColor: '#C0392B',
    icone: '🎯',
    ordem: 5,
  },
  {
    id: 'ritual_reconhecer_valor',
    slug: '93-ritual-reconhecer-valor',
    titulo: 'Ritual — Reconhecer o Valor',
    descricao: 'Pára de fazer e reconhece quem és. O teu valor existe porque tu existes.',
    duracao: '3-4 min',
    eco: 'Áurea',
    ecoIcon: '✨',
    ecoColor: '#B8860B',
    icone: '👑',
    ordem: 6,
  },
  {
    id: 'ritual_essencia',
    slug: '94-ritual-essencia',
    titulo: 'Ritual — Essência',
    descricao: 'Quem és tu por baixo de tudo? Os sete ecos vibram juntos. Esta é a tua Aurora.',
    duracao: '4-5 min',
    eco: 'Imago',
    ecoIcon: '⭐',
    ecoColor: '#6C3483',
    icone: '🌅',
    ordem: 7,
  },
]

export default function AudioRituais() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [raios, setRaios] = useState(0)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audiosOuvidos, setAudiosOuvidos] = useState([])
  const audioRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    const onLoadedMeta = () => setDuration(audio.duration)
    const onEnded = () => { setIsPlaying(false); setProgress(100) }
    const onError = () => { setIsPlaying(false) }

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
  }, [currentAudio])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()

      if (userData) {
        setUserId(userData.id)

        const { data: client } = await supabase
          .from('aurora_clients')
          .select('raios_total')
          .eq('user_id', userData.id)
          .maybeSingle()

        setRaios(client?.raios_total || 0)

        const { data: logs } = await supabase
          .from('aurora_ritual_log')
          .select('componentes_feitos')
          .eq('user_id', userData.id)

        // Extrair audio_ids dos rituais feitos
        const ouvidos = new Set()
        logs?.forEach(l => {
          if (Array.isArray(l.componentes_feitos)) {
            l.componentes_feitos.forEach(c => ouvidos.add(c))
          }
        })
        setAudiosOuvidos([...ouvidos])
      }
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (s) => {
    if (!s || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handlePlayAudio = (audio) => {
    if (currentAudio?.id === audio.id) {
      // Toggle play/pause
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play().catch(() => {})
        setIsPlaying(true)
      }
      return
    }

    setCurrentAudio(audio)
    setProgress(0)
    setDuration(0)
    setIsPlaying(false)

    const url = getAudioUrl('aurora', audio.slug)
    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.play().then(() => {
        setIsPlaying(true)
        logAudioOuvido(audio)
      }).catch(() => {
        // Audio load failed
        setIsPlaying(false)
      })
    }
  }

  const logAudioOuvido = async (audio) => {
    if (!userId) return
    const componenteId = audio.id.replace('ritual_', '')
    if (audiosOuvidos.includes(componenteId)) return

    setAudiosOuvidos(prev => [...prev, componenteId])

    // Dar +1 raio por áudio ouvido
    try {
      await supabase
        .from('aurora_clients')
        .update({ raios_total: raios + 1 })
        .eq('user_id', userId)
      setRaios(r => r + 1)
    } catch {}
  }

  const handleClosePlayer = () => {
    setCurrentAudio(null)
    setIsPlaying(false)
    setProgress(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    audio.currentTime = pct * audio.duration
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${AURORA_DARK} 0%, #0f0f0f 100%)` }}
      >
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🌅</div>
          <p className="text-white/50 text-sm">A carregar rituais...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-32"
      style={{ background: `linear-gradient(180deg, ${AURORA_DARK} 0%, #0f0f0f 100%)` }}
    >
      <audio ref={audioRef} />

      {/* Header */}
      <header className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-4">
          <Link to="/aurora/dashboard" className="text-white/50 hover:text-white/80 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              Rituais Guiados
            </h1>
            <p className="text-white/40 text-sm">7 meditações — uma por cada eco</p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: `${AURORA_COLOR}20` }}
          >
            <span className="text-sm">🌅</span>
            <span className="text-white/80 text-sm font-medium">{raios}</span>
          </div>
        </div>
      </header>

      {/* Intro */}
      <div className="px-5 mb-5">
        <div
          className="rounded-2xl p-4 border"
          style={{ background: `${AURORA_COLOR}08`, borderColor: `${AURORA_COLOR}20` }}
        >
          <p className="text-white/60 text-sm leading-relaxed">
            Cada ritual é uma meditação guiada que activa um eco diferente.
            Ouve-os na ordem ou escolhe o que precisas hoje. +1 raio por cada.
          </p>
        </div>
      </div>

      {/* Audio List */}
      <main className="px-5 space-y-3">
        {RITUAIS_AUDIOS.map((audio) => {
          const isActive = currentAudio?.id === audio.id

          return (
            <button
              key={audio.id}
              onClick={() => handlePlayAudio(audio)}
              className="w-full rounded-2xl text-left transition-all active:scale-[0.98]"
              style={{
                background: isActive ? `${AURORA_COLOR}18` : 'rgba(255,255,255,0.04)',
                border: isActive ? `2px solid ${AURORA_COLOR}50` : '1px solid rgba(255,255,255,0.08)',
                padding: isActive ? '15px' : '16px',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Order number / play indicator */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isActive && isPlaying
                      ? `linear-gradient(135deg, ${AURORA_COLOR} 0%, ${audio.ecoColor} 100%)`
                      : `${audio.ecoColor}25`,
                  }}
                >
                  {isActive && isPlaying ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <span className="text-xl">{audio.icone}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-sm truncate">{audio.titulo}</h3>
                    {audiosOuvidos.includes(audio.id.replace('ritual_', '')) && (
                      <span className="text-emerald-400 text-xs flex-shrink-0">✓</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{audio.descricao}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-white/30 text-[10px]">{audio.duracao}</span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: `${audio.ecoColor}20`, color: `${audio.ecoColor}cc` }}
                    >
                      {audio.ecoIcon} {audio.eco}
                    </span>
                  </div>
                </div>

                {/* Play button */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isActive ? AURORA_COLOR : `${AURORA_COLOR}25`,
                  }}
                >
                  {isActive && isPlaying ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Progress bar for active audio */}
              {isActive && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-1.5 rounded-full overflow-hidden cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                    onClick={(e) => { e.stopPropagation(); handleSeek(e) }}
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{ width: `${progress}%`, background: AURORA_COLOR }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white/30 text-[10px]">
                      {formatTime(audioRef.current?.currentTime || 0)}
                    </span>
                    <span className="text-white/30 text-[10px]">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </main>

      {/* Floating mini player */}
      {currentAudio && (
        <div
          className="fixed bottom-0 left-0 right-0 border-t px-5 py-3 z-40"
          style={{
            background: `linear-gradient(180deg, ${AURORA_DARK}f0 0%, ${AURORA_DARK} 100%)`,
            borderColor: `${AURORA_COLOR}25`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${currentAudio.ecoColor}30` }}
            >
              <span className="text-lg">{currentAudio.icone}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentAudio.titulo}</p>
              <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${progress}%`, background: AURORA_COLOR }}
                />
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handlePlayAudio(currentAudio) }}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95"
              style={{ background: AURORA_COLOR }}
              aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleClosePlayer}
              className="text-white/40 hover:text-white/70 transition-colors"
              aria-label="Fechar player"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
