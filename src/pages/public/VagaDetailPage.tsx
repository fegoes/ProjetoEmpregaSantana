import { buildJobPosting, isOpenJob } from '@/lib/jobSeo'
import { useEmploymentLabels } from '@/hooks/useRecordTypes'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Briefcase, CalendarDays, MapPin, SearchX } from 'lucide-react'
import { useVaga } from '@/hooks/useVagas'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { descriptionToText } from '@/lib/blocks'
import { useModalidadeLabels } from '@/hooks/useCategories'
import { formatVagaPay, hasVagaPayValue, isVagaNova, timeAgo } from '@/lib/format'
import { modalidadeLocal } from '@/lib/modalidade'
import { BlocksRenderer } from '@/components/BlocksRenderer'
import { StatusBadge } from '@/components/StatusBadge'
import { JsonLd } from '@/components/JsonLd'
import { ImageCarousel } from '@/components/ImageCarousel'
import { EmptyState } from '@/components/EmptyState'
import { BackLink } from '@/components/BackLink'
import { BrandDivider } from '@/components/BrandDivider'
import { ApplyToVaga } from '@/components/ApplyToVaga'
import { ShareWhatsAppButton } from '@/components/ShareWhatsAppButton'
import { VagaNovaTag } from '@/components/VagaCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// https://schema.org/JobPosting employmentType usa um enum próprio, diferente do nosso.


function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando vaga">
      <div className="h-8 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="h-6 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="mt-6 h-40 w-full max-w-2xl animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
    </div>
  )
}

