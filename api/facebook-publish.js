/**
 * API Endpoint: Publicar no Facebook via Meta Graph API
 *
 * Tipos de publicação suportados:
 * - post: Post com texto e/ou imagem na Página
 * - photo: Foto com legenda na Página
 * - video: Vídeo com legenda na Página (incluindo Reels)
 * - link: Partilhar link com texto na Página
 *
 * Body (JSON):
 * {
 *   type: 'post' | 'photo' | 'video' | 'link',
 *   message: string,              // Texto do post
 *   imageUrl: string,             // URL pública da imagem (photo)
 *   videoUrl: string,             // URL pública do vídeo (video)
 *   linkUrl: string,              // URL para partilhar (link)
 *   isReel: boolean,              // Publicar vídeo como Reel do Facebook
 *   title: string                 // Título do vídeo (opcional)
 * }
 *
 * Variáveis de ambiente necessárias:
 * - META_ACCESS_TOKEN: Token de acesso com permissão pages_manage_posts
 * - FACEBOOK_PAGE_ID: ID da Página do Facebook
 * - FACEBOOK_PAGE_TOKEN: Token específico da Página (ou usa META_ACCESS_TOKEN)
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

const POLL_INTERVAL = 2000;
const POLL_TIMEOUT = 120000;

export default async function handler(req, res) {
  // CORS
  const allowedOrigins = [
    'https://app.seteecos.com',
    'https://seteecos.com',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN || process.env.META_ACCESS_TOKEN;
  const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

  if (!PAGE_TOKEN || !PAGE_ID) {
    console.error('FACEBOOK_PAGE_TOKEN/META_ACCESS_TOKEN ou FACEBOOK_PAGE_ID não configurados');
    return res.status(500).json({ error: 'Configuração do Facebook em falta' });
  }

  try {
    const { type, message, imageUrl, videoUrl, linkUrl, isReel, title } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Campo type é obrigatório' });
    }

    if (!['post', 'photo', 'video', 'link'].includes(type)) {
      return res.status(400).json({ error: 'Tipo inválido. Use: post, photo, video ou link' });
    }

    let result;

    switch (type) {
      case 'post':
        if (!message) {
          return res.status(400).json({ error: 'Campo message é obrigatório para posts' });
        }
        result = await publishPost(PAGE_ID, PAGE_TOKEN, message);
        break;

      case 'photo':
        if (!imageUrl) {
          return res.status(400).json({ error: 'Campo imageUrl é obrigatório para fotos' });
        }
        result = await publishPhoto(PAGE_ID, PAGE_TOKEN, imageUrl, message);
        break;

      case 'video':
        if (!videoUrl) {
          return res.status(400).json({ error: 'Campo videoUrl é obrigatório para vídeos' });
        }
        result = await publishVideo(PAGE_ID, PAGE_TOKEN, videoUrl, message, { isReel, title });
        break;

      case 'link':
        if (!linkUrl) {
          return res.status(400).json({ error: 'Campo linkUrl é obrigatório para links' });
        }
        result = await publishLink(PAGE_ID, PAGE_TOKEN, linkUrl, message);
        break;
    }

    return res.status(200).json({
      success: true,
      type,
      platform: 'facebook',
      ...result
    });

  } catch (error) {
    console.error('Erro ao publicar no Facebook:', error);

    if (error.graphError) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
        code: error.graphError.code,
        subcode: error.graphError.error_subcode,
        type: error.graphError.type
      });
    }

    return res.status(500).json({ error: error.message || 'Erro interno ao publicar no Facebook' });
  }
}

/**
 * Publicar post de texto na Página
 */
async function publishPost(pageId, token, message) {
  const url = `${GRAPH_API_BASE}/${pageId}/feed`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: token,
      message
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throwGraphError('Erro ao publicar post no Facebook', response.status, data.error);
  }

  return { postId: data.id };
}

/**
 * Publicar foto na Página
 */
async function publishPhoto(pageId, token, imageUrl, caption) {
  const url = `${GRAPH_API_BASE}/${pageId}/photos`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: token,
      url: imageUrl,
      message: caption || ''
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throwGraphError('Erro ao publicar foto no Facebook', response.status, data.error);
  }

  return { postId: data.post_id || data.id, photoId: data.id };
}

