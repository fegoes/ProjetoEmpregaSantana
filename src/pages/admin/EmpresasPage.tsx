import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { EmpresaStatus } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'

function useAllEmpresas() {
  return useQuery({
    queryKey: ['admin', 'empresas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

function useUpdateEmpresaStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EmpresaStatus }) => {
      const { error } = await supabase.from('empresas').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'empresas'] }),
  })
}

export default function AdminEmpresasPage() {
  const { data: empresas, isLoading } = useAllEmpresas()
  const updateStatus = useUpdateEmpresaStatus()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Cadastro de Empresas</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      <div className="flex flex-col gap-3">
        {empresas?.map((empresa) => (
          <Card key={empresa.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">
                <Link to={`/admin/empresas/${empresa.id}`} className="hover:underline">
                  {empresa.nome_fantasia}
                </Link>
              </CardTitle>
              <StatusBadge status={empresa.status} />
            </CardHeader>
            <CardContent className="flex gap-2">
              {empresa.status !== 'active' && (
                <Button size="sm" onClick={() => updateStatus.mutate({ id: empresa.id, status: 'active' })}>
                  Ativar
                </Button>
              )}
              {empresa.status !== 'suspended' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateStatus.mutate({ id: empresa.id, status: 'suspended' })}
                >
                  Suspender
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
