import { Link } from 'react-router-dom'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { useEmpresaVagas } from '@/hooks/useEmpresaVagas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'

export default function EmpresaVagasListPage() {
  const { empresa } = useEmpresa()
  const { data: vagas, isLoading } = useEmpresaVagas(empresa?.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Minhas vagas</h1>
        <Button asChild>
          <Link to="/empresa/vagas/nova">Nova vaga</Link>
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="flex flex-col gap-3">
        {vagas?.map((vaga) => (
          <Card key={vaga.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{vaga.title}</CardTitle>
              <StatusBadge status={vaga.status} />
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/empresa/vagas/${vaga.id}/editar`}>Editar</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={`/empresa/vagas/${vaga.id}/candidatos`}>Candidatos</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {vagas?.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma vaga cadastrada ainda.</p>}
    </div>
  )
}
