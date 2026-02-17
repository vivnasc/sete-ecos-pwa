import React, { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'
import { g } from '../../utils/genero'
import ModuleHeader from './ModuleHeader'

/**
 * AI COACH — Componente generico de coach IA para qualquer eco
 *
 * Cada eco tem um coach com personalidade unica:
 * - Serena: calma, validadora, acolhedora
 * - Ignis: directa, sem paternalismo, questiona motivacoes
 * - Ventis: gentil, ritmada, foco em sustentabilidade
 * - Ecoa: encorajadora, criativa, celebra expressao
 * - Imago: profunda, filosofica, integradora
 *
 * Uso:
 * <AICoach
 *   eco="serena"
 *   userId={userId}
 *   personality={SERENA_PERSONALITY}
 * />
 *
 * Personality config:
 * {
 *   name: 'Serena',
 *   greeting: 'Ola, como te sentes agora?',
 *   tone: 'calm',
 *   systemPrompt: '...',
 *   quickPrompts: ['Como lidar com ansiedade?', 'Tecnica de respiracao', ...],
 *   forbiddenPhrases: ['nao fiques triste', 'nao chores'],
 *   responseStyle: { maxLength: 300, useEmoji: false, formal: false }
 * }
 */

const COACH_AVATARS = {
  serena: { icon: '🌊', bg: '#6B8E9B' },
  ignis: { icon: '🔥', bg: '#C1634A' },
  ventis: { icon: '🍃', bg: '#5D9B84' },
  ecoa: { icon: '🗣️', bg: '#4A90A4' },
  imago: { icon: '🪞', bg: '#8B7BA5' },
  aurora: { icon: '🌅', bg: '#D4A5A5' }
}

export default function AICoach({ eco, userId, personality }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const theme = getEcoTheme(eco)
  const avatar = COACH_AVATARS[eco] || { icon: '💬', bg: theme.color }
  const chatTable = `${eco}_chat_messages`

  // Carregar historico
  useEffect(() => {
    if (!userId || historyLoaded) return
    loadHistory()
  }, [userId])

  // Scroll para baixo quando novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from(chatTable)
        .select('role, content, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (!error && data?.length > 0) {
        setMessages(data.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.created_at
        })))
      } else {
        // Mensagem de boas-vindas
        setMessages([{
          role: 'assistant',
          content: personality.greeting,
          timestamp: new Date().toISOString()
        }])
      }
    } catch (err) {
      console.error(`loadHistory(${eco}):`, err)
      setMessages([{
        role: 'assistant',
        content: personality.greeting,
        timestamp: new Date().toISOString()
      }])
    }
    setHistoryLoaded(true)
  }

  const saveMessage = async (role, content) => {
    if (!userId) return
    try {
      await supabase.from(chatTable).insert({
        user_id: userId,
        role,
        content,
        created_at: new Date().toISOString()
      })
    } catch (err) {
      console.error(`saveMessage(${eco}):`, err)
    }
  }

  const generateResponse = (userMessage) => {
    // Respostas baseadas em keywords e personalidade do coach
    // Cada eco pode sobrepor isto com logica mais avancada
    const msg = userMessage.toLowerCase()
    const responses = personality.responses || {}

    // Verificar keywords
    for (const [category, responseList] of Object.entries(responses)) {
      const keywords = personality.keywords?.[category] || []
      if (keywords.some(kw => msg.includes(kw))) {
        return responseList[Math.floor(Math.random() * responseList.length)]
      }
    }

    // Resposta generica baseada no tom
    const genericResponses = personality.genericResponses || [
      `Obrigad${g('o', 'a')} por partilhares isso comigo. Queres explorar mais este tema?`,
      'Entendo. Conta-me mais sobre como te sentes em relacao a isto.',
      'Isso e importante. O que achas que esta por tras desse sentimento?'
    ]

    return genericResponses[Math.floor(Math.random() * genericResponses.length)]
  }

  const handleSend = async (text) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMsg = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    await saveMessage('user', messageText)

    // Simular tempo de resposta
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

    const response = generateResponse(messageText)
    const assistantMsg = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, assistantMsg])
    await saveMessage('assistant', response)
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.colorDark }}>
      <ModuleHeader eco={eco} title={`Coach ${personality.name}`} compact />

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0"
                style={{ background: avatar.bg }}
              >
                {avatar.icon}
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-white/10 text-white rounded-br-md'
                  : 'bg-white/5 text-white/90 rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2"
              style={{ background: avatar.bg }}
            >
              {avatar.icon}
            </div>
            <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 2 && personality.quickPrompts?.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {personality.quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs text-white/70 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2 items-end max-w-lg mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Fala com ${personality.name}...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-white/20 transition-colors"
            rows={1}
            disabled={loading}
            aria-label={`Mensagem para ${personality.name}`}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl text-white transition-all disabled:opacity-30"
            style={{ background: theme.color }}
            aria-label="Enviar mensagem"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
