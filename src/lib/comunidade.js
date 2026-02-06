import { supabase } from './supabase'

// ============================================================
// SETE ECOS — Espaço de Autoconhecimento
// Uma rede de transformação interior, não de exposição
// ============================================================

// ---------- ECOS ----------

export const ECOS_INFO = {
  vitalis: { label: 'Vitalis', cor: '#7C8B6F', emoji: '🌿', elemento: 'Terra' },
  aurea: { label: 'Áurea', cor: '#C9A227', emoji: '✨', elemento: 'Luz' },
  lumina: { label: 'Lumina', cor: '#8B5CF6', emoji: '🔮', elemento: 'Visão' },
  serena: { label: 'Serena', cor: '#0EA5E9', emoji: '🌊', elemento: 'Água' },
  ignis: { label: 'Ignis', cor: '#F97316', emoji: '🔥', elemento: 'Fogo' },
  ventis: { label: 'Ventis', cor: '#10B981', emoji: '🍃', elemento: 'Ar' },
  ecoa: { label: 'Ecoa', cor: '#3B82F6', emoji: '🗣️', elemento: 'Som' },
  geral: { label: 'Geral', cor: '#6B7280', emoji: '🌸', elemento: 'Essência' }
}

// ---------- PROMPTS DE REFLEXÃO ----------
// Perguntas guiadas para autoconhecimento profundo

export const PROMPTS_REFLEXAO = [
  // Gratidão & Presença
  { id: 'grat_1', eco: 'geral', tema: 'gratidao', texto: 'O que o teu corpo te ensinou hoje?', emoji: '🌸' },
  { id: 'grat_2', eco: 'geral', tema: 'gratidao', texto: 'Que pequeno momento te fez sorrir esta semana?', emoji: '☀️' },
  { id: 'grat_3', eco: 'geral', tema: 'gratidao', texto: 'A quem devias agradecer hoje? Porquê?', emoji: '🙏' },
  { id: 'grat_4', eco: 'geral', tema: 'gratidao', texto: 'Que parte de ti estás grata por ter?', emoji: '💛' },

  // Desafio & Coragem
  { id: 'des_1', eco: 'geral', tema: 'desafio', texto: 'Que medo estás a aprender a atravessar?', emoji: '🦋' },
  { id: 'des_2', eco: 'geral', tema: 'desafio', texto: 'O que te pareceu impossível e agora já não é?', emoji: '💪' },
  { id: 'des_3', eco: 'geral', tema: 'desafio', texto: 'Que limite interno estás a desafiar?', emoji: '🌄' },

  // Descoberta Interior
  { id: 'desc_1', eco: 'geral', tema: 'descoberta', texto: 'Que parte de ti estás a redescobrir?', emoji: '🔮' },
  { id: 'desc_2', eco: 'geral', tema: 'descoberta', texto: 'Se pudesses ouvir a tua intuição, o que diria agora?', emoji: '👁️' },
  { id: 'desc_3', eco: 'geral', tema: 'descoberta', texto: 'Que padrão repetitivo começas a perceber na tua vida?', emoji: '🔄' },

  // Intenção & Semente
  { id: 'int_1', eco: 'geral', tema: 'intencao', texto: 'Se pudesses plantar uma semente hoje, que seria?', emoji: '🌱' },
  { id: 'int_2', eco: 'geral', tema: 'intencao', texto: 'Que palavra queres que guie a tua semana?', emoji: '🧭' },
  { id: 'int_3', eco: 'geral', tema: 'intencao', texto: 'Que compromisso fazes contigo hoje?', emoji: '🤝' },

  // Transformação & Soltar
  { id: 'trans_1', eco: 'geral', tema: 'transformacao', texto: 'O que deixaste ir para te tornares mais tu?', emoji: '🔥' },
  { id: 'trans_2', eco: 'geral', tema: 'transformacao', texto: 'Quem eras há um ano? Quem estás a tornar-te?', emoji: '🦋' },
  { id: 'trans_3', eco: 'geral', tema: 'transformacao', texto: 'Que crença antiga já não te serve?', emoji: '🍂' },

  // Conexão & Vulnerabilidade
  { id: 'con_1', eco: 'geral', tema: 'conexao', texto: 'Que verdade ainda não disseste em voz alta?', emoji: '🕊️' },
  { id: 'con_2', eco: 'geral', tema: 'conexao', texto: 'Quando foi a última vez que pediste ajuda?', emoji: '🫶' },

  // Eco-Específicos: Vitalis (Corpo)
  { id: 'vit_1', eco: 'vitalis', tema: 'corpo', texto: 'Como te sentes no teu corpo hoje? Sem julgamento.', emoji: '🌿' },
  { id: 'vit_2', eco: 'vitalis', tema: 'corpo', texto: 'Que gesto de cuidado ofereceste ao teu corpo?', emoji: '🍃' },
  { id: 'vit_3', eco: 'vitalis', tema: 'corpo', texto: 'Que alimento te nutriu a alma, não só o corpo?', emoji: '🥑' },

  // Eco-Específicos: Áurea (Valor)
  { id: 'aur_1', eco: 'aurea', tema: 'valor', texto: 'Que acto de valor próprio praticaste hoje?', emoji: '✨' },
  { id: 'aur_2', eco: 'aurea', tema: 'valor', texto: 'Onde te diminuíste e como poderias ter brilhado?', emoji: '👑' },

  // Eco-Específicos: Lumina (Visão)
  { id: 'lum_1', eco: 'lumina', tema: 'visao', texto: 'Que padrão interior começas a reconhecer?', emoji: '🔮' },
  { id: 'lum_2', eco: 'lumina', tema: 'visao', texto: 'Se a tua intuição tivesse forma, como seria?', emoji: '🌙' },

  // Eco-Específicos: Serena (Emoção)
  { id: 'ser_1', eco: 'serena', tema: 'emocao', texto: 'Que emoção está a pedir para ser sentida?', emoji: '🌊' },
  { id: 'ser_2', eco: 'serena', tema: 'emocao', texto: 'Se a tua tristeza falasse, o que diria?', emoji: '💧' },

  // Eco-Específicos: Ignis (Vontade)
  { id: 'ign_1', eco: 'ignis', tema: 'vontade', texto: 'O que acende a tua chama interior?', emoji: '🔥' },
  { id: 'ign_2', eco: 'ignis', tema: 'vontade', texto: 'Que batalha interna estás a vencer?', emoji: '⚡' },
]

