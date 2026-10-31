import { AdminModal } from '@/components/admin/AdminModal'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { AdminFields, type AdminField, type AdminValues } from '@/components/admin/AdminFields'
import { AdminHeader, AdminAviso, AdminList, AdminRow, Tag } from '@/components/admin/AdminKit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminError } from '@/lib/adminUsers'
import { formatBRL } from '@/lib/format'
import { toLocalDateTime } from '@/lib/adminForms'

type Resource='plans'|'ads'
function Editor({resource,initial,onClose}:{resource:Resource;initial?:AdminValues;onClose:()=>void}) {
  const [values,setValues]=useState<AdminValues>(initial??(resource==='plans'?{name:'',audience:'empresa',price_cents:'0',billing_interval:'month',sort_order:'0',is_active:true,max_active_vagas:'',featured_placement:false,cv_database_access:false}:{subject_type:'vaga',subject_id:'',placement:'',starts_at:'',ends_at:'',status:'pending'}))
  const client=useQueryClient()
  const subjects=useQuery({queryKey:['admin','ad-subjects'],enabled:resource==='ads',queryFn:async()=>{
    const [jobs,companies,professionals]=await Promise.all([supabase.from('vagas').select('id,title'),supabase.from('empresas').select('id,nome_fantasia'),supabase.from('autonomo_profiles').select('id,headline')]);for(const q of [jobs,companies,professionals])if(q.error)throw q.error
    return {vaga:(jobs.data??[]).map(r=>({value:r.id,label:r.title})),empresa:(companies.data??[]).map(r=>({value:r.id,label:r.nome_fantasia})),autonomo:(professionals.data??[]).map(r=>({value:r.id,label:r.headline??r.id}))}
  }})
  const [validation,setValidation]=useState('')
  const save=useMutation({mutationFn:async()=>{
    if(resource==='plans'){
      const payload={name:String(values.name).trim(),audience:String(values.audience) as 'empresa'|'autonomo',price_cents:Math.round(Number(values.price_cents)),billing_interval:String(values.billing_interval) as 'month'|'year',max_active_vagas:values.max_active_vagas===''?null:Number(values.max_active_vagas),sort_order:Number(values.sort_order),is_active:Boolean(values.is_active),featured_placement:Boolean(values.featured_placement),cv_database_access:Boolean(values.cv_database_access)}
      const q=initial?.id?supabase.from('plans').update(payload).eq('id',String(initial.id)):supabase.from('plans').insert(payload);const {error}=await q.select('id').single();if(error)throw error
    }else{
      const payload={subject_type:String(values.subject_type) as 'vaga'|'autonomo'|'empresa',subject_id:String(values.subject_id),placement:String(values.placement).trim()||null,starts_at:values.starts_at?new Date(String(values.starts_at)).toISOString():null,ends_at:values.ends_at?new Date(String(values.ends_at)).toISOString():null,status:String(values.status) as 'pending'|'active'|'expired'}
      const q=initial?.id?supabase.from('ads').update(payload).eq('id',String(initial.id)):supabase.from('ads').insert(payload);const {error}=await q.select('id').single();if(error)throw error
    }
  },onSuccess:async()=>{await client.invalidateQueries();onClose()}})
  const fields:AdminField[]=resource==='plans'?[
    {key:'name',label:'Nome do plano',required:true},{key:'audience',label:'Público',type:'select',required:true,options:[{value:'empresa',label:'Empresas'},{value:'autonomo',label:'Autônomos'}]},
    {key:'price_cents',label:'Preço em centavos',type:'number',min:0,required:true,hint:'Ex.: 4990 corresponde a R$ 49,90.'},{key:'billing_interval',label:'Periodicidade',type:'select',required:true,options:[{value:'month',label:'Mensal'},{value:'year',label:'Anual'}]},
    {key:'max_active_vagas',label:'Limite de vagas ativas',type:'number',min:0,hint:'Vazio significa sem limite.'},{key:'sort_order',label:'Ordem de exibição',type:'number',min:0},
    {key:'featured_placement',label:'Inclui destaque',type:'checkbox'},{key:'cv_database_access',label:'Acesso ao banco de currículos',type:'checkbox'},{key:'is_active',label:'Plano ativo',type:'checkbox'},
  ]:[
    {key:'subject_type',label:'Tipo de cadastro',type:'select',required:true,options:[{value:'vaga',label:'Vaga'},{value:'empresa',label:'Empresa'},{value:'autonomo',label:'Autônomo'}]},
    {key:'subject_id',label:'Cadastro destacado',type:'select',required:true,options:subjects.data?.[String(values.subject_type) as 'vaga'|'empresa'|'autonomo']??[]},
    {key:'placement',label:'Posição / identificação do destaque'},{key:'status',label:'Situação',type:'select',required:true,options:[{value:'pending',label:'Pendente'},{value:'active',label:'Ativo'},{value:'expired',label:'Encerrado'}]},
    {key:'starts_at',label:'Início (horário do computador)',type:'datetime-local'},{key:'ends_at',label:'Fim (horário do computador)',type:'datetime-local'},
  ]
  return <AdminModal open onClose={onClose} busy={save.isPending} title={`${initial?.id?'Editar':'Novo'} ${resource==='plans'?'plano':'destaque'}`} description="Configure os dados e confirme para salvar."><form className="space-y-5" onSubmit={e=>{e.preventDefault();e.stopPropagation();setValidation('');if(resource==='plans'&&['price_cents','max_active_vagas','sort_order'].some(k=>values[k]!==''&&(!Number.isInteger(Number(values[k]))||Number(values[k])<0))){setValidation('Informe valores inteiros e positivos ou zero nos campos numéricos.');return}if(resource==='ads'&&values.starts_at&&values.ends_at&&new Date(String(values.ends_at))<=new Date(String(values.starts_at))){setValidation('O fim deve ser posterior ao início.');return}save.mutate()}}><h2 className="font-semibold">{initial?'Editar':'Adicionar'} {resource==='plans'?'plano':'destaque'}</h2><fieldset disabled={save.isPending||subjects.isLoading}><AdminFields fields={fields} values={values} set={(k,v)=>setValues(old=>({...old,[k]:v,...(k==='subject_type'?{subject_id:''}:{})}))} /></fieldset>{subjects.isError&&<AdminAviso>Não foi possível carregar os cadastros. <button type="button" className="underline" onClick={()=>subjects.refetch()}>Tentar novamente</button></AdminAviso>}{(validation||save.isError)&&<AdminAviso>{validation||adminError(save.error)}</AdminAviso>}<div className="flex flex-wrap gap-3"><Button variant="cta" disabled={save.isPending||subjects.isLoading||(resource==='ads'&&subjects.isError)}>{save.isPending?'Salvando…':'Salvar'}</Button><Button type="button" variant="outline" disabled={save.isPending} onClick={onClose}>Cancelar</Button></div></form></AdminModal>
}
export default function CommercialPage({resource}:{resource:Resource}) {
  const client=useQueryClient()
  const [editing,setEditing]=useState<AdminValues|'new'|null>(null)
  const [search,setSearch]=useState('')
  const [feedback,setFeedback]=useState('')
  const query=useQuery({queryKey:['admin',resource],queryFn:async()=>{
    if(resource==='plans'){const {data,error}=await supabase.from('plans').select('*').order('sort_order');if(error)throw error;return data.map(r=>({id:r.id,title:r.name,subtitle:`${r.audience==='empresa'?'Empresas':'Autônomos'} · ${formatBRL(r.price_cents/100)} / ${r.billing_interval==='month'?'mês':'ano'}`,status:r.is_active?'Ativo':'Inativo',values:{...r,price_cents:String(r.price_cents),sort_order:String(r.sort_order),max_active_vagas:r.max_active_vagas?.toString()??'',stripe_price_id:r.stripe_price_id??''} as AdminValues}))}
    const {data,error}=await supabase.from('ads').select('*').order('created_at',{ascending:false});if(error)throw error;return data.map(r=>({id:r.id,title:r.placement||'Destaque',subtitle:`${r.subject_type} · ${r.subject_id}`,status:r.status,values:{id:r.id,subject_type:r.subject_type,subject_id:r.subject_id,placement:r.placement??'',starts_at:toLocalDateTime(r.starts_at),ends_at:toLocalDateTime(r.ends_at),status:r.status} as AdminValues}))
  }})
  const remove=useMutation({mutationFn:async(id:string)=>{const {error}=await supabase.from(resource).delete().eq('id',id).select('id').single();if(error)throw error},onSuccess:async()=>{setFeedback('Cadastro excluído.');await client.invalidateQueries()}})
  return <div className="space-y-6"><AdminHeader title={resource==='plans'?'Planos':'Destaques (ADS)'} description={resource==='plans'?'Gerencie os planos e seus limites. O cadastro não cria cobrança online.':'Cadastre e mantenha os destaques. A compra e a cobrança online ainda não estão disponíveis.'} actions={<Button variant="cta" disabled={editing!==null} onClick={()=>{setEditing('new');setFeedback('')}}>Adicionar</Button>} />
    {editing!==null&&<Editor key={editing==='new'?'new':String(editing.id)} resource={resource} initial={editing==='new'?undefined:editing} onClose={()=>{setEditing(null);setFeedback('Editor fechado. Consulte a lista para conferir o cadastro.')}} />}
    {feedback&&<p role="status" className="text-sm text-primary">{feedback}</p>}{query.isLoading&&<p role="status">Carregando…</p>}{query.isError&&<AdminAviso>Não foi possível carregar. <button className="underline" onClick={()=>query.refetch()}>Tentar novamente</button></AdminAviso>}{remove.isError&&<AdminAviso>{adminError(remove.error)}</AdminAviso>}
    <Input aria-label="Buscar cadastros" placeholder="Buscar…" value={search} onChange={e=>setSearch(e.target.value)} /><AdminList>{query.data?.filter(r=>`${r.title} ${r.subtitle}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).map(r=><AdminRow key={r.id} title={r.title} subtitle={r.subtitle} badges={<Tag>{r.status}</Tag>} actions={<><Button size="sm" variant="outline" disabled={editing!==null} onClick={()=>{setEditing(r.values);window.scrollTo({top:0})}}>Editar</Button><Button size="sm" variant="ghost" disabled={remove.isPending||editing!==null} onClick={()=>{if(window.confirm('Excluir este cadastro permanentemente? Planos com assinaturas não podem ser excluídos; desative o plano nesse caso.'))remove.mutate(r.id)}}>Excluir</Button></>} />)}</AdminList>{!query.isLoading&&!query.isError&&!query.data?.length&&<p className="text-sm text-muted-foreground">Nenhum cadastro. Use “Adicionar” para começar.</p>}
  </div>
}
