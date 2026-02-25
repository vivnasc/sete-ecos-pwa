import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getConversas, getOuCriarConversa, getMensagens, enviarMensagem, tempoRelativo, getConexoesIds } from '../../lib/comunidade'
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
// ConversasList — Lista de conversas (inbox)
// ============================================================

function ConversasList({ userId, onAbrirConversa }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [conversas, setConversas] = useState([])
  const [mostrarContactos, setMostrarContactos] = useState(false)
  const [contactos, setContactos] = useState([])
  const [loadingContactos, setLoadingContactos] = useState(false)
  const [criandoConversa, setCriandoConversa] = useState(null)

  useEffect(() => {
    if (userId) carregarConversas()
  }, [userId])

  const carregarConversas = async () => {
    setLoading(true)
    try {
      // Garantir que existem conversas ghost no Supabase
      await ensureGhostConversations(userId)

      // Buscar TODAS as conversas (reais + ghost) do Supabase
      const data = await getConversas(userId)
      const sorted = data.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
      setConversas(sorted)
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    }
    setLoading(false)
  }

  const carregarContactos = async () => {
    setLoadingContactos(true)
    try {
      // Conexoes reais
      const ids = await getConexoesIds(userId)
      let perfisReais = []
      if (ids.length > 0) {
        const { data } = await supabase
          .from('community_profiles')
          .select('user_id, display_name, avatar_emoji, avatar_url, avatar_color, iniciais, is_ghost')
          .in('user_id', ids)
        perfisReais = data || []
      }

      // Ghost profiles — buscar do Supabase
      const { data: ghostProfiles } = await supabase
        .from('community_profiles')
        .select('user_id, display_name, avatar_emoji, avatar_url, avatar_color, iniciais, is_ghost')
        .eq('is_ghost', true)

      // Conexoes ghost aceites (do localStorage)
      const stored = JSON.parse(localStorage.getItem('ghost_connections') || '{}')
      const ghostConectados = (ghostProfiles || []).filter(gp => {
        const key = `${userId}_${gp.user_id}`
        return stored[key] === 'connected'
      })

      // Filtrar quem ja tem conversa aberta
      const idsComConversa = new Set(
        conversas.map(c => {
          const u1 = c.user1_profile?.user_id || c.user1_id
          const u2 = c.user2_profile?.user_id || c.user2_id
          return u1 === userId ? u2 : u1
        }).filter(Boolean)
      )

      const todos = [...perfisReais, ...ghostConectados]
        .filter(p => p.user_id !== userId && !idsComConversa.has(p.user_id))
        // Deduplicar por user_id
        .filter((p, i, arr) => arr.findIndex(x => x.user_id === p.user_id) === i)

      setContactos(todos)
    } catch (error) {
      console.error('Erro ao carregar contactos:', error)
    }
    setLoadingContactos(false)
  }

  const handleNovaConversa = () => {
    setMostrarContactos(true)
    carregarContactos()
  }

  const handleEscolherContacto = async (contacto) => {
    setCriandoConversa(contacto.user_id)
    try {
      // Tudo vai para o Supabase — ghosts e reais tratados igual
      const conversa = await getOuCriarConversa(userId, contacto.user_id)
      if (conversa) {
        onAbrirConversa(conversa.id)
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
    }
    setCriandoConversa(null)
    setMostrarContactos(false)
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
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold flex-1" style={{ fontFamily: 'var(--font-titulos)', color: '#1A1A4E' }}>
            {t('comunidade.mensagens.title')}
          </h1>
          <button
            onClick={handleNovaConversa}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all active:scale-95"
            style={{ backgroundColor: '#8B5CF6' }}
            aria-label="Nova conversa"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Picker de contactos */}
      {mostrarContactos && (
        <div className="max-w-lg mx-auto bg-white border-b border-gray-100 animate-fadeIn">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nova conversa</p>
            <button
              onClick={() => setMostrarContactos(false)}
              className="text-xs text-gray-400"
            >
              Cancelar
            </button>
          </div>
          {loadingContactos ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : contactos.length === 0 ? (
            <div className="text-center py-6 px-4">
              <p className="text-xs text-gray-400">Todas as tuas conexões já têm conversa aberta</p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
              {contactos.map(c => (
                <button
                  key={c.user_id}
                  onClick={() => handleEscolherContacto(c)}
                  disabled={criandoConversa === c.user_id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50/50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-lg flex-shrink-0">
                    {c.avatar_emoji || '🌸'}
                  </div>
                  <p className="text-sm font-medium text-gray-700 truncate flex-1">
                    {c.display_name}
                  </p>
                  {criandoConversa === c.user_id && (
                    <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de conversas */}
      <div className="max-w-lg mx-auto">
        {conversas.length === 0 ? (
          <div className="text-center py-16 px-6">
            <span className="text-5xl block mb-4">💬</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'var(--font-titulos)' }}>
              {t('comunidade.mensagens.empty_title')}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {t('comunidade.mensagens.empty_desc')}
            </p>
            <button
              onClick={handleNovaConversa}
              className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all active:scale-95"
              style={{ backgroundColor: '#8B5CF6' }}
            >
              Nova conversa
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {conversas.map(conversa => {
              const outro = getOutroPerfil(conversa)
              if (!outro) return null

              return (
                <button
                  key={conversa.id}
                  onClick={() => onAbrirConversa(conversa.id)}
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
                    ) : outro.avatar_color ? (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: typeof outro.avatar_color === 'object' ? outro.avatar_color.bg : '#8B5CF6',
                          color: typeof outro.avatar_color === 'object' ? outro.avatar_color.text : '#FFF'
                        }}
                      >
                        {outro.iniciais || outro.avatar_emoji || '🌸'}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl">
                        {outro.avatar_emoji || '🌸'}
                      </div>
                    )}
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
// ChatView — Conversa individual (tudo via Supabase)
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
  const [ghostTyping, setGhostTyping] = useState(false)

  // Detectar se o outro user é ghost
  const ghostUUIDs = new Set(Object.values(GHOST_UUID_MAP))
  const outroId = conversa
    ? (conversa.user1_id === userId ? conversa.user2_id : conversa.user1_id)
    : null
  const isGhostConv = outroId ? ghostUUIDs.has(outroId) || isGhostUUID(outroId) : false

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (userId && conversaId) carregarChat()
  }, [userId, conversaId])

  // Real-time: escutar novas mensagens (funciona para TODAS as conversas)
  useEffect(() => {
    if (!conversaId) return

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
  }, [mensagens, ghostTyping])

  const scrollParaFundo = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const carregarChat = async () => {
    setLoading(true)
    try {
      // Tudo via Supabase — sem branching ghost/real
      const { data: conversaData, error: conversaError } = await supabase
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
      if (isGhostConv && outroId) {
        // Ghost: enviar mensagem + gerar resposta contextual
        const { userMsg, ghostReplyText, ghostUUID } = await sendMessageToGhostSupabase(
          conversaId, userId, outroId, conteudo
        )

        if (userMsg) {
          setMensagens(prev => {
            const jaExiste = prev.some(m => m.id === userMsg.id)
            if (jaExiste) return prev
            return [...prev, userMsg]
          })
        }

        // Mostrar "a escrever..." e inserir resposta após delay
        setGhostTyping(true)
        const delay = 2000 + Math.random() * 3000 // 2-5 segundos
        setTimeout(async () => {
          try {
            await insertGhostReply(conversaId, ghostUUID, ghostReplyText)
            // A mensagem vai chegar via real-time subscription
          } catch (err) {
            console.error('Erro ao inserir ghost reply:', err)
          }
          setGhostTyping(false)
        }, delay)
      } else {
        // User real — enviar via Supabase normal
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
              ) : outroPerfil.avatar_color ? (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: typeof outroPerfil.avatar_color === 'object' ? outroPerfil.avatar_color.bg : '#8B5CF6',
                    color: typeof outroPerfil.avatar_color === 'object' ? outroPerfil.avatar_color.text : '#FFF'
                  }}
                >
                  {outroPerfil.iniciais || outroPerfil.avatar_emoji || '🌸'}
                </div>
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

          {/* Typing indicator */}
          {ghostTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

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

  const handleAbrirConversa = (id) => {
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
        <p className="text-gray-500 text-center">{t('comunidade.mensagens.auth_required')}</p>
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

  if (conversaId) {
    return <ChatView userId={userId} conversaId={conversaId} />
  }

  return <ConversasList userId={userId} onAbrirConversa={handleAbrirConversa} />
}