export const TEMAS_REFLEXAO = {
  gratidao: { label: 'Gratidão', emoji: '🙏', cor: '#F59E0B' },
  desafio: { label: 'Desafio', emoji: '🦋', cor: '#EF4444' },
  descoberta: { label: 'Descoberta', emoji: '🔮', cor: '#8B5CF6' },
  intencao: { label: 'Intenção', emoji: '🌱', cor: '#10B981' },
  transformacao: { label: 'Transformação', emoji: '🔥', cor: '#F97316' },
  conexao: { label: 'Conexão', emoji: '🕊️', cor: '#EC4899' },
  corpo: { label: 'Corpo', emoji: '🌿', cor: '#7C8B6F' },
  valor: { label: 'Valor', emoji: '✨', cor: '#C9A227' },
  visao: { label: 'Visão', emoji: '🔮', cor: '#6366F1' },
  emocao: { label: 'Emoção', emoji: '🌊', cor: '#0EA5E9' },
  vontade: { label: 'Vontade', emoji: '🔥', cor: '#F97316' },
  livre: { label: 'Livre', emoji: '🌸', cor: '#A855F7' }
}

// ---------- RESSONÂNCIA (em vez de likes) ----------

export const RESSONANCIA_TIPOS = {
  ressoo: { emoji: '🫧', label: 'Ressoo contigo', descricao: 'Sinto o mesmo' },
  luz: { emoji: '✨', label: 'Enviar Luz', descricao: 'Energia e clareza para ti' },
  forca: { emoji: '🌿', label: 'Dar Força', descricao: 'Coragem para o caminho' },
  espelho: { emoji: '🪞', label: 'Espelhar', descricao: 'Reflecte a minha experiência' },
  raiz: { emoji: '🌱', label: 'Enraizar', descricao: 'Isto aterra-me' }
}

// ---------- ESPELHOS (starters para respostas reflexivas) ----------

export const ESPELHO_STARTERS = [
  'Isto fez-me pensar em...',
  'Também senti isso quando...',
  'A tua partilha dá-me...',
  'Ressoo com isto porque...',
  'Obrigada por partilhares, eu...',
  'Isto toca-me porque...'
]

