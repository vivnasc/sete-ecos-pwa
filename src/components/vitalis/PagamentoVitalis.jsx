import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  activateSubscription,
  useInviteCode,
  checkVitalisAccess
} from '../../lib/subscriptions';
import { EmailTriggers } from '../../lib/emails';

/**
 * VITALIS - Pagina de Pagamento com PayPal Automatico
 *
 * Precos:
 * - Mensal: 2,500 MZN / $38
 * - Semestral: 12,500 MZN / $190 (17% desconto)
 * - Anual: 21,000 MZN / $320 (30% desconto)
 *
 * Fluxo PayPal:
 * 1. User seleciona plano
 * 2. Clica no botao PayPal
 * 3. Aprova pagamento no popup PayPal
 * 4. Subscricao ativada AUTOMATICAMENTE
 * 5. Redireciona para o dashboard
 */

// PayPal Client ID - sandbox para testes, live para producao
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb'; // 'sb' = sandbox default

const PagamentoVitalis = () => {
  const navigate = useNavigate();
  const paypalRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [accessStatus, setAccessStatus] = useState(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  // Auth form states
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Selecao de plano
  const [selectedPlan, setSelectedPlan] = useState('MONTHLY');

  // Estados
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCommunityModal, setShowCommunityModal] = useState(false);

  // Link da comunidade WhatsApp
  const WHATSAPP_COMMUNITY = 'https://chat.whatsapp.com/FbHbQuDPGAZ3myiu29CmHO';

  useEffect(() => {
    loadUserData();
    loadPayPalScript();
  }, []);

  // Recarregar botoes PayPal quando plano muda
  useEffect(() => {
    if (paypalLoaded && userId) {
      renderPayPalButtons();
    }
  }, [selectedPlan, paypalLoaded, userId]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Mostrar formulário de autenticação em vez de redirecionar
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      setUserEmail(user.email);

      const { data: userData } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_id', user.id)
        .single();

      if (userData) {
        setUserId(userData.id);
        setUserName(userData.nome);

        const access = await checkVitalisAccess(userData.id);
        setAccessStatus(access);

        if (access.hasAccess && access.status !== SUBSCRIPTION_STATUS.PENDING) {
          navigate('/vitalis/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Autenticação
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
      } else {
        // Registo
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword
        });
        if (authError) throw authError;

        // Criar user na tabela users
        if (authData.user) {
          await supabase.from('users').insert([{
            auth_id: authData.user.id,
            email: authEmail,
            nome: authName || authEmail.split('@')[0]
          }]);
        }
      }

      // Recarregar dados do utilizador
      setNeedsAuth(false);
      setLoading(true);
      await loadUserData();
    } catch (error) {
      setAuthError(error.message || 'Erro na autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  // Carregar PayPal SDK
  const loadPayPalScript = () => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;

    script.onload = () => {
      setPaypalLoaded(true);
    };

    script.onerror = () => {
      setPaypalError('Erro ao carregar PayPal. Tenta recarregar a pagina.');
    };

    document.body.appendChild(script);
  };

  // Renderizar botoes PayPal
  const renderPayPalButtons = () => {
    if (!paypalRef.current || !window.paypal) return;

    // Limpar botoes anteriores
    paypalRef.current.innerHTML = '';

    const plan = SUBSCRIPTION_PLANS[selectedPlan];

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'pay',
        height: 50
      },

      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            description: `Vitalis ${plan.name} - ${userName || userEmail}`,
            amount: {
              currency_code: 'USD',
              value: plan.price_usd.toString()
            }
          }]
        });
      },

      onApprove: async (data, actions) => {
        setProcessing(true);
        setMessage({ type: '', text: '' });

        try {
          // Capturar pagamento
          const details = await actions.order.capture();

          // Ativar subscricao automaticamente
          const result = await activateSubscription(userId, {
            method: 'paypal',
            transactionId: details.id,
            amount: plan.price_usd,
            currency: 'USD',
            planId: plan.id,
            payerEmail: details.payer?.email_address
          });

          if (result.success) {
            // Calcular data de validade
            const validoAte = new Date();
            validoAte.setMonth(validoAte.getMonth() + plan.duration);

            // Enviar emails de confirmacao (async, nao bloqueia)
            EmailTriggers.onPagamentoSucesso({
              nome: userName || userEmail.split('@')[0],
              email: userEmail,
              plano: plan.name,
              valor: `$${plan.price_usd}`,
              validoAte: validoAte.toLocaleDateString('pt-PT')
            }).catch(err => console.error('Erro ao enviar emails:', err));

            // Mostrar modal da comunidade WhatsApp
            setShowCommunityModal(true);
          } else {
            throw new Error('Erro ao ativar subscricao');
          }
        } catch (error) {
          console.error('Erro no pagamento:', error);
          setMessage({
            type: 'error',
            text: 'Erro ao processar pagamento. Contacta o suporte.'
          });
        } finally {
          setProcessing(false);
        }
      },

      onError: (err) => {
        console.error('PayPal Error:', err);
        setMessage({
          type: 'error',
          text: 'Erro no PayPal. Tenta novamente.'
        });
      },

      onCancel: () => {
        setMessage({
          type: 'info',
          text: 'Pagamento cancelado.'
        });
      }
    }).render(paypalRef.current);
  };

  // Usar codigo de convite
  const handleInviteCode = async () => {
    if (!inviteCode.trim()) {
      setMessage({ type: 'error', text: 'Insere o codigo de convite.' });
      return;
    }

    setProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await useInviteCode(userId, inviteCode);

      if (result.success) {
        // Enviar emails de boas-vindas (async)
        EmailTriggers.onPagamentoSucesso({
          nome: userName || userEmail.split('@')[0],
          email: userEmail,
          plano: 'Convite Especial',
          valor: 'Cortesia',
          validoAte: 'Conforme convite'
        }).catch(err => console.error('Erro ao enviar emails:', err));

        // Mostrar modal da comunidade WhatsApp
        setShowCommunityModal(true);
      } else {
        setMessage({ type: 'error', text: result.error || 'Codigo invalido.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao verificar codigo.' });
    } finally {
      setProcessing(false);
    }
  };

  // Obter plano atual
  const getCurrentPlan = () => SUBSCRIPTION_PLANS[selectedPlan];

  // Formatar preco
  const formatPrice = (plan, inUSD = true) => {
    return inUSD ? `$${plan.price_usd}` : `${plan.price_mzn.toLocaleString()} MZN`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-300">A carregar...</p>
        </div>
      </div>
    );
  }

  // Formulário de autenticação se necessário
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 p-4 pb-24">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center py-8">
            <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Vitalis</h1>
            <p className="text-emerald-300 text-sm">
              {authMode === 'login' ? 'Entra na tua conta para continuar' : 'Cria uma conta para começar'}
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/30">
            {/* Toggle Login/Register */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
                  authMode === 'login'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-emerald-300 hover:bg-white/20'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all ${
                  authMode === 'register'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-emerald-300 hover:bg-white/20'
                }`}
              >
                Criar Conta
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm text-emerald-300 mb-1">Nome</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="O teu nome"
                    className="w-full p-3 bg-white/10 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-emerald-300 mb-1">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  className="w-full p-3 bg-white/10 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-sm text-emerald-300 mb-1">Palavra-passe</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full p-3 bg-white/10 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
              >
                {authLoading ? 'A processar...' : authMode === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            </form>
          </div>

          {/* Back to landing */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/vitalis')}
              className="text-emerald-400 hover:text-emerald-300 text-sm"
            >
              ← Voltar à página do Vitalis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 p-4 pb-24">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Vitalis</h1>
          <p className="text-emerald-300 text-sm">Subscreve para aceder ao teu plano personalizado</p>
        </div>

        {/* Selecao de Plano */}
        <div className="space-y-3 mb-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <button
              key={key}
              onClick={() => setSelectedPlan(key)}
              disabled={processing}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left relative ${
                selectedPlan === key
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Badge desconto */}
              {plan.discount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{plan.discount}%
                </span>
              )}

              {/* Badge popular */}
              {key === 'SEMESTRAL' && (
                <span className="absolute -top-2 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Popular
                </span>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-emerald-300/70">
                    {plan.duration} {plan.duration === 1 ? 'mes' : 'meses'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">${plan.price_usd}</p>
                  <p className="text-xs text-emerald-300/50">{plan.price_mzn.toLocaleString()} MZN</p>
                </div>
              </div>

              {plan.savings_usd > 0 && (
                <p className="text-xs text-green-400 mt-2">
                  Poupas ${plan.savings_usd} vs mensal
                </p>
              )}

              {/* Checkmark */}
              {selectedPlan === key && (
                <div className="absolute top-4 right-4 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Resumo */}
        <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-emerald-500/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-emerald-300">Plano selecionado:</span>
            <span className="text-white font-bold">{getCurrentPlan().name}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="text-emerald-300">Total:</span>
            <span className="text-emerald-400 font-bold text-2xl">${getCurrentPlan().price_usd}</span>
          </div>
        </div>

        {/* Botao PayPal */}
        <div className="mb-6">
          {paypalError ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-300">{paypalError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-red-400 underline"
              >
                Recarregar pagina
              </button>
            </div>
          ) : processing ? (
            <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-6 text-center">
              <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-emerald-300">A processar pagamento...</p>
            </div>
          ) : (
            <div ref={paypalRef} className="min-h-[50px]">
              {!paypalLoaded && (
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-emerald-300 text-sm">A carregar PayPal...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mensagem */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 ${
            message.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
            message.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/30' :
            'bg-blue-500/20 text-blue-200 border border-blue-500/30'
          }`}>
            {message.text}
          </div>
        )}

        {/* Codigo de Convite */}
        <div className="mb-6">
          {!showInviteInput ? (
            <button
              onClick={() => setShowInviteInput(true)}
              className="w-full py-3 text-emerald-400 text-sm hover:text-emerald-300 transition-colors"
            >
              🎟️ Tens um codigo de convite?
            </button>
          ) : (
            <div className="bg-white/5 rounded-xl p-4 border border-emerald-500/20">
              <label className="block text-sm text-emerald-300 mb-2">Codigo de Convite</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="VITALIS-XXXXX"
                  disabled={processing}
                  className="flex-1 p-3 bg-white/10 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400 font-mono"
                />
                <button
                  onClick={handleInviteCode}
                  disabled={processing || !inviteCode.trim()}
                  className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* O que inclui */}
        <div className="bg-white/5 rounded-2xl p-5 border border-emerald-500/20 mb-6">
          <h3 className="font-bold text-white mb-3">O que inclui:</h3>
          <ul className="space-y-2 text-sm">
            {[
              'Plano nutricional 100% personalizado',
              'Sistema de fases adaptativo',
              'Receitas saudaveis ilimitadas',
              'Tracking de refeicoes e progresso',
              'Relatorios semanais detalhados',
              'Suporte via comunidade'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-emerald-200">
                <span className="text-emerald-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Seguranca */}
        <div className="text-center text-emerald-300/50 text-xs">
          <p>🔒 Pagamento seguro via PayPal</p>
          <p className="mt-1">Podes cancelar a qualquer momento</p>
        </div>
      </div>

      {/* Modal Comunidade WhatsApp */}
      {showCommunityModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-emerald-500/30">
            {/* Icone de sucesso */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">🎉</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Bem-vinda ao Vitalis!
            </h2>
            <p className="text-emerald-200 mb-6">
              O teu pagamento foi confirmado com sucesso.
            </p>

            {/* Link WhatsApp */}
            <div className="bg-white/10 rounded-2xl p-4 mb-6">
              <p className="text-emerald-300 text-sm mb-3">
                Junta-te à nossa comunidade exclusiva no WhatsApp:
              </p>
              <a
                href={WHATSAPP_COMMUNITY}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Entrar na Comunidade
              </a>
            </div>

            <p className="text-emerald-300/70 text-xs mb-6">
              Na comunidade terás suporte, dicas exclusivas e motivação diária.
            </p>

            {/* Botão continuar */}
            <button
              onClick={() => navigate('/vitalis/intake')}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20"
            >
              Continuar para o Questionário →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagamentoVitalis;
