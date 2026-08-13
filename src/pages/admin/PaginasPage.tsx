import * as React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAllPaginasInstitucionais, useSavePaginaInstitucional } from '@/hooks/usePaginasInstitucionais'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

function PaginaEditor({
  pagina,
}: {
  pagina: { id: string; slug: string; title: string; content_html: string }
}) {
  const { user } = useAuth()
  const saveMutation = useSavePaginaInstitucional()
  const [title, setTitle] = React.useState(pagina.title)
  const [contentHtml, setContentHtml] = React.useState(pagina.content_html)
  const [saved, setSaved] = React.useState(false)

  const handleSave = async () => {
    if (!user) return
    setSaved(false)
    await saveMutation.mutateAsync({ id: pagina.id, title, contentHtml, userId: user.id })
    setSaved(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base capitalize">{pagina.slug}</CardTitle>
        <CardDescription>Visível publicamente em /{pagina.slug}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`title-${pagina.id}`}>Título</Label>
          <Input id={`title-${pagina.id}`} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Conteúdo</Label>
          <RichTextEditor value={contentHtml} onChange={setContentHtml} />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
          {saved && <p className="text-sm text-muted-foreground">Alterações salvas.</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminPaginasPage() {
  const { data: paginas, isLoading } = useAllPaginasInstitucionais()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Páginas institucionais</h1>
        <p className="text-sm text-muted-foreground">
          Edite o conteúdo de Sobre, Termos e Privacidade sem precisar mexer em código.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="flex flex-col gap-6">
        {paginas?.map((pagina) => (
          <PaginaEditor key={pagina.id} pagina={pagina} />
        ))}
      </div>
    </div>
  )
}
