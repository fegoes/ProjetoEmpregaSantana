import { FormSection } from '@/components/forms/FormSection'
import { ProfilePhotoField } from '@/components/ProfilePhotoField'
import { safeInternalPath } from '@/lib/utils'
import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { PricingModelAutonomo } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { CityField } from '@/components/fields/CityField'
import { CurrencyInput } from '@/components/fields/MaskedInputs'
import { FormError } from '@/components/auth/FormError'
import { DEFAULT_UF } from '@/lib/masks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CategorySelect } from '@/components/CategorySelect'

export default function AutonomoOnboardingPage() {
  const { user, roles, addRole } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeInternalPath(params.get('voltar'))
  const [headline, setHeadline] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [pricingModel, setPricingModel] = React.useState<PricingModelAutonomo>('hourly')
  const [hourlyRate, setHourlyRate] = React.useState<number | null>(null)
  const [deliveryNote, setDeliveryNote] = React.useState('')
  const [city, setCity] = React.useState('')
  const [uf, setUf] = React.useState<string>(DEFAULT_UF)
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
      hourly_rate: pricingModel === 'per_delivery' ? null : hourlyRate,
      delivery_rate_note: pricingModel === 'hourly' ? null : deliveryNote.trim() || null,
      service_area_city: city.trim() || null,
      service_area_state: city.trim() ? uf : null,
    })

    setLoading(false)
    if (profileError) {
      setError('Não foi possível publicar agora. Confira sua conexão e tente de novo.')
      return
    }
    navigate(returnTo ?? '/autonomo/perfil')
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Divulgue seus serviços</CardTitle>
        <CardDescription>Seu perfil aparecerá publicamente na Home para contratação direta.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfilePhotoField />
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
            <CategorySelect id="category" kind="autonomo" value={category} onChange={setCategory} />
          </div>
          <FormSection title="Valores e cobrança"><div className="flex flex-col gap-1.5">
            <Label htmlFor="pricingModel">Como você cobra?</Label>
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hourlyRate">Valor da hora (opcional)</Label>
              <CurrencyInput id="hourlyRate" value={hourlyRate} onChange={setHourlyRate} />
            </div>
          )}
          {pricingModel !== 'hourly' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deliveryNote">Valor por serviço (opcional)</Label>
              <Input
                id="deliveryNote"
                placeholder="Ex.: a partir de R$ 150 por diária"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
              />
            </div>
          )}
          </FormSection><div className="flex flex-col gap-1.5">
            <Label htmlFor="serviceCity">Onde você atende?</Label>
            <CityField id="serviceCity" city={city} uf={uf} onChange={(v) => { setCity(v.city); setUf(v.uf) }} />
          </div>
          {error && <FormError>{error}</FormError>}
          <Button type="submit" variant="cta" disabled={loading}>
            {loading ? 'Salvando…' : 'Publicar meu perfil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
