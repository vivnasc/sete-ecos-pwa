import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  SUBSCRIPTION_CONFIG,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  registerPendingPayment,
  useInviteCode,
  checkVitalisAccess
} from '../../lib/subscriptions';

/**
 * VITALIS - Pagina de Pagamento / Paywall
 *
 * Precos (conforme planeado):
 * - Mensal: 2,500 MZN / $38
 * - Semestral: 12,500 MZN / $190 (17% desconto)
 * - Anual: 21,000 MZN / $320 (30% desconto)
 *
 * Metodos de pagamento:
 * - PayPal (internacional)
 * - M-Pesa (Mocambique) - quando disponivel
 * - Transferencia bancaria
 * - Codigos de convite
 */

// PayPal.me username - para pagamentos manuais
const PAYPAL_USERNAME = 'vivsaraiva';

const PagamentoVitalis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [accessStatus, setAccessStatus] = useState(null);

  // Selecao de plano
  const [selectedPlan, setSelectedPlan] = useState('MONTHLY');
  const [currency, setCurrency] = useState('MZN'); // MZN ou USD

  // Estados do formulario
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/vitalis/login');
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

        // Verificar acesso atual
        const access = await checkVitalisAccess(userData.id);
        setAccessStatus(access);

        // Se ja tem acesso ativo, redirecionar
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

  // Obter plano selecionado
  const getCurrentPlan = () => SUBSCRIPTION_PLANS[selectedPlan];

  // Obter preco formatado
  const getFormattedPrice = (plan) => {
    if (currency === 'USD') {
      return `$${plan.price_usd}`;
    }
    return `${plan.price_mzn.toLocaleString()} MZN`;
  };

  // Obter preco por mes
  const getPricePerMonth = (plan) => {
    const monthlyPrice = currency === 'USD'
      ? plan.price_usd / plan.duration
      : plan.price_mzn / plan.duration;
    return currency === 'USD'
      ? `$${monthlyPrice.toFixed(0)}/mes`
      : `${Math.round(monthlyPrice).toLocaleString()} MZN/mes`;
  };

  // Gerar link PayPal.me
  const getPayPalLink = () => {
    const plan = getCurrentPlan();
    const amount = plan.price_usd;
    const description = encodeURIComponent(`Vitalis ${plan.name} - ${userName || userEmail}`);
    return `https://paypal.me/${PAYPAL_USERNAME}/${amount}USD?description=${description}`;
  };

  // Processar pagamento PayPal
  const handlePayPalPayment = async () => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const plan = getCurrentPlan();

      // Registar pagamento pendente
      await registerPendingPayment(userId, {
        method: 'paypal',
        reference: `PayPal-${Date.now()}`,
        amount: plan.price_usd,
        currency: 'USD',
        planId: plan.id
      });

      // Abrir PayPal.me numa nova aba
      window.open(getPayPalLink(), '_blank');

      setShowPaymentInstructions(true);
      setMessage({
        type: 'info',
        text: `Completa o pagamento de $${plan.price_usd} no PayPal. Apos o pagamento, a tua subscricao sera ativada em ate 24 horas.`
      });
    } catch (error) {
      console.error('Erro:', error);
      setMessage({ type: 'error', text: 'Erro ao processar. Tenta novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Processar M-Pesa (quando disponivel)
  const handleMPesaPayment = async () => {
    setMessage({
      type: 'info',
      text: 'M-Pesa estara disponivel em breve! Por agora, usa PayPal ou transferencia bancaria.'
    });
  };

  // Processar transferencia bancaria
  const handleBankTransfer = async () => {
    if (!paymentRef.trim()) {
      setMessage({ type: 'error', text: 'Insere a referencia do comprovativo de transferencia.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const plan = getCurrentPlan();

      await registerPendingPayment(userId, {
        method: 'transfer',
        reference: paymentRef,
        amount: plan.price_mzn,
        currency: 'MZN',
        planId: plan.id
      });

      setMessage({
        type: 'success',
        text: 'Pagamento registado! A tua subscricao sera ativada apos confirmacao (ate 24 horas).'
      });
    } catch (error) {
      console.error('Erro:', error);
      setMessage({ type: 'error', text: 'Erro ao registar pagamento. Tenta novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Usar codigo de convite
  const handleInviteCode = async () => {
    if (!inviteCode.trim()) {
      setMessage({ type: 'error', text: 'Insere o codigo de convite.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await useInviteCode(userId, inviteCode);

      if (result.success) {
        setMessage({ type: 'success', text: 'Codigo aplicado com sucesso! A redirecionar...' });
        setTimeout(() => navigate('/vitalis/dashboard'), 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Codigo invalido.' });
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage({ type: 'error', text: 'Erro ao verificar codigo.' });
    } finally {
      setSubmitting(false);
    }
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

  // Se ja pagou e esta pendente
  if (accessStatus?.status === SUBSCRIPTION_STATUS.PENDING) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center border border-emerald-500/20">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Pagamento em Verificacao</h1>
          <p className="text-emerald-200 mb-6">
            O teu pagamento esta a ser verificado. Recebes acesso assim que for confirmado (ate 24 horas).
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 rounded-xl font-medium transition-all"
          >
            Voltar ao Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Vitalis</h1>
          <p className="text-emerald-200">O teu plano nutricional personalizado</p>
        </div>

        {/* Toggle Moeda */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setCurrency('MZN')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              currency === 'MZN'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 text-emerald-300 hover:bg-white/20'
            }`}
          >
            MZN (Meticais)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              currency === 'USD'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/10 text-emerald-300 hover:bg-white/20'
            }`}
          >
            USD (Dolares)
          </button>
        </div>

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <button
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`relative p-5 rounded-2xl border-2 transition-all text-left ${
                selectedPlan === key
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              {/* Badge de desconto */}
              {plan.discount > 0 && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  -{plan.discount}%
                </div>
              )}

              {/* Badge popular */}
              {key === 'SEMESTRAL' && (
                <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Mais Popular
                </div>
              )}

              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-3xl font-bold text-emerald-400 mb-1">
                {getFormattedPrice(plan)}
              </p>
              <p className="text-sm text-emerald-300/70">{getPricePerMonth(plan)}</p>

              {plan.savings_mzn > 0 && (
                <p className="text-xs text-green-400 mt-2">
                  Poupas {currency === 'USD' ? `$${plan.savings_usd}` : `${plan.savings_mzn.toLocaleString()} MZN`}
                </p>
              )}

              {/* Checkmark */}
              {selectedPlan === key && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* O que esta incluido */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">O que esta incluido:</h3>
          <ul className="space-y-3">
            {[
              'Plano nutricional 100% personalizado',
              'Calculo de macros baseado nos teus objetivos',
              'Sistema de fases (inducao, transicao, manutencao)',
              'Receitas saudaveis e praticas',
              'Tracking de refeicoes, agua e progresso',
              'Relatorios semanais detalhados',
              'Suporte via comunidade WhatsApp'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-emerald-200">
                <span className="w-5 h-5 bg-emerald-500/30 rounded-full flex items-center justify-center text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Metodos de Pagamento */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Metodo de Pagamento</h3>

          <div className="space-y-3">
            {/* PayPal */}
            <button
              onClick={() => setSelectedMethod('paypal')}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                selectedMethod === 'paypal'
                  ? 'bg-blue-500/20 border-blue-400'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-white">PayPal</p>
                <p className="text-sm text-emerald-300/70">Cartao de credito / debito</p>
              </div>
              <span className="text-emerald-400 font-bold">${getCurrentPlan().price_usd}</span>
            </button>

            {/* M-Pesa */}
            <button
              onClick={() => setSelectedMethod('mpesa')}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 opacity-50 cursor-not-allowed ${
                selectedMethod === 'mpesa'
                  ? 'bg-orange-500/20 border-orange-400'
                  : 'bg-white/5 border-white/10'
              }`}
              disabled
            >
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-white">M-Pesa</p>
                <p className="text-sm text-emerald-300/70">Em breve disponivel</p>
              </div>
              <span className="text-xs bg-orange-500/30 text-orange-300 px-2 py-1 rounded-full">Em Breve</span>
            </button>

            {/* Transferencia Bancaria */}
            <button
              onClick={() => setSelectedMethod('transfer')}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                selectedMethod === 'transfer'
                  ? 'bg-purple-500/20 border-purple-400'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏦</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-white">Transferencia Bancaria</p>
                <p className="text-sm text-emerald-300/70">Confirmacao manual em 24h</p>
              </div>
              <span className="text-emerald-400 font-bold">{getCurrentPlan().price_mzn.toLocaleString()} MZN</span>
            </button>

            {/* Codigo de Convite */}
            <button
              onClick={() => setSelectedMethod('invite')}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                selectedMethod === 'invite'
                  ? 'bg-emerald-500/20 border-emerald-400'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎟️</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-white">Codigo de Convite</p>
                <p className="text-sm text-emerald-300/70">Tens um codigo especial?</p>
              </div>
            </button>
          </div>
        </div>

        {/* Area de Acao baseada no metodo selecionado */}
        {selectedMethod && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 mb-8">
            {/* PayPal */}
            {selectedMethod === 'paypal' && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 p-4 rounded-xl">
                  <h4 className="font-bold text-white mb-2">Pagamento via PayPal</h4>
                  <p className="text-sm text-emerald-200 mb-3">
                    Seras redirecionado para o PayPal para completar o pagamento de <strong>${getCurrentPlan().price_usd}</strong> ({getCurrentPlan().name}).
                  </p>
                  <p className="text-xs text-emerald-300/70">
                    Apos o pagamento, a tua subscricao sera ativada em ate 24 horas.
                  </p>
                </div>
                <button
                  onClick={handlePayPalPayment}
                  disabled={submitting}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      A processar...
                    </>
                  ) : (
                    <>
                      💳 Pagar com PayPal - ${getCurrentPlan().price_usd}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* M-Pesa */}
            {selectedMethod === 'mpesa' && (
              <div className="text-center py-4">
                <span className="text-4xl mb-4 block">🚧</span>
                <p className="text-emerald-200">M-Pesa estara disponivel em breve!</p>
                <p className="text-sm text-emerald-300/70 mt-2">Por agora, usa PayPal ou transferencia bancaria.</p>
              </div>
            )}

            {/* Transferencia */}
            {selectedMethod === 'transfer' && (
              <div className="space-y-4">
                <div className="bg-purple-500/10 p-4 rounded-xl">
                  <h4 className="font-bold text-white mb-2">Dados Bancarios</h4>
                  <div className="space-y-2 text-sm text-emerald-200">
                    <p><span className="text-emerald-400">Banco:</span> [Nome do Banco]</p>
                    <p><span className="text-emerald-400">NIB:</span> [Numero NIB]</p>
                    <p><span className="text-emerald-400">Nome:</span> Vivianne Saraiva</p>
                    <p><span className="text-emerald-400">Valor:</span> <strong>{getCurrentPlan().price_mzn.toLocaleString()} MZN</strong></p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-emerald-300 mb-2">
                    Referencia / Numero do Comprovativo
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="Ex: TRF-123456789"
                    className="w-full p-4 bg-white/10 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  onClick={handleBankTransfer}
                  disabled={submitting || !paymentRef.trim()}
                  className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl font-bold text-lg transition-all"
                >
                  {submitting ? 'A registar...' : 'Confirmar Transferencia'}
                </button>
              </div>
            )}

            {/* Codigo Convite */}
            {selectedMethod === 'invite' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-emerald-300 mb-2">
                    Codigo de Convite
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="VITALIS-XXXXX"
                    className="w-full p-4 bg-white/10 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400 font-mono text-center text-lg tracking-wider"
                  />
                </div>

                <button
                  onClick={handleInviteCode}
                  disabled={submitting || !inviteCode.trim()}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold text-lg transition-all"
                >
                  {submitting ? 'A verificar...' : 'Aplicar Codigo'}
                </button>
              </div>
            )}
          </div>
        )}

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

        {/* Instrucoes pos-pagamento PayPal */}
        {showPaymentInstructions && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8">
            <h4 className="font-bold text-white mb-3">Proximos passos:</h4>
            <ol className="space-y-2 text-sm text-emerald-200">
              <li>1. Completa o pagamento no PayPal (nova aba)</li>
              <li>2. Guarda o comprovativo/referencia</li>
              <li>3. A tua subscricao sera ativada em ate 24 horas</li>
              <li>4. Recebes notificacao quando estiver ativa</li>
            </ol>
            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 py-3 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 rounded-xl font-medium transition-all"
            >
              Voltar ao Inicio
            </button>
          </div>
        )}

        {/* Garantia */}
        <div className="text-center text-emerald-300/60 text-sm">
          <p>🔒 Pagamento seguro | Suporte via WhatsApp</p>
          <p className="mt-1">Duvidas? Contacta-nos antes de subscrever</p>
        </div>
      </div>
    </div>
  );
};

export default PagamentoVitalis;
