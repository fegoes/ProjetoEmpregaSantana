import { Link, useNavigate, useParams } from 'react-router-dom'
import { Clock3, MapPin, Wallet } from 'lucide-react'
import { useVaga } from '@/hooks/useVagas'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { stripHtml } from '@/lib/utils'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { StatusBadge } from '@/components/StatusBadge'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { JsonLd } from '@/components/JsonLd'
import { ImageCarousel } from '@/components/ImageCarousel'
import { iconForVaga } from '@/lib/categoryIcons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const EMPLOYMENT_LABELS: Record<string, string> = {
  clt: 'CLT',
  pj: 'PJ',
  temporario: 'Temporário',
  freelance: 'Freelance',
}
const PRICING_LABELS: Record<string, string> = {
  fixed_salary: 'Salário fixo',
  hourly: 'Por hora',
  per_delivery: 'Por entrega',
}
// https://schema.org/JobPosting employmentType usa um enum próprio, diferente do nosso.
const SCHEMA_EMPLOYMENT_TYPE: Record<string, string> = {
  clt: 'FULL_TIME',
  pj: 'CONTRACTOR',
  temporario: 'TEMPORARY',
  freelance: 'CONTRACTOR',
}

export default function VagaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: vaga, isLoading } = useVaga(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  useDocumentMeta({
    title: vaga ? `${vaga.title}${vaga.empresas ? ` — ${vaga.empresas.nome_fantasia}` : ''}` : 'Vaga',
    description: vaga
      ? stripHtml(vaga.description_html) ||
        `Vaga de ${vaga.title}${vaga.empresas ? ` na ${vaga.empresas.nome_fantasia}` : ''} no EmpregaSantana.`
      : undefined,
    image: vaga?.photo_url ?? vaga?.empresas?.logo_url ?? undefined,
    type: 'website',
  })

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando vaga…</p>
  if (!vaga) return <p className="text-sm text-muted-foreground">Vaga não encontrada.</p>

  const Icon = iconForVaga(vaga.icon_key, vaga.category)

  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: vaga.title,
    description: vaga.description_html || vaga.title,
    datePosted: vaga.created_at,
    ...(vaga.expires_at ? { validThrough: vaga.expires_at } : {}),
    employmentType: SCHEMA_EMPLOYMENT_TYPE[vaga.employment_type],
    hiringOrganization: {
      '@type': 'Organization',
      name: vaga.empresas?.nome_fantasia ?? 'EmpregaSantana',
      ...(vaga.empresas?.logo_url ? { logo: vaga.empresas.logo_url } : {}),
    },
    ...(vaga.is_remote
      ? {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: { '@type': 'Country', name: 'BR' },
        }
      : {
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: vaga.location_city ?? undefined,
              addressRegion: vaga.location_state ?? undefined,
              addressCountry: 'BR',
            },
          },
        }),
    ...(vaga.pricing_model === 'fixed_salary' && vaga.salary_min
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'BRL',
            value: {
              '@type': 'QuantitativeValue',
              minValue: vaga.salary_min,
              ...(vaga.salary_max ? { maxValue: vaga.salary_max } : {}),
              unitText: 'MONTH',
            },
          },
        }
      : {}),
    ...(vaga.pricing_model === 'hourly' && vaga.hourly_rate
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'BRL',
            value: { '@type': 'QuantitativeValue', value: vaga.hourly_rate, unitText: 'HOUR' },
          },
        }
      : {}),
  }

  const handleCandidatar = () => {
    if (!user) {
      navigate(`/login?redirect=/vagas/${id}`)
      return
    }
    navigate(`/candidato/candidaturas?aplicar=${id}`)
  }

  const salaryLabel =
    vaga.pricing_model === 'fixed_salary' && vaga.salary_min
      ? `R$ ${vaga.salary_min.toLocaleString('pt-BR')}${vaga.salary_max ? ` – R$ ${vaga.salary_max.toLocaleString('pt-BR')}` : ''}`
      : vaga.pricing_model === 'hourly' && vaga.hourly_rate
        ? `R$ ${vaga.hourly_rate.toLocaleString('pt-BR')} / hora`
        : 'A combinar'

  return (
    <div className="flex flex-col gap-6">
      <JsonLd data={jobPostingJsonLd} />
      {(vaga.photo_urls?.length > 0 || vaga.photo_url) && (
        <ImageCarousel
          images={vaga.photo_urls?.length ? vaga.photo_urls : [vaga.photo_url as string]}
          alt={vaga.title}
          className="aspect-[21/9] w-full rounded-2xl"
          loading="eager"
        />
      )}
      <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-5">
        <div className="flex items-start gap-4">
          {vaga.empresas?.logo_url ? (
            <img
              src={vaga.empresas.logo_url}
              alt={vaga.empresas.nome_fantasia}
              className="size-14 shrink-0 rounded-2xl border object-cover"
            />
          ) : (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground/70">
              <Icon className="size-6" strokeWidth={2} />
            </span>
          )}
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-balance">{vaga.title}</h1>
            {vaga.empresas && (
              <Link
                to={`/empresas/${vaga.empresas.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {vaga.empresas.nome_fantasia}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={vaga.status} />
          <Badge variant="secondary" className="rounded-full">
            {EMPLOYMENT_LABELS[vaga.employment_type]}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {PRICING_LABELS[vaga.pricing_model]}
          </Badge>
          {vaga.is_remote && (
            <Badge variant="outline" className="rounded-full">
              Remoto
            </Badge>
          )}
        </div>

        <RichTextRenderer html={vaga.description_html} className="text-[15px]" />
      </div>

      <Card className="h-fit w-full rounded-2xl lg:w-80">
        <CardHeader>
          <CardTitle className="text-base">Sobre a vaga</CardTitle>
          <CardDescription>Confira os detalhes antes de se candidatar</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 text-sm">
            <Wallet className="size-4 shrink-0 text-muted-foreground" />
            <span className="font-medium">{salaryLabel}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            {vaga.is_remote
              ? 'Remoto'
              : [vaga.location_city, vaga.location_state].filter(Boolean).join(' — ') || 'Local a combinar'}
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Clock3 className="size-4 shrink-0 text-muted-foreground" />
            {EMPLOYMENT_LABELS[vaga.employment_type]}
          </div>

          {vaga.empresas && (
            <div className="flex items-center gap-2.5 border-t pt-4">
              {vaga.empresas.logo_url ? (
                <img
                  src={vaga.empresas.logo_url}
                  alt={vaga.empresas.nome_fantasia}
                  className="size-8 shrink-0 rounded-full border object-cover"
                />
              ) : (
                <InitialsAvatar name={vaga.empresas.nome_fantasia} size="sm" />
              )}
              <span className="truncate text-sm text-muted-foreground">{vaga.empresas.nome_fantasia}</span>
            </div>
          )}

          <Button onClick={handleCandidatar} variant="cta" size="lg" className="mt-1">
            Candidatar-se
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
