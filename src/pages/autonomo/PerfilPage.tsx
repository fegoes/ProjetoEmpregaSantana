import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { PricingModelAutonomo } from '@/types/database'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigate } from 'react-router-dom'

function useOwnAutonomoProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['autonomos', 'own', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autonomo_profiles')
        .select('*')
        .eq('id', userId as string)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export default function AutonomoPerfilPage() {
  const { user } = useAuth()
  const { data: autonomo, isLoading, refetch } = useOwnAutonomoProfile(user?.id)

  const [headline, setHeadline] = React.useState('')
  const [descriptionHtml, setDescriptionHtml] = React.useState('')
  const [pricingModel, setPricingModel] = React.useState<PricingModelAutonomo>('hourly')
  const [hourlyRate, setHourlyRate] = React.useState('')
  const [status, setStatus] = React.useState<'active' | 'paused'>('active')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!autonomo) return
    setHeadline(autonomo.headline ?? '')
    setDescriptionHtml(autonomo.description_html ?? '')
    setPricingModel(autonomo.pricing_model)
    setHourlyRate(autonomo.hourly_rate?.toString() ?? '')
    setStatus(autonomo.status)
  }, [autonomo])

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (!autonomo) return <Navigate to="/autonomo/onboarding" replace />

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await supabase
      .from('autonomo_profiles')
      .update({
        headline,
        description_html: descriptionHtml,
        pricing_model: pricingModel,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        status,
      })
      .eq('id', user.id)
    await refetch()
    setSaving(false)
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Meu perfil de autônomo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="headline">Título</Label>
          <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Descrição dos serviços</Label>
          <RichTextEditor value={descriptionHtml} onChange={setDescriptionHtml} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pricingModel">Cobrança</Label>
            <select
              id="pricingModel"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value as PricingModelAutonomo)}
            >
              <option value="hourly">Por hora</option>
              <option value="per_delivery">Por entrega</option>
              <option value="both">Ambos</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hourlyRate">Valor da hora</Label>
            <Input id="hourlyRate" type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={status === 'active'}
            onChange={(e) => setStatus(e.target.checked ? 'active' : 'paused')}
          />
          Visível publicamente
        </label>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  )
}
