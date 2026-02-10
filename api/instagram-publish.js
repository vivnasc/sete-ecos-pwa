/**
 * API Endpoint: Publicar no Instagram via Meta Graph API
 *
 * Tipos de publicação suportados:
 * - photo: Imagem única com legenda
 * - carousel: Múltiplas imagens (2-10) com legenda
 * - story: Story com imagem
 *
 * Body (JSON):
 * {
 *   type: 'photo' | 'carousel' | 'story',
 *   imageUrl: string | string[],  // URL(s) públicas da(s) imagem(ns)
 *   caption: string               // Legenda (não aplicável a stories)
 * }
 *
 * Variáveis de ambiente necessárias:
 * - META_ACCESS_TOKEN: Token de acesso da Meta Graph API
 * - INSTAGRAM_ACCOUNT_ID: ID da conta profissional do Instagram
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

// Intervalo de polling para verificar estado do container (ms)
const POLL_INTERVAL = 2000;
// Tempo máximo de espera pelo container (ms)
const POLL_TIMEOUT = 60000;

export default async function handler(req, res) {
  // CORS - Restrito ao domínio da app
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
    return res.status(405).json({ error: 'Metodo nao permitido' });
  }

  const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!META_ACCESS_TOKEN || !INSTAGRAM_ACCOUNT_ID) {
    console.error('META_ACCESS_TOKEN ou INSTAGRAM_ACCOUNT_ID nao configurados');
    return res.status(500).json({ error: 'Configuracao do Instagram em falta' });
  }

  try {
    const { type, imageUrl, caption } = req.body;

    if (!type || !imageUrl) {
      return res.status(400).json({ error: 'Campos type e imageUrl sao obrigatorios' });
    }

    if (!['photo', 'carousel', 'story'].includes(type)) {
      return res.status(400).json({ error: 'Tipo invalido. Use: photo, carousel ou story' });
    }

    let result;

    switch (type) {
      case 'photo':
        result = await publishPhoto(INSTAGRAM_ACCOUNT_ID, META_ACCESS_TOKEN, imageUrl, caption);
        break;

      case 'carousel':
        if (!Array.isArray(imageUrl) || imageUrl.length < 2 || imageUrl.length > 10) {
          return res.status(400).json({
            error: 'Carousel requer um array de 2 a 10 URLs de imagem'
          });
        }
        result = await publishCarousel(INSTAGRAM_ACCOUNT_ID, META_ACCESS_TOKEN, imageUrl, caption);
        break;

      case 'story':
        result = await publishStory(INSTAGRAM_ACCOUNT_ID, META_ACCESS_TOKEN, imageUrl);
        break;
    }

    return res.status(200).json({
      success: true,
      type,
      ...result
    });

  } catch (error) {
    console.error('Erro ao publicar no Instagram:', error);

    // Erros da Graph API incluem código e subtipo para diagnóstico
    if (error.graphError) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
        code: error.graphError.code,
        subcode: error.graphError.error_subcode,
        type: error.graphError.type
      });
    }

    return res.status(500).json({ error: error.message || 'Erro interno ao publicar no Instagram' });
  }
}

/**
 * Publicar uma foto única
 */
async function publishPhoto(accountId, token, imageUrl, caption) {
  // 1. Criar container de media
  const containerId = await createMediaContainer(accountId, token, {
    image_url: imageUrl,
    caption: caption || ''
  });

  // 2. Aguardar processamento do container
  await waitForContainer(containerId, token);

  // 3. Publicar
  const publishResult = await publishMedia(accountId, token, containerId);

  return {
    containerId,
    mediaId: publishResult.id
  };
}

/**
 * Publicar um carousel (2-10 imagens)
 */
async function publishCarousel(accountId, token, imageUrls, caption) {
  // 1. Criar container para cada imagem (sem caption individual)
  const childContainerIds = [];

  for (const url of imageUrls) {
    const containerId = await createMediaContainer(accountId, token, {
      image_url: url,
      is_carousel_item: true
    });
    childContainerIds.push(containerId);
  }

  // 2. Aguardar processamento de todos os containers filhos
  await Promise.all(
    childContainerIds.map(id => waitForContainer(id, token))
  );

  // 3. Criar container do carousel
  const carouselContainerId = await createCarouselContainer(
    accountId,
    token,
    childContainerIds,
    caption
  );

  // 4. Aguardar processamento do carousel
  await waitForContainer(carouselContainerId, token);

  // 5. Publicar
  const publishResult = await publishMedia(accountId, token, carouselContainerId);

  return {
    childContainerIds,
    carouselContainerId,
    mediaId: publishResult.id
  };
}

