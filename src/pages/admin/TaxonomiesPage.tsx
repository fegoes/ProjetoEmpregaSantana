import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCategories } from '@/hooks/useCategories'
import { useRecordTypes } from '@/hooks/useRecordTypes'
import { supabase } from '@/lib/supabase'
import { TAXONOMY_DOMAINS, taxonomySlug } from '@/lib/taxonomies'
import type { TaxonomyKind } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Item = { id: string; slug: string; label: string; kind: TaxonomyKind | 'both'; is_active: boolean }
const control = 'min-h-11 w-full rounded-lg border bg-card px-3 text-sm'
function errorMessage(error: unknown) {
  const code = (error as { code?: string })?.code
  if (code === '23503' || code === '23001') return 'Este item está em uso. Desative-o para impedir novas associações ou reclassifique os cadastros antes de excluir.'
  if (code === '23505') return 'Já existe um item com este identificador. Escolha outro.'
  return 'Não foi possível concluir. Confira sua conexão e permissão de administrador e tente novamente. Os campos foram preservados.'
}
function TaxonomyForm({ table, item, onDone }: { table: 'categories' | 'record_types'; item?: Item; onDone: (message: string) => void }) {
  const client = useQueryClient()
  const nameInput = useRef<HTMLInputElement>(null)
  useEffect(() => { if (item) nameInput.current?.focus() }, [item])
  const [label, setLabel] = useState(item?.label ?? '')
  const [slug, setSlug] = useState(item?.slug ?? '')
  const [customSlug, setCustomSlug] = useState(Boolean(item))
  const [kind, setKind] = useState<Item['kind']>(item?.kind ?? 'vaga')
  const [active, setActive] = useState(item?.is_active ?? true)
  const save = useMutation({ mutationFn: async () => {
    const payload = { label: label.trim(), is_active: active }
    // Área e identificador são imutáveis também no banco.
    const query = table === 'categories'
      ? item ? supabase.from('categories').update(payload).eq('id', item.id) : supabase.from('categories').insert({ ...payload, slug, kind })
      : item ? supabase.from('record_types').update(payload).eq('id', item.id) : supabase.from('record_types').insert({ ...payload, slug, kind: kind as TaxonomyKind })
    const { error } = await query.select('id').single()
    if (error) throw error
  }, onSuccess: async () => {
    await client.invalidateQueries({ queryKey: table === 'categories' ? ['categories'] : ['record-types'] })
    if (!item) { setLabel(''); setSlug(''); setCustomSlug(false) }
    onDone(item ? 'Item atualizado.' : 'Item adicionado.')
  } })
  function submit(event: FormEvent) { event.preventDefault(); save.mutate() }
  return <form onSubmit={submit} className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
    <h2 className="text-lg font-bold">{item ? 'Editar item' : 'Adicionar item'}</h2>
    <fieldset disabled={save.isPending} className="space-y-5">
      <div className="space-y-2"><Label htmlFor="taxonomy-label">Nome *</Label><Input className="min-h-11" ref={nameInput} id="taxonomy-label" required maxLength={80} value={label} onChange={e => { setLabel(e.target.value); if (!customSlug) setSlug(taxonomySlug(e.target.value)) }} /></div>
      <div className="space-y-2"><Label htmlFor="taxonomy-slug">Identificador *</Label><Input className="min-h-11" id="taxonomy-slug" required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" disabled={Boolean(item)} value={slug} onChange={e => { setCustomSlug(true); setSlug(e.target.value) }} aria-describedby="taxonomy-slug-help" /><p id="taxonomy-slug-help" className="text-xs leading-relaxed text-muted-foreground">Letras minúsculas, números e hífens. O identificador e a área de uso ficam fixos após criar o item.</p></div>
      <div className="space-y-2"><Label htmlFor="taxonomy-kind">Área de uso *</Label><select id="taxonomy-kind" className={control} disabled={Boolean(item)} value={kind} onChange={e => setKind(e.target.value as Item['kind'])}>{Object.entries(TAXONOMY_DOMAINS).filter(([key]) => table === 'categories' || key !== 'both').map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></div>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />Disponível para novos cadastros</label>
      <p className="text-xs leading-relaxed text-muted-foreground">Desativar conserva os vínculos existentes. O nome pode ser atualizado sem alterar os cadastros.</p>
    </fieldset>
    {save.isError && <p role="alert" className="text-sm text-destructive">{errorMessage(save.error)}</p>}
    <div className="flex flex-wrap gap-3"><Button variant="cta" disabled={save.isPending || !label.trim()}>{save.isPending ? 'Salvando…' : item ? 'Salvar alterações' : 'Adicionar item'}</Button>{item && <Button type="button" variant="outline" disabled={save.isPending} onClick={() => onDone('')}>Cancelar edição</Button>}</div>
  </form>
}
export default function TaxonomiesPage({ mode }: { mode: 'categories' | 'types' }) {
  const categories = useCategories()
  const types = useRecordTypes()
  const query = mode === 'categories' ? categories : types
  const table = mode === 'categories' ? 'categories' : 'record_types'
  const client = useQueryClient()
  const [selected, setSelected] = useState<Item>()
  const [feedback, setFeedback] = useState('')
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('')
  const [visibility, setVisibility] = useState('')
  const remove = useMutation({ mutationFn: async (item: Item) => {
    const { error } = await supabase.from(table).delete().eq('id', item.id).select('id').single()
    if (error) throw error
  }, onSuccess: async () => { await client.invalidateQueries({ queryKey: mode === 'categories' ? ['categories'] : ['record-types'] }); setFeedback('Item excluído.'); setSelected(undefined) } })
  const rows = (query.data ?? []).filter(item => (!domain || item.kind === domain) && (!visibility || (visibility === 'active') === item.is_active) && `${item.label} ${item.slug}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-extrabold">{mode === 'categories' ? 'Categorias' : 'Tipos de cadastro'}</h1><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{mode === 'categories' ? 'Organize as áreas de atuação de profissionais, empresas e vagas. As categorias compartilhadas atendem vagas e profissionais.' : 'Defina os tipos de contratação das vagas e as classificações de profissionais e empresas. Remuneração e situação de publicação são configurações próprias dos cadastros.'}</p></div>
    <nav aria-label="Configurações de classificação" className="flex flex-wrap gap-3 border-b pb-4">{[['categories','categorias','Categorias'],['types','tipos','Tipos de cadastro']].map(([key,path,label]) => <Link key={key} to={`/admin/configuracoes/${path}`} aria-current={mode === key ? 'page' : undefined} className={`rounded-md px-3 py-2 text-sm ${mode === key ? 'bg-accent font-semibold text-primary' : 'hover:bg-secondary'}`}>{label}</Link>)}</nav>
    {query.isLoading && <p role="status">Carregando configurações…</p>}
    {query.isError && <div role="alert" className="space-y-3"><p>Não foi possível carregar estas configurações. Tente novamente. Se o problema persistir, contate o responsável pela plataforma.</p><Button variant="outline" onClick={() => query.refetch()}>Tentar novamente</Button></div>}
    {!query.isLoading && !query.isError && <div className="grid min-w-0 items-start gap-7 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
      <TaxonomyForm key={`${table}-${selected?.id ?? 'new'}`} table={table} item={selected} onDone={message => { setSelected(undefined); setFeedback(message); remove.reset() }} />
      <section className="min-w-0 space-y-4" aria-label="Itens cadastrados">
        {feedback && <p role="status" className="text-sm text-primary">{feedback}</p>}
        {remove.isError && <p role="alert" className="text-sm text-destructive">{errorMessage(remove.error)}</p>}
        <div className="space-y-3"><Input className="min-h-11" aria-label="Buscar configurações" placeholder="Buscar por nome ou identificador…" value={search} onChange={e => setSearch(e.target.value)} /><div className="grid gap-3 sm:grid-cols-2"><select className={control} aria-label="Filtrar por área" value={domain} onChange={e => setDomain(e.target.value)}><option value="">Todas as áreas</option>{Object.entries(TAXONOMY_DOMAINS).filter(([key]) => mode === 'categories' || key !== 'both').map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><select className={control} aria-label="Filtrar por disponibilidade" value={visibility} onChange={e => setVisibility(e.target.value)}><option value="">Ativos e inativos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></div></div>
        <p className="text-xs text-muted-foreground">{rows.length} {rows.length === 1 ? 'item encontrado' : 'itens encontrados'}</p>
        <div className="divide-y rounded-xl border bg-card">{rows.map(item => <article key={item.id} className="space-y-3 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words font-semibold">{item.label}</h2><p className="mt-1 break-all text-xs text-muted-foreground">{item.slug}</p></div><span className="text-xs text-muted-foreground">{item.is_active ? 'Ativo' : 'Inativo'}</span></div><p className="text-sm text-muted-foreground">{TAXONOMY_DOMAINS[item.kind]}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" disabled={remove.isPending} onClick={() => { setSelected(item); setFeedback(''); remove.reset() }}>Editar</Button><Button type="button" variant="ghost" size="sm" className="text-destructive" disabled={remove.isPending} onClick={() => { if (window.confirm(`Excluir “${item.label}”? A exclusão só é permitida se não houver cadastros vinculados.`)) { setFeedback(''); remove.mutate(item) } }}>Excluir</Button></div></article>)}{!rows.length && <p className="p-5 text-sm text-muted-foreground">{query.data?.length ? 'Nenhum item corresponde aos filtros.' : 'Adicione o primeiro item usando o formulário.'}</p>}</div>
      </section>
    </div>}
  </div>
}
