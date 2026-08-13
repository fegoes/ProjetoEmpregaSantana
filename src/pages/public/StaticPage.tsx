import type { ReactNode } from 'react'

interface StaticPageProps {
  title: string
  children: ReactNode
}

export function StaticPage({ title, children }: StaticPageProps) {
  return (
    <article className="prose prose-sm max-w-2xl">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="mt-4 text-sm text-muted-foreground">{children}</div>
    </article>
  )
}

export function SobrePage() {
  return (
    <StaticPage title="Sobre o EmpregaSantana">
      <p>
        O EmpregaSantana conecta candidatos, autônomos e empresas em um só lugar: vagas fixas,
        trabalho temporário por hora ou por entrega, e profissionais disponíveis para contratação
        direta.
      </p>
    </StaticPage>
  )
}

export function TermosPage() {
  return (
    <StaticPage title="Termos de uso">
      <p>Conteúdo dos termos de uso a ser definido.</p>
    </StaticPage>
  )
}

export function PrivacidadePage() {
  return (
    <StaticPage title="Política de privacidade">
      <p>Conteúdo da política de privacidade a ser definido.</p>
    </StaticPage>
  )
}
