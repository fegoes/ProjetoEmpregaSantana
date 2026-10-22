import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
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
  const { requestPasswordReset } = useAuth()
  const toggleActive = useToggleActive()
  const deleteUser = useDeleteUser()
  const [passwordTarget,setPasswordTarget] = React.useState<{id:string;name:string}|null>(null)
  const [password,setPassword] = React.useState('')
  const [confirmation,setConfirmation] = React.useState('')
  const [manualMessage,setManualMessage] = React.useState('')
  const manual = useMutation({mutationFn:async()=>{const {data,error}=await supabase.functions.invoke<{ok:boolean;auditPending?:boolean;error?:string}>('admin-password',{body:{userId:passwordTarget?.id,password}});if(error||data?.ok!==true)throw new Error('Não foi possível alterar. Confira sua sessão, a senha e a disponibilidade do serviço.');return data},onSuccess:(data)=>{setPassword('');setConfirmation('');setPasswordTarget(null);setManualMessage('Nova senha definida. Nenhum link de redefinição foi solicitado por e-mail.'+(data.auditPending?' A confirmação do registro de auditoria ficou pendente.':'')) }})
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [resetSentFor, setResetSentFor] = React.useState<string | null>(null)
  const [resetError, setResetError] = React.useState<string | null>(null)

  const handleSendReset = async (id: string, email: string | null) => {
    if (!email) return
    setResetError(null)
    setResetSentFor(null)
    const { error } = await requestPasswordReset(email)
    if (error) {
      setResetError(error)
      return
    }
    setResetSentFor(id)
  }

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
      <p className="text-sm text-muted-foreground">Contas criadas pela plataforma não recebem acesso administrativo. Essa permissão é definida fora deste cadastro, apenas para operadores autorizados.</p>
      {manualMessage&&<p role="status" className="text-sm text-primary">{manualMessage}</p>}
      {passwordTarget&&<form className="max-w-xl space-y-4 rounded-xl border bg-card p-5" onSubmit={e=>{e.preventDefault();if(password!==confirmation)return;manual.mutate()}}><h2 className="font-bold">Definir senha para {passwordTarget.name}</h2><p className="text-sm text-muted-foreground">A nova senha substitui a anterior sem solicitar um link por e-mail.</p><Label htmlFor="manual-password">Nova senha</Label><p id="manual-password-help" className="text-xs text-muted-foreground">Use entre 12 e 128 caracteres. Combine palavras para criar uma senha longa e exclusiva.</p><Input aria-describedby="manual-password-help" id="manual-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} disabled={manual.isPending} onChange={e=>setPassword(e.target.value)} /><Label htmlFor="confirm-password">Confirmar nova senha</Label><Input id="confirm-password" type="password" autoComplete="new-password" required value={confirmation} disabled={manual.isPending} onChange={e=>setConfirmation(e.target.value)} />{confirmation&&password!==confirmation&&<p role="alert" className="text-sm text-destructive">As senhas precisam ser iguais.</p>}{manual.isError&&<p role="alert" className="text-sm text-destructive">Não foi possível definir a senha. Confira sua sessão, a política de senhas e o serviço de administração.</p>}<div className="flex flex-wrap gap-3"><Button variant="cta" disabled={manual.isPending||password.length<12||password!==confirmation}>{manual.isPending?'Alterando…':'Definir nova senha'}</Button><Button type="button" variant="outline" disabled={manual.isPending} onClick={()=>{setPasswordTarget(null);setPassword('');setConfirmation('');manual.reset()}}>Cancelar</Button></div></form>}
      {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
      {resetError && <p className="text-sm text-destructive">{resetError}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      <div className="flex flex-col gap-2">
        {usuarios?.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex flex-col items-start justify-between gap-4 py-3 xl:flex-row">
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
              <div className="flex flex-wrap items-center justify-end gap-2">
                {resetSentFor === u.id && <span className="text-xs text-muted-foreground">Link enviado</span>}
                <Button size="sm" variant="outline" onClick={() => handleSendReset(u.id, u.email)}>
                  Enviar e-mail de redefinição
                </Button>
                <Button size="sm" variant="outline" disabled={manual.isPending} onClick={()=>{setPasswordTarget({id:u.id,name:u.full_name??u.email??'Usuário'});setPassword('');setConfirmation('');manual.reset();setManualMessage('');window.scrollTo({top:0})}}>Definir senha manualmente</Button>
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
