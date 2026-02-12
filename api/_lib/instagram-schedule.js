/**
 * API Endpoint: Publicação Agendada no Instagram
 *
 * Este endpoint é chamado por um cron job para:
 * 1. Buscar posts agendados na tabela 'scheduled_posts' (scheduled_at <= agora, status = 'pending')
 * 2. Publicar cada post via Meta Graph API
 * 3. Atualizar o estado para 'published' ou 'failed'
 *
 * Tabela Supabase 'scheduled_posts':
 * - id: uuid (PK)
 * - type: text ('photo' | 'carousel' | 'story')
 * - image_url: text ou jsonb (URL única ou array de URLs)
 * - caption: text
 * - scheduled_at: timestamptz
 * - status: text ('pending' | 'published' | 'failed')
 * - error_message: text (null se sucesso)
 * - published_at: timestamptz (null até publicar)
 * - media_id: text (ID do Instagram após publicação)
 * - created_by: uuid (user_id de quem agendou)
 * - created_at: timestamptz
 *
 * Configurar no vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/instagram-schedule",
 *     "schedule": "0 7 * * *"  // Diariamente às 7h UTC (Vercel Hobby = 1x/dia)
 *   }]
 * }
 *
 * NOTA: Vercel Hobby só permite crons diários.
 * O scheduler publica TODOS os posts do dia de uma vez (até 25).
 *
 * Variáveis de ambiente:
 * - SUPABASE_URL ou VITE_SUPABASE_URL
 * - SUPABASE_SERVICE_KEY ou VITE_SUPABASE_ANON_KEY
 * - META_ACCESS_TOKEN
 * - INSTAGRAM_ACCOUNT_ID
 * - CRON_SECRET (opcional, para autorização)
 */

import { createClient } from '@supabase/supabase-js';
import { publishToInstagram } from '../instagram-publish.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Limite de posts por execução (Hobby cron = 1x/dia, processar todos)
const MAX_POSTS_PER_RUN = 25;

// Intervalo mínimo entre publicações (ms) para respeitar rate limits da Meta
const DELAY_BETWEEN_POSTS = 3000;

export default async function handler(req, res) {
  // Auth centralizada no api/cron.js dispatcher

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('SUPABASE_URL ou SUPABASE_SERVICE_KEY não configurados');
    return res.status(500).json({ error: 'Configuração do Supabase em falta' });
  }

  if (!process.env.META_ACCESS_TOKEN || !process.env.INSTAGRAM_ACCOUNT_ID) {
    console.error('META_ACCESS_TOKEN ou INSTAGRAM_ACCOUNT_ID não configurados');
    return res.status(500).json({ error: 'Configuração do Instagram em falta' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const resultados = {
    processados: 0,
    publicados: 0,
    falhados: 0,
    erros: []
  };

  try {
    // 1. Buscar posts pendentes cuja hora de agendamento ja passou
    const agora = new Date().toISOString();

    const { data: posts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', agora)
      .order('scheduled_at', { ascending: true })
      .limit(MAX_POSTS_PER_RUN);

    if (fetchError) {
      console.error('Erro ao buscar posts agendados:', fetchError);
      return res.status(500).json({
        error: 'Erro ao buscar posts agendados',
        detalhes: fetchError.message
      });
    }

    if (!posts || posts.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Nenhum post pendente para publicar',
        ...resultados
      });
    }

    console.log(`Encontrados ${posts.length} posts pendentes para publicar`);

    // 2. Processar cada post
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      resultados.processados++;

      try {
        // Marcar como em processamento para evitar duplicados
        await supabase
          .from('scheduled_posts')
          .update({ status: 'processing' })
          .eq('id', post.id)
          .eq('status', 'pending');

        // Preparar imageUrl (pode ser string ou array JSON)
        let imageUrl = post.image_url;
        if (post.type === 'carousel' && typeof imageUrl === 'string') {
          try {
            imageUrl = JSON.parse(imageUrl);
          } catch {
            // Se nao e JSON valido, pode ser uma string separada por virgulas
            imageUrl = imageUrl.split(',').map(url => url.trim());
          }
        }

        // Publicar via Meta Graph API
        const result = await publishToInstagram({
          type: post.type,
          imageUrl,
          caption: post.caption
        });

        // Actualizar como publicado
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
            media_id: result.mediaId || null,
            error_message: null
          })
          .eq('id', post.id);

        resultados.publicados++;
        console.log(`Post ${post.id} publicado com sucesso (media: ${result.mediaId})`);

      } catch (postError) {
        const errorMessage = postError.message || 'Erro desconhecido';
        console.error(`Erro ao publicar post ${post.id}:`, errorMessage);

        // Verificar se e rate limit
        if (postError.statusCode === 429) {
          // Rate limit - marcar como pendente novamente para tentar depois
          await supabase
            .from('scheduled_posts')
            .update({
              status: 'pending',
              error_message: `Rate limit atingido: ${errorMessage}`
            })
            .eq('id', post.id);

          resultados.erros.push(`Post ${post.id}: Rate limit - reagendado`);
          // Parar de processar mais posts nesta execucao
          break;
        }

        // Outros erros - marcar como falhado
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: errorMessage
          })
          .eq('id', post.id);

        resultados.falhados++;
        resultados.erros.push(`Post ${post.id}: ${errorMessage}`);
      }

      // Aguardar entre publicacoes para respeitar rate limits
      if (i < posts.length - 1) {
        await sleep(DELAY_BETWEEN_POSTS);
      }
    }

    return res.status(200).json({
      success: true,
      ...resultados
    });

  } catch (error) {
    console.error('Erro nas publicacoes agendadas:', error);
    return res.status(500).json({
      error: 'Erro ao executar publicacoes agendadas',
      detalhes: error.message
    });
  }
}

/**
 * Helper para aguardar (Promise-based sleep)
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
