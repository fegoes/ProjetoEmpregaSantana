import { confirmAction } from '@/lib/confirmAction'
import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Tags } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCategories } from '@/hooks/useCategories'
import {
  CATEGORY_SCOPES,
  inScope,
  isActive,
  uniqueSlug,
  type Category,
  type CategoryScope,
} from '@/lib/categories'
import { plural } from '@/lib/format'
import { EmptyState } from '@/components/EmptyState'
import { FormError } from '@/components/auth/FormError'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Usage {
  vagas: Map<string, number>
  autonomos: Map<string, number>
  empresas: Map<string, number>
  modalidades: Map<string, number>
}

const countBy = (rows: (string | null)[]) => {
  const map = new Map<string, number>()
  for (const value of rows) if (value) map.set(value, (map.get(value) ?? 0) + 1)
  return map
}

/** Quantas vagas, profissionais e empresas usam cada categoria (só o superadmin lê isto). */
function useCategoryUsage() {
  return useQuery({
    queryKey: ['categories', 'usage'],
    queryFn: async (): Promise<Usage> => {
      const [vagas, autonomos, empresas, modalidades] = await Promise.all([
        supabase.from('vagas').select('category'),
        supabase.from('autonomo_profiles').select('category'),
        supabase.from('empresas').select('sector'),
        // coluna da migration 0026: sem ela, só some a contagem desta aba
        supabase.from('vagas').select('modalidade'),
      ])
      if (vagas.error) throw vagas.error
      if (autonomos.error) throw autonomos.error
      if (empresas.error) throw empresas.error
      return {
        vagas: countBy(vagas.data.map((r) => r.category)),
        autonomos: countBy(autonomos.data.map((r) => r.category)),
        empresas: countBy(empresas.data.map((r) => r.sector)),
        modalidades: countBy(modalidades.error ? [] : modalidades.data.map((r) => (r as { modalidade: string | null }).modalidade)),
      }
    },
  })
}

/** Em quantos lugares a categoria está em uso, e o texto que descreve isso para a aba atual. */
function usageOf(category: Category, scope: CategoryScope, usage: Usage | undefined) {
  if (!usage) return { total: 0, text: 'Carregando uso…' }
  const vagas = usage.vagas.get(category.slug) ?? 0
  const autonomos = usage.autonomos.get(category.slug) ?? 0
  const empresas = usage.empresas.get(category.label) ?? 0
  const modalidades = usage.modalidades.get(category.slug) ?? 0
  if (scope === 'modalidade') return { total: modalidades, text: modalidades === 0 ? 'Sem uso' : plural(modalidades, 'vaga', 'vagas') }
  const total = scope === 'empresa' ? empresas : vagas + autonomos
  const parts =
    scope === 'empresa'
      ? [plural(empresas, 'empresa', 'empresas')]
      : [
          category.kind !== 'autonomo' ? plural(vagas, 'vaga', 'vagas') : null,
          category.kind !== 'vaga' ? plural(autonomos, 'profissional', 'profissionais') : null,
        ].filter((p): p is string => Boolean(p))
  return { total, text: total === 0 ? 'Sem uso' : parts.join(' · ') }
}

const KIND_NOTE: Record<Category['kind'], string | null> = {
  vaga: null,
  autonomo: null,
  both: 'Vagas e autônomos',
  empresa: null,
  modalidade: null,
}

const PLACEHOLDER: Record<CategoryScope, string> = {
  vaga: 'Ex.: Atendimento ao cliente',
  autonomo: 'Ex.: Serviços de jardinagem',
  empresa: 'Ex.: Comércio de materiais de construção',
  modalidade: 'Ex.: Semipresencial',
}

