import { confirmAction } from '@/lib/confirmAction'
import { AdminModal } from '@/components/admin/AdminModal'
import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExternalLink, FilePlus2, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAllPaginasInstitucionais, useCreatePagina, useDeletePagina } from '@/hooks/usePaginasInstitucionais'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isValidSlug, pagePath, slugify, starterLayout } from '@/lib/pageLayout'
import { cn } from '@/lib/utils'

function StatusBadge({ published, hasLayout }: { published: boolean; hasLayout: boolean }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      <span
        className={cn(
          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
          published ? 'bg-success/15 text-success-ink' : 'bg-muted text-muted-foreground',
        )}
      >
        {published ? 'Publicada' : 'Rascunho'}
      </span>
      {hasLayout && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">Em seções</span>}
    </span>
  )
}

function NewPageForm({ onDone, onPending }: { onDone: () => void; onPending:(value:boolean)=>void }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const create = useCreatePagina()
  React.useEffect(()=>{onPending(create.isPending)},[create.isPending,onPending])
  const [title, setTitle] = React.useState('')
  const [slug, setSlug] = React.useState('')
  const [slugTouched, setSlugTouched] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const effectiveSlug = slugTouched ? slug : slugify(title)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError(null)
    if (!user) return
    if (!title.trim()) return setError('Dê um nome para a página.')
    if (!isValidSlug(effectiveSlug)) return setError('O endereço deve ter só letras minúsculas, números e hífens (ex.: fale-conosco).')
    try {
      const { id } = await create.mutateAsync({
        slug: effectiveSlug,
        title: title.trim(),
        layout: starterLayout(title.trim()),
        userId: user.id,
      })
      navigate(`/admin/paginas/${id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(
        /duplicate|unique|23505/i.test(message)
          ? 'Já existe uma página com esse endereço. Troque o endereço.'
          : /layout|column|is_published/i.test(message)
            ? 'O banco de dados ainda não recebeu a atualização das páginas em seções. Aplique as migrações (supabase db push) e tente de novo.'
            : 'Não foi possível criar a página. Tente de novo.',
      )
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5" aria-label="Nova página">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nova-titulo">Nome da página</Label>
        <Input id="nova-titulo" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Fale conosco" autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nova-slug">Endereço</Label>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-sm text-muted-foreground">/pagina/</span>
          <Input
            id="nova-slug"
            value={effectiveSlug}
            maxLength={60}
            autoCapitalize="none"
            spellCheck={false}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value.toLowerCase())
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">É o que aparece no link da página. Depois de criada, o endereço pode ser trocado na tela de edição.</p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive-ink">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Criando…' : 'Criar e editar'}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export default function AdminPaginasPage() {
  const { data: paginas, isLoading, isError } = useAllPaginasInstitucionais()
  const remove = useDeletePagina()
  const [creating, setCreating] = React.useState(false)
  const [modalBusy,setModalBusy]=React.useState(false)

  const handleDelete = async (id: string, title: string) => {
    if (!(await confirmAction(`Apagar a página "${title}"? Ela sai do ar e não dá para desfazer.`))) return
    await remove.mutateAsync(id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Páginas do site</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Monte páginas com seções de largura total, fundos com imagem, slides, textos e botões. Também dá para personalizar o Início, o Sobre, os
            Termos e a Privacidade.
          </p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <FilePlus2 /> Nova página
          </Button>
        )}
      </div>

      <AdminModal open={creating} onClose={()=>setCreating(false)} busy={modalBusy} title="Nova página" description="Crie o rascunho e continue no editor visual."><NewPageForm onPending={setModalBusy} onDone={() => setCreating(false)} /></AdminModal>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {isError && <p className="text-sm text-destructive-ink">Não foi possível carregar as páginas. Tente recarregar.</p>}

      {paginas && (
        <ul className="flex flex-col divide-y border-y">
          {paginas.map((pagina) => {
            const path = pagePath(pagina.slug, pagina.is_system)
            return (
              <li key={pagina.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="truncate font-semibold">{pagina.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {path}
                    {pagina.is_system && ' · página do sistema'}
                  </p>
                </div>
                <StatusBadge published={pagina.is_published} hasLayout={Boolean(pagina.layout)} />
                <div className="flex items-center gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/paginas/${pagina.id}`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <a href={path} target="_blank" rel="noopener noreferrer" aria-label={`Ver a página ${pagina.title} no site`}>
                      <ExternalLink /> Ver
                    </a>
                  </Button>
                  {!pagina.is_system && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive-ink"
                      aria-label={`Apagar a página ${pagina.title}`}
                      disabled={remove.isPending}
                      onClick={() => handleDelete(pagina.id, pagina.title)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
