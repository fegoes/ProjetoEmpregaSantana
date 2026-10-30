import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/** Volta para a lista de onde a pessoa veio (mantém filtros e rolagem); sem histórico, vai para a página indicada. */
export function BackLink({ fallback = '/', label = 'Voltar' }: { fallback?: string; label?: string }) {
  const navigate = useNavigate()
  const canGoBack = typeof window !== 'undefined' && (window.history.state?.idx ?? 0) > 0

  return (
    <button
      type="button"
      onClick={() => (canGoBack ? navigate(-1) : navigate(fallback))}
      className="-ml-2 inline-flex h-10 items-center gap-1.5 self-start rounded-full px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  )
}
