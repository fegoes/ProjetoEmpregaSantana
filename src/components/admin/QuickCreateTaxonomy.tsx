import { useId, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { taxonomySlug, TAXONOMY_DOMAINS } from '@/lib/taxonomies'
import type { TaxonomyKind } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminModal } from './AdminModal'
type Created={id:string;slug:string;name:string}
export function QuickCreateTaxonomy({table,kind='vaga',onCreated}:{table:'categories'|'record_types'|'blog_categories';kind?:TaxonomyKind;onCreated?:(item:Created)=>void}) {
 const [open,setOpen]=useState(false),[name,setName]=useState(''),[slug,setSlug]=useState(''),[custom,setCustom]=useState(false),[domain,setDomain]=useState<string>(kind)
 const id=useId(),client=useQueryClient()
 const title=table==='record_types'?'Novo tipo de cadastro':table==='blog_categories'?'Nova categoria do blog':'Nova categoria'
 const mutation=useMutation({mutationFn:async()=>{
  const label=name.trim(),identifier=slug.trim()
  if(!label||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(identifier))throw new Error('Preencha o nome e use letras minúsculas, números e hífens no identificador.')
  const command=table==='blog_categories'?supabase.from('blog_categories').insert({name:label,slug:identifier,description:'',is_active:true}):table==='categories'?supabase.from('categories').insert({label,slug:identifier,kind:domain as TaxonomyKind,is_active:true}):supabase.from('record_types').insert({label,slug:identifier,kind:domain as TaxonomyKind,is_active:true})
  const {data,error}=await command.select('id').single();if(error)throw error
  return {id:data.id,slug:identifier,name:label}
 },onSuccess:async item=>{
  await Promise.all([client.invalidateQueries({queryKey:table==='blog_categories'?['blog-categories']:table==='categories'?['categories']:['record-types']}),client.invalidateQueries({queryKey:['admin','resource-records']})])
  onCreated?.(item);setOpen(false)
 }})
 return <><Button type="button" variant="outline" size="sm" onClick={()=>{setName('');setSlug('');setCustom(false);setDomain(kind);mutation.reset();setOpen(true)}}>{title}</Button>
 <AdminModal open={open} onClose={()=>setOpen(false)} busy={mutation.isPending} title={title} description="Crie sem sair do cadastro atual. O novo item ficará disponível ao salvar.">
 <form className="space-y-4" onSubmit={e=>{e.preventDefault();e.stopPropagation();mutation.mutate()}}>
 <fieldset disabled={mutation.isPending} className="space-y-4"><div className="space-y-2"><Label htmlFor={`${id}-name`}>Nome *</Label><Input id={`${id}-name`} required maxLength={80} value={name} onChange={e=>{setName(e.target.value);if(!custom)setSlug(taxonomySlug(e.target.value))}} /></div>
 <div className="space-y-2"><Label htmlFor={`${id}-slug`}>Identificador *</Label><Input id={`${id}-slug`} required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={e=>{setCustom(true);setSlug(e.target.value)}} /></div>
 {table!=='blog_categories'&&<div className="space-y-2"><Label htmlFor={`${id}-kind`}>Área de uso</Label><select id={`${id}-kind`} className="min-h-11 w-full rounded-lg border bg-card px-3" disabled={Boolean(onCreated)} value={domain} onChange={e=>setDomain(e.target.value)}>{Object.entries(TAXONOMY_DOMAINS).filter(([key])=>table==='categories'||key!=='both').map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>}</fieldset>
 {mutation.isError&&<p role="alert" className="text-sm text-destructive">{(mutation.error as {code?:string}).code==='23505'?'Este identificador já existe. Escolha outro.':mutation.error instanceof Error?mutation.error.message:'Não foi possível criar. Confira sua conexão e sua permissão de administrador.'}</p>}
 <div className="flex flex-wrap gap-3"><Button disabled={mutation.isPending}>{mutation.isPending?'Salvando…':'Criar e continuar'}</Button><Button type="button" variant="outline" disabled={mutation.isPending} onClick={()=>setOpen(false)}>Cancelar</Button></div>
 </form></AdminModal></>
}
