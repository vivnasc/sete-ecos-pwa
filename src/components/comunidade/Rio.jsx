import React, { useState, useEffect, useRef } from 'react'
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
  darRessonancia,
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
  getGhostEspelhos,
  toggleGhostRessonancia
} from '../../lib/ghost-users'
import ReflexaoImersiva from './ReflexaoImersiva'
import CriarReflexao from './CriarReflexao'
import EditarJornada from './EditarJornada'
import { Avatar } from './HubComunidade'

const PAGE_SIZE = 20
const ECOS_FILTRO = ['vitalis', 'aurea', 'lumina', 'serena']
const BREATHING_INTERVAL = 6 // Show breath break every N posts

const RESSONANCIA_KEYS = Object.keys(RESSONANCIA_TIPOS)

export default function Rio() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [posts, setPosts] = useState([])
  const [ressonanciaMap, setRessonanciaMap] = useState({})
  const [ressonanciaCountMap, setRessonanciaCountMap] = useState({})
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

  // Immersive full-screen view
  const [immersedPost, setImmersedPost] = useState(null)

  // Espelhos bottom sheet
  const [espelhosPost, setEspelhosPost] = useState(null)
  const [espelhos, setEspelhos] = useState([])
  const [loadingEspelhos, setLoadingEspelhos] = useState(false)
  const [novoEspelho, setNovoEspelho] = useState('')
  const [enviandoEspelho, setEnviandoEspelho] = useState(false)

  const scrollRef = useRef(null)
  const sentinelRef = useRef(null)
  const promptDoDia = getPromptDoDia(filtroEco)

  useEffect(() => { inicializar() }, [])

  useEffect(() => {
    if (userId) {
      setPosts([])
      setPage(0)
      setHasMore(true)
      carregarRio(0, true)
    }
  }, [filtroEco, filtroTema])

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loadingMore) carregarRio(page + 1) },
      { root: scrollRef.current, threshold: 0.3 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [page, hasMore, loadingMore, posts.length])

  // ───── Data loading ─────

  const inicializar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: userData } = await supabase.from('users').select('id').eq('auth_id', user.id).single()

      if (userData) {
        setUserId(userData.id)
        let perfilData = null
        try { perfilData = await getPerfilPublico(userData.id) } catch (e) { /* ok */ }

        if (perfilData) {
          setPerfil(perfilData)
          if (!perfilData.bio) setShowEditarJornada(true)
        } else {
          try {
            const nome = user.email.split('@')[0]
            const novoPerfil = await upsertPerfilPublico(userData.id, {
              display_name: nome.charAt(0).toUpperCase() + nome.slice(1), bio: '', avatar_emoji: '🌸', ecos_activos: []
            })
            setPerfil(novoPerfil)
            setShowEditarJornada(true)
          } catch (e) { /* ok */ }
        }
        await carregarRio(0, true, userData.id)
      }
    } catch (error) { console.error('Erro ao inicializar O Rio:', error) }
    setLoading(false)
  }

  const carregarRio = async (pageNum = 0, reset = false, uid = userId) => {
    if (!uid) return
    setLoadingMore(true)
    try {
      let data = []
      try {
        data = filtroEco ? await getRioPorEco(filtroEco, pageNum, PAGE_SIZE) : await getRio(pageNum, PAGE_SIZE)
      } catch (e) { data = [] }

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
      try { ressonancias = realPostIds.length > 0 ? await verificarRessonanciaBatch(realPostIds, uid) : {} } catch (e) { /* ok */ }
      const ghostRessonancias = getGhostRessonanciaBatch(ghostPostIds)
      const allRessonancias = { ...ressonancias, ...ghostRessonancias }

      // Build count map
      const countMap = {}
      data.forEach(p => { countMap[p.id] = p.ressonancia_count || p.likes_count || 0 })

      if (reset) {
        setPosts(data)
        setRessonanciaMap(allRessonancias)
        setRessonanciaCountMap(countMap)
      } else {
        setPosts(prev => [...prev, ...data])
        setRessonanciaMap(prev => ({ ...prev, ...allRessonancias }))
        setRessonanciaCountMap(prev => ({ ...prev, ...countMap }))
      }
      setPage(pageNum)
    } catch (error) { console.error('Erro ao carregar o rio:', error) }
    setLoadingMore(false)
  }

  // ───── Ressonancia on card (without immersing) ─────

  const handleQuickRessonancia = async (e, post, tipo = 'ressoo') => {
    e.stopPropagation()

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(30)

    try {
      if (isGhostPost(post)) {
        const result = toggleGhostRessonancia(post.id, tipo)
        setRessonanciaMap(prev => ({ ...prev, [post.id]: !!result }))
        setRessonanciaCountMap(prev => ({ ...prev, [post.id]: (prev[post.id] || 0) + (result ? 1 : -1) }))
      } else {
        const result = await darRessonancia(post.id, userId, tipo)
        setRessonanciaMap(prev => ({ ...prev, [post.id]: !!result }))
        setRessonanciaCountMap(prev => ({ ...prev, [post.id]: (prev[post.id] || 0) + (result ? 1 : -1) }))
        if (result && post.user_id !== userId) {
          criarNotificacao(post.user_id, userId, 'ressonancia', post.id, RESSONANCIA_TIPOS[tipo]?.label || '')
        }
      }
    } catch (err) { console.error('Erro ressonancia:', err) }
  }

  // ───── Espelhos ─────

  const handleAbrirEspelhos = async (post) => {
    setEspelhosPost(post)
    setLoadingEspelhos(true)
    setEspelhos([])
    try {
      if (isGhostPost(post)) {
        setEspelhos(getGhostEspelhos(post.id))
      } else {
        const data = await getEspelhos(post.id)
        setEspelhos([...getGhostEspelhos(post.id), ...data])
      }
    } catch (e) { setEspelhos(getGhostEspelhos(post.id)) }
    setLoadingEspelhos(false)
  }

  const handleEnviarEspelho = async (e) => {
    e.preventDefault()
    if (!novoEspelho.trim() || enviandoEspelho) return
    setEnviandoEspelho(true)
    try {
      const newEspelho = {
        id: `user_espelho_${Date.now()}`, post_id: espelhosPost.id, user_id: userId,
        conteudo: novoEspelho.trim(), created_at: new Date().toISOString(),
        community_profiles: { user_id: userId, display_name: 'Tu', avatar_emoji: '🌸' }
      }
      if (isGhostPost(espelhosPost)) {
        setEspelhos(prev => [...prev, newEspelho])
      } else {
        const espelho = await criarEspelho(espelhosPost.id, userId, novoEspelho.trim())
        setEspelhos(prev => [...prev, { ...espelho, community_profiles: newEspelho.community_profiles }])
        if (espelhosPost.user_id !== userId) {
          criarNotificacao(espelhosPost.user_id, userId, 'espelho', espelhosPost.id, novoEspelho.trim().slice(0, 50))
        }
      }
      setNovoEspelho('')
    } catch (err) { console.error('Erro espelho:', err) }
    setEnviandoEspelho(false)
  }

  const handleReflexaoCriada = (nova) => {
    setPosts(prev => [{
      ...nova,
      community_profiles: perfil ? {
        display_name: perfil.display_name, avatar_emoji: perfil.avatar_emoji,
        avatar_url: perfil.avatar_url, ecos_activos: perfil.ecos_activos
      } : null
    }, ...prev])
    setShowCriarReflexao(false)
    setPromptPreenchido(null)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ───── Bioluminescence level (0-4) ─────
  const bioLevel = (postId) => {
    const c = ressonanciaCountMap[postId] || 0
    if (c >= 15) return 4
    if (c >= 8) return 3
    if (c >= 3) return 2
    if (c >= 1) return 1
    return 0
  }

  // ───── Render ─────

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #F5F0EB 50%, #FDF8F3 100%)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl animate-pulse"
          style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)' }}>
          🌊
        </div>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A fluir para o rio...
        </p>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #F5F0EB 50%, #FDF8F3 100%)' }}>

      {/* ═══════ FLUID SCROLL RIVER ═══════ */}
      <div ref={scrollRef} className="rio-flow h-full w-full px-4 pt-20 pb-28">

        {/* ───── Prompt do Dia ───── */}
        {promptDoDia && (
          <div className="mb-6 animate-card-reveal">
            <button
              onClick={() => { setPromptPreenchido(promptDoDia); setShowCriarReflexao(true) }}
              className="w-full rounded-3xl p-6 text-left relative overflow-hidden transition-all active:scale-[0.98] bg-white shadow-sm"
              style={{ border: '1px solid rgba(139,92,246,0.1)' }}
            >
              <div className="absolute inset-0 rounded-3xl opacity-30"
                style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{promptDoDia.emoji}</span>
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-purple-400"
                    style={{ fontFamily: 'var(--font-corpo)' }}>
                    Prompt do Dia
                  </span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-3"
                  style={{ fontFamily: 'var(--font-titulos)', fontWeight: 400 }}>
                  "{promptDoDia.texto}"
                </p>
                <span className="text-xs font-semibold px-4 py-2 rounded-full text-white inline-block"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
                  Reflectir
                </span>
              </div>
            </button>
          </div>
        )}

        {/* ───── Reflexão cards ───── */}
        {posts.map((post, i) => {
          const perfilPost = post.community_profiles
          const ecoInfo = post.eco ? ECOS_INFO[post.eco] : null
          const temaInfo = TEMAS_REFLEXAO[post.tipo] || TEMAS_REFLEXAO.livre
          const ressoou = ressonanciaMap[post.id] || false
          const count = ressonanciaCountMap[post.id] || 0
          const bio = bioLevel(post.id)
          const conteudo = post.conteudo || ''
          const isShort = conteudo.length < 100
          const showBreath = i > 0 && i % BREATHING_INTERVAL === 0

          return (
            <React.Fragment key={post.id}>
              {/* ───── Breathing pause ───── */}
              {showBreath && (
                <div className="flex flex-col items-center py-8 my-2">
                  <div className="w-10 h-10 rounded-full animate-breathe-in mb-3"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
                  <p className="text-xs text-gray-300" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
                    Respira. O rio continua.
                  </p>
                </div>
              )}

              {/* ───── Card ───── */}
              <div
                className={`relative mb-4 rounded-2xl overflow-hidden transition-all active:scale-[0.98]
                  animate-card-reveal bg-white shadow-sm`}
                style={{
                  animationDelay: `${(i % 5) * 0.08}s`,
                  borderLeft: `3px solid ${ecoInfo?.cor || '#8B5CF6'}`,
                  border: `1px solid ${ecoInfo?.cor || '#8B5CF6'}${bio >= 2 ? '20' : '10'}`,
                  borderLeftWidth: '3px',
                  borderLeftColor: ecoInfo?.cor || '#8B5CF6'
                }}
              >
                {/* Tap to immerse */}
                <button
                  className="w-full text-left p-5"
                  onClick={() => setImmersedPost(post)}
                >
                  {/* Header: avatar + name + badges */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      className="flex items-center gap-2.5 text-left"
                      onClick={(e) => { e.stopPropagation(); if (!post.is_anonymous) navigate(`/comunidade/jornada/${post.user_id}`) }}
                      disabled={post.is_anonymous}
                    >
                      {post.is_anonymous ? (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                          style={{ background: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)' }}>🌙</div>
                      ) : (
                        <Avatar perfil={perfilPost} size={36} />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700" style={{ fontFamily: 'var(--font-corpo)' }}>
                          {post.is_anonymous ? 'Alma Anónima' : (perfilPost?.display_name || 'Utilizadora')}
                        </p>
                        <p className="text-[10px] text-gray-300">{tempoRelativo(post.created_at)}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5">
                      {ecoInfo && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: `${ecoInfo.cor}15`, color: ecoInfo.cor }}>
                          {ecoInfo.emoji}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: `${temaInfo.cor}10`, color: temaInfo.cor }}>
                        {temaInfo.emoji}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <p className={`text-gray-600 leading-relaxed ${isShort ? 'text-base' : 'text-sm'} ${
                    conteudo.length > 200 ? 'line-clamp-4' : ''
                  }`} style={{ fontFamily: 'var(--font-titulos)', fontWeight: 400 }}>
                    {conteudo}
                  </p>
                  {conteudo.length > 200 && (
                    <p className="text-xs text-gray-300 mt-1" style={{ fontFamily: 'var(--font-corpo)' }}>
                      toca para ler tudo
                    </p>
                  )}
                </button>

                {/* Bottom actions bar */}
                <div className="relative flex items-center justify-between px-5 pb-4 pt-1">
                  {/* Ressonância button */}
                  <button
                    onClick={(e) => handleQuickRessonancia(e, post)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-110"
                    style={{
                      background: ressoou ? 'rgba(139,92,246,0.1)' : 'rgba(0,0,0,0.02)',
                      border: ressoou ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <span className="text-sm">🫧</span>
                    {count > 0 && <span className="text-xs text-gray-400 font-medium">{count}</span>}
                  </button>

                  {/* Espelhos */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAbrirEspelhos(post) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
                    style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}
                  >
                    <span className="text-sm">🪞</span>
                    <span className="text-xs text-gray-400">Espelhos</span>
                  </button>

                  {/* Immerse hint */}
                  <span className="text-[10px] text-gray-300" style={{ fontFamily: 'var(--font-corpo)' }}>
                    toca para imergir
                  </span>
                </div>
              </div>
            </React.Fragment>
          )
        })}

        {/* Sentinel for loading more */}
        {hasMore && posts.length > 0 && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {loadingMore && (
              <div className="w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}

        {/* End of river */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-12">
            <span className="text-3xl block mb-3 animate-breathe">🌊</span>
            <p className="text-xs text-gray-300" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
              Chegaste ao remanso do rio
            </p>
          </div>
        )}

        {/* Empty */}
        {posts.length === 0 && !loadingMore && !promptDoDia && (
          <div className="text-center py-20">
            <span className="text-4xl block mb-4">🌱</span>
            <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: 'var(--font-titulos)' }}>
              O rio está quieto... Sê a primeira a reflectir.
            </p>
            <button onClick={() => setShowCriarReflexao(true)}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white active:scale-95"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
              Criar reflexão
            </button>
          </div>
        )}
      </div>

      {/* ═══════ OVERLAY: Top bar ═══════ */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(253,248,243,0.95) 0%, transparent 100%)' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-6 pointer-events-auto">
          <button onClick={() => navigate('/comunidade')}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 bg-white shadow-sm"
            style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 rounded-full text-xs font-medium active:scale-95 bg-white shadow-sm"
            style={{
              color: filtroEco ? ECOS_INFO[filtroEco]?.cor : '#6B7280',
              border: showFilters ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(0,0,0,0.06)'
            }}>
            {filtroEco ? `${ECOS_INFO[filtroEco]?.emoji} ${ECOS_INFO[filtroEco]?.label}` : 'O Rio'}
          </button>

          <button onClick={() => navigate(`/comunidade/jornada/${userId}`)}
            className="active:scale-90">
            <Avatar perfil={perfil} size={36} className="border-2 border-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <>
          <div className="absolute inset-0 z-20" onClick={() => setShowFilters(false)} />
          <div className="absolute top-16 left-4 right-4 z-30 animate-card-reveal">
            <div className="rounded-2xl p-4 space-y-3 bg-white shadow-lg"
              style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setFiltroEco(null); setFiltroTema(null); setShowFilters(false) }}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium ${!filtroEco ? 'text-white' : 'text-gray-500'}`}
                  style={!filtroEco ? { backgroundColor: '#8B5CF6' } : { backgroundColor: '#F3F4F6' }}>
                  Todas
                </button>
                {ECOS_FILTRO.map(eco => {
                  const info = ECOS_INFO[eco]
                  return info ? (
                    <button key={eco}
                      onClick={() => { setFiltroEco(filtroEco === eco ? null : eco); setShowFilters(false) }}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 ${filtroEco === eco ? 'text-white' : 'text-gray-500'}`}
                      style={filtroEco === eco ? { backgroundColor: info.cor } : { backgroundColor: '#F3F4F6' }}>
                      {info.emoji} {info.label}
                    </button>
                  ) : null
                })}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TEMAS_REFLEXAO).map(([key, tema]) => (
                  <button key={key}
                    onClick={() => { setFiltroTema(filtroTema === key ? null : key); setShowFilters(false) }}
                    className={`text-xs px-2.5 py-1 rounded-full ${filtroTema === key ? 'text-white' : 'text-gray-400'}`}
                    style={filtroTema === key ? { backgroundColor: tema.cor } : { backgroundColor: '#F9FAFB' }}>
                    {tema.emoji} {tema.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* FAB */}
      <button
        onClick={() => { setPromptPreenchido(null); setShowCriarReflexao(true) }}
        className="absolute bottom-24 right-4 w-13 h-13 rounded-full text-white flex items-center justify-center z-30 active:scale-90"
        style={{ background: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)', boxShadow: '0 6px 24px rgba(217,119,6,0.35)', width: 52, height: 52 }}
        aria-label="Criar reflexão">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* ═══════ IMMERSIVE FULL-SCREEN VIEW ═══════ */}
      {immersedPost && (
        <div className="absolute inset-0 z-40 animate-immerse-in">
          <ReflexaoImersiva
            post={immersedPost}
            userId={userId}
            ressoou={ressonanciaMap[immersedPost.id] || false}
            onPerfilClick={(uid) => { setImmersedPost(null); navigate(`/comunidade/jornada/${uid}`) }}
            onPostDeleted={(id) => { setPosts(prev => prev.filter(p => p.id !== id)); setImmersedPost(null) }}
            onAbrirEspelhos={(p) => { setImmersedPost(null); handleAbrirEspelhos(p) }}
          />
          {/* Close button */}
          <button
            onClick={() => setImmersedPost(null)}
            className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 bg-white/80 shadow-sm"
            style={{ backdropFilter: 'blur(8px)' }}>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ═══════ ESPELHOS BOTTOM SHEET ═══════ */}
      {espelhosPost && (
        <div className="absolute inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setEspelhosPost(null); setNovoEspelho('') }} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[65vh] flex flex-col animate-sheet-up">
            <div className="flex-shrink-0 p-4 pb-2 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-titulos)', color: '#1E1B4B' }}>Espelhos</h3>
                <button onClick={() => { setEspelhosPost(null); setNovoEspelho('') }} className="text-gray-400 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingEspelhos ? (
                <div className="text-center py-6">
                  <div className="w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                </div>
              ) : espelhos.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-3xl block mb-2">🪞</span>
                  <p className="text-sm text-gray-400">Sê a primeira a espelhar esta reflexão</p>
                </div>
              ) : espelhos.map(e => (
                <div key={e.id} className="flex gap-3">
                  <Avatar perfil={e.community_profiles} size={32} className="flex-shrink-0" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-gray-700">{e.community_profiles?.display_name || 'Utilizadora'}</span>
                      <span className="text-xs text-gray-300">{tempoRelativo(e.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mt-0.5" style={{ fontFamily: 'var(--font-corpo)' }}>{e.conteudo}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-shrink-0 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-50">
              {ESPELHO_STARTERS.map((s, i) => (
                <button key={i} onClick={() => setNovoEspelho(s + ' ')}
                  className="text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-500 whitespace-nowrap active:scale-95 flex-shrink-0">
                  {s}
                </button>
              ))}
            </div>
            <form onSubmit={handleEnviarEspelho} className="flex-shrink-0 flex gap-2 p-3 pb-6 border-t border-gray-100 bg-white">
              <input type="text" value={novoEspelho} onChange={(e) => setNovoEspelho(e.target.value)}
                placeholder="Espelha esta reflexão..." maxLength={500} autoFocus
                className="flex-1 text-sm py-2.5 px-4 rounded-full border border-gray-200 focus:border-purple-300 focus:outline-none" />
              <button type="submit" disabled={!novoEspelho.trim() || enviandoEspelho}
                className="text-sm font-bold px-4 rounded-full disabled:opacity-30" style={{ color: '#8B5CF6' }}>
                {enviandoEspelho ? '...' : 'Enviar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCriarReflexao && (
        <div className="absolute inset-0 z-50">
          <CriarReflexao userId={userId} prompt={promptPreenchido}
            onReflexaoCriada={handleReflexaoCriada}
            onFechar={() => { setShowCriarReflexao(false); setPromptPreenchido(null) }} />
        </div>
      )}
      {showEditarJornada && (
        <div className="absolute inset-0 z-50">
          <EditarJornada userId={userId} perfil={perfil}
            onPerfilAtualizado={(p) => setPerfil(p)}
            onFechar={() => setShowEditarJornada(false)} />
        </div>
      )}
    </div>
  )
}
