/**
 * RepeatRefeicaoBar — barra horizontal com as últimas N refeições únicas.
 * Tap = repete (insere nova refeição igual à recente, com timestamp = agora).
 *
 * Reduz fricção brutalmente: clientes que comem rotinas repetidas só
 * fazem 1 toque para registar.
 */

import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { RotateCcw, Check } from 'lucide-react'

export default function RepeatRefeicaoBar({ userId, mealsRecentes = [], onRepeat }) {
  const [aRegistar, setARegistar] = useState(null)
  const [feitos, setFeitos] = useState(new Set())

  // Únicos por (alimentos + tipo) — pegar nos 8 mais recentes únicos
  const unicos = useMemo(() => {
    const map = new Map()
    for (const m of mealsRecentes) {
      const chave = `${(m.tipo || '').toLowerCase()}|${(m.alimentos || m.descricao || '').toLowerCase().trim().slice(0, 60)}`
      if (!chave || chave === '|') continue
      if (!map.has(chave)) map.set(chave, m)
      if (map.size >= 8) break
    }
    return [...map.values()]
  }, [mealsRecentes])

  if (!userId || unicos.length === 0) return null

  const repetir = async (meal) => {
    if (aRegistar) return
    const id = meal.id
    setARegistar(id)
    try {
      const novoRegisto = {
        user_id: userId,
        data: new Date().toISOString().split('T')[0],
        tipo: meal.tipo,
        alimentos: meal.alimentos,
        descricao: meal.descricao,
        porcoes_proteina: meal.porcoes_proteina,
        porcoes_hidratos: meal.porcoes_hidratos,
        porcoes_gordura: meal.porcoes_gordura,
        created_at: new Date().toISOString()
      }
      // Limpar campos undefined antes do insert
      const limpo = Object.fromEntries(Object.entries(novoRegisto).filter(([, v]) => v !== undefined))

      const { error } = await supabase.from('vitalis_meal_log').insert([limpo])
      if (error) {
        // Tentar tabela alternativa
        await supabase.from('vitalis_refeicoes_log').insert([limpo])
      }

      setFeitos(prev => new Set(prev).add(id))
      if (onRepeat) onRepeat(meal)
    } catch (e) {
      console.error('Erro a repetir refeição:', e)
    } finally {
      setARegistar(null)
    }
  }

  return (
    <section className="space-y-2" aria-label="Repetir refeição recente">
      <div className="flex items-center gap-2 px-1">
        <RotateCcw size={12} strokeWidth={1.4} className="fnx-text-ouro" />
        <span className="fnx-label-cap">comeste recentemente</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
        {unicos.map(m => {
          const isLoading = aRegistar === m.id
          const isDone = feitos.has(m.id)
          return (
            <button
              key={m.id}
              onClick={() => repetir(m)}
              disabled={isLoading || isDone}
              className="fnx-card-solid fnx-transition active:scale-95 shrink-0 text-left disabled:opacity-60"
              style={{
                padding: '10px 12px',
                minWidth: 160,
                maxWidth: 200,
                opacity: isDone ? 0.6 : 1
              }}
              aria-label={`Repetir ${m.tipo}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  style={{
                    fontFamily: 'var(--font-corpo)',
                    fontSize: '9.5px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--fnx-ouro)'
                  }}
                >
                  {(m.tipo || 'refeição').toLowerCase()}
                </span>
                {isDone ? (
                  <Check size={12} strokeWidth={1.6} className="fnx-text-ouro" />
                ) : (
                  <RotateCcw size={11} strokeWidth={1.4} className="fnx-text-faint" />
                )}
              </div>
              <p
                className="fnx-text-ink truncate"
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '12.5px',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.3
                }}
              >
                {m.alimentos || m.descricao || '—'}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
