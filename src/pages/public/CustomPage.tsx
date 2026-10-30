import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { BuilderPage } from '@/components/pages/BuilderPage'
import { EmptyState } from '@/components/EmptyState'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { Button } from '@/components/ui/button'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { usePaginaInstitucional } from '@/hooks/usePaginasInstitucionais'
import { parseLayout } from '@/lib/pageLayout'

function NotFound() {
  useDocumentMeta({ title: 'Página não encontrada' })
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="sr-only">Página não encontrada</h1>
      <EmptyState
        icon={FileQuestion}
        title="Não encontramos esta página"
        description="O endereço pode estar errado ou a página foi tirada do ar."
        action={
          <Button asChild variant="outline">
            <Link to="/">Ir para o início</Link>
          </Button>
        }
      />
    </div>
  )
}

/** Página criada no painel, aberta em /pagina/<endereço>. */
export default function CustomPage() {
  const { slug = '' } = useParams()
  const { data: pagina, isLoading } = usePaginaInstitucional(slug)
  const layout = React.useMemo(() => parseLayout(pagina?.layout), [pagina?.layout])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    )
  }
  if (!pagina) return <NotFound />
  if (layout) return <BuilderPage pagina={pagina} layout={layout} />

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <article className="max-w-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight">{pagina.title}</h1>
        <RichTextRenderer html={pagina.content_html} className="mt-4 text-[15px]" />
      </article>
    </div>
  )
}
