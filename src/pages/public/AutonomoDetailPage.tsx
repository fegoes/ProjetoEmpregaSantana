import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, MessageCircle, Wallet } from 'lucide-react'
import { useAutonomo } from '@/hooks/useAutonomos'
import { useAuth } from '@/contexts/AuthContext'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const PRICING_LABELS: Record<string, string> = {
  hourly: 'Por hora',
  per_delivery: 'Por entrega',
  both: 'Hora ou entrega',
}

export default function AutonomoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: autonomo, isLoading } = useAutonomo(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando perfil…</p>
  if (!autonomo) return <p className="text-sm text-muted-foreground">Autônomo não encontrado.</p>

  const name = autonomo.profiles?.full_name ?? 'Profissional autônomo'

  const handleContato = () => {
    if (!user) {
      navigate(`/login?redirect=/autonomos/${id}`)
      return
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-5">
        <div className="flex items-start gap-4">
          <InitialsAvatar name={name} size="lg" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{name}</h1>
            <p className="text-muted-foreground">{autonomo.headline}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {autonomo.category && (
            <Badge variant="secondary" className="rounded-full capitalize">
              {autonomo.category.replace(/-/g, ' ')}
            </Badge>
          )}
          <Badge variant="outline" className="rounded-full">
            {PRICING_LABELS[autonomo.pricing_model]}
          </Badge>
        </div>

        <RichTextRenderer html={autonomo.description_html} className="text-[15px]" />
      </div>

      <Card className="h-fit w-full rounded-2xl lg:w-80">
        <CardHeader>
          <CardTitle className="text-base">Contratar</CardTitle>
          <CardDescription>Entre em contato para combinar detalhes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {(autonomo.hourly_rate || autonomo.delivery_rate_note) && (
            <div className="flex items-start gap-2.5 text-sm">
              <Wallet className="mt-0.5 size-4 shrink-0 text-brand-blue" />
              <div>
                {autonomo.hourly_rate && (
                  <p className="font-medium">A partir de R$ {autonomo.hourly_rate}/hora</p>
                )}
                {autonomo.delivery_rate_note && (
                  <p className="text-muted-foreground">{autonomo.delivery_rate_note}</p>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin className="size-4 shrink-0 text-brand-blue" />
            {[autonomo.service_area_city, autonomo.service_area_state].filter(Boolean).join(' — ') ||
              'Área de atendimento a combinar'}
          </div>

          <Button onClick={handleContato} variant="cta" size="lg" className="mt-1 gap-2">
            <MessageCircle className="size-4" /> Entrar em contato
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
