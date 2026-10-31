import { ProfilePhotoField } from '@/components/ProfilePhotoField'
import { RecordTypeSelect } from '@/components/RecordTypeSelect'
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { PricingModelAutonomo } from '@/types/database'
import { BlocksEditor } from '@/components/BlocksEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { CityField } from '@/components/fields/CityField'
import { CurrencyInput } from '@/components/fields/MaskedInputs'
import { FormError } from '@/components/auth/FormError'
import { DEFAULT_UF } from '@/lib/masks'
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
  const { data: autonomo, isLoading, refetch } = useOwnAutonomoProfile(user?.id)

  const [headline, setHeadline] = React.useState('')
  const [typeSlug, setTypeSlug] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [descriptionHtml, setDescriptionHtml] = React.useState('')
  const [pricingModel, setPricingModel] = React.useState<PricingModelAutonomo>('hourly')
  const [hourlyRate, setHourlyRate] = React.useState<number | null>(null)
  const [deliveryNote, setDeliveryNote] = React.useState('')
  const [city, setCity] = React.useState('')
  const [uf, setUf] = React.useState<string>(DEFAULT_UF)
  const [feedback, setFeedback] = React.useState<{ ok: boolean; text: string } | null>(null)
  const [status, setStatus] = React.useState<'active' | 'paused'>('active')
  const [portfolioUrls, setPortfolioUrls] = React.useState<string[]>([])
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!autonomo) return
    setHeadline(autonomo.headline ?? '')
    setTypeSlug(autonomo.type_slug ?? '')
    setCategory(autonomo.category ?? '')
    setDescriptionHtml(autonomo.description_html ?? '')
    setPricingModel(autonomo.pricing_model)
    setHourlyRate(autonomo.hourly_rate)
    setDeliveryNote(autonomo.delivery_rate_note ?? '')
    setCity(autonomo.service_area_city ?? '')
    setUf(autonomo.service_area_state ?? DEFAULT_UF)
    setStatus(autonomo.status)
    setPortfolioUrls(autonomo.portfolio_urls ?? [])
  }, [autonomo])

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (!autonomo) return <Navigate to="/autonomo/onboarding" replace />

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setFeedback(null)
    const { error } = await supabase
      .from('autonomo_profiles')
      .update({
        headline,
        category: category || null,
        type_slug: typeSlug || null,
        description_html: descriptionHtml,
        pricing_model: pricingModel,
        hourly_rate: pricingModel === 'per_delivery' ? null : hourlyRate,
        delivery_rate_note: pricingModel === 'hourly' ? null : deliveryNote.trim() || null,
        service_area_city: city.trim() || null,
        service_area_state: city.trim() ? uf : null,
        status,
        portfolio_urls: portfolioUrls,
      })
      .eq('id', user.id)
    if (!error) await refetch()
    setSaving(false)
    setFeedback(error ? { ok: false, text: 'Não foi possível salvar agora. Confira sua conexão e tente de novo.' } : { ok: true, text: 'Perfil atualizado.' })
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Meu perfil de autônomo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ProfilePhotoField />
        <div className="space-y-2"><Label htmlFor="professional-type">Tipo de profissional</Label><RecordTypeSelect id="professional-type" kind="autonomo" value={typeSlug} onChange={setTypeSlug} /></div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="headline">Título</Label>
          <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoria</Label>
          <CategorySelect id="category" kind="autonomo" value={category} onChange={setCategory} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Sobre o seu trabalho</Label>
          <BlocksEditor value={descriptionHtml} onChange={setDescriptionHtml} kind="autonomo" />
        </div>
        <PhotoGalleryField
          label="Fotos de trabalhos (opcional)"
          photos={portfolioUrls}
          onUpload={(file) => uploadAutonomoPortfolioPhoto(file, autonomo.id)}
          onChange={setPortfolioUrls}
          hint="Aparecem como carrossel no seu card e no perfil público."
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pricingModel">Cobrança</Label>
          <NativeSelect
            id="pricingModel"
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value as PricingModelAutonomo)}
          >
            <option value="hourly">Por hora</option>
            <option value="per_delivery">Por entrega/serviço</option>
            <option value="both">Por hora e por serviço</option>
          </NativeSelect>
        </div>
        {pricingModel !== 'per_delivery' && (
          <div className="flex flex-col gap-1.5 sm:max-w-[50%]">
            <Label htmlFor="hourlyRate">Valor da hora</Label>
            <CurrencyInput id="hourlyRate" value={hourlyRate} onChange={setHourlyRate} />
          </div>
        )}
        {pricingModel !== 'hourly' && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deliveryNote">Valor por serviço</Label>
            <Input
              id="deliveryNote"
              placeholder="Ex.: a partir de R$ 150 por diária"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="serviceCity">Onde você atende?</Label>
          <CityField id="serviceCity" city={city} uf={uf} onChange={(v) => { setCity(v.city); setUf(v.uf) }} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={status === 'active'}
            onChange={(e) => setStatus(e.target.checked ? 'active' : 'paused')}
          />
          Visível publicamente
        </label>
        {feedback && (feedback.ok ? <p role="status" className="text-sm text-muted-foreground">{feedback.text}</p> : <FormError>{feedback.text}</FormError>)}
        <Button onClick={handleSave} variant="cta" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  )
}
