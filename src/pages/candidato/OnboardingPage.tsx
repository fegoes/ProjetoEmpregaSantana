import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function CandidatoOnboardingPage() {
  const { user, roles, addRole } = useAuth()
  const navigate = useNavigate()
  const [headline, setHeadline] = React.useState('')
  const [desiredRole, setDesiredRole] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    if (!roles.includes('candidato')) {
      const { error: roleError } = await addRole('candidato')
      if (roleError) {
        setError(roleError)
        setLoading(false)
        return
      }
    }

    const { error: profileError } = await supabase
      .from('candidato_profiles')
      .upsert({ id: user.id, headline, desired_role: desiredRole })

    setLoading(false)
    if (profileError) {
      setError(profileError.message)
      return
    }
    navigate('/candidato/cv')
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Vamos montar seu perfil de candidato</CardTitle>
        <CardDescription>Você poderá criar vários currículos depois disso.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="headline">Título profissional</Label>
            <Input
              id="headline"
              placeholder="Ex.: Auxiliar administrativo com 3 anos de experiência"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desiredRole">Cargo desejado</Label>
            <Input
              id="desiredRole"
              value={desiredRole}
              onChange={(e) => setDesiredRole(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando…' : 'Continuar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
