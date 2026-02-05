import React, { useState } from 'react'
import { TIPOS_POST, ECOS_INFO, tempoRelativo, toggleLike, getComentarios, criarComentario } from '../../lib/comunidade'

export default function PostCard({ post, userId, onPerfilClick, onPostDeleted, liked: initialLiked = false }) {
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [showComentarios, setShowComentarios] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [novoComentario, setNovoComentario] = useState('')
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [enviandoComentario, setEnviandoComentario] = useState(false)

  const perfil = post.community_profiles
  const tipoInfo = TIPOS_POST[post.tipo] || TIPOS_POST.progresso
  const ecoInfo = post.eco ? ECOS_INFO[post.eco] : null
  const isOwner = post.user_id === userId

  const handleLike = async () => {
    try {
      const novoEstado = await toggleLike(post.id, userId)
      setLiked(novoEstado)
      setLikesCount(prev => novoEstado ? prev + 1 : prev - 1)
    } catch (error) {
      console.error('Erro ao dar like:', error)
    }
  }

  const handleToggleComentarios = async () => {
    if (!showComentarios) {
      setLoadingComentarios(true)
      try {
        const data = await getComentarios(post.id)
        setComentarios(data)
      } catch (error) {
        console.error('Erro ao carregar comentários:', error)
      }
      setLoadingComentarios(false)
    }
    setShowComentarios(!showComentarios)
  }

  const handleEnviarComentario = async (e) => {
    e.preventDefault()
    if (!novoComentario.trim() || enviandoComentario) return

    setEnviandoComentario(true)
    try {
      const comentario = await criarComentario(post.id, userId, novoComentario.trim())
      setComentarios(prev => [...prev, {
        ...comentario,
        community_profiles: { display_name: 'Tu', avatar_emoji: '🌸' }
      }])
      setCommentsCount(prev => prev + 1)
      setNovoComentario('')
    } catch (error) {
      console.error('Erro ao enviar comentário:', error)
    }
    setEnviandoComentario(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <button
          onClick={() => onPerfilClick?.(post.user_id)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl">
            {perfil?.avatar_emoji || '🌸'}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-800">
              {perfil?.display_name || 'Utilizadora'}
            </p>
            <p className="text-xs text-gray-400">{tempoRelativo(post.created_at)}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Eco badge */}
          {ecoInfo && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: ecoInfo.cor + '20', color: ecoInfo.cor }}
            >
              {ecoInfo.emoji} {ecoInfo.label}
            </span>
          )}
          {/* Tipo badge */}
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: tipoInfo.cor + '20', color: tipoInfo.cor }}
          >
            {tipoInfo.emoji} {tipoInfo.label}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-2">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {post.conteudo}
        </p>
      </div>

      {/* Ecos activos do autor */}
      {perfil?.ecos_activos?.length > 0 && (
        <div className="px-4 pb-2 flex gap-1">
          {perfil.ecos_activos.map(eco => {
            const info = ECOS_INFO[eco]
            return info ? (
              <span key={eco} className="text-xs opacity-50" title={info.label}>
                {info.emoji}
              </span>
            ) : null
          })}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span className={`text-lg transition-transform ${liked ? 'scale-110' : ''}`}>
              {liked ? '❤️' : '🤍'}
            </span>
            <span className={`text-xs font-medium ${liked ? 'text-red-500' : 'text-gray-400'}`}>
              {likesCount}
            </span>
          </button>

          {/* Comentários */}
          <button
            onClick={handleToggleComentarios}
            className="flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span className="text-lg">💬</span>
            <span className="text-xs font-medium text-gray-400">{commentsCount}</span>
          </button>
        </div>

        {/* Apagar (só para o autor) */}
        {isOwner && (
          <button
            onClick={() => onPostDeleted?.(post.id)}
            className="text-xs text-gray-300 hover:text-red-400 transition-colors"
          >
            Apagar
          </button>
        )}
      </div>

      {/* Secção de comentários */}
      {showComentarios && (
        <div className="border-t border-gray-50 bg-gray-50/50">
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {loadingComentarios ? (
              <p className="text-center text-gray-400 text-sm py-2">A carregar...</p>
            ) : comentarios.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-2">
                Sê a primeira a comentar
              </p>
            ) : (
              comentarios.map(c => (
                <div key={c.id} className="flex gap-2">
                  <span className="text-sm flex-shrink-0">
                    {c.community_profiles?.avatar_emoji || '🌸'}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-gray-600">
                      {c.community_profiles?.display_name || 'Utilizadora'}
                    </span>
                    <p className="text-xs text-gray-600 leading-relaxed">{c.conteudo}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Formulário de comentário */}
          <form onSubmit={handleEnviarComentario} className="flex gap-2 p-3 border-t border-gray-100">
            <input
              type="text"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Escreve um comentário..."
              className="flex-1 text-sm py-2 px-3 rounded-full border border-gray-200 focus:border-purple-300 focus:ring-0"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!novoComentario.trim() || enviandoComentario}
              className="text-sm font-semibold px-3 py-2 rounded-full transition-all disabled:opacity-30"
              style={{ color: '#8B5CF6' }}
            >
              {enviandoComentario ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
