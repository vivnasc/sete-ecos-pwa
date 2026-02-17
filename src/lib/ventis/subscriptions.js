/**
 * VENTIS — Logica de subscricoes
 * Usa o sistema partilhado com configuracao especifica do Ventis
 */

import { checkEcoAccess, startEcoTrial, getEcoPlans, updateEcoSubscriptionStatus, SUBSCRIPTION_STATUS, ECO_PLANS } from '../shared/subscriptionPlans'

export { SUBSCRIPTION_STATUS }

export const VENTIS_PLANS = ECO_PLANS.ventis

export const VENTIS_CONFIG = {
  TRIAL_DAYS: 7,
  DEFAULT_PLAN: 'monthly',
  TABLE: 'ventis_clients'
}

export const checkVentisAccess = (userId) => checkEcoAccess('ventis', userId)
export const startVentisTrial = (userId) => startEcoTrial('ventis', userId)
export const getVentisPlans = () => getEcoPlans('ventis')
export const updateVentisStatus = (userId, status) => updateEcoSubscriptionStatus('ventis', userId, status)
