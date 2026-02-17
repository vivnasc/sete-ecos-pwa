import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { g } from '../../utils/genero'
import { getPaymentConfig, startTrial, registerPendingPayment, getMpesaWhatsappLink } from '../../lib/shared/paymentFlow'
import { getEcoTheme } from '../../lib/shared/subscriptionPlans'
import ModuleHeader from './ModuleHeader'

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
  }, [session])

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
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
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

          {/* PayPal placeholder */}
          {paymentMethod === 'paypal' && (
            <div className="mt-4 p-4 rounded-xl text-center" style={{ background: `${theme.color}10` }}>
              <p className="text-white/60 text-sm">
                PayPal em modo {config.paypal.mode}.
              </p>
              <p className="text-white/40 text-xs mt-2">
                O botão PayPal será carregado aqui.
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
