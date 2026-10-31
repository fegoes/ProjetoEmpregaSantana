import { NewUserPhotoField, type NewUserPhotos } from '@/components/admin/NewUserPhotoField'
import { uploadProfilePhoto } from '@/lib/storage'
import { AdminAvatarField } from '@/components/admin/AdminAvatarField'
import { supabase } from '@/lib/supabase'
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
  const [avatar,setAvatar]=useState<string|null|undefined>(undefined)
  const [draftPhotos,setDraftPhotos]=useState<NewUserPhotos>({desktop:null,mobile:null})
  const [createdId,setCreatedId]=useState<string>()
  const [uploads,setUploads]=useState(0)
  const uploading=(busy:boolean)=>setUploads(n=>Math.max(0,n+(busy?1:-1)))
  const save = useMutation({ mutationFn: async () => {const result=await manageAdminUser({ ...values, action: account||createdId ? 'update' : 'create', userId: account?.id??createdId, roles: values.role ? [values.role] : [] });const target=account?.id??createdId??result.userId;if(target)setCreatedId(target);let photo=avatar
  if(!account&&draftPhotos.desktop){if(!target)throw new Error('Conta criada. Reabra o usuário pela lista para adicionar a foto.');photo=await uploadProfilePhoto(draftPhotos.desktop,target);if(draftPhotos.mobile){const mobile=await uploadProfilePhoto(draftPhotos.mobile,target);const variant=await supabase.from('image_variants').upsert({desktop_url:photo,mobile_url:mobile});if(variant.error)throw variant.error}}
  if(photo!==undefined){if(!target)throw new Error('Conta criada, mas não foi possível identificar o usuário para salvar a foto. Reabra a conta pela lista.');const {error}=await supabase.from('profiles').update({avatar_url:photo}).eq('id',target).select('id').single();if(error)throw error}return result}, onSettled: () => client.invalidateQueries(), onSuccess: () => navigate('/admin/usuarios') })
  return <form onSubmit={e => {e.preventDefault();if(!uploads)save.mutate()}} className="max-w-3xl space-y-6 rounded-xl border bg-card p-5 sm:p-6">
    <p className="text-sm text-muted-foreground">{account ? 'Atualize os dados da conta. Os perfis já existentes serão preservados.' : createdId?'A conta já foi criada. Salve novamente para concluir os dados e a foto. A senha inicial permanece válida.':'A conta criada aqui poderá entrar com o e-mail e a senha definidos. O e-mail será marcado como confirmado pela administração; nenhum convite será enviado.'}</p>
    <fieldset disabled={save.isPending} className="space-y-5"><AdminFields values={values} set={(key,value)=>setValues(v=>({...v,[key]:value}))} fields={[
      {key:'full_name',label:'Nome completo',required:true,maxLength:180},{key:'email',label:'E-mail de acesso',type:'email',required:true,maxLength:254},
      ...(!account&&!createdId ? [{key:'password',label:'Senha inicial',type:'password' as const,required:true,maxLength:128,hint:'Use entre 12 e 128 caracteres. Combine com a pessoa um meio seguro para entregar a senha.'}] : []),
      {key:'phone',label:'Telefone'},{key:'city',label:'Cidade'},{key:'state',label:'UF',type:'select',options:BRAZIL_STATES.map(value=>({value,label:value}))},
      {key:'role',label:account?'Adicionar perfil':'Perfil inicial',type:'select',options:[{value:'candidato',label:'Candidato'},{value:'autonomo',label:'Autônomo'},{value:'empresa_owner',label:'Empresa'}],hint:'Uma conta pode acumular perfis. O acesso de superadmin é concedido fora do cadastro público.'},
      ...(account?.id === user?.id ? [] : [{key:'is_active',label:'Conta ativa',type:'checkbox' as const}]),
    ]} /></fieldset>
    {account?<AdminAvatarField disabled={save.isPending} userId={account.id} value={avatar} onChange={setAvatar} onUploadingChange={uploading} />:<NewUserPhotoField disabled={save.isPending} value={draftPhotos} onChange={setDraftPhotos} onUploadingChange={uploading} />}
    {save.isError && <AdminAviso>{adminError(save.error)}</AdminAviso>}
    <div className="flex flex-wrap gap-3"><Button variant="cta" disabled={uploads>0 || save.isPending || (!account && String(values.password).length<12)}>{save.isPending?'Salvando…':account?'Salvar alterações':'Criar usuário'}</Button><Button asChild variant="outline" disabled={save.isPending}><Link to="/admin/usuarios">Cancelar</Link></Button></div>
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
