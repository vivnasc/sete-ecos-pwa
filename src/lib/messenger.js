import { supabase } from './supabase'

// ============================================================
// MESSENGER — Canal directo Vivianne <> Clientes
// Funciona para Sete Ecos + Os Sete Véus
// ============================================================

// ---------- CONVERSAS ----------

/**
 * Obter ou criar conversa com Vivianne
 * Cada utilizador tem uma conversa pessoal e opcionalmente uma chatbot
 */
export async function getOuCriarConversa(userId, canal = 'pessoal', origem = 'sete_ecos') {
  // Tentar obter conversa existente
  const { data: existente } = await supabase
    .from('messenger_conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('canal', canal)
    .eq('status', 'activa')
    .maybeSingle()

  if (existente) return existente

  // Criar nova conversa
  const { data, error } = await supabase
    .from('messenger_conversations')
    .insert([{
      user_id: userId,
      canal,
      origem,
      status: 'activa',
      last_message_at: new Date().toISOString()
    }])
    .select()

  if (error) throw error
  return data?.[0]
}

/**
 * Obter todas as conversas do utilizador
 */
export async function getConversas(userId) {
  const { data, error } = await supabase
    .from('messenger_conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'activa')
    .order('last_message_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Obter conversa específica
 */
export async function getConversa(conversaId) {
  const { data, error } = await supabase
    .from('messenger_conversations')
    .select('*')
    .eq('id', conversaId)
    .single()

  if (error) throw error
  return data
}

// ---------- MENSAGENS ----------

/**
 * Obter mensagens de uma conversa (paginadas, mais recentes primeiro)
 */
export async function getMensagens(conversaId, limit = 50, before = null) {
  let query = supabase
    .from('messenger_messages')
    .select('*')
    .eq('conversation_id', conversaId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt('created_at', before)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []).reverse()
}

/**
 * Enviar mensagem
 */
export async function enviarMensagem(conversaId, senderId, conteudo, tipo = 'texto', mediaUrl = null) {
  const { data, error } = await supabase
    .from('messenger_messages')
    .insert([{
      conversation_id: conversaId,
      sender_type: 'user',
      sender_id: senderId,
      conteudo,
      tipo,
      media_url: mediaUrl,
      lida: false
    }])
    .select()

  if (error) throw error

  // Actualizar conversa com última mensagem
  await supabase
    .from('messenger_conversations')
    .update({
      last_message: conteudo?.slice(0, 100),
      last_message_at: new Date().toISOString(),
      last_sender_type: 'user',
    })
    .eq('id', conversaId)

  // Incrementar unread_coach via update directo
  const { data: conv } = await supabase
    .from('messenger_conversations')
    .select('unread_coach')
    .eq('id', conversaId)
    .single()

  if (conv) {
    await supabase
      .from('messenger_conversations')
      .update({ unread_coach: (conv.unread_coach || 0) + 1 })
      .eq('id', conversaId)
  }

  // Notificar coach via push (best-effort, não bloqueia)
  notificarCoach(conteudo).catch(() => {})

  return data?.[0]
}

/**
 * Enviar push notification à coach quando utilizador envia mensagem
 */
async function notificarCoach(preview) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    await fetch('/api/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'messenger-notify-coach',
        preview: preview?.slice(0, 100)
      })
    })
  } catch (_) { /* push é best-effort */ }
}

/**
 * Marcar mensagens como lidas (pelo utilizador)
 */
export async function marcarMensagensLidas(conversaId) {
  await supabase
    .from('messenger_messages')
    .update({ lida: true })
    .eq('conversation_id', conversaId)
    .in('sender_type', ['coach', 'bot'])
    .eq('lida', false)

  // Reset unread_user
  await supabase
    .from('messenger_conversations')
    .update({ unread_user: 0 })
    .eq('id', conversaId)
}

/**
 * Contar total de mensagens não lidas do utilizador
 */
export async function contarNaoLidas(userId) {
  const { data } = await supabase
    .from('messenger_conversations')
    .select('unread_user')
    .eq('user_id', userId)
    .eq('status', 'activa')

  return (data || []).reduce((sum, c) => sum + (c.unread_user || 0), 0)
}

// ---------- REALTIME ----------

/**
 * Subscrever a novas mensagens numa conversa
 */
export function subscribeToMessages(conversaId, onNewMessage) {
  const channel = supabase
    .channel(`messenger-${conversaId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messenger_messages',
        filter: `conversation_id=eq.${conversaId}`
      },
      (payload) => {
        onNewMessage(payload.new)
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscrever a actualizações das conversas (para badge de unread)
 */
export function subscribeToConversations(userId, onUpdate) {
  const channel = supabase
    .channel(`messenger-convs-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messenger_conversations',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()

  return channel
}

/**
 * Remover subscrição
 */
export function unsubscribe(channel) {
  if (channel) {
    supabase.removeChannel(channel)
  }
}

// ---------- HELPERS ----------

export function tempoRelativo(dataStr) {
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

export function formatarHora(dataStr) {
  const data = new Date(dataStr)
  return data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

export function formatarData(dataStr) {
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

export function isDiasDiferentes(dataStr1, dataStr2) {
  if (!dataStr1 || !dataStr2) return true
  const d1 = new Date(dataStr1).toDateString()
  const d2 = new Date(dataStr2).toDateString()
  return d1 !== d2
}

// Canais disponíveis
export const CANAIS = {
  pessoal: {
    label: 'Vivianne',
    descricao: 'Conversa directa comigo',
    emoji: '💬',
    cor: '#8B5CF6'
  },
  chatbot: {
    label: 'Assistente',
    descricao: 'Respostas automáticas 24/7',
    emoji: '🤖',
    cor: '#10B981'
  }
}
