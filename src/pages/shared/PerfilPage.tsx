import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCvVariants } from '@/hooks/useCvVariants'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ROLE_CARDS: { role: UserRole; title: string; description: string; href: string }[] = [
  { role: 'candidato', title: 'Meu currículo', description: 'Gerencie seus currículos e candidaturas.', href: '/candidato/cv' },
  { role: 'autonomo', title: 'Meu perfil de autônomo', description: 'Edite seu perfil público de serviços.', href: '/autonomo/perfil' },
  { role: 'empresa_owner', title: 'Minha empresa', description: 'Gerencie vagas e candidaturas recebidas.', href: '/empresa/painel' },
]

const ADD_ROLE_OPTIONS: { role: UserRole; label: string; onboarding: string }[] = [
  { role: 'candidato', label: 'Também sou candidato', onboarding: '/candidato/onboarding' },
  { role: 'autonomo', label: 'Também sou autônomo', onboarding: '/autonomo/onboarding' },
  { role: 'empresa_owner', label: 'Também quero contratar (empresa)', onboarding: '/empresa/onboarding' },
]

export default function PerfilPage() {
  const { user, profile, roles, isAdmin } = useAuth()
  const navigate = useNavigate()
  const candidate = roles.includes('candidato')
  const cvs = useCvVariants(candidate ? user?.id : undefined)
  const applications = useQuery({
    queryKey: ['candidaturas', 'by-candidato', user?.id, 'summary'],
    enabled: candidate && Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from('candidaturas').select('id,status,created_at,vagas(title)').eq('candidato_id', user!.id).order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  React.useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true })
  }, [isAdmin, navigate])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Olá, {profile?.full_name ?? 'usuário'}</h1>
        <p className="text-sm text-muted-foreground">
          <Link to="/perfil/conta" className="hover:underline">
            Configurações de conta
          </Link>
        </p>
      </div>

      {candidate && <>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Candidaturas enviadas', applications.isLoading || applications.isError ? '—' : applications.data?.length ?? 0],
            ['Em análise', applications.isLoading || applications.isError ? '—' : applications.data?.filter(a => a.status === 'em_analise').length ?? 0],
            ['Currículos criados', cvs.isLoading || cvs.isError ? '—' : cvs.data?.length ?? 0],
          ].map(([label, value]) => <div key={label} className="rounded-2xl border bg-card p-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-3 font-display text-3xl font-extrabold text-brand-ink">{value}</p></div>)}
        </div>
        {(applications.isError || cvs.isError) && <p role="alert" className="text-sm text-destructive">Não foi possível atualizar seu resumo. <button className="underline" onClick={() => { applications.refetch(); cvs.refetch() }}>Tentar novamente</button></p>}
        {!!applications.data?.length && <section className="rounded-2xl border bg-card p-5"><h2 className="mb-4 text-lg font-bold">Suas oportunidades</h2><div className="divide-y">{applications.data.slice(0, 3).map(a => <Link key={a.id} to="/candidato/candidaturas" className="flex min-h-14 flex-wrap items-center justify-between gap-3 py-3 text-sm"><span>{a.vagas?.title ?? 'Vaga indisponível'}</span><span className="rounded-full bg-accent px-3 py-1 text-xs text-primary">{{ enviada: 'Enviada', em_analise: 'Em análise', entrevista: 'Entrevista', aprovada: 'Aprovada', rejeitada: 'Encerrada' }[a.status]}</span></Link>)}</div></section>}
      </>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_CARDS.filter((card) => roles.includes(card.role)).map((card) => (
          <Card key={card.role}>
            <CardHeader>
              <CardTitle className="text-base">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm">
                <Link to={card.href}>Acessar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div id="perfis" className="scroll-mt-24">
        <h2 className="mb-3 text-lg font-semibold">Adicionar outro perfil</h2>
        <div className="flex flex-wrap gap-2">
          {ADD_ROLE_OPTIONS.filter((option) => !roles.includes(option.role)).map((option) => (
            <Button key={option.role} variant="outline" size="sm" asChild>
              <Link to={option.onboarding}>{option.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
