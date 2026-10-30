import * as React from 'react'
import { PageRenderer } from '@/components/pages/PageRenderer'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import type { Pagina } from '@/hooks/usePaginasInstitucionais'
import { layoutExcerpt, type PageLayout } from '@/lib/pageLayout'

interface BuilderPageProps {
  pagina: Pick<Pagina, 'title' | 'seo_description' | 'is_published'>
  layout: PageLayout
}

/** Página pública montada em seções: título, descrição para buscadores e o desenho. */
export function BuilderPage({ pagina, layout }: BuilderPageProps) {
  const description = React.useMemo(
    () => pagina.seo_description?.trim() || layoutExcerpt(layout) || undefined,
    [pagina.seo_description, layout],
  )
  useDocumentMeta({ title: pagina.title, description })

  return (
    <>
      {!pagina.is_published && (
        <p className="bg-brand-orange px-4 py-2 text-center text-sm font-semibold text-brand-orange-foreground">
          Rascunho: só você vê esta página. Publique no painel para ela aparecer para todos.
        </p>
      )}
      <PageRenderer layout={layout} title={pagina.title} />
    </>
  )
}
