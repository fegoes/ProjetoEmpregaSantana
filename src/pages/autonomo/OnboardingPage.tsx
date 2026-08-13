import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { PricingModelAutonomo } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AutonomoOnboardingPage() {
  const { user, roles, addRole } = useAuth()
  const navigate = useNavigate()
  const [headline, setHeadline] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [pricingModel, setPricingModel] = React.useState<PricingModelAutonomo>('hourly')
  const [hourlyRate, setHourlyRate] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    if (!roles.includes('autonomo')) {
      const { error: roleError } = await addRole('autonomo')
      if (roleError) {
        setError(roleError)
        setLoading(false)
        return
      }
    }

    const { error: profileError } = await supabase.from('autonomo_profiles').upsert({
      id: user.id,
      headline,
      category: category || null,
      pricing_model: pricingModel,
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
    })

    setLoading(false)
    if (profileError) {
      setError(profileError.message)
      return
    }
    navigate('/autonomo/perfil')
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Divulgue seus serviços</CardTitle>
        <CardDescription>Seu perfil aparecerá publicamente na Home para contratação direta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="headline">O que você faz?</Label>
            <Input
              id="headline"
              placeholder="Ex.: Eletricista residencial e predial"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" placeholder="ex.: eletricista" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pricingModel">Como você cobra?</Label>
            <select
              id="pricingModel"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value as PricingModelAutonomo)}
            >
              <option value="hourly">Por hora</option>
              <option value="per_delivery">Por entrega/serviço</option>
              <option value="both">Ambos</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hourlyRate">Valor da hora (opcional)</Label>
            <Input id="hourlyRate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="cta" disabled={loading}>
            {loading ? 'Salvando…' : 'Publicar meu perfil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
