import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { g } from '../../utils/genero';
import {
  SUBSCRIPTION_PLANS,
  BUNDLE_PLANS,
  SUBSCRIPTION_STATUS,
  activateSubscription,
  useInviteCode,
  checkVitalisAccess,
  getRenewalIncentive,
  applyRenewalDiscount,
  registerPendingPayment
} from '../../lib/subscriptions';
import { useReferralCode, rewardReferrer } from '../../lib/referrals';

import { EmailTriggers } from '../../lib/emails';
import { isCoach } from '../../lib/coach';

/**
 * VITALIS - Pagina de Pagamento
 *
 * SEMPRE mostra os planos primeiro
 * Login/Registo aparece abaixo se não autenticado
 */

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
const PAYPAL_SDK_TIMEOUT = 15000; // 15s timeout para carregar SDK
const WHATSAPP_COMMUNITY = 'https://chat.whatsapp.com/FbHbQuDPGAZ3myiu29CmHO';

// Exchange rates (Mozambican Metical as base)
const EXCHANGE_RATES = {
  MZN: 1,
  USD: 65.79,  // 1 USD = 65.79 MZN
  EUR: 71.43   // 1 EUR = 71.43 MZN
};

const PagamentoVitalis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paypalRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auth form states
  const [authMode, setAuthMode] = useState('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Plano e pagamento
  const [selectedPlan, setSelectedPlan] = useState('SEMESTRAL');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [userLoadError, setUserLoadError] = useState(false);
  const [showTestPlan, setShowTestPlan] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0); // 0 a 100 (%)
  const [promoCode, setPromoCode] = useState('');
  const [planType, setPlanType] = useState('individual'); // 'individual' | 'bundle'
  const [referralCode, setReferralCode] = useState(''); // codigo de referral de quem indicou

  // Manual payment states
  const [paymentMethod, setPaymentMethod] = useState('paypal'); // 'paypal' | 'manual'
  const [manualPaymentType, setManualPaymentType] = useState('mpesa'); // 'mpesa' | 'transfer' | 'whatsapp'
  const [manualReference, setManualReference] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCurrency, setManualCurrency] = useState('MZN'); // 'MZN' | 'USD' | 'EUR'
  const [showManualSuccess, setShowManualSuccess] = useState(false);

  useEffect(() => {
    loadUserData();
    loadPayPalScript();

    // Check for code in URL (e.g., /vitalis/pagamento?code=VITALIS-TESTER-2026)
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
      setShowInviteInput(true);
    }

    // Check for referral code in URL (e.g., /vitalis/pagamento?ref=ECOS-A3F7XQ)
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) {
      setReferralCode(refFromUrl.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    if (paypalLoaded && userId) {
      renderPayPalButtons();
    }
  }, [selectedPlan, paypalLoaded, userId, promoDiscount, planType]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserEmail(user.email);

      // Emails com bypass têm acesso directo - não precisa verificar subscrição
      if (isCoach(user.email)) {
        navigate('/vitalis/dashboard');
        return;
      }

      // Usar upsert como o Lumina - evita erros 400 nos SELECTs
      const { data: userData, error: upsertError } = await supabase
        .from('users')
        .upsert({
          auth_id: user.id,
          email: user.email,
          nome: user.user_metadata?.name || user.email.split('@')[0]
        }, { onConflict: 'auth_id' })
        .select('id, nome')
        .single();

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        setUserLoadError(true);
      } else if (userData) {
        setUserId(userData.id);
        setUserName(userData.nome);
        setUserLoadError(false);

        // Auto-aplicar código se existe (do URL ou digitado antes de auth)
        const codeToApply = searchParams.get('code') || inviteCode;
        if (codeToApply && codeToApply.trim()) {
          try {
            const result = await useInviteCode(userData.id, codeToApply);
            if (result.success) {
              const { data: intake } = await supabase
                .from('vitalis_intake')
                .select('id')
                .eq('user_id', userData.id)
                .maybeSingle();

              if (intake) {
                navigate('/vitalis/dashboard');
              } else {
                navigate('/vitalis/intake');
              }
              return;
            }
          } catch (e) {
            console.warn('Auto-apply code failed:', e);
          }
        }

        // Auto-aplicar referral code se existe (inicia trial para a convidada)
        const refCode = searchParams.get('ref') || referralCode;
        if (refCode && refCode.trim()) {
          try {
            const refResult = await useReferralCode(userData.id, refCode);
            if (refResult.success) {
              setMessage({ type: 'success', text: `Trial de ${refResult.trialDays} dias activado! ${g('Bem-vindo', 'Bem-vinda')} ao Vitalis.` });
              const { data: intake } = await supabase
                .from('vitalis_intake')
                .select('id')
                .eq('user_id', userData.id)
                .maybeSingle();
              if (intake) {
                navigate('/vitalis/dashboard');
              } else {
                navigate('/vitalis/intake');
              }
              return;
            }
          } catch (e) {
            console.warn('Auto-apply referral failed:', e);
          }
        }

        const access = await checkVitalisAccess(userData.id);
        if (access.hasAccess && access.status !== SUBSCRIPTION_STATUS.PENDING) {
          navigate('/vitalis/dashboard');
          return;
        }
      } else {
        console.error('Could not find or create user for:', user.email);
        setUserLoadError(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setUserLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
      } else {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { name: authName || authEmail.split('@')[0] }
          }
        });
        if (signUpError) throw signUpError;

        // Create user record - loadUserData will handle if this fails
        if (authData.user) {
          await supabase.from('users').upsert({
            auth_id: authData.user.id,
            email: authEmail,
            nome: authName || authEmail.split('@')[0]
          }, { onConflict: 'auth_id' }).select('id');
        }
      }

      // loadUserData will find or create user as needed
      setIsAuthenticated(true);
      await loadUserData();
    } catch (error) {
      setAuthError(error.message || 'Erro na autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  const loadPayPalScript = () => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'sb') {
      console.warn('PayPal: usando modo sandbox (client ID não configurado)');
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    script.async = true;

    // Timeout para não ficar eternamente "A carregar..."
    const timeout = setTimeout(() => {
      if (!window.paypal) {
        setPaypalError('PayPal demorou muito a carregar. Verifica a tua ligação à internet ou tenta o pagamento manual.');
        console.error('PayPal SDK timeout após', PAYPAL_SDK_TIMEOUT, 'ms');
      }
    }, PAYPAL_SDK_TIMEOUT);

    script.onload = () => {
      clearTimeout(timeout);
      if (window.paypal) {
        setPaypalLoaded(true);
      } else {
        setPaypalError('PayPal carregou mas não inicializou correctamente. Tenta recarregar a página.');
      }
    };
    script.onerror = (e) => {
      clearTimeout(timeout);
      console.error('PayPal SDK load error:', e);
      setPaypalError('Erro ao carregar PayPal. Verifica a tua ligação à internet ou usa o pagamento manual (M-Pesa/Transferência).');
    };
    document.body.appendChild(script);
  };

  const renderPayPalButtons = () => {
    if (!paypalRef.current) return;
    if (!window.paypal) {
      console.warn('PayPal SDK não disponível, a tentar carregar novamente...');
      loadPayPalScript();
      return;
    }
    paypalRef.current.innerHTML = '';

    const plan = getActivePlans()[selectedPlan] || SUBSCRIPTION_PLANS.SEMESTRAL;
    const discounted = getDiscountedPrice(plan);

    // Validar valor antes de criar botões
    const amountValue = parseFloat(discounted.usd).toFixed(2);
    if (isNaN(parseFloat(amountValue)) || parseFloat(amountValue) <= 0) {
      console.error('PayPal: valor inválido', discounted.usd);
      setPaypalError('Erro: valor do plano inválido. Tenta seleccionar outro plano.');
      return;
    }

    try {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 50 },
        createOrder: (data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              description: `Vitalis ${plan.name}${promoDiscount ? ` (${promoDiscount}% off)` : ''} - ${userName || userEmail}`,
              amount: { currency_code: 'USD', value: amountValue }
            }],
            application_context: {
              brand_name: 'Sete Ecos - Vitalis',
              shipping_preference: 'NO_SHIPPING'
            }
          });
        },
        onApprove: async (data, actions) => {
          setProcessing(true);
          try {
            const details = await actions.order.capture();

            // Verificar se captura foi bem sucedida
            if (details.status !== 'COMPLETED') {
              throw new Error(`Pagamento não completado (status: ${details.status})`);
            }

            const result = await activateSubscription(userId, {
              method: 'paypal',
              transactionId: details.id,
              amount: discounted.usd,
              currency: 'USD',
              planId: plan.id,
              payerEmail: details.payer?.email_address
            });

            // Mark promo code as used if applicable
            if (promoCode) {
              await useInviteCode(userId, promoCode).catch(console.error);
            }

            if (result.success) {
              // Recompensar quem indicou (se aplicavel)
              rewardReferrer(userId).catch(console.error);

              const validoAte = new Date();
              validoAte.setMonth(validoAte.getMonth() + plan.duration);
              EmailTriggers.onPagamentoSucesso({
                nome: userName || userEmail.split('@')[0],
                email: userEmail,
                plano: plan.name,
                valor: `$${plan.price_usd}`,
                validoAte: validoAte.toLocaleDateString('pt-PT')
              }).catch(console.error);

              // Navegar directamente
              const { data: intake } = await supabase
                .from('vitalis_intake')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

              if (intake) {
                navigate('/vitalis/dashboard');
              } else {
                navigate('/vitalis/intake');
              }
            }
          } catch (error) {
            console.error('PayPal onApprove error:', error);
            setMessage({ type: 'error', text: `Erro ao processar pagamento: ${error.message || 'erro desconhecido'}. Contacta-nos via WhatsApp se o valor foi cobrado.` });
          } finally {
            setProcessing(false);
          }
        },
        onError: (err) => {
          console.error('PayPal button error:', err);
          setMessage({ type: 'error', text: 'Erro no PayPal. Tenta novamente ou usa o pagamento manual (M-Pesa/Transferência).' });
        },
        onCancel: () => setMessage({ type: 'info', text: 'Pagamento cancelado. Podes tentar novamente quando quiseres.' })
      }).render(paypalRef.current).catch((renderErr) => {
        console.error('PayPal render error:', renderErr);
        setPaypalError('Erro ao inicializar PayPal. Tenta recarregar a página ou usa M-Pesa.');
      });
    } catch (err) {
      console.error('PayPal Buttons() error:', err);
      setPaypalError('Erro ao criar botões PayPal. Tenta recarregar a página ou usa M-Pesa.');
    }
  };

  const handleInviteCode = async () => {
    if (!inviteCode.trim()) return;

    // Código especial para teste PayPal $1
    if (inviteCode.toUpperCase() === 'PAYPAL-TEST-1') {
      setShowTestPlan(true);
      setSelectedPlan('TEST');
      setMessage({ type: 'success', text: 'Plano de teste $1 activado!' });
      return;
    }

    setProcessing(true);
    try {
      // Check if it's a promo code (discount) by querying the code type first
      const { data: codeData } = await supabase
        .from('vitalis_invite_codes')
        .select('type, notes')
        .eq('code', inviteCode.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (codeData?.type === 'promo') {
        // Promo code: read discount percentage from notes (default 50%)
        let discountPercent = 50; // default
        if (codeData.notes) {
          // Try to parse discount from notes (e.g., "20" or "discount:20")
          const match = codeData.notes.match(/(\d+)/);
          if (match) {
            discountPercent = parseInt(match[1]);
          }
        }
        setPromoDiscount(discountPercent);
        setPromoCode(inviteCode.toUpperCase());
        setMessage({ type: 'success', text: `${discountPercent}% de desconto aplicado! Escolhe o teu plano e paga com PayPal.` });
        setProcessing(false);
        return;
      }

      // Other codes (tester, trial): activate immediately
      const result = await useInviteCode(userId, inviteCode);
      if (result.success) {
        EmailTriggers.onPagamentoSucesso({
          nome: userName || userEmail.split('@')[0],
          email: userEmail,
          plano: 'Convite',
          valor: 'Cortesia',
          validoAte: 'Conforme convite'
        }).catch(console.error);

        const { data: intake } = await supabase
          .from('vitalis_intake')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (intake) {
          navigate('/vitalis/dashboard');
        } else {
          navigate('/vitalis/intake');
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Código inválido.' });
      }
    } catch (err) {
      console.error('Erro ao usar código:', err);
      setMessage({ type: 'error', text: 'Erro ao verificar código.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleManualPayment = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage({ type: 'error', text: 'Precisas de criar conta primeiro.' });
      return;
    }

    if (!manualReference.trim()) {
      setMessage({ type: 'error', text: 'Insere a referência do pagamento.' });
      return;
    }

    const plan = getActivePlans()[selectedPlan] || SUBSCRIPTION_PLANS.SEMESTRAL;

    // Calculate amount based on plan and selected currency
    const planPrice = getDiscountedPrice(plan);
    const mznValue = planPrice.mzn;
    let amount;

    if (manualCurrency === 'USD') {
      amount = parseFloat((mznValue / EXCHANGE_RATES.USD).toFixed(2));
    } else if (manualCurrency === 'EUR') {
      amount = parseFloat((mznValue / EXCHANGE_RATES.EUR).toFixed(2));
    } else {
      amount = parseFloat(mznValue.toFixed(2));
    }

    setProcessing(true);
    try {
      console.log('🔄 Enviando pagamento manual:', {
        userId,
        method: manualPaymentType,
        reference: manualReference,
        amount,
        currency: manualCurrency,
        planId: selectedPlan
      });

      const result = await registerPendingPayment(userId, {
        method: manualPaymentType === 'mpesa' ? 'M-Pesa' :
                manualPaymentType === 'transfer' ? 'Transferência Bancária' :
                'WhatsApp',
        reference: manualReference,
        amount: amount,
        currency: manualCurrency,
        planId: selectedPlan.toLowerCase()
      });

      console.log('📊 Resultado do registerPendingPayment:', result);

      if (result.success) {
        setShowManualSuccess(true);
        setMessage({
          type: 'success',
          text: 'Pagamento registado! Aguarda confirmação da coach (até 24h).'
        });

        // Send email notification
        EmailTriggers.onPagamentoPendente({
          nome: userName || userEmail.split('@')[0],
          email: userEmail,
          plano: plan.name,
          valor: `${amount.toLocaleString()} ${manualCurrency}`,
          metodo: manualPaymentType === 'mpesa' ? 'M-Pesa' :
                  manualPaymentType === 'transfer' ? 'Transferência Bancária' :
                  'WhatsApp',
          referencia: manualReference
        }).catch(console.error);

      } else {
        // 🛡️ Mostrar erro detalhado
        const errorMsg = result.error?.message || result.error || 'Erro desconhecido';
        console.error('❌ Erro ao registar pagamento:', errorMsg);
        setMessage({
          type: 'error',
          text: `Erro: ${errorMsg}`
        });
      }
    } catch (error) {
      console.error('❌ Erro ao processar pagamento manual:', error);
      setMessage({
        type: 'error',
        text: `Erro: ${error.message || 'Erro inesperado'}`
      });
    } finally {
      setProcessing(false);
    }
  };

  const getActivePlans = () => planType === 'bundle' ? BUNDLE_PLANS : SUBSCRIPTION_PLANS;
  const getCurrentPlan = () => getActivePlans()[selectedPlan];

  const getDiscountedPrice = (plan) => {
    if (!promoDiscount) return { usd: plan.price_usd, mzn: plan.price_mzn };
    const factor = (100 - promoDiscount) / 100;
    return {
      usd: Math.round(plan.price_usd * factor),
      mzn: Math.round(plan.price_mzn * factor)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7C8B6F] to-[#5A6B4D] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C8B6F] via-[#6B7A5D] to-[#5A6B4D] p-4 pb-24">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center py-6">
          <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-20 h-20 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white mb-1">Vitalis</h1>
          <p className="text-white/80 text-sm">Escolhe o teu plano e começa a transformação</p>
        </div>

        {/* Código de Convite - LOGO NO TOPO, bem visível */}
        <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-4">
          <p className="text-white font-medium text-sm mb-3 text-center">🎟️ Tens um código de convite ou desconto?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Insere o teu código aqui"
              className="flex-1 p-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 text-center font-medium"
            />
            <button
              onClick={isAuthenticated ? handleInviteCode : () => setMessage({ type: 'info', text: 'Cria conta primeiro para usar o código.' })}
              disabled={!inviteCode.trim() || processing}
              className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-semibold disabled:opacity-50 transition-all"
            >
              Aplicar
            </button>
          </div>
          {!isAuthenticated && inviteCode.trim() && (
            <p className="text-yellow-200 text-xs mt-2 text-center">
              ↓ Cria conta abaixo e o código será aplicado automaticamente
            </p>
          )}
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-4 ${
            message.type === 'error' ? 'bg-red-500/20 text-red-100' :
            message.type === 'success' ? 'bg-green-500/20 text-green-100' :
            'bg-blue-500/20 text-blue-100'
          }`}>
            {message.text}
          </div>
        )}

        {/* FREE 7 DAY TRIAL BUTTON */}
        <div className="mb-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/40 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-3xl">🎁</div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">Experimenta 7 Dias Grátis</h3>
              <p className="text-white/80 text-sm mb-4">
                Acesso completo ao dashboard, check-ins diários, espaço de retorno e receitas. Sem cartão de crédito.
              </p>
              <button
                onClick={async () => {
                  if (!isAuthenticated) {
                    setMessage({ type: 'info', text: 'Cria conta primeiro para iniciar o trial gratuito.' });
                    return;
                  }
                  setProcessing(true);
                  try {
                    const { startTrial } = await import('../../lib/subscriptions');
                    const result = await startTrial(userId);
                    if (result.success) {
                      setMessage({ type: 'success', text: `🎉 Trial de ${result.trialDays} dias ativado! Redirecionando...` });
                      setTimeout(() => navigate('/vitalis/dashboard'), 1500);
                    } else {
                      setMessage({ type: 'error', text: 'Erro ao ativar trial. Tenta novamente.' });
                    }
                  } catch (err) {
                    setMessage({ type: 'error', text: 'Erro ao ativar trial: ' + err.message });
                  } finally {
                    setProcessing(false);
                  }
                }}
                disabled={!isAuthenticated || processing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-full font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'A ativar...' : '🚀 Começar Trial Gratuito (7 Dias)'}
              </button>
              {!isAuthenticated && (
                <p className="text-green-200 text-xs mt-2 text-center">
                  ↓ Cria conta abaixo primeiro
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-white/60 text-sm">ou escolhe um plano pago com desconto</p>
        </div>

        {/* Toggle Individual / Bundle */}
        <div className="flex gap-2 mb-4 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => { setPlanType('individual'); setSelectedPlan('SEMESTRAL'); }}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              planType === 'individual' ? 'bg-white/20 text-white shadow' : 'text-white/60 hover:text-white/80'
            }`}
          >
            Vitalis
          </button>
          <button
            onClick={() => { setPlanType('bundle'); setSelectedPlan('SEMESTRAL'); }}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all relative ${
              planType === 'bundle' ? 'bg-gradient-to-r from-[#7C8B6F]/40 to-[#C9A227]/40 text-white shadow' : 'text-white/60 hover:text-white/80'
            }`}
          >
            Vitalis + Aurea
            <span className="absolute -top-1.5 -right-1 bg-[#C9A227] text-[10px] text-black font-bold px-1.5 py-0.5 rounded-full">-25%</span>
          </button>
        </div>

        {planType === 'bundle' && (
          <div className="bg-gradient-to-r from-[#7C8B6F]/20 to-[#C9A227]/20 border border-[#C9A227]/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-white/90 text-xs text-center leading-relaxed">
              Vitalis (Nutricao) + Aurea (Autocuidado) juntos com 25% de desconto.
              Dois sistemas integrados para a tua transformacao completa.
            </p>
          </div>
        )}

        {/* PLANOS */}
        <div className="space-y-3 mb-6">
          {Object.entries(getActivePlans())
            .filter(([key, plan]) => !plan.hidden || (showTestPlan && key === 'TEST'))
            .map(([key, plan]) => (
            <button
              key={key}
              onClick={() => setSelectedPlan(key)}
              disabled={processing}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left relative ${
                selectedPlan === key
                  ? 'bg-white/20 border-white shadow-lg'
                  : 'bg-white/5 border-white/20 hover:border-white/40'
              }`}
            >
              {plan.discount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{plan.discount}%
                </span>
              )}
              {key === 'SEMESTRAL' && (
                <span className="absolute -top-2 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                  Recomendado
                </span>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedPlan === key
                      ? 'bg-white'
                      : 'bg-white/20 border-2 border-white/40'
                  }`}>
                    {selectedPlan === key && (
                      <span className="text-[#7C8B6F] text-sm font-bold">✓</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                    <p className="text-sm text-white/60">{plan.duration} {plan.duration === 1 ? 'mês' : 'meses'}</p>
                  </div>
                </div>
                <div className="text-right">
                  {promoDiscount > 0 ? (
                    <>
                      <p className="text-sm text-white/40 line-through">${plan.price_usd}</p>
                      <p className="text-2xl font-bold text-green-300">${getDiscountedPrice(plan).usd}</p>
                      <p className="text-xs text-white/50">{getDiscountedPrice(plan).mzn.toLocaleString()} MZN</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-white">${plan.price_usd}</p>
                      <p className="text-xs text-white/50">{plan.price_mzn.toLocaleString()} MZN</p>
                    </>
                  )}
                </div>
              </div>

              {plan.savings_usd > 0 && (
                <p className="text-xs text-green-300 mt-2 ml-9">Poupas ${plan.savings_usd} vs {planType === 'bundle' ? 'individual' : 'mensal'}</p>
              )}
            </button>
          ))}
        </div>

        {/* Resumo */}
        <div className="bg-white/10 rounded-2xl p-4 mb-6">
          {promoDiscount > 0 && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded-full">-{promoDiscount}% PROMO</span>
              <span className="text-green-300 text-xs">Desconto aplicado</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total a pagar:</span>
            <div className="text-right">
              {promoDiscount > 0 && (
                <span className="text-white/40 text-sm line-through mr-2">{getCurrentPlan().price_mzn.toLocaleString()} MZN</span>
              )}
              <span className={`font-bold text-2xl ${promoDiscount > 0 ? 'text-green-300' : 'text-white'}`}>
                {getDiscountedPrice(getCurrentPlan()).mzn.toLocaleString()} MZN
              </span>
              <p className="text-xs text-white/50 mt-1">~${getDiscountedPrice(getCurrentPlan()).usd} USD</p>
            </div>
          </div>
        </div>

        {/* SE AUTENTICADO: Mostrar PayPal */}
        {isAuthenticated ? (
          <div className="mb-6">
            {/* Info de conta logada */}
            <div className="bg-white/10 rounded-xl p-3 mb-4 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-white/60">Conta: </span>
                <span className="text-white font-medium">{userEmail}</span>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="text-white/60 hover:text-white text-xs underline"
              >
                Usar outra conta
              </button>
            </div>
            {paypalError ? (
              <div className="bg-red-500/20 border border-red-400 rounded-xl p-4 text-center text-red-200">
                {paypalError}
              </div>
            ) : processing ? (
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-white/80">A processar...</p>
              </div>
            ) : userLoadError ? (
              <div className="bg-red-500/20 border border-red-400 rounded-xl p-4 text-center">
                <p className="text-red-100 font-medium mb-2">Erro ao carregar dados da conta</p>
                <p className="text-red-200 text-sm mb-3">
                  Não foi possível associar a tua conta. Por favor contacta o suporte.
                </p>
                <a
                  href="https://wa.me/258851006473?text=Olá! Tenho um problema ao aceder à página de pagamento do Vitalis. O meu email é: "
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Contactar via WhatsApp
                </a>
              </div>
            ) : !userId ? (
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-white/60 text-sm">A preparar pagamento...</p>
              </div>
            ) : showManualSuccess ? (
              <div className="bg-green-500/20 border-2 border-green-500 rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-white mb-3">Pagamento Registado!</h3>
                <p className="text-green-100 mb-4">
                  Recebemos o teu registo de pagamento. A Coach Vivianne vai confirmar em até 24 horas.
                </p>
                <div className="bg-white/10 rounded-xl p-4 mb-4 text-left text-sm text-white/80">
                  <p className="mb-2"><strong>Método:</strong> {manualPaymentType === 'mpesa' ? 'M-Pesa' : manualPaymentType === 'transfer' ? 'Transferência Bancária' : 'WhatsApp'}</p>
                  <p className="mb-2"><strong>Referência:</strong> {manualReference}</p>
                  <p className="mb-2"><strong>Valor:</strong> {parseFloat(manualAmount).toLocaleString()} {manualCurrency}</p>
                  <p><strong>Plano:</strong> {getCurrentPlan()?.name}</p>
                </div>
                <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-4 mb-4">
                  <p className="text-amber-200 text-sm font-medium mb-2">⏳ Aguarda Aprovação</p>
                  <p className="text-amber-100/90 text-xs leading-relaxed">
                    O teu pagamento está em análise. Vais receber um email de confirmação quando a Coach Vivianne aprovar (até 24h).
                    Depois disso, poderás aceder ao Dashboard Vitalis.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/vitalis')}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
                >
                  ← Voltar à Página Inicial
                </button>
              </div>
            ) : (
              <>
                {/* Payment Method Selector */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      paymentMethod === 'paypal'
                        ? 'bg-gradient-to-r from-[#0070BA] to-[#003087] text-white shadow-lg'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    💳 PayPal
                  </button>
                  <button
                    onClick={() => setPaymentMethod('manual')}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      paymentMethod === 'manual'
                        ? 'bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white shadow-lg'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    🇲🇿 M-Pesa / Transferência
                  </button>
                </div>

                {paymentMethod === 'paypal' ? (
                  <>
                    <div ref={paypalRef} className="min-h-[60px] bg-white rounded-xl p-3">
                      {paypalError ? (
                        <div className="text-center py-3">
                          <p className="text-red-600 text-sm mb-3">{paypalError}</p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => {
                                setPaypalError(null);
                                loadPayPalScript();
                              }}
                              className="px-4 py-2 bg-[#0070BA] text-white rounded-lg text-sm font-medium hover:bg-[#005EA6] transition-all"
                            >
                              Tentar novamente
                            </button>
                            <button
                              onClick={() => setPaymentMethod('manual')}
                              className="px-4 py-2 bg-[#7C8B6F] text-white rounded-lg text-sm font-medium hover:bg-[#6B7A5D] transition-all"
                            >
                              Pagar via M-Pesa
                            </button>
                          </div>
                        </div>
                      ) : !paypalLoaded ? (
                        <div className="text-center py-2">
                          <div className="w-6 h-6 border-2 border-[#7C8B6F] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-gray-500 text-sm">A carregar PayPal...</p>
                        </div>
                      ) : null}
                    </div>
                    <p className="text-white/60 text-xs text-center mt-2">
                      Paga com cartão de crédito/débito ou conta PayPal
                    </p>
                  </>
                ) : (
                  <form onSubmit={handleManualPayment} className="space-y-4">
                    {/* Manual Payment Form */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        📱 Dados do Pagamento
                      </h4>

                      {/* Payment Type Selection */}
                      <div className="mb-4">
                        <label className="text-white/80 text-sm mb-2 block">Método de Pagamento</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'mpesa', label: 'M-Pesa', icon: '📱' },
                            { value: 'transfer', label: 'Transferência', icon: '🏦' },
                            { value: 'whatsapp', label: 'WhatsApp', icon: '💬' }
                          ].map((method) => (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => setManualPaymentType(method.value)}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                manualPaymentType === method.value
                                  ? 'bg-[#7C8B6F] text-white'
                                  : 'bg-white/10 text-white/60 hover:bg-white/20'
                              }`}
                            >
                              {method.icon} {method.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reference Input */}
                      <div className="mb-4">
                        <label className="text-white/80 text-sm mb-2 block">
                          Referência / ID da Transação *
                        </label>
                        <input
                          type="text"
                          value={manualReference}
                          onChange={(e) => setManualReference(e.target.value)}
                          placeholder="Ex: TXN123456789"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/95 border border-gray-200 focus:border-[#7C8B6F] focus:outline-none"
                        />
                        <p className="text-white/50 text-xs mt-1">
                          {manualPaymentType === 'mpesa' ? 'Código de confirmação M-Pesa' :
                           manualPaymentType === 'transfer' ? 'Referência bancária' :
                           'Número do comprovativo enviado via WhatsApp'}
                        </p>
                      </div>

                      {/* Amount Input - READONLY (valor fixo do plano) */}
                      <div className="mb-4">
                        <label className="text-white/80 text-sm mb-2 block">Valor a Pagar *</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={(() => {
                              const planPrice = getDiscountedPrice(getCurrentPlan());
                              const mznValue = planPrice.mzn;
                              if (manualCurrency === 'USD') {
                                return (mznValue / EXCHANGE_RATES.USD).toFixed(2);
                              } else if (manualCurrency === 'EUR') {
                                return (mznValue / EXCHANGE_RATES.EUR).toFixed(2);
                              }
                              return mznValue.toFixed(2);
                            })()}
                            readOnly
                            className="flex-[3] px-4 py-3 rounded-xl bg-gray-100 border-2 border-gray-300 text-xl font-bold text-gray-700 cursor-not-allowed"
                          />
                          <select
                            value={manualCurrency}
                            onChange={(e) => setManualCurrency(e.target.value)}
                            className="w-28 px-3 py-3 rounded-xl bg-white/95 border-2 border-gray-300 focus:border-[#7C8B6F] focus:outline-none text-base font-semibold text-gray-900"
                          >
                            <option value="MZN">MZN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                        <p className="text-white/50 text-xs mt-1">
                          Plano {getCurrentPlan()?.name} - Valor fixo conforme plano escolhido
                        </p>
                      </div>

                      {/* Payment Instructions */}
                      <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-4 mb-4">
                        <p className="text-amber-200 text-sm font-medium mb-2">📝 Instruções:</p>
                        <ul className="text-amber-100/80 text-xs space-y-1">
                          {manualPaymentType === 'mpesa' ? (
                            <>
                              <li>1. Faz o pagamento via M-Pesa para <strong>+258 85 100 6473</strong></li>
                              <li>2. Copia o código de confirmação</li>
                              <li>3. Cola aqui em cima e submete</li>
                            </>
                          ) : manualPaymentType === 'transfer' ? (
                            <>
                              <li>1. Transfere para a conta bancária fornecida</li>
                              <li>2. Guarda a referência da transferência</li>
                              <li>3. Insere a referência aqui e submete</li>
                            </>
                          ) : (
                            <>
                              <li>1. Envia comprovativo via WhatsApp <strong>+258 85 100 6473</strong></li>
                              <li>2. Anota o número/ID da mensagem</li>
                              <li>3. Insere aqui e submete</li>
                            </>
                          )}
                        </ul>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={processing || !manualReference.trim()}
                        className="w-full py-3 bg-gradient-to-r from-[#7C8B6F] to-[#6B7A5D] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                      >
                        {processing ? 'A registar...' : '✓ Confirmar Pagamento'}
                      </button>
                    </div>

                    <p className="text-white/50 text-xs text-center">
                      O teu pagamento será verificado e aprovado em até 24 horas.
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        ) : (
          /* SE NÃO AUTENTICADO: Mostrar formulário de registo/login */
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#4A4035] mb-4 text-center">
              Cria a tua conta para continuar
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  authMode === 'register' ? 'bg-[#7C8B6F] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Criar Conta
              </button>
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  authMode === 'login' ? 'bg-[#7C8B6F] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Já tenho conta
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-3">
              {authMode === 'register' && (
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="O teu nome"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none"
                />
              )}
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none"
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Palavra-passe (mín. 6 caracteres)"
                required
                minLength={6}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#7C8B6F] focus:outline-none"
              />

              {authMode === 'login' && (
                <div className="text-right">
                  <a
                    href="/recuperar-password"
                    className="text-sm text-white/70 hover:text-white underline"
                  >
                    Esqueceste a password?
                  </a>
                </div>
              )}

              {authError && (
                <p className="text-red-500 text-sm text-center">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-[#7C8B6F] hover:bg-[#6B7A5D] text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {authLoading ? 'A processar...' : authMode === 'register' ? 'Criar Conta e Pagar' : 'Entrar e Pagar'}
              </button>
            </form>
          </div>
        )}

        {/* O que inclui */}
        <div className="bg-white/10 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-white mb-3">O que inclui:</h3>
          <ul className="space-y-2 text-sm text-white/80">
            {[
              'Plano nutricional personalizado',
              'Sistema de 3 fases',
              'Receitas ilimitadas',
              'Tracking de progresso',
              'Relatorios semanais',
              'Chat com a coach Vivianne',
              ...(planType === 'bundle' ? [
                '— AUREA incluido —',
                '100+ micro-praticas de autocuidado',
                'Espelho de Roupa & Estilo',
                'Diario de Merecimento',
                'Meditacoes guiadas'
              ] : []),
              'Comunidade de suporte'
            ].map((item, i) => (
              <li key={i} className={`flex items-center gap-2 ${item.startsWith('—') ? 'text-[#C9A227] font-semibold mt-2' : ''}`}>
                {item.startsWith('—') ? <span className="text-[#C9A227]">+</span> : <span className="text-green-300">✓</span>} {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center text-white/50 text-xs">
          <p>🔒 Pagamento seguro via PayPal</p>
        </div>

        {/* Voltar */}
        <div className="text-center mt-6">
          <button onClick={() => navigate('/vitalis')} className="text-white/60 text-sm">
            ← Voltar à página do Vitalis
          </button>
        </div>
      </div>

      {/* Modal Sucesso - com passos do onboarding */}
      {showCommunityModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl my-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-[#4A4035] mb-2">{g('Bem-vindo ao Vitalis!', 'Bem-vinda ao Vitalis!')}</h2>
            <p className="text-gray-600 mb-6">Acesso confirmado com sucesso.</p>

            {/* Passos do Onboarding */}
            <div className="bg-[#F5F2ED] rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-[#4A4035] mb-3">📋 Os próximos passos:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#7C8B6F] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-[#4A4035] text-sm">Questionário inicial</p>
                    <p className="text-xs text-gray-500">~5 minutos - conhecer os teus objectivos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-500 text-sm">Plano personalizado</p>
                    <p className="text-xs text-gray-400">Recebe o teu plano alimentar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-500 text-sm">Dashboard</p>
                    <p className="text-xs text-gray-400">Começa a tua transformação</p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={WHATSAPP_COMMUNITY}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full font-medium text-sm mb-4"
            >
              💬 Entrar na Comunidade WhatsApp
            </a>

            <button
              onClick={() => navigate('/vitalis/intake')}
              className="w-full py-4 bg-[#7C8B6F] hover:bg-[#6B7A5D] text-white rounded-xl font-semibold transition-all"
            >
              Começar Questionário →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagamentoVitalis;
