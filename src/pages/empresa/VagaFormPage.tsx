import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { useSaveVaga } from '@/hooks/useEmpresaVagas'
import { supabase } from '@/lib/supabase'
import { uploadVagaPhoto } from '@/lib/storage'
import type { EmploymentType, PricingModelVaga, VagaStatus } from '@/types/database'
import { RichTextEditor } from '@/components/RichTextEditor'
import { ImageUploadField } from '@/components/ImageUploadField'
import { CategorySelect } from '@/components/CategorySelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [category, setCategory] = React.useState('')
  const [locationCity, setLocationCity] = React.useState('')
  const [isRemote, setIsRemote] = React.useState(false)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!existing) return
    setTitle(existing.title)
    setDescriptionHtml(existing.description_html ?? '')
    setEmploymentType(existing.employment_type)
    setPricingModel(existing.pricing_model)
    setCategory(existing.category ?? '')
    setLocationCity(existing.location_city ?? '')
    setIsRemote(existing.is_remote)
    setPhotoUrl(existing.photo_url)
  }, [existing])

  const handleSave = async (status: VagaStatus) => {
    if (!user || !empresa) return
    const saved = await saveVaga.mutateAsync({
      id,
      empresa_id: empresa.id,
      created_by: user.id,
      title,
      description_html: descriptionHtml,
      employment_type: employmentType,
      pricing_model: pricingModel,
      category: category || null,
      location_city: locationCity || null,
      is_remote: isRemote,
      photo_url: photoUrl,
      status,
    })
    navigate(`/empresa/vagas/${saved.id}/editar`)
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar vaga' : 'Nova vaga'}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Título</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Descrição</Label>
          <RichTextEditor value={descriptionHtml} onChange={setDescriptionHtml} placeholder="Descreva a vaga…" />
        </div>

        {id ? (
          <ImageUploadField
            label="Foto (opcional)"
            currentUrl={photoUrl}
            onUpload={(file) => uploadVagaPhoto(file, id)}
            onUploaded={setPhotoUrl}
            shape="banner"
            hint="Mostrada na vaga e no card de listagem. PNG ou JPG, até 5 MB."
          />
        ) : (
          <p className="text-xs text-muted-foreground">
            Salve a vaga como rascunho para poder adicionar uma foto.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employmentType">Tipo de contratação</Label>
            <select
              id="employmentType"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            >
              <option value="clt">CLT</option>
              <option value="pj">PJ</option>
              <option value="temporario">Temporário</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pricingModel">Modelo de pagamento</Label>
            <select
              id="pricingModel"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value as PricingModelVaga)}
            >
              <option value="fixed_salary">Salário fixo</option>
              <option value="hourly">Por hora</option>
              <option value="per_delivery">Por entrega</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoria</Label>
          <CategorySelect id="category" kind="vaga" value={category} onChange={setCategory} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="locationCity">Cidade</Label>
          <Input id="locationCity" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} />
          Vaga remota
        </label>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saveVaga.isPending}>
            Salvar rascunho
          </Button>
          <Button variant="cta" onClick={() => handleSave('published')} disabled={saveVaga.isPending}>
            Publicar vaga
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
