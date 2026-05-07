'use client'

import { Component, type ReactNode } from 'react'

interface State { erro: Error | null }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { erro: null }

  static getDerivedStateFromError(error: Error): State {
    return { erro: error }
  }

  componentDidCatch(error: Error, info: unknown) {
    if (typeof window !== 'undefined') {
      console.error('[fenixfit] erro:', error, info)
    }
  }

  reset = () => {
    this.setState({ erro: null })
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="container-app flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center pt-10">
          <h1 className="font-serif text-[28px] font-light tracking-editorial">algo correu mal</h1>
          <p className="text-soft text-[13px] max-w-sm leading-relaxed">
            uma parte da app encontrou um erro. os teus dados estão seguros.
          </p>
          <pre className="text-faint text-[11px] max-w-sm overflow-x-auto">
            {this.state.erro.message}
          </pre>
          <div className="flex gap-2">
            <button onClick={this.reset} className="btn-primary">tentar de novo</button>
            <a href="/" className="btn-outline">voltar ao início</a>
          </div>
          <a href="/limpar" className="text-faint text-[11px] underline-offset-4 hover:underline">
            limpar caches se persistir
          </a>
        </div>
      )
    }
    return this.props.children
  }
}
