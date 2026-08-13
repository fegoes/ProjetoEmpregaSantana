import { useNavigate, useParams } from 'react-router-dom'
import { useAutonomo } from '@/hooks/useAutonomos'
import { useAuth } from '@/contexts/AuthContext'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AutonomoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: autonomo, isLoading } = useAutonomo(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando perfil…</p>
  if (!autonomo) return <p className="text-sm text-muted-foreground">Autônomo não encontrado.</p>

  const handleContato = () => {
    if (!user) {
      navigate(`/login?redirect=/autonomos/${id}`)
      return
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{autonomo.profiles?.full_name}</h1>
          <p className="text-muted-foreground">{autonomo.headline}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {autonomo.category && <Badge variant="secondary">{autonomo.category}</Badge>}
          <Badge variant="outline">{autonomo.pricing_model}</Badge>
        </div>

        <RichTextRenderer html={autonomo.description_html} />
      </div>

      <Card className="h-fit w-full lg:w-72">
        <CardHeader>
          <CardTitle className="text-base">Contratar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {autonomo.hourly_rate && (
            <p className="text-sm text-muted-foreground">A partir de R$ {autonomo.hourly_rate}/hora</p>
          )}
          {autonomo.delivery_rate_note && (
            <p className="text-sm text-muted-foreground">{autonomo.delivery_rate_note}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {[autonomo.service_area_city, autonomo.service_area_state].filter(Boolean).join(' — ') ||
              'Área de atendimento a combinar'}
          </p>
          <Button onClick={handleContato}>Entrar em contato</Button>
        </CardContent>
      </Card>
    </div>
  )
}
