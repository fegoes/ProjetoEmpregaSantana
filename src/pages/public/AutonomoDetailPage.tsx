import { Link, useLocation, useParams } from 'react-router-dom'
import { Clock, MapPin, MessageCircle, SearchX } from 'lucide-react'
import { useAutonomo } from '@/hooks/useAutonomos'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { stripHtml } from '@/lib/utils'
import { AUTONOMO_PRICING_LABELS, formatAutonomoPay, formatLocal, toWhatsAppNumber } from '@/lib/format'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { ImageCarousel } from '@/components/ImageCarousel'
import { EmptyState } from '@/components/EmptyState'
import { BackLink } from '@/components/BackLink'
import { BrandDivider } from '@/components/BrandDivider'
import { Button } from '@/components/ui/button'

/** Botão de contato: visitante vai para o login; logado abre o WhatsApp do profissional com a mensagem pronta. */
function ContactButton({ phone, name, className, hint = true }: { phone?: string | null; name: string; className?: string; hint?: boolean }) {
  const { user } = useAuth()
  const location = useLocation()
  const number = toWhatsAppNumber(phone)

  if (!user) {
    return (
      <div className={className}>
        <Button asChild variant="cta" size="lg" className="w-full">
          <Link to={`/login?redirect=${encodeURIComponent(location.pathname)}`}>
            <MessageCircle /> Chamar no WhatsApp
          </Link>
        </Button>
        {hint && <p className="mt-2 text-center text-xs text-muted-foreground">Você entra na sua conta e o contato é liberado.</p>}
      </div>
    )
  }

  if (!number) {
    return (
      <p className={className}>
        <span className="block text-sm text-muted-foreground">Este profissional ainda não informou um telefone.</span>
      </p>
    )
  }

  const message = `Olá, ${name.split(' ')[0]}! Vi seu perfil no EmpregaSantana e gostaria de um orçamento.`
  return (
    <Button asChild variant="cta" size="lg" className={className}>
      <a href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
        <MessageCircle /> Chamar no WhatsApp
      </a>
    </Button>
  )
}

export default function AutonomoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: autonomo, isLoading } = useAutonomo(id)

  useDocumentMeta({
    title: autonomo
      ? `${autonomo.profiles?.full_name ?? 'Profissional autônomo'} — ${autonomo.headline ?? 'Autônomo'}`
      : 'Autônomo',
    description: autonomo
      ? stripHtml(autonomo.description_html) || autonomo.headline || undefined
      : undefined,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-4" aria-busy="true" aria-label="Carregando perfil">
        <div className="size-14 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="h-6 w-48 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      </div>
    )
  }
  if (!autonomo) {
    return (
      <EmptyState
        icon={SearchX}
        title="Este perfil não está mais disponível"
        description="O profissional pode ter pausado o perfil."
        action={
          <Button asChild>
            <Link to="/explorar">Ver outros profissionais</Link>
          </Button>
        }
      />
    )
  }

  const name = autonomo.profiles?.full_name ?? 'Profissional autônomo'
  const local = formatLocal(autonomo.service_area_city, autonomo.service_area_state, 'Área de atendimento a combinar')
  const pay = formatAutonomoPay(autonomo)
  const phone = autonomo.profiles?.phone

  return (
    <div className="flex flex-col gap-4">
      <BackLink fallback="/explorar" />

      {autonomo.portfolio_urls?.length > 0 && (
        <ImageCarousel
          images={autonomo.portfolio_urls}
          alt={`Trabalhos de ${name}`}
          className="aspect-[16/9] w-full rounded-2xl sm:aspect-[21/9]"
          loading="eager"
        />
      )}

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <article className="min-w-0 flex-1">
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <InitialsAvatar name={name} size="lg" />
              <div className="min-w-0">
                <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-balance sm:text-3xl">{name}</h1>
                <p className="mt-0.5 text-[15px] text-muted-foreground">{autonomo.headline}</p>
              </div>
            </div>
            <p className="text-lg font-bold tabular-nums">{pay}</p>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {autonomo.categories?.label && (
                <li className="font-medium text-foreground">{autonomo.categories.label}</li>
              )}
              <li>{AUTONOMO_PRICING_LABELS[autonomo.pricing_model] ?? autonomo.pricing_model}</li>
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {local}
              </li>
              {autonomo.availability && (
                <li className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {autonomo.availability}
                </li>
              )}
            </ul>
          </header>

          <section className="mt-8" aria-labelledby="sobre-servico">
                <BrandDivider className="mb-6" />
            <h2 id="sobre-servico" className="mb-3 text-lg font-bold">
              Sobre o trabalho
            </h2>
            {autonomo.description_html ? (
              <RichTextRenderer html={autonomo.description_html} className="text-[15px]" />
            ) : (
              <p className="text-[15px] text-muted-foreground">O profissional ainda não escreveu uma descrição.</p>
            )}
          </section>
        </article>

        <aside className="hidden w-80 shrink-0 lg:sticky lg:top-24 lg:block" aria-label="Contratar">
          <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Valor</dt>
                <dd className="text-base font-semibold tabular-nums">{pay}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Atende em</dt>
                <dd className="font-medium">{local}</dd>
              </div>
            </dl>
            <ContactButton phone={phone} name={name} className="w-full" />
          </div>
        </aside>
      </div>

      <div
        data-sticky-cta
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-6px_20px_-12px_oklch(0_0_0/0.3)] lg:hidden"
      >
        <div className="mx-auto flex max-w-6xl">
          <ContactButton phone={phone} name={name} className="w-full" hint={false} />
        </div>
      </div>
    </div>
  )
}
