import * as React from 'react'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { supabase } from '@/lib/supabase'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EmpresaPerfilPage() {
  const { empresa, refresh } = useEmpresa()
  const [nomeFantasia, setNomeFantasia] = React.useState(empresa?.nome_fantasia ?? '')
  const [sector, setSector] = React.useState(empresa?.sector ?? '')
  const [website, setWebsite] = React.useState(empresa?.website ?? '')
  const [descriptionHtml, setDescriptionHtml] = React.useState(empresa?.description_html ?? '')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!empresa) return
    setNomeFantasia(empresa.nome_fantasia)
    setSector(empresa.sector ?? '')
    setWebsite(empresa.website ?? '')
    setDescriptionHtml(empresa.description_html ?? '')
  }, [empresa])

  if (!empresa) return <p className="text-sm text-muted-foreground">Carregando…</p>

  const handleSave = async () => {
    setSaving(true)
    await supabase
      .from('empresas')
      .update({ nome_fantasia: nomeFantasia, sector, website, description_html: descriptionHtml })
      .eq('id', empresa.id)
    await refresh()
    setSaving(false)
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Perfil da empresa</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nomeFantasia">Nome</Label>
          <Input id="nomeFantasia" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sector">Setor</Label>
          <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website">Site</Label>
          <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Sobre a empresa</Label>
          <RichTextEditor value={descriptionHtml} onChange={setDescriptionHtml} />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  )
}
