import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

// Componente que provoca erro
function ThrowError({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Erro de teste')
  }
  return <div>Conteudo normal</div>
}

describe('ErrorBoundary', () => {
  // Suprimir console.error durante os testes
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renderiza children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Conteudo normal')).toBeInTheDocument()
  })

  it('mostra fallback quando há erro', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Algo correu mal')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('mostra botão de retry', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
    expect(screen.getByText('Voltar ao início')).toBeInTheDocument()
  })

  it('renderiza fallback customizado quando fornecido', () => {
    render(
      <ErrorBoundary fallback={<div>Fallback personalizado</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Fallback personalizado')).toBeInTheDocument()
  })
})
