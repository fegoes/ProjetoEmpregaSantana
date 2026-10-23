import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

function Explode(): never {
  throw new Error('falha proposital')
}

describe('ErrorBoundary', () => {
  // React registra o erro no console mesmo quando o boundary o captura.
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
  afterEach(() => vi.restoreAllMocks())

  it('mostra os filhos quando nada quebra', () => {
    render(
      <ErrorBoundary>
        <p>conteúdo normal</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('conteúdo normal')).toBeTruthy()
  })

  it('troca a árvore por uma tela de erro em vez de deixar a página em branco', () => {
    render(
      <ErrorBoundary>
        <Explode />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Alguma coisa quebrou aqui')).toBeTruthy()
    expect(screen.getByText('Recarregar a página')).toBeTruthy()
  })

  it('expõe a mensagem do erro para quem for relatar', () => {
    render(
      <ErrorBoundary>
        <Explode />
      </ErrorBoundary>,
    )
    expect(screen.getByText('falha proposital')).toBeTruthy()
  })
})
