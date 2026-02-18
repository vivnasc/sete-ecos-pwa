/**
 * Facebook Publishing Client
 * Comunica com /api/facebook-publish para publicar no Facebook
 */

const API_URL = '/api/facebook-publish';

/**
 * Publicar imediatamente no Facebook
 */
export async function publicarFacebook({ type, message, imageUrl, videoUrl, linkUrl, isReel, title }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, message, imageUrl, videoUrl, linkUrl, isReel, title }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }

  return data;
}