function CategoryManager({ scope }: { scope: CategoryScope }) {
  const queryClient = useQueryClient()
  const { data: categories, isLoading, isError } = useCategories()
  const { data: usage } = useCategoryUsage()
  const meta = CATEGORY_SCOPES.find((s) => s.value === scope)!
  const otherLabel = scope === 'vaga' ? 'autônomos' : 'vagas'
  // Segmentos de empresa e modalidades são listas próprias: não se estendem a vagas ou autônomos
  const ownList = scope === 'empresa' || scope === 'modalidade'

  const [newLabel, setNewLabel] = React.useState('')
  const [alsoOther, setAlsoOther] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editLabel, setEditLabel] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const items = React.useMemo(
    () => (categories ?? []).filter((c) => inScope(c, scope)).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
    [categories, scope],
  )

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  const fail = (fallback: string) => (err: unknown) =>
    setError(err instanceof Error && err.message.startsWith('Já existe') ? err.message : fallback)

  const duplicate = (label: string, ignoreId?: string) =>
    (categories ?? []).some(
      (c) => c.id !== ignoreId && inScope(c, scope) && c.label.trim().toLowerCase() === label.trim().toLowerCase(),
    )

  const add = useMutation({
    mutationFn: async () => {
      const label = newLabel.trim()
      if (duplicate(label)) throw new Error(`Já existe ${meta.singular} com o nome "${label}".`)
      const slug = uniqueSlug(label, (categories ?? []).map((c) => c.slug), scope)
      const kind: Category['kind'] = ownList ? scope : alsoOther ? 'both' : scope
      const { error: insertError } = await supabase.from('categories').insert({ slug, label, kind })
      if (insertError) throw insertError
    },
    onSuccess: () => {
      setNewLabel('')
      setAlsoOther(false)
      setError(null)
      void refresh()
    },
    onError: fail('Não foi possível adicionar agora. Tente de novo.'),
  })

  const rename = useMutation({
    mutationFn: async ({ category, label }: { category: Category; label: string }) => {
      if (duplicate(label, category.id)) throw new Error(`Já existe ${meta.singular} com o nome "${label}".`)
      const { error: updateError } = await supabase.from('categories').update({ label }).eq('id', category.id)
      if (updateError) throw updateError
      // Empresa guarda o nome do segmento: acompanha o novo nome para não perder o vínculo
      if (category.kind === 'empresa') {
        await supabase.from('empresas').update({ sector: label }).eq('sector', category.label)
      }
    },
    onSuccess: () => {
      setEditingId(null)
      setError(null)
      void refresh()
    },
    onError: fail('Não foi possível renomear agora. Tente de novo.'),
  })

  const toggle = useMutation({
    mutationFn: async (category: Category) => {
      const { error: updateError } = await supabase
        .from('categories')
        .update({ is_active: !isActive(category) })
        .eq('id', category.id)
      if (updateError) throw updateError
    },
    onSuccess: () => {
      setError(null)
      void refresh()
    },
    onError: fail('Não foi possível ocultar ou mostrar agora. Se o erro continuar, confira se a atualização do banco (migration 0022) foi aplicada.'),
  })

  const remove = useMutation({
    mutationFn: async (category: Category) => {
      const { error: deleteError } = await supabase.from('categories').delete().eq('id', category.id)
      if (deleteError) throw deleteError
    },
    onSuccess: () => {
      setError(null)
      void refresh()
    },
    onError: fail('Não foi possível apagar. Se ela estiver em uso, oculte em vez de apagar.'),
  })

  const handleDelete = async (category: Category) => {
    if (!(await confirmAction(`Apagar "${category.label}"? Essa ação não pode ser desfeita.`))) return
    remove.mutate(category)
  }

  const busy = add.isPending || rename.isPending || toggle.isPending || remove.isPending

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (newLabel.trim()) add.mutate()
        }}
        className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5"
      >
        <Label htmlFor={`new-${scope}`} className="text-base font-semibold">
          Nova {meta.singular}
        </Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={`new-${scope}`}
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={PLACEHOLDER[scope]}
            maxLength={60}
            autoComplete="off"
          />
          <Button type="submit" variant="cta" disabled={busy || !newLabel.trim()} className="sm:shrink-0">
            {add.isPending ? 'Adicionando…' : 'Adicionar'}
          </Button>
        </div>
        {scope === 'modalidade' && (
          <p className="text-sm text-muted-foreground">
            Aparece no cadastro da vaga e no filtro do site. A modalidade <strong>Remota</strong> dispensa a cidade da vaga; as outras pedem a cidade.
          </p>
        )}
        {!ownList && (
          <label className="flex min-h-9 items-center gap-2 text-sm">
            <input type="checkbox" className="size-4" checked={alsoOther} onChange={(e) => setAlsoOther(e.target.checked)} />
            Usar também em {otherLabel}
          </label>
        )}
      </form>

      {error && <FormError>{error}</FormError>}
      {isError && <FormError>Não foi possível carregar a lista. Recarregue a página.</FormError>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {!isLoading && items.length === 0 && (
        <EmptyState icon={Tags} title="Nada cadastrado ainda" description={`Adicione a primeira ${meta.singular} acima.`} />
      )}

      {items.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            {plural(items.length, 'item', 'itens')}. Ocultar tira do formulário e do filtro, mas quem já usa continua com ela.
          </p>
          <ul className="flex flex-col gap-2">
            {items.map((category) => {
              const editing = editingId === category.id
              const { total, text } = usageOf(category, scope, usage)
              const active = isActive(category)
              return (
                <li key={category.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    {editing ? (
                      <form
                        className="flex flex-col gap-2 sm:flex-row"
                        onSubmit={(e) => {
                          e.preventDefault()
                          const label = editLabel.trim()
                          if (label && label !== category.label) rename.mutate({ category, label })
                          else setEditingId(null)
                        }}
                      >
                        <Input
                          aria-label={`Novo nome de ${category.label}`}
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          maxLength={60}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" disabled={busy || !editLabel.trim()}>
                            Salvar
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                          {category.label}
                          {!active && <Badge variant="secondary">Oculta</Badge>}
                          {KIND_NOTE[category.kind] && (
                            <span className="text-xs font-normal text-muted-foreground">{KIND_NOTE[category.kind]}</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{text}</p>
                      </>
                    )}
                  </div>
                  {!editing && (
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(category.id)
                          setEditLabel(category.label)
                        }}
                      >
                        Renomear
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => toggle.mutate(category)}>
                        {active ? 'Ocultar' : 'Mostrar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive-ink"
                        disabled={busy || total > 0}
                        title={total > 0 ? 'Está em uso: oculte em vez de apagar' : undefined}
                        onClick={() => handleDelete(category)}
                      >
                        Apagar
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

export default function AdminCategoriasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Categorias</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          As listas que aparecem nos cadastros e nos filtros do site. As mudanças valem na hora para todo mundo.
        </p>
      </div>

      <Tabs defaultValue="vaga" className="gap-5">
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
          <TabsTrigger value="vaga" className="h-10 px-4">
            Vagas
          </TabsTrigger>
          <TabsTrigger value="autonomo" className="h-10 px-4">
            Autônomos
          </TabsTrigger>
          <TabsTrigger value="empresa" className="h-10 px-4">
            Segmentos de empresa
          </TabsTrigger>
          <TabsTrigger value="modalidade" className="h-10 px-4">
            Modalidade da vaga
          </TabsTrigger>
        </TabsList>
        {CATEGORY_SCOPES.map((scope) => (
          <TabsContent key={scope.value} value={scope.value}>
            <CategoryManager scope={scope.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
