import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  getFogueiraAtiva,
  getChamas,
  adicionarChama,
  criarFogueira,
  getPromptDoDia,
  ECOS_INFO
} from '../../lib/comunidade'
import { supabase } from '../../lib/supabase'
import { getGhostChamas } from '../../lib/ghost-users'

// ============================================================
// Fogueira — Espaço efémero comunal de partilha
// "Onde nos sentamos em círculo"
// ============================================================

export default function Fogueira({ userId }) {
  // --- Fogueira state ---
  const [fogueira, setFogueira] = useState(null)
  const [chamas, setChamas] = useState([])
  const [loading, setLoading] = useState(true)
  const [tempoRestante, setTempoRestante] = useState('')

  // --- Input de chama ---
  const [novaChama, setNovaChama] = useState('')
  const [enviando, setEnviando] = useState(false)

  // --- Criar nova fogueira ---
  const [novaTema, setNovaTema] = useState('')
  const [novoPrompt, setNovoPrompt] = useState('')
  const [criando, setCriando] = useState(false)

  const chamasEndRef = useRef(null)
  const timerRef = useRef(null)

  // ----------------------------------------------------------
  // Carregar fogueira ativa
  // ----------------------------------------------------------

  const mergeChamas = (realChamas, fogueiraId) => {
    const ghostChamas = getGhostChamas(fogueiraId)
    const all = [...ghostChamas, ...realChamas]
    all.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    return all
  }

  const carregarFogueira = useCallback(async () => {
    try {
      const ativa = await getFogueiraAtiva()
      setFogueira(ativa)

      if (ativa) {
        const chamasData = await getChamas(ativa.id)
        setChamas(mergeChamas(chamasData, ativa.id))
      }
    } catch (error) {
      console.error('Erro ao carregar fogueira:', error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    carregarFogueira()
  }, [carregarFogueira])

  // ----------------------------------------------------------
  // Countdown do tempo restante
  // ----------------------------------------------------------

  useEffect(() => {
    if (!fogueira?.expires_at) return

    const calcularTempo = () => {
      const agora = new Date()
      const expira = new Date(fogueira.expires_at)
      const diffMs = expira - agora

      if (diffMs <= 0) {
        setTempoRestante('Extinta')
        setFogueira(null)
        clearInterval(timerRef.current)
        return
      }

      const horas = Math.floor(diffMs / 3600000)
      const minutos = Math.floor((diffMs % 3600000) / 60000)
      setTempoRestante(`${horas}h ${minutos}min`)
    }

    calcularTempo()
    timerRef.current = setInterval(calcularTempo, 60000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fogueira?.expires_at])

  // ----------------------------------------------------------
  // Realtime: ouvir novas chamas
  // ----------------------------------------------------------

  useEffect(() => {
    if (!fogueira?.id) return

    const channel = supabase
      .channel(`fogueira-${fogueira.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_fogueira_chamas',
          filter: `fogueira_id=eq.${fogueira.id}`
        },
        async () => {
          try {
            const chamasData = await getChamas(fogueira.id)
            setChamas(mergeChamas(chamasData, fogueira.id))
          } catch (err) {
            console.error('Erro ao recarregar chamas:', err)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fogueira?.id])

  // ----------------------------------------------------------
  // Scroll to bottom when new chamas arrive
  // ----------------------------------------------------------

  useEffect(() => {
    if (chamasEndRef.current) {
      chamasEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chamas.length])

  // ----------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------

  const handleAdicionarChama = async () => {
    if (!novaChama.trim() || enviando || !fogueira) return

    setEnviando(true)
    try {
      await adicionarChama(fogueira.id, userId, novaChama.trim())
      setNovaChama('')
      const chamasData = await getChamas(fogueira.id)
      setChamas(mergeChamas(chamasData, fogueira.id))
    } catch (error) {
      console.error('Erro ao adicionar chama:', error)
    }
    setEnviando(false)
  }

  const handleCriarFogueira = async () => {
    if (!novaTema.trim() || criando) return

    setCriando(true)
    try {
      const promptTexto = novoPrompt.trim() || getPromptDoDia()?.texto || ''
      const novaFogueira = await criarFogueira(novaTema.trim(), promptTexto)
      setFogueira(novaFogueira)
      setChamas([])
      setNovaTema('')
      setNovoPrompt('')
    } catch (error) {
      console.error('Erro ao criar fogueira:', error)
    }
    setCriando(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdicionarChama()
    }
  }

  // ----------------------------------------------------------
  // Fire size based on chamas count
  // ----------------------------------------------------------

  const getFireSize = () => {
    const count = chamas.length
    if (count > 15) return { scale: 1.6, label: 'grande' }
    if (count >= 5) return { scale: 1.25, label: 'medio' }
    return { scale: 1, label: 'pequeno' }
  }

  const getFireEmojis = () => {
    const count = chamas.length
    if (count > 15) return '🔥🔥🔥🔥🔥'
    if (count > 10) return '🔥🔥🔥🔥'
    if (count > 5) return '🔥🔥🔥'
    if (count > 2) return '🔥🔥'
    return '🔥'
  }

  const fireSize = getFireSize()

  // Unique contributors
  const contribuidores = []
  const seenUsers = new Set()
  chamas.forEach(c => {
    if (!seenUsers.has(c.user_id)) {
      seenUsers.add(c.user_id)
      contribuidores.push({
        user_id: c.user_id,
        perfil: c.community_profiles
      })
    }
  })

  // Tempo relativo para chamas
  const tempoRelativoChama = (dataStr) => {
    const agora = new Date()
    const data = new Date(dataStr)
    const diffMs = agora - data
    const diffMin = Math.floor(diffMs / 60000)
    const diffHoras = Math.floor(diffMs / 3600000)

    if (diffMin < 1) return 'agora'
    if (diffMin < 60) return `${diffMin}min`
    if (diffHoras < 24) return `${diffHoras}h`
    return data.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
  }

  // ----------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF7ED 100%)' }}>
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-3">🔥</div>
          <p className="text-amber-600/50 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
            A procurar a fogueira...
          </p>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------
  // No active fogueira — show "light a fire" screen
  // ----------------------------------------------------------

  if (!fogueira) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF7ED 100%)' }}>
        {/* Header */}
        <div className="text-center pt-12 pb-6 px-4">
          <p className="text-3xl mb-2">🕯️</p>
          <h2
            className="text-xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-titulos)', color: '#92400E' }}
          >
            A Fogueira
          </h2>
          <p
            className="text-amber-600/50 text-sm italic"
            style={{ fontFamily: 'var(--font-corpo)' }}
          >
            Onde nos sentamos em círculo
          </p>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            {/* Cold embers animation */}
            <div className="mb-8">
              <div
                className="mx-auto w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, rgba(249,115,22,0.03) 50%, transparent 70%)'
                }}
              >
                <span className="text-4xl opacity-50">🕯️</span>
              </div>
            </div>

            <p
              className="text-amber-800/70 text-base mb-2"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              As brasas estão frias...
            </p>
            <p
              className="text-amber-600/40 text-sm mb-8"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              Queres acender uma nova fogueira para a comunidade?
            </p>

            {/* Form to create fogueira */}
            <div className="space-y-3">
              <input
                type="text"
                value={novaTema}
                onChange={(e) => setNovaTema(e.target.value)}
                placeholder="Tema da fogueira (ex: Gratidão pelo caminho)"
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-amber-200 focus:border-amber-400 focus:outline-none transition-colors bg-white"
                style={{ fontFamily: 'var(--font-corpo)' }}
                maxLength={100}
              />
              <input
                type="text"
                value={novoPrompt}
                onChange={(e) => setNovoPrompt(e.target.value)}
                placeholder="Prompt para os participantes (opcional)"
                className="w-full px-4 py-3 rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-amber-200 focus:border-amber-400 focus:outline-none transition-colors bg-white"
                style={{ fontFamily: 'var(--font-corpo)' }}
                maxLength={200}
              />
              <button
                onClick={handleCriarFogueira}
                disabled={!novaTema.trim() || criando}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #EF4444)',
                  fontFamily: 'var(--font-titulos)'
                }}
              >
                {criando ? 'A acender...' : '🔥 Acender Fogueira'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------
  // Active fogueira
  // ----------------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col animate-page-enter" style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF7ED 100%)' }}>

      {/* ===== Header ===== */}
      <div className="text-center pt-8 pb-2 px-4">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-titulos)', color: '#92400E' }}
        >
          🔥 A Fogueira 🔥
        </h2>
        <p
          className="text-amber-600/40 text-xs italic"
          style={{ fontFamily: 'var(--font-corpo)' }}
        >
          Onde nos sentamos em círculo
        </p>
      </div>

      {/* ===== Fire section ===== */}
      <div className="text-center px-4 pt-2 pb-4">
        {/* Fire animation */}
        <div className="flex justify-center mb-4">
          <div
            className="relative flex items-center justify-center transition-all duration-700"
            style={{
              width: `${80 * fireSize.scale}px`,
              height: `${80 * fireSize.scale}px`
            }}
          >
            {/* Glow behind the fire */}
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, rgba(249,115,22,${0.12 + chamas.length * 0.005}) 0%, rgba(239,68,68,0.05) 50%, transparent 70%)`,
                transform: `scale(${1.5 + chamas.length * 0.03})`
              }}
            />
            {/* Fire emojis */}
            <div
              className="relative"
              style={{
                fontSize: `${2 + fireSize.scale * 0.8}rem`,
                filter: `brightness(${1 + chamas.length * 0.01})`
              }}
            >
              {getFireEmojis()}
            </div>
          </div>
        </div>

        {/* Tema and prompt */}
        <p
          className="text-amber-700 text-sm font-semibold mb-1"
          style={{ fontFamily: 'var(--font-titulos)' }}
        >
          {fogueira.tema}
        </p>
        {fogueira.prompt && (
          <p
            className="text-amber-600/50 text-xs italic mb-3 px-4"
            style={{ fontFamily: 'var(--font-corpo)' }}
          >
            &ldquo;{fogueira.prompt}&rdquo;
          </p>
        )}

        {/* Time remaining */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <span className="text-amber-500/40 text-xs">⏰</span>
          <span
            className="text-amber-600/50 text-xs"
            style={{ fontFamily: 'var(--font-corpo)' }}
          >
            Extingue-se em {tempoRestante}
          </span>
        </div>

        {/* Contributors avatars */}
        {contribuidores.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center -space-x-2">
              {contribuidores.slice(0, 8).map((c, i) => (
                <div
                  key={c.user_id}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm overflow-hidden shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)',
                    zIndex: contribuidores.length - i
                  }}
                >
                  {c.perfil?.avatar_url ? (
                    <img src={c.perfil.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{c.perfil?.avatar_emoji || '🌸'}</span>
                  )}
                </div>
              ))}
              {contribuidores.length > 8 && (
                <div
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-amber-600 font-medium shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)' }}
                >
                  +{contribuidores.length - 8}
                </div>
              )}
            </div>
            <p
              className="text-amber-600/40 text-xs"
              style={{ fontFamily: 'var(--font-corpo)' }}
            >
              {contribuidores.length} {contribuidores.length === 1 ? 'alma' : 'almas'} à volta da fogueira
            </p>
          </div>
        )}
      </div>

      {/* ===== Divider ===== */}
      <div className="px-6">
        <div className="border-t border-amber-200/40" />
      </div>

      {/* ===== Chamas list ===== */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: '40vh' }}>
        {chamas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-amber-600/30 text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
              A fogueira espera a primeira chama...
            </p>
            <p className="text-amber-500/20 text-xs mt-1" style={{ fontFamily: 'var(--font-corpo)' }}>
              Sê a primeira a partilhar
            </p>
          </div>
        )}

        {chamas.map((chama) => {
          const perfilChama = chama.community_profiles
          const isOwn = chama.user_id === userId
          return (
            <div
              key={chama.id}
              className="rounded-xl px-4 py-3 transition-all bg-white shadow-sm"
              style={{
                borderLeft: isOwn ? '3px solid #F97316' : '3px solid transparent',
                border: '1px solid rgba(245,158,11,0.08)',
                borderLeftWidth: '3px',
                borderLeftColor: isOwn ? '#F97316' : 'transparent'
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)' }}
                >
                  {perfilChama?.avatar_url ? (
                    <img src={perfilChama.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{perfilChama?.avatar_emoji || '🌸'}</span>
                  )}
                </div>
                <span
                  className="text-amber-800/70 text-xs font-medium"
                  style={{ fontFamily: 'var(--font-corpo)' }}
                >
                  {perfilChama?.display_name || 'Alma Anónima'}
                </span>
                <span className="text-amber-400/40 text-[10px] ml-auto">
                  {tempoRelativoChama(chama.created_at)}
                </span>
              </div>
              <p
                className="text-gray-700 text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-corpo)' }}
              >
                {chama.conteudo}
              </p>
            </div>
          )
        })}
        <div ref={chamasEndRef} />
      </div>

      {/* ===== Input area ===== */}
      <div className="sticky bottom-0 px-4 py-4 border-t border-amber-200/30 bg-white/90"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={novaChama}
              onChange={(e) => setNovaChama(e.target.value.slice(0, 300))}
              onKeyDown={handleKeyDown}
              placeholder="Adiciona a tua chama..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-gray-700 placeholder-gray-400 border border-amber-200 focus:border-amber-400 focus:outline-none resize-none bg-white"
              style={{
                fontFamily: 'var(--font-corpo)',
                minHeight: '44px',
                maxHeight: '88px'
              }}
            />
            {novaChama.length > 0 && (
              <span
                className={`absolute bottom-2 right-3 text-[10px] ${
                  novaChama.length > 270 ? 'text-red-400' : 'text-gray-300'
                }`}
              >
                {novaChama.length}/300
              </span>
            )}
          </div>
          <button
            onClick={handleAdicionarChama}
            disabled={!novaChama.trim() || enviando}
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30"
            style={{
              background: novaChama.trim()
                ? 'linear-gradient(135deg, #F97316, #EF4444)'
                : '#E5E7EB'
            }}
          >
            {enviando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="text-lg">🔥</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
