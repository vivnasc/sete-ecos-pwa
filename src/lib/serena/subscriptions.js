/**
 * SERENA — Logica de subscricoes
 * Usa o sistema partilhado com configuracao especifica do Serena
 */

import { checkEcoAccess, startEcoTrial, getEcoPlans, updateEcoSubscriptionStatus, SUBSCRIPTION_STATUS, ECO_PLANS } from '../shared/subscriptionPlans'

export { SUBSCRIPTION_STATUS }

export const SERENA_PLANS = ECO_PLANS.serena

export const SERENA_CONFIG = {
  TRIAL_DAYS: 7,
  DEFAULT_PLAN: 'monthly',
  TABLE: 'serena_clients'
}

export const checkSerenaAccess = (userId) => checkEcoAccess('serena', userId)
export const startSerenaTrial = (userId) => startEcoTrial('serena', userId)
export const getSerenaPlans = () => getEcoPlans('serena')
export const updateSerenaStatus = (userId, status) => updateEcoSubscriptionStatus('serena', userId, status)
