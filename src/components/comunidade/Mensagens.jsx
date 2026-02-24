import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getConversas, getOuCriarConversa, getMensagens, enviarMensagem, tempoRelativo } from '../../lib/comunidade'
import { useI18n } from '../../contexts/I18nContext'
import {
  isGhostUser,
  getGhostProfile,
  getGhostConversations,
  getGhostConversationMessages,
  sendMessageToGhost
} from '../../lib/ghost-users'

// ============================================================
// ConversasList — Lista de conversas (inbox)
// ============================================================

function ConversasList({ userId, onAbrirConversa }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [conversas, setConversas] = useState([])

  useEffect(() => {
    if (userId) carregarConversas()
  }, [userId])

  const carregarConversas = async () => {
    setLoading(true)
    try {
      const data = await getConversas(userId)
      const ghostConvs = getGhostConversations(userId)
      const merged = [...data, ...ghostConvs]
        .sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
      setConversas(merged)
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    }
    setLoading(false)
  }

  const getOutroPerfil = (conversa) => {
    if (conversa.user1_profile?.user_id === userId) {
      return conversa.user2_profile
    }
    return conversa.user1_profile
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl animate-pulse">
          💬
        </div>
        <p className="text-gray-400" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          {t('comunidade.mensagens.loading')}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
            {t('comunidade.mensagens.title')}
          </h1>
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="max-w-lg mx-auto">
        {conversas.length === 0 ? (
          <div className="text-center py-16 px-6">
            <span className="text-5xl block mb-4">💬</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              {t('comunidade.mensagens.empty_title')}
            </h3>
            <p className="text-sm text-gray-400">
              {t('comunidade.mensagens.empty_desc')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {conversas.map(conversa => {
              const outro = getOutroPerfil(conversa)
              if (!outro) return null

              return (
                <button
                  key={conversa.id}
                  onClick={() => onAbrirConversa(conversa.id, conversa._ghost)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-purple-50/50 transition-colors text-left"
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
                    {/* Indicador de nao lida */}
                    {conversa.unread && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#8B5CF6' }} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {outro.display_name}
                      </p>
                      {conversa.last_message_at && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {tempoRelativo(conversa.last_message_at)}
                        </span>
                      )}
                    </div>
                    {conversa.last_message && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {conversa.last_message}
                      </p>
                    )}
                  </div>

                  {/* Seta */}
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
// ChatView — Conversa individual
// ============================================================

function ChatView({ userId, conversaId }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [mensagens, setMensagens] = useState([])
  const [conversa, setConversa] = useState(null)
  const [outroPerfil, setOutroPerfil] = useState(null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)

  const isGhostConv = conversaId?.startsWith('ghost_conv_')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (userId && conversaId) carregarChat()
  }, [userId, conversaId])

  // Real-time: escutar novas mensagens (apenas conversas reais)
  useEffect(() => {
    if (!conversaId || isGhostConv) return

    const channel = supabase
      .channel(`mensagens-${conversaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `conversation_id=eq.${conversaId}`
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
  }, [conversaId])

  // Auto-scroll ao fundo quando chegam mensagens
  useEffect(() => {
    scrollParaFundo()
  }, [mensagens])

  const scrollParaFundo = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const carregarChat = async () => {
    setLoading(true)
    try {
      if (isGhostConv) {
        // Ghost conversation — tudo local
        const ghostId = conversaId.replace('ghost_conv_', '')
        const ghostPerfil = getGhostProfile(ghostId)
        setConversa({ id: conversaId, _ghost: true })
        setOutroPerfil(ghostPerfil ? {
          user_id: ghostId,
          display_name: ghostPerfil.display_name,
          avatar_emoji: ghostPerfil.avatar_emoji,
          avatar_url: null,
        } : null)
        const msgs = getGhostConversationMessages(userId, ghostId)
        setMensagens(msgs)
      } else {
        // Conversa real — Supabase
        const { data: conversaData, error: conversaError } = await supabase
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
          .eq('id', conversaId)
          .single()

        if (conversaError) throw conversaError
        setConversa(conversaData)

        if (conversaData.user1_profile?.user_id === userId) {
          setOutroPerfil(conversaData.user2_profile)
        } else {
          setOutroPerfil(conversaData.user1_profile)
        }

        const msgs = await getMensagens(conversaId)
        setMensagens(msgs)
      }
    } catch (error) {
      console.error('Erro ao carregar chat:', error)
    }
    setLoading(false)
  }

  const handleEnviar = async () => {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return

    setEnviando(true)
    setTexto('')

    try {
      if (isGhostConv) {
        const ghostId = conversaId.replace('ghost_conv_', '')
        const { userMsg, ghostReply } = sendMessageToGhost(userId, ghostId, conteudo)
        setMensagens(prev => [...prev, userMsg])
        // Simular resposta do ghost após 2s
        setTimeout(() => {
          setMensagens(prev => [...prev, ghostReply])
        }, 2000)
      } else {
        const novaMensagem = await enviarMensagem(conversaId, userId, conteudo)
        if (novaMensagem) {
          setMensagens(prev => {
            const jaExiste = prev.some(m => m.id === novaMensagem.id)
            if (jaExiste) return prev
            return [...prev, novaMensagem]
          })
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
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

  const formatarHora = (dataStr) => {
    const data = new Date(dataStr)
    return data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl animate-pulse">
          💬
        </div>
        <p className="text-gray-400" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          {t('comunidade.mensagens.opening')}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 p-4">
          <button onClick={() => navigate('/comunidade/mensagens')} className="text-gray-400 hover:text-gray-600">
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {mensagens.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">👋</span>
              <p className="text-sm text-gray-400">
                {t('comunidade.mensagens.first_message')}
              </p>
            </div>
          )}

          {mensagens.map((msg, idx) => {
            const isMinhas = msg.sender_id === userId
            const mostrarData = idx === 0 || isDiasDiferentes(mensagens[idx - 1]?.created_at, msg.created_at)

            return (
              <React.Fragment key={msg.id || idx}>
                {/* Separador de dia */}
                {mostrarData && (
                  <div className="flex items-center justify-center py-2">
                    <span className="text-xs text-gray-300 bg-white/60 px-3 py-1 rounded-full">
                      {formatarData(msg.created_at)}
                    </span>
                  </div>
                )}

                {/* Balao de mensagem */}
                <div className={`flex ${isMinhas ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMinhas
                        ? 'rounded-br-md text-white'
                        : 'rounded-bl-md bg-gray-100 text-gray-800'
                    }`}
                    style={isMinhas ? { backgroundColor: '#8B5CF6' } : {}}
                  >
                    {/* Imagem, se existir */}
                    {msg.imagem_url && (
                      <img
                        src={msg.imagem_url}
                        alt="Imagem"
                        className="rounded-xl mb-2 max-w-full cursor-pointer"
                        onClick={() => window.open(msg.imagem_url, '_blank')}
                      />
                    )}

                    {/* Conteudo texto */}
                    {msg.conteudo && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.conteudo}
                      </p>
                    )}

                    {/* Hora */}
                    <p className={`text-[10px] mt-1 text-right ${
                      isMinhas ? 'text-white/60' : 'text-gray-400'
                    }`}>
                      {formatarHora(msg.created_at)}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            )
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Barra de input */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-gray-100">
        <div className="max-w-lg mx-auto flex items-end gap-2 p-3">
          <input
            ref={inputRef}
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('comunidade.mensagens.placeholder')}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-200 transition-all"
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
  )
}

// ============================================================
// Helpers
// ============================================================

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

// ============================================================
// Mensagens — Componente principal (router)
// ============================================================

export default function Mensagens() {
  const { conversaId } = useParams()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { t } = useI18n()

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
      }
    } catch (error) {
      console.error('Erro ao inicializar mensagens:', error)
    }
    setLoading(false)
  }

  const handleAbrirConversa = (id, isGhost) => {
    navigate(`/comunidade/mensagens/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl animate-pulse">
          💬
        </div>
        <p className="text-gray-400" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          {t('comunidade.mensagens.loading')}
        </p>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: 'linear-gradient(180deg, #FCFCFF 0%, #F8F8FC 100%)' }}>
        <span className="text-5xl block mb-2">🔒</span>
        <p className="text-gray-500 text-center">{t('comunidade.mensagens.login_required')}</p>
        <button
          onClick={() => navigate('/comunidade')}
          className="text-sm font-medium px-4 py-2 rounded-full"
          style={{ color: '#8B5CF6' }}
        >
          {t('comunidade.mensagens.back')}
        </button>
      </div>
    )
  }

  // Se tem conversaId no URL, mostra o chat; senao, mostra a lista
  if (conversaId) {
    return <ChatView userId={userId} conversaId={conversaId} />
  }

  return <ConversasList userId={userId} onAbrirConversa={handleAbrirConversa} />
}
