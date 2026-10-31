import { AdminModal } from './AdminModal'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAdminUsuarios } from '@/hooks/useAdmin'
import type { ProcessoComEtapas } from '@/hooks/useProcessos'
import { AdminFields, type AdminField, type AdminValues } from './AdminFields'
import { AdminAviso } from './AdminKit'
import { Button } from '@/components/ui/button'
import { adminError } from '@/lib/adminUsers'

export function AdminProcessManager({processes}:{processes:ProcessoComEtapas[]}) {
  const client=useQueryClient()
  const users=useAdminUsuarios()
  const [editing,setEditing]=useState<'new'|ProcessoComEtapas|null>(null)
  const [selected,setSelected]=useState('')
  const [form,setForm]=useState<AdminValues>({origem:'candidatura',titulo:'',status:'em_andamento',etapa_id:'',motivo:'reprovado'})
  const [feedback,setFeedback]=useState('')
  const options=useQuery({queryKey:['admin','process-options'],enabled:editing==='new',queryFn:async()=>{const [companies,jobs,professionals,cvs]=await Promise.all([supabase.from('empresas').select('id,nome_fantasia'),supabase.from('vagas').select('id,title,empresa_id').not('empresa_id','is',null),supabase.from('autonomo_profiles').select('id,headline'),supabase.from('cv_variants').select('id,candidato_id,title')]);for(const q of [companies,jobs,professionals,cvs])if(q.error)throw q.error;return {companies:companies.data??[],jobs:jobs.data??[],professionals:professionals.data??[],cvs:cvs.data??[]}}})
  const manage=useMutation({mutationFn:async(action:'create'|'update'|'delete')=>{const {error}=await supabase.rpc('admin_manage_process',{p_action:action,p_id:editing&&editing!=='new'?editing.id:selected||null,p_data:form});if(error)throw error},onSuccess:async()=>{setEditing(null);setSelected('');setFeedback('Operação concluída. A lista foi atualizada.');await client.invalidateQueries()}})
  const name=(id:string)=>users.data?.find(u=>u.id===id)?.full_name??users.data?.find(u=>u.id===id)?.email??'Pessoa'
  let fields:AdminField[]
  if(editing==='new')fields=[{key:'origem',label:'Tipo de processo',type:'select',required:true,options:[{value:'candidatura',label:'Seleção para uma vaga'},{value:'autonomo',label:'Contratação de autônomo'}]},...(form.origem==='candidatura'?[
    {key:'vaga_id',label:'Vaga da empresa',type:'select' as const,required:true,options:options.data?.jobs.map(v=>({value:v.id,label:v.title}))??[]},
    {key:'cv_id',label:'Candidato e currículo',type:'select' as const,required:true,options:options.data?.cvs.map(c=>({value:c.id,label:`${name(c.candidato_id)} · ${c.title}`}))??[]},
  ]:[{key:'empresa_id',label:'Empresa',type:'select' as const,required:true,options:options.data?.companies.map(c=>({value:c.id,label:c.nome_fantasia}))??[]},{key:'pessoa_id',label:'Profissional autônomo',type:'select' as const,required:true,options:options.data?.professionals.map(p=>({value:p.id,label:`${name(p.id)} · ${p.headline??''}`}))??[]},{key:'titulo',label:'Título do acompanhamento'}])]
  else fields=[{key:'titulo',label:'Título do acompanhamento',required:true},{key:'status',label:'Situação',type:'select',required:true,options:[{value:'em_andamento',label:'Em andamento'},{value:'contratado',label:'Contratado'},{value:'encerrado',label:'Encerrado'}]},
    {key:'etapa_id',label:'Etapa atual',type:'select',required:true,options:editing?.etapas.map(e=>({value:e.id,label:e.titulo}))??[]},
    ...(form.status==='encerrado'?[{key:'motivo',label:'Motivo do encerramento',type:'select' as const,required:true,options:[{value:'reprovado',label:'Reprovação'},{value:'desistencia',label:'Desistência'}]}]:[])]
  return <section className="space-y-4 rounded-xl border bg-card p-5"><h2 className="font-semibold">Gestão administrativa da seleção</h2><p className="text-sm text-muted-foreground">Alterações de situação e etapa são registradas na conversa do processo e atualizam a candidatura associada. Para criar uma seleção de vaga, o candidato precisa ter um currículo cadastrado.</p>
    {feedback&&<p role="status" className="text-sm text-primary">{feedback}</p>}{manage.isError&&editing===null&&<AdminAviso>{adminError(manage.error)}</AdminAviso>}
    {editing===null?<><Button variant="cta" onClick={()=>{setEditing('new');setForm({origem:'candidatura',titulo:'',status:'em_andamento',etapa_id:'',motivo:'reprovado'});manage.reset()}}>Novo processo</Button><div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"><select aria-label="Processo para editar ou excluir" className="min-h-11 w-full min-w-0 rounded-md border bg-card px-3 text-sm sm:flex-1" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Selecione um processo existente…</option>{processes.map(p=><option key={p.id} value={p.id}>{p.pessoa_nome} · {p.empresa_nome} · {p.titulo}</option>)}</select><Button variant="outline" disabled={!selected} onClick={()=>{const p=processes.find(p=>p.id===selected);if(p){setEditing(p);setForm({titulo:p.titulo,status:p.status,etapa_id:p.etapa_atual_id??'',motivo:p.motivo??'reprovado'});manage.reset()}}}>Editar</Button><Button variant="ghost" disabled={!selected||manage.isPending} onClick={()=>{if(window.confirm('Excluir o processo, a conversa, as etapas e a candidatura associada permanentemente? Os documentos deixarão de estar acessíveis por este acompanhamento.'))manage.mutate('delete')}}>Excluir</Button></div></>:<AdminModal open onClose={()=>setEditing(null)} busy={manage.isPending} title={editing==='new'?'Novo processo':'Editar situação e etapa'} description="As alterações atualizam o acompanhamento e são registradas na conversa."><form className="space-y-5" onSubmit={e=>{e.preventDefault();e.stopPropagation();if(window.confirm('Salvar esta intervenção administrativa no processo?'))manage.mutate(editing==='new'?'create':'update')}}>
      {manage.isError&&<AdminAviso>{adminError(manage.error)}</AdminAviso>}
      {options.isError&&editing==='new'&&<AdminAviso>Não foi possível carregar as opções. <button type="button" className="underline" onClick={()=>options.refetch()}>Tentar novamente</button></AdminAviso>}
      <fieldset disabled={manage.isPending||(editing==='new'&&(options.isLoading||options.isError))}><AdminFields fields={fields} values={form} set={(k,v)=>setForm(old=>({...old,[k]:v}))} /></fieldset><div className="flex flex-wrap gap-3"><Button variant="cta" disabled={manage.isPending||(editing==='new'&&(options.isLoading||options.isError))}>{manage.isPending?'Salvando…':'Salvar processo'}</Button><Button type="button" variant="outline" disabled={manage.isPending} onClick={()=>setEditing(null)}>Cancelar</Button></div>
    </form></AdminModal>}
  </section>
}
