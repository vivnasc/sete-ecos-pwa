import React from 'react'

/**
 * ErrorBoundary — captura erros de renderização e mostra fallback amigável.
 * Previne crash total da aplicação quando um componente falha.
 *
 * Inclui auto-reload para erros causados por cache desactualizado (Service Worker).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo)

    // Detect stale chunk loading errors (after deployment, old chunk files no longer exist)
    const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Loading CSS chunk') ||
      error?.message?.includes('Expected a JavaScript module script');

    // Detect ReferenceError from stale cached code (e.g., "Can't find variable: X")
    // Safari says "Can't find variable", Chrome/Firefox say "X is not defined"
    const isStaleCodeError = error instanceof ReferenceError;

    const shouldAutoReload = isChunkError || isStaleCodeError;

    if (shouldAutoReload && !sessionStorage.getItem('error_reload')) {
      console.warn('[ErrorBoundary] Erro provável de cache desactualizado. A forçar reload...')
      sessionStorage.setItem('error_reload', '1')

      // Limpar caches do Service Worker antes de recarregar
      if ('caches' in window) {
        caches.keys().then(names => {
          return Promise.all(names.map(name => caches.delete(name)))
        }).then(() => {
          window.location.reload()
        }).catch(() => {
          window.location.reload()
        })
      } else {
        window.location.reload()
      }
      return
    }

    // Limpar flag depois de um carregamento com sucesso (se já tentámos reload e ainda dá erro, mostrar ao user)
    // Nota: a flag é limpa no próximo carregamento sem erro via useEffect no App
  }

  handleRetry = () => {
    // Limpar flag de reload para permitir nova tentativa
    sessionStorage.removeItem('error_reload')
    this.setState({ hasError: false, error: null })
  }

  handleForceReload = () => {
    // Limpar TODOS os caches e forçar reload completo
    sessionStorage.removeItem('error_reload')
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister()
        }
      }).catch(() => {})
    }
    if ('caches' in window) {
      caches.keys().then(names => {
        return Promise.all(names.map(name => caches.delete(name)))
      }).then(() => {
        window.location.href = window.location.pathname + '?cache_bust=' + Date.now()
      }).catch(() => {
        window.location.href = window.location.pathname + '?cache_bust=' + Date.now()
      })
    } else {
      window.location.href = window.location.pathname + '?cache_bust=' + Date.now()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: 'var(--font-titulos)' }}
          >
            Algo correu mal
          </h2>
          <p className="text-gray-600 mb-4 max-w-md">
            Ocorreu um erro inesperado. Podes tentar recarregar esta secção ou voltar ao início.
          </p>
          {this.state.error && (
            <details open className="mb-6 max-w-md text-left">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Detalhes do erro</summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto max-h-60 whitespace-pre-wrap">
                {this.state.error.message || String(this.state.error)}
                {this.state.error.stack ? '\n\n' + this.state.error.stack : ''}
              </pre>
            </details>
          )}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Tentar novamente
            </button>
            <button
              onClick={this.handleForceReload}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Limpar cache e recarregar
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
