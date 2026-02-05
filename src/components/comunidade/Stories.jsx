import React, { useState, useEffect, useRef, useCallback } from 'react'
import { criarStory, getStoriesAtivos, marcarStoryVista, uploadImagem, STORY_COLORS, tempoRelativo } from '../../lib/comunidade'
import { supabase } from '../../lib/supabase'

// ============================================================
// StoriesBar — Barra horizontal de stories no topo do feed
// ============================================================

export function StoriesBar({ userId, perfil, onStoryCriada }) {
  const [grupos, setGrupos] = useState([])
  const [naoVistas, setNaoVistas] = useState({})
  const [loading, setLoading] = useState(true)
  const [viewerAberto, setViewerAberto] = useState(false)
  const [grupoAtivo, setGrupoAtivo] = useState(0)
  const [showCriar, setShowCriar] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (userId) carregarStories()
  }, [userId])

  const carregarStories = async () => {
    try {
      const dados = await getStoriesAtivos()
      setGrupos(dados)

      // Verificar quais stories o user já viu
      const agora = new Date().toISOString()
      const { data: vistas } = await supabase
        .from('community_story_views')
        .select('story_id')
        .eq('user_id', userId)

      const vistasSet = new Set((vistas || []).map(v => v.story_id))
      const naoVistasMap = {}
      dados.forEach(grupo => {
        const temNaoVista = grupo.stories.some(s => !vistasSet.has(s.id))
        if (temNaoVista) naoVistasMap[grupo.user_id] = true
      })
      setNaoVistas(naoVistasMap)
    } catch (error) {
      console.error('Erro ao carregar stories:', error)
    }
    setLoading(false)
  }

  const abrirStory = (index) => {
    setGrupoAtivo(index)
    setViewerAberto(true)
  }

  const handleStoryCriada = (novaStory) => {
    setShowCriar(false)
    carregarStories()
    onStoryCriada?.(novaStory)
  }

  const handleStoryVista = (storyUserId) => {
    setNaoVistas(prev => {
      const novo = { ...prev }
      delete novo[storyUserId]
      return novo
    })
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
            <div className="w-10 h-2 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="flex items-start gap-3 px-4 py-3 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Adicionar story */}
        <button
          onClick={() => setShowCriar(true)}
          className="flex flex-col items-center gap-1 flex-shrink-0"
        >
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                padding: '2px'
              }}
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-lg" style={{ color: '#8B5CF6' }}>
                  {perfil?.avatar_emoji || '🌸'}
                </span>
              </div>
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: '#8B5CF6' }}
            >
              +
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-medium w-16 text-center truncate">
            A tua story
          </span>
        </button>

        {/* Stories de outros utilizadores */}
        {grupos.map((grupo, index) => {
          const temNaoVista = naoVistas[grupo.user_id]
          const p = grupo.perfil
          return (
            <button
              key={grupo.user_id}
              onClick={() => abrirStory(index)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: temNaoVista
                    ? 'linear-gradient(135deg, #8B5CF6, #EC4899, #F59E0B)'
                    : '#E5E7EB',
                  padding: '2.5px'
                }}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {p?.avatar_url ? (
                    <img
                      src={p.avatar_url}
                      alt={p.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">{p?.avatar_emoji || '🌸'}</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 font-medium w-16 text-center truncate">
                {p?.display_name || 'Anon'}
              </span>
            </button>
          )
        })}

        {grupos.length === 0 && (
          <div className="flex items-center h-16 pl-2">
            <p className="text-xs text-gray-300 italic" style={{ fontFamily: 'var(--font-titulos)' }}>
              Sem stories de momento...
            </p>
          </div>
        )}
      </div>

      {/* Viewer */}
      {viewerAberto && grupos.length > 0 && (
        <StoryViewer
          grupos={grupos}
          grupoInicial={grupoAtivo}
          userId={userId}
          onFechar={() => setViewerAberto(false)}
          onStoryVista={handleStoryVista}
        />
      )}

      {/* Criar story */}
      {showCriar && (
        <CriarStory
          userId={userId}
          onStoryCriada={handleStoryCriada}
          onFechar={() => setShowCriar(false)}
        />
      )}
    </>
  )
}

// ============================================================
// StoryViewer — Overlay de ecrã inteiro para ver stories
// ============================================================

