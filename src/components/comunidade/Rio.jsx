import React, { useState, useEffect, useCallback } from 'react'
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
  ECOS_INFO,
  TEMAS_REFLEXAO
} from '../../lib/comunidade'
import {
  getGhostPostsForRange,
  mergeGhostPosts,
  getGhostRessonanciaBatch
} from '../../lib/ghost-users'
import ReflexaoCard from './ReflexaoCard'
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

  // Prompt do dia
  const promptDoDia = getPromptDoDia(filtroEco)

  useEffect(() => {
    inicializar()
  }, [])

  useEffect(() => {
    if (userId) {
      setPosts([])
      setPage(0)
      setHasMore(true)
      carregarRio(0, true)
    }
  }, [filtroEco, filtroTema])

  const inicializar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userData) {
        setUserId(userData.id)

        // Carregar ou criar perfil
        let perfilData = await getPerfilPublico(userData.id)
        if (perfilData) {
          setPerfil(perfilData)
          // Primeira visita sem bio => abrir EditarJornada
          if (!perfilData.bio) {
            setShowEditarJornada(true)
          }
        } else {
          const nome = user.email.split('@')[0]
          const novoPerfil = await upsertPerfilPublico(userData.id, {
            display_name: nome.charAt(0).toUpperCase() + nome.slice(1),
            bio: '',
            avatar_emoji: '🌸',
            ecos_activos: []
          })
          setPerfil(novoPerfil)
          setShowEditarJornada(true)
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

      // Filtrar por tema localmente se necessário
      if (filtroTema) {
        data = data.filter(p => p.tipo === filtroTema)
      }

      // Misturar ghost posts na primeira página
      if (pageNum === 0) {
        let ghostPosts = getGhostPostsForRange(14)
        if (filtroEco) {
          ghostPosts = ghostPosts.filter(p => p.eco === filtroEco || p.eco === 'geral')
        }
        if (filtroTema) {
          ghostPosts = ghostPosts.filter(p => p.tipo === filtroTema)
        }
        data = mergeGhostPosts(data, ghostPosts)
      }

      if (data.length < PAGE_SIZE && pageNum > 0) setHasMore(false)

      // Verificar ressonâncias em batch (reais + ghost)
      const realPostIds = data.filter(p => !p._ghost).map(p => p.id)
      const ghostPostIds = data.filter(p => p._ghost).map(p => p.id)
      let ressonancias = {}
      try {
        ressonancias = realPostIds.length > 0
          ? await verificarRessonanciaBatch(realPostIds, uid)
          : {}
      } catch (e) {
        console.warn('Ressonancia batch check failed:', e)
      }
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
  }

  const handlePostDeleted = async (postId) => {
    try {
      await apagarReflexao(postId, userId)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Erro ao apagar reflexao:', error)
    }
  }

  const handlePerfilAtualizado = (novoPerfil) => {
    setPerfil(novoPerfil)
  }

  const handleCarregarMais = () => {
    if (!loadingMore && hasMore) {
      carregarRio(page + 1)
    }
  }

  const handleFiltroEco = (eco) => {
    if (filtroEco === eco) {
      setFiltroEco(null)
    } else {
      setFiltroEco(eco)
    }
    setFiltroTema(null)
  }

  const handleFiltroTema = (tema) => {
    if (filtroTema === tema) {
      setFiltroTema(null)
    } else {
      setFiltroTema(tema)
    }
  }

  const handleReflectirPrompt = () => {
    setPromptPreenchido(promptDoDia)
    setShowCriarReflexao(true)
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-2xl animate-pulse">
          🌊
        </div>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A fluir para o rio...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>

      {/* ───── Header ───── */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100/60">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between p-4 pb-2">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                O Rio
              </h1>
              <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                Reflexões que fluem entre nós
              </p>
            </div>

            {/* Avatar button */}
            <button
              onClick={() => navigate(`/comunidade/jornada/${userId}`)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              {perfil?.avatar_emoji || '🌸'}
            </button>
          </div>

          {/* ───── Eco filter tabs ───── */}
          <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => { setFiltroEco(null); setFiltroTema(null) }}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                !filtroEco
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              style={!filtroEco ? { backgroundColor: '#8B5CF6' } : {}}
            >
              Todas
            </button>

            <div className="w-px h-4 bg-gray-200 mx-0.5 flex-shrink-0" />

            {ECOS_FILTRO.map(eco => {
              const info = ECOS_INFO[eco]
              if (!info) return null
              return (
                <button
                  key={eco}
                  onClick={() => handleFiltroEco(eco)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                    filtroEco === eco
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={filtroEco === eco ? { backgroundColor: info.cor } : {}}
                >
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                </button>
              )
            })}
          </div>

          {/* ───── Tema filter pills ───── */}
          <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
            {Object.entries(TEMAS_REFLEXAO).map(([key, tema]) => (
              <button
                key={key}
                onClick={() => handleFiltroTema(key)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                  filtroTema === key
                    ? 'text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                style={
                  filtroTema === key
                    ? { backgroundColor: tema.cor }
                    : { backgroundColor: tema.cor + '12' }
                }
              >
                {tema.emoji} {tema.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ───── Feed content ───── */}
      <div className="max-w-lg mx-auto px-4 pt-4">

        {/* ───── Prompt do Dia ───── */}
        {promptDoDia && (
          <div className="mb-5 p-5 rounded-3xl border border-purple-100/60"
            style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)' }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">{promptDoDia.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider mb-1.5"
                  style={{ color: '#8B5CF6', fontFamily: 'var(--font-titulos)' }}>
                  Prompt do Dia
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-3"
                  style={{ fontFamily: 'var(--font-corpo)' }}>
                  {promptDoDia.texto}
                </p>
                <button
                  onClick={handleReflectirPrompt}
                  className="text-xs font-semibold px-4 py-2 rounded-full text-white transition-all hover:shadow-md active:scale-95"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  Reflectir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ───── Posts / Reflexoes ───── */}
        {posts.length === 0 && !loadingMore ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🌱</span>
            <h3 className="text-lg font-semibold text-gray-600 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              O rio está quieto...
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
              Sê a primeira a deixar fluir uma reflexão
            </p>
            <button
              onClick={() => setShowCriarReflexao(true)}
              className="mt-6 text-sm font-medium px-5 py-2.5 rounded-full text-white transition-all hover:shadow-md active:scale-95"
              style={{ backgroundColor: '#8B5CF6' }}
            >
              Criar reflexão
            </button>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <ReflexaoCard
                key={post.id}
                post={post}
                userId={userId}
                ressoou={ressonanciaMap[post.id] || false}
                onPerfilClick={(uid) => navigate(`/comunidade/jornada/${uid}`)}
                onPostDeleted={handlePostDeleted}
              />
            ))}

            {/* Carregar mais */}
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={handleCarregarMais}
                  disabled={loadingMore}
                  className="text-sm font-medium px-6 py-2.5 rounded-full transition-all hover:shadow-sm active:scale-95"
                  style={{
                    color: '#8B5CF6',
                    backgroundColor: '#8B5CF610'
                  }}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                      A fluir...
                    </span>
                  ) : (
                    'Deixar fluir mais'
                  )}
                </button>
              </div>
            )}

            {/* End of river */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <span className="text-2xl block mb-2">🌊</span>
                <p className="text-xs text-gray-300" style={{ fontFamily: 'var(--font-corpo)' }}>
                  Chegaste ao remanso do rio
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ───── FAB — Criar reflexao ───── */}
      <button
        onClick={() => { setPromptPreenchido(null); setShowCriarReflexao(true) }}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center z-40 transition-all hover:shadow-xl active:scale-95"
        style={{
          backgroundColor: '#8B5CF6',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)'
        }}
        aria-label="Criar reflexão"
      >
        <span className="text-xl" style={{ fontFamily: 'var(--font-titulos)' }}>&#10022;</span>
      </button>

      {/* ───── Modal: Criar Reflexao ───── */}
      {showCriarReflexao && (
        <CriarReflexao
          userId={userId}
          prompt={promptPreenchido}
          onReflexaoCriada={handleReflexaoCriada}
          onFechar={() => { setShowCriarReflexao(false); setPromptPreenchido(null) }}
        />
      )}

      {/* ───── Modal: Editar Jornada (first visit) ───── */}
      {showEditarJornada && (
        <EditarJornada
          userId={userId}
          perfil={perfil}
          onPerfilAtualizado={handlePerfilAtualizado}
          onFechar={() => setShowEditarJornada(false)}
        />
      )}
    </div>
  )
}
