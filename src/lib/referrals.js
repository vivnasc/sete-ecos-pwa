/**
 * SETE ECOS - Sistema de Referral
 *
 * "Convida & Ganha":
 * - Quem convida: +7 dias gratis quando a convidada PAGA
 * - Quem e convidada: 7 dias de trial gratis
 * - Limite: 10 convites activos por utilizadora
 */

import { supabase } from './supabase';
import { SUBSCRIPTION_STATUS, startTrial } from './subscriptions';

const MAX_REFERRALS_PER_USER = 10;
const REFERRAL_BONUS_DAYS = 7;

/**
 * Gera codigo de referral unico para uma utilizadora
 */
export const generateReferralCode = async (userId) => {
  try {
    // Verificar se ja tem um codigo
    const { data: existing } = await supabase
      .from('referral_codes')
      .select('code, total_uses, successful_conversions')
      .eq('user_id', userId)
      .eq('active', true)
      .maybeSingle();

    if (existing) {
      return { success: true, code: existing.code, stats: existing };
    }

    // Gerar novo codigo
    const code = `ECOS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { error } = await supabase.from('referral_codes').insert({
      user_id: userId,
      code,
      max_uses: MAX_REFERRALS_PER_USER,
      total_uses: 0,
      successful_conversions: 0,
      bonus_days_earned: 0,
      active: true,
      created_at: new Date().toISOString()
    });

    if (error) throw error;

    return { success: true, code };
  } catch (error) {
    console.error('Erro ao gerar codigo referral:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obter estatisticas do referral de uma utilizadora
 */
export const getReferralStats = async (userId) => {
  try {
    const { data: referralCode } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .maybeSingle();

    if (!referralCode) {
      return { hasCode: false, code: null, stats: null };
    }

    // Buscar detalhes dos usos
    const { data: uses } = await supabase
      .from('referral_uses')
      .select('referred_user_id, status, created_at')
      .eq('referral_code_id', referralCode.id)
      .order('created_at', { ascending: false });

    return {
      hasCode: true,
      code: referralCode.code,
      stats: {
        totalUses: referralCode.total_uses,
        conversions: referralCode.successful_conversions,
        bonusDaysEarned: referralCode.bonus_days_earned,
        maxUses: referralCode.max_uses,
        remainingUses: referralCode.max_uses - referralCode.total_uses
      },
      uses: uses || []
    };
  } catch (error) {
    console.error('Erro ao obter stats referral:', error);
    return { hasCode: false, code: null, stats: null };
  }
};

/**
 * Usa um codigo de referral (chamado quando nova utilizadora se regista com o codigo)
 */
export const useReferralCode = async (newUserId, code) => {
  try {
    // Buscar codigo
    const { data: referral, error: fetchError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (fetchError || !referral) {
      return { success: false, error: 'Codigo de referral invalido' };
    }

    // Verificar limites
    if (referral.total_uses >= referral.max_uses) {
      return { success: false, error: 'Este codigo ja atingiu o limite de usos' };
    }

    // Nao permitir auto-referral
    if (referral.user_id === newUserId) {
      return { success: false, error: 'Nao podes usar o teu proprio codigo' };
    }

    // Iniciar trial para a nova utilizadora
    const trialResult = await startTrial(newUserId);
    if (!trialResult.success) {
      return { success: false, error: 'Erro ao activar trial' };
    }

    // Registar uso
    await supabase.from('referral_uses').insert({
      referral_code_id: referral.id,
      referrer_user_id: referral.user_id,
      referred_user_id: newUserId,
      status: 'trial_started',
      created_at: new Date().toISOString()
    });

    // Incrementar contador
    await supabase
      .from('referral_codes')
      .update({ total_uses: referral.total_uses + 1 })
      .eq('id', referral.id);

    return { success: true, trialDays: 7 };
  } catch (error) {
    console.error('Erro ao usar codigo referral:', error);
    return { success: false, error: 'Erro ao processar codigo' };
  }
};

/**
 * Recompensa a referrer quando a convidada paga (chamado apos pagamento)
 * Adiciona REFERRAL_BONUS_DAYS dias a subscricao da referrer
 */
export const rewardReferrer = async (paidUserId) => {
  try {
    // Verificar se esta utilizadora veio de um referral
    const { data: referralUse } = await supabase
      .from('referral_uses')
      .select('referral_code_id, referrer_user_id, status')
      .eq('referred_user_id', paidUserId)
      .eq('status', 'trial_started')
      .maybeSingle();

    if (!referralUse) return { rewarded: false }; // Nao veio de referral

    // Atualizar status do uso para 'converted'
    await supabase
      .from('referral_uses')
      .update({ status: 'converted', converted_at: new Date().toISOString() })
      .eq('referred_user_id', paidUserId)
      .eq('referral_code_id', referralUse.referral_code_id);

    // Adicionar dias bonus a subscricao da referrer
    const { data: referrerClient } = await supabase
      .from('vitalis_clients')
      .select('subscription_expires, subscription_status')
      .eq('user_id', referralUse.referrer_user_id)
      .maybeSingle();

    if (referrerClient && ['active', 'tester', 'trial'].includes(referrerClient.subscription_status)) {
      const currentExpiry = referrerClient.subscription_expires
        ? new Date(referrerClient.subscription_expires)
        : new Date();

      // Garantir que nao adicionamos a uma data no passado
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      baseDate.setDate(baseDate.getDate() + REFERRAL_BONUS_DAYS);

      await supabase
        .from('vitalis_clients')
        .update({ subscription_expires: baseDate.toISOString() })
        .eq('user_id', referralUse.referrer_user_id);
    }

    // Incrementar conversoes no codigo
    await supabase
      .from('referral_codes')
      .update({
        successful_conversions: (await supabase
          .from('referral_codes')
          .select('successful_conversions')
          .eq('id', referralUse.referral_code_id)
          .single()).data.successful_conversions + 1,
        bonus_days_earned: (await supabase
          .from('referral_codes')
          .select('bonus_days_earned')
          .eq('id', referralUse.referral_code_id)
          .single()).data.bonus_days_earned + REFERRAL_BONUS_DAYS
      })
      .eq('id', referralUse.referral_code_id);

    return { rewarded: true, bonusDays: REFERRAL_BONUS_DAYS };
  } catch (error) {
    console.error('Erro ao recompensar referrer:', error);
    return { rewarded: false, error: error.message };
  }
};

/**
 * Gera link de referral completo
 */
export const getReferralLink = (code) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/vitalis/pagamento?ref=${code}`;
};

/**
 * Gera texto de partilha para WhatsApp
 */
export const getReferralWhatsAppText = (code, userName) => {
  const link = getReferralLink(code);
  return encodeURIComponent(
    `Ola! Eu sou ${userName || 'utilizadora'} do SETE ECOS e estou a adorar o Vitalis. ` +
    `Queres experimentar 7 dias gratis? Usa o meu link: ${link}`
  );
};
