import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ECO_PLANS,
  checkEcoAccess,
  startEcoTrial,
  getEcoPlans,
  getEcoTheme,
  registerEcoPendingPayment
} from '../../lib/shared/subscriptionPlans';
import { g } from '../../utils/genero';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
const PAYPAL_SDK_TIMEOUT = 15000;

/**
 * Features por eco — lista de funcionalidades incluidas em cada modulo
 */
const ECO_FEATURES = {
  serena: ['Diario Emocional', 'Respiracao Guiada', 'SOS Emocional', 'Praticas de Fluidez', 'Rituais de Libertacao', 'Coach Serena'],
  ignis: ['Escolhas Conscientes', 'Foco Consciente', 'Bussola de Valores', 'Diario de Conquistas', 'Desafios de Fogo', 'Coach Ignis'],
  ventis: ['Monitor de Energia', 'Rotinas Builder', 'Pausas Conscientes', 'Movimento Flow', 'Detector Burnout', 'Coach Ventis'],
  ecoa: ['Mapa de Silenciamento', 'Programa Micro-Voz', 'Biblioteca de Frases', 'Diario de Voz', 'Cartas Nao Enviadas', 'Coach Ecoa'],
  imago: ['Espelho Triplo', 'Arqueologia de Si', 'Mapa de Identidade', 'Valores Essenciais', 'Visao do Futuro', 'Coach Imago']
};

/**
 * Mapa de logos — Ignis usa hifen em vez de underscore
 */
const getLogoPath = (eco) => {
  if (eco === 'ignis') return '/logos/IGNIS-LOGO-V3.png';
  return `/logos/${eco.toUpperCase()}_LOGO_V3.png`;
};

/**
 * PagamentoEco — Pagina de pagamento generica para qualquer eco
 *
 * Props:
 * - eco: string (serena, ignis, ventis, ecoa, imago)
 */
