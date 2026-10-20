import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/database'
import { useMinhasCandidaturas } from '@/hooks/useCandidaturas'
import { useCvVariants } from '@/hooks/useCvVariants'
import { Button } from '@/components/ui/button'
import { plural } from '@/lib/format'

const ADD_ROLE_OPTIONS: { role: UserRole; label: string; onboarding: string }[] = [
  { role: 'candidato', label: 'Também procuro emprego', onboarding: '/candidato/onboarding' },
  { role: 'autonomo', label: 'Também sou autônomo', onboarding: '/autonomo/onboarding' },
  { role: 'empresa_owner', label: 'Também quero contratar (empresa)', onboarding: '/empresa/onboarding' },
]

function Shortcut({ to, title, detail }: { to: string; title: string; detail: string }) {
  return (
    <li>
      <Link to={to} className="group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 sm:px-5">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold group-hover:underline">{title}</span>
          <span className="block text-sm text-muted-foreground">{detail}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  )
}

function CandidatoShortcuts({ userId }: { userId: string }) {
  const { data: candidaturas } = useMinhasCandidaturas(userId)
  const { data: cvs } = useCvVariants(userId)
  const emAndamento = candidaturas?.filter((c) => !['aprovada', 'rejeitada'].includes(c.status)).length ?? 0

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">Procurando emprego</h2>
      <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
        <Shortcut
          to="/candidato/candidaturas"
          title="Minhas candidaturas"
          detail={
            candidaturas
              ? candidaturas.length === 0
                ? 'Nenhuma ainda'
                : `${plural(candidaturas.length, 'candidatura', 'candidaturas')}, ${plural(emAndamento, 'em andamento', 'em andamento')}`
              : 'Carregando…'
          }
        />
        <Shortcut
          to="/candidato/cv"
          title="Meus currículos"
          detail={cvs ? (cvs.length === 0 ? 'Crie seu primeiro currículo' : plural(cvs.length, 'currículo salvo', 'currículos salvos')) : 'Carregando…'}
        />
        <Shortcut to="/" title="Ver vagas" detail="Vagas novas de Santana do Ipanema e região" />
      </ul>
    </section>
  )
}

export default function PerfilPage() {
  const { user, profile, roles, isAdmin } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true })
  }, [isAdmin, navigate])

  const firstName = profile?.full_name?.split(' ')[0]
  const missingRoles = ADD_ROLE_OPTIONS.filter((option) => !roles.includes(option.role))

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Olá{firstName ? `, ${firstName}` : ''}</h1>
        <Link to="/perfil/conta" className="mt-1 inline-block text-sm font-medium text-primary hover:underline">
          Configurações da conta
        </Link>
      </div>

      {roles.includes('candidato') && user && <CandidatoShortcuts userId={user.id} />}

      {roles.includes('autonomo') && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Seus serviços</h2>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            <Shortcut to="/autonomo/perfil" title="Meu perfil de autônomo" detail="Edite o que aparece para quem quer contratar" />
            <Shortcut to="/autonomo/plano" title="Plano" detail="Apareça em destaque nas buscas" />
          </ul>
        </section>
      )}

      {roles.includes('empresa_owner') && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Sua empresa</h2>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            <Shortcut to="/empresa/painel" title="Painel da empresa" detail="Vagas publicadas e candidaturas recebidas" />
            <Shortcut to="/empresa/vagas/nova" title="Publicar vaga" detail="Leva poucos minutos" />
          </ul>
        </section>
      )}

      {roles.length === 0 && (
        <p className="text-[15px] text-muted-foreground">Escolha abaixo como você quer usar o EmpregaSantana.</p>
      )}

      {missingRoles.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Adicionar outro perfil</h2>
          <div className="flex flex-wrap gap-2">
            {missingRoles.map((option) => (
              <Button key={option.role} variant="outline" asChild>
                <Link to={option.onboarding}>{option.label}</Link>
              </Button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
