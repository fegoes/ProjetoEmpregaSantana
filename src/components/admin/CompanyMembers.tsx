import { confirmAction } from '@/lib/confirmAction'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAdminUsuarios } from '@/hooks/useAdmin'
import { AdminAviso } from '@/components/admin/AdminKit'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { adminError } from '@/lib/adminUsers'

export function CompanyMembers({ companyId, ownerId }: { companyId: string; ownerId: string }) {
  const users=useAdminUsuarios()
  const client=useQueryClient()
  const [selected,setSelected]=useState('')
  const [feedback,setFeedback]=useState('')
  const query=useQuery({queryKey:['admin','members',companyId],queryFn:async()=>{const {data,error}=await supabase.from('empresa_members').select('*').eq('empresa_id',companyId).order('created_at');if(error)throw error;return data}})
  const save=useMutation({mutationFn:async({userId,remove=false}:{userId:string;remove?:boolean})=>{const {error}=await supabase.rpc('admin_set_company_member',{p_empresa:companyId,p_user:userId,p_remove:remove});if(error)throw error},onSuccess:async(_,action)=>{setSelected('');setFeedback(action.remove?'Vínculo removido.':'Usuário vinculado. A conta passa a ter acesso ao painel desta empresa.');await client.invalidateQueries()}})
  return <section className="space-y-4 rounded-xl border bg-card p-5"><h2 className="text-lg font-semibold">Usuários vinculados à empresa</h2><p className="max-w-2xl text-sm text-muted-foreground">Os usuários vinculados podem gerenciar vagas, candidaturas e dados desta empresa. O responsável principal permanece vinculado.</p>
    {(query.isLoading||users.isLoading)&&<p role="status">Carregando equipe…</p>}
    {(query.isError||users.isError)&&<AdminAviso>Não foi possível carregar a equipe. <button className="underline" onClick={()=>{query.refetch();users.refetch()}}>Tentar novamente</button></AdminAviso>}
    {feedback&&<p role="status" className="text-sm text-primary">{feedback}</p>}{save.isError&&<AdminAviso>{adminError(save.error)}</AdminAviso>}
    <ul className="divide-y">{query.data?.map(m=>{const u=users.data?.find(u=>u.id===m.user_id);return <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="break-words text-sm font-medium">{u?.full_name??u?.email??'Usuário'}</p><p className="break-words text-xs text-muted-foreground">{u?.email} · {m.user_id===ownerId?'Responsável principal':'Membro da equipe'}</p></div>{m.user_id!==ownerId&&<Button variant="outline" size="sm" disabled={save.isPending} onClick={async ()=>{if((await confirmAction('Remover o acesso deste usuário à empresa? A conta será preservada.')))save.mutate({userId:m.user_id,remove:true})}}>Desvincular</Button>}</li>})}</ul>
    <form className="flex flex-col items-start gap-3 sm:flex-row sm:items-end" onSubmit={e=>{e.preventDefault();setFeedback('');save.mutate({userId:selected})}}><div className="w-full min-w-0 space-y-2 sm:flex-1"><Label htmlFor="member-user">Vincular usuário existente</Label><select id="member-user" className="min-h-11 w-full rounded-md border bg-card px-3 text-sm" required value={selected} disabled={save.isPending||query.isLoading||users.isLoading||query.isError||users.isError} onChange={e=>setSelected(e.target.value)}><option value="">Selecione um usuário…</option>{users.data?.filter(u=>u.is_active&&!query.data?.some(m=>m.user_id===u.id)).map(u=><option key={u.id} value={u.id}>{u.full_name??u.email} · {u.email}</option>)}</select></div><Button variant="cta" disabled={!selected||save.isPending||query.isError||users.isError}>{save.isPending?'Salvando…':'Vincular usuário'}</Button></form>
  </section>
}
