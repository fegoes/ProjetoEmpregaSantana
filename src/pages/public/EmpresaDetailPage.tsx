import { useParams } from 'react-router-dom'
import { MapPin, Users } from 'lucide-react'
import { useEmpresa } from '@/hooks/useEmpresas'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { VagaCard } from '@/components/VagaCard'
import { EmptyState } from '@/components/EmptyState'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: empresa, isLoading } = useEmpresa(id)

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando empresa…</p>
  if (!empresa) return <p className="text-sm text-muted-foreground">Empresa não encontrada.</p>

  const vagasPublicadas = (empresa.vagas ?? []).filter((v) => v.status === 'published')

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-4">
        {empresa.logo_url ? (
          <img
            src={empresa.logo_url}
            alt={empresa.nome_fantasia}
            className="size-16 shrink-0 rounded-2xl border object-cover"
          />
        ) : (
          <InitialsAvatar name={empresa.nome_fantasia} size="lg" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">{empresa.nome_fantasia}</h1>
            {empresa.is_verified && <Badge className="rounded-full">Verificada</Badge>}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{empresa.sector ?? 'Setor não informado'}</span>
            {[empresa.city, empresa.state].filter(Boolean).length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {[empresa.city, empresa.state].filter(Boolean).join(' — ')}
              </span>
            )}
            {empresa.employee_count_visible && empresa.employee_count && (
              <span className="flex items-center gap-1">
                <Users className="size-3.5" />
                {empresa.employee_count}
              </span>
            )}
          </p>
        </div>
      </div>

      <RichTextRenderer html={empresa.description_html} />

      {empresa.address_visible && empresa.address && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            {empresa.address}
          </CardContent>
        </Card>
      )}

      {empresa.mission_visible && empresa.mission_vision_values_html && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Missão, visão e valores</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextRenderer html={empresa.mission_vision_values_html} />
          </CardContent>
        </Card>
      )}

      {empresa.org_chart_visible && empresa.org_chart_html && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organograma</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextRenderer html={empresa.org_chart_html} />
          </CardContent>
        </Card>
      )}

      {empresa.interior_photos_visible && empresa.interior_photo_urls.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Conheça o ambiente</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {empresa.interior_photo_urls.map((url) => (
              <div key={url} className="aspect-square overflow-hidden rounded-xl bg-muted">
                <img src={url} alt={`Ambiente interno da ${empresa.nome_fantasia}`} className="size-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Vagas abertas ({vagasPublicadas.length})</h2>
        {vagasPublicadas.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vagasPublicadas.map((vaga) => (
              <VagaCard
                key={vaga.id}
                vaga={{
                  ...vaga,
                  empresas: {
                    nome_fantasia: empresa.nome_fantasia,
                    city: empresa.city,
                    state: empresa.state,
                    logo_url: empresa.logo_url,
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={Users} title="Nenhuma vaga aberta no momento" />
        )}
      </div>
    </div>
  )
}
