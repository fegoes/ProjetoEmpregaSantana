import { FormSection } from '@/components/forms/FormSection'
import { useRecordTypes } from '@/hooks/useRecordTypes'
import * as React from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { useCategories } from '@/hooks/useCategories'
import { useSaveVaga } from '@/hooks/useEmpresaVagas'
import { supabase } from '@/lib/supabase'
import { uploadVagaGalleryPhoto } from '@/lib/storage'
import { DEFAULT_UF } from '@/lib/masks'
import { activeFor } from '@/lib/categories'
import { MODELO_PADRAO, lerModelo, modeloParaSalvar, validarModelo, type EtapaModelo } from '@/lib/hiring'
import { MODALIDADE_PRESENCIAL, MODALIDADE_REMOTA, vagaModalidade } from '@/lib/modalidade'
import type { EmploymentType, PricingModelVaga, VagaStatus } from '@/types/database'
import { BlocksEditor } from '@/components/BlocksEditor'
import { EtapasEditor } from '@/components/processo/EtapasEditor'
import { PhotoGalleryField } from '@/components/PhotoGalleryField'
import { CategorySelect } from '@/components/CategorySelect'
import { CityField } from '@/components/fields/CityField'
import { CurrencyInput } from '@/components/fields/MaskedInputs'
import { FormError } from '@/components/auth/FormError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FALLBACK_MODALIDADES = [
  { slug: MODALIDADE_PRESENCIAL, label: 'Presencial' },
  { slug: MODALIDADE_REMOTA, label: 'Remota' },
  { slug: 'modalidade-hibrida', label: 'Híbrida' },
]

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
  const types = useRecordTypes()
  const { id } = useParams<{ id: string }>()
  const [mediaId]=React.useState(()=>id??crypto.randomUUID())
  const [uploads,setUploads]=React.useState(0)
  const uploading=(busy:boolean)=>setUploads(n=>Math.max(0,n+(busy?1:-1)))
  const isEditing = Boolean(id)
  const { user } = useAuth()
  const { empresa, loading: companyLoading } = useEmpresa()
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
  const [modalidade, setModalidade] = React.useState<string>(MODALIDADE_PRESENCIAL)
  const [etapas, setEtapas] = React.useState<EtapaModelo[]>(() => MODELO_PADRAO.map((e) => ({ ...e })))
  // só grava as etapas na vaga quando a empresa mexe nelas (ou a vaga já tinha etapas próprias)
  const [etapasMexidas, setEtapasMexidas] = React.useState(false)
  const { data: categories } = useCategories()
  // Lista que o superadmin gerencia. Sem ela (banco ainda sem a migration 0026) vale a lista de sempre.
  const managed = activeFor(categories, 'modalidade', modalidade)
  const hasManagedModalidades = managed.length > 0
  const modalidades = hasManagedModalidades ? managed : FALLBACK_MODALIDADES
  const isRemote = modalidade === MODALIDADE_REMOTA
  const [photoUrls, setPhotoUrls] = React.useState<string[]>([])
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
    setModalidade(vagaModalidade(existing))
    setEtapas(lerModelo(existing.etapas_selecao) ?? MODELO_PADRAO.map((e) => ({ ...e })))
    setPhotoUrls(existing.photo_urls?.length?existing.photo_urls:existing.photo_url?[existing.photo_url]:[])
  }, [existing])

  const handleSave = async (status: VagaStatus) => {
    if (!user || !empresa || uploads>0) return
    if (types.isLoading || types.isError) { setError('Aguarde o carregamento dos tipos de contratação ou recarregue a página.'); return }
    setError(null)

    if (!title.trim()) {
      setError('Dê um título para a vaga, por exemplo "Operador de caixa".')
      return
    }
    if (pricingModel === 'fixed_salary' && salaryMin && salaryMax && salaryMax < salaryMin) {
      setError('O salário máximo precisa ser maior que o mínimo.')
      return
    }
    const problemaEtapas = validarModelo(etapas)
    if (problemaEtapas) {
      setError(problemaEtapas)
      return
    }
    if (status === 'published' && !isRemote && !locationCity.trim()) {
      setError('Informe a cidade da vaga ou escolha a modalidade "Remota".')
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
        id:id??mediaId,
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
        ...(hasManagedModalidades ? { modalidade } : {}),
        ...(etapasMexidas || existing?.etapas_selecao ? { etapas_selecao: modeloParaSalvar(etapas) } : {}),
        photo_urls: photoUrls,
        photo_url:photoUrls[0]??null,
        status,
      })
      navigate(`/empresa/vagas/${saved.id}/editar`)
    } catch {
      setError('Não foi possível salvar agora. Confira sua conexão e tente de novo.')
    }
  }

  if (companyLoading) return <p role="status">Carregando a empresa…</p>
  if (!empresa) return <Navigate to="/empresa/onboarding?voltar=%2Fempresa%2Fvagas%2Fnova" replace />
  if (empresa.status !== 'active') return <Card className="mx-auto max-w-2xl"><CardHeader><CardTitle>{empresa.status==='pending'?'Empresa aguardando aprovação':'Publicação indisponível para esta empresa'}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">{empresa.status==='pending'?'O cadastro da empresa foi recebido. A publicação de vagas será liberada após a aprovação pela equipe do EmpregaSantana.':'O cadastro está suspenso. Entre em contato com a equipe para regularizar a situação.'}</p><Button asChild variant="outline"><Link to="/empresa/painel">Voltar ao painel da empresa</Link></Button></CardContent></Card>

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
          <Label>Descrição da vaga</Label>
          <BlocksEditor value={descriptionHtml} onChange={setDescriptionHtml} kind="vaga" />
        </div>

        <FormSection title="Contratação e remuneração">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employmentType">Tipo de contratação</Label>
            <NativeSelect
              id="employmentType"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            >
              {(types.data ?? []).filter(t => t.kind === 'vaga' && (t.is_active || t.slug === employmentType)).map(t => <option key={t.slug} value={t.slug}>{t.label}</option>)}
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

        </FormSection>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoria</Label>
          <CategorySelect id="category" kind="vaga" value={category} onChange={setCategory} />
        </div>

        <FormSection title="Localização e modalidade" defaultOpen>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modalidade">Modalidade</Label>
            <NativeSelect id="modalidade" value={modalidade} onChange={(e) => setModalidade(e.target.value)}>
              {modalidades.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.label}
                </option>
              ))}
            </NativeSelect>
          </div>
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

        </FormSection>
        <FormSection title="Etapas da seleção"><div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">Defina as etapas da seleção.</p>
          <EtapasEditor
            value={etapas}
            onChange={(next) => {
              setEtapas(next)
              setEtapasMexidas(true)
            }}
          />
        </div>

        </FormSection>
        <fieldset disabled={saveVaga.isPending}><PhotoGalleryField label="Fotos da vaga (opcional)" photos={photoUrls} onUpload={file=>uploadVagaGalleryPhoto(file,id??mediaId)} onChange={setPhotoUrls} onUploadingChange={uploading} /></fieldset>

        {error && <FormError>{error}</FormError>}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saveVaga.isPending||uploads>0}>
            Salvar rascunho
          </Button>
          <Button variant="cta" onClick={() => handleSave('published')} disabled={saveVaga.isPending||uploads>0}>
            {saveVaga.isPending ? 'Salvando…' : 'Publicar vaga'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