/**
 * Publicar vídeo na Página (ou Reel)
 */
async function publishVideo(pageId, token, videoUrl, description, options = {}) {
  const { isReel, title } = options;

  // Facebook Reels usa endpoint diferente
  if (isReel) {
    return publishFacebookReel(pageId, token, videoUrl, description);
  }

  const url = `${GRAPH_API_BASE}/${pageId}/videos`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: token,
      file_url: videoUrl,
      description: description || '',
      title: title || ''
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throwGraphError('Erro ao publicar vídeo no Facebook', response.status, data.error);
  }

  return { videoId: data.id };
}

/**
 * Publicar Reel na Página do Facebook
 * Usa o fluxo de 2 passos: inicializar + publicar
 */
async function publishFacebookReel(pageId, token, videoUrl, description) {
  // 1. Inicializar upload do reel
  const initUrl = `${GRAPH_API_BASE}/${pageId}/video_reels`;

  const initResponse = await fetch(initUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: token,
      upload_phase: 'start'
    })
  });

  const initData = await initResponse.json();

  if (!initResponse.ok || initData.error) {
    throwGraphError('Erro ao inicializar reel do Facebook', initResponse.status, initData.error);
  }

  const videoId = initData.video_id;

  // 2. Upload do vídeo via URL
  const uploadUrl = `${GRAPH_API_BASE}/${videoId}`;

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: token,
      upload_phase: 'transfer',
      file_url: videoUrl
    })
  });

  const uploadData = await uploadResponse.json();

  if (!uploadResponse.ok || uploadData.error) {
    throwGraphError('Erro ao enviar vídeo do reel', uploadResponse.status, uploadData.error);
  }

  // 3. Finalizar e publicar
  const finishUrl = `${GRAPH_API_BASE}/${pageId}/video_reels`;

  const finishResponse = await fetch(finishUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: token,
      upload_phase: 'finish',
      video_id: videoId,
      video_state: 'PUBLISHED',
      description: description || ''
    })
  });

  const finishData = await finishResponse.json();

  if (!finishResponse.ok || finishData.error) {
    throwGraphError('Erro ao publicar reel no Facebook', finishResponse.status, finishData.error);
  }

  return { videoId, reelId: finishData.video_id || videoId, postId: finishData.post_id };
}

/**
 * Partilhar link na Página
 */
async function publishLink(pageId, token, linkUrl, message) {
  const url = `${GRAPH_API_BASE}/${pageId}/feed`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: token,
      message: message || '',
      link: linkUrl
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throwGraphError('Erro ao partilhar link no Facebook', response.status, data.error);
  }

  return { postId: data.id };
}

/**
 * Criar e lançar erro estruturado da Graph API
 */
function throwGraphError(message, statusCode, graphError) {
  const errorMessage = graphError?.message
    ? `${message}: ${graphError.message}`
    : message;

  throw Object.assign(new Error(errorMessage), {
    graphError: graphError || {},
    statusCode: statusCode || 500
  });
}

/**
 * Função exportada para uso interno (pelo scheduler)
 */
export async function publishToFacebook({ type, message, imageUrl, videoUrl, linkUrl, isReel, title }) {
  const PAGE_TOKEN = process.env.FACEBOOK_PAGE_TOKEN || process.env.META_ACCESS_TOKEN;
  const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

  if (!PAGE_TOKEN || !PAGE_ID) {
    throw new Error('FACEBOOK_PAGE_TOKEN/META_ACCESS_TOKEN ou FACEBOOK_PAGE_ID não configurados');
  }

  switch (type) {
    case 'post':
      return publishPost(PAGE_ID, PAGE_TOKEN, message);
    case 'photo':
      return publishPhoto(PAGE_ID, PAGE_TOKEN, imageUrl, message);
    case 'video':
      return publishVideo(PAGE_ID, PAGE_TOKEN, videoUrl, message, { isReel, title });
    case 'link':
      return publishLink(PAGE_ID, PAGE_TOKEN, linkUrl, message);
    default:
      throw new Error(`Tipo Facebook inválido: ${type}`);
  }
}
