/**
 * UTM Tracking Utility
 * Captura e persiste parametros UTM para medir campanhas de marketing
 *
 * Parametros suportados:
 *   utm_source    - Origem (ex: instagram, whatsapp, google)
 *   utm_medium    - Meio (ex: social, cpc, email)
 *   utm_campaign  - Nome da campanha (ex: lancamento-vitalis)
 *   utm_content   - Variacao (ex: botao-verde, banner-topo)
 *   utm_term      - Palavras-chave (para search ads)
 *   ref           - Codigo de referencia
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
const STORAGE_KEY = 'sete_ecos_utm';
const STORAGE_FIRST_KEY = 'sete_ecos_utm_first';

/**
 * Captura parametros UTM da URL actual e guarda no localStorage
 * Chamar no carregamento da app (App.jsx ou main.jsx)
 */
export function captureUTM() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  let hasUTM = false;

  UTM_KEYS.forEach(key => {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
      hasUTM = true;
    }
  });

  if (hasUTM) {
    utm.captured_at = new Date().toISOString();
    utm.landing_page = window.location.pathname;

    // Guarda UTM mais recente (last-touch)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(utm));

    // Guarda primeiro UTM (first-touch) - nao sobrescreve
    if (!localStorage.getItem(STORAGE_FIRST_KEY)) {
      localStorage.setItem(STORAGE_FIRST_KEY, JSON.stringify(utm));
    }

    // Limpa parametros UTM da URL sem reload (URL limpa para o utilizador)
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);
  }
}

/**
 * Retorna UTM data do ultimo toque
 */
export function getUTM() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

/**
 * Retorna UTM data do primeiro toque
 */
export function getFirstUTM() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_FIRST_KEY)) || null;
  } catch {
    return null;
  }
}

/**
 * Gera URL com parametros UTM para campanhas
 * @param {string} baseUrl - URL base (ex: 'https://app.seteecos.com/vitalis')
 * @param {object} params - Parametros UTM
 * @returns {string} URL completa com UTM
 *
 * Exemplo:
 *   buildUTMUrl('https://app.seteecos.com/vitalis', {
 *     utm_source: 'instagram',
 *     utm_medium: 'social',
 *     utm_campaign: 'lancamento-2026'
 *   })
 */
export function buildUTMUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

/**
 * Templates de UTM pre-configurados para campanhas comuns
 */
export const UTM_TEMPLATES = {
  // Instagram Bio
  instagramBio: (campaign) => ({
    utm_source: 'instagram',
    utm_medium: 'social',
    utm_campaign: campaign || 'bio-link'
  }),

  // Instagram Stories
  instagramStory: (campaign) => ({
    utm_source: 'instagram',
    utm_medium: 'story',
    utm_campaign: campaign || 'stories'
  }),

  // WhatsApp Broadcast
  whatsappBroadcast: (campaign) => ({
    utm_source: 'whatsapp',
    utm_medium: 'broadcast',
    utm_campaign: campaign || 'broadcast'
  }),

  // WhatsApp Status
  whatsappStatus: (campaign) => ({
    utm_source: 'whatsapp',
    utm_medium: 'status',
    utm_campaign: campaign || 'status'
  }),

  // Email Newsletter
  emailNewsletter: (campaign) => ({
    utm_source: 'email',
    utm_medium: 'newsletter',
    utm_campaign: campaign || 'newsletter'
  }),

  // Facebook Post
  facebookPost: (campaign) => ({
    utm_source: 'facebook',
    utm_medium: 'social',
    utm_campaign: campaign || 'post'
  }),

  // Google Ads
  googleAds: (campaign, term) => ({
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: campaign || 'search',
    utm_term: term
  }),

  // Referral/Parceiro
  referral: (partnerName) => ({
    utm_source: 'referral',
    utm_medium: 'partner',
    utm_campaign: partnerName
  })
};
