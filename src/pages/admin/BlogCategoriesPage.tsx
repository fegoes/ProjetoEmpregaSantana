import { AdminModal } from '@/components/admin/AdminModal'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBlogCategories } from '@/hooks/useBlogCategories'
import { supabase } from '@/lib/supabase'
import { AdminFields, type AdminValues } from '@/components/admin/AdminFields'
import { AdminHeader, AdminAviso, AdminList, AdminRow, Tag } from '@/components/admin/AdminKit'
import { Button } from '@/components/ui/button'
import { taxonomySlug } from '@/lib/taxonomies'
import { adminError } from '@/lib/adminUsers'

type Item = {id:string;name:string;slug:string;description:string;is_active:boolean}
export default function BlogCategoriesPage() {
  const query=useBlogCategories()
  const client=useQueryClient()
  const [id,setId]=useState<string>()
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState<AdminValues>({name:'',slug:'',description:'',is_active:true})
  const [feedback,setFeedback]=useState('')
  const reset=()=>{setId(undefined);setForm({name:'',slug:'',description:'',is_active:true})}
  const save=useMutation({mutationFn:async()=>{const values={name:String(form.name).trim(),slug:String(form.slug).trim(),description:String(form.description).trim(),is_active:Boolean(form.is_active)};if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(values.slug))throw new Error('Use letras minúsculas, números e hífens no endereço.');const command=id?supabase.from('blog_categories').update(values).eq('id',id):supabase.from('blog_categories').insert(values);const {error}=await command.select('id').single();if(error)throw error},onSuccess:async()=>{setOpen(false);reset();setFeedback('Categoria salva.');await client.invalidateQueries()}})
  const remove=useMutation({mutationFn:async(item:Item)=>{const {error}=await supabase.from('blog_categories').delete().eq('id',item.id).select('id').single();if(error)throw error},onSuccess:async()=>{reset();setFeedback('Categoria excluída.');await client.invalidateQueries()}})
  return <div className="space-y-6"><AdminHeader title="Categorias do blog" description="Organize os assuntos das dicas de carreira. Categorias em uso podem ser desativadas; para excluir, reclassifique as postagens." actions={<Button asChild variant="outline"><Link to="/admin/artigos">Voltar aos posts</Link></Button>} />
    {query.isLoading&&<p role="status">Carregando categorias…</p>}{query.isError&&<AdminAviso>Não foi possível carregar. <button className="underline" onClick={()=>query.refetch()}>Tentar novamente</button></AdminAviso>}
    {feedback&&<p role="status" className="text-sm text-primary">{feedback}</p>}{remove.isError&&<AdminAviso>{adminError(remove.error)}</AdminAviso>}
    <Button type="button" onClick={()=>{reset();save.reset();setOpen(true)}}>Nova categoria do blog</Button>
    <AdminModal open={open} onClose={()=>setOpen(false)} busy={save.isPending} title={id?'Editar categoria':'Nova categoria do blog'} description="Organize os assuntos das postagens.">    <form className="space-y-5" onSubmit={e=>{e.preventDefault();e.stopPropagation();setFeedback('');save.mutate()}}><h2 className="font-semibold">{id?'Editar categoria':'Nova categoria'}</h2><fieldset disabled={save.isPending||remove.isPending}><AdminFields values={form} set={(k,v)=>setForm(old=>({...old,[k]:v,...(k==='name'&&!id&&(!old.slug||old.slug===taxonomySlug(String(old.name)))?{slug:taxonomySlug(String(v))}:{})}))} fields={[{key:'name',label:'Nome',required:true,maxLength:80},{key:'slug',label:'Endereço da categoria',required:true,maxLength:100},{key:'description',label:'Descrição',maxLength:500},{key:'is_active',label:'Disponível para novos posts',type:'checkbox'}]} /></fieldset>{save.isError&&<AdminAviso>{adminError(save.error)}</AdminAviso>}<div className="flex flex-wrap gap-3"><Button variant="cta" disabled={save.isPending||remove.isPending}>{save.isPending?'Salvando…':'Salvar categoria'}</Button>{id&&<Button type="button" variant="outline" onClick={()=>{reset();setOpen(false)}}>Cancelar edição</Button>}</div></form></AdminModal>
    <AdminList>{query.data?.map(c=><AdminRow key={c.id} title={c.name} subtitle={c.slug} meta={c.description} badges={<Tag>{c.is_active?'Ativa':'Inativa'}</Tag>} actions={<><Button variant="outline" size="sm" onClick={()=>{setOpen(true);setId(c.id);setForm({name:c.name,slug:c.slug,description:c.description,is_active:c.is_active});setFeedback('');save.reset();remove.reset();window.scrollTo({top:0})}}>Editar</Button><Button variant="ghost" size="sm" disabled={remove.isPending} onClick={()=>{if(window.confirm(`Excluir a categoria “${c.name}”? Categorias em uso não podem ser excluídas.`))remove.mutate(c)}}>Excluir</Button></>} />)}</AdminList>
  </div>
}
