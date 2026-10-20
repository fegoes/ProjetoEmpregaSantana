import { Link, useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCvVariants, useDeleteCvVariant, useSaveCvVariant } from '@/hooks/useCvVariants'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'

export default function CvListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: cvs, isLoading } = useCvVariants(user?.id)
  const saveCv = useSaveCvVariant()
  const deleteCv = useDeleteCvVariant()

  const handleCreate = async () => {
    if (!user) return
    const cv = await saveCv.mutateAsync({
      candidato_id: user.id,
      title: `Currículo ${(cvs?.length ?? 0) + 1}`,
      is_default: (cvs?.length ?? 0) === 0,
    })
    navigate(`/candidato/cv/${cv.id}`)
  }

  const handleDelete = (id: string, title: string) => {
    if (!user) return
    if (!window.confirm(`Excluir o currículo "${title}"? Essa ação não pode ser desfeita.`)) return
    deleteCv.mutate({ id, candidatoId: user.id })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Meus currículos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tenha um currículo para cada tipo de vaga e escolha qual enviar na hora de se candidatar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/candidato/candidaturas">Minhas candidaturas</Link>
          </Button>
          <Button onClick={handleCreate} disabled={saveCv.isPending}>
            {saveCv.isPending ? 'Criando…' : 'Novo currículo'}
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {cvs && cvs.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cvs.map((cv) => (
            <li key={cv.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-sans text-base font-semibold">{cv.title}</h2>
                {cv.is_default && <span className="shrink-0 text-xs text-muted-foreground">padrão</span>}
              </div>
              <p className="text-sm text-muted-foreground">
                {cv.skills.length > 0 ? cv.skills.join(', ') : 'Nenhuma habilidade adicionada ainda.'}
              </p>
              <div className="mt-auto flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/candidato/cv/${cv.id}`}>Editar</Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive-ink" onClick={() => handleDelete(cv.id, cv.title)}>
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cvs?.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Você ainda não tem currículo"
          description="Monte o primeiro em poucos minutos. Ele fica salvo para você usar em várias vagas."
          action={
            <Button onClick={handleCreate} disabled={saveCv.isPending}>
              Criar meu primeiro currículo
            </Button>
          }
        />
      )}
    </div>
  )
}
