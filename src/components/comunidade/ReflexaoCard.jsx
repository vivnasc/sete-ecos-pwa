import React, { useState } from 'react'
import {
  TEMAS_REFLEXAO,
  ECOS_INFO,
  RESSONANCIA_TIPOS,
  ESPELHO_STARTERS,
  PROMPTS_REFLEXAO,
  tempoRelativo,
  darRessonancia,
  getEspelhos,
  criarEspelho,
  criarNotificacao
} from '../../lib/comunidade'

const RESSONANCIA_KEYS = Object.keys(RESSONANCIA_TIPOS)

export default function ReflexaoCard({
  post,
  userId,
  onPerfilClick,
  onPostDeleted,
  ressoou: initialRessoou = false
}) {
  const [ressoou, setRessoou] = useState(initialRessoou)
  const [ressonanciaActiva, setRessonanciaActiva] = useState(null)
  const [ressonanciaCount, setRessonanciaCount] = useState(post.ressonancia_count || post.likes_count || 0)

  const [showEspelhos, setShowEspelhos] = useState(false)
  const [espelhos, setEspelhos] = useState([])
  const [loadingEspelhos, setLoadingEspelhos] = useState(false)
  const [novoEspelho, setNovoEspelho] = useState('')
  const [enviandoEspelho, setEnviandoEspelho] = useState(false)
  const [espelhosCount, setEspelhosCount] = useState(post.comments_count || 0)

  const [showMenu, setShowMenu] = useState(false)
  const [imagemExpandida, setImagemExpandida] = useState(false)

  const perfil = post.community_profiles
  const temaInfo = TEMAS_REFLEXAO[post.tipo] || TEMAS_REFLEXAO.livre
  const ecoInfo = post.eco ? ECOS_INFO[post.eco] : null
  const isOwner = post.user_id === userId
  const isAnonymous = post.is_anonymous

  // Find the prompt that inspired this reflexao
  const promptOrigem = post.prompt_id
    ? PROMPTS_REFLEXAO.find(p => p.id === post.prompt_id)
    : null

  // ───── Ressonancia ─────

  const handleRessonancia = async (tipo) => {
    try {
      const resultado = await darRessonancia(post.id, userId, tipo)
      if (resultado) {
        // Gave resonance
        setRessoou(true)
        setRessonanciaActiva(tipo)
        setRessonanciaCount(prev => prev + 1)
        // Notify post author
        if (post.user_id !== userId) {
          criarNotificacao(
            post.user_id,
            userId,
            'ressonancia',
            post.id,
            RESSONANCIA_TIPOS[tipo]?.label || ''
          )
        }
      } else {
        // Removed resonance
        setRessoou(false)
        setRessonanciaActiva(null)
        setRessonanciaCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro na ressonancia:', error)
    }
  }

  // ───── Espelhos ─────

  const handleToggleEspelhos = async () => {
    if (!showEspelhos) {
      setLoadingEspelhos(true)
      try {
        const data = await getEspelhos(post.id)
        setEspelhos(data)
      } catch (error) {
        console.error('Erro ao carregar espelhos:', error)
      }
      setLoadingEspelhos(false)
    }
    setShowEspelhos(!showEspelhos)
  }

  const handleEnviarEspelho = async (e) => {
    e.preventDefault()
    if (!novoEspelho.trim() || enviandoEspelho) return
    setEnviandoEspelho(true)
    try {
      const espelho = await criarEspelho(post.id, userId, novoEspelho.trim())
      setEspelhos(prev => [...prev, {
        ...espelho,
        community_profiles: {
          user_id: userId,
          display_name: 'Tu',
          avatar_emoji: '🌸'
        }
      }])
      setEspelhosCount(prev => prev + 1)
      setNovoEspelho('')
      if (post.user_id !== userId) {
        criarNotificacao(
          post.user_id,
          userId,
          'espelho',
          post.id,
          novoEspelho.trim().slice(0, 50)
        )
      }
    } catch (error) {
      console.error('Erro ao enviar espelho:', error)
    }
    setEnviandoEspelho(false)
  }

  const handleStarterClick = (starter) => {
    setNovoEspelho(starter + ' ')
  }

  // ───── Share ─────

  const handleShare = async () => {
    setShowMenu(false)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reflexão — SETE ECOS',
          text: post.conteudo?.slice(0, 120),
          url: window.location.origin + '/comunidade'
        })
      } catch { /* cancelled */ }
    }
  }

  // ───── Avatar render ─────

  const renderAvatar = (p, size = 'w-10 h-10', textSize = 'text-xl') => {
    if (isAnonymous && p === perfil) {
      return (
        <div className={`${size} rounded-full bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center ${textSize}`}>
          🌸
        </div>
      )
    }
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">

      {/* ───── Header ───── */}
      <div className="flex items-center justify-between p-4 pb-2">
        <button
          onClick={() => !isAnonymous && onPerfilClick?.(post.user_id)}
          className={`flex items-center gap-3 ${isAnonymous ? 'cursor-default' : 'hover:opacity-80'} transition-opacity`}
          disabled={isAnonymous}
        >
          {renderAvatar(perfil)}
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-800" style={{ fontFamily: 'var(--font-corpo)' }}>
              {isAnonymous ? 'Alma Anónima' : (perfil?.display_name || 'Utilizadora')}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{tempoRelativo(post.created_at)}</span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Tema badge */}
          {temaInfo && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: temaInfo.cor + '15', color: temaInfo.cor }}
            >
              {temaInfo.emoji} {temaInfo.label}
            </span>
          )}
          {/* Eco badge */}
          {ecoInfo && (
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ backgroundColor: ecoInfo.cor + '15', color: ecoInfo.cor }}
            >
              {ecoInfo.emoji}
            </span>
          )}

          {/* Menu (owner only) */}
          {isOwner && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-300 hover:text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
                  <button onClick={handleShare} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    Partilhar
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onPostDeleted?.(post.id) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Apagar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ───── Prompt origin (if from a guided prompt) ───── */}
      {promptOrigem && (
        <div className="px-4 pb-1">
          <p className="text-xs italic text-purple-400" style={{ fontFamily: 'var(--font-corpo)' }}>
            "{promptOrigem.texto}"
          </p>
        </div>
      )}

      {/* ───── Content ───── */}
      {post.conteudo && (
        <div className="px-4 py-2">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'var(--font-corpo)' }}>
            {post.conteudo}
          </p>
        </div>
      )}

      {/* ───── Image ───── */}
      {post.imagem_url && (
        <div className="px-4 pb-2">
          <img
            src={post.imagem_url}
            alt=""
            className={`w-full rounded-xl object-cover cursor-pointer transition-all ${
              imagemExpandida ? 'max-h-[80vh]' : 'max-h-[320px]'
            }`}
            onClick={() => setImagemExpandida(!imagemExpandida)}
          />
        </div>
      )}

      {/* ───── Ressonancia bar + Espelhos toggle ───── */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50">
        {/* Ressonancia types */}
        <div className="flex items-center gap-1">
          {RESSONANCIA_KEYS.map(tipo => {
            const info = RESSONANCIA_TIPOS[tipo]
            const isActive = ressonanciaActiva === tipo
            return (
              <button
                key={tipo}
                onClick={() => handleRessonancia(tipo)}
                className={`text-lg p-1.5 rounded-full transition-all active:scale-110 ${
                  isActive
                    ? 'bg-purple-100 scale-110 ring-2 ring-purple-200'
                    : 'hover:bg-gray-50'
                }`}
                title={info.label}
                aria-label={info.label}
              >
                {info.emoji}
              </button>
            )
          })}
        </div>

        {/* Espelhos button */}
        <button
          onClick={handleToggleEspelhos}
          className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
            showEspelhos
              ? 'bg-purple-100 text-purple-600'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          Espelhos{espelhosCount > 0 ? ` (${espelhosCount})` : ''}
        </button>
      </div>

      {/* Ressonancia count */}
      {ressonanciaCount > 0 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400">
            {ressonanciaCount} {ressonanciaCount === 1 ? 'ressonância' : 'ressonâncias'}
          </p>
        </div>
      )}

      {/* ───── Espelhos section ───── */}
      {showEspelhos && (
        <div className="border-t border-gray-50 bg-gray-50/30">
          {/* Espelhos list */}
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {loadingEspelhos ? (
              <div className="text-center py-3">
                <span className="text-sm text-gray-400">A carregar espelhos...</span>
              </div>
            ) : espelhos.length === 0 ? (
              <div className="text-center py-3">
                <span className="text-sm text-gray-400">Sê a primeira a espelhar esta reflexão</span>
              </div>
            ) : (
              espelhos.map(e => (
                <div key={e.id} className="flex gap-2.5">
                  {renderAvatar(e.community_profiles, 'w-7 h-7', 'text-sm')}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <button
                        onClick={() => onPerfilClick?.(e.community_profiles?.user_id)}
                        className="text-xs font-bold text-gray-700 hover:underline"
                      >
                        {e.community_profiles?.display_name || 'Utilizadora'}
                      </button>
                      <span className="text-xs text-gray-300">{tempoRelativo(e.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
                      {e.conteudo}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Espelho starters */}
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {ESPELHO_STARTERS.map((starter, i) => (
              <button
                key={i}
                onClick={() => handleStarterClick(starter)}
                className="text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-500 whitespace-nowrap transition-all hover:bg-purple-100 active:scale-95 flex-shrink-0"
              >
                {starter}
              </button>
            ))}
          </div>

          {/* Espelho input */}
          <form onSubmit={handleEnviarEspelho} className="flex gap-2 p-3 border-t border-gray-100">
            <input
              type="text"
              value={novoEspelho}
              onChange={(e) => setNovoEspelho(e.target.value)}
              placeholder="Espelha esta reflexão..."
              className="flex-1 text-sm py-2 px-3 rounded-full border border-gray-200 focus:border-purple-300 focus:outline-none"
              style={{ fontFamily: 'var(--font-corpo)' }}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!novoEspelho.trim() || enviandoEspelho}
              className="text-sm font-bold px-3 rounded-full transition-all disabled:opacity-30"
              style={{ color: '#8B5CF6' }}
            >
              {enviandoEspelho ? '...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}

      {/* Click overlay to close menu */}
      {showMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
      )}
    </div>
  )
}