export default function VagaDetailPage() {
  const employmentLabels = useEmploymentLabels()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { data: vaga, isLoading, isError, refetch } = useVaga(id)
  const modalidades = useModalidadeLabels()

  useDocumentMeta({
    title: vaga ? `${vaga.title}${vaga.empresas ? ` — ${vaga.empresas.nome_fantasia}` : ''}` : 'Vaga',
    description: vaga
      ? descriptionToText(vaga.description_html).slice(0, 160) ||
        `Vaga de ${vaga.title}${vaga.empresas ? ` na ${vaga.empresas.nome_fantasia}` : ''} no EmpregaSantana.`
      : undefined,
    image: vaga?.photo_url ?? vaga?.empresas?.logo_url ?? undefined,
    type: 'website',
    noindex: !isLoading && !isError && (!vaga || !isOpenJob(vaga)),
  })

  if (isLoading) return <DetailSkeleton />
  if (isError) return <div role="alert" className="space-y-4"><p>Não foi possível carregar esta vaga.</p><Button variant="outline" onClick={()=>refetch()}>Tentar novamente</Button></div>
  if (!vaga) {
    return (
      <EmptyState
        icon={SearchX}
        title="Esta vaga não está mais disponível"
        description="Ela pode ter sido encerrada ou removida pela empresa."
        action={
          <Button asChild>
            <Link to="/">Ver outras vagas</Link>
          </Button>
        }
      />
    )
  }

  const jobPostingJsonLd = buildJobPosting(vaga, `${window.location.origin}/vagas/${vaga.id}`)

  const empresaNome = vaga.empresas?.nome_fantasia ?? null
  const local = modalidadeLocal(vaga, modalidades)
  const pay = formatVagaPay(vaga)
  const open = isOpenJob(vaga)
  const photos = vaga.photo_urls?.length ? vaga.photo_urls : vaga.photo_url ? [vaga.photo_url] : []
  const shareText = `Vaga: ${vaga.title}${empresaNome ? ` na ${empresaNome}` : ''}. ${pay}, ${local}. Vi no EmpregaSantana:`
  const published = timeAgo(vaga.created_at)

  return (
    <ApplyToVaga
      vagaId={vaga.id}
      vagaTitle={vaga.title}
      empresaNome={empresaNome}
      autoOpen={open && searchParams.get('candidatar') === '1'}
    >
      {(apply) => (
        <div className="flex flex-col gap-4">
          {open && <JsonLd data={jobPostingJsonLd} />}
          <BackLink fallback="/" label="Voltar para as vagas" />

          {photos.length > 0 && (
            <ImageCarousel images={photos} alt={vaga.title} className="aspect-[16/9] w-full rounded-2xl sm:aspect-[21/9]" loading="eager" />
          )}

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <article className="min-w-0 flex-1">
              <header className="flex flex-col gap-4">
                {!open && (
                  <div className="flex flex-wrap items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm">
                    <StatusBadge status={vaga.status} />
                    Esta vaga não está recebendo candidaturas agora.
                  </div>
                )}
                <div className="flex items-start gap-4">
                  {vaga.empresas?.logo_url && (
                    <img
                      src={vaga.empresas.logo_url}
                      alt=""
                      className="size-14 shrink-0 rounded-xl border object-cover"
                      width={56}
                      height={56}
                    />
                  )}
                  <div className="min-w-0">
                    <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-balance sm:text-3xl">
                      {vaga.title}
                    </h1>
                    {vaga.empresas && (
                      <Link
                        to={`/empresas/${vaga.empresas.id}`}
                        className="mt-1 inline-block text-[15px] font-medium text-primary hover:underline"
                      >
                        {vaga.empresas.nome_fantasia}
                      </Link>
                    )}
                  </div>
                </div>

                <p
                  className={cn(
                    'tabular-nums',
                    hasVagaPayValue(vaga) ? 'text-xl font-bold' : 'text-base font-medium text-muted-foreground',
                  )}
                >
                  {pay}
                </p>

                <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Briefcase className="size-4" />
                    <span className="font-medium text-foreground">
                      {employmentLabels[vaga.employment_type] ?? vaga.employment_type}
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {local}
                  </li>
                  {published && (
                    <li className="flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      Publicada {published}
                    </li>
                  )}
                  {isVagaNova(vaga.created_at) && (
                    <li>
                      <VagaNovaTag />
                    </li>
                  )}
                </ul>
              </header>

              <section className="mt-8" aria-labelledby="descricao-vaga">
                <BrandDivider className="mb-6" />
                <h2 id="descricao-vaga" className="mb-3 text-lg font-bold">
                  Descrição da vaga
                </h2>
                {vaga.description_html ? (
                  <BlocksRenderer html={vaga.description_html} headingLevel={3} />
                ) : (
                  <p className="text-[15px] text-muted-foreground">A empresa não incluiu uma descrição.</p>
                )}
              </section>

              {vaga.empresas && (
                <section className="mt-8" aria-labelledby="sobre-empresa">
                <BrandDivider className="mb-6" />
                  <h2 id="sobre-empresa" className="mb-3 text-lg font-bold">
                    Sobre a empresa
                  </h2>
                  {vaga.empresas.description_html && (
                    <BlocksRenderer html={vaga.empresas.description_html} headingLevel={3} className="mb-3" />
                  )}
                  <Link to={`/empresas/${vaga.empresas.id}`} className="text-sm font-medium text-primary hover:underline">
                    Ver página e outras vagas da {vaga.empresas.nome_fantasia}
                  </Link>
                </section>
              )}
            </article>

            <aside className="hidden w-80 shrink-0 lg:sticky lg:top-24 lg:block" aria-label="Resumo da vaga">
              <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
                <dl className="flex flex-col gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Remuneração</dt>
                    <dd className="text-base font-semibold tabular-nums">{pay}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Contratação</dt>
                    <dd className="font-medium">{employmentLabels[vaga.employment_type] ?? vaga.employment_type}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Local</dt>
                    <dd className="font-medium">{local}</dd>
                  </div>
                </dl>
                {open ? (
                  <Button {...apply} size="lg" className="w-full" />
                ) : (
                  <p className="text-sm text-muted-foreground">Candidaturas encerradas.</p>
                )}
                <ShareWhatsAppButton text={shareText} className="w-full" />
              </div>
            </aside>
          </div>

          {open && (
            <div
              data-sticky-cta
              className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-6px_20px_-12px_oklch(0_0_0/0.3)] lg:hidden"
            >
              <div className="mx-auto flex max-w-6xl items-center gap-2">
                <ShareWhatsAppButton text={shareText} iconOnly />
                <Button {...apply} size="lg" className="flex-1" />
              </div>
            </div>
          )}
        </div>
      )}
    </ApplyToVaga>
  )
}
