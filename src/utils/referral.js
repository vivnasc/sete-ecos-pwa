/**
 * Sistema de Referencia (Referral)
 * Permite utilizadoras convidarem amigas com link único
 * Os dados sao guardados em localStorage e podem ser enviados ao Supabase
 */

const REFERRAL_KEY = 'sete_ecos_referral';
const REFERRAL_CODE_KEY = 'sete_ecos_my_referral_code';

/**
 * Gera um código de referência único baseado no userId
 */
export function generateReferralCode(userId) {
  if (!userId) return null;
  const short = userId.slice(0, 8).toUpperCase();
  return `ECOS-${short}`;
}

/**
 * Gera o link de referencia completo
 */
export function getReferralLink(userId, eco = '') {
  const code = generateReferralCode(userId);
  if (!code) return null;

  const path = eco ? `/${eco.toLowerCase()}` : '/';
  return `https://app.seteecos.com${path}?ref=${code}`;
}

/**
 * Captura o codigo de referencia da URL (chamar no carregamento)
 */
export function captureReferral() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');

  if (ref && !localStorage.getItem(REFERRAL_KEY)) {
    localStorage.setItem(REFERRAL_KEY, JSON.stringify({
      code: ref,
      captured_at: new Date().toISOString(),
      landing_page: window.location.pathname
    }));
  }
}

/**
 * Retorna dados de referencia capturados
 */
export function getReferralData() {
  try {
    return JSON.parse(localStorage.getItem(REFERRAL_KEY)) || null;
  } catch {
    return null;
  }
}

/**
 * Mensagens pre-formatadas para partilha por canal
 */
export function getShareMessages(userId, eco = 'vitalis') {
  const link = getReferralLink(userId, eco);
  if (!link) return null;

  const ecoNames = {
    vitalis: 'Vitalis',
    aurea: 'Aurea',
    lumina: 'Lumina'
  };

  const nome = ecoNames[eco] || 'Sete Ecos';

  return {
    whatsapp: {
      text: `Estou a usar o ${nome} e está a mudar a minha vida! Experimenta também: ${link}`,
      url: `https://wa.me/?text=${encodeURIComponent(`Estou a usar o ${nome} e está a mudar a minha vida! Experimenta também: ${link}`)}`
    },
    facebook: {
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
    },
    copy: {
      text: `Experimenta o ${nome} - ${link}`
    }
  };
}
