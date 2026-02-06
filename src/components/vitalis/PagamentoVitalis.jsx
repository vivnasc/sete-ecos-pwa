import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { g } from '../../utils/genero';
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  activateSubscription,
  useInviteCode,
  checkVitalisAccess
} from '../../lib/subscriptions';

import { EmailTriggers } from '../../lib/emails';
import { isCoach } from '../../lib/coach';

/**
 * VITALIS - Pagina de Pagamento
 *
 * SEMPRE mostra os planos primeiro
 * Login/Registo aparece abaixo se não autenticado
 */

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
const WHATSAPP_COMMUNITY = 'https://chat.whatsapp.com/FbHbQuDPGAZ3myiu29CmHO';

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

  useEffect(() => {
    loadUserData();
    loadPayPalScript();

    // Check for code in URL (e.g., /vitalis/pagamento?code=VITALIS-TESTER-2026)
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setInviteCode(codeFromUrl);
      setShowInviteInput(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (paypalLoaded && userId) {
      renderPayPalButtons();
    }
  }, [selectedPlan, paypalLoaded, userId]);

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
              // Navegar directamente (como handleInviteCode) - evita problemas de timing
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
          }, { onConflict: 'auth_id' });
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

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => setPaypalError('Erro ao carregar PayPal.');
    document.body.appendChild(script);
  };

  const renderPayPalButtons = () => {
    if (!paypalRef.current || !window.paypal) return;
    paypalRef.current.innerHTML = '';

    const plan = SUBSCRIPTION_PLANS[selectedPlan];

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 50 },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            description: `Vitalis ${plan.name} - ${userName || userEmail}`,
            amount: { currency_code: 'USD', value: plan.price_usd.toString() }
          }]
        });
      },
      onApprove: async (data, actions) => {
        setProcessing(true);
        try {
          const details = await actions.order.capture();
          const result = await activateSubscription(userId, {
            method: 'paypal',
            transactionId: details.id,
            amount: plan.price_usd,
            currency: 'USD',
            planId: plan.id,
            payerEmail: details.payer?.email_address
          });

          if (result.success) {
            const validoAte = new Date();
            validoAte.setMonth(validoAte.getMonth() + plan.duration);
            EmailTriggers.onPagamentoSucesso({
              nome: userName || userEmail.split('@')[0],
              email: userEmail,
              plano: plan.name,
              valor: `$${plan.price_usd}`,
              validoAte: validoAte.toLocaleDateString('pt-PT')
            }).catch(console.error);

            // Navegar directamente - evita problemas de timing com modal
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
          setMessage({ type: 'error', text: 'Erro ao processar pagamento.' });
        } finally {
          setProcessing(false);
        }
      },
      onError: () => setMessage({ type: 'error', text: 'Erro no PayPal.' }),
      onCancel: () => setMessage({ type: 'info', text: 'Pagamento cancelado.' })
    }).render(paypalRef.current);
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
      const result = await useInviteCode(userId, inviteCode);
      if (result.success) {
        EmailTriggers.onPagamentoSucesso({
          nome: userName || userEmail.split('@')[0],
          email: userEmail,
          plano: 'Convite',
          valor: 'Cortesia',
          validoAte: 'Conforme convite'
        }).catch(console.error);

        // Verificar se já fez intake
        const { data: intake } = await supabase
          .from('vitalis_intake')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (intake) {
          // Já fez intake - ir directo para dashboard
          navigate('/vitalis/dashboard');
        } else {
          // Ainda não fez intake - ir para intake
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

  const getCurrentPlan = () => SUBSCRIPTION_PLANS[selectedPlan];

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

        {/* PLANOS - SEMPRE VISÍVEIS */}
        <div className="space-y-3 mb-6">
          {Object.entries(SUBSCRIPTION_PLANS)
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
                  {/* Checkmark indicador de seleção */}
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
                  <p className="text-2xl font-bold text-white">${plan.price_usd}</p>
                  <p className="text-xs text-white/50">{plan.price_mzn.toLocaleString()} MZN</p>
                </div>
              </div>

              {plan.savings_usd > 0 && (
                <p className="text-xs text-green-300 mt-2 ml-9">Poupas ${plan.savings_usd} vs mensal</p>
              )}
            </button>
          ))}
        </div>

        {/* Resumo */}
        <div className="bg-white/10 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Total a pagar:</span>
            <span className="text-white font-bold text-2xl">${getCurrentPlan().price_usd}</span>
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
                  href="https://wa.me/258845243875?text=Olá! Tenho um problema ao aceder à página de pagamento do Vitalis. O meu email é: "
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
            ) : (
              <>
                <div ref={paypalRef} className="min-h-[60px] bg-white rounded-xl p-3">
                  {!paypalLoaded && (
                    <div className="text-center py-2">
                      <div className="w-6 h-6 border-2 border-[#7C8B6F] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">A carregar PayPal...</p>
                    </div>
                  )}
                </div>
                <p className="text-white/60 text-xs text-center mt-2">
                  Paga com cartão de crédito/débito ou conta PayPal
                </p>
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
            {['Plano nutricional personalizado', 'Sistema de 3 fases', 'Receitas ilimitadas', 'Tracking de progresso', 'Relatórios semanais', 'Comunidade de suporte'].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-300">✓</span> {item}
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
