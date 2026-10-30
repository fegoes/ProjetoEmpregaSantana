import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCvVariants, useSaveCvVariant } from '@/hooks/useCvVariants'
import { CANDIDATURA_STATUS_HINTS, useCandidatar, useMinhasCandidaturas } from '@/hooks/useCandidaturas'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export interface ApplyButtonProps {
  onClick: () => void
  disabled: boolean
  variant: 'cta' | 'outline'
  children: string
}

interface ApplyToVagaProps {
  vagaId: string
  vagaTitle: string
  empresaNome?: string | null
  /** Abre o painel assim que a página carrega (volta do login com ?candidatar=1). */
  autoOpen?: boolean
  /** Desenha o(s) botão(ões) — a página põe um no resumo lateral e outro na barra fixa do celular. */
  children: (buttonProps: ApplyButtonProps) => React.ReactNode
}

/** "Candidatar-se" + painel para escolher o currículo e enviar sem sair da vaga. Um painel só, quantos botões a página quiser. */
export function ApplyToVaga({ vagaId, vagaTitle, empresaNome, autoOpen = false, children }: ApplyToVagaProps) {
  const { user, roles, loading } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const isCandidato = roles.includes('candidato')
  const { data: candidaturas } = useMinhasCandidaturas(isCandidato ? user?.id : undefined)
  const existing = candidaturas?.find((c) => c.vaga_id === vagaId)
  const returnTo = `/vagas/${vagaId}?candidatar=1`

  React.useEffect(() => {
    if (autoOpen && user && !loading) setOpen(true)
  }, [autoOpen, user, loading])

  const handleClick = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(returnTo)}`)
      return
    }
    setOpen(true)
  }

  return (
    <>
      {children({
        onClick: handleClick,
        disabled: loading,
        variant: existing ? 'outline' : 'cta',
        children: existing ? 'Ver minha candidatura' : 'Candidatar-se',
      })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent title={existing ? 'Sua candidatura' : 'Candidatar-se'} description={vagaTitle}>
          {user && !isCandidato ? (
            <ActivateCandidato returnTo={returnTo} />
          ) : user ? (
            <ApplyForm
              candidatoId={user.id}
              vagaId={vagaId}
              empresaNome={empresaNome}
              existingStatus={existing?.status}
              returnTo={returnTo}
              onDone={() => setOpen(false)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}

function ActivateCandidato({ returnTo }: { returnTo: string }) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <p className="text-[15px]">
        Sua conta ainda não tem o perfil de candidato. Ative agora para montar seu currículo e se candidatar. Leva
        um minuto.
      </p>
      <Button asChild size="lg">
        <Link to={`/candidato/onboarding?voltar=${encodeURIComponent(returnTo)}`}>Ativar perfil de candidato</Link>
      </Button>
    </div>
  )
}

function ApplyForm({
  candidatoId,
  vagaId,
  empresaNome,
  existingStatus,
  returnTo,
  onDone,
}: {
  candidatoId: string
  vagaId: string
  empresaNome?: string | null
  existingStatus?: string
  returnTo: string
  onDone: () => void
}) {
  const navigate = useNavigate()
  const { data: cvs, isLoading } = useCvVariants(candidatoId)
  const saveCv = useSaveCvVariant()
  const candidatar = useCandidatar(candidatoId)
  const [selected, setSelected] = React.useState('')
  const [sent, setSent] = React.useState(false)

  React.useEffect(() => {
    if (selected || !cvs?.length) return
    setSelected((cvs.find((cv) => cv.is_default) ?? cvs[0]).id)
  }, [cvs, selected])

  const createCv = async () => {
    const cv = await saveCv.mutateAsync({ candidato_id: candidatoId, title: 'Meu currículo', is_default: true })
    navigate(`/candidato/cv/${cv.id}?voltar=${encodeURIComponent(returnTo)}`)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-4 pt-2" role="status">
        <CheckCircle2 className="size-10 text-success-ink" strokeWidth={1.75} />
        <div>
          <p className="font-display text-lg font-bold">Candidatura enviada!</p>
          <p className="mt-1 text-[15px] text-muted-foreground">
            {empresaNome ? `${empresaNome} recebeu seu currículo.` : 'A empresa recebeu seu currículo.'} Você acompanha
            o andamento em Minhas candidaturas.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button asChild size="lg">
            <Link to="/candidato/candidaturas">Ver minhas candidaturas</Link>
          </Button>
          <Button variant="outline" size="lg" onClick={onDone}>
            Continuar nesta vaga
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <p className="pt-2 text-sm text-muted-foreground">Carregando seus currículos…</p>
  }

  if (!cvs || cvs.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 pt-2">
        <FileText className="size-9 text-primary" strokeWidth={1.75} />
        <div>
          <p className="font-semibold">Você ainda não tem currículo</p>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Monte um agora. Depois de salvar, você volta para esta vaga e termina a candidatura.
          </p>
        </div>
        <Button size="lg" className="w-full" onClick={createCv} disabled={saveCv.isPending}>
          {saveCv.isPending ? 'Abrindo…' : 'Criar meu currículo'}
        </Button>
        {saveCv.isError && <p className="text-sm text-destructive-ink">Não foi possível criar agora. Tente de novo.</p>}
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-4 pt-2"
      onSubmit={(e) => {
        e.preventDefault()
        candidatar.mutate({ vagaId, cvVariantId: selected }, { onSuccess: () => setSent(true) })
      }}
    >
      {existingStatus && (
        <div className="flex flex-col gap-1.5 rounded-xl bg-secondary p-4">
          <StatusBadge status={existingStatus} />
          <p className="text-sm text-muted-foreground">{CANDIDATURA_STATUS_HINTS[existingStatus]}</p>
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">
          {existingStatus ? 'Trocar o currículo enviado' : 'Qual currículo enviar?'}
        </legend>
        {cvs.map((cv) => (
          <label
            key={cv.id}
            className={cn(
              'flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
              selected === cv.id ? 'border-primary bg-primary/5' : 'hover:border-primary/40',
            )}
          >
            <input
              type="radio"
              name="cv"
              value={cv.id}
              checked={selected === cv.id}
              onChange={() => setSelected(cv.id)}
              className="size-4 shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-medium">
                <span className="truncate">{cv.title}</span>
                {cv.is_default && <span className="shrink-0 text-xs font-normal text-muted-foreground">padrão</span>}
              </span>
              {cv.skills.length > 0 && (
                <span className="block truncate text-sm text-muted-foreground">{cv.skills.join(', ')}</span>
              )}
            </span>
          </label>
        ))}
      </fieldset>

      {candidatar.isError && (
        <p className="text-sm text-destructive-ink">Não foi possível enviar agora. Confira sua conexão e tente de novo.</p>
      )}

      <Button type="submit" variant="cta" size="lg" disabled={!selected || candidatar.isPending}>
        {candidatar.isPending ? 'Enviando…' : existingStatus ? 'Atualizar candidatura' : 'Enviar candidatura'}
      </Button>
      <Link to="/candidato/cv" className="self-center text-sm font-medium text-primary hover:underline">
        Editar meus currículos
      </Link>
    </form>
  )
}