export function StoryViewer({ grupos, grupoInicial = 0, userId, onFechar, onStoryVista }) {
  const [grupoIdx, setGrupoIdx] = useState(grupoInicial)
  const [storyIdx, setStoryIdx] = useState(0)
  const [progresso, setProgresso] = useState(0)
  const [pausado, setPausado] = useState(false)
  const timerRef = useRef(null)
  const progressoRef = useRef(null)
  const containerRef = useRef(null)

  const DURACAO_STORY = 5000 // 5 segundos
  const TICK = 50

  const grupoAtual = grupos[grupoIdx]
  const storyAtual = grupoAtual?.stories?.[storyIdx]
  const perfil = grupoAtual?.perfil

  // Marcar como vista quando aparece
  useEffect(() => {
    if (storyAtual && userId) {
      marcarStoryVista(storyAtual.id, userId).catch(() => {})
    }
  }, [storyAtual?.id, userId])

  // Progresso automático
  useEffect(() => {
    if (pausado || !storyAtual) return

    setProgresso(0)
    let elapsed = 0

    progressoRef.current = setInterval(() => {
      elapsed += TICK
      const pct = Math.min((elapsed / DURACAO_STORY) * 100, 100)
      setProgresso(pct)

      if (elapsed >= DURACAO_STORY) {
        clearInterval(progressoRef.current)
        avancar()
      }
    }, TICK)

    return () => {
      if (progressoRef.current) clearInterval(progressoRef.current)
    }
  }, [grupoIdx, storyIdx, pausado])

  const avancar = useCallback(() => {
    if (!grupoAtual) return

    if (storyIdx < grupoAtual.stories.length - 1) {
      // Próxima story do mesmo utilizador
      setStoryIdx(prev => prev + 1)
    } else if (grupoIdx < grupos.length - 1) {
      // Próximo utilizador
      const nextGrupo = grupoIdx + 1
      setGrupoIdx(nextGrupo)
      setStoryIdx(0)
      onStoryVista?.(grupoAtual.user_id)
    } else {
      // Fim de todas as stories
      onStoryVista?.(grupoAtual.user_id)
      onFechar()
    }
  }, [grupoIdx, storyIdx, grupoAtual, grupos.length, onFechar, onStoryVista])

  const recuar = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx(prev => prev - 1)
    } else if (grupoIdx > 0) {
      const prevGrupo = grupoIdx - 1
      setGrupoIdx(prevGrupo)
      setStoryIdx(grupos[prevGrupo].stories.length - 1)
    }
  }, [grupoIdx, storyIdx, grupos])

  const handleToque = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX || e.changedTouches?.[0]?.clientX || 0
    const metade = rect.left + rect.width / 2

    if (x < metade) {
      recuar()
    } else {
      avancar()
    }
  }

  const handleTouchStart = () => {
    setPausado(true)
  }

  const handleTouchEnd = () => {
    setPausado(false)
  }

  if (!storyAtual || !grupoAtual) return null

  const totalStories = grupoAtual.stories.length

  return (
    <div className="fixed inset-0 z-[100] bg-black animate-fadeIn">
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-lg mx-auto flex flex-col"
        style={{ backgroundColor: storyAtual.cor_fundo || '#8B5CF6' }}
        onClick={handleToque}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {/* Barras de progresso */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3 pt-4">
          {grupoAtual.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-none"
                style={{
                  width: i < storyIdx ? '100%' : i === storyIdx ? `${progresso}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header — Avatar + Nome + Fechar */}
        <div className="absolute top-8 left-0 right-0 z-20 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/40">
              {perfil?.avatar_url ? (
                <img
                  src={perfil.avatar_url}
                  alt={perfil.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm">{perfil?.avatar_emoji || '🌸'}</span>
              )}
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">
                {perfil?.display_name || 'Anon'}
              </p>
              <p className="text-white/60 text-[10px]">
                {tempoRelativo(storyAtual.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onFechar() }}
            className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteudo da story */}
        <div className="flex-1 flex items-center justify-center px-8">
          {storyAtual.tipo === 'imagem' && storyAtual.imagem_url ? (
            <img
              src={storyAtual.imagem_url}
              alt="Story"
              className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            <p
              className="text-white text-center text-xl leading-relaxed font-medium"
              style={{
                fontFamily: 'var(--font-titulos)',
                fontSize: storyAtual.conteudo?.length > 200 ? '1.1rem' : storyAtual.conteudo?.length > 100 ? '1.3rem' : '1.6rem',
                textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                maxWidth: '90%',
                wordBreak: 'break-word'
              }}
            >
              {storyAtual.conteudo}
            </p>
          )}
        </div>

        {/* Indicador de grupo (bolinhas) */}
        {grupos.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-20">
            {grupos.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === grupoIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// CriarStory — Modal para criar uma nova story
// ============================================================

export function CriarStory({ userId, onStoryCriada, onFechar }) {
  const [tipo, setTipo] = useState('texto')
  const [conteudo, setConteudo] = useState('')
  const [corFundo, setCorFundo] = useState(STORY_COLORS[0])
  const [imagem, setImagem] = useState(null)
  const [imagemPreview, setImagemPreview] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const fileInputRef = useRef(null)

  const handleImagemChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem demasiado grande. Maximo 5MB.')
      return
    }

    setImagem(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagemPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handlePublicar = async () => {
    if (enviando) return
    if (tipo === 'texto' && !conteudo.trim()) return
    if (tipo === 'imagem' && !imagem) return

    setEnviando(true)
    try {
      let imagemUrl = null

      if (tipo === 'imagem' && imagem) {
        imagemUrl = await uploadImagem(userId, imagem, 'community-images')
      }

      const novaStory = await criarStory(userId, {
        tipo,
        conteudo: tipo === 'texto' ? conteudo.trim() : '',
        imagem_url: imagemUrl,
        cor_fundo: corFundo
      })

      onStoryCriada?.(novaStory)
    } catch (error) {
      console.error('Erro ao criar story:', error)
      alert('Erro ao publicar story. Tenta novamente.')
    }
    setEnviando(false)
  }

  const limparImagem = () => {
    setImagem(null)
    setImagemPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={onFechar}
            className="text-gray-400 hover:text-gray-600 text-sm font-medium"
          >
            Cancelar
          </button>
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'var(--font-titulos)' }}>
            Nova Story
          </h3>
          <button
            onClick={handlePublicar}
            disabled={enviando || (tipo === 'texto' && !conteudo.trim()) || (tipo === 'imagem' && !imagem)}
            className="text-sm font-bold px-4 py-1.5 rounded-full text-white transition-all disabled:opacity-40"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            {enviando ? 'A publicar...' : 'Publicar'}
          </button>
        </div>

        {/* Toggle tipo */}
        <div className="flex items-center gap-2 p-4 pb-2">
          <button
            onClick={() => setTipo('texto')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tipo === 'texto'
                ? 'text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={tipo === 'texto' ? { backgroundColor: '#8B5CF6' } : {}}
          >
            Texto
          </button>
          <button
            onClick={() => setTipo('imagem')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tipo === 'imagem'
                ? 'text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={tipo === 'imagem' ? { backgroundColor: '#8B5CF6' } : {}}
          >
            Imagem
          </button>
        </div>

        {/* Preview */}
        <div className="px-4 py-3">
          <div
            className="w-full rounded-2xl flex items-center justify-center overflow-hidden transition-colors"
            style={{
              backgroundColor: corFundo,
              aspectRatio: '9/16',
              maxHeight: '360px'
            }}
          >
            {tipo === 'texto' ? (
              <p
                className="text-white text-center px-6 leading-relaxed"
                style={{
                  fontFamily: 'var(--font-titulos)',
                  fontSize: conteudo.length > 200 ? '0.85rem' : conteudo.length > 100 ? '1rem' : '1.2rem',
                  textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  wordBreak: 'break-word',
                  opacity: conteudo ? 1 : 0.5
                }}
              >
                {conteudo || 'A tua mensagem aparece aqui...'}
              </p>
            ) : imagemPreview ? (
              <div className="relative w-full h-full">
                <img
                  src={imagemPreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={limparImagem}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white text-xs hover:bg-black/60"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 text-white/70 hover:text-white/90 transition-colors"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Toca para escolher imagem</span>
              </button>
            )}
          </div>
        </div>

        {/* Input de texto (para tipo texto) */}
        {tipo === 'texto' && (
          <div className="px-4 pb-2">
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreve a tua mensagem..."
              className="w-full min-h-[80px] text-sm text-gray-700 placeholder-gray-300 rounded-xl p-3 border border-gray-200 focus:border-purple-300 resize-none"
              maxLength={500}
              autoFocus
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${conteudo.length > 450 ? 'text-red-400' : 'text-gray-300'}`}>
                {conteudo.length}/500
              </span>
            </div>
          </div>
        )}

        {/* Input de imagem oculto */}
        {tipo === 'imagem' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImagemChange}
              className="hidden"
            />
            {!imagemPreview && (
              <div className="px-4 pb-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Escolher imagem da galeria
                </button>
              </div>
            )}
          </>
        )}

        {/* Selector de cor de fundo */}
        <div className="px-4 pb-5 pt-1">
          <p className="text-xs text-gray-400 mb-2.5 font-medium">COR DE FUNDO</p>
          <div className="flex items-center gap-2 flex-wrap">
            {STORY_COLORS.map((cor) => (
              <button
                key={cor}
                onClick={() => setCorFundo(cor)}
                className="w-8 h-8 rounded-full transition-all flex items-center justify-center"
                style={{
                  backgroundColor: cor,
                  transform: corFundo === cor ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: corFundo === cor ? `0 0 0 3px white, 0 0 0 5px ${cor}` : 'none'
                }}
              >
                {corFundo === cor && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Export padrão
// ============================================================

export default StoriesBar
