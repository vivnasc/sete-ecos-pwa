import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  AUREA_PLANS,
  AUREA_CONFIG,
  startAureaTrial,
  registerAureaPendingPayment
} from '../../lib/aurea/subscriptions';

/**
 * ÁUREA - Página de Pagamento
 * Inclui opção de trial de 7 dias
 */

export default function PagamentoAurea() {
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Garantir que o utilizador existe na tabela users
        await supabase.from('users').upsert({
          auth_id: session.user.id,
          email: session.user.email,
          created_at: new Date().toISOString()
        }, { onConflict: 'auth_id' });

        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', session.user.id)
          .maybeSingle();

        if (userData) {
          setUserId(userData.id);

          // Verificar se já tem acesso
          const { data: aureaClient } = await supabase
            .from('aurea_clients')
            .select('subscription_status, onboarding_complete')
            .eq('user_id', userData.id)
            .maybeSingle();

          if (aureaClient?.subscription_status === 'active' ||
            aureaClient?.subscription_status === 'trial' ||
            aureaClient?.subscription_status === 'tester') {
            if (aureaClient?.onboarding_complete) {
              navigate('/aurea/dashboard');
            } else {
              navigate('/aurea/onboarding');
            }
            return;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
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
        // Garantir registo na tabela users após login
        const { data: loginSession } = await supabase.auth.getSession();
        if (loginSession?.session?.user) {
          await supabase.from('users').upsert({
            auth_id: loginSession.session.user.id,
            email: loginSession.session.user.email,
            created_at: new Date().toISOString()
          }, { onConflict: 'auth_id' });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/aurea/pagamento` }
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
          }, { onConflict: 'auth_id' });
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

  const handleStartTrial = async () => {
    if (!session) {
      setShowAuthForm(true);
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const result = await startAureaTrial(userId);
      if (result.success) {
        navigate('/aurea/onboarding');
      } else {
        setMessage(result.error || 'Erro ao iniciar trial. Tenta novamente.');
      }
    } catch (err) {
      setMessage('Erro ao processar. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!session) {
      setShowAuthForm(true);
      return;
    }

    if (!paymentMethod) {
      setMessage('Selecciona um método de pagamento.');
      return;
    }

    if (paymentMethod !== 'paypal' && !paymentRef.trim()) {
      setMessage('Insere a referência do pagamento.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const plan = AUREA_PLANS[selectedPlan.toUpperCase()];

      await registerAureaPendingPayment(userId, {
        method: paymentMethod,
        reference: paymentRef,
        amount: plan.price_mzn,
        currency: 'MZN',
        planId: selectedPlan
      });

      navigate('/aurea/onboarding');
    } catch (err) {
      setMessage('Erro ao registar pagamento. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const plans = Object.values(AUREA_PLANS);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D2A24 0%, #3D3830 50%, #2D2A24 100%)' }}>
      {/* Header */}
      <nav className="px-6 py-4 flex justify-between items-center border-b border-amber-500/20">
        <Link to="/aurea" className="flex items-center gap-3">
          <img src="/logos/AUREA_LOGO_V3.png" alt="ÁUREA" className="w-10 h-10" />
          <span className="text-xl font-bold text-amber-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            ÁUREA
          </span>
        </Link>
        {session && (
          <span className="text-amber-200/50 text-sm">{session.user.email}</span>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Trial Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-600/20 to-amber-500/20 rounded-2xl border border-amber-500/30 text-center">
          <div className="text-4xl mb-3">✨</div>
          <h2 className="text-2xl font-bold text-amber-100 mb-2">7 Dias Grátis</h2>
          <p className="text-amber-200/70 mb-4">
            Experimenta ÁUREA sem compromisso. Acesso completo a todas as funcionalidades.
          </p>
          <button
            onClick={handleStartTrial}
            disabled={submitting}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50"
          >
            {submitting ? 'A processar...' : 'Começar Trial Gratuito'}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-amber-200/50">
            <div className="w-16 h-px bg-amber-500/30"></div>
            <span>ou escolhe um plano</span>
            <div className="w-16 h-px bg-amber-500/30"></div>
          </div>
        </div>

        {/* Planos */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 rounded-2xl border transition-all text-left ${selectedPlan === plan.id
                ? 'bg-amber-500/20 border-amber-400'
                : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                }`}
            >
              {plan.id === 'semestral' && (
                <div className="mb-2">
                  <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded">
                    POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-lg font-bold text-amber-100">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-amber-200">{plan.price_mzn.toLocaleString()}</span>
                <span className="text-amber-200/70"> MZN</span>
              </div>
              <div className="text-amber-200/50 text-sm">${plan.price_usd} USD</div>
              {plan.discount > 0 && (
                <div className="mt-2 text-amber-400 text-sm">-{plan.discount}% desconto</div>
              )}
            </button>
          ))}
        </div>

        {/* Métodos de Pagamento */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-amber-100 mb-4">Método de Pagamento</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'mpesa', nome: 'M-Pesa', icone: '📱' },
              { id: 'emola', nome: 'e-Mola', icone: '💳' },
              { id: 'transfer', nome: 'Transferência', icone: '🏦' },
              { id: 'paypal', nome: 'PayPal', icone: '💰' }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-4 rounded-xl border transition-all ${paymentMethod === method.id
                  ? 'bg-amber-500/20 border-amber-400'
                  : 'bg-white/5 border-amber-500/20 hover:border-amber-500/40'
                  }`}
              >
                <div className="text-2xl mb-1">{method.icone}</div>
                <div className="text-amber-100 text-sm">{method.nome}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Instruções de Pagamento */}
        {paymentMethod && paymentMethod !== 'paypal' && (
          <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-amber-500/20">
            <h4 className="text-amber-100 font-bold mb-4">Instruções de Pagamento</h4>

            {paymentMethod === 'mpesa' && (
              <div className="text-amber-200/80 space-y-2">
                <p>1. Abre a app M-Pesa</p>
                <p>2. Selecciona "Transferir"</p>
                <p>3. Envia para: <span className="text-amber-300 font-bold">84 XXX XXXX</span></p>
                <p>4. Valor: <span className="text-amber-300 font-bold">{AUREA_PLANS[selectedPlan.toUpperCase()].price_mzn.toLocaleString()} MZN</span></p>
                <p>5. Copia o código de transacção abaixo</p>
              </div>
            )}

            {paymentMethod === 'emola' && (
              <div className="text-amber-200/80 space-y-2">
                <p>1. Abre a app e-Mola</p>
                <p>2. Selecciona "Enviar Dinheiro"</p>
                <p>3. Envia para: <span className="text-amber-300 font-bold">86 XXX XXXX</span></p>
                <p>4. Valor: <span className="text-amber-300 font-bold">{AUREA_PLANS[selectedPlan.toUpperCase()].price_mzn.toLocaleString()} MZN</span></p>
                <p>5. Copia o código de transacção abaixo</p>
              </div>
            )}

            {paymentMethod === 'transfer' && (
              <div className="text-amber-200/80 space-y-2">
                <p>Banco: <span className="text-amber-300 font-bold">BCI</span></p>
                <p>NIB: <span className="text-amber-300 font-bold">0008 XXXX XXXX XXXX XXXX X</span></p>
                <p>Titular: <span className="text-amber-300 font-bold">Vivianne Nascimento</span></p>
                <p>Valor: <span className="text-amber-300 font-bold">{AUREA_PLANS[selectedPlan.toUpperCase()].price_mzn.toLocaleString()} MZN</span></p>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-amber-200/80 text-sm mb-2">
                Referência/Código de Transacção
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="Cole aqui o código..."
                className="w-full px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* PayPal */}
        {paymentMethod === 'paypal' && (
          <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-amber-500/20 text-center">
            <p className="text-amber-200/80 mb-4">
              Serás redireccionada para o PayPal para completar o pagamento.
            </p>
            <p className="text-amber-300 font-bold">
              ${AUREA_PLANS[selectedPlan.toUpperCase()].price_usd} USD
            </p>
          </div>
        )}

        {/* Mensagem de erro/sucesso */}
        {message && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
            <p className="text-red-300 text-sm">{message}</p>
          </div>
        )}

        {/* Botão de submissão */}
        {paymentMethod && (
          <button
            onClick={handleSubmitPayment}
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50"
          >
            {submitting ? 'A processar...' : 'Confirmar Pagamento'}
          </button>
        )}
      </div>

      {/* Modal de Auth */}
      {showAuthForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2D2A24] rounded-2xl p-6 max-w-md w-full border border-amber-500/30">
            <h3 className="text-xl font-bold text-amber-100 mb-4">
              {isLogin ? 'Entrar' : 'Criar conta'}
            </h3>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-300/40 focus:outline-none focus:border-amber-400"
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
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {submitting ? 'A processar...' : (isLogin ? 'Entrar' : 'Criar conta')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-amber-300 text-sm hover:text-amber-200"
              >
                {isLogin ? 'Não tens conta? Criar' : 'Já tens conta? Entrar'}
              </button>
            </div>

            <button
              onClick={() => setShowAuthForm(false)}
              className="absolute top-4 right-4 text-amber-200/50 hover:text-amber-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
