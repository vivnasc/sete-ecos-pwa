import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateInviteCode, generatePromoCode } from '../lib/subscriptions'

/**
 * CoachPromoManager — Gestão de códigos promo/convite no dashboard coach
 */
export default function CoachPromoManager() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState(null)
  const [error, setError] = useState(null)

  // Form state
  const [form, setForm] = useState({
    type: 'tester',       // tester | trial | promo
    codeName: '',         // custom code name (optional)
    maxUses: 5,
    discount: 20,         // only for promo type
    expiresInDays: 30,    // 0 = no expiry
    notes: ''
  })

  // Load existing codes
  useEffect(() => { loadCodes() }, [])

  const loadCodes = async () => {
    setLoading(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from('vitalis_invite_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr
      setCodes(data || [])
    } catch (err) {
      console.error('Erro ao carregar códigos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    setError(null)
    try {
      let result

      if (form.type === 'promo') {
        const name = form.codeName.trim() || undefined
        result = await generatePromoCode(
          form.discount,
          name,
          form.maxUses,
          form.expiresInDays > 0 ? form.expiresInDays : null
        )
      } else {
        // tester or trial
        const notes = form.notes.trim() || `Criado pelo coach - ${form.type}`
        result = await generateInviteCode(form.type, form.maxUses, notes)
      }

      if (result.success) {
        setShowForm(false)
        setForm({ type: 'tester', codeName: '', maxUses: 5, discount: 20, expiresInDays: 30, notes: '' })
        await loadCodes()
      } else {
        setError(result.error?.message || 'Erro ao criar código')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (code) => {
    try {
      await supabase
        .from('vitalis_invite_codes')
        .update({ active: !code.active })
        .eq('id', code.id)
      await loadCodes()
    } catch (err) {
      console.error('Erro ao toggle:', err)
    }
  }

  const deleteCode = async (code) => {
    if (!confirm(`Apagar código ${code.code}?`)) return
    try {
      await supabase.from('vitalis_invite_codes').delete().eq('id', code.id)
      await loadCodes()
    } catch (err) {
      console.error('Erro ao apagar:', err)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(code)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const typeLabels = {
    tester: { label: 'Tester', desc: 'Acesso completo permanente', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
    trial: { label: 'Trial', desc: 'Trial 7 dias grátis', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    promo: { label: 'Promo', desc: 'Desconto no pagamento', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' }
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="coach-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-white/90 text-sm">Códigos Promo & Convite</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
          >
            {showForm ? 'Cancelar' : '+ Novo código'}
          </button>
        </div>
        <p className="text-xs text-white/30">Cria códigos para dar acesso a utilizadores de teste, trials ou descontos.</p>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="coach-glass rounded-2xl p-5 space-y-4 border border-purple-500/20">
          <h4 className="font-bold text-white/80 text-sm">Criar novo código</h4>

          {/* Type selector */}
          <div>
            <label className="text-xs text-white/40 mb-2 block">Tipo</label>
            <div className="flex gap-2">
              {Object.entries(typeLabels).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setForm(f => ({ ...f, type: key }))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${form.type === key ? 'ring-2 ring-offset-1 ring-offset-transparent' : 'opacity-50'}`}
                  style={{ background: t.bg, color: t.color, ringColor: t.color }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/25 mt-1">{typeLabels[form.type].desc}</p>
          </div>

          {/* Custom code name (optional) */}
          {form.type === 'promo' && (
            <div>
              <label className="text-xs text-white/40 mb-1 block">Nome do código (opcional)</label>
              <input
                type="text"
                value={form.codeName}
                onChange={e => setForm(f => ({ ...f, codeName: e.target.value.toUpperCase() }))}
                placeholder="Ex: VEMVITALIS20"
                maxLength={30}
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/40"
              />
            </div>
          )}

          {/* Discount (promo only) */}
          {form.type === 'promo' && (
            <div>
              <label className="text-xs text-white/40 mb-1 block">Desconto (%)</label>
              <input
                type="number"
                min={5} max={100} step={5}
                value={form.discount}
                onChange={e => setForm(f => ({ ...f, discount: parseInt(e.target.value) || 0 }))}
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/40"
              />
            </div>
          )}

          {/* Max uses */}
          <div>
            <label className="text-xs text-white/40 mb-1 block">Máximo de usos</label>
            <input
              type="number"
              min={1} max={1000}
              value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: parseInt(e.target.value) || 1 }))}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/40"
            />
          </div>

          {/* Expiration */}
          <div>
            <label className="text-xs text-white/40 mb-1 block">Expira em (dias, 0 = sem expiração)</label>
            <input
              type="number"
              min={0} max={365}
              value={form.expiresInDays}
              onChange={e => setForm(f => ({ ...f, expiresInDays: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/40"
            />
          </div>

          {/* Notes (tester/trial) */}
          {form.type !== 'promo' && (
            <div>
              <label className="text-xs text-white/40 mb-1 block">Notas (opcional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Ex: Para teste da Vanessa"
                maxLength={100}
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/40"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-3 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
          >
            {creating ? 'A criar...' : 'Criar código'}
          </button>
        </div>
      )}

      {/* Existing codes list */}
      <div className="coach-glass rounded-2xl p-5">
        <h4 className="font-bold text-white/80 text-sm mb-3">
          Códigos existentes {!loading && <span className="text-white/25 font-normal">({codes.length})</span>}
        </h4>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : codes.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-6">Nenhum código criado ainda.</p>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {codes.map(code => {
              const t = typeLabels[code.type] || typeLabels.tester
              const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
              const usagePercent = code.max_uses > 0 ? (code.uses_count / code.max_uses) * 100 : 0

              return (
                <div
                  key={code.id}
                  className={`rounded-xl p-3 border transition-all ${code.active && !isExpired ? 'bg-white/[0.04] border-white/[0.06]' : 'bg-white/[0.02] border-white/[0.03] opacity-50'}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Code & type */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => copyCode(code.code)}
                          className="font-mono text-sm font-bold text-white/90 hover:text-white transition-colors truncate"
                          title="Copiar código"
                        >
                          {code.code}
                        </button>
                        {copied === code.code && (
                          <span className="text-[10px] text-emerald-400 font-bold">Copiado!</span>
                        )}
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold" style={{ background: t.bg, color: t.color }}>
                          {t.label}
                        </span>
                        {code.type === 'promo' && code.notes && (
                          <span className="text-[9px] text-amber-400/70">-{code.notes}%</span>
                        )}
                      </div>

                      {/* Usage bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(usagePercent, 100)}%`,
                              background: usagePercent >= 90 ? '#f87171' : usagePercent >= 60 ? '#fbbf24' : '#34d399'
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-white/30 flex-shrink-0">
                          {code.uses_count}/{code.max_uses}
                        </span>
                      </div>

                      {/* Meta info */}
                      <div className="flex gap-3 mt-1">
                        {code.expires_at && (
                          <span className={`text-[9px] ${isExpired ? 'text-red-400' : 'text-white/20'}`}>
                            {isExpired ? 'Expirado' : `Expira ${new Date(code.expires_at).toLocaleDateString('pt-PT')}`}
                          </span>
                        )}
                        {code.notes && code.type !== 'promo' && (
                          <span className="text-[9px] text-white/15 truncate">{code.notes}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(code)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all active:scale-90 ${code.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.04] text-white/20'}`}
                        title={code.active ? 'Desactivar' : 'Activar'}
                      >
                        {code.active ? '✓' : '○'}
                      </button>
                      <button
                        onClick={() => deleteCode(code)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs bg-white/[0.04] text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90"
                        title="Apagar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
