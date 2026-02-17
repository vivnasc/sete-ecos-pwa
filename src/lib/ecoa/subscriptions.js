/**
 * ECOA — Logica de subscricoes
 * Usa o sistema partilhado com configuracao especifica do Ecoa
 */

import { checkEcoAccess, startEcoTrial, getEcoPlans, updateEcoSubscriptionStatus, SUBSCRIPTION_STATUS, ECO_PLANS } from '../shared/subscriptionPlans'

export { SUBSCRIPTION_STATUS }

export const ECOA_PLANS = ECO_PLANS.ecoa

export const ECOA_CONFIG = {
  TRIAL_DAYS: 7,
  DEFAULT_PLAN: 'monthly',
  TABLE: 'ecoa_clients'
}

export const checkEcoaAccess = (userId) => checkEcoAccess('ecoa', userId)
export const startEcoaTrial = (userId) => startEcoTrial('ecoa', userId)
export const getEcoaPlans = () => getEcoPlans('ecoa')
export const updateEcoaStatus = (userId, status) => updateEcoSubscriptionStatus('ecoa', userId, status)
