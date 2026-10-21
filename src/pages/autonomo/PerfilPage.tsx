import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { PricingModelAutonomo } from '@/types/database'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategorySelect } from '@/components/CategorySelect'
import { PhotoGalleryField } from '@/components/PhotoGalleryField'
import { uploadAutonomoPortfolioPhoto } from '@/lib/storage'
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
  const { data: autonomo, isLoading, isError, refetch } = useOwnAutonomoProfile(user?.id)

  const [headline, setHeadline] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [descriptionHtml, setDescriptionHtml] = React.useState('')
  const [pricingModel, setPricingModel] = React.useState<PricingModelAutonomo>('hourly')
  const [hourlyRate, setHourlyRate] = React.useState('')
  const [status, setStatus] = React.useState<'active' | 'paused'>('active')
  const [portfolioUrls, setPortfolioUrls] = React.useState<string[]>([])
  const queryClient = useQueryClient()
  const [saveError, setSaveError] = React.useState('')
  const [saved, setSaved] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!autonomo) return
    setHeadline(autonomo.headline ?? '')
    setCategory(autonomo.category ?? '')
    setDescriptionHtml(autonomo.description_html ?? '')
    setPricingModel(autonomo.pricing_model)
    setHourlyRate(autonomo.hourly_rate?.toString() ?? '')
    setStatus(autonomo.status)
    setPortfolioUrls(autonomo.portfolio_urls ?? [])
  }, [autonomo])

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (isError) return <p role="alert">Não foi possível carregar seu perfil. <button className="underline" onClick={() => refetch()}>Tentar novamente</button></p>
  if (!autonomo) return <Navigate to="/autonomo/onboarding" replace />

  const handleSave = async () => {
    if (!user) return
    if (hourlyRate && (!Number.isFinite(Number(hourlyRate)) || Number(hourlyRate) < 0)) { setSaveError('Informe um valor por hora válido.'); return }
    setSaving(true)
    setSaveError('')
    setSaved(false)
    try {
    const { error } = await supabase
      .from('autonomo_profiles')
      .update({
        headline,
        category: category || null,
        description_html: descriptionHtml,
        pricing_model: pricingModel,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        status,
        portfolio_urls: portfolioUrls,
      })
      .eq('id', user.id).select('id').single()
    if (error) throw error
    await refetch()
    queryClient.invalidateQueries({ queryKey: ['autonomos'] })
    setSaved(true)
    } catch { setSaveError('Não foi possível salvar o perfil. Tente novamente.') } finally { setSaving(false) }
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
          <Label htmlFor="category">Categoria</Label>
          <CategorySelect id="category" kind="autonomo" value={category} onChange={setCategory} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Descrição dos serviços</Label>
          <RichTextEditor value={descriptionHtml} onChange={setDescriptionHtml} />
        </div>
        <PhotoGalleryField
          label="Fotos de trabalhos (opcional)"
          photos={portfolioUrls}
          onUpload={(file) => uploadAutonomoPortfolioPhoto(file, autonomo.id)}
          onChange={setPortfolioUrls}
          hint="Aparecem como carrossel no seu card e no perfil público. PNG ou JPG, até 5 MB cada."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
        {saved && <p role="status" className="text-sm text-primary">Perfil atualizado.</p>}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  )
}
