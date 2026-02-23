import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  getConversa,
  getMensagens,
  enviarMensagem,
  marcarMensagensLidas,
  subscribeToMessages,
  unsubscribe,
  formatarHora,
  formatarData,
  isDiasDiferentes,
  CANAIS
} from '../../lib/messenger'
import { useI18n } from '../../contexts/I18nContext'

export default function MessengerChat({ userId, conversaId }) {
  const navigate = useNavigate()
  const { t } = useI18n()

  const [loading, setLoading] = useState(true)
  const [conversa, setConversa] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const scrollContainerRef = useRef(null)

  // Carregar conversa e mensagens
  useEffect(() => {
    if (userId && conversaId) {
      carregarChat()
    }
  }, [userId, conversaId])

  // Real-time: escutar novas mensagens
  useEffect(() => {
    if (!conversaId) return

    const channel = subscribeToMessages(conversaId, (nova) => {
      setMensagens(prev => {
        const jaExiste = prev.some(m => m.id === nova.id)
        if (jaExiste) return prev
        return [...prev, nova]
      })

      // Marcar como lida se veio do coach/bot
      if (nova.sender_type !== 'user') {
        marcarMensagensLidas(conversaId)
      }
    })

    return () => unsubscribe(channel)
  }, [conversaId])

  // Auto-scroll ao fundo
  useEffect(() => {
    scrollParaFundo()
  }, [mensagens])

  const scrollParaFundo = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const carregarChat = async () => {
    setLoading(true)
    try {
      const [conversaData, msgs] = await Promise.all([
        getConversa(conversaId),
        getMensagens(conversaId)
      ])

      setConversa(conversaData)
      setMensagens(msgs)
      setHasMore(msgs.length >= 50)

      // Marcar mensagens como lidas
      await marcarMensagensLidas(conversaId)
    } catch (error) {
      console.error('Erro ao carregar chat:', error)
    }
    setLoading(false)
  }

  const carregarMais = async () => {
    if (loadingMore || !hasMore || mensagens.length === 0) return
    setLoadingMore(true)
    try {
      const maisAntigas = await getMensagens(conversaId, 50, mensagens[0]?.created_at)
      if (maisAntigas.length < 50) setHasMore(false)
      setMensagens(prev => [...maisAntigas, ...prev])
    } catch (error) {
      console.error('Erro ao carregar mais mensagens:', error)
    }
    setLoadingMore(false)
  }

  const handleEnviar = async () => {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return

    setEnviando(true)
    setTexto('')

    try {
      const novaMensagem = await enviarMensagem(conversaId, userId, conteudo)
      if (novaMensagem) {
        setMensagens(prev => {
          const jaExiste = prev.some(m => m.id === novaMensagem.id)
          if (jaExiste) return prev
          return [...prev, novaMensagem]
        })
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

  const canalInfo = conversa ? CANAIS[conversa.canal] || CANAIS.pessoal : CANAIS.pessoal

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'linear-gradient(180deg, #FAFAFE 0%, #F5F3FF 100%)' }}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-2xl animate-pulse shadow-sm">
          {canalInfo.emoji}
        </div>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'var(--font-titulos)', fontStyle: 'italic' }}>
          {t('messenger.opening')}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FAFAFE 0%, #F5F3FF 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3 p-3 sm:p-4">
          <button
            onClick={() => navigate('/messenger')}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label={t('common.back')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: `${canalInfo.cor}15` }}
          >
            {canalInfo.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate" style={{ fontFamily: 'var(--font-titulos)' }}>
              {canalInfo.label}
            </p>
            <p className="text-[10px] text-gray-400">
              {conversa?.canal === 'chatbot'
                ? t('messenger.chatbot_status')
                : t('messenger.personal_status')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 space-y-2">
          {/* Carregar mais */}
          {hasMore && mensagens.length > 0 && (
            <div className="text-center py-2">
              <button
                onClick={carregarMais}
                disabled={loadingMore}
                className="text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors"
              >
                {loadingMore ? t('messenger.loading_more') : t('messenger.load_more')}
              </button>
            </div>
          )}

          {/* Estado vazio */}
          {mensagens.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center text-3xl mx-auto mb-4">
                {canalInfo.emoji}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[250px] mx-auto">
                {conversa?.canal === 'chatbot'
                  ? t('messenger.empty_chatbot')
                  : t('messenger.empty_personal')
                }
              </p>
            </div>
          )}

          {/* Lista de mensagens */}
          {mensagens.map((msg, idx) => {
            const isUser = msg.sender_type === 'user'
            const isBot = msg.sender_type === 'bot'
            const isSystem = msg.tipo === 'sistema'
            const mostrarData = idx === 0 || isDiasDiferentes(mensagens[idx - 1]?.created_at, msg.created_at)

            // Mensagem de sistema
            if (isSystem) {
              return (
                <div key={msg.id || idx} className="flex justify-center py-2">
                  <span className="text-[11px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {msg.conteudo}
                  </span>
                </div>
              )
            }

            return (
              <div key={msg.id || idx}>
                {/* Separador de dia */}
                {mostrarData && (
                  <div className="flex items-center justify-center py-3">
                    <span className="text-[10px] text-gray-300 bg-white/60 px-3 py-1 rounded-full shadow-sm">
                      {formatarData(msg.created_at)}
                    </span>
                  </div>
                )}

                {/* Balão de mensagem */}
                <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}>
                  {/* Avatar para coach/bot */}
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-1"
                      style={{ backgroundColor: `${canalInfo.cor}15` }}
                    >
                      {isBot ? '🤖' : 'V'}
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                      isUser
                        ? 'rounded-br-md text-white'
                        : 'rounded-bl-md bg-white text-gray-800 shadow-sm border border-gray-50'
                    }`}
                    style={isUser ? { backgroundColor: '#8B5CF6' } : {}}
                  >
                    {/* Imagem */}
                    {msg.media_url && msg.tipo === 'imagem' && (
                      <img
                        src={msg.media_url}
                        alt={t('messenger.image')}
                        className="rounded-xl mb-2 max-w-full cursor-pointer"
                        onClick={() => window.open(msg.media_url, '_blank')}
                        loading="lazy"
                      />
                    )}

                    {/* Texto */}
                    {msg.conteudo && (
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {msg.conteudo}
                      </p>
                    )}

                    {/* Hora + estado */}
                    <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <p className={`text-[10px] ${isUser ? 'text-white/60' : 'text-gray-300'}`}>
                        {formatarHora(msg.created_at)}
                      </p>
                      {/* Indicador de lido para mensagens do user */}
                      {isUser && (
                        <svg
                          className={`w-3 h-3 ${msg.lida ? 'text-blue-300' : 'text-white/40'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
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

      {/* Barra de input */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex items-end gap-2 p-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('messenger.placeholder')}
              maxLength={1000}
              className="w-full bg-gray-50 rounded-2xl px-4 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all border border-transparent focus:border-purple-100"
              aria-label={t('messenger.placeholder')}
            />
            {texto.length > 800 && (
              <span className="absolute right-3 bottom-2.5 text-[9px] text-gray-300">
                {texto.length}/1000
              </span>
            )}
          </div>

          <button
            onClick={handleEnviar}
            disabled={!texto.trim() || enviando}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all active:scale-90 disabled:opacity-40 shadow-sm"
            style={{ backgroundColor: '#8B5CF6' }}
            aria-label={t('messenger.send')}
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
