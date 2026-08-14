import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const { profile, roles, isAdmin } = useAuth()
  const navigate = useNavigate()

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

      <div>
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
