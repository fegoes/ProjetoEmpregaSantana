import { Link, Navigate } from 'react-router-dom'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { useEmpresaVagas } from '@/hooks/useEmpresaVagas'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'

export default function EmpresaPainelPage() {
  const { empresa, loading } = useEmpresa()
  const { data: vagas } = useEmpresaVagas(empresa?.id)

  if (loading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (!empresa) return <Navigate to="/empresa/onboarding" replace />

  const publicadas = vagas?.filter((v) => v.status === 'published').length ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{empresa.nome_fantasia}</h1>
          <StatusBadge status={empresa.status} />
        </div>
        <Button asChild>
          <Link to="/empresa/vagas/nova">Nova vaga</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Vagas publicadas</CardDescription>
            <CardTitle className="text-2xl">{publicadas}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total de vagas</CardDescription>
            <CardTitle className="text-2xl">{vagas?.length ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Plano atual</CardDescription>
            <CardTitle className="text-2xl">
              <Link to="/empresa/plano" className="text-primary hover:underline">
                Ver plano
              </Link>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link to="/empresa/vagas">Gerenciar vagas</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/empresa/perfil">Editar perfil da empresa</Link>
        </Button>
      </div>
    </div>
  )
}
