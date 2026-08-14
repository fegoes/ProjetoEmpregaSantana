import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase.from('empresas').insert({
      owner_id: user.id,
      nome_fantasia: nomeFantasia,
      cnpj: cnpj || null,
      sector: sector || null,
    })

    setLoading(false)
    if (insertError) {
      setError(insertError.message)
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
            <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sector">Setor</Label>
            <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="cta" disabled={loading}>
            {loading ? 'Criando…' : 'Criar empresa'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
