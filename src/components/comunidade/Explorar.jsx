import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  getTrending,
  getSugestoesPerfis,
  pesquisarUtilizadores,
  pesquisarPosts,
  pesquisarPorHashtag,
  pedirConexao,
  verificarConexao,
  aceitarConexao,
  ECOS_INFO,
  tempoRelativo
} from '../../lib/comunidade'
import {
  isGhostUser,
  getGhostConnectionState,
  acceptGhostConnection,
  getGhostConnectionRequests
} from '../../lib/ghost-users'

export default function Explorar() {
  const navigate = useNavigate()

  // Auth / user
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Search
  const [query, setQuery] = useState('')
  const [tabPesquisa, setTabPesquisa] = useState('pessoas') // 'pessoas' | 'publicacoes'
  const [pesquisando, setPesquisando] = useState(false)
  const [resultadosPessoas, setResultadosPessoas] = useState([])
  const [resultadosPosts, setResultadosPosts] = useState([])

  // Explore (no search)
  const [sugestoes, setSugestoes] = useState([])
  const [trending, setTrending] = useState([])
  const [loadingSugestoes, setLoadingSugestoes] = useState(true)
  const [loadingTrending, setLoadingTrending] = useState(true)

  // Connection state: { [userId]: 'none'|'pending_sent'|'pending_received'|'connected' }
  const [conexaoMap, setConexaoMap] = useState({})
  const [acaoEmCurso, setAcaoEmCurso] = useState({})

  const debounceRef = useRef(null)

  // ---------- Initialisation ----------

  useEffect(() => {
    inicializar()
  }, [])

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
        await carregarConteudoInicial(userData.id)
      }
    } catch (error) {
      console.error('Erro ao inicializar explorar:', error)
    }
    setLoading(false)
  }

  const carregarConteudoInicial = async (uid) => {
    try {
      const [sugestoesData, trendingData] = await Promise.all([
        getSugestoesPerfis(uid, 10),
        getTrending(12)
      ])

      setSugestoes(sugestoesData)
      setTrending(trendingData)

      // Verificar estado de conexão (para as sugestoes)
      const mapa = {}
      if (sugestoesData.length > 0) {
        await Promise.all(
          sugestoesData.map(async (s) => {
            if (isGhostUser(s.user_id)) {
              mapa[s.user_id] = getGhostConnectionState(uid, s.user_id)
            } else {
              mapa[s.user_id] = await verificarConexao(uid, s.user_id)
            }
          })
        )
      }

      // Adicionar ghosts que enviaram pedidos de conexão
      const ghostRequests = getGhostConnectionRequests(uid)
      ghostRequests.forEach(r => {
        if (!mapa[r.ghostId]) {
          mapa[r.ghostId] = getGhostConnectionState(uid, r.ghostId)
        }
      })

      setConexaoMap(mapa)
    } catch (error) {
      console.error('Erro ao carregar conteudo inicial:', error)
    }
    setLoadingSugestoes(false)
    setLoadingTrending(false)
  }

  // ---------- Search with debounce ----------

  const handleQueryChange = (valor) => {
    setQuery(valor)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!valor.trim()) {
      setResultadosPessoas([])
      setResultadosPosts([])
      setPesquisando(false)
      return
    }

    setPesquisando(true)
    debounceRef.current = setTimeout(() => {
      executarPesquisa(valor.trim())
    }, 400)
  }

  const executarPesquisa = async (termo) => {
    try {
      if (termo.startsWith('#')) {
        // Hashtag search — always returns posts
        const hashtag = termo.slice(1).toLowerCase()
        if (hashtag.length === 0) {
          setPesquisando(false)
          return
        }
        const posts = await pesquisarPorHashtag(hashtag)
        setResultadosPosts(posts)
        setResultadosPessoas([])
        setTabPesquisa('publicacoes')
      } else if (tabPesquisa === 'pessoas') {
        const pessoas = await pesquisarUtilizadores(termo)
        setResultadosPessoas(pessoas)

        // Verificar estado de conexão
        if (pessoas.length > 0 && userId) {
          const mapa = { ...conexaoMap }
          await Promise.all(
            pessoas.map(async (p) => {
              if (mapa[p.user_id] === undefined) {
                mapa[p.user_id] = await verificarConexao(userId, p.user_id)
              }
            })
          )
          setConexaoMap(mapa)
        }
      } else {
        const posts = await pesquisarPosts(termo)
        setResultadosPosts(posts)
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error)
    }
    setPesquisando(false)
  }

  // Re-run search when tab changes (if there is a query)
  useEffect(() => {
    if (query.trim() && !query.startsWith('#')) {
      setPesquisando(true)
      executarPesquisa(query.trim())
    }
  }, [tabPesquisa])

  // ---------- Conexão ----------

  const handleConectar = async (targetUserId) => {
    if (!userId || acaoEmCurso[targetUserId]) return
    setAcaoEmCurso(prev => ({ ...prev, [targetUserId]: true }))
    try {
      const estado = conexaoMap[targetUserId] || 'none'

      if (isGhostUser(targetUserId)) {
        // Ghost — aceitar pedido (pending_received → connected)
        if (estado === 'pending_received') {
          acceptGhostConnection(userId, targetUserId)
          setConexaoMap(prev => ({ ...prev, [targetUserId]: 'connected' }))
        }
      } else {
        // Real user
        if (estado === 'pending_received') {
          await aceitarConexao(userId, targetUserId)
          setConexaoMap(prev => ({ ...prev, [targetUserId]: 'connected' }))
        } else {
          await pedirConexao(userId, targetUserId)
          setConexaoMap(prev => ({ ...prev, [targetUserId]: 'pending_sent' }))
        }
      }
    } catch (error) {
      console.error('Erro ao conectar:', error)
    }
    setAcaoEmCurso(prev => ({ ...prev, [targetUserId]: false }))
  }

  // ---------- Helpers ----------

  const temPesquisa = query.trim().length > 0

  const cortarTexto = (texto, max) => {
    if (!texto) return ''
    return texto.length > max ? texto.slice(0, max) + '...' : texto
  }

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl animate-pulse">
          🔍
        </div>
        <p className="text-gray-400" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          A preparar explorar...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 p-4 pb-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
              Explorar
            </h1>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Pesquisar pessoas, posts ou #hashtags..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-gray-50 focus:bg-white"
                style={{ fontFamily: 'var(--font-corpo)' }}
              />
              {query && (
                <button
                  onClick={() => handleQueryChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Search tabs (only when searching and not hashtag) */}
          {temPesquisa && !query.startsWith('#') && (
            <div className="flex gap-1 px-4 pb-3">
              <button
                onClick={() => setTabPesquisa('pessoas')}
                className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
                  tabPesquisa === 'pessoas'
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={tabPesquisa === 'pessoas' ? { backgroundColor: '#8B5CF6' } : {}}
              >
                Pessoas
              </button>
              <button
                onClick={() => setTabPesquisa('publicacoes')}
                className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
                  tabPesquisa === 'publicacoes'
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={tabPesquisa === 'publicacoes' ? { backgroundColor: '#8B5CF6' } : {}}
              >
                Publicacoes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {temPesquisa ? (
          /* ===== SEARCH RESULTS ===== */
          pesquisando ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-purple-300 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>A pesquisar...</p>
            </div>
          ) : (
            <>
              {/* People results */}
              {(tabPesquisa === 'pessoas' && !query.startsWith('#')) && (
                <>
                  {resultadosPessoas.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-4xl block mb-3">🔍</span>
                      <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-corpo)' }}>
                        Nenhuma pessoa encontrada para "{query}"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resultadosPessoas.map(pessoa => (
                        <CartaoPerfil
                          key={pessoa.user_id}
                          perfil={pessoa}
                          userId={userId}
                          estadoConexao={conexaoMap[pessoa.user_id] || 'none'}
                          emCurso={acaoEmCurso[pessoa.user_id] || false}
                          onPerfilClick={() => navigate(`/comunidade/perfil/${pessoa.user_id}`)}
                          onConectar={() => handleConectar(pessoa.user_id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Post results */}
              {(tabPesquisa === 'publicacoes' || query.startsWith('#')) && (
                <>
                  {query.startsWith('#') && (
                    <div className="mb-4">
                      <span
                        className="inline-block text-xs px-3 py-1.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: '#8B5CF6' }}
                      >
                        {query}
                      </span>
                    </div>
                  )}
                  {resultadosPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-4xl block mb-3">📝</span>
                      <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-corpo)' }}>
                        Nenhuma publicacao encontrada para "{query}"
                      </p>
                    </div>
                  ) : (
                    <GrelhaPublicacoes
                      posts={resultadosPosts}
                      onPostClick={(post) => navigate(`/comunidade/perfil/${post.user_id}`)}
                    />
                  )}
                </>
              )}
            </>
          )
        ) : (
          /* ===== DEFAULT: SUGGESTIONS + TRENDING ===== */
          <>
            {/* Sugestoes para ti */}
            <section className="mb-8">
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ fontFamily: 'var(--font-titulos)', color: '#8B5CF6' }}
              >
                Sugestoes para ti
              </h2>

              {loadingSugestoes ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex-shrink-0 w-40 h-48 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : sugestoes.length === 0 ? (
                <div className="text-center py-6 bg-white rounded-2xl border border-gray-100">
                  <span className="text-3xl block mb-2">🌸</span>
                  <p className="text-sm text-gray-400" style={{ fontFamily: 'var(--font-corpo)' }}>
                    Ja segues toda a gente!
                  </p>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {sugestoes.map(perfil => (
                    <div
                      key={perfil.user_id}
                      className="flex-shrink-0 w-40 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      {/* Card top */}
                      <button
                        onClick={() => navigate(`/comunidade/perfil/${perfil.user_id}`)}
                        className="w-full p-4 pb-2 text-center hover:opacity-80 transition-opacity"
                      >
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mx-auto mb-2"
                          style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)' }}
                        >
                          {perfil.avatar_emoji || '🌸'}
                        </div>
                        <p
                          className="text-sm font-semibold text-gray-800 truncate"
                          style={{ fontFamily: 'var(--font-titulos)' }}
                        >
                          {perfil.display_name || 'Utilizadora'}
                        </p>
                        {perfil.bio && (
                          <p
                            className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed"
                            style={{ fontFamily: 'var(--font-corpo)' }}
                          >
                            {cortarTexto(perfil.bio, 50)}
                          </p>
                        )}
                      </button>

                      {/* Ecos badges */}
                      {perfil.ecos_activos?.length > 0 && (
                        <div className="flex justify-center gap-1 px-2 pb-2">
                          {perfil.ecos_activos.slice(0, 3).map(eco => {
                            const info = ECOS_INFO[eco]
                            return info ? (
                              <span key={eco} className="text-xs" title={info.label}>{info.emoji}</span>
                            ) : null
                          })}
                        </div>
                      )}

                      {/* Connection button */}
                      <div className="px-3 pb-3">
                        {conexaoMap[perfil.user_id] === 'connected' ? (
                          <div className="w-full py-1.5 rounded-lg text-center text-xs font-medium bg-amber-50 text-amber-700">
                            Conectados
                          </div>
                        ) : conexaoMap[perfil.user_id] === 'pending_sent' ? (
                          <div className="w-full py-1.5 rounded-lg text-center text-xs font-medium bg-gray-100 text-gray-500">
                            Pendente
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConectar(perfil.user_id)}
                            disabled={acaoEmCurso[perfil.user_id]}
                            className="w-full py-1.5 rounded-lg text-center text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: conexaoMap[perfil.user_id] === 'pending_received' ? '#D97706' : '#8B5CF6' }}
                          >
                            {acaoEmCurso[perfil.user_id] ? '...'
                              : conexaoMap[perfil.user_id] === 'pending_received' ? 'Aceitar'
                              : 'Conectar'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Em destaque */}
            <section>
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ fontFamily: 'var(--font-titulos)', color: '#8B5CF6' }}
              >
                Em destaque
              </h2>

              {loadingTrending ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : trending.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                  <span className="text-4xl block mb-3">✨</span>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-corpo)' }}>
                    Ainda não há publicações em destaque esta semana
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Partilha algo para aparecer aqui!</p>
                </div>
              ) : (
                <GrelhaPublicacoes
                  posts={trending}
                  onPostClick={(post) => navigate(`/comunidade/perfil/${post.user_id}`)}
                />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

// ===== Sub-components =====

function CartaoPerfil({ perfil, userId, estadoConexao, emCurso, onPerfilClick, onConectar }) {
  const isOwn = perfil.user_id === userId

  const labelConexao = estadoConexao === 'connected' ? 'Conectados'
    : estadoConexao === 'pending_sent' ? 'Pendente'
    : estadoConexao === 'pending_received' ? 'Aceitar'
    : 'Conectar'

  const isPassivo = estadoConexao === 'connected' || estadoConexao === 'pending_sent'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 animate-fadeIn">
      <button
        onClick={onPerfilClick}
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl hover:opacity-80 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%)' }}
      >
        {perfil.avatar_emoji || '🌸'}
      </button>

      <button
        onClick={onPerfilClick}
        className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
      >
        <p className="text-sm font-semibold text-gray-800 truncate" style={{ fontFamily: 'var(--font-titulos)' }}>
          {perfil.display_name || 'Utilizadora'}
        </p>
        {perfil.bio && (
          <p className="text-xs text-gray-400 truncate" style={{ fontFamily: 'var(--font-corpo)' }}>
            {perfil.bio}
          </p>
        )}
        {perfil.ecos_activos?.length > 0 && (
          <div className="flex gap-1 mt-1">
            {perfil.ecos_activos.slice(0, 4).map(eco => {
              const info = ECOS_INFO[eco]
              return info ? (
                <span key={eco} className="text-xs" title={info.label}>{info.emoji}</span>
              ) : null
            })}
          </div>
        )}
      </button>

      {!isOwn && (
        isPassivo ? (
          <span className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${
            estadoConexao === 'connected' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {labelConexao}
          </span>
        ) : (
          <button
            onClick={onConectar}
            disabled={emCurso}
            className="flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            {emCurso ? '...' : labelConexao}
          </button>
        )
      )}
    </div>
  )
}

function GrelhaPublicacoes({ posts, onPostClick }) {
  // Split posts into two columns for masonry effect
  const colEsquerda = []
  const colDireita = []
  posts.forEach((post, i) => {
    if (i % 2 === 0) colEsquerda.push(post)
    else colDireita.push(post)
  })

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-3">
        {colEsquerda.map(post => (
          <CartaoPost key={post.id} post={post} onClick={() => onPostClick(post)} />
        ))}
      </div>
      <div className="space-y-3">
        {colDireita.map(post => (
          <CartaoPost key={post.id} post={post} onClick={() => onPostClick(post)} />
        ))}
      </div>
    </div>
  )
}

function CartaoPost({ post, onClick }) {
  const perfil = post.community_profiles
  const ecoInfo = post.eco ? ECOS_INFO[post.eco] : null

  // Determine card colour: use eco colour if available, else purple
  const corFundo = ecoInfo ? ecoInfo.cor : '#8B5CF6'

  if (post.imagem_url) {
    // Image post
    return (
      <button
        onClick={onClick}
        className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
      >
        <div className="relative">
          <img
            src={post.imagem_url}
            alt=""
            className="w-full h-44 object-cover"
            loading="lazy"
          />
          {/* Overlay with info */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{perfil?.avatar_emoji || '🌸'}</span>
              <span className="text-xs text-white/90 font-medium truncate">
                {perfil?.display_name || 'Utilizadora'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-white/70 flex items-center gap-1">
                ❤️ {post.likes_count || 0}
              </span>
              <span className="text-xs text-white/70 flex items-center gap-1">
                💬 {post.comments_count || 0}
              </span>
            </div>
          </div>
        </div>
      </button>
    )
  }

  // Text post — coloured card
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
      style={{ backgroundColor: corFundo }}
    >
      <div className="p-4 min-h-[10rem] flex flex-col justify-between">
        <p
          className="text-sm text-white/95 leading-relaxed line-clamp-5"
          style={{ fontFamily: 'var(--font-corpo)' }}
        >
          {post.conteudo}
        </p>
        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{perfil?.avatar_emoji || '🌸'}</span>
            <span className="text-xs text-white/80 font-medium truncate">
              {perfil?.display_name || 'Utilizadora'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-white/60 flex items-center gap-1">
              ❤️ {post.likes_count || 0}
            </span>
            <span className="text-xs text-white/60 flex items-center gap-1">
              💬 {post.comments_count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {post.hashtags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-white/50 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