// ---------- SUSSURROS (modelos de apoio) ----------

export const SUSSURRO_MODELOS = [
  { texto: 'Estou contigo neste caminho 🌸', tipo: 'apoio' },
  { texto: 'Acredito em ti e na tua força 🌿', tipo: 'forca' },
  { texto: 'Não estás sozinha nisto 🫶', tipo: 'presenca' },
  { texto: 'A tua coragem inspira-me ✨', tipo: 'inspiracao' },
  { texto: 'Envia-te luz para este momento 🕯️', tipo: 'luz' },
  { texto: 'O teu caminho tem valor 🌱', tipo: 'validacao' }
]

// ============================================================
// PERFIL / JORNADA
// ============================================================

export async function getPerfilPublico(userId) {
  const { data, error } = await supabase
    .from('community_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertPerfilPublico(userId, perfil) {
  const { data, error } = await supabase
    .from('community_profiles')
    .upsert({
      user_id: userId,
      display_name: perfil.display_name,
      bio: perfil.bio || '',
      avatar_emoji: perfil.avatar_emoji || '🌸',
      avatar_url: perfil.avatar_url || null,
      ecos_activos: perfil.ecos_activos || [],
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
  if (error) throw error
  return data?.[0]
}

// ============================================================
// REFLEXÕES (substitui posts)
// ============================================================

export async function criarReflexao(userId, reflexao) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert([{
      user_id: userId,
      tipo: reflexao.tema || 'livre',
      eco: reflexao.eco || null,
      conteudo: reflexao.conteudo,
      prompt_id: reflexao.prompt_id || null,
      is_anonymous: reflexao.is_anonymous || false,
      imagem_url: reflexao.imagem_url || null,
      hashtags: reflexao.hashtags || [],
      likes_count: 0,
      comments_count: 0,
      saves_count: 0,
      ressonancia_count: 0
    }])
    .select()
  if (error) throw error
  return data?.[0]
}

export async function getRio(page = 0, limit = 20) {
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      community_profiles!community_posts_user_id_fkey (
        display_name,
        avatar_emoji,
        avatar_url,
        ecos_activos
      )
    `)
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw error
  return data || []
}

export async function getRioPorEco(eco, page = 0, limit = 20) {
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      community_profiles!community_posts_user_id_fkey (
        display_name,
        avatar_emoji,
        avatar_url,
        ecos_activos
      )
    `)
    .eq('eco', eco)
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw error
  return data || []
}

export async function getReflexoesDoUtilizador(userId, page = 0, limit = 20) {
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      community_profiles!community_posts_user_id_fkey (
        display_name,
        avatar_emoji,
        avatar_url,
        ecos_activos
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw error
  return data || []
}

export async function apagarReflexao(postId, userId) {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId)
  if (error) throw error
}

// Prompt do dia — seleciona baseado na data
export function getPromptDoDia(eco = null) {
  const hoje = new Date()
  const seed = hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate()
  const filtrados = eco
    ? PROMPTS_REFLEXAO.filter(p => p.eco === eco || p.eco === 'geral')
    : PROMPTS_REFLEXAO
  return filtrados[seed % filtrados.length]
}

// ============================================================
// RESSONÂNCIA (substitui likes)
// ============================================================

export async function darRessonancia(postId, userId, tipo) {
  // Verificar se já existe ressonância deste user
  const { data: existing } = await supabase
    .from('community_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    // Atualizar tipo (se a tabela suportar) ou remover
    await supabase.from('community_likes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_likes', { post_id_input: postId })
    return null
  } else {
    await supabase.from('community_likes').insert([{
      post_id: postId,
      user_id: userId
    }])
    await supabase.rpc('increment_likes', { post_id_input: postId })
    return tipo
  }
}

export async function verificarRessonanciaBatch(postIds, userId) {
  if (!postIds.length) return {}
  const { data } = await supabase
    .from('community_likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds)
  const map = {}
  ;(data || []).forEach(l => { map[l.post_id] = true })
  return map
}

// ============================================================
// ESPELHOS (substitui comentários)
// ============================================================

export async function getEspelhos(postId) {
  const { data, error } = await supabase
    .from('community_comments')
    .select(`
      *,
      community_profiles!community_comments_user_id_fkey (
        user_id,
        display_name,
        avatar_emoji,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function criarEspelho(postId, userId, conteudo) {
  const { data, error } = await supabase
    .from('community_comments')
    .insert([{ post_id: postId, user_id: userId, conteudo }])
    .select()
  if (error) throw error
  await supabase.rpc('increment_comments', { post_id_input: postId })
  return data?.[0]
}

// ============================================================
// CÍRCULOS DE ECO (pequenos grupos de apoio)
// ============================================================

export async function getCirculosDoEco(eco) {
  const { data, error } = await supabase
    .from('community_circulos')
    .select(`
      *,
      community_circulo_membros (
        user_id,
        role,
        community_profiles!community_circulo_membros_user_id_fkey (
          display_name, avatar_emoji, avatar_url
        )
      )
    `)
    .eq('eco', eco)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getMeusCirculos(userId) {
  const { data, error } = await supabase
    .from('community_circulo_membros')
    .select(`
      circulo_id,
      role,
      community_circulos (
        id, eco, nome, descricao, max_membros, intencao,
        community_circulo_membros (
          user_id,
          community_profiles!community_circulo_membros_user_id_fkey (
            display_name, avatar_emoji
          )
        )
      )
    `)
    .eq('user_id', userId)
  if (error) throw error
  return (data || []).map(d => ({ ...d.community_circulos, myRole: d.role }))
}

export async function entrarCirculo(circuloId, userId) {
  const { error } = await supabase
    .from('community_circulo_membros')
    .insert([{ circulo_id: circuloId, user_id: userId, role: 'membro' }])
  if (error) throw error
}

export async function sairCirculo(circuloId, userId) {
  const { error } = await supabase
    .from('community_circulo_membros')
    .delete()
    .eq('circulo_id', circuloId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function criarCirculo(userId, circulo) {
  const { data, error } = await supabase
    .from('community_circulos')
    .insert([{
      eco: circulo.eco,
      nome: circulo.nome,
      descricao: circulo.descricao || '',
      intencao: circulo.intencao || '',
      max_membros: circulo.max_membros || 12,
      criadora_id: userId
    }])
    .select()
  if (error) throw error

  // A criadora entra automaticamente como guardiã
  if (data?.[0]) {
    await supabase.from('community_circulo_membros').insert([{
      circulo_id: data[0].id,
      user_id: userId,
      role: 'guardia'
    }])
  }
  return data?.[0]
}

// ============================================================
// FOGUEIRA (espaço efémero — fogo comunal)
// ============================================================

export async function getFogueiraAtiva() {
  const agora = new Date().toISOString()
  const { data, error } = await supabase
    .from('community_fogueira')
    .select('*')
    .gt('expires_at', agora)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getChamas(fogueiraId) {
  const { data, error } = await supabase
    .from('community_fogueira_chamas')
    .select(`
      *,
      community_profiles!community_fogueira_chamas_user_id_fkey (
        display_name, avatar_emoji, avatar_url
      )
    `)
    .eq('fogueira_id', fogueiraId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function adicionarChama(fogueiraId, userId, conteudo) {
  const { data, error } = await supabase
    .from('community_fogueira_chamas')
    .insert([{
      fogueira_id: fogueiraId,
      user_id: userId,
      conteudo,
    }])
    .select()
  if (error) throw error
  return data?.[0]
}

export async function criarFogueira(tema, prompt) {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  const { data, error } = await supabase
    .from('community_fogueira')
    .insert([{
      tema,
      prompt,
      expires_at: expiresAt.toISOString()
    }])
    .select()
  if (error) throw error
  return data?.[0]
}

// ============================================================
// SUSSURROS (mensagens de apoio privadas)
// ============================================================

export async function getConversasSussurros(userId) {
  const { data, error } = await supabase
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
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getOuCriarSussurro(userId1, userId2) {
  const { data: existente } = await supabase
    .from('community_conversations')
    .select('*')
    .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
    .maybeSingle()

  if (existente) return existente

  const { data, error } = await supabase
    .from('community_conversations')
    .insert([{
      user1_id: userId1,
      user2_id: userId2,
      last_message_at: new Date().toISOString()
    }])
    .select()
  if (error) throw error
  return data?.[0]
}

export async function getSussurros(conversaId, limit = 50) {
  const { data, error } = await supabase
    .from('community_messages')
    .select(`
      *,
      community_profiles!community_messages_sender_id_fkey (
        display_name, avatar_emoji, avatar_url
      )
    `)
    .eq('conversation_id', conversaId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []).reverse()
}

export async function enviarSussurro(conversaId, senderId, conteudo) {
  const { data, error } = await supabase
    .from('community_messages')
    .insert([{
      conversation_id: conversaId,
      sender_id: senderId,
      conteudo
    }])
    .select()
  if (error) throw error

  await supabase
    .from('community_conversations')
    .update({
      last_message: conteudo,
      last_message_at: new Date().toISOString()
    })
    .eq('id', conversaId)

  return data?.[0]
}

// ============================================================
// FOLLOWS (sistema de conexão)
// ============================================================

export async function seguirUtilizador(seguidorId, seguidoId) {
  const { error } = await supabase
    .from('community_follows')
    .insert([{ follower_id: seguidorId, following_id: seguidoId }])
  if (error) throw error
}

export async function deixarDeSeguir(seguidorId, seguidoId) {
  const { error } = await supabase
    .from('community_follows')
    .delete()
    .eq('follower_id', seguidorId)
    .eq('following_id', seguidoId)
  if (error) throw error
}

export async function verificarSeguindo(seguidorId, seguidoId) {
  const { data } = await supabase
    .from('community_follows')
    .select('id')
    .eq('follower_id', seguidorId)
    .eq('following_id', seguidoId)
    .maybeSingle()
  return !!data
}

export async function contarSeguidoresESeguindo(userId) {
  const { count: seguidores } = await supabase
    .from('community_follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId)

  const { count: seguindo } = await supabase
    .from('community_follows')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', userId)

  return { seguidores: seguidores || 0, seguindo: seguindo || 0 }
}

// ============================================================
// NOTIFICAÇÕES
// ============================================================

export async function getNotificacoes(userId, limit = 30) {
  const { data, error } = await supabase
    .from('community_notifications')
    .select(`
      *,
      actor_profile:community_profiles!community_notifications_actor_id_fkey (
        display_name, avatar_emoji, avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function contarNotificacoesNaoLidas(userId) {
  const { count, error } = await supabase
    .from('community_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('lida', false)
  if (error) return 0
  return count || 0
}

export async function marcarNotificacoesLidas(userId) {
  await supabase
    .from('community_notifications')
    .update({ lida: true })
    .eq('user_id', userId)
    .eq('lida', false)
}

export async function criarNotificacao(userId, actorId, tipo, postId = null, conteudo = '') {
  if (userId === actorId) return
  await supabase
    .from('community_notifications')
    .insert([{
      user_id: userId,
      actor_id: actorId,
      tipo,
      post_id: postId,
      conteudo,
      lida: false
    }])
}

// ============================================================
// UPLOAD DE IMAGENS
// ============================================================

export async function uploadImagem(userId, file, bucket = 'community-images') {
  const ext = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

// ============================================================
// HELPERS
// ============================================================

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

export function extrairHashtags(texto) {
  const matches = texto.match(/#[\wÀ-ÿ]+/g)
  return matches ? matches.map(h => h.slice(1).toLowerCase()) : []
}

// Selecionar prompt aleatório por tema
export function getPromptPorTema(tema) {
  const filtrados = PROMPTS_REFLEXAO.filter(p => p.tema === tema)
  if (!filtrados.length) return PROMPTS_REFLEXAO[0]
  return filtrados[Math.floor(Math.random() * filtrados.length)]
}

// Prompts disponíveis para um eco
export function getPromptsParaEco(eco) {
  return PROMPTS_REFLEXAO.filter(p => p.eco === eco || p.eco === 'geral')
}

// Contar reflexões do utilizador
export async function contarReflexoes(userId) {
  const { count } = await supabase
    .from('community_posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count || 0
}

// Contar ressonância total recebida
export async function contarRessonanciaRecebida(userId) {
  const { data } = await supabase
    .from('community_posts')
    .select('likes_count')
    .eq('user_id', userId)
  return (data || []).reduce((sum, p) => sum + (p.likes_count || 0), 0)
}
