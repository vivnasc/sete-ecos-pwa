import { supabase } from './supabase'

// ============================================================
// COMUNIDADE — Rede Social Completa
// ============================================================

// ---------- PERFIL PÚBLICO ----------

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

// ---------- UPLOAD DE IMAGENS ----------

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

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const fileName = `avatars/${userId}.${ext}`

  const { data, error } = await supabase.storage
    .from('community-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })
  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('community-images')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

// ---------- POSTS ----------

export async function criarPost(userId, post) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert([{
      user_id: userId,
      tipo: post.tipo,
      eco: post.eco || null,
      conteudo: post.conteudo,
      imagem_url: post.imagem_url || null,
      hashtags: post.hashtags || [],
      likes_count: 0,
      comments_count: 0,
      saves_count: 0
    }])
    .select()
  if (error) throw error
  return data?.[0]
}

export async function getFeed(page = 0, limit = 20) {
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

export async function getFeedPorEco(eco, page = 0, limit = 20) {
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

export async function getPostsDoUtilizador(userId, page = 0, limit = 20) {
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

export async function apagarPost(postId, userId) {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId)
  if (error) throw error
}

// ---------- TRENDING / EXPLORE ----------

export async function getTrending(limit = 10) {
  const umaSemanaAtras = new Date()
  umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7)

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
    .gte('created_at', umaSemanaAtras.toISOString())
    .order('likes_count', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getSugestoesPerfis(userId, limit = 10) {
  // Buscar quem o user já segue
  const { data: seguidos } = await supabase
    .from('community_follows')
    .select('following_id')
    .eq('follower_id', userId)

  const seguindoIds = (seguidos || []).map(s => s.following_id)
  seguindoIds.push(userId) // Excluir o próprio

  const { data, error } = await supabase
    .from('community_profiles')
    .select('*')
    .not('user_id', 'in', `(${seguindoIds.join(',')})`)
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function pesquisarUtilizadores(query) {
  const { data, error } = await supabase
    .from('community_profiles')
    .select('*')
    .ilike('display_name', `%${query}%`)
    .limit(20)
  if (error) throw error
  return data || []
}

export async function pesquisarPosts(query) {
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
    .ilike('conteudo', `%${query}%`)
    .order('likes_count', { ascending: false })
    .limit(30)
  if (error) throw error
  return data || []
}

export async function pesquisarPorHashtag(hashtag) {
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
    .contains('hashtags', [hashtag])
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data || []
}

// ---------- LIKES ----------

export async function toggleLike(postId, userId) {
  const { data: existing } = await supabase
    .from('community_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await supabase.from('community_likes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_likes', { post_id_input: postId })
    return false
  } else {
    await supabase.from('community_likes').insert([{ post_id: postId, user_id: userId }])
    await supabase.rpc('increment_likes', { post_id_input: postId })
    return true
  }
}

export async function verificarLikesBatch(postIds, userId) {
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

// ---------- BOOKMARKS / GUARDADOS ----------

export async function toggleBookmark(postId, userId) {
  const { data: existing } = await supabase
    .from('community_bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await supabase.from('community_bookmarks').delete().eq('id', existing.id)
    await supabase.rpc('decrement_saves', { post_id_input: postId })
    return false
  } else {
    await supabase.from('community_bookmarks').insert([{ post_id: postId, user_id: userId }])
    await supabase.rpc('increment_saves', { post_id_input: postId })
    return true
  }
}

export async function verificarBookmarksBatch(postIds, userId) {
  if (!postIds.length) return {}
  const { data } = await supabase
    .from('community_bookmarks')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds)
  const map = {}
  ;(data || []).forEach(b => { map[b.post_id] = true })
  return map
}

export async function getBookmarks(userId, page = 0, limit = 20) {
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('community_bookmarks')
    .select(`
      post_id,
      community_posts (
        *,
        community_profiles!community_posts_user_id_fkey (
          display_name,
          avatar_emoji,
          avatar_url,
          ecos_activos
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw error
  return (data || []).map(b => b.community_posts).filter(Boolean)
}

// ---------- COMENTÁRIOS ----------

export async function getComentarios(postId) {
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

export async function criarComentario(postId, userId, conteudo) {
  const { data, error } = await supabase
    .from('community_comments')
    .insert([{ post_id: postId, user_id: userId, conteudo }])
    .select()
  if (error) throw error
  await supabase.rpc('increment_comments', { post_id_input: postId })
  return data?.[0]
}

// ---------- REACTIONS ----------

export async function toggleReaction(postId, userId, reactionType) {
  const { data: existing } = await supabase
    .from('community_reactions')
    .select('id, reaction_type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    if (existing.reaction_type === reactionType) {
      // Remover reaction
      await supabase.from('community_reactions').delete().eq('id', existing.id)
      return null
    } else {
      // Mudar reaction
      await supabase.from('community_reactions')
        .update({ reaction_type: reactionType })
        .eq('id', existing.id)
      return reactionType
    }
  } else {
    await supabase.from('community_reactions')
      .insert([{ post_id: postId, user_id: userId, reaction_type: reactionType }])
    return reactionType
  }
}

export async function getReactionsCounts(postId) {
  const { data, error } = await supabase
    .from('community_reactions')
    .select('reaction_type')
    .eq('post_id', postId)
  if (error) return {}

  const counts = {}
  ;(data || []).forEach(r => {
    counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1
  })
  return counts
}

export async function getMyReactionsBatch(postIds, userId) {
  if (!postIds.length) return {}
  const { data } = await supabase
    .from('community_reactions')
    .select('post_id, reaction_type')
    .eq('user_id', userId)
    .in('post_id', postIds)
  const map = {}
  ;(data || []).forEach(r => { map[r.post_id] = r.reaction_type })
  return map
}

// ---------- STORIES ----------

export async function criarStory(userId, story) {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  const { data, error } = await supabase
    .from('community_stories')
    .insert([{
      user_id: userId,
      tipo: story.tipo, // 'texto', 'imagem'
      conteudo: story.conteudo || '',
      imagem_url: story.imagem_url || null,
      cor_fundo: story.cor_fundo || '#8B5CF6',
      expires_at: expiresAt.toISOString()
    }])
    .select()
  if (error) throw error
  return data?.[0]
}

export async function getStoriesAtivos() {
  const agora = new Date().toISOString()

  const { data, error } = await supabase
    .from('community_stories')
    .select(`
      *,
      community_profiles!community_stories_user_id_fkey (
        user_id,
        display_name,
        avatar_emoji,
        avatar_url
      )
    `)
    .gt('expires_at', agora)
    .order('created_at', { ascending: false })
  if (error) throw error

  // Agrupar por utilizador
  const porUtilizador = {}
  ;(data || []).forEach(story => {
    const uid = story.user_id
    if (!porUtilizador[uid]) {
      porUtilizador[uid] = {
        user_id: uid,
        perfil: story.community_profiles,
        stories: []
      }
    }
    porUtilizador[uid].stories.push(story)
  })

  return Object.values(porUtilizador)
}

export async function marcarStoryVista(storyId, userId) {
  await supabase
    .from('community_story_views')
    .upsert({
      story_id: storyId,
      user_id: userId,
      viewed_at: new Date().toISOString()
    }, { onConflict: 'story_id,user_id' })
}

export async function getStoriesNaoVistas(userId) {
  const agora = new Date().toISOString()

  const { data, error } = await supabase
    .from('community_stories')
    .select(`
      id,
      user_id,
      community_story_views!left (
        user_id
      )
    `)
    .gt('expires_at', agora)
    .is('community_story_views.user_id', null)
  if (error) return {}

  const naoVistas = {}
  ;(data || []).forEach(s => {
    naoVistas[s.user_id] = true
  })
  return naoVistas
}

// ---------- MENSAGENS DIRECTAS ----------

export async function getConversas(userId) {
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

export async function getOuCriarConversa(userId1, userId2) {
  // Verificar se já existe
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

export async function getMensagens(conversaId, limit = 50) {
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

export async function enviarMensagem(conversaId, senderId, conteudo, imagemUrl = null) {
  const { data, error } = await supabase
    .from('community_messages')
    .insert([{
      conversation_id: conversaId,
      sender_id: senderId,
      conteudo,
      imagem_url: imagemUrl
    }])
    .select()
  if (error) throw error

  // Atualizar última mensagem da conversa
  await supabase
    .from('community_conversations')
    .update({
      last_message: conteudo,
      last_message_at: new Date().toISOString()
    })
    .eq('id', conversaId)

  return data?.[0]
}

// ---------- NOTIFICAÇÕES ----------

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
  if (userId === actorId) return // Não notificar a si próprio
  await supabase
    .from('community_notifications')
    .insert([{
      user_id: userId,
      actor_id: actorId,
      tipo, // 'like', 'comment', 'follow', 'mention', 'message'
      post_id: postId,
      conteudo,
      lida: false
    }])
}

// ---------- FOLLOWS ----------

export async function seguirUtilizador(seguidorId, seguidoId) {
  const { error } = await supabase
    .from('community_follows')
    .insert([{ follower_id: seguidorId, following_id: seguidoId }])
  if (error) throw error
  await criarNotificacao(seguidoId, seguidorId, 'follow')
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

export async function getSeguidores(userId) {
  const { data, error } = await supabase
    .from('community_follows')
    .select(`
      follower_id,
      community_profiles!community_follows_follower_id_fkey (
        user_id, display_name, avatar_emoji, avatar_url, ecos_activos
      )
    `)
    .eq('following_id', userId)
  if (error) throw error
  return data || []
}

export async function getSeguindo(userId) {
  const { data, error } = await supabase
    .from('community_follows')
    .select(`
      following_id,
      community_profiles!community_follows_following_id_fkey (
        user_id, display_name, avatar_emoji, avatar_url, ecos_activos
      )
    `)
    .eq('follower_id', userId)
  if (error) throw error
  return data || []
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

// ---------- FEED PERSONALIZADO ----------

export async function getFeedSeguidos(userId, page = 0, limit = 20) {
  const { data: seguidos } = await supabase
    .from('community_follows')
    .select('following_id')
    .eq('follower_id', userId)

  if (!seguidos?.length) return []

  const seguindoIds = seguidos.map(s => s.following_id)
  seguindoIds.push(userId)

  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      community_profiles!community_posts_user_id_fkey (
        display_name, avatar_emoji, avatar_url, ecos_activos
      )
    `)
    .in('user_id', seguindoIds)
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw error
  return data || []
}

// ---------- HELPERS / CONSTANTES ----------

export const TIPOS_POST = {
  progresso: { label: 'Progresso', emoji: '📈', cor: '#10B981' },
  celebracao: { label: 'Celebração', emoji: '🎉', cor: '#F59E0B' },
  desafio: { label: 'Desafio', emoji: '💪', cor: '#EF4444' },
  dica: { label: 'Dica', emoji: '💡', cor: '#3B82F6' },
  pergunta: { label: 'Pergunta', emoji: '❓', cor: '#8B5CF6' },
  motivacao: { label: 'Motivação', emoji: '🔥', cor: '#F97316' },
  antes_depois: { label: 'Antes/Depois', emoji: '🪞', cor: '#EC4899' }
}

export const ECOS_INFO = {
  vitalis: { label: 'Vitalis', cor: '#7C8B6F', emoji: '🌿' },
  aurea: { label: 'Áurea', cor: '#C9A227', emoji: '✨' },
  lumina: { label: 'Lumina', cor: '#8B5CF6', emoji: '🔮' },
  serena: { label: 'Serena', cor: '#0EA5E9', emoji: '🌊' },
  ignis: { label: 'Ignis', cor: '#F97316', emoji: '🔥' },
  ventis: { label: 'Ventis', cor: '#10B981', emoji: '🍃' },
  ecoa: { label: 'Ecoa', cor: '#3B82F6', emoji: '🗣️' },
  geral: { label: 'Geral', cor: '#6B7280', emoji: '🌸' }
}

export const REACTIONS = {
  heart: { emoji: '❤️', label: 'Adoro' },
  fire: { emoji: '🔥', label: 'Fogo' },
  clap: { emoji: '👏', label: 'Palmas' },
  strong: { emoji: '💪', label: 'Força' },
  sparkle: { emoji: '✨', label: 'Brilho' },
  hug: { emoji: '🤗', label: 'Abraço' }
}

export const STORY_COLORS = [
  '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
  '#F59E0B', '#10B981', '#3B82F6', '#1A1A4E',
  '#7C8B6F', '#C9A227'
]

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
