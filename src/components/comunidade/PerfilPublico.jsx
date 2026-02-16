import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  getPerfilPublico,
  getPostsDoUtilizador,
  contarSeguidoresESeguindo,
  verificarSeguindo,
  seguirUtilizador,
  deixarDeSeguir,
  ECOS_INFO
} from '../../lib/comunidade'
import { isGhostUser, getGhostProfile, getGhostPostsForRange } from '../../lib/ghost-users'
import PostCard from './PostCard'

export default function PerfilPublico() {
  const { userId: perfilUserId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [meusId, setMeusId] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [posts, setPosts] = useState([])
  const [contadores, setContadores] = useState({ seguidores: 0, seguindo: 0 })
  const [estouSeguindo, setEstouSeguindo] = useState(false)
  const [acaoEmCurso, setAcaoEmCurso] = useState(false)

  const isOwnProfile = meusId === perfilUserId

  useEffect(() => {
    carregarDados()
  }, [perfilUserId])

  const carregarDados = async () => {
    setLoading(true)
    try {
      // Obter ID do utilizador autenticado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (userData) {
        setMeusId(userData.id)

        // Check if this is a ghost user
        if (isGhostUser(perfilUserId)) {
          const ghostPerfil = getGhostProfile(perfilUserId)
          setPerfil(ghostPerfil)
          // Get ghost posts that belong to this user
          const allGhostPosts = getGhostPostsForRange(30)
          const ghostUserPosts = allGhostPosts.filter(p => p.user_id === perfilUserId)
          setPosts(ghostUserPosts)
          setContadores({ seguidores: Math.floor(Math.random() * 8) + 3, seguindo: Math.floor(Math.random() * 5) + 1 })
          setEstouSeguindo(false)
        } else {
          // Carregar dados em paralelo
          const [perfilData, postsData, contadoresData, seguindoData] = await Promise.all([
            getPerfilPublico(perfilUserId),
            getPostsDoUtilizador(perfilUserId),
            contarSeguidoresESeguindo(perfilUserId),
            verificarSeguindo(userData.id, perfilUserId)
          ])

          setPerfil(perfilData)
          setPosts(postsData)
          setContadores(contadoresData)
          setEstouSeguindo(seguindoData)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
    setLoading(false)
  }

  const isGhost = isGhostUser(perfilUserId)

  const handleToggleSeguir = async () => {
    if (acaoEmCurso || isOwnProfile || isGhost) return
    setAcaoEmCurso(true)
    try {
      if (estouSeguindo) {
        await deixarDeSeguir(meusId, perfilUserId)
        setEstouSeguindo(false)
        setContadores(prev => ({ ...prev, seguidores: prev.seguidores - 1 }))
      } else {
        await seguirUtilizador(meusId, perfilUserId)
        setEstouSeguindo(true)
        setContadores(prev => ({ ...prev, seguidores: prev.seguidores + 1 }))
      }
    } catch (error) {
      console.error('Erro ao seguir/desseguir:', error)
    }
    setAcaoEmCurso(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A carregar perfil...
        </p>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-5xl">🌸</span>
        <p className="text-gray-500 text-center">Este perfil ainda não está configurado.</p>
        <button
          onClick={() => navigate('/comunidade')}
          className="text-sm font-medium px-4 py-2 rounded-full"
          style={{ color: '#8B5CF6' }}
        >
          Voltar ao Feed
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
      {/* Header com voltar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
            {perfil.display_name}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Perfil card */}
        <div className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl mx-auto mb-3">
            {perfil.avatar_emoji || '🌸'}
          </div>
          <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
            {perfil.display_name}
          </h2>
          {perfil.bio && (
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{perfil.bio}</p>
          )}

          {/* Ecos activos */}
          {perfil.ecos_activos?.length > 0 && (
            <div className="flex justify-center gap-2 mt-3">
              {perfil.ecos_activos.map(eco => {
                const info = ECOS_INFO[eco]
                return info ? (
                  <span
                    key={eco}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: info.cor + '20', color: info.cor }}
                  >
                    {info.emoji} {info.label}
                  </span>
                ) : null
              })}
            </div>
          )}

          {/* Contadores */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{posts.length}</p>
              <p className="text-xs text-gray-400">Partilhas</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{contadores.seguidores}</p>
              <p className="text-xs text-gray-400">Seguidoras</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{contadores.seguindo}</p>
              <p className="text-xs text-gray-400">A seguir</p>
            </div>
          </div>

          {/* Botão seguir */}
          {!isOwnProfile && (
            <button
              onClick={handleToggleSeguir}
              disabled={acaoEmCurso}
              className={`mt-4 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                estouSeguindo
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'text-white shadow-md hover:shadow-lg'
              }`}
              style={!estouSeguindo ? { backgroundColor: '#8B5CF6' } : {}}
            >
              {acaoEmCurso ? '...' : estouSeguindo ? 'A seguir' : 'Seguir'}
            </button>
          )}
        </div>

        {/* Posts do utilizador */}
        <div className="px-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Partilhas
          </h3>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-3xl block mb-2">📝</span>
              <p className="text-sm text-gray-400">Ainda sem partilhas</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                userId={meusId}
                onPerfilClick={() => {}}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
