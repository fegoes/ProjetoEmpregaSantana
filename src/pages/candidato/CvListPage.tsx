import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCvVariants, useDeleteCvVariant, useSaveCvVariant } from '@/hooks/useCvVariants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CvListPage() {
  const { user } = useAuth()
  const { data: cvs, isLoading } = useCvVariants(user?.id)
  const saveCv = useSaveCvVariant()
  const deleteCv = useDeleteCvVariant()

  const handleCreate = () => {
    if (!user) return
    saveCv.mutate({ candidato_id: user.id, title: `Currículo ${(cvs?.length ?? 0) + 1}` })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Meus currículos</h1>
          <p className="text-sm text-muted-foreground">
            Crie versões diferentes para se candidatar a vagas distintas.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={saveCv.isPending}>
          Novo currículo
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cvs?.map((cv) => (
          <Card key={cv.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{cv.title}</CardTitle>
                {cv.is_default && <Badge variant="secondary">Padrão</Badge>}
              </div>
              <CardDescription>
                {cv.skills.length > 0 ? cv.skills.join(', ') : 'Nenhuma habilidade adicionada'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/candidato/cv/${cv.id}`}>Editar</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => user && deleteCv.mutate({ id: cv.id, candidatoId: user.id })}
              >
                Excluir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {cvs?.length === 0 && (
        <p className="text-sm text-muted-foreground">Você ainda não criou nenhum currículo.</p>
      )}
    </div>
  )
}
