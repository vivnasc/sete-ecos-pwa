import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  getFeed,
  getFeedSeguidos,
  getFeedPorEco,
  getPerfilPublico,
  upsertPerfilPublico,
  verificarLikesBatch,
  apagarPost,
  ECOS_INFO
} from '../../lib/comunidade'
import PostCard from './PostCard'
import CriarPost from './CriarPost'
import EditarPerfil from './EditarPerfil'

export default function FeedComunidade() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [posts, setPosts] = useState([])
  const [likesMap, setLikesMap] = useState({})
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // UI state
  const [showCriarPost, setShowCriarPost] = useState(false)
  const [showEditarPerfil, setShowEditarPerfil] = useState(false)
  const [tab, setTab] = useState('todos') // 'todos', 'seguindo', eco key
  const [filtroEco, setFiltroEco] = useState(null)

  useEffect(() => {
    inicializar()
  }, [])

  useEffect(() => {
    if (userId) {
      setPosts([])
      setPage(0)
      setHasMore(true)
      carregarFeed(0, true)
    }
  }, [tab, filtroEco])

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

        // Carregar perfil público
        const perfilData = await getPerfilPublico(userData.id)
        if (perfilData) {
          setPerfil(perfilData)
        } else {
          // Criar perfil automaticamente com dados básicos
          const nome = user.email.split('@')[0]
          const novoPerfil = await upsertPerfilPublico(userData.id, {
            display_name: nome.charAt(0).toUpperCase() + nome.slice(1),
            bio: '',
            avatar_emoji: '🌸',
            ecos_activos: []
          })
          setPerfil(novoPerfil)
          setShowEditarPerfil(true)
        }

        // Carregar feed
        await carregarFeed(0, true, userData.id)
      }
    } catch (error) {
      console.error('Erro ao inicializar comunidade:', error)
    }
    setLoading(false)
  }

  const carregarFeed = async (pageNum = 0, reset = false, uid = userId) => {
    if (!uid) return
    setLoadingMore(true)
    try {
      let data
      if (filtroEco) {
        data = await getFeedPorEco(filtroEco, pageNum)
      } else if (tab === 'seguindo') {
        data = await getFeedSeguidos(uid, pageNum)
      } else {
        data = await getFeed(pageNum)
      }

      if (data.length < 20) setHasMore(false)

      // Verificar likes em batch
      const postIds = data.map(p => p.id)
      const likes = await verificarLikesBatch(postIds, uid)

      if (reset) {
        setPosts(data)
        setLikesMap(likes)
      } else {
        setPosts(prev => [...prev, ...data])
        setLikesMap(prev => ({ ...prev, ...likes }))
      }
      setPage(pageNum)
    } catch (error) {
      console.error('Erro ao carregar feed:', error)
    }
    setLoadingMore(false)
  }

  const handlePostCriado = (novoPost) => {
    // Adicionar ao topo com dados do perfil
    const postComPerfil = {
      ...novoPost,
      community_profiles: perfil ? {
        display_name: perfil.display_name,
        avatar_emoji: perfil.avatar_emoji,
        ecos_activos: perfil.ecos_activos
      } : null
    }
    setPosts(prev => [postComPerfil, ...prev])
  }

  const handlePostDeleted = async (postId) => {
    try {
      await apagarPost(postId, userId)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (error) {
      console.error('Erro ao apagar post:', error)
    }
  }

  const handlePerfilAtualizado = (novoPerfil) => {
    setPerfil(novoPerfil)
  }

  const handleCarregarMais = () => {
    if (!loadingMore && hasMore) {
      carregarFeed(page + 1)
    }
  }

  const handleFiltroEco = (eco) => {
    if (filtroEco === eco) {
      setFiltroEco(null)
    } else {
      setFiltroEco(eco)
      setTab('todos')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl animate-pulse-subtle">
          🌸
        </div>
        <p className="text-gray-400" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A entrar na comunidade...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                Comunidade
              </h1>
              <p className="text-xs text-gray-400">Partilha, inspira e cresce em conjunto</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Meu perfil */}
              <button
                onClick={() => navigate(`/comunidade/perfil/${userId}`)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg"
              >
                {perfil?.avatar_emoji || '🌸'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pb-3">
            <button
              onClick={() => { setTab('todos'); setFiltroEco(null) }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                tab === 'todos' && !filtroEco
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => { setTab('seguindo'); setFiltroEco(null) }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                tab === 'seguindo'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              A seguir
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            {['vitalis', 'aurea', 'lumina'].map(eco => {
              const info = ECOS_INFO[eco]
              return (
                <button
                  key={eco}
                  onClick={() => handleFiltroEco(eco)}
                  className={`text-xs px-2.5 py-1.5 rounded-full font-medium transition-all ${
                    filtroEco === eco
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  style={filtroEco === eco ? { backgroundColor: info.cor } : {}}
                >
                  {info.emoji}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Prompt de perfil incompleto */}
        {perfil && !perfil.bio && (
          <button
            onClick={() => setShowEditarPerfil(true)}
            className="w-full mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 text-left transition-all hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{perfil.avatar_emoji || '🌸'}</span>
              <div>
                <p className="text-sm font-semibold text-gray-700">Completa o teu perfil</p>
                <p className="text-xs text-gray-400">Adiciona uma bio e escolhe os teus Ecos</p>
              </div>
              <svg className="w-5 h-5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        )}

        {/* Posts */}
        {posts.length === 0 && !loadingMore ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🌿</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              {tab === 'seguindo' ? 'Segue alguém para ver partilhas aqui' : 'A comunidade está a começar'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {tab === 'seguindo'
                ? 'Explora o feed geral para encontrar pessoas inspiradoras'
                : 'Sê a primeira a partilhar algo com a comunidade!'
              }
            </p>
            {tab === 'seguindo' && (
              <button
                onClick={() => { setTab('todos'); setFiltroEco(null) }}
                className="text-sm font-medium px-4 py-2 rounded-full text-white"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                Ver feed geral
              </button>
            )}
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                userId={userId}
                liked={likesMap[post.id] || false}
                onPerfilClick={(uid) => navigate(`/comunidade/perfil/${uid}`)}
                onPostDeleted={handlePostDeleted}
              />
            ))}

            {/* Carregar mais */}
            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={handleCarregarMais}
                  disabled={loadingMore}
                  className="text-sm text-purple-500 font-medium hover:text-purple-700 transition-colors"
                >
                  {loadingMore ? 'A carregar...' : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB — Criar post */}
      <button
        onClick={() => setShowCriarPost(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center text-2xl z-40 transition-all hover:shadow-xl active:scale-95"
        style={{ backgroundColor: '#8B5CF6' }}
      >
        +
      </button>

      {/* Modais */}
      {showCriarPost && (
        <CriarPost
          userId={userId}
          onPostCriado={handlePostCriado}
          onFechar={() => setShowCriarPost(false)}
        />
      )}

      {showEditarPerfil && (
        <EditarPerfil
          userId={userId}
          perfil={perfil}
          onPerfilAtualizado={handlePerfilAtualizado}
          onFechar={() => setShowEditarPerfil(false)}
        />
      )}
    </div>
  )
}
