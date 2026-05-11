/**
 * InsightsSemanal — chama /api/insights-semanal e mostra a leitura
 * editorial gerada por IA. Cache local por week-start.
 *
 * Props:
 *   userId — required
 *   dadosSemana — { refeicoes, registos, pesos, jejuns, aguas, sonos }
 *   nome — primeiro nome da cliente
 *   dataInicio — ISO data_inicio do cliente
 *   sexo — 'F'|'M'|'O'
 */

import { useState, useEffect, useMemo } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'

function semanaSegundaIso(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

export default function InsightsSemanal({ userId, dadosSemana, nome, dataInicio, sexo = 'F', auto = false }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const weekStart = useMemo(() => semanaSegundaIso(), [])
  const cacheKey = userId ? `vitalis-insight-${userId}-${weekStart}` : null

  // Tentar ler cache na montagem
  useEffect(() => {
    if (!cacheKey) return
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && parsed.leitura) setInsight(parsed)
      }
    } catch { /* */ }
  }, [cacheKey])

  const gerar = async () => {
    if (loading) return
    setLoading(true)
    setErro('')
    try {
      const r = await fetch('/api/insights-semanal', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nome,
          dataInicio,
          sexo,
          semana: dadosSemana
        })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'falha')
      setInsight(data)
      if (cacheKey) {
        try { localStorage.setItem(cacheKey, JSON.stringify(data)) } catch { /* */ }
      }
    } catch (e) {
      setErro(e.message || 'não consegui gerar agora.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-gerar na primeira montagem se auto=true e ainda não houver cache
  useEffect(() => {
    if (auto && !insight && !loading && dadosSemana) {
      // Atrasar 800ms para não bloquear render inicial
      const t = setTimeout(gerar, 800)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto])

  return (
    <section className="fnx-card-feature" aria-label="Leitura editorial da semana">
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.4} className="fnx-text-ouro" />
          <span className="fnx-label-cap">leitura da semana</span>
        </div>
        {insight && (
          <button
            onClick={gerar}
            disabled={loading}
            className="fnx-text-faint hover:opacity-70 fnx-transition"
            style={{ fontSize: '10.5px', letterSpacing: '0.04em' }}
            aria-label="Regenerar leitura"
          >
            {loading ? <Loader2 size={11} strokeWidth={1.6} className="animate-spin" /> : <RefreshCw size={11} strokeWidth={1.4} />}
          </button>
        )}
      </div>

      {!insight && !loading && (
        <>
          <p
            className="fnx-text-soft italic mb-4"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 300,
              fontSize: '14px',
              lineHeight: 1.6
            }}
          >
            queres ler como foi a tua semana em palavras? a coach analisa o que registaste e devolve uma leitura curta.
          </p>
          <button
            onClick={gerar}
            className="fnx-btn-primary w-full"
            style={{ padding: '0.625rem 1rem' }}
          >
            <Sparkles size={14} strokeWidth={1.4} />
            <span>gerar leitura</span>
          </button>
        </>
      )}

      {loading && !insight && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 size={14} strokeWidth={1.4} className="animate-spin fnx-text-ouro" />
          <span
            className="fnx-text-soft italic"
            style={{ fontFamily: 'var(--font-editorial)', fontWeight: 300, fontSize: '13.5px' }}
          >
            a ler a tua semana
          </span>
        </div>
      )}

      {erro && (
        <p
          className="italic mt-2"
          style={{
            fontFamily: 'var(--font-editorial)',
            fontWeight: 300,
            fontSize: '12.5px',
            color: '#C9614E'
          }}
        >
          {erro}
        </p>
      )}

      {insight && (
        <>
          <p
            className="fnx-text-ink italic"
            style={{
              fontFamily: 'var(--font-editorial)',
              fontWeight: 300,
              fontSize: '15px',
              lineHeight: 1.7,
              letterSpacing: '-0.005em'
            }}
          >
            {insight.leitura}
          </p>

          {insight.destaques && insight.destaques.length > 0 && (
            <>
              <hr className="fnx-hairline my-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {insight.destaques.map((d, i) => (
                  <div
                    key={i}
                    className="fnx-card-solid"
                    style={{ padding: '8px 10px' }}
                  >
                    <p
                      className="fnx-text-soft"
                      style={{
                        fontFamily: 'var(--font-editorial)',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: 1.35,
                        letterSpacing: '-0.005em'
                      }}
                    >
                      {d}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {insight.sugestao_proxima_semana && (
            <>
              <hr className="fnx-hairline my-4" />
              <div className="flex items-start gap-2">
                <span aria-hidden style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: 'var(--fnx-ouro)', marginTop: 8, flexShrink: 0
                }} />
                <p>
                  <span className="fnx-label-cap">próxima semana</span>
                  <span
                    className="fnx-text-ink block mt-1"
                    style={{
                      fontFamily: 'var(--font-editorial)',
                      fontSize: '14px',
                      lineHeight: 1.5
                    }}
                  >
                    {insight.sugestao_proxima_semana}
                  </span>
                </p>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
