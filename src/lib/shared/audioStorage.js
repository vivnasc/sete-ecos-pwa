/**
 * Audio Storage — Supabase Storage integration para áudios gerados
 *
 * Bucket: "audios" (público)
 * Path: {eco}/{slug}.mp3  (ex: aurea/01-valor-nao-se-ganha.mp3)
 *
 * SETUP: Criar bucket "audios" no Supabase Dashboard → Storage
 *   - Public bucket (permite leitura sem auth)
 *   - Política de upload: apenas authenticated users
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const BUCKET = 'audios'

/**
 * Constrói URL pública para um áudio no Supabase Storage
 * @param {string} eco - Nome do eco em minúsculas (aurea, ignis, etc.)
 * @param {string} slug - Slug do áudio (ex: 01-valor-nao-se-ganha)
 * @returns {string} URL pública do MP3
 */
export function getAudioUrl(eco, slug) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${eco}/${slug}.mp3`
}

/**
 * Upload de áudio para Supabase Storage
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} eco - Nome do eco em minúsculas
 * @param {string} slug - Slug do áudio
 * @param {Blob} blob - Blob MP3
 * @returns {Promise<string>} URL pública
 */
export async function uploadAudio(supabase, eco, slug, blob) {
  const path = `${eco}/${slug}.mp3`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: 'audio/mpeg',
      upsert: true,
    })
  if (error) throw error
  return getAudioUrl(eco, slug)
}

/**
 * Verifica se o áudio existe no Storage (HEAD request)
 * @param {string} eco
 * @param {string} slug
 * @returns {Promise<boolean>}
 */
export async function checkAudioExists(eco, slug) {
  try {
    const url = getAudioUrl(eco, slug)
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Mapeamento eco folder → eco minúsculo para Storage paths
 */
export const ECO_FOLDER_MAP = {
  AUREA: 'aurea',
  IMAGO: 'imago',
  SERENA: 'serena',
  IGNIS: 'ignis',
  VENTIS: 'ventis',
  ECOA: 'ecoa',
  VITALIS: 'vitalis',
  MARKETING: 'marketing',
  LUMINA: 'lumina',
  WHATSAPP: 'whatsapp',
  PODCAST: 'podcast',
  JOURNALING: 'journaling',
  AUDIOGRAMAS: 'audiogramas',
}
