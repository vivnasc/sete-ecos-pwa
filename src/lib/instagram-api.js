/**
 * Instagram Publishing Client
 * Comunica com /api/instagram-publish para publicar no Instagram
 * e com Supabase para agendar publicações futuras
 */

import { supabase } from './supabase';

const API_URL = '/api/instagram-publish';

/**
 * Publicar imediatamente no Instagram
 */
export async function publicarAgora({ type, imageUrl, videoUrl, caption, coverUrl, shareToFeed }) {
  const body = { type, caption };

  if (type === 'reel') {
    body.videoUrl = videoUrl;
    if (coverUrl) body.coverUrl = coverUrl;
    body.shareToFeed = shareToFeed !== false;
  } else {
    body.imageUrl = imageUrl;
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }

  return data;
}

/**
 * Agendar publicação para data/hora específica
 */
export async function agendarPublicacao({ type, imageUrl, videoUrl, caption, coverUrl, shareToFeed, scheduledAt, platform, diaCalendario, tarefaTitulo }) {
  const { data: { user } } = await supabase.auth.getUser();

  const row = {
    type,
    caption,
    scheduled_at: scheduledAt,
    platform: platform || 'instagram',
    created_by: user?.id,
    dia_calendario: diaCalendario,
    tarefa_titulo: tarefaTitulo,
  };

  if (type === 'reel') {
    row.video_url = videoUrl;
    if (coverUrl) row.cover_url = coverUrl;
    row.share_to_feed = shareToFeed !== false;
  } else {
    row.image_url = Array.isArray(imageUrl) ? JSON.stringify(imageUrl) : imageUrl;
  }

  const { data, error } = await supabase
    .from('scheduled_posts')
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Agendar todas as publicações de um dia do calendário
 */
export async function agendarDiaCompleto(dia, tarefas, dataInicio) {
  const resultados = [];

  for (const tarefa of tarefas) {
    if (tarefa.tipo !== 'post' || !tarefa.post) continue;

    const [hora, min] = tarefa.hora.split(':').map(Number);
    const scheduledAt = new Date(dataInicio);
    scheduledAt.setHours(hora, min, 0, 0);

    // Skip if already past
    if (scheduledAt < new Date()) continue;

    const isCarousel = tarefa.post.tipo === 'carrossel';
    const imageUrl = isCarousel
      ? tarefa.post.imagens.map(img => `${window.location.origin}${img}`)
      : `${window.location.origin}${tarefa.post.imagens[0]}`;

    try {
      const result = await agendarPublicacao({
        type: isCarousel ? 'carousel' : 'photo',
        imageUrl,
        caption: tarefa.post.caption,
        scheduledAt: scheduledAt.toISOString(),
        diaCalendario: dia,
        tarefaTitulo: tarefa.titulo,
      });
      resultados.push({ sucesso: true, tarefa: tarefa.titulo, result });
    } catch (e) {
      resultados.push({ sucesso: false, tarefa: tarefa.titulo, erro: e.message });
    }
  }

  return resultados;
}

/**
 * Ver publicações agendadas
 */
export async function getAgendadas() {
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .order('scheduled_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Cancelar publicação agendada
 */
export async function cancelarPublicacao(id) {
  const { error } = await supabase
    .from('scheduled_posts')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

/**
 * Verificar se a Meta API está configurada
 */
export async function verificarMetaAPI() {
  try {
    const res = await fetch(API_URL, { method: 'GET' });
    const data = await res.json();
    return { configurada: data.configured === true, conta: data.account_name };
  } catch {
    return { configurada: false };
  }
}
