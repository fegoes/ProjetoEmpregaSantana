import * as React from 'react'
import { BuilderPage } from '@/components/pages/BuilderPage'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { usePaginaInstitucional } from '@/hooks/usePaginasInstitucionais'
import { parseLayout } from '@/lib/pageLayout'
import { stripHtml } from '@/lib/utils'

function TextPage({ title, html, loading }: { title: string; html: string | undefined; loading: boolean }) {
  useDocumentMeta({ title, description: stripHtml(html) || undefined })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <article className="max-w-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <RichTextRenderer html={html} className="mt-4 text-[15px]" />
        )}
      </article>
    </div>
  )
}

function InstitutionalPage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const { data: pagina, isLoading } = usePaginaInstitucional(slug)
  const layout = React.useMemo(() => parseLayout(pagina?.layout), [pagina?.layout])

  if (pagina && layout && layout.sections.length > 0) return <BuilderPage pagina={pagina} layout={layout} />
  return <TextPage title={pagina?.title ?? fallbackTitle} html={pagina?.content_html} loading={isLoading} />
}

export function SobrePage() {
  return <InstitutionalPage slug="sobre" fallbackTitle="Sobre o EmpregaSantana" />
}

export function TermosPage() {
  return <InstitutionalPage slug="termos" fallbackTitle="Termos de uso" />
}

export function PrivacidadePage() {
  return <InstitutionalPage slug="privacidade" fallbackTitle="Política de privacidade" />
}

export function LgpdPage() {
  return <InstitutionalPage slug="lgpd" fallbackTitle="Privacidade e LGPD" />
}
