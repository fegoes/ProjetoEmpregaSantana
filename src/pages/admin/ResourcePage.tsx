import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { EmploymentType, PricingModelVaga, PricingModelAutonomo, VagaStatus, EmpresaStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/RichTextEditor'
import { StatusBadge } from '@/components/StatusBadge'

export type Resource = 'vagas' | 'profissionais' | 'empresas'
type Values = Record<string, string | boolean>
type RecordItem = { id: string; title: string; subtitle: string; status: string; values: Values }
type Option = [string, string]
type Field = { key: string; label: string; type?: 'text' | 'email' | 'url' | 'number' | 'select' | 'rich' | 'checkbox'; required?: boolean; options?: Option[]; disabled?: boolean }
const TITLES = { vagas: ['Vagas', 'vaga', 'nova'], profissionais: ['Profissionais', 'profissional', 'novo'], empresas: ['Empresas', 'empresa', 'nova'] }
const STATUS_LABELS: Record<string, string> = { active: 'Ativo', paused: 'Pausado', pending: 'Pendente', suspended: 'Suspenso', published: 'Publicado', closed: 'Encerrado', draft: 'Rascunho' }
const str = (value: unknown) => value == null ? '' : String(value)
const nullable = (value: unknown) => str(value).trim() || null
const number = (value: unknown) => str(value).trim() ? Number(value) : null

function useRecords(resource: Resource) {
  return useQuery({ queryKey: ['admin', resource], queryFn: async (): Promise<RecordItem[]> => {
    if (resource === 'vagas') {
      const { data, error } = await supabase.from('vagas').select('*, empresas(nome_fantasia)').order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(row => ({ id: row.id, title: row.title, subtitle: row.empresas?.nome_fantasia ?? 'Sem empresa vinculada', status: row.status, values: { title: row.title, empresa_id: row.empresa_id ?? '', description_html: row.description_html ?? '', employment_type: row.employment_type, pricing_model: row.pricing_model, status: row.status, category: row.category ?? '', location_city: row.location_city ?? '', location_state: row.location_state ?? '', salary_min: str(row.salary_min), salary_max: str(row.salary_max), hourly_rate: str(row.hourly_rate), salary_visible: row.salary_visible, is_remote: row.is_remote, is_featured: row.is_featured } }))
    }
    if (resource === 'empresas') {
      const { data, error } = await supabase.from('empresas').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(row => ({ id: row.id, title: row.nome_fantasia, subtitle: [row.sector, row.city, row.state].filter(Boolean).join(' · '), status: row.status, values: { owner_id: row.owner_id, nome_fantasia: row.nome_fantasia, razao_social: row.razao_social ?? '', cnpj: row.cnpj ?? '', sector: row.sector ?? '', city: row.city ?? '', state: row.state ?? '', website: row.website ?? '', description_html: row.description_html ?? '', status: row.status, is_verified: row.is_verified } }))
    }
    const { data, error } = await supabase.from('autonomo_profiles').select('*, profiles(full_name,email)').order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(row => ({ id: row.id, title: row.profiles?.full_name ?? row.profiles?.email ?? 'Profissional', subtitle: row.headline ?? 'Perfil sem título', status: row.status, values: { account_id: row.id, headline: row.headline ?? '', category: row.category ?? '', description_html: row.description_html ?? '', pricing_model: row.pricing_model, hourly_rate: str(row.hourly_rate), delivery_rate_note: row.delivery_rate_note ?? '', service_area_city: row.service_area_city ?? '', service_area_state: row.service_area_state ?? '', serves_remote: row.serves_remote, status: row.status, is_featured: row.is_featured } }))
  } })
}

function ResourceEditor({ resource, record, fields, onSave }: { resource: Resource; record?: RecordItem; fields: Field[]; onSave: () => void }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const client = useQueryClient()
  const [values, setValues] = useState<Values>(record?.values ?? { status: resource === 'vagas' ? 'draft' : resource === 'empresas' ? 'pending' : 'paused', pricing_model: resource === 'vagas' ? 'fixed_salary' : 'hourly', employment_type: 'clt', salary_visible: true })
  const [validation, setValidation] = useState('')
  const visibleFields = fields.filter(field => {
    if (resource === 'vagas' && ['salary_min', 'salary_max'].includes(field.key)) return values.pricing_model === 'fixed_salary'
    if (field.key === 'hourly_rate') return resource === 'vagas' ? values.pricing_model === 'hourly' : values.pricing_model === 'hourly' || values.pricing_model === 'both'
    if (resource === 'profissionais' && field.key === 'delivery_rate_note') return values.pricing_model === 'per_delivery' || values.pricing_model === 'both'
    return true
  })
  const set = (key: string, value: string | boolean) => setValues(v => ({ ...v, [key]: value }))
  const save = useMutation({ mutationFn: async () => {
    if (!user) throw new Error('Entre novamente para salvar.')
    if (resource === 'vagas') {
      const payload = { title: str(values.title).trim(), empresa_id: nullable(values.empresa_id), description_html: str(values.description_html), employment_type: str(values.employment_type) as EmploymentType, pricing_model: str(values.pricing_model) as PricingModelVaga, status: str(values.status) as VagaStatus, category: nullable(values.category), location_city: nullable(values.location_city), location_state: nullable(values.location_state)?.toUpperCase() ?? null, salary_min: values.pricing_model === 'fixed_salary' ? number(values.salary_min) : null, salary_max: values.pricing_model === 'fixed_salary' ? number(values.salary_max) : null, hourly_rate: values.pricing_model === 'hourly' ? number(values.hourly_rate) : null, salary_visible: Boolean(values.salary_visible), is_remote: Boolean(values.is_remote), is_featured: Boolean(values.is_featured) }
      const query = record ? supabase.from('vagas').update(payload).eq('id', record.id) : supabase.from('vagas').insert({ ...payload, created_by: user.id })
      const { error } = await query.select('id').single()
      if (error) throw error
    } else if (resource === 'empresas') {
      const payload = { nome_fantasia: str(values.nome_fantasia).trim(), razao_social: nullable(values.razao_social), cnpj: nullable(values.cnpj), sector: nullable(values.sector), city: nullable(values.city), state: nullable(values.state)?.toUpperCase() ?? null, website: nullable(values.website), description_html: str(values.description_html), status: str(values.status) as EmpresaStatus, is_verified: Boolean(values.is_verified) }
      const query = record ? supabase.from('empresas').update(payload).eq('id', record.id) : supabase.from('empresas').insert({ ...payload, owner_id: str(values.owner_id) })
      const { error } = await query.select('id').single()
      if (error) throw error
    } else {
      const payload = { headline: nullable(values.headline), category: nullable(values.category), description_html: str(values.description_html), pricing_model: str(values.pricing_model) as PricingModelAutonomo, hourly_rate: values.pricing_model === 'per_delivery' ? null : number(values.hourly_rate), delivery_rate_note: nullable(values.delivery_rate_note), service_area_city: nullable(values.service_area_city), service_area_state: nullable(values.service_area_state)?.toUpperCase() ?? null, serves_remote: Boolean(values.serves_remote), status: str(values.status) as 'active' | 'paused', is_featured: Boolean(values.is_featured) }
      const query = record ? supabase.from('autonomo_profiles').update(payload).eq('id', record.id) : supabase.from('autonomo_profiles').insert({ ...payload, id: str(values.account_id) })
      const { error } = await query.select('id').single()
      if (error) throw error
    }
  }, onSuccess: async () => { await client.invalidateQueries(); onSave() } })
  function submit(e: FormEvent) {
    e.preventDefault()
    setValidation('')
    for (const field of visibleFields) {
      if (field.required && !str(values[field.key]).trim()) { setValidation(`Preencha ${field.label.toLocaleLowerCase('pt-BR')}.`); return }
      if (field.type === 'number' && str(values[field.key]).trim() && (!Number.isFinite(Number(values[field.key])) || Number(values[field.key]) < 0)) { setValidation(`Confira o valor de ${field.label.toLocaleLowerCase('pt-BR')}.`); return }
    }
    if (resource === 'vagas' && values.pricing_model === 'fixed_salary' && str(values.salary_min) && str(values.salary_max) && Number(values.salary_max) < Number(values.salary_min)) { setValidation('O salário máximo precisa ser maior ou igual ao mínimo.'); return }
    save.mutate()
  }
  return <form onSubmit={submit} className="max-w-4xl space-y-6 rounded-xl border bg-card p-5 sm:p-7">
    {resource !== 'vagas' && !record && <p className="text-sm leading-relaxed text-muted-foreground">Vincule o cadastro a uma conta já existente. A conta mantém seus dados de acesso; o papel correspondente é atribuído pelo banco ao criar o cadastro.</p>}
    <div className="grid min-w-0 gap-5 sm:grid-cols-2">{visibleFields.map(field => <div key={field.key} className={field.type === 'rich' ? 'min-w-0 space-y-2 sm:col-span-2' : 'min-w-0 space-y-2'}>
      {field.type === 'checkbox' ? <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" disabled={save.isPending} checked={Boolean(values[field.key])} onChange={e => set(field.key, e.target.checked)} />{field.label}</label> : <><Label htmlFor={`resource-${field.key}`}>{field.label}{field.required ? ' *' : ''}</Label>
      {field.type === 'select' ? <select id={`resource-${field.key}`} required={field.required} disabled={field.disabled || save.isPending} className="min-h-11 w-full rounded-lg border bg-card px-3 text-sm" value={str(values[field.key])} onChange={e => set(field.key, e.target.value)}><option value="">Selecione…</option>{field.options?.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      : field.type === 'rich' ? <RichTextEditor ariaLabel={field.label} value={str(values[field.key])} onChange={value => set(field.key, value)} />
      : <Input disabled={save.isPending} id={`resource-${field.key}`} type={field.type ?? 'text'} required={field.required} maxLength={field.key.endsWith('state') ? 2 : 250} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? '0.01' : undefined} value={str(values[field.key])} onChange={e => set(field.key, e.target.value)} />}</>}
    </div>)}</div>
    {(validation || save.isError) && <p role="alert" className="text-sm text-destructive">{validation || 'Não foi possível salvar. Confira os dados, possíveis cadastros duplicados e sua permissão. Os campos foram preservados.'}</p>}
    <div className="flex flex-wrap gap-3"><Button variant="cta" disabled={save.isPending}>{save.isPending ? 'Salvando…' : 'Salvar cadastro'}</Button><Button type="button" variant="outline" disabled={save.isPending} onClick={() => navigate(`/admin/${resource}`)}>Voltar à lista</Button></div>
  </form>
}

export default function ResourcePage({ resource }: { resource: Resource }) {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const client = useQueryClient()
  const query = useRecords(resource)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [feedback, setFeedback] = useState('')
  const creating = /\/(nova|novo)$/.test(location.pathname)
  const editing = creating || Boolean(id)
  const profiles = useQuery({ queryKey: ['admin', 'account-options'], enabled: editing && resource !== 'vagas', queryFn: async () => { const { data, error } = await supabase.from('profiles').select('id,full_name,email').order('full_name'); if (error) throw error; return data } })
  const companies = useQuery({ queryKey: ['admin', 'company-options'], enabled: editing && resource === 'vagas', queryFn: async () => { const { data, error } = await supabase.from('empresas').select('id,nome_fantasia').order('nome_fantasia'); if (error) throw error; return data } })
  const categories = useQuery({ queryKey: ['categories', 'list'], enabled: editing && resource !== 'empresas', queryFn: async () => { const { data, error } = await supabase.from('categories').select('*').order('label'); if (error) throw error; return data } })
  const remove = useMutation({ mutationFn: async (record: RecordItem) => {
    const table = resource === 'profissionais' ? 'autonomo_profiles' : resource
    const { error } = await supabase.from(table).delete().eq('id', record.id).select('id').single()
    if (error) throw error
  }, onSuccess: async () => { await client.invalidateQueries(); setFeedback('Cadastro excluído.') } })
  const [title, singular, createPath] = TITLES[resource]
  const record = query.data?.find(item => item.id === id)
  const options: Option[] = (profiles.data ?? []).filter(profile => resource !== 'profissionais' || profile.id === id || !query.data?.some(item => item.id === profile.id)).map(profile => [profile.id, [profile.full_name, profile.email].filter(Boolean).join(' · ') || profile.id])
  const categoryOptions: Option[] = (categories.data ?? []).filter(c => c.kind === 'both' || c.kind === (resource === 'vagas' ? 'vaga' : 'autonomo')).map(c => [c.slug, c.label])
  const statuses: Option[] = (resource === 'vagas' ? ['draft', 'published', 'paused', 'closed'] : resource === 'empresas' ? ['pending', 'active', 'suspended'] : ['paused', 'active']).map(value => [value, STATUS_LABELS[value]])
  let fields: Field[]
  if (resource === 'vagas') fields = [
    { key: 'title', label: 'Título', required: true }, { key: 'empresa_id', label: 'Empresa (opcional)', type: 'select', options: (companies.data ?? []).map(c => [c.id, c.nome_fantasia]) },
    { key: 'description_html', label: 'Descrição da vaga', type: 'rich' },
    { key: 'employment_type', label: 'Contratação', type: 'select', required: true, options: [['clt', 'CLT'], ['pj', 'PJ'], ['temporario', 'Temporário'], ['freelance', 'Freelance']] },
    { key: 'pricing_model', label: 'Pagamento', type: 'select', required: true, options: [['fixed_salary', 'Salário fixo'], ['hourly', 'Por hora'], ['per_delivery', 'Por entrega']] },
    { key: 'category', label: 'Categoria', type: 'select', options: categoryOptions }, { key: 'status', label: 'Situação', type: 'select', required: true, options: statuses },
    { key: 'location_city', label: 'Cidade' }, { key: 'location_state', label: 'UF' },
    { key: 'salary_min', label: 'Salário mínimo (R$)', type: 'number' }, { key: 'salary_max', label: 'Salário máximo (R$)', type: 'number' }, { key: 'hourly_rate', label: 'Valor por hora (R$)', type: 'number' },
    { key: 'salary_visible', label: 'Divulgar remuneração', type: 'checkbox' }, { key: 'is_remote', label: 'Trabalho remoto', type: 'checkbox' }, { key: 'is_featured', label: 'Destacar vaga', type: 'checkbox' },
  ]
  else if (resource === 'empresas') fields = [
    { key: 'nome_fantasia', label: 'Nome da empresa', required: true }, { key: 'owner_id', label: 'Conta responsável', type: 'select', required: true, options, disabled: !creating },
    { key: 'razao_social', label: 'Razão social' }, { key: 'cnpj', label: 'CNPJ' }, { key: 'sector', label: 'Setor' }, { key: 'website', label: 'Site (https://…)', type: 'url' },
    { key: 'city', label: 'Cidade' }, { key: 'state', label: 'UF' }, { key: 'status', label: 'Situação', type: 'select', required: true, options: statuses },
    { key: 'is_verified', label: 'Empresa verificada', type: 'checkbox' }, { key: 'description_html', label: 'Descrição da empresa', type: 'rich' },
  ]
  else fields = [
    { key: 'account_id', label: 'Conta do profissional', type: 'select', required: true, options, disabled: !creating }, { key: 'headline', label: 'Título do serviço', required: true },
    { key: 'category', label: 'Categoria', type: 'select', options: categoryOptions }, { key: 'status', label: 'Situação', type: 'select', required: true, options: statuses },
    { key: 'pricing_model', label: 'Cobrança', type: 'select', required: true, options: [['hourly', 'Por hora'], ['per_delivery', 'Por entrega'], ['both', 'Por hora ou entrega']] },
    { key: 'hourly_rate', label: 'Valor por hora (R$)', type: 'number' }, { key: 'delivery_rate_note', label: 'Condições por entrega' }, { key: 'service_area_city', label: 'Cidade de atendimento' }, { key: 'service_area_state', label: 'UF' },
    { key: 'serves_remote', label: 'Atende remotamente', type: 'checkbox' }, { key: 'is_featured', label: 'Destacar profissional', type: 'checkbox' }, { key: 'description_html', label: 'Descrição dos serviços', type: 'rich' },
  ]
  const optionsFailed = profiles.isError || companies.isError || categories.isError
  const filtered = query.data?.filter(item => (!status || item.status === status) && `${item.title} ${item.subtitle}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-extrabold">{editing ? `${creating ? 'Adicionar' : 'Editar'} ${singular}` : title}</h1><p className="mt-3 text-sm text-muted-foreground">{resource === 'profissionais' ? 'Gerencie os perfis públicos de serviços e sua publicação.' : resource === 'vagas' ? 'Gerencie oportunidades, empresas vinculadas e publicação.' : 'Gerencie os cadastros, responsáveis e situação das empresas.'}</p></div>{!editing && <Button asChild variant="cta"><Link to={`/admin/${resource}/${createPath}`}><Plus />Adicionar {singular}</Link></Button>}</div>
    {query.isLoading && <p role="status">Carregando cadastros…</p>}
    {(query.isError || optionsFailed) && <div role="alert"><p>Não foi possível carregar os dados necessários.</p><Button variant="outline" className="mt-3" onClick={() => { query.refetch(); if (profiles.isError) profiles.refetch(); if (companies.isError) companies.refetch(); if (categories.isError) categories.refetch() }}>Tentar novamente</Button></div>}
    {editing && !query.isLoading && !query.isError && !optionsFailed && (creating || record ? <ResourceEditor key={`${resource}-${id ?? 'new'}`} resource={resource} record={record} fields={fields} onSave={() => { setFeedback('Cadastro salvo.'); navigate(`/admin/${resource}`) }} /> : <p role="alert">Cadastro não encontrado. <Link to={`/admin/${resource}`} className="underline">Voltar à lista</Link></p>)}
    {!editing && <>{feedback && <p role="status" className="text-sm text-primary">{feedback}</p>}{remove.isError && <p role="alert" className="text-sm text-destructive">Não foi possível excluir. Confira os vínculos do cadastro e tente novamente.</p>}
    <div className="flex flex-col gap-3 sm:flex-row"><Input aria-label={`Buscar em ${title.toLocaleLowerCase('pt-BR')}`} className="min-w-0 sm:flex-1" placeholder="Buscar pelo nome ou descrição…" value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Filtrar por situação" className="min-h-11 rounded-lg border bg-card px-3 text-sm sm:w-60 sm:shrink-0" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todas as situações</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    <div className="overflow-hidden rounded-xl border bg-card"><div className="hidden grid-cols-[minmax(0,1fr)_120px_240px] gap-5 border-b bg-secondary px-5 py-3 text-xs font-semibold xl:grid"><span>Cadastro</span><span>Situação</span><span>Ações</span></div>{filtered?.map(item => <article key={item.id} className="grid min-w-0 items-center gap-4 border-b p-5 last:border-0 xl:grid-cols-[minmax(0,1fr)_120px_240px]"><div className="min-w-0"><h2 className="break-words text-base font-semibold">{item.title}</h2><p className="mt-2 break-words text-sm text-muted-foreground">{item.subtitle}</p></div><div><StatusBadge status={item.status} /></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><Link to={`/admin/${resource}/${item.id}/editar`}>Editar</Link></Button>{resource === 'empresas' && <Button asChild variant="outline" size="sm"><Link to={`/admin/empresas/${item.id}`}>Detalhes</Link></Button>}<Button variant="ghost" className="text-destructive" size="sm" disabled={remove.isPending} onClick={() => {
      const consequence = resource === 'empresas' ? 'Vagas, candidaturas e vínculos de equipe serão apagados junto.' : resource === 'vagas' ? 'As candidaturas desta vaga também serão apagadas.' : 'O perfil de serviços, as referências do portfólio e assinaturas vinculadas serão removidos. A conta de acesso e os demais papéis serão preservados.'
      if (window.confirm(`Excluir “${item.title}” permanentemente? ${consequence} Esta ação não pode ser desfeita.`)) { setFeedback(''); remove.mutate(item) }
    }}>Excluir</Button></div></article>)}{!query.isLoading && !query.isError && !filtered?.length && <p className="p-6 text-sm text-muted-foreground">{query.data?.length ? 'Nenhum cadastro corresponde aos filtros.' : `Nenhum cadastro de ${singular} ainda. Use Adicionar para começar.`}</p>}</div></>}
  </div>
}
