import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCvVariant, useSaveCvVariant } from '@/hooks/useCvVariants'
import type { CvEducation, CvExperience } from '@/types/database'
import { RichTextEditor } from '@/components/RichTextEditor'
import { ExperienceEditor } from '@/components/ExperienceEditor'
import { EducationEditor } from '@/components/EducationEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function CvEditPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { data: cv, isLoading } = useCvVariant(id)
  const saveCv = useSaveCvVariant()

  const [title, setTitle] = React.useState('')
  const [contactEmail, setContactEmail] = React.useState('')
  const [contactPhone, setContactPhone] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [summaryHtml, setSummaryHtml] = React.useState('')
  const [experiences, setExperiences] = React.useState<CvExperience[]>([])
  const [education, setEducation] = React.useState<CvEducation[]>([])
  const [skills, setSkills] = React.useState('')
  const [isDefault, setIsDefault] = React.useState(false)

  React.useEffect(() => {
    if (!cv) return
    setTitle(cv.title)
    setContactEmail(cv.contact_email ?? profile?.email ?? '')
    setContactPhone(cv.contact_phone ?? profile?.phone ?? '')
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
      is_default: isDefault,
    })
    navigate('/candidato/cv')
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
            <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endereço</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Cidade, estado — ou endereço completo"
          />
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

      <Button onClick={handleSave} variant="cta" disabled={saveCv.isPending}>
        {saveCv.isPending ? 'Salvando…' : 'Salvar currículo'}
      </Button>
    </div>
  )
}
