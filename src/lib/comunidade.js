import { supabase } from './supabase'

// ============================================================
// COMUNIDADE — Funções de interação social
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
      ecos_activos: perfil.ecos_activos || [],
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
  if (error) throw error
  return data?.[0]
}

// ---------- POSTS ----------

export async function criarPost(userId, post) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert([{
      user_id: userId,
      tipo: post.tipo, // 'progresso', 'desafio', 'dica', 'pergunta', 'celebracao'
      eco: post.eco || null, // 'vitalis', 'aurea', 'lumina', etc.
      conteudo: post.conteudo,
      likes_count: 0,
      comments_count: 0
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

// ---------- LIKES ----------

export async function toggleLike(postId, userId) {
  // Verificar se já deu like
  const { data: existing } = await supabase
    .from('community_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    // Remover like
    await supabase.from('community_likes').delete().eq('id', existing.id)
    await supabase.rpc('decrement_likes', { post_id_input: postId })
    return false
  } else {
    // Adicionar like
    await supabase.from('community_likes').insert([{ post_id: postId, user_id: userId }])
    await supabase.rpc('increment_likes', { post_id_input: postId })
    return true
  }
}

export async function verificarLike(postId, userId) {
  const { data } = await supabase
    .from('community_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
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

// ---------- COMENTÁRIOS ----------

export async function getComentarios(postId) {
  const { data, error } = await supabase
    .from('community_comments')
    .select(`
      *,
      community_profiles!community_comments_user_id_fkey (
        display_name,
        avatar_emoji
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
    .insert([{
      post_id: postId,
      user_id: userId,
      conteudo
    }])
    .select()
  if (error) throw error

  // Incrementar contador
  await supabase.rpc('increment_comments', { post_id_input: postId })
  return data?.[0]
}

// ---------- FOLLOWS ----------

export async function seguirUtilizador(seguidorId, seguidoId) {
  const { error } = await supabase
    .from('community_follows')
    .insert([{
      follower_id: seguidorId,
      following_id: seguidoId
    }])
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

export async function getSeguidores(userId) {
  const { data, error } = await supabase
    .from('community_follows')
    .select(`
      follower_id,
      community_profiles!community_follows_follower_id_fkey (
        user_id,
        display_name,
        avatar_emoji,
        ecos_activos
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
        user_id,
        display_name,
        avatar_emoji,
        ecos_activos
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

// ---------- FEED PERSONALIZADO (apenas seguidos) ----------

export async function getFeedSeguidos(userId, page = 0, limit = 20) {
  // Obter lista de IDs que o utilizador segue
  const { data: seguidos } = await supabase
    .from('community_follows')
    .select('following_id')
    .eq('follower_id', userId)

  if (!seguidos?.length) return []

  const seguindoIds = seguidos.map(s => s.following_id)
  // Incluir os próprios posts
  seguindoIds.push(userId)

  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      community_profiles!community_posts_user_id_fkey (
        display_name,
        avatar_emoji,
        ecos_activos
      )
    `)
    .in('user_id', seguindoIds)
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw error
  return data || []
}

// ---------- HELPERS ----------

export const TIPOS_POST = {
  progresso: { label: 'Progresso', emoji: '📈', cor: '#10B981' },
  celebracao: { label: 'Celebração', emoji: '🎉', cor: '#F59E0B' },
  desafio: { label: 'Desafio', emoji: '💪', cor: '#EF4444' },
  dica: { label: 'Dica', emoji: '💡', cor: '#3B82F6' },
  pergunta: { label: 'Pergunta', emoji: '❓', cor: '#8B5CF6' }
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

export function tempoRelativo(dataStr) {
  const agora = new Date()
  const data = new Date(dataStr)
  const diffMs = agora - data
  const diffMin = Math.floor(diffMs / 60000)
  const diffHoras = Math.floor(diffMs / 3600000)
  const diffDias = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin}min`
  if (diffHoras < 24) return `há ${diffHoras}h`
  if (diffDias < 7) return `há ${diffDias}d`
  return data.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
}
