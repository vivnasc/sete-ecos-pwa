/**
 * AURORA — Logica de subscricoes
 * Usa o sistema partilhado com configuracao especifica da Aurora
 * Nota: Aurora e gratuita para quem completou 5+ ecos, ou 500 MZN/mes standalone
 */

import { checkEcoAccess, startEcoTrial, getEcoPlans, updateEcoSubscriptionStatus, SUBSCRIPTION_STATUS, ECO_PLANS } from '../shared/subscriptionPlans'

export { SUBSCRIPTION_STATUS }

export const AURORA_PLANS = ECO_PLANS.aurora

export const AURORA_CONFIG = {
  TRIAL_DAYS: 7,
  DEFAULT_PLAN: 'monthly',
  TABLE: 'aurora_clients',
  ECOS_REQUIRED: 5
}

export const checkAuroraAccess = (userId) => checkEcoAccess('aurora', userId)
export const startAuroraTrial = (userId) => startEcoTrial('aurora', userId)
export const getAuroraPlans = () => getEcoPlans('aurora')
export const updateAuroraStatus = (userId, status) => updateEcoSubscriptionStatus('aurora', userId, status)
