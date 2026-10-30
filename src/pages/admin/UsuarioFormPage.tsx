import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminHeader, AdminAviso } from '@/components/admin/AdminKit'
import { AdminFields, type AdminValues } from '@/components/admin/AdminFields'
import { Button } from '@/components/ui/button'
import { useAdminUsuarios, type AdminUsuario } from '@/hooks/useAdmin'
import { adminError, manageAdminUser } from '@/lib/adminUsers'
import { BRAZIL_STATES } from '@/lib/adminForms'
import { useAuth } from '@/contexts/AuthContext'

function Editor({ account }: { account?: AdminUsuario }) {
  const navigate = useNavigate()
  const client = useQueryClient()
  const { user } = useAuth()
  const [values,setValues] = useState<AdminValues>({ full_name: account?.full_name ?? '', email: account?.email ?? '', phone: account?.phone ?? '', city: account?.city ?? '', state: account?.state ?? 'AL', is_active: account?.is_active ?? true, password: '', role: '' })
  const save = useMutation({ mutationFn: () => manageAdminUser({ ...values, action: account ? 'update' : 'create', userId: account?.id, roles: values.role ? [values.role] : [] }), onSettled: () => client.invalidateQueries(), onSuccess: () => navigate('/admin/usuarios') })
  return <form onSubmit={e => {e.preventDefault();save.mutate()}} className="max-w-3xl space-y-6 rounded-xl border bg-card p-5 sm:p-6">
    <p className="text-sm text-muted-foreground">{account ? 'Atualize os dados da conta. Os perfis já existentes serão preservados.' : 'A conta criada aqui poderá entrar com o e-mail e a senha definidos. O e-mail será marcado como confirmado pela administração; nenhum convite será enviado.'}</p>
    <fieldset disabled={save.isPending} className="space-y-5"><AdminFields values={values} set={(key,value)=>setValues(v=>({...v,[key]:value}))} fields={[
      {key:'full_name',label:'Nome completo',required:true,maxLength:180},{key:'email',label:'E-mail de acesso',type:'email',required:true,maxLength:254},
      ...(!account ? [{key:'password',label:'Senha inicial',type:'password' as const,required:true,maxLength:128,hint:'Use entre 12 e 128 caracteres. Combine com a pessoa um meio seguro para entregar a senha.'}] : []),
      {key:'phone',label:'Telefone'},{key:'city',label:'Cidade'},{key:'state',label:'UF',type:'select',options:BRAZIL_STATES.map(value=>({value,label:value}))},
      {key:'role',label:account?'Adicionar perfil':'Perfil inicial',type:'select',options:[{value:'candidato',label:'Candidato'},{value:'autonomo',label:'Autônomo'},{value:'empresa_owner',label:'Empresa'}],hint:'Uma conta pode acumular perfis. O acesso de superadmin é concedido fora do cadastro público.'},
      ...(account?.id === user?.id ? [] : [{key:'is_active',label:'Conta ativa',type:'checkbox' as const}]),
    ]} /></fieldset>
    {save.isError && <AdminAviso>{adminError(save.error)}</AdminAviso>}
    <div className="flex flex-wrap gap-3"><Button variant="cta" disabled={save.isPending || (!account && String(values.password).length<12)}>{save.isPending?'Salvando…':account?'Salvar alterações':'Criar usuário'}</Button><Button asChild variant="outline" disabled={save.isPending}><Link to="/admin/usuarios">Cancelar</Link></Button></div>
  </form>
}
export default function UsuarioFormPage() {
  const {id} = useParams()
  const query = useAdminUsuarios()
  const account = query.data?.find(row=>row.id===id)
  return <div className="space-y-6"><AdminHeader title={id?'Editar usuário':'Novo usuário'} description="Contas de acesso e perfis da plataforma." />
    {id && query.isLoading ? <p role="status">Carregando usuário…</p> : id && query.isError ? <AdminAviso>Não foi possível carregar. <button onClick={()=>query.refetch()} className="underline">Tentar novamente</button></AdminAviso> : id && !account ? <AdminAviso>Usuário não encontrado.</AdminAviso> : <Editor key={id??'new'} account={account} />}
  </div>
}
