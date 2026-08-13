import { useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEmpresa } from '@/hooks/useEmpresas'
import { supabase } from '@/lib/supabase'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { StatusBadge } from '@/components/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminEmpresaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: empresa, isLoading } = useEmpresa(id)
  const queryClient = useQueryClient()

  const toggleVerified = useMutation({
    mutationFn: async () => {
      if (!empresa) return
      const { error } = await supabase
        .from('empresas')
        .update({ is_verified: !empresa.is_verified })
        .eq('id', empresa.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empresas', 'detail', id] }),
  })

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (!empresa) return <p className="text-sm text-muted-foreground">Empresa não encontrada.</p>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{empresa.nome_fantasia}</h1>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={empresa.status} />
          <Button size="sm" variant="outline" onClick={() => toggleVerified.mutate()}>
            {empresa.is_verified ? 'Remover verificação' : 'Marcar como verificada'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <span>CNPJ: {empresa.cnpj ?? '—'}</span>
          <span>Setor: {empresa.sector ?? '—'}</span>
          <span>Cidade: {[empresa.city, empresa.state].filter(Boolean).join(' — ') || '—'}</span>
          <span>Site: {empresa.website ?? '—'}</span>
        </CardContent>
      </Card>

      <RichTextRenderer html={empresa.description_html} />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Vagas ({empresa.vagas?.length ?? 0})</h2>
        <div className="flex flex-col gap-2">
          {empresa.vagas?.map((vaga) => (
            <Card key={vaga.id}>
              <CardContent className="flex items-center justify-between py-3">
                <span>{vaga.title}</span>
                <StatusBadge status={vaga.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
