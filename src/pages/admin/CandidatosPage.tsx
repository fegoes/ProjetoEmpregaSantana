import { AdminAvatarField } from '@/components/admin/AdminAvatarField'
import { useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAdminUsuarios } from '@/hooks/useAdmin'
import { AdminHeader, AdminAviso, AdminList, AdminRow, Tag } from '@/components/admin/AdminKit'
import { AdminFields, type AdminValues } from '@/components/admin/AdminFields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminError } from '@/lib/adminUsers'
import type { Database } from '@/types/database'
import { matchesSearch } from '@/lib/utils'

type Candidate = Database['public']['Tables']['candidato_profiles']['Row']
function Editor({ candidate, existingIds }: { candidate?: Candidate; existingIds: string[] }) {
  const users = useAdminUsuarios()
  const client = useQueryClient()
  const navigate = useNavigate()
  const [values,setValues] = useState<AdminValues>({ account_id:candidate?.id??'',headline:candidate?.headline??'',desired_role:candidate?.desired_role??'',desired_salary_min:candidate?.desired_salary_min?.toString()??'',bio_html:candidate?.bio_html??'',availability:candidate?.availability??'',linkedin_url:candidate?.linkedin_url??'',portfolio_url:candidate?.portfolio_url??'',pretensao_visible:candidate?.pretensao_visible??false })
  const [avatar,setAvatar]=useState<string|null|undefined>(undefined)
  const [uploads,setUploads]=useState(0)
  const uploading=(busy:boolean)=>setUploads(n=>Math.max(0,n+(busy?1:-1)))
  const save = useMutation({mutationFn:async()=>{const {error}=await supabase.rpc('admin_save_candidate',{p_user_id:String(values.account_id),p_data:values});if(error)throw error;if(avatar!==undefined){const photo=await supabase.from('profiles').update({avatar_url:avatar}).eq('id',String(values.account_id)).select('id').single();if(photo.error)throw photo.error}},onSuccess:async()=>{await client.invalidateQueries();navigate('/admin/candidatos')}})
  return <form className="max-w-3xl space-y-6 rounded-xl border bg-card p-5" onSubmit={e=>{e.preventDefault();if(!uploads)save.mutate()}}>
    <p className="text-sm text-muted-foreground">Selecione uma conta existente ou <Link to="/admin/usuarios/novo" className="font-medium text-primary underline">crie um usuário</Link> primeiro. Criar o perfil habilita a área de candidato para essa conta.</p>
    {users.isError && <AdminAviso>Não foi possível carregar os usuários. <button className="underline" onClick={()=>users.refetch()}>Tentar novamente</button></AdminAviso>}
    <fieldset disabled={save.isPending || users.isLoading || users.isError}><AdminFields values={values} set={(k,v)=>{if(k==='account_id'&&values.account_id&&values.account_id!==v)setAvatar(undefined);setValues(old=>({...old,[k]:v}))}} fields={[
      {key:'account_id',label:'Usuário',type:'select',required:true,disabled:Boolean(candidate),options:(users.data??[]).filter(u=>u.id===String(values.account_id)||u.id===candidate?.id||!existingIds.includes(u.id)).map(u=>({value:u.id,label:[u.full_name,u.email].filter(Boolean).join(' · ')}))},
      {key:'headline',label:'Título profissional',required:true},{key:'desired_role',label:'Cargo desejado'},
      {key:'desired_salary_min',label:'Pretensão salarial mínima (R$)',type:'number',min:0},{key:'availability',label:'Disponibilidade',type:'select',options:[{value:'imediata',label:'Imediata'},{value:'15_dias',label:'Em 15 dias'},{value:'30_dias',label:'Em 30 dias'},{value:'a_combinar',label:'A combinar'}]},
      {key:'linkedin_url',label:'LinkedIn',type:'url'},{key:'portfolio_url',label:'Portfólio',type:'url'},{key:'pretensao_visible',label:'Divulgar pretensão salarial',type:'checkbox'},{key:'bio_html',label:'Apresentação profissional',type:'rich'},
    ]} /></fieldset>
    <AdminAvatarField disabled={save.isPending} userId={String(values.account_id)||undefined} value={avatar} onChange={setAvatar} onUploadingChange={uploading} label="Foto do candidato" />
    {save.isError && <AdminAviso>{adminError(save.error)}</AdminAviso>}<div className="flex flex-wrap gap-3"><Button variant="cta" disabled={uploads>0||save.isPending||users.isLoading||users.isError}>{save.isPending?'Salvando…':'Salvar candidato'}</Button><Button asChild variant="outline"><Link to="/admin/candidatos">Cancelar</Link></Button></div>
  </form>
}
export default function CandidatosPage() {
  const {id}=useParams()
  const location=useLocation()
  const editing=Boolean(id)||location.pathname.endsWith('/novo')
  const users=useAdminUsuarios()
  const client=useQueryClient()
  const [search,setSearch]=useState('')
  const query=useQuery({queryKey:['admin','candidatos'],queryFn:async()=>{const {data,error}=await supabase.from('candidato_profiles').select('*').order('created_at',{ascending:false});if(error)throw error;return data}})
  const remove=useMutation({mutationFn:async(userId:string)=>{const {error}=await supabase.rpc('admin_delete_candidate',{p_user_id:userId});if(error)throw error},onSuccess:()=>client.invalidateQueries()})
  const candidate=query.data?.find(row=>row.id===id)
  return <div className="space-y-6"><AdminHeader title={editing?id?'Editar candidato':'Novo candidato':'Candidatos'} description="Perfis profissionais associados às contas de acesso." actions={!editing&&<Button asChild variant="cta"><Link to="/admin/candidatos/novo">Novo candidato</Link></Button>} />
    {(query.isLoading||users.isLoading)&&<p role="status">Carregando candidatos…</p>}
    {(query.isError||users.isError)&&<AdminAviso>Não foi possível carregar. <button className="underline" onClick={()=>{query.refetch();users.refetch()}}>Tentar novamente</button></AdminAviso>}
    {remove.isError&&<AdminAviso>{adminError(remove.error)}</AdminAviso>}
    {!query.isLoading&&!query.isError&&(editing ? !id||candidate ? <Editor key={id??'new'} candidate={candidate} existingIds={(query.data??[]).map(c=>c.id)} /> : <AdminAviso>Candidato não encontrado.</AdminAviso> : <><Input aria-label="Buscar candidatos" placeholder="Buscar por nome, e-mail ou cargo" value={search} onChange={e=>setSearch(e.target.value)} /><AdminList>{query.data?.filter(c=>{const u=users.data?.find(u=>u.id===c.id);return matchesSearch(search,u?.full_name,u?.email,c.headline,c.desired_role)}).map(c=>{const u=users.data?.find(u=>u.id===c.id);return <AdminRow key={c.id} title={u?.full_name??'Candidato'} subtitle={u?.email} meta={[c.headline,c.desired_role].filter(Boolean).join(' · ')} badges={<Tag>{c.availability??'Disponibilidade não informada'}</Tag>} actions={<><Button asChild variant="outline" size="sm"><Link to={`/admin/candidatos/${c.id}/editar`}>Consultar / editar</Link></Button><Button asChild variant="outline" size="sm"><Link to={`/admin/usuarios/${c.id}/editar`}>Conta</Link></Button><Button variant="ghost" size="sm" disabled={remove.isPending} onClick={()=>{if(window.confirm('Excluir o perfil de candidato? Currículos e candidaturas serão removidos. A conta de acesso e os demais perfis serão preservados.'))remove.mutate(c.id)}}>Excluir perfil</Button></>} />})}</AdminList>{!query.data?.length&&<p className="text-sm text-muted-foreground">Nenhum candidato cadastrado. Use “Novo candidato” para começar.</p>}</>)}
  </div>
}
