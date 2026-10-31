import { ProfilePhotoField } from '@/components/ProfilePhotoField'
import * as React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCvVariant, useSaveCvVariant } from '@/hooks/useCvVariants'
import { useCategories } from '@/hooks/useCategories'
import { activeFor } from '@/lib/categories'
import type { CvEducation, CvExperience } from '@/types/database'
import { RichTextEditor } from '@/components/RichTextEditor'
import { ExperienceEditor } from '@/components/ExperienceEditor'
import { EducationEditor } from '@/components/EducationEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneInput } from '@/components/fields/MaskedInputs'
import { CepField } from '@/components/fields/CepField'
import { addressLineFromCep } from '@/lib/cep'
import { maskPhone } from '@/lib/masks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn, safeInternalPath } from '@/lib/utils'

export default function CvEditPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const voltar = safeInternalPath(searchParams.get('voltar'))
  const { data: cv, isLoading } = useCvVariant(id)
  const saveCv = useSaveCvVariant()
  const { data: categories } = useCategories()
  const [interests, setInterests] = React.useState<string[]>([])

  const [title, setTitle] = React.useState('')
  const [contactEmail, setContactEmail] = React.useState('')
  const [contactPhone, setContactPhone] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [cep, setCep] = React.useState('')
  const [summaryHtml, setSummaryHtml] = React.useState('')
  const [experiences, setExperiences] = React.useState<CvExperience[]>([])
  const [education, setEducation] = React.useState<CvEducation[]>([])
  const [skills, setSkills] = React.useState('')
  const [isDefault, setIsDefault] = React.useState(false)

  React.useEffect(() => {
    if (!cv) return
    setTitle(cv.title)
    setContactEmail(cv.contact_email ?? profile?.email ?? '')
    setContactPhone(maskPhone(cv.contact_phone ?? profile?.phone ?? ''))
    setInterests(cv.categories ?? [])
    setAddress(cv.address ?? '')
    setSummaryHtml(cv.summary_html ?? '')
    setExperiences(cv.experiences)
    setEducation(cv.education)
    setSkills(cv.skills.join(', '))
    setIsDefault(cv.is_default)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cv])

  const handleSave = async () => {
    if (!user || !id) return
    await saveCv.mutateAsync({
      id,
      candidato_id: user.id,
      title,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      address: address || null,
      summary_html: summaryHtml,
      experiences,
      education,
      skills: skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      ...(interests.length > 0 || (cv?.categories?.length ?? 0) > 0 ? { categories: interests } : {}),
      is_default: isDefault,
    })
    navigate(voltar ?? '/candidato/cv')
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando currículo…</p>

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar currículo</CardTitle>
          <CardDescription>{profile?.full_name}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Nome deste currículo</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            Definir como currículo padrão
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contatos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactEmail">E-mail</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactPhone">Telefone</Label>
            <PhoneInput id="contactPhone" value={contactPhone} onChange={setContactPhone} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endereço</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 sm:max-w-[50%]">
            <Label htmlFor="cep">CEP (preenche o endereço)</Label>
            <CepField
              id="cep"
              value={cep}
              onChange={setCep}
              onFound={(found) => setAddress(`${addressLineFromCep(found)}, ${found.city}/${found.uf}`.replace(/^, /, ''))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, bairro, cidade/UF"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Áreas de interesse</CardTitle>
          <CardDescription>Em que tipo de vaga você quer trabalhar? Escolha quantas quiser.</CardDescription>
        </CardHeader>
        <CardContent>
        <ProfilePhotoField />
          <div role="group" aria-label="Áreas de interesse" className="flex flex-wrap gap-2">
            {activeFor(categories, 'vaga').map((category) => {
              const selected = interests.includes(category.slug)
              return (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setInterests((current) =>
                      selected ? current.filter((slug) => slug !== category.slug) : [...current, category.slug],
                    )
                  }
                  className={cn(
                    'h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                    selected
                      ? 'border-brand-ink bg-brand-ink text-white'
                      : 'bg-card text-foreground hover:border-primary/50',
                  )}
                >
                  {category.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor value={summaryHtml} onChange={setSummaryHtml} placeholder="Fale sobre sua experiência…" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experiência profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperienceEditor value={experiences} onChange={setExperiences} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formação acadêmica</CardTitle>
        </CardHeader>
        <CardContent>
          <EducationEditor value={education} onChange={setEducation} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Habilidades</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="skills" className="sr-only">
            Habilidades
          </Label>
          <Input
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Separadas por vírgula"
          />
        </CardContent>
      </Card>

      {voltar && (
        <p className="text-sm text-muted-foreground">Depois de salvar, você volta para a vaga e termina a candidatura.</p>
      )}
      <Button onClick={handleSave} variant="cta" size="lg" disabled={saveCv.isPending}>
        {saveCv.isPending ? 'Salvando…' : voltar ? 'Salvar e voltar para a vaga' : 'Salvar currículo'}
      </Button>
    </div>
  )
}
