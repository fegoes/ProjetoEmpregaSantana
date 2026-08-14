import * as React from 'react'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { supabase } from '@/lib/supabase'
import { uploadEmpresaInteriorPhoto, uploadEmpresaLogo } from '@/lib/storage'
import { RichTextEditor } from '@/components/RichTextEditor'
import { ImageUploadField } from '@/components/ImageUploadField'
import { PhotoGalleryField } from '@/components/PhotoGalleryField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

function VisibilityToggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      Visível no perfil público
    </label>
  )
}

export default function EmpresaPerfilPage() {
  const { empresa, refresh } = useEmpresa()
  const [nomeFantasia, setNomeFantasia] = React.useState(empresa?.nome_fantasia ?? '')
  const [sector, setSector] = React.useState(empresa?.sector ?? '')
  const [website, setWebsite] = React.useState(empresa?.website ?? '')
  const [descriptionHtml, setDescriptionHtml] = React.useState(empresa?.description_html ?? '')
  const [logoUrl, setLogoUrl] = React.useState(empresa?.logo_url ?? null)

  const [address, setAddress] = React.useState(empresa?.address ?? '')
  const [addressVisible, setAddressVisible] = React.useState(empresa?.address_visible ?? true)
  const [missionHtml, setMissionHtml] = React.useState(empresa?.mission_vision_values_html ?? '')
  const [missionVisible, setMissionVisible] = React.useState(empresa?.mission_visible ?? true)
  const [orgChartHtml, setOrgChartHtml] = React.useState(empresa?.org_chart_html ?? '')
  const [orgChartVisible, setOrgChartVisible] = React.useState(empresa?.org_chart_visible ?? true)
  const [interiorPhotos, setInteriorPhotos] = React.useState<string[]>(empresa?.interior_photo_urls ?? [])
  const [interiorPhotosVisible, setInteriorPhotosVisible] = React.useState(
    empresa?.interior_photos_visible ?? true,
  )
  const [employeeCount, setEmployeeCount] = React.useState(empresa?.employee_count ?? '')
  const [employeeCountVisible, setEmployeeCountVisible] = React.useState(
    empresa?.employee_count_visible ?? true,
  )

  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (!empresa) return
    setNomeFantasia(empresa.nome_fantasia)
    setSector(empresa.sector ?? '')
    setWebsite(empresa.website ?? '')
    setDescriptionHtml(empresa.description_html ?? '')
    setLogoUrl(empresa.logo_url)
    setAddress(empresa.address ?? '')
    setAddressVisible(empresa.address_visible)
    setMissionHtml(empresa.mission_vision_values_html ?? '')
    setMissionVisible(empresa.mission_visible)
    setOrgChartHtml(empresa.org_chart_html ?? '')
    setOrgChartVisible(empresa.org_chart_visible)
    setInteriorPhotos(empresa.interior_photo_urls)
    setInteriorPhotosVisible(empresa.interior_photos_visible)
    setEmployeeCount(empresa.employee_count ?? '')
    setEmployeeCountVisible(empresa.employee_count_visible)
  }, [empresa])

  if (!empresa) return <p className="text-sm text-muted-foreground">Carregando…</p>

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await supabase
      .from('empresas')
      .update({
        nome_fantasia: nomeFantasia,
        sector,
        website,
        description_html: descriptionHtml,
        logo_url: logoUrl,
        address,
        address_visible: addressVisible,
        mission_vision_values_html: missionHtml,
        mission_visible: missionVisible,
        org_chart_html: orgChartHtml,
        org_chart_visible: orgChartVisible,
        interior_photo_urls: interiorPhotos,
        interior_photos_visible: interiorPhotosVisible,
        employee_count: employeeCount,
        employee_count_visible: employeeCountVisible,
      })
      .eq('id', empresa.id)
    await refresh()
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Identidade</CardTitle>
          <CardDescription>Como sua empresa aparece nas vagas e no diretório</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ImageUploadField
            label="Logo"
            currentUrl={logoUrl}
            onUpload={(file) => uploadEmpresaLogo(file, empresa.id)}
            onUploaded={setLogoUrl}
            hint="PNG ou JPG, até 5 MB."
          />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endereço</CardTitle>
          <CardDescription>Onde sua empresa está localizada</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Rua, número, bairro, cidade — UF"
          />
          <VisibilityToggle checked={addressVisible} onChange={setAddressVisible} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Missão, visão e valores</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <RichTextEditor value={missionHtml} onChange={setMissionHtml} placeholder="O que guia sua empresa…" />
          <VisibilityToggle checked={missionVisible} onChange={setMissionVisible} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organograma</CardTitle>
          <CardDescription>Descreva a estrutura da empresa em texto</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <RichTextEditor
            value={orgChartHtml}
            onChange={setOrgChartHtml}
            placeholder="Ex.: Diretoria > Gerências > Equipes…"
          />
          <VisibilityToggle checked={orgChartVisible} onChange={setOrgChartVisible} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fotos internas</CardTitle>
          <CardDescription>Mostre o dia a dia e o ambiente de trabalho</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <PhotoGalleryField
            label=""
            photos={interiorPhotos}
            onUpload={(file) => uploadEmpresaInteriorPhoto(file, empresa.id)}
            onChange={setInteriorPhotos}
          />
          <VisibilityToggle checked={interiorPhotosVisible} onChange={setInteriorPhotosVisible} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Número de funcionários</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Input
            value={employeeCount}
            onChange={(e) => setEmployeeCount(e.target.value)}
            placeholder="Ex.: 50-100 funcionários"
          />
          <VisibilityToggle checked={employeeCountVisible} onChange={setEmployeeCountVisible} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} variant="cta" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </Button>
        {saved && <p className="text-sm text-muted-foreground">Perfil atualizado.</p>}
      </div>
    </div>
  )
}
