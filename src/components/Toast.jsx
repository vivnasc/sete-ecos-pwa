import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext()

/**
 * Toast notification system with WCAG 2.2 AA compliance.
 * - role="status" + aria-live="polite" for screen readers
 * - prefers-reduced-motion respected
 * - Keyboard dismissable (Escape)
 * - Auto-dismiss with configurable duration
 */

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type, duration }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((msg, opts) => addToast(msg, { type: 'success', ...opts }), [addToast])
  const error = useCallback((msg, opts) => addToast(msg, { type: 'error', duration: 6000, ...opts }), [addToast])
  const warning = useCallback((msg, opts) => addToast(msg, { type: 'warning', ...opts }), [addToast])
  const info = useCallback((msg, opts) => addToast(msg, { type: 'info', ...opts }), [addToast])

  // Dismiss all on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        setToasts([])
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [toasts.length])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }
  return context
}

const ICONS = {
  success: '\u2713',
  error: '\u2717',
  warning: '\u26A0',
  info: '\u2139',
}

const STYLES = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-600 text-white',
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg motion-safe:animate-slideUp ${STYLES[toast.type]}`}
        >
          <span className="text-lg font-bold shrink-0" aria-hidden="true">{ICONS[toast.type]}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs hover:bg-white/30 transition-colors"
            aria-label="Fechar notificacao"
          >
            \u2715
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastProvider
