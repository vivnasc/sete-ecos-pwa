import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { coachApi } from '../lib/coachApi'
import { supabase } from '../lib/supabase'

// ─── Helpers ───
function tempoRelativo(dataStr) {
  if (!dataStr) return ''
  const agora = new Date()
  const data = new Date(dataStr)
  const diffMs = agora - data
  const diffMin = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMs / 3600000)
  const diffDias = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min`
  if (diffHoras < 24) return `${diffHoras}h`
  if (diffDias < 7) return `${diffDias}d`
  if (diffDias < 30) return `${Math.floor(diffDias / 7)}sem`
  return data.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
}

function formatarHora(dataStr) {
  return new Date(dataStr).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

function formatarData(dataStr) {
  const data = new Date(dataStr)
  const hoje = new Date()
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  if (data.toDateString() === hoje.toDateString()) return 'Hoje'
  if (data.toDateString() === ontem.toDateString()) return 'Ontem'
  return data.toLocaleDateString('pt-PT', {
    day: 'numeric', month: 'long',
    year: data.getFullYear() !== hoje.getFullYear() ? 'numeric' : undefined
  })
}

function isDiasDiferentes(d1, d2) {
  if (!d1 || !d2) return true
  return new Date(d1).toDateString() !== new Date(d2).toDateString()
}

// ─── Total unread badge ───
function UnreadTotal({ conversas }) {
  const total = (conversas || []).reduce((sum, c) => sum + (c.unread_coach || 0), 0)
  if (total === 0) return null
  return (
    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1.5">
      {total > 99 ? '99+' : total}
    </span>
  )
}

// ─── Conversa list item ───
function ConversaItem({ conversa, active, onClick }) {
  const isUnread = (conversa.unread_coach || 0) > 0
  const inicial = conversa.user_nome?.charAt(0)?.toUpperCase() || '?'

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 sm:p-4 text-left transition-all active:scale-[0.98] border-b border-gray-100 ${
        active ? 'bg-purple-50' : isUnread ? 'bg-amber-50/50' : 'bg-white hover:bg-gray-50'
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {inicial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
            {conversa.user_nome}
          </p>
          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
            {tempoRelativo(conversa.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className={`text-xs truncate ${isUnread ? 'font-medium text-gray-600' : 'text-gray-400'}`}>
            {conversa.last_sender_type === 'coach' && <span className="text-purple-500">Tu: </span>}
            {conversa.last_message || 'Sem mensagens'}
          </p>
          {isUnread && (
            <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">
              {conversa.unread_coach}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Chat view ───
function ChatView({ conversaId, conversa, onBack }) {
  const [mensagens, setMensagens] = useState([])
  const [loading, setLoading] = useState(true)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Carregar mensagens
  useEffect(() => {
    if (!conversaId) return
    carregarMensagens()
    // Marcar como lidas
    coachApi.messengerLidas(conversaId).catch(() => {})
  }, [conversaId])

  // Realtime
  useEffect(() => {
    if (!conversaId) return
    const channel = supabase
      .channel(`coach-msg-${conversaId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messenger_messages',
        filter: `conversation_id=eq.${conversaId}`
      }, (payload) => {
        const nova = payload.new
        setMensagens(prev => {
          if (prev.some(m => m.id === nova.id)) return prev
          return [...prev, nova]
        })
        // Se veio do user, marcar como lida
        if (nova.sender_type === 'user') {
          coachApi.messengerLidas(conversaId).catch(() => {})
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [conversaId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const carregarMensagens = async () => {
    setLoading(true)
    try {
      const data = await coachApi.messengerMensagens(conversaId, 50)
      setMensagens(data.mensagens || [])
      setHasMore((data.mensagens || []).length >= 50)
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err)
    }
    setLoading(false)
  }

  const carregarMais = async () => {
    if (loadingMore || !hasMore || mensagens.length === 0) return
    setLoadingMore(true)
    try {
      const data = await coachApi.messengerMensagens(conversaId, 50, mensagens[0]?.created_at)
      if ((data.mensagens || []).length < 50) setHasMore(false)
      setMensagens(prev => [...(data.mensagens || []), ...prev])
    } catch (err) {
      console.error('Erro ao carregar mais:', err)
    }
    setLoadingMore(false)
  }

  const handleEnviar = async () => {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return
    setEnviando(true)
    setTexto('')
    try {
      const data = await coachApi.messengerEnviar(conversaId, conteudo)
      if (data.mensagem) {
        setMensagens(prev => {
          if (prev.some(m => m.id === data.mensagem.id)) return prev
          return [...prev, data.mensagem]
        })
      }
    } catch (err) {
      console.error('Erro ao enviar:', err)
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

  const nome = conversa?.user_nome || 'Utilizador'
  const inicial = nome.charAt(0).toUpperCase()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-lg animate-pulse mx-auto mb-2">💬</div>
          <p className="text-xs text-gray-400">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-100 px-3 sm:px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors sm:hidden p-1" aria-label="Voltar">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {inicial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate">{nome}</p>
          <p className="text-[10px] text-gray-400 truncate">
            {conversa?.user_email || conversa?.canal || ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-1">
          {hasMore && mensagens.length > 0 && (
            <div className="text-center py-2">
              <button onClick={carregarMais} disabled={loadingMore} className="text-xs text-purple-500 hover:text-purple-700 font-medium">
                {loadingMore ? 'A carregar...' : 'Carregar anteriores'}
              </button>
            </div>
          )}

          {mensagens.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-3xl mx-auto mb-3">💬</div>
              <p className="text-sm text-gray-400">Ainda sem mensagens nesta conversa.</p>
              <p className="text-xs text-gray-300 mt-1">Escreve a primeira mensagem abaixo.</p>
            </div>
          )}

          {mensagens.map((msg, idx) => {
            const isCoach = msg.sender_type === 'coach'
            const isSystem = msg.tipo === 'sistema'
            const mostrarData = idx === 0 || isDiasDiferentes(mensagens[idx - 1]?.created_at, msg.created_at)

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center py-2">
                  <span className="text-[11px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.conteudo}</span>
                </div>
              )
            }

            return (
              <div key={msg.id}>
                {mostrarData && (
                  <div className="flex justify-center py-3">
                    <span className="text-[10px] text-gray-300 bg-white px-3 py-1 rounded-full shadow-sm">{formatarData(msg.created_at)}</span>
                  </div>
                )}
                <div className={`flex ${isCoach ? 'justify-end' : 'justify-start'} mb-1`}>
                  {!isCoach && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-300 to-violet-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mr-2 mt-1">
                      {inicial}
                    </div>
                  )}
                  <div className={`max-w-[78%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 ${
                    isCoach
                      ? 'rounded-br-md bg-gray-800 text-white'
                      : 'rounded-bl-md bg-white text-gray-800 shadow-sm border border-gray-100'
                  }`}>
                    {msg.media_url && msg.tipo === 'imagem' && (
                      <img src={msg.media_url} alt="Imagem" className="rounded-xl mb-2 max-w-full cursor-pointer" onClick={() => window.open(msg.media_url, '_blank')} loading="lazy" />
                    )}
                    {msg.conteudo && (
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.conteudo}</p>
                    )}
                    <div className={`flex items-center gap-1 mt-1 ${isCoach ? 'justify-end' : 'justify-start'}`}>
                      <p className={`text-[10px] ${isCoach ? 'text-white/50' : 'text-gray-300'}`}>
                        {formatarHora(msg.created_at)}
                      </p>
                      {isCoach && (
                        <svg className={`w-3 h-3 ${msg.lida ? 'text-blue-400' : 'text-white/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-2 p-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreve a tua resposta..."
              maxLength={2000}
              rows={1}
              className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all border border-transparent focus:border-gray-200 resize-none"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
              aria-label="Escrever mensagem"
            />
          </div>
          <button
            onClick={handleEnviar}
            disabled={!texto.trim() || enviando}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all active:scale-90 disabled:opacity-40 shadow-sm bg-gray-800 hover:bg-gray-700"
            aria-label="Enviar"
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

// ─── Main CoachMessenger ───
export default function CoachMessenger() {
  const { conversaId } = useParams()
  const navigate = useNavigate()
  const [conversas, setConversas] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeConversaId, setActiveConversaId] = useState(conversaId || null)
  const [search, setSearch] = useState('')

  // Carregar conversas
  useEffect(() => {
    carregarConversas()
    // Polling a cada 15s
    const interval = setInterval(carregarConversas, 15000)
    return () => clearInterval(interval)
  }, [])

  // Sync URL com conversa activa
  useEffect(() => {
    if (conversaId && conversaId !== activeConversaId) {
      setActiveConversaId(conversaId)
    }
  }, [conversaId])

  // Realtime para conversas (updates)
  useEffect(() => {
    const channel = supabase
      .channel('coach-convs-all')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messenger_conversations'
      }, () => {
        carregarConversas()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const carregarConversas = async () => {
    try {
      const data = await coachApi.messengerConversas()
      setConversas(data.conversas || [])
    } catch (err) {
      console.error('Erro ao carregar conversas:', err)
    }
    setLoading(false)
  }

  const handleSelectConversa = (id) => {
    setActiveConversaId(id)
    navigate(`/coach/messenger/${id}`, { replace: true })
  }

  const handleBack = () => {
    setActiveConversaId(null)
    navigate('/coach/messenger', { replace: true })
  }

  const activeConversa = conversas.find(c => c.id === activeConversaId)
  const totalUnread = conversas.reduce((sum, c) => sum + (c.unread_coach || 0), 0)

  // Filtrar conversas
  const conversasFiltradas = search
    ? conversas.filter(c =>
        (c.user_nome || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.last_message || '').toLowerCase().includes(search.toLowerCase())
      )
    : conversas

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl animate-pulse mx-auto mb-3">💬</div>
          <p className="text-sm text-gray-400">A carregar messenger...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/coach')} className="text-gray-400 hover:text-gray-600 transition-colors p-1" aria-label="Voltar ao painel">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">Messenger</h1>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">
            {conversas.length} conversa{conversas.length !== 1 ? 's' : ''} activa{conversas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={carregarConversas} className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50" aria-label="Actualizar">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Mobile: show either list or chat */}
      <div className="flex-1 flex flex-col sm:flex-row min-h-0">
        {/* Conversation list */}
        <div className={`${activeConversaId ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 sm:border-r border-gray-200 bg-white`}>
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Procurar conversa..."
                className="w-full bg-gray-50 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {conversasFiltradas.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">📭</div>
                <p className="text-sm text-gray-400">
                  {search ? 'Nenhuma conversa encontrada.' : 'Sem conversas ainda.'}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  As conversas aparecem quando clientes enviam mensagens.
                </p>
              </div>
            )}

            {conversasFiltradas.map(c => (
              <ConversaItem
                key={c.id}
                conversa={c}
                active={c.id === activeConversaId}
                onClick={() => handleSelectConversa(c.id)}
              />
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className={`${activeConversaId ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-h-0 bg-white`}>
          {activeConversaId ? (
            <ChatView
              conversaId={activeConversaId}
              conversa={activeConversa}
              onBack={handleBack}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center px-6">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center text-4xl mx-auto mb-4">💬</div>
                <h3 className="text-base font-semibold text-gray-600 mb-2">Selecciona uma conversa</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Escolhe uma conversa à esquerda para ver e responder às mensagens.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
