import * as React from 'react'
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

function useToggleActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] }),
  })
}

function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] }),
  })
}

export default function AdminUsuariosPage() {
  const { data: usuarios, isLoading } = useAllUsers()
  const toggleAdmin = useToggleAdmin()
  const toggleActive = useToggleActive()
  const deleteUser = useDeleteUser()
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const handleDelete = (id: string, nome: string) => {
    if (
      !window.confirm(
        `Excluir "${nome}" permanentemente? Currículos, candidaturas e perfil de autônomo dessa pessoa serão apagados junto. Essa ação não pode ser desfeita.`,
      )
    )
      return
    setDeleteError(null)
    deleteUser.mutate(id, {
      onError: (err) => {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('empresas')) {
          setDeleteError('Não foi possível excluir: essa pessoa é dona de uma empresa. Exclua a empresa primeiro.')
        } else if (message.includes('vagas')) {
          setDeleteError('Não foi possível excluir: essa pessoa tem vagas cadastradas em nome dela.')
        } else {
          setDeleteError('Não foi possível excluir esse usuário.')
        }
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Cadastro de usuários</h1>
      {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
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
                  {!u.is_active && <Badge variant="destructive">inativo</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleActive.mutate({ id: u.id, isActive: !u.is_active })}
                >
                  {u.is_active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleAdmin.mutate({ id: u.id, isAdmin: !u.is_admin })}
                >
                  {u.is_admin ? 'Remover admin' : 'Tornar admin'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(u.id, u.full_name ?? u.email ?? 'usuário')}
                  disabled={deleteUser.isPending}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
