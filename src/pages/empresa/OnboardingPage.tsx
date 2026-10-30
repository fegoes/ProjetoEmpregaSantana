import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CnpjInput } from '@/components/fields/MaskedInputs'
import { FormError } from '@/components/auth/FormError'
import { isValidCnpj } from '@/lib/masks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function EmpresaOnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [nomeFantasia, setNomeFantasia] = React.useState('')
  const [cnpj, setCnpj] = React.useState('')
  const [sector, setSector] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    if (cnpj && !isValidCnpj(cnpj)) {
      setError('Esse CNPJ não parece válido. Confira os 14 números.')
      return
    }
    setLoading(true)

    const { error: insertError } = await supabase.from('empresas').insert({
      owner_id: user.id,
      nome_fantasia: nomeFantasia,
      cnpj: cnpj || null,
      sector: sector || null,
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
    navigate('/empresa/painel')
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sector">Setor</Label>
            <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
          </div>
          {error && <FormError>{error}</FormError>}
          <Button type="submit" variant="cta" disabled={loading}>
            {loading ? 'Criando…' : 'Criar empresa'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
