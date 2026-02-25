import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  getConversasSussurros,
  getOuCriarSussurro,
  getSussurros,
  enviarSussurro,
  SUSSURRO_MODELOS,
  tempoRelativo
} from '../../lib/comunidade'
import { useI18n } from '../../contexts/I18nContext'
import {
  isGhostUser,
  isGhostUUID,
  getGhostProfile,
  resolveGhostId,
  GHOST_UUID_MAP,
  ensureGhostConversations,
  sendMessageToGhostSupabase,
  insertGhostReply
} from '../../lib/ghost-users'

// ============================================================
// Sussurros — Palavras que aquecem em silêncio
// Mensagens privadas de apoio e encorajamento
// ============================================================

// ---------- Helpers ----------

function isDiasDiferentes(dataStr1, dataStr2) {
  if (!dataStr1 || !dataStr2) return true
  const d1 = new Date(dataStr1).toDateString()
  const d2 = new Date(dataStr2).toDateString()
  return d1 !== d2
}

function formatarData(dataStr) {
  const data = new Date(dataStr)
  const hoje = new Date()
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)

  if (data.toDateString() === hoje.toDateString()) return 'Hoje'
  if (data.toDateString() === ontem.toDateString()) return 'Ontem'

  return data.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: data.getFullYear() !== hoje.getFullYear() ? 'numeric' : undefined
  })
}

