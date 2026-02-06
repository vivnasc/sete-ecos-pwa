import React, { useState } from 'react'
import {
  TIPOS_POST, ECOS_INFO, REACTIONS, tempoRelativo,
  toggleLike, toggleBookmark, toggleReaction,
  getComentarios, criarComentario, criarNotificacao
} from '../../lib/comunidade'

export default function PostCard({
  post, userId, onPerfilClick, onPostDeleted,
  liked: initialLiked = false, saved: initialSaved = false,
  myReaction: initialReaction = null
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [saved, setSaved] = useState(initialSaved)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [showComentarios, setShowComentarios] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [novoComentario, setNovoComentario] = useState('')
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [myReaction, setMyReaction] = useState(initialReaction)
  const [imagemExpandida, setImagemExpandida] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [doubleTapLike, setDoubleTapLike] = useState(false)

  const perfil = post.community_profiles
  const tipoInfo = TIPOS_POST[post.tipo] || TIPOS_POST.progresso
  const ecoInfo = post.eco ? ECOS_INFO[post.eco] : null
  const isOwner = post.user_id === userId

  // Double-tap to like
  let lastTap = 0
  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTap < 300) {
      if (!liked) handleLike()
      setDoubleTapLike(true)
      setTimeout(() => setDoubleTapLike(false), 1000)
    }
    lastTap = now
  }

  const handleLike = async () => {
    try {
      const novoEstado = await toggleLike(post.id, userId)
      setLiked(novoEstado)
      setLikesCount(prev => novoEstado ? prev + 1 : prev - 1)
      if (novoEstado && post.user_id !== userId) {
        criarNotificacao(post.user_id, userId, 'like', post.id)
      }
    } catch (error) {
      console.error('Erro ao dar like:', error)
    }
  }

  const handleBookmark = async () => {
    try {
      const novoEstado = await toggleBookmark(post.id, userId)
      setSaved(novoEstado)
    } catch (error) {
      console.error('Erro ao guardar:', error)
    }
  }

  const handleReaction = async (type) => {
    try {
      const result = await toggleReaction(post.id, userId, type)
      setMyReaction(result)
      setShowReactions(false)
    } catch (error) {
      console.error('Erro na reação:', error)
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
      if (post.user_id !== userId) {
        criarNotificacao(post.user_id, userId, 'comment', post.id, novoComentario.trim().slice(0, 50))
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error)
    }
    setEnviandoComentario(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Partilha de ${perfil?.display_name || 'SETE ECOS'}`,
          text: post.conteudo?.slice(0, 100),
          url: window.location.origin + '/comunidade'
        })
      } catch {}
    }
  }

  const renderAvatar = (p, size = 'w-10 h-10', textSize = 'text-xl') => {
    if (p?.avatar_url) {
      return <img src={p.avatar_url} alt="" className={`${size} rounded-full object-cover`} />
    }
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center ${textSize}`}>
        {p?.avatar_emoji || '🌸'}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <button
          onClick={() => onPerfilClick?.(post.user_id)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {renderAvatar(perfil)}
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-800">
              {perfil?.display_name || 'Utilizadora'}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-gray-400">{tempoRelativo(post.created_at)}</p>
              {ecoInfo && (
                <span className="text-xs" style={{ color: ecoInfo.cor }}>
                  {ecoInfo.emoji}
                </span>
              )}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: tipoInfo.cor + '15', color: tipoInfo.cor }}
          >
            {tipoInfo.emoji} {tipoInfo.label}
          </span>
          {/* Menu */}
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-300 hover:text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[140px] animate-fadeIn">
                <button onClick={handleShare} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Partilhar
                </button>
                {isOwner && (
                  <button
                    onClick={() => { setShowMenu(false); onPostDeleted?.(post.id) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Apagar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Imagem do post */}
      {post.imagem_url && (
        <div className="relative" onClick={handleDoubleTap}>
          <img
            src={post.imagem_url}
            alt=""
            className={`w-full object-cover ${imagemExpandida ? 'max-h-[80vh]' : 'max-h-[400px]'} cursor-pointer transition-all`}
            onClick={() => setImagemExpandida(!imagemExpandida)}
          />
          {/* Double-tap heart animation */}
          {doubleTapLike && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-7xl animate-bounceIn opacity-90">❤️</span>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo texto */}
      {post.conteudo && (
        <div className="px-4 py-2">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {post.conteudo.split(/(#[\wÀ-ÿ]+)/g).map((part, i) =>
              part.startsWith('#') ? (
                <span key={i} className="font-semibold" style={{ color: '#8B5CF6' }}>{part}</span>
              ) : part
            )}
          </p>
        </div>
      )}

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div className="px-4 pb-1 flex flex-wrap gap-1">
          {post.hashtags.map(tag => (
            <span key={tag} className="text-xs font-medium" style={{ color: '#8B5CF6' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reactions inline */}
      {myReaction && (
        <div className="px-4 pb-1">
          <span className="text-sm">{REACTIONS[myReaction]?.emoji}</span>
        </div>
      )}

      {/* Actions bar - Instagram style */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          {/* Like */}
          <button onClick={handleLike} className="transition-all active:scale-90">
            {liked ? (
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </button>

          {/* Comment */}
          <button onClick={handleToggleComentarios} className="transition-all active:scale-90">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Share */}
          <button onClick={handleShare} className="transition-all active:scale-90">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>

          {/* Reactions trigger */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="transition-all active:scale-90"
            >
              <span className="text-lg">{myReaction ? REACTIONS[myReaction].emoji : '😊'}</span>
            </button>
            {showReactions && (
              <div className="absolute bottom-8 left-0 bg-white rounded-full shadow-lg border border-gray-100 px-2 py-1 flex gap-1 z-20 animate-fadeIn">
                {Object.entries(REACTIONS).map(([key, { emoji }]) => (
                  <button
                    key={key}
                    onClick={() => handleReaction(key)}
                    className={`text-xl p-1 hover:scale-125 transition-transform ${myReaction === key ? 'scale-125' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bookmark */}
        <button onClick={handleBookmark} className="transition-all active:scale-90">
          {saved ? (
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
        </button>
      </div>

      {/* Likes count */}
      <div className="px-4 pb-2">
        {likesCount > 0 && (
          <p className="text-xs font-semibold text-gray-800">
            {likesCount} {likesCount === 1 ? 'gosto' : 'gostos'}
          </p>
        )}
      </div>

      {/* Comentários */}
      {showComentarios && (
        <div className="border-t border-gray-50 bg-gray-50/50">
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {loadingComentarios ? (
              <p className="text-center text-gray-400 text-sm py-2">A carregar...</p>
            ) : comentarios.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-2">Sê a primeira a comentar</p>
            ) : (
              comentarios.map(c => (
                <div key={c.id} className="flex gap-2.5">
                  {renderAvatar(c.community_profiles, 'w-7 h-7', 'text-sm')}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <button
                        onClick={() => onPerfilClick?.(c.community_profiles?.user_id)}
                        className="text-xs font-bold text-gray-800 hover:underline"
                      >
                        {c.community_profiles?.display_name || 'Utilizadora'}
                      </button>
                      <span className="text-xs text-gray-300">{tempoRelativo(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{c.conteudo}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleEnviarComentario} className="flex gap-2 p-3 border-t border-gray-100">
            <input
              type="text"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Adiciona um comentário..."
              className="flex-1 text-sm py-2 px-3 rounded-full border border-gray-200 focus:border-purple-300 focus:ring-0"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!novoComentario.trim() || enviandoComentario}
              className="text-sm font-bold px-3 rounded-full transition-all disabled:opacity-30"
              style={{ color: '#8B5CF6' }}
            >
              {enviandoComentario ? '...' : 'Publicar'}
            </button>
          </form>
        </div>
      )}

      {/* Click overlay to close menu/reactions */}
      {(showMenu || showReactions) && (
        <div className="fixed inset-0 z-10" onClick={() => { setShowMenu(false); setShowReactions(false) }} />
      )}
    </div>
  )
}
