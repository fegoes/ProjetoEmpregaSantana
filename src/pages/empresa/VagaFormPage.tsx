import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { useSaveVaga } from '@/hooks/useEmpresaVagas'
import { supabase } from '@/lib/supabase'
import { uploadVagaGalleryPhoto } from '@/lib/storage'
import { DEFAULT_UF } from '@/lib/masks'
import type { EmploymentType, PricingModelVaga, VagaStatus } from '@/types/database'
import { RichTextEditor } from '@/components/RichTextEditor'
import { PhotoGalleryField } from '@/components/PhotoGalleryField'
import { IconPickerField } from '@/components/IconPickerField'
import { CategorySelect } from '@/components/CategorySelect'
import { CityField } from '@/components/fields/CityField'
import { CurrencyInput } from '@/components/fields/MaskedInputs'
import { FormError } from '@/components/auth/FormError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function useVagaToEdit(id: string | undefined) {
  return useQuery({
    queryKey: ['vagas', 'edit', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('vagas').select('*').eq('id', id as string).single()
      if (error) throw error
      return data
    },
  })
}

export default function VagaFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { user } = useAuth()
  const { empresa } = useEmpresa()
  const navigate = useNavigate()
  const { data: existing } = useVagaToEdit(id)
  const saveVaga = useSaveVaga()

  const [title, setTitle] = React.useState('')
  const [descriptionHtml, setDescriptionHtml] = React.useState('')
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>('clt')
  const [pricingModel, setPricingModel] = React.useState<PricingModelVaga>('fixed_salary')
  const [salaryMin, setSalaryMin] = React.useState<number | null>(null)
  const [salaryMax, setSalaryMax] = React.useState<number | null>(null)
  const [hourlyRate, setHourlyRate] = React.useState<number | null>(null)
  const [salaryVisible, setSalaryVisible] = React.useState(true)
  const [category, setCategory] = React.useState('')
  const [locationCity, setLocationCity] = React.useState('')
  const [locationState, setLocationState] = React.useState<string>(DEFAULT_UF)
  const [isRemote, setIsRemote] = React.useState(false)
  const [photoUrls, setPhotoUrls] = React.useState<string[]>([])
  const [iconKey, setIconKey] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!existing) return
    setTitle(existing.title)
    setDescriptionHtml(existing.description_html ?? '')
    setEmploymentType(existing.employment_type)
    setPricingModel(existing.pricing_model)
    setSalaryMin(existing.salary_min)
    setSalaryMax(existing.salary_max)
    setHourlyRate(existing.hourly_rate)
    setSalaryVisible(existing.salary_visible)
    setCategory(existing.category ?? '')
    setLocationCity(existing.location_city ?? '')
    setLocationState(existing.location_state ?? DEFAULT_UF)
    setIsRemote(existing.is_remote)
    setPhotoUrls(existing.photo_urls ?? [])
    setIconKey(existing.icon_key ?? null)
  }, [existing])

  const handleSave = async (status: VagaStatus) => {
    if (!user || !empresa) return
    setError(null)

    if (!title.trim()) {
      setError('Dê um título para a vaga, por exemplo "Operador de caixa".')
      return
    }
    if (pricingModel === 'fixed_salary' && salaryMin && salaryMax && salaryMax < salaryMin) {
      setError('O salário máximo precisa ser maior que o mínimo.')
      return
    }
    if (status === 'published' && !isRemote && !locationCity.trim()) {
      setError('Informe a cidade da vaga ou marque "Vaga remota".')
      return
    }

    // Cada modelo de pagamento guarda só os seus valores
    const pay =
      pricingModel === 'fixed_salary'
        ? { salary_min: salaryMin, salary_max: salaryMax, hourly_rate: null }
        : pricingModel === 'hourly'
          ? { salary_min: null, salary_max: null, hourly_rate: hourlyRate }
          : { salary_min: null, salary_max: null, hourly_rate: null }

    try {
      const saved = await saveVaga.mutateAsync({
        id,
        empresa_id: empresa.id,
        created_by: user.id,
        title: title.trim(),
        description_html: descriptionHtml,
        employment_type: employmentType,
        pricing_model: pricingModel,
        ...pay,
        salary_visible: salaryVisible,
        category: category || null,
        location_city: isRemote ? null : locationCity.trim() || null,
        location_state: isRemote ? null : locationState,
        is_remote: isRemote,
        photo_urls: photoUrls,
        icon_key: iconKey,
        status,
      })
      navigate(`/empresa/vagas/${saved.id}/editar`)
    } catch {
      setError('Não foi possível salvar agora. Confira sua conexão e tente de novo.')
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar vaga' : 'Nova vaga'}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Título</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Descrição</Label>
          <RichTextEditor value={descriptionHtml} onChange={setDescriptionHtml} placeholder="Descreva a vaga…" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employmentType">Tipo de contratação</Label>
            <NativeSelect
              id="employmentType"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            >
              <option value="clt">CLT</option>
              <option value="pj">PJ</option>
              <option value="temporario">Temporário</option>
              <option value="freelance">Freelance</option>
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pricingModel">Modelo de pagamento</Label>
            <NativeSelect
              id="pricingModel"
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value as PricingModelVaga)}
            >
              <option value="fixed_salary">Salário fixo</option>
              <option value="hourly">Por hora</option>
              <option value="per_delivery">Por entrega</option>
            </NativeSelect>
          </div>
        </div>

        {pricingModel === 'fixed_salary' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salaryMin">Salário (ou o mínimo)</Label>
              <CurrencyInput id="salaryMin" value={salaryMin} onChange={setSalaryMin} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salaryMax">Salário máximo (opcional)</Label>
              <CurrencyInput id="salaryMax" value={salaryMax} onChange={setSalaryMax} />
            </div>
          </div>
        )}
        {pricingModel === 'hourly' && (
          <div className="flex flex-col gap-1.5 sm:max-w-[50%]">
            <Label htmlFor="hourlyRate">Valor da hora</Label>
            <CurrencyInput id="hourlyRate" value={hourlyRate} onChange={setHourlyRate} />
          </div>
        )}
        {pricingModel !== 'per_delivery' && (
          <label className="flex min-h-9 items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4"
              checked={salaryVisible}
              onChange={(e) => setSalaryVisible(e.target.checked)}
            />
            Mostrar o valor na vaga
          </label>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoria</Label>
          <CategorySelect id="category" kind="vaga" value={category} onChange={setCategory} />
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex min-h-9 items-center gap-2 text-sm">
            <input type="checkbox" className="size-4" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} />
            Vaga remota
          </label>
          {!isRemote && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="locationCity">Cidade</Label>
              <CityField
                id="locationCity"
                city={locationCity}
                uf={locationState}
                onChange={({ city, uf }) => {
                  setLocationCity(city)
                  setLocationState(uf)
                }}
              />
            </div>
          )}
        </div>

        {id ? (
          <PhotoGalleryField
            label="Fotos (opcional)"
            photos={photoUrls}
            onUpload={(file) => uploadVagaGalleryPhoto(file, id)}
            onChange={setPhotoUrls}
            hint="Aparecem como carrossel na vaga e no card de listagem. PNG ou JPG, até 5 MB cada."
          />
        ) : (
          <p className="text-sm text-muted-foreground">Salve a vaga como rascunho para poder adicionar fotos.</p>
        )}

        <details className="group rounded-xl border px-4 py-3">
          <summary className="flex min-h-9 cursor-pointer items-center justify-between gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
            Ícone da vaga (usado quando não há foto)
            <span className="text-muted-foreground group-open:hidden">Escolher</span>
          </summary>
          <div className="pt-3">
            <IconPickerField value={iconKey} onChange={setIconKey} />
          </div>
        </details>

        {error && <FormError>{error}</FormError>}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saveVaga.isPending}>
            Salvar rascunho
          </Button>
          <Button variant="cta" onClick={() => handleSave('published')} disabled={saveVaga.isPending}>
            {saveVaga.isPending ? 'Salvando…' : 'Publicar vaga'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
