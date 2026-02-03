import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  SUBSCRIPTION_CONFIG,
  SUBSCRIPTION_STATUS,
  registerPendingPayment,
  useInviteCode,
  checkVitalisAccess
} from '../../lib/subscriptions';

/**
 * VITALIS - Pagina de Pagamento
 *
 * Suporta:
 * - PayPal.me (manual confirmation)
 * - M-Pesa (quando disponivel)
 * - Codigos de convite
 */

// Configuracao PayPal - ALTERAR PARA O TEU USERNAME
const PAYPAL_USERNAME = 'vivsaraiva'; // Alterar para o teu PayPal.me username
const PAYPAL_CURRENCY = 'USD';

const PagamentoVitalis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [accessStatus, setAccessStatus] = useState(null);

  // Estados do formulario
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

        // Se ja tem acesso, redirecionar
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

  // Gerar link PayPal.me
  const getPayPalLink = () => {
    const amount = SUBSCRIPTION_CONFIG.PRICE_USD;
    const description = encodeURIComponent(`Vitalis - ${userName || userEmail}`);
    return `https://paypal.me/${PAYPAL_USERNAME}/${amount}${PAYPAL_CURRENCY}?description=${description}`;
  };

  // Abrir PayPal e registar pagamento pendente
  const handlePayPalPayment = async () => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Registar pagamento pendente
      await registerPendingPayment(userId, {
        method: 'paypal',
        reference: `PayPal-${Date.now()}`,
        amount: SUBSCRIPTION_CONFIG.PRICE_USD,
        currency: 'USD'
      });

      // Abrir PayPal
      window.open(getPayPalLink(), '_blank');

      setMessage({
        type: 'info',
        text: 'PayPal aberto! Apos o pagamento, vamos confirmar e ativar o teu acesso em ate 24h.'
      });

      setSelectedMethod('paypal_pending');
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao processar. Tenta novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmar referencia de pagamento (para M-Pesa ou transferencia)
  const handleManualPaymentSubmit = async () => {
    if (!paymentRef.trim()) {
      setMessage({ type: 'error', text: 'Por favor insere a referencia do pagamento' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await registerPendingPayment(userId, {
        method: selectedMethod,
        reference: paymentRef.trim(),
        amount: selectedMethod === 'mpesa' ? SUBSCRIPTION_CONFIG.PRICE_MZN : SUBSCRIPTION_CONFIG.PRICE_USD,
        currency: selectedMethod === 'mpesa' ? 'MZN' : 'USD'
      });

      setMessage({
        type: 'success',
        text: 'Pagamento registado! Vamos confirmar e ativar o teu acesso em ate 24h.'
      });

      // Limpar form
      setPaymentRef('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao registar pagamento. Tenta novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Usar codigo de convite
  const handleInviteCode = async () => {
    if (!inviteCode.trim()) {
      setMessage({ type: 'error', text: 'Por favor insere um codigo' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await useInviteCode(userId, inviteCode.trim());

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.type === 'tester'
            ? 'Codigo de tester ativado! Tens acesso gratuito.'
            : 'Codigo ativado! Tens acesso trial.'
        });

        // Redirecionar apos 2 segundos
        setTimeout(() => navigate('/vitalis/dashboard'), 2000);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao processar codigo. Tenta novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F2ED] to-[#E8E4DC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7C8B6F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B5C4C]">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F2ED] via-[#E8E4DC] to-[#C5D1BC]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/logos/VITALIS_LOGO_V3.png" alt="Vitalis" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                VITALIS
              </h1>
              <p className="text-white/80 text-sm">Ativar Subscricao</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Status atual */}
        {accessStatus?.status === SUBSCRIPTION_STATUS.PENDING && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-medium text-yellow-800">Pagamento Pendente</p>
                <p className="text-sm text-yellow-700">Estamos a verificar o teu pagamento. Sera confirmado em breve!</p>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem */}
        {message.text && (
          <div className={`rounded-2xl p-4 mb-6 ${
            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Preco */}
          <div className="bg-gradient-to-r from-[#7C8B6F] to-[#9CAF88] p-6 text-center text-white">
            <p className="text-sm opacity-80 mb-2">Subscricao Mensal</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold">${SUBSCRIPTION_CONFIG.PRICE_USD}</span>
              <span className="text-lg opacity-80">USD/mes</span>
            </div>
            <p className="text-sm opacity-80 mt-2">ou {SUBSCRIPTION_CONFIG.PRICE_MZN} MZN</p>
          </div>

          {/* Beneficios */}
          <div className="p-6 border-b border-[#E8E2D9]">
            <h3 className="font-bold text-[#4A4035] mb-4">O que inclui:</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '📋', text: 'Plano personalizado' },
                { icon: '💬', text: 'Coach IA 24/7' },
                { icon: '📊', text: 'Tracking completo' },
                { icon: '🍳', text: '150+ receitas' },
                { icon: '📈', text: 'Graficos e tendencias' },
                { icon: '🎯', text: 'Desafios semanais' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#6B5C4C]">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metodos de pagamento */}
          <div className="p-6">
            <h3 className="font-bold text-[#4A4035] mb-4">Escolhe como pagar:</h3>

            <div className="space-y-3">
              {/* PayPal */}
              <button
                onClick={() => setSelectedMethod('paypal')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedMethod === 'paypal' || selectedMethod === 'paypal_pending'
                    ? 'border-[#7C8B6F] bg-[#7C8B6F]/10'
                    : 'border-[#E8E2D9] hover:border-[#7C8B6F]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#003087] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Pay</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A4035]">PayPal</p>
                    <p className="text-sm text-[#6B5C4C]">${SUBSCRIPTION_CONFIG.PRICE_USD} USD</p>
                  </div>
                  {(selectedMethod === 'paypal' || selectedMethod === 'paypal_pending') && (
                    <span className="ml-auto text-[#7C8B6F]">✓</span>
                  )}
                </div>
              </button>

              {selectedMethod === 'paypal' && (
                <div className="ml-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800 mb-3">
                    Clica no botao abaixo para abrir o PayPal. Apos o pagamento, vamos confirmar manualmente.
                  </p>
                  <button
                    onClick={handlePayPalPayment}
                    disabled={submitting}
                    className="w-full py-3 bg-[#003087] hover:bg-[#001f5c] text-white rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    {submitting ? 'A processar...' : 'Pagar com PayPal'}
                  </button>
                </div>
              )}

              {/* M-Pesa */}
              <button
                onClick={() => setSelectedMethod('mpesa')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedMethod === 'mpesa'
                    ? 'border-[#7C8B6F] bg-[#7C8B6F]/10'
                    : 'border-[#E8E2D9] hover:border-[#7C8B6F]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A4035]">M-Pesa</p>
                    <p className="text-sm text-[#6B5C4C]">{SUBSCRIPTION_CONFIG.PRICE_MZN} MZN</p>
                  </div>
                  {selectedMethod === 'mpesa' && (
                    <span className="ml-auto text-[#7C8B6F]">✓</span>
                  )}
                </div>
              </button>

              {selectedMethod === 'mpesa' && (
                <div className="ml-4 p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-800 mb-3">
                    Envia {SUBSCRIPTION_CONFIG.PRICE_MZN} MZN para o numero:
                  </p>
                  <div className="bg-white p-3 rounded-lg text-center mb-3">
                    <p className="text-2xl font-bold text-[#4A4035]">84 XXX XXXX</p>
                    <p className="text-sm text-[#6B5C4C]">Nome: Viviane Saraiva</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm text-red-800">ID da transacao M-Pesa:</label>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="Ex: MP12345678"
                      className="w-full px-4 py-2 border border-red-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                    <button
                      onClick={handleManualPaymentSubmit}
                      disabled={submitting}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                      {submitting ? 'A enviar...' : 'Confirmar Pagamento'}
                    </button>
                  </div>
                </div>
              )}

              {/* Transferencia */}
              <button
                onClick={() => setSelectedMethod('transfer')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedMethod === 'transfer'
                    ? 'border-[#7C8B6F] bg-[#7C8B6F]/10'
                    : 'border-[#E8E2D9] hover:border-[#7C8B6F]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🏦</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A4035]">Transferencia Bancaria</p>
                    <p className="text-sm text-[#6B5C4C]">Contactar para dados</p>
                  </div>
                </div>
              </button>

              {selectedMethod === 'transfer' && (
                <div className="ml-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-700 mb-3">
                    Contacta-nos para obter os dados bancarios:
                  </p>
                  <a
                    href="https://wa.me/258XXXXXXXXX?text=Ola! Quero ativar o Vitalis por transferencia bancaria."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-center transition-all"
                  >
                    💬 Contactar via WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Codigo de convite */}
          <div className="p-6 border-t border-[#E8E2D9]">
            <h3 className="font-bold text-[#4A4035] mb-4">Tens um codigo de convite?</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="VITALIS-XXXXX"
                className="flex-1 px-4 py-3 border border-[#E8E2D9] rounded-xl focus:border-[#7C8B6F] focus:outline-none uppercase"
              />
              <button
                onClick={handleInviteCode}
                disabled={submitting}
                className="px-6 py-3 bg-[#7C8B6F] hover:bg-[#6B7A5D] text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Ativar
              </button>
            </div>
          </div>
        </div>

        {/* Garantia */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B5C4C]">
            💚 Satisfacao garantida ou devolucao em 7 dias
          </p>
          <p className="text-xs text-[#A89F91] mt-2">
            Duvidas? Contacta-nos via WhatsApp ou Instagram
          </p>
        </div>

        {/* Voltar */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-[#7C8B6F] hover:text-[#6B7A5D] transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </main>
    </div>
  );
};

export default PagamentoVitalis;
