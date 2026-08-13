import { usePaginaInstitucional } from '@/hooks/usePaginasInstitucionais'
import { RichTextRenderer } from '@/components/RichTextRenderer'

function InstitutionalPage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const { data: pagina, isLoading } = usePaginaInstitucional(slug)

  return (
    <article className="max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight">{pagina?.title ?? fallbackTitle}</h1>
      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <RichTextRenderer html={pagina?.content_html} className="mt-4 text-[15px]" />
      )}
    </article>
  )
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
