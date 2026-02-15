import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  getRio,
  getRioPorEco,
  getPerfilPublico,
  upsertPerfilPublico,
  verificarRessonanciaBatch,
  apagarReflexao,
  getPromptDoDia,
  getEspelhos,
  criarEspelho,
  criarNotificacao,
  ECOS_INFO,
  TEMAS_REFLEXAO,
  ESPELHO_STARTERS,
  RESSONANCIA_TIPOS,
  tempoRelativo
} from '../../lib/comunidade'
import {
  getGhostPostsForRange,
  mergeGhostPosts,
  getGhostRessonanciaBatch,
  isGhostPost,
  getGhostEspelhos
} from '../../lib/ghost-users'
import ReflexaoImersiva from './ReflexaoImersiva'
import CriarReflexao from './CriarReflexao'
import EditarJornada from './EditarJornada'

const PAGE_SIZE = 20
const ECOS_FILTRO = ['vitalis', 'aurea', 'lumina', 'serena']

export default function Rio() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [posts, setPosts] = useState([])
  const [ressonanciaMap, setRessonanciaMap] = useState({})
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // UI state
  const [showCriarReflexao, setShowCriarReflexao] = useState(false)
  const [showEditarJornada, setShowEditarJornada] = useState(false)
  const [filtroEco, setFiltroEco] = useState(null)
  const [filtroTema, setFiltroTema] = useState(null)
  const [promptPreenchido, setPromptPreenchido] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  // Espelhos bottom sheet
  const [espelhosPost, setEspelhosPost] = useState(null)
  const [espelhos, setEspelhos] = useState([])
  const [loadingEspelhos, setLoadingEspelhos] = useState(false)
  const [novoEspelho, setNovoEspelho] = useState('')
  const [enviandoEspelho, setEnviandoEspelho] = useState(false)

  const scrollRef = useRef(null)
  const sentinelRef = useRef(null)

  // Prompt do dia
  const promptDoDia = getPromptDoDia(filtroEco)

  useEffect(() => { inicializar() }, [])

  useEffect(() => {
    if (userId) {
      setPosts([])
      setPage(0)
      setHasMore(true)
      setActiveCardIndex(0)
      carregarRio(0, true)
    }
  }, [filtroEco, filtroTema])

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          carregarRio(page + 1)
        }
      },
      { root: scrollRef.current, threshold: 0.5 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [page, hasMore, loadingMore, posts.length])

  // Track active card via scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const cardHeight = el.clientHeight
          const idx = Math.round(el.scrollTop / cardHeight)
          setActiveCardIndex(idx)
          ticking = false
        })
        ticking = true
      }
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  const inicializar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userData) {
        setUserId(userData.id)

        let perfilData = null
        try {
          perfilData = await getPerfilPublico(userData.id)
        } catch (e) {
          console.warn('Perfil query failed:', e)
        }

        if (perfilData) {
          setPerfil(perfilData)
          if (!perfilData.bio) setShowEditarJornada(true)
        } else {
          try {
            const nome = user.email.split('@')[0]
            const novoPerfil = await upsertPerfilPublico(userData.id, {
              display_name: nome.charAt(0).toUpperCase() + nome.slice(1),
              bio: '',
              avatar_emoji: '🌸',
              ecos_activos: []
            })
            setPerfil(novoPerfil)
            setShowEditarJornada(true)
          } catch (e) {
            console.warn('Profile creation failed:', e)
          }
        }

        await carregarRio(0, true, userData.id)
      }
    } catch (error) {
      console.error('Erro ao inicializar O Rio:', error)
    }
    setLoading(false)
  }

  const carregarRio = async (pageNum = 0, reset = false, uid = userId) => {
    if (!uid) return
    setLoadingMore(true)
    try {
      let data = []
      try {
        if (filtroEco) {
          data = await getRioPorEco(filtroEco, pageNum, PAGE_SIZE)
        } else {
          data = await getRio(pageNum, PAGE_SIZE)
        }
      } catch (e) {
        console.warn('Supabase rio query failed, showing ghost posts only:', e)
        data = []
      }

      if (filtroTema) data = data.filter(p => p.tipo === filtroTema)

      if (pageNum === 0) {
        let ghostPosts = getGhostPostsForRange(14)
        if (filtroEco) ghostPosts = ghostPosts.filter(p => p.eco === filtroEco || p.eco === 'geral')
        if (filtroTema) ghostPosts = ghostPosts.filter(p => p.tipo === filtroTema)
        data = mergeGhostPosts(data, ghostPosts)
      }

      if (data.length < PAGE_SIZE && pageNum > 0) setHasMore(false)

      const realPostIds = data.filter(p => !p._ghost).map(p => p.id)
      const ghostPostIds = data.filter(p => p._ghost).map(p => p.id)
      let ressonancias = {}
      try {
        ressonancias = realPostIds.length > 0 ? await verificarRessonanciaBatch(realPostIds, uid) : {}
      } catch (e) { console.warn('Ressonancia check failed:', e) }
      const ghostRessonancias = getGhostRessonanciaBatch(ghostPostIds)
      const allRessonancias = { ...ressonancias, ...ghostRessonancias }

      if (reset) {
        setPosts(data)
        setRessonanciaMap(allRessonancias)
      } else {
        setPosts(prev => [...prev, ...data])
        setRessonanciaMap(prev => ({ ...prev, ...allRessonancias }))
      }
      setPage(pageNum)
    } catch (error) {
      console.error('Erro ao carregar o rio:', error)
    }
    setLoadingMore(false)
  }

  // ───── Espelhos bottom sheet logic ─────
  const handleAbrirEspelhos = async (post) => {
    setEspelhosPost(post)
    setLoadingEspelhos(true)
    setEspelhos([])
    try {
      if (isGhostPost(post)) {
        setEspelhos(getGhostEspelhos(post.id))
      } else {
        const data = await getEspelhos(post.id)
        const ghostEsp = getGhostEspelhos(post.id)
        setEspelhos([...ghostEsp, ...data])
      }
    } catch (e) {
      console.error('Erro espelhos:', e)
      setEspelhos(getGhostEspelhos(post.id))
    }
    setLoadingEspelhos(false)
  }

  const handleEnviarEspelho = async (e) => {
    e.preventDefault()
    if (!novoEspelho.trim() || enviandoEspelho) return
    setEnviandoEspelho(true)
    try {
      if (isGhostPost(espelhosPost)) {
        setEspelhos(prev => [...prev, {
          id: `user_espelho_${Date.now()}`,
          post_id: espelhosPost.id,
          user_id: userId,
          conteudo: novoEspelho.trim(),
          created_at: new Date().toISOString(),
          community_profiles: { user_id: userId, display_name: 'Tu', avatar_emoji: '🌸' }
        }])
      } else {
        const espelho = await criarEspelho(espelhosPost.id, userId, novoEspelho.trim())
        setEspelhos(prev => [...prev, {
          ...espelho,
          community_profiles: { user_id: userId, display_name: 'Tu', avatar_emoji: '🌸' }
        }])
        if (espelhosPost.user_id !== userId) {
          criarNotificacao(espelhosPost.user_id, userId, 'espelho', espelhosPost.id, novoEspelho.trim().slice(0, 50))
        }
      }
      setNovoEspelho('')
    } catch (error) {
      console.error('Erro ao enviar espelho:', error)
    }
    setEnviandoEspelho(false)
  }

  const handleReflexaoCriada = (novaReflexao) => {
    const reflexaoComPerfil = {
      ...novaReflexao,
      community_profiles: perfil ? {
        display_name: perfil.display_name,
        avatar_emoji: perfil.avatar_emoji,
        avatar_url: perfil.avatar_url,
        ecos_activos: perfil.ecos_activos
      } : null
    }
    setPosts(prev => [reflexaoComPerfil, ...prev])
    setShowCriarReflexao(false)
    setPromptPreenchido(null)
    // Scroll to top to see the new post
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePerfilAtualizado = (novoPerfil) => setPerfil(novoPerfil)

  const handleReflectirPrompt = () => {
    setPromptPreenchido(promptDoDia)
    setShowCriarReflexao(true)
  }

  // ───── Loading ─────
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(160deg, #151020 0%, #201838 50%, #0a0815 100%)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }}>
          🌊
        </div>
        <p className="text-white/40 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A fluir para o rio...
        </p>
      </div>
    )
  }

  // ───── Total card count (prompt card + posts) ─────
  const hasPrompt = !!promptDoDia
  const totalCards = (hasPrompt ? 1 : 0) + posts.length

  return (
    <div className="h-[100dvh] relative overflow-hidden" style={{ background: '#0a0815' }}>

      {/* ═══════ SNAP SCROLL CONTAINER ═══════ */}
      <div ref={scrollRef} className="rio-snap h-full w-full">

        {/* ───── Card 0: Prompt do Dia ───── */}
        {hasPrompt && (
          <div className="rio-card h-[100dvh] w-full relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #151020 0%, #1f1550 40%, #0a0820 100%)' }}>

            {/* Decorative bokeh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute rounded-full animate-bokeh"
                style={{ width: 200, height: 200, top: '15%', right: '-5%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
              <div className="absolute rounded-full animate-bokeh-slow"
                style={{ width: 160, height: 160, bottom: '20%', left: '-8%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)' }} />
              <div className="absolute rounded-full animate-bokeh-fast"
                style={{ width: 100, height: 100, top: '50%', left: '60%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center">
              <span className="text-5xl mb-6">{promptDoDia.emoji}</span>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-6"
                style={{ color: 'rgba(139,92,246,0.7)', fontFamily: 'var(--font-corpo)' }}>
                Prompt do Dia
              </p>
              <p className="text-2xl text-white leading-relaxed mb-10 max-w-sm"
                style={{ fontFamily: 'var(--font-titulos)', fontWeight: 400, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                "{promptDoDia.texto}"
              </p>
              <button
                onClick={handleReflectirPrompt}
                className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:shadow-xl active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  boxShadow: '0 8px 32px rgba(139,92,246,0.35)'
                }}
              >
                Reflectir
              </button>

              {/* Scroll hint */}
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-scroll-hint">
                <p className="text-xs text-white/30" style={{ fontFamily: 'var(--font-corpo)' }}>
                  desliza para ver reflexões
                </p>
                <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ───── Reflexão cards ───── */}
        {posts.map((post, i) => (
          <div key={post.id} className="rio-card h-[100dvh] w-full">
            <ReflexaoImersiva
              post={post}
              userId={userId}
              ressoou={ressonanciaMap[post.id] || false}
              onPerfilClick={(uid) => navigate(`/comunidade/jornada/${uid}`)}
              onPostDeleted={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
              onAbrirEspelhos={handleAbrirEspelhos}
            />
          </div>
        ))}

        {/* ───── Load more sentinel ───── */}
        {hasMore && posts.length > 0 && (
          <div ref={sentinelRef} className="rio-card h-[100dvh] w-full flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #151020 0%, #0a0815 100%)' }}>
            {loadingMore ? (
              <>
                <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mb-4" />
                <p className="text-white/30 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
                  Mais reflexões a fluir...
                </p>
              </>
            ) : (
              <button onClick={() => carregarRio(page + 1)}
                className="text-white/40 text-sm hover:text-white/60 transition-colors"
                style={{ fontFamily: 'var(--font-titulos)' }}>
                Carregar mais reflexões
              </button>
            )}
          </div>
        )}

        {/* ───── End of river ───── */}
        {!hasMore && posts.length > 0 && (
          <div className="rio-card h-[100dvh] w-full flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #151020 0%, #0a0815 100%)' }}>
            <span className="text-5xl mb-4 animate-breathe">🌊</span>
            <p className="text-white/30 text-sm mb-2" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
              Chegaste ao remanso do rio
            </p>
            <p className="text-white/20 text-xs mb-8" style={{ fontFamily: 'var(--font-corpo)' }}>
              Partilha a tua reflexão para manter o rio a fluir
            </p>
            <button
              onClick={() => setShowCriarReflexao(true)}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                boxShadow: '0 4px 20px rgba(139,92,246,0.3)'
              }}
            >
              Criar reflexão
            </button>
          </div>
        )}

        {/* ───── Empty state ───── */}
        {posts.length === 0 && !loadingMore && !hasPrompt && (
          <div className="rio-card h-[100dvh] w-full flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #151020 0%, #201838 100%)' }}>
            <span className="text-5xl mb-4">🌱</span>
            <h3 className="text-lg font-semibold text-white/70 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              O rio está quieto...
            </h3>
            <p className="text-sm text-white/30 max-w-xs text-center leading-relaxed mb-6" style={{ fontFamily: 'var(--font-corpo)' }}>
              Sê a primeira a deixar fluir uma reflexão
            </p>
            <button
              onClick={() => setShowCriarReflexao(true)}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                boxShadow: '0 4px 20px rgba(139,92,246,0.3)'
              }}
            >
              Criar reflexão
            </button>
          </div>
        )}
      </div>

      {/* ═══════ OVERLAY UI ═══════ */}

      {/* ───── Top bar: back + filters + avatar ───── */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-8 pointer-events-auto">
          <button
            onClick={() => navigate('/comunidade')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white/90" style={{ fontFamily: 'var(--font-titulos)' }}>
              O Rio
            </h1>
          </div>

          <button
            onClick={() => navigate(`/comunidade/jornada/${userId}`)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          >
            {perfil?.avatar_emoji || '🌸'}
          </button>
        </div>
      </div>

      {/* ───── Filter toggle ───── */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-16 left-4 z-30 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 transition-all active:scale-95"
        style={{
          background: showFilters ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        {filtroEco ? `${ECOS_INFO[filtroEco]?.emoji} ${ECOS_INFO[filtroEco]?.label}` : '☰ Filtrar'}
      </button>

      {/* ───── Filter panel ───── */}
      {showFilters && (
        <div className="absolute top-24 left-4 right-4 z-30 animate-fadeIn">
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(15,10,30,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>

            {/* Eco filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setFiltroEco(null); setFiltroTema(null); setShowFilters(false) }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  !filtroEco ? 'text-white' : 'text-white/50'
                }`}
                style={!filtroEco ? { backgroundColor: '#8B5CF6' } : { backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                Todas
              </button>
              {ECOS_FILTRO.map(eco => {
                const info = ECOS_INFO[eco]
                if (!info) return null
                return (
                  <button
                    key={eco}
                    onClick={() => { setFiltroEco(filtroEco === eco ? null : eco); setFiltroTema(null); setShowFilters(false) }}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 ${
                      filtroEco === eco ? 'text-white' : 'text-white/50'
                    }`}
                    style={filtroEco === eco ? { backgroundColor: info.cor } : { backgroundColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <span>{info.emoji}</span> {info.label}
                  </button>
                )
              })}
            </div>

            {/* Tema filters */}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TEMAS_REFLEXAO).map(([key, tema]) => (
                <button
                  key={key}
                  onClick={() => { setFiltroTema(filtroTema === key ? null : key); setShowFilters(false) }}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    filtroTema === key ? 'text-white' : 'text-white/40'
                  }`}
                  style={filtroTema === key ? { backgroundColor: tema.cor } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  {tema.emoji} {tema.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───── Card progress dots ───── */}
      {totalCards > 1 && totalCards <= 30 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
          {Array.from({ length: Math.min(totalCards, 15) }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeCardIndex === i ? 3 : 2,
                height: activeCardIndex === i ? 12 : 6,
                backgroundColor: activeCardIndex === i ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.2)'
              }}
            />
          ))}
        </div>
      )}

      {/* ───── FAB — Criar reflexao ───── */}
      <button
        onClick={() => { setPromptPreenchido(null); setShowCriarReflexao(true) }}
        className="absolute bottom-24 right-4 w-14 h-14 rounded-full text-white flex items-center justify-center z-30 transition-all active:scale-90"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          boxShadow: '0 8px 32px rgba(139,92,246,0.4)'
        }}
        aria-label="Criar reflexão"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* ═══════ ESPELHOS BOTTOM SHEET ═══════ */}
      {espelhosPost && (
        <div className="absolute inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setEspelhosPost(null); setNovoEspelho('') }} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[65vh] flex flex-col animate-sheet-up">
            {/* Handle + header */}
            <div className="flex-shrink-0 p-4 pb-2 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                  Espelhos
                </h3>
                <button onClick={() => { setEspelhosPost(null); setNovoEspelho('') }} className="text-gray-400 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Espelhos list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingEspelhos ? (
                <div className="text-center py-6">
                  <div className="w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-400">A carregar...</p>
                </div>
              ) : espelhos.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-3xl block mb-2">🪞</span>
                  <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                    Sê a primeira a espelhar esta reflexão
                  </p>
                </div>
              ) : (
                espelhos.map(e => (
                  <div key={e.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)' }}>
                      {e.community_profiles?.avatar_emoji || '🌸'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-gray-700">
                          {e.community_profiles?.display_name || 'Utilizadora'}
                        </span>
                        <span className="text-xs text-gray-300">{tempoRelativo(e.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mt-0.5" style={{ fontFamily: 'var(--font-corpo)' }}>
                        {e.conteudo}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Starter suggestions */}
            <div className="flex-shrink-0 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-50">
              {ESPELHO_STARTERS.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => setNovoEspelho(starter + ' ')}
                  className="text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-500 whitespace-nowrap transition-all active:scale-95 flex-shrink-0"
                >
                  {starter}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleEnviarEspelho} className="flex-shrink-0 flex gap-2 p-3 pb-6 border-t border-gray-100 bg-white">
              <input
                type="text"
                value={novoEspelho}
                onChange={(e) => setNovoEspelho(e.target.value)}
                placeholder="Espelha esta reflexão..."
                className="flex-1 text-sm py-2.5 px-4 rounded-full border border-gray-200 focus:border-purple-300 focus:outline-none"
                style={{ fontFamily: 'var(--font-corpo)' }}
                maxLength={500}
                autoFocus
              />
              <button
                type="submit"
                disabled={!novoEspelho.trim() || enviandoEspelho}
                className="text-sm font-bold px-4 rounded-full transition-all disabled:opacity-30"
                style={{ color: '#8B5CF6' }}
              >
                {enviandoEspelho ? '...' : 'Enviar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ MODALS ═══════ */}
      {showCriarReflexao && (
        <div className="absolute inset-0 z-50">
          <CriarReflexao
            userId={userId}
            prompt={promptPreenchido}
            onReflexaoCriada={handleReflexaoCriada}
            onFechar={() => { setShowCriarReflexao(false); setPromptPreenchido(null) }}
          />
        </div>
      )}

      {showEditarJornada && (
        <div className="absolute inset-0 z-50">
          <EditarJornada
            userId={userId}
            perfil={perfil}
            onPerfilAtualizado={handlePerfilAtualizado}
            onFechar={() => setShowEditarJornada(false)}
          />
        </div>
      )}

      {/* Close filters on outside tap */}
      {showFilters && (
        <div className="absolute inset-0 z-20" onClick={() => setShowFilters(false)} />
      )}
    </div>
  )
}
