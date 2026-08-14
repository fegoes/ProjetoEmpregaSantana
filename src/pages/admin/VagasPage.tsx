import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useDeleteVaga } from '@/hooks/useEmpresaVagas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function useAllVagas() {
  return useQuery({
    queryKey: ['admin', 'vagas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vagas')
        .select('*, empresas ( nome_fantasia )')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export default function AdminVagasPage() {
  const { data: vagas, isLoading } = useAllVagas()
  const deleteVaga = useDeleteVaga()
  const queryClient = useQueryClient()

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Excluir a vaga "${title}"? As candidaturas recebidas também serão apagadas. Essa ação não pode ser desfeita.`)) return
    deleteVaga.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'vagas'] }) },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Lista de Vagas</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      <div className="flex flex-col gap-2">
        {vagas?.map((vaga) => (
          <Card key={vaga.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{vaga.title}</CardTitle>
              <StatusBadge status={vaga.status} />
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              {vaga.empresas ? (
                <span>{vaga.empresas.nome_fantasia}</span>
              ) : (
                <Badge variant="destructive">Sem empresa cadastrada</Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(vaga.id, vaga.title)}
                disabled={deleteVaga.isPending}
              >
                Excluir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
