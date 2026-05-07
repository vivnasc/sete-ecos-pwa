'use client'

import { Component, type ReactNode } from 'react'

interface State { erro: boolean }

interface Props {
  children: ReactNode
  fallback?: ReactNode
  nome?: string
}

// Boundary silencioso · esconde a secção se partir, em vez de partir a app inteira
export default class SafeBlock extends Component<Props, State> {
  state: State = { erro: false }

  static getDerivedStateFromError(): State {
    return { erro: true }
  }

  componentDidCatch(error: Error) {
    if (typeof window !== 'undefined') {
      console.warn(`[fenixfit] bloco "${this.props.nome ?? 'desconhecido'}" partiu:`, error.message)
    }
  }

  render() {
    if (this.state.erro) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
