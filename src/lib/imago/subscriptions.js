/**
 * IMAGO — Logica de subscricoes
 * Usa o sistema partilhado com configuracao especifica do Imago
 */

import { checkEcoAccess, startEcoTrial, getEcoPlans, updateEcoSubscriptionStatus, SUBSCRIPTION_STATUS, ECO_PLANS } from '../shared/subscriptionPlans'

export { SUBSCRIPTION_STATUS }

export const IMAGO_PLANS = ECO_PLANS.imago

export const IMAGO_CONFIG = {
  TRIAL_DAYS: 7,
  DEFAULT_PLAN: 'monthly',
  TABLE: 'imago_clients'
}

export const checkImagoAccess = (userId) => checkEcoAccess('imago', userId)
export const startImagoTrial = (userId) => startEcoTrial('imago', userId)
export const getImagoPlans = () => getEcoPlans('imago')
export const updateImagoStatus = (userId, status) => updateEcoSubscriptionStatus('imago', userId, status)
