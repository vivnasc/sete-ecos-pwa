/**
 * IGNIS — Logica de subscricoes
 * Usa o sistema partilhado com configuracao especifica do Ignis
 */

import { checkEcoAccess, startEcoTrial, getEcoPlans, updateEcoSubscriptionStatus, SUBSCRIPTION_STATUS, ECO_PLANS } from '../shared/subscriptionPlans'

export { SUBSCRIPTION_STATUS }

export const IGNIS_PLANS = ECO_PLANS.ignis

export const IGNIS_CONFIG = {
  TRIAL_DAYS: 7,
  DEFAULT_PLAN: 'monthly',
  TABLE: 'ignis_clients'
}

export const checkIgnisAccess = (userId) => checkEcoAccess('ignis', userId)
export const startIgnisTrial = (userId) => startEcoTrial('ignis', userId)
export const getIgnisPlans = () => getEcoPlans('ignis')
export const updateIgnisStatus = (userId, status) => updateEcoSubscriptionStatus('ignis', userId, status)
