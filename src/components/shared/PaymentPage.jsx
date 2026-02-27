import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import { getPaymentConfig, startTrial, registerPendingPayment, confirmPayPalPayment, getMpesaWhatsappLink } from '../../lib/shared/paymentFlow'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'
import ModuleHeader from './ModuleHeader'

const PAYPAL_CLIENT_ID = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_PAYPAL_CLIENT_ID || 'sb') : 'sb'
const PAYPAL_SDK_TIMEOUT = 15000

/**
 * SETE ECOS — Página de Pagamento Genérica
 *
 * Props:
 * - eco: string (serena, ignis, ventis, ecoa, imago, aurora)
 * - features: Array de { icon, text } para a lista de features
 * - testimonial: { text, author } (opcional)
 */

export default function PaymentPage({ eco, features = [], testimonial = null }) {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [userId, setUserId] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [paymentMethod, setPaymentMethod] = useState(null) // 'mpesa' | 'paypal'
  const [mpesaRef, setMpesaRef] = useState('')
  const [loading, setLoading] = useState(false)
  const [trialLoading, setTrialLoading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error', text }
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [paypalError, setPaypalError] = useState(null)
  const paypalRef = useRef(null)

  const config = getPaymentConfig(eco)
  const theme = getEcoTheme(eco)

  useEffect(() => {
    async function loadUser() {
      if (!session) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()
      if (userData) setUserId(userData.id)
    }
    loadUser()
    loadPayPalScript()
  }, [session])

  useEffect(() => {
    if (paypalLoaded && userId && paymentMethod === 'paypal') {
      renderPayPalButtons()
    }
  }, [selectedPlan, paypalLoaded, userId, paymentMethod])

  // ===== PayPal SDK =====

  function loadPayPalScript() {
    if (window.paypal) {
      setPaypalLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`
    script.async = true
    const timeout = setTimeout(() => {
      if (!window.paypal) {
        setPaypalError('PayPal demorou muito a carregar. Usa M-Pesa.')
      }
    }, PAYPAL_SDK_TIMEOUT)
    script.onload = () => {
      clearTimeout(timeout)
      if (window.paypal) setPaypalLoaded(true)
      else setPaypalError('PayPal nao inicializou correctamente.')
    }
    script.onerror = () => {
      clearTimeout(timeout)
      setPaypalError('Erro ao carregar PayPal. Usa M-Pesa.')
    }
    document.body.appendChild(script)
  }

  function renderPayPalButtons() {
    if (!paypalRef.current || !window.paypal) return
    paypalRef.current.innerHTML = ''

    const plan = config.plans.find(p => p.id === selectedPlan) || config.plans[0]
    const amountValue = parseFloat(plan.price_usd).toFixed(2)

    try {
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 50 },
        createOrder: (data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              description: `${config.name.toUpperCase()} ${plan.name} - ${session?.user?.email || ''}`,
              amount: { currency_code: 'USD', value: amountValue }
            }],
            application_context: {
              brand_name: `Sete Ecos - ${config.name.toUpperCase()}`,
              shipping_preference: 'NO_SHIPPING'
            }
          })
        },
        onApprove: async (data, actions) => {
          setLoading(true)
          try {
            const details = await actions.order.capture()
            if (details.status !== 'COMPLETED') {
              throw new Error(`Pagamento nao completado (status: ${details.status})`)
            }
            const result = await confirmPayPalPayment(eco, userId, {
              planKey: selectedPlan,
              orderId: details.id,
              payerEmail: details.payer?.email_address
            })
            if (result.success) {
              setMessage({ type: 'success', text: `Pagamento confirmado! ${g('Bem-vindo', 'Bem-vinda')} ao ${config.name}.` })
              setTimeout(() => navigate(`/${eco}/dashboard`), 2000)
            } else {
              setMessage({ type: 'error', text: 'Erro ao processar. Contacta-nos via WhatsApp.' })
            }
          } catch (error) {
            console.error(`PayPal ${config.name} onApprove error:`, error)
            setMessage({ type: 'error', text: `Erro ao processar: ${error.message}. Contacta-nos via WhatsApp se o valor foi cobrado.` })
          } finally {
            setLoading(false)
          }
        },
        onError: (err) => {
          console.error(`PayPal ${config.name} button error:`, err)
          setMessage({ type: 'error', text: 'Erro no PayPal. Tenta novamente ou usa M-Pesa.' })
        },
        onCancel: () => setMessage({ type: 'error', text: 'Pagamento cancelado. Podes tentar novamente.' })
      }).render(paypalRef.current).catch((renderErr) => {
        console.error(`PayPal ${config.name} render error:`, renderErr)
        setPaypalError('Erro ao inicializar PayPal. Usa M-Pesa.')
      })
    } catch (err) {
      console.error(`PayPal ${config.name} Buttons() error:`, err)
      setPaypalError('Erro ao criar botoes PayPal.')
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white/60">Eco não encontrado</p>
      </div>
    )
  }

  const selectedPlanData = config.plans.find(p => p.id === selectedPlan) || config.plans[0]

  // Iniciar trial
  async function handleTrial() {
    if (!session) {
      navigate(`/login`, { state: { from: `/${eco}/pagamento`, eco: config.name } })
      return
    }
    if (!userId) return

    setTrialLoading(true)
    const result = await startTrial(eco, userId)
    setTrialLoading(false)

    if (result.success) {
      setMessage({ type: 'success', text: `Trial de ${result.daysLeft} dias activado! ${g('Bem-vindo', 'Bem-vinda')} ao ${config.name}.` })
      setTimeout(() => navigate(`/${eco}/dashboard`), 2000)
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao activar trial' })
    }
  }

  // Submeter pagamento M-Pesa
  async function handleMpesaSubmit() {
    if (!userId || !mpesaRef.trim()) return

    setLoading(true)
    const result = await registerPendingPayment(eco, userId, {
      planKey: selectedPlan,
      method: 'mpesa',
      reference: mpesaRef.trim()
    })
    setLoading(false)

    if (result.success) {
      setMessage({ type: 'success', text: 'Pagamento registado! A coach vai confirmar em breve.' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao registar pagamento' })
    }
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: `linear-gradient(180deg, ${theme.colorDark} 0%, #0f0f0f 100%)` }}
    >
      <ModuleHeader
        eco={eco}
        title={config.name}
        subtitle="Começa a tua jornada"
        backTo={`/${eco}`}
      />

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Mensagem de feedback */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-center text-sm ${
              message.type === 'success' ? 'text-green-200' : 'text-red-200'
            }`}
            style={{
              background: message.type === 'success'
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(239, 68, 68, 0.15)'
            }}
          >
            {message.text}
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div
            className="rounded-2xl border p-5 mb-6"
            style={{ background: `${theme.color}10`, borderColor: `${theme.color}25` }}
          >
            <h2
              className="text-white text-lg font-semibold mb-4"
              style={{ fontFamily: 'var(--font-titulos)' }}
            >
              O que inclui o {config.name}
            </h2>
            <div className="space-y-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{f.icon}</span>
                  <p className="text-white/70 text-sm">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trial CTA */}
        {config.trial.enabled && (
          <button
            onClick={handleTrial}
            disabled={trialLoading}
            className="w-full py-4 rounded-2xl font-medium text-white text-center transition-all mb-6"
            style={{
              background: `linear-gradient(135deg, ${theme.color}, ${theme.colorDark})`,
              opacity: trialLoading ? 0.6 : 1
            }}
          >
            {trialLoading
              ? 'A activar...'
              : `Experimentar ${config.trial.days} dias grátis`
            }
          </button>
        )}

        {/* Seleccao de plano */}
        <div
          className="rounded-2xl border p-5 mb-6"
          style={{ background: `${theme.color}08`, borderColor: `${theme.color}15` }}
        >
          <h3 className="text-white text-lg font-semibold mb-4">Escolhe o teu plano</h3>
          <div className="space-y-3">
            {config.plans.map(plan => {
              const isSelected = selectedPlan === plan.id
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${
                    isSelected ? 'ring-2 scale-[1.01]' : 'hover:bg-white/5'
                  }`}
                  style={{
                    background: isSelected ? `${theme.color}20` : 'rgba(255,255,255,0.03)',
                    ringColor: isSelected ? theme.color : 'transparent',
                    border: `1px solid ${isSelected ? `${theme.color}50` : 'rgba(255,255,255,0.08)'}`
                  }}
                  aria-pressed={isSelected}
                >
                  <div>
                    <p className="text-white font-medium">{plan.name}</p>
                    <p className="text-white/40 text-xs">
                      {plan.duration === 1 ? '1 mês' : `${plan.duration} meses`}
                      {plan.discount > 0 && ` · ${plan.discount}% desconto`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{plan.price_mzn.toLocaleString()} MZN</p>
                    <p className="text-white/30 text-xs">${plan.price_usd} USD</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Metodo de pagamento */}
        <div
          className="rounded-2xl border p-5 mb-6"
          style={{ background: `${theme.color}08`, borderColor: `${theme.color}15` }}
        >
          <h3 className="text-white text-lg font-semibold mb-4">Método de pagamento</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('mpesa')}
              className={`p-4 rounded-xl text-center transition-all ${
                paymentMethod === 'mpesa' ? 'ring-2' : 'hover:bg-white/5'
              }`}
              style={{
                background: paymentMethod === 'mpesa' ? `${theme.color}20` : 'rgba(255,255,255,0.03)',
                ringColor: paymentMethod === 'mpesa' ? theme.color : 'transparent',
                border: `1px solid ${paymentMethod === 'mpesa' ? `${theme.color}50` : 'rgba(255,255,255,0.08)'}`
              }}
            >
              <span className="text-2xl block mb-1">📱</span>
              <span className="text-white text-sm font-medium">M-Pesa</span>
            </button>
            {config.paypal.enabled && (
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 rounded-xl text-center transition-all ${
                  paymentMethod === 'paypal' ? 'ring-2' : 'hover:bg-white/5'
                }`}
                style={{
                  background: paymentMethod === 'paypal' ? `${theme.color}20` : 'rgba(255,255,255,0.03)',
                  ringColor: paymentMethod === 'paypal' ? theme.color : 'transparent',
                  border: `1px solid ${paymentMethod === 'paypal' ? `${theme.color}50` : 'rgba(255,255,255,0.08)'}`
                }}
              >
                <span className="text-2xl block mb-1">💳</span>
                <span className="text-white text-sm font-medium">PayPal</span>
              </button>
            )}
          </div>

          {/* M-Pesa form */}
          {paymentMethod === 'mpesa' && (
            <div className="mt-4 space-y-3">
              <div
                className="p-3 rounded-xl"
                style={{ background: `${theme.color}15` }}
              >
                <p className="text-white/60 text-xs mb-2">Envia o pagamento para:</p>
                <p className="text-white font-mono font-bold text-lg">+258 85 100 6473</p>
                <p className="text-white/40 text-xs mt-1">
                  Valor: <strong className="text-white/70">{selectedPlanData.price_mzn.toLocaleString()} MZN</strong>
                </p>
              </div>

              <input
                type="text"
                value={mpesaRef}
                onChange={(e) => setMpesaRef(e.target.value)}
                placeholder="Referência M-Pesa (ex: MP24...)"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />

              <button
                onClick={handleMpesaSubmit}
                disabled={loading || !mpesaRef.trim()}
                className="w-full py-3 rounded-xl font-medium text-white transition-all disabled:opacity-40"
                style={{ background: theme.color }}
              >
                {loading ? 'A registar...' : 'Confirmar pagamento'}
              </button>

              {mpesaRef.trim() && (
                <a
                  href={getMpesaWhatsappLink(eco, selectedPlan, mpesaRef.trim())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm py-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  📱 Enviar comprovativo via WhatsApp
                </a>
              )}
            </div>
          )}

          {/* PayPal */}
          {paymentMethod === 'paypal' && (
            <div className="mt-4 space-y-3">
              <p className="font-bold text-center text-sm" style={{ color: theme.color }}>
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
              <p className="text-xs text-center" style={{ color: `${theme.color}80` }}>
                Paga com cartao de credito/debito ou conta PayPal
              </p>
            </div>
          )}
        </div>

        {/* Testemunho */}
        {testimonial && (
          <div
            className="rounded-2xl border p-4"
            style={{ background: `${theme.color}05`, borderColor: `${theme.color}10` }}
          >
            <p className="text-white/60 text-sm italic leading-relaxed">
              "{testimonial.text}"
            </p>
            <p className="text-white/30 text-xs mt-2">— {testimonial.author}</p>
          </div>
        )}
      </div>
    </div>
  )
}
