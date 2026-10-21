import { Link } from 'react-router-dom'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { useEmpresaVagas, useDeleteVaga } from '@/hooks/useEmpresaVagas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'

export default function EmpresaVagasListPage() {
  const { empresa } = useEmpresa()
  const { data: vagas, isLoading, isError, refetch } = useEmpresaVagas(empresa?.id)
  const deleteVaga = useDeleteVaga()

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Excluir a vaga "${title}"? As candidaturas recebidas também serão apagadas. Essa ação não pode ser desfeita.`)) return
    deleteVaga.mutate({ id, empresaId: empresa?.id })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Minhas vagas</h1>
        <Button asChild>
          <Link to="/empresa/vagas/nova">Nova vaga</Link>
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {isError && <p role="alert" className="text-sm text-destructive">Não foi possível carregar as vagas. <button onClick={() => refetch()} className="underline">Tentar novamente</button></p>}
      {deleteVaga.isError && <p role="alert" className="text-sm text-destructive">Não foi possível excluir a vaga. Tente novamente.</p>}
      <div className="flex flex-col gap-3">
        {vagas?.map((vaga) => (
          <Card key={vaga.id}>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">{vaga.title}</CardTitle>
              <StatusBadge status={vaga.status} />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/empresa/vagas/${vaga.id}/editar`}>Editar</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to={`/empresa/vagas/${vaga.id}/candidatos`}>Candidatos</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(vaga.id, vaga.title)}
                disabled={deleteVaga.isPending}
              >
                Excluir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {vagas?.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma vaga cadastrada ainda.</p>}
    </div>
  )
}
