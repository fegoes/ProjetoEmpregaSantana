import { ImageUploadField } from '@/components/ImageUploadField'
import { uploadEmpresaLogo } from '@/lib/storage'
import { safeInternalPath } from '@/lib/utils'
import { CategorySelect } from '@/components/CategorySelect'
import { RecordTypeSelect } from '@/components/RecordTypeSelect'
import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CnpjInput } from '@/components/fields/MaskedInputs'
import { SegmentSelect } from '@/components/SegmentSelect'
import { FormError } from '@/components/auth/FormError'
import { isValidCnpj } from '@/lib/masks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function EmpresaOnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const [params] = useSearchParams()
  const returnTo = safeInternalPath(params.get('voltar'))
  const navigate = useNavigate()
  const [companyId]=React.useState(()=>crypto.randomUUID())
  const [logo,setLogo]=React.useState<string|null>(null)
  const [uploads,setUploads]=React.useState(0)
  const uploading=(busy:boolean)=>setUploads(n=>Math.max(0,n+(busy?1:-1)))
  const [nomeFantasia, setNomeFantasia] = React.useState('')
  const [cnpj, setCnpj] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [typeSlug, setTypeSlug] = React.useState('')
  const [sector, setSector] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user||uploads>0) return
    setError(null)
    if (cnpj && !isValidCnpj(cnpj)) {
      setError('Esse CNPJ não parece válido. Confira os 14 números.')
      return
    }
    setLoading(true)

    const { error: insertError } = await supabase.from('empresas').insert({
      id:companyId,
      logo_url:logo,
      owner_id: user.id,
      nome_fantasia: nomeFantasia,
      cnpj: cnpj || null,
      sector: sector || null,
      category: category || null,
      type_slug: typeSlug || null,
    })

    setLoading(false)
    if (insertError) {
      setError(
        insertError.code === '23505'
          ? 'Já existe uma empresa cadastrada com esse CNPJ. Se ela é sua, fale com o suporte.'
          : 'Não foi possível cadastrar agora. Confira sua conexão e tente de novo.',
      )
      return
    }
    await refreshProfile()
    navigate(returnTo ?? '/empresa/painel')
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Cadastre sua empresa</CardTitle>
        <CardDescription>
          A empresa fica com status "pendente" até verificação do admin, mas você já pode gerenciar vagas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nomeFantasia">Nome da empresa</Label>
            <Input id="nomeFantasia" required value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cnpj">CNPJ</Label>
            <CnpjInput id="cnpj" value={cnpj} onChange={setCnpj} />
          </div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="company-category">Categoria da empresa</Label><CategorySelect id="company-category" kind="empresa" value={category} onChange={setCategory} /></div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="company-type">Tipo de empresa</Label><RecordTypeSelect id="company-type" kind="empresa" value={typeSlug} onChange={setTypeSlug} /></div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sector">Segmento</Label>
            <SegmentSelect id="sector" value={sector} onChange={setSector} />
          </div>
          <ImageUploadField disabled={loading} label="Logo da empresa" purpose="logo" currentUrl={logo} onUpload={file=>uploadEmpresaLogo(file,companyId)} onUploaded={setLogo} onRemove={()=>setLogo(null)} onUploadingChange={uploading} />
          {error && <FormError>{error}</FormError>}
          <Button type="submit" variant="cta" disabled={loading||uploads>0}>
            {loading ? 'Criando…' : 'Criar empresa'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
