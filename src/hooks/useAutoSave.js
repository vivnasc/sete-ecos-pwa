/**
 * useAutoSave — auto-save com debounce e estado visível.
 *
 * Uso:
 *   const { status, ultimaGravacao, forcarGravar } = useAutoSave({
 *     value: notas,
 *     onSave: async (v) => await supabase.from('x').update({ notas: v }).eq('id', id),
 *     debounceMs: 800
 *   })
 *
 *   status: 'idle' | 'a guardar' | 'guardado' | 'erro'
 *   ultimaGravacao: Date | null
 *
 * Para mostrar o indicator, usar <AutoSaveIndicator status={status} ultima={ultimaGravacao} />
 */

import { useEffect, useRef, useState, useCallback } from 'react'

export default function useAutoSave({ value, onSave, debounceMs = 800, enabled = true }) {
  const [status, setStatus] = useState('idle')
  const [ultimaGravacao, setUltimaGravacao] = useState(null)
  const timerRef = useRef(null)
  const ultimoValorRef = useRef(value)
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  const gravarAgora = useCallback(async (v) => {
    if (!onSaveRef.current) return
    try {
      setStatus('a guardar')
      await onSaveRef.current(v)
      setStatus('guardado')
      setUltimaGravacao(new Date())
      // Voltar para idle após 2s (mantém "guardado às HH:MM" visível mais tempo)
      setTimeout(() => {
        setStatus(prev => prev === 'guardado' ? 'idle' : prev)
      }, 2000)
    } catch (e) {
      console.error('useAutoSave: erro a gravar', e)
      setStatus('erro')
    }
  }, [])

  // Debounce em alterações de value
  useEffect(() => {
    if (!enabled) return
    // Não gravar se valor é igual ao último
    if (value === ultimoValorRef.current) return
    // Não gravar valores vazios na primeira chamada
    if (ultimoValorRef.current === undefined && (value === '' || value == null)) {
      ultimoValorRef.current = value
      return
    }

    ultimoValorRef.current = value
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      gravarAgora(value)
    }, debounceMs)

    return () => clearTimeout(timerRef.current)
  }, [value, debounceMs, enabled, gravarAgora])

  const forcarGravar = useCallback(() => {
    clearTimeout(timerRef.current)
    gravarAgora(value)
  }, [value, gravarAgora])

  return { status, ultimaGravacao, forcarGravar }
}

export function AutoSaveIndicator({ status, ultima, className = '' }) {
  if (status === 'idle' && !ultima) return null

  const formatarHora = (d) => {
    if (!d) return ''
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  }

  let texto = ''
  let cor = 'var(--fnx-ink-faint)'

  if (status === 'a guardar') {
    texto = 'a guardar…'
  } else if (status === 'guardado') {
    texto = `guardado às ${formatarHora(ultima)}`
    cor = 'var(--fnx-ouro)'
  } else if (status === 'idle' && ultima) {
    texto = `guardado às ${formatarHora(ultima)}`
  } else if (status === 'erro') {
    texto = 'não consegui guardar. tenta de novo.'
    cor = '#C9614E'
  }

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="status"
      aria-live="polite"
      style={{
        fontFamily: 'var(--font-editorial)',
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: '11px',
        letterSpacing: '0.01em',
        color: cor,
        transition: 'color 0.3s ease'
      }}
    >
      {status === 'a guardar' && (
        <span
          aria-hidden
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--fnx-ouro)',
            display: 'inline-block',
            animation: 'fnxBreathe 1.2s ease-in-out infinite'
          }}
        />
      )}
      {texto}
    </span>
  )
}
