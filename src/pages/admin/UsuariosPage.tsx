import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function useAllUsers() {
  return useQuery({
    queryKey: ['admin', 'usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_roles ( role )')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

function useToggleAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isAdmin }: { id: string; isAdmin: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_admin: isAdmin }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] }),
  })
}

export default function AdminUsuariosPage() {
  const { data: usuarios, isLoading } = useAllUsers()
  const toggleAdmin = useToggleAdmin()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Cadastro de usuários</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      <div className="flex flex-col gap-2">
        {usuarios?.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{u.full_name ?? u.email}</p>
                <div className="mt-1 flex gap-1">
                  {u.user_roles?.map((r) => (
                    <Badge key={r.role} variant="secondary">
                      {r.role}
                    </Badge>
                  ))}
                  {u.is_admin && <Badge>admin</Badge>}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleAdmin.mutate({ id: u.id, isAdmin: !u.is_admin })}
              >
                {u.is_admin ? 'Remover admin' : 'Tornar admin'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
