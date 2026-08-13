import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCvVariant, useSaveCvVariant } from '@/hooks/useCvVariants'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CvEditPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: cv, isLoading } = useCvVariant(id)
  const saveCv = useSaveCvVariant()

  const [title, setTitle] = React.useState('')
  const [summaryHtml, setSummaryHtml] = React.useState('')
  const [skills, setSkills] = React.useState('')
  const [isDefault, setIsDefault] = React.useState(false)

  React.useEffect(() => {
    if (!cv) return
    setTitle(cv.title)
    setSummaryHtml(cv.summary_html ?? '')
    setSkills(cv.skills.join(', '))
    setIsDefault(cv.is_default)
  }, [cv])

  const handleSave = async () => {
    if (!user || !id) return
    await saveCv.mutateAsync({
      id,
      candidato_id: user.id,
      title,
      summary_html: summaryHtml,
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
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Editar currículo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Nome deste currículo</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Resumo</Label>
          <RichTextEditor value={summaryHtml} onChange={setSummaryHtml} placeholder="Fale sobre sua experiência…" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
          <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          Definir como currículo padrão
        </label>

        <Button onClick={handleSave} disabled={saveCv.isPending}>
          {saveCv.isPending ? 'Salvando…' : 'Salvar currículo'}
        </Button>
      </CardContent>
    </Card>
  )
}