export default function PagamentoEco({ eco }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('semestral');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const paypalRef = useRef(null);

  const theme = getEcoTheme(eco);
  const plans = getEcoPlans(eco);
  const features = ECO_FEATURES[eco] || [];
  const ecoConfig = ECO_PLANS[eco];

  useEffect(() => {
    checkAuth();
    loadPayPalScript();
  }, []);

  useEffect(() => {
    if (paypalLoaded && userId && paymentMethod === 'paypal') {
      renderPayPalButtons();
    }
  }, [selectedPlan, paypalLoaded, userId, paymentMethod]);

  // ===== PayPal SDK =====

  const loadPayPalScript = () => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    script.async = true;
    const timeout = setTimeout(() => {
      if (!window.paypal) {
        setPaypalError('PayPal demorou muito a carregar. Usa M-Pesa ou transferencia.');
      }
    }, PAYPAL_SDK_TIMEOUT);
    script.onload = () => {
      clearTimeout(timeout);
      if (window.paypal) setPaypalLoaded(true);
      else setPaypalError('PayPal nao inicializou correctamente.');
    };
    script.onerror = () => {
      clearTimeout(timeout);
      setPaypalError('Erro ao carregar PayPal. Usa M-Pesa ou transferencia.');
    };
    document.body.appendChild(script);
  };

  const renderPayPalButtons = () => {
    if (!paypalRef.current || !window.paypal) return;
    paypalRef.current.innerHTML = '';

    const plan = plans.find(p => p.id === selectedPlan) || plans[0];
    const amountValue = parseFloat(plan.price_usd).toFixed(2);

    try {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 50 },
        createOrder: (data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              description: `${theme.name.toUpperCase()} ${plan.name} - ${session?.user?.email || ''}`,
              amount: { currency_code: 'USD', value: amountValue }
            }],
            application_context: {
              brand_name: `Sete Ecos - ${theme.name.toUpperCase()}`,
              shipping_preference: 'NO_SHIPPING'
            }
          });
        },
        onApprove: async (data, actions) => {
          setSubmitting(true);
          try {
            const details = await actions.order.capture();
            if (details.status !== 'COMPLETED') {
              throw new Error(`Pagamento nao completado (status: ${details.status})`);
            }

            await registerEcoPendingPayment(eco, userId, {
              method: 'paypal',
              reference: details.id,
              amount: plan.price_usd,
              currency: 'USD',
              planId: selectedPlan
            });
            navigate(`/${eco}/dashboard`);
          } catch (error) {
            console.error(`PayPal ${theme.name} onApprove error:`, error);
            setMessage(`Erro ao processar: ${error.message}. Contacta-nos via WhatsApp se o valor foi cobrado.`);
          } finally {
            setSubmitting(false);
          }
        },
        onError: (err) => {
          console.error(`PayPal ${theme.name} button error:`, err);
          setMessage('Erro no PayPal. Tenta novamente ou usa M-Pesa/Transferencia.');
        },
        onCancel: () => setMessage('Pagamento cancelado. Podes tentar novamente.')
      }).render(paypalRef.current).catch((renderErr) => {
        console.error(`PayPal ${theme.name} render error:`, renderErr);
        setPaypalError('Erro ao inicializar PayPal. Usa M-Pesa ou transferencia.');
      });
    } catch (err) {
      console.error(`PayPal ${theme.name} Buttons() error:`, err);
      setPaypalError('Erro ao criar botoes PayPal.');
    }
  };

  // ===== Auth =====

  const checkAuth = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', currentSession.user.id)
          .maybeSingle();

        if (userData) {
          setUserId(userData.id);

          // Verificar se ja tem acesso
          const access = await checkEcoAccess(eco, userData.id);
          if (access.hasAccess) {
            navigate(`/${eco}/dashboard`);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticacao:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setAuthError(error.message.includes('Invalid') ? 'Email ou password incorrectos' : error.message);
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/${eco}/pagamento` }
        });
        if (error) {
          setAuthError(error.message);
          return;
        }
        if (data.user) {
          await supabase.from('users').upsert({
            auth_id: data.user.id,
            email: data.user.email,
            created_at: new Date().toISOString()
          }, { onConflict: 'auth_id' }).select('id');
        }
      }
      setShowAuthForm(false);
      checkAuth();
    } catch (err) {
      setAuthError('Erro ao autenticar. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Trial =====

  const handleStartTrial = async () => {
    if (!session) {
      setShowAuthForm(true);
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const result = await startEcoTrial(eco, userId);
      if (result) {
        navigate(`/${eco}/dashboard`);
      } else {
        setMessage('Erro ao iniciar trial. Tenta novamente.');
      }
    } catch (err) {
      setMessage('Erro ao processar. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Pagamento Manual =====

  const handleSubmitPayment = async () => {
    if (!session) {
      setShowAuthForm(true);
      return;
    }

    if (!paymentMethod) {
      setMessage('Selecciona um metodo de pagamento.');
      return;
    }

    if (paymentMethod !== 'paypal' && !paymentRef.trim()) {
      setMessage('Insere a referencia do pagamento.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const plan = plans.find(p => p.id === selectedPlan) || plans[0];

      const result = await registerEcoPendingPayment(eco, userId, {
        method: paymentMethod,
        reference: paymentRef,
        amount: plan.price_mzn,
        currency: 'MZN',
        planId: selectedPlan
      });

      if (result.success) {
        navigate(`/${eco}/dashboard`);
      } else {
        setMessage('Erro ao registar pagamento. Tenta novamente.');
      }
    } catch (err) {
      setMessage('Erro ao registar pagamento. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Loading =====

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${theme.colorDark} 0%, #1a1a1a 50%, ${theme.colorDark} 100%)` }}
      >
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: `${theme.color} transparent ${theme.color} ${theme.color}` }}
        ></div>
      </div>
    );
  }

  if (!ecoConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white/60">Eco nao encontrado: {eco}</p>
      </div>
    );
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan) || plans[0];

  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(135deg, ${theme.colorDark} 0%, #1a1a1a 50%, ${theme.colorDark} 100%)` }}
    >
      {/* Header */}
      <nav className="px-6 py-4 flex justify-between items-center border-b" style={{ borderColor: `${theme.color}33` }}>
        <Link to={`/${eco}`} className="flex items-center gap-3">
          <img
            src={getLogoPath(eco)}
            alt={theme.name.toUpperCase()}
            className="w-10 h-10"
          />
          <span
            className="text-xl font-bold"
            style={{ color: theme.color, fontFamily: 'var(--font-titulos)' }}
          >
            {theme.name.toUpperCase()}
          </span>
        </Link>
        {session && (
          <span className="text-sm" style={{ color: `${theme.color}80` }}>{session.user.email}</span>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Trial Banner */}
        <div
          className="mb-8 p-6 rounded-2xl border text-center"
          style={{
            background: `linear-gradient(135deg, ${theme.color}33, ${theme.color}1a)`,
            borderColor: `${theme.color}4d`
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">7 Dias Gratis</h2>
          <p className="mb-4" style={{ color: `${theme.color}cc` }}>
            Experimenta {theme.name.toUpperCase()} sem compromisso. Acesso completo a todas as funcionalidades.
          </p>
          <button
            onClick={handleStartTrial}
            disabled={submitting}
            className="px-8 py-3 text-white rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${theme.color}, ${theme.colorDark})`,
              boxShadow: `0 4px 15px ${theme.color}4d`
            }}
          >
            {submitting ? 'A processar...' : `Comecar Trial Gratuito`}
          </button>
        </div>

        {/* Separator */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2" style={{ color: `${theme.color}80` }}>
            <div className="w-16 h-px" style={{ background: `${theme.color}4d` }}></div>
            <span>ou escolhe um plano</span>
            <div className="w-16 h-px" style={{ background: `${theme.color}4d` }}></div>
          </div>
        </div>

        {/* Planos */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 rounded-2xl border transition-all text-left`}
              style={{
                background: selectedPlan === plan.id ? `${theme.color}33` : 'rgba(255,255,255,0.05)',
                borderColor: selectedPlan === plan.id ? theme.color : `${theme.color}33`
              }}
              aria-pressed={selectedPlan === plan.id}
            >
              {plan.id === 'semestral' && (
                <div className="mb-2">
                  <span
                    className="px-2 py-1 text-white text-xs font-bold rounded"
                    style={{ background: theme.color }}
                  >
                    POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold" style={{ color: theme.color }}>
                  {plan.price_mzn.toLocaleString()}
                </span>
                <span style={{ color: `${theme.color}b3` }}> MZN</span>
              </div>
              <div className="text-sm" style={{ color: `${theme.color}80` }}>
                ${plan.price_usd} USD
              </div>
              {plan.discount > 0 && (
                <div className="mt-2 text-sm" style={{ color: theme.color }}>
                  -{plan.discount}% desconto
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Metodos de Pagamento */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Metodo de Pagamento</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'mpesa', nome: 'M-Pesa', icone: '📱' },
              { id: 'transfer', nome: 'Transferencia', icone: '🏦' },
              { id: 'paypal', nome: 'PayPal / Cartao', icone: '💳' }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className="p-4 rounded-xl border transition-all"
                style={{
                  background: paymentMethod === method.id ? `${theme.color}33` : 'rgba(255,255,255,0.05)',
                  borderColor: paymentMethod === method.id ? theme.color : `${theme.color}33`
                }}
              >
                <div className="text-2xl mb-1">{method.icone}</div>
                <div className="text-white text-sm">{method.nome}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Instrucoes de Pagamento (M-Pesa / Transferencia) */}
        {paymentMethod && paymentMethod !== 'paypal' && (
          <div
            className="mb-8 p-6 rounded-2xl border"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${theme.color}33` }}
          >
            <h4 className="text-white font-bold mb-4">Instrucoes de Pagamento</h4>

            {paymentMethod === 'mpesa' && (
              <div className="space-y-2" style={{ color: `${theme.color}cc` }}>
                <p>1. Abre a app M-Pesa</p>
                <p>2. Selecciona "Transferir"</p>
                <p>3. Envia para: <span className="font-bold text-white">85 100 6473</span></p>
                <p>4. Valor: <span className="font-bold text-white">{selectedPlanData.price_mzn.toLocaleString()} MZN</span></p>
                <p>5. Copia o codigo de transaccao abaixo</p>
              </div>
            )}

            {paymentMethod === 'transfer' && (
              <div className="space-y-2" style={{ color: `${theme.color}cc` }}>
                <p>1. Transfere para a conta bancaria fornecida</p>
                <p>2. Valor: <span className="font-bold text-white">{selectedPlanData.price_mzn.toLocaleString()} MZN</span></p>
                <p>3. Guarda a referencia da transferencia</p>
                <p>4. Cola a referencia abaixo</p>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm mb-2" style={{ color: `${theme.color}cc` }}>
                Referencia/Codigo de Transaccao
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="Cole aqui o codigo..."
                className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none"
                style={{ borderColor: `${theme.color}4d`, border: `1px solid ${theme.color}4d` }}
              />
            </div>
          </div>
        )}

        {/* PayPal */}
        {paymentMethod === 'paypal' && (
          <div
            className="mb-8 p-6 rounded-2xl border"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${theme.color}33` }}
          >
            <p className="font-bold text-center mb-4" style={{ color: theme.color }}>
              ${selectedPlanData.price_usd} USD
            </p>
            <div ref={paypalRef} className="min-h-[60px] bg-white rounded-xl p-3">
              {paypalError ? (
                <div className="text-center py-3">
                  <p className="text-red-600 text-sm mb-3">{paypalError}</p>
                  <button
                    onClick={() => { setPaypalError(null); setPaymentMethod('mpesa'); }}
                    className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                    style={{ background: theme.color }}
                  >
                    Pagar via M-Pesa
                  </button>
                </div>
              ) : !paypalLoaded ? (
                <div className="text-center py-2">
                  <div
                    className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
                    style={{ borderColor: `${theme.color} transparent ${theme.color} ${theme.color}` }}
                  ></div>
                  <p className="text-gray-500 text-sm">A carregar PayPal...</p>
                </div>
              ) : null}
            </div>
            <p className="text-xs text-center mt-2" style={{ color: `${theme.color}80` }}>
              Paga com cartao de credito/debito ou conta PayPal
            </p>
          </div>
        )}

        {/* Mensagem de erro/sucesso */}
        {message && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-300 text-sm">{message}</p>
          </div>
        )}

        {/* Botao de submissao (nao para PayPal) */}
        {paymentMethod && paymentMethod !== 'paypal' && (
          <button
            onClick={handleSubmitPayment}
            disabled={submitting}
            className="w-full py-4 text-white rounded-xl font-semibold text-lg transition-all shadow-lg disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${theme.color}, ${theme.colorDark})`,
              boxShadow: `0 4px 15px ${theme.color}4d`
            }}
          >
            {submitting ? 'A processar...' : 'Confirmar Pagamento'}
          </button>
        )}

        {/* O que inclui */}
        {features.length > 0 && (
          <div
            className="mt-10 p-6 rounded-2xl border"
            style={{ background: `${theme.color}0d`, borderColor: `${theme.color}33` }}
          >
            <h3
              className="text-lg font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              O que inclui o {theme.name.toUpperCase()}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: theme.color }}
                  ></div>
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs" style={{ color: `${theme.color}80` }}>
              + Acesso ao dashboard {g('personalizado', 'personalizada')} e acompanhamento da coach
            </p>
          </div>
        )}
      </div>

      {/* Modal de Auth */}
      {showAuthForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl p-6 max-w-md w-full border relative"
            style={{ background: theme.colorDark, borderColor: `${theme.color}4d` }}
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {isLogin ? 'Entrar' : 'Criar conta'}
            </h3>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none"
                  style={{ border: `1px solid ${theme.color}4d` }}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none"
                  style={{ border: `1px solid ${theme.color}4d` }}
                  required
                  minLength={6}
                />
              </div>

              {authError && (
                <p className="text-red-400 text-sm">{authError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-white rounded-xl font-semibold disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.colorDark})` }}
              >
                {submitting ? 'A processar...' : (isLogin ? 'Entrar' : 'Criar conta')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm hover:opacity-80 transition-opacity"
                style={{ color: theme.color }}
              >
                {isLogin ? 'Nao tens conta? Criar' : 'Ja tens conta? Entrar'}
              </button>
            </div>

            <button
              onClick={() => setShowAuthForm(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