/**
 * Publicar um story
 */
async function publishStory(accountId, token, imageUrl) {
  // 1. Criar container de story
  const containerId = await createMediaContainer(accountId, token, {
    image_url: imageUrl,
    media_type: 'STORIES'
  });

  // 2. Aguardar processamento
  await waitForContainer(containerId, token);

  // 3. Publicar
  const publishResult = await publishMedia(accountId, token, containerId);

  return {
    containerId,
    mediaId: publishResult.id
  };
}

/**
 * Criar um container de media na Graph API
 */
async function createMediaContainer(accountId, token, params) {
  const url = `${GRAPH_API_BASE}/${accountId}/media`;

  const body = {
    access_token: token,
    ...params
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throwGraphError('Erro ao criar container de media', response.status, data.error);
  }

  return data.id;
}

/**
 * Criar um container de carousel na Graph API
 */
async function createCarouselContainer(accountId, token, childIds, caption) {
  const url = `${GRAPH_API_BASE}/${accountId}/media`;

  const body = {
    access_token: token,
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption: caption || ''
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throwGraphError('Erro ao criar container de carousel', response.status, data.error);
  }

  return data.id;
}

/**
 * Aguardar que o container fique pronto (status FINISHED)
 *
 * A Graph API processa media de forma assíncrona.
 * Estados possíveis: IN_PROGRESS, FINISHED, ERROR, EXPIRED
 */
async function waitForContainer(containerId, token) {
  const startTime = Date.now();

  while (Date.now() - startTime < POLL_TIMEOUT) {
    const url = `${GRAPH_API_BASE}/${containerId}?fields=status_code,status&access_token=${token}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throwGraphError('Erro ao verificar estado do container', response.status, data.error);
    }

    const status = data.status_code;

    if (status === 'FINISHED') {
      return;
    }

    if (status === 'ERROR') {
      throw new Error(`Container ${containerId} falhou: ${data.status || 'Erro desconhecido'}`);
    }

    if (status === 'EXPIRED') {
      throw new Error(`Container ${containerId} expirou. Tente novamente.`);
    }

    // IN_PROGRESS - aguardar e tentar novamente
    await sleep(POLL_INTERVAL);
  }

  throw new Error(`Timeout ao aguardar container ${containerId}. Tente novamente.`);
}

/**
 * Publicar media usando o container ID
 */
async function publishMedia(accountId, token, containerId) {
  const url = `${GRAPH_API_BASE}/${accountId}/media_publish`;

  const body = {
    access_token: token,
    creation_id: containerId
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    // Verificar se e rate limit (codigo 4 ou 32)
    if (data.error && (data.error.code === 4 || data.error.code === 32)) {
      const retryAfter = extractRetryAfter(response);
      throw Object.assign(
        new Error(`Rate limit atingido. Tente novamente em ${retryAfter} segundos.`),
        {
          graphError: data.error,
          statusCode: 429,
          retryAfter
        }
      );
    }

    throwGraphError('Erro ao publicar media', response.status, data.error);
  }

  return data;
}

/**
 * Criar e lancar erro estruturado da Graph API
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
 * Extrair header Retry-After ou estimar tempo de espera
 */
function extractRetryAfter(response) {
  const retryHeader = response.headers?.get?.('Retry-After');
  if (retryHeader) {
    return parseInt(retryHeader, 10);
  }
  // Fallback: 5 minutos (recomendacao da Meta)
  return 300;
}

/**
 * Helper para aguardar (Promise-based sleep)
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Funcao exportada para uso interno (pelo instagram-schedule.js)
 * Permite publicar sem passar por HTTP
 */
export async function publishToInstagram({ type, imageUrl, caption }) {
  const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!META_ACCESS_TOKEN || !INSTAGRAM_ACCOUNT_ID) {
    throw new Error('META_ACCESS_TOKEN ou INSTAGRAM_ACCOUNT_ID nao configurados');
  }

  switch (type) {
    case 'photo':
      return publishPhoto(INSTAGRAM_ACCOUNT_ID, META_ACCESS_TOKEN, imageUrl, caption);
    case 'carousel':
      return publishCarousel(INSTAGRAM_ACCOUNT_ID, META_ACCESS_TOKEN, imageUrl, caption);
    case 'story':
      return publishStory(INSTAGRAM_ACCOUNT_ID, META_ACCESS_TOKEN, imageUrl);
    default:
      throw new Error(`Tipo invalido: ${type}`);
  }
}
