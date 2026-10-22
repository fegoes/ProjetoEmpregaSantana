import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  erro: Error | null
}

// Sem um limite de erro, qualquer exceção lançada durante a renderização
// desmonta a árvore inteira e deixa a página em branco, sem nenhuma mensagem —
// o modo de falha mais comum de uma SPA em React. Aqui a falha vira tela.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null }

  static getDerivedStateFromError(erro: Error): State {
    return { erro }
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.error('Erro não tratado na interface:', erro, info.componentStack)
  }

  render() {
    const { erro } = this.state
    if (!erro) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            Alguma coisa quebrou aqui
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            O erro foi registrado. Recarregar costuma resolver; se continuar, volte ao
            início e tente por outro caminho.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-md"
            >
              Recarregar a página
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-border px-5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              Ir para o início
            </a>
          </div>

          {/* Detalhe técnico fechado por padrão: ajuda a relatar sem assustar. */}
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
              Detalhes técnicos
            </summary>
            <pre className="mt-2 overflow-auto rounded-xl bg-muted p-3 text-left text-[11px] leading-relaxed text-muted-foreground">
              {erro.message}
            </pre>
          </details>
        </div>
      </div>
    )
  }
}
