import { Link, useNavigate, useParams } from 'react-router-dom'
import { useVaga } from '@/hooks/useVagas'
import { useAuth } from '@/contexts/AuthContext'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VagaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: vaga, isLoading } = useVaga(id)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando vaga…</p>
  if (!vaga) return <p className="text-sm text-muted-foreground">Vaga não encontrada.</p>

  const handleCandidatar = () => {
    if (!user) {
      navigate(`/login?redirect=/vagas/${id}`)
      return
    }
    navigate(`/candidato/candidaturas?aplicar=${id}`)
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{vaga.title}</h1>
          {vaga.empresas && (
            <Link to={`/empresas/${vaga.empresas.id}`} className="text-sm text-primary hover:underline">
              {vaga.empresas.nome_fantasia}
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={vaga.status} />
          <Badge variant="secondary">{vaga.employment_type}</Badge>
          <Badge variant="outline">{vaga.pricing_model}</Badge>
          {vaga.is_remote && <Badge variant="outline">Remoto</Badge>}
        </div>

        <RichTextRenderer html={vaga.description_html} />
      </div>

      <Card className="h-fit w-full lg:w-72">
        <CardHeader>
          <CardTitle className="text-base">Candidatar-se</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {[vaga.location_city, vaga.location_state].filter(Boolean).join(' — ') || 'Local a combinar'}
          </p>
          <Button onClick={handleCandidatar}>Candidatar-se</Button>
        </CardContent>
      </Card>
    </div>
  )
}