function formatarHora(dataStr) {
  const data = new Date(dataStr)
  return data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

// ============================================================
// ConversasSussurrosList — Lista de conversas
// ============================================================

function ConversasSussurrosList({ userId, conversas, loading, onAbrirConversa }) {
  const navigate = useNavigate()
  const { t } = useI18n()

  const getOutroPerfil = (conversa) => {
    if (conversa.user1_profile?.user_id === userId) {
      return conversa.user2_profile
    }
    return conversa.user1_profile
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(180deg, #FBF9FF 0%, #F5F0FA 100%)' }}>
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-3xl animate-pulse">
          🌸
        </div>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          {t('comunidade.sussurros.loading')}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 animate-page-enter" style={{ background: 'linear-gradient(180deg, #FBF9FF 0%, #F5F0FA 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-purple-100/40">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
                {t('comunidade.sussurros.title')}
              </h1>
              <p className="text-xs text-purple-400" style={{ fontFamily: 'var(--font-corpo)', fontStyle: 'italic' }}>
                {t('comunidade.sussurros.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {conversas.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-4xl mx-auto mb-5">
              🕊️
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              {t('comunidade.sussurros.empty_title')}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
              {t('comunidade.sussurros.empty_desc')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversas.map(conversa => {
              const outro = getOutroPerfil(conversa)
              if (!outro) return null

              return (
                <button
                  key={conversa.id}
                  onClick={() => onAbrirConversa(conversa)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all text-left flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {outro.avatar_url ? (
                      <img
                        src={outro.avatar_url}
                        alt={outro.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl">
                        {outro.avatar_emoji || '🌸'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800 truncate" style={{ fontFamily: 'var(--font-titulos)' }}>
                        {outro.display_name}
                      </p>
                      {conversa.last_message_at && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2" style={{ fontFamily: 'var(--font-corpo)' }}>
                          {tempoRelativo(conversa.last_message_at)}
                        </span>
                      )}
                    </div>
                    {conversa.last_message && (
                      <p className="text-xs text-gray-400 truncate mt-0.5" style={{ fontFamily: 'var(--font-corpo)' }}>
                        {conversa.last_message}
                      </p>
                    )}
                  </div>

                  {/* Seta */}
                  <svg className="w-4 h-4 text-purple-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// SussurroView — Conversa individual de sussurros
// ============================================================

function SussurroView({ userId, conversa, onVoltar }) {
  const [loading, setLoading] = useState(true)
  const [mensagens, setMensagens] = useState([])
  const [outroPerfil, setOutroPerfil] = useState(null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [ghostTyping, setGhostTyping] = useState(false)

  const ghostUUIDs = new Set(Object.values(GHOST_UUID_MAP))
  const outroId = conversa
    ? (conversa.user1_id === userId ? conversa.user2_id : conversa.user1_id)
    : null
  const isGhostConv = outroId ? (ghostUUIDs.has(outroId) || isGhostUUID(outroId)) : false

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { t } = useI18n()

  useEffect(() => {
    if (userId && conversa?.id) carregarSussurros()
  }, [userId, conversa?.id])

  // Real-time: escutar novos sussurros (TODAS as conversas)
  useEffect(() => {
    if (!conversa?.id) return

    const channel = supabase
      .channel(`sussurros-${conversa.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `conversation_id=eq.${conversa.id}`
        },
        (payload) => {
          const nova = payload.new
          setMensagens(prev => {
            const jaExiste = prev.some(m => m.id === nova.id)
            if (jaExiste) return prev
            return [...prev, nova]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversa?.id])

  // Auto-scroll quando chegam mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, ghostTyping])

  const carregarSussurros = async () => {
    setLoading(true)
    try {
      // Determinar o outro perfil
      if (conversa.user1_profile?.user_id === userId) {
        setOutroPerfil(conversa.user2_profile)
      } else {
        setOutroPerfil(conversa.user1_profile)
      }

      // Tudo via Supabase — sem branching ghost/real
      const msgs = await getSussurros(conversa.id)
      setMensagens(msgs)
    } catch (error) {
      console.error('Erro ao carregar sussurros:', error)
    }
    setLoading(false)
  }

  const handleEnviar = async () => {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return

    setEnviando(true)
    setTexto('')

    try {
      if (isGhostConv && outroId) {
        // Ghost: enviar + resposta contextual via Supabase
        const { userMsg, ghostReplyText, ghostUUID } = await sendMessageToGhostSupabase(
          conversa.id, userId, outroId, conteudo
        )
        if (userMsg) {
          setMensagens(prev => {
            const jaExiste = prev.some(m => m.id === userMsg.id)
            if (jaExiste) return prev
            return [...prev, userMsg]
          })
        }
        // Typing indicator + ghost reply após delay
        setGhostTyping(true)
        const delay = 2000 + Math.random() * 3000
        setTimeout(async () => {
          try {
            await insertGhostReply(conversa.id, ghostUUID, ghostReplyText)
          } catch (err) {
            console.error('Erro ghost reply:', err)
          }
          setGhostTyping(false)
        }, delay)
      } else {
        const novoSussurro = await enviarSussurro(conversa.id, userId, conteudo)
        if (novoSussurro) {
          setMensagens(prev => {
            const jaExiste = prev.some(m => m.id === novoSussurro.id)
            if (jaExiste) return prev
            return [...prev, novoSussurro]
          })
        }
      }
    } catch (error) {
      console.error('Erro ao enviar sussurro:', error)
      setTexto(conteudo)
    }
    setEnviando(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  const handleSugestaoClick = (modelo) => {
    setTexto(modelo.texto)
    inputRef.current?.focus()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(180deg, #FBF9FF 0%, #F5F0FA 100%)' }}>
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-3xl animate-pulse">
          🌸
        </div>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          {t('comunidade.sussurros.opening')}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FBF9FF 0%, #F5F0FA 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-purple-100/40">
        <div className="max-w-lg mx-auto flex items-center gap-3 p-4">
          <button onClick={onVoltar} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {outroPerfil && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {outroPerfil.avatar_url ? (
                <img
                  src={outroPerfil.avatar_url}
                  alt={outroPerfil.display_name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg flex-shrink-0">
                  {outroPerfil.avatar_emoji || '🌸'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate" style={{ fontFamily: 'var(--font-titulos)' }}>
                  {outroPerfil.display_name}
                </p>
                {ghostTyping && (
                  <p className="text-xs text-purple-400 animate-pulse">a escrever...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {mensagens.length === 0 && (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-3xl mx-auto mb-4">
                🕊️
              </div>
              <p className="text-sm text-gray-400 leading-relaxed" style={{ fontFamily: 'var(--font-corpo)' }}>
                {t('comunidade.sussurros.first_whisper')}
              </p>
            </div>
          )}

          {mensagens.map((msg, idx) => {
            const isMinha = msg.sender_id === userId
            const mostrarData = idx === 0 || isDiasDiferentes(mensagens[idx - 1]?.created_at, msg.created_at)

            return (
              <React.Fragment key={msg.id || idx}>
                {/* Separador de dia */}
                {mostrarData && (
                  <div className="flex items-center justify-center py-2">
                    <span className="text-xs text-purple-300 bg-white/60 px-3 py-1 rounded-full" style={{ fontFamily: 'var(--font-corpo)' }}>
                      {formatarData(msg.created_at)}
                    </span>
                  </div>
                )}

                {/* Balao de sussurro */}
                <div className={`flex ${isMinha ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 ${
                      isMinha
                        ? 'rounded-2xl rounded-br-sm text-white'
                        : 'rounded-2xl rounded-bl-sm bg-gray-100 text-gray-800'
                    }`}
                    style={isMinha ? { backgroundColor: '#8B5CF6' } : {}}
                  >
                    {msg.conteudo && (
                      <p className="text-sm whitespace-pre-wrap break-words" style={{ fontFamily: 'var(--font-corpo)' }}>
                        {msg.conteudo}
                      </p>
                    )}
                    <p className={`text-[10px] mt-1 text-right ${
                      isMinha ? 'text-white/60' : 'text-gray-400'
                    }`}>
                      {formatarHora(msg.created_at)}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            )
          })}

          {/* Typing indicator */}
          {ghostTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sugestoes + Input */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-purple-100/40">
        <div className="max-w-lg mx-auto">
          {/* Sugestoes de sussurros (SUSSURRO_MODELOS) */}
          <div className="px-3 pt-3 pb-1 overflow-x-auto">
            <div className="flex gap-2 whitespace-nowrap">
              {SUSSURRO_MODELOS.map((modelo, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSugestaoClick(modelo)}
                  className="bg-purple-50 text-purple-600 rounded-full text-xs px-3 py-1.5 flex-shrink-0 hover:bg-purple-100 transition-colors"
                  style={{ fontFamily: 'var(--font-corpo)' }}
                >
                  {modelo.texto}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de input */}
          <div className="flex items-end gap-2 p-3">
            <input
              ref={inputRef}
              type="text"
              value={texto}
              onChange={(e) => {
                if (e.target.value.length <= 500) setTexto(e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('comunidade.sussurros.placeholder')}
              maxLength={500}
              className="flex-1 rounded-full border border-gray-200 focus:border-purple-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-100 transition-all"
              style={{ fontFamily: 'var(--font-corpo)' }}
            />
            <button
              onClick={handleEnviar}
              disabled={!texto.trim() || enviando}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all disabled:opacity-40"
              style={{ backgroundColor: '#8B5CF6' }}
            >
              {enviando ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Sussurros — Componente principal
// ============================================================

export default function Sussurros() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()

  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [conversas, setConversas] = useState([])
  const [conversaAberta, setConversaAberta] = useState(null)

  useEffect(() => {
    inicializar()
  }, [])

  const inicializar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!userData) {
        setLoading(false)
        return
      }

      setUserId(userData.id)

      // Garantir conversas ghost no Supabase + carregar todas
      await ensureGhostConversations(userData.id)
      const conversasData = await getConversasSussurros(userData.id)
      const sorted = conversasData.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
      setConversas(sorted)

      // Verificar se ha param `para` para abrir conversa directamente
      const paraUserId = searchParams.get('para')
      if (paraUserId && paraUserId !== userData.id && (isGhostUser(paraUserId) || isGhostUUID(paraUserId))) {
        // Ghost — resolver UUID e abrir via Supabase
        const ghostUUID = resolveGhostId(paraUserId)
        try {
          const conversa = await getOuCriarSussurro(userData.id, ghostUUID)
          if (conversa) {
            const { data: conversaCompleta } = await supabase
              .from('community_conversations')
              .select(`
                *,
                user1_profile:community_profiles!community_conversations_user1_id_fkey (
                  user_id, display_name, avatar_emoji, avatar_url, avatar_color, iniciais
                ),
                user2_profile:community_profiles!community_conversations_user2_id_fkey (
                  user_id, display_name, avatar_emoji, avatar_url, avatar_color, iniciais
                )
              `)
              .eq('id', conversa.id)
              .single()
            if (conversaCompleta) setConversaAberta(conversaCompleta)
          }
        } catch (err) {
          console.error('Erro ao abrir conversa ghost:', err)
        }
      } else if (paraUserId && paraUserId !== userData.id) {
        try {
          const conversa = await getOuCriarSussurro(userData.id, paraUserId)
          if (conversa) {
            // Carregar os perfis da conversa para ter informacao completa
            const { data: conversaCompleta } = await supabase
              .from('community_conversations')
              .select(`
                *,
                user1_profile:community_profiles!community_conversations_user1_id_fkey (
                  user_id, display_name, avatar_emoji, avatar_url
                ),
                user2_profile:community_profiles!community_conversations_user2_id_fkey (
                  user_id, display_name, avatar_emoji, avatar_url
                )
              `)
              .eq('id', conversa.id)
              .single()

            if (conversaCompleta) {
              setConversaAberta(conversaCompleta)
            }

            // Actualizar lista de conversas
            const conversasActualizadas = await getConversasSussurros(userData.id)
            setConversas(conversasActualizadas)
          }
        } catch (error) {
          console.error('Erro ao abrir sussurro para utilizador:', error)
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar sussurros:', error)
    }
    setLoading(false)
  }

  const handleAbrirConversa = (conversa) => {
    setConversaAberta(conversa)
  }

  const handleVoltarParaLista = async () => {
    setConversaAberta(null)
    if (userId) {
      try {
        const conversasData = await getConversasSussurros(userId)
        const sorted = conversasData.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
        setConversas(sorted)
      } catch (error) {
        console.error('Erro ao recarregar conversas:', error)
      }
    }
  }

  // Estado nao autenticado
  if (!loading && !userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: 'linear-gradient(180deg, #FBF9FF 0%, #F5F0FA 100%)' }}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center text-4xl">
          🔒
        </div>
        <p className="text-gray-500 text-center text-sm" style={{ fontFamily: 'var(--font-corpo)' }}>
          {t('comunidade.sussurros.login_required')}
        </p>
        <button
          onClick={() => navigate('/comunidade')}
          className="text-sm font-medium px-5 py-2 rounded-full transition-colors hover:bg-purple-50"
          style={{ color: '#8B5CF6', fontFamily: 'var(--font-titulos)' }}
        >
          {t('comunidade.sussurros.back')}
        </button>
      </div>
    )
  }

  // Vista de conversa individual
  if (conversaAberta) {
    return (
      <SussurroView
        userId={userId}
        conversa={conversaAberta}
        onVoltar={handleVoltarParaLista}
      />
    )
  }

  // Vista de lista de conversas
  return (
    <ConversasSussurrosList
      userId={userId}
      conversas={conversas}
      loading={loading}
      onAbrirConversa={handleAbrirConversa}
    />
  )
}
