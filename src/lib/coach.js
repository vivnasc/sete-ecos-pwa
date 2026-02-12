/**
 * Coach Access Configuration
 *
 * Para adicionar coaches:
 * 1. Via Vercel ENV: VITE_COACH_EMAILS=email1@x.com,email2@y.com
 * 2. Ou editar a lista DEFAULT_COACH_EMAILS abaixo
 */

// Lista padrão de coaches (fallback)
const DEFAULT_COACH_EMAILS = [
  'viv.saraiva@gmail.com',
  'vivnasc@gmail.com',
  'vivianne.saraiva@outlook.com'
];

/**
 * Obtém lista de emails de coaches
 * Primeiro tenta da variável de ambiente, depois usa default
 */
export function getCoachEmails() {
  const envEmails = import.meta.env.VITE_COACH_EMAILS;

  if (envEmails) {
    return envEmails.split(',').map(e => e.trim().toLowerCase());
  }

  return DEFAULT_COACH_EMAILS.map(e => e.toLowerCase());
}

/**
 * Verifica se um email é de coach
 * @param {string} email - Email a verificar
 * @returns {boolean}
 */
export function isCoach(email) {
  if (!email) return false;

  const coachEmails = getCoachEmails();
  return coachEmails.includes(email.toLowerCase());
}

/**
 * Verifica se o utilizador atual é coach
 * @param {object} session - Sessão do Supabase
 * @returns {boolean}
 */
export function isSessionCoach(session) {
  const email = session?.user?.email;
  const result = isCoach(email);
  console.log('🔍 Coach Check:', { email, result, coachEmails: getCoachEmails() });
  return result;
}

export default { getCoachEmails, isCoach, isSessionCoach };
