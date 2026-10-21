import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { articleError, useArtigos, useDeleteArtigo, useSaveArtigo, type Artigo, type ArtigoInput } from '@/hooks/useArtigos'
import { RichTextEditor } from '@/components/RichTextEditor'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/EmptyState'
import { stripHtml } from '@/lib/utils'

function ArticleEditor({ article, close }: { article?: Artigo; close: () => void }) {
  const { user, profile } = useAuth()
  const save = useSaveArtigo()
  const preview = useRef<HTMLDialogElement>(null)
  const [form, setForm] = useState<ArtigoInput>({ id: article?.id, title: article?.title ?? '', slug: article?.slug ?? '', excerpt: article?.excerpt ?? '', content_html: article?.content_html ?? '', category: article?.category ?? 'Carreira', author_name: article?.author_name ?? profile?.full_name ?? '', author_id: article?.author_id ?? user?.id, cover_url: article?.cover_url ?? null, cover_alt: article?.cover_alt ?? '', status: article?.status ?? 'draft', published_at: article?.published_at ?? null })
  const [validation, setValidation] = useState('')
  const field = <K extends keyof ArtigoInput>(key: K, value: ArtigoInput[K]) => setForm(f => ({ ...f, [key]: value }))
  async function submit(e: FormEvent) {
    e.preventDefault()
    setValidation('')
    if (form.status === 'published' && !stripHtml(form.content_html)) { setValidation('Escreva o conteúdo antes de publicar.'); return }
    if (form.cover_url && !form.cover_alt?.trim()) { setValidation('Descreva a imagem de capa para quem usa leitor de tela.'); return }
    save.mutate({ ...form, title: form.title.trim(), slug: form.slug.trim(), author_name: form.author_name.trim(), category: form.category?.trim(), cover_url: form.cover_url?.trim() || null }, { onSuccess: close })
  }
  return <section className="rounded-2xl border bg-card p-5 sm:p-7" aria-label="Editor de artigo"><h2 className="mb-6 text-xl font-bold">{article ? 'Editar artigo' : 'Novo artigo'}</h2><form onSubmit={submit} className="flex flex-col gap-5">
    <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="article-title">Título</Label><Input id="article-title" required maxLength={180} value={form.title} onChange={e => field('title', e.target.value)} /></div><div className="space-y-2"><Label htmlFor="article-slug">Endereço do artigo (slug)</Label><Input id="article-slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="como-montar-seu-curriculo" value={form.slug} onChange={e => field('slug', e.target.value.toLowerCase())} /><p className="text-xs text-muted-foreground">Letras minúsculas, números e hífens. Alterar um endereço publicado pode quebrar links compartilhados.</p></div></div>
    <div className="space-y-2"><Label htmlFor="article-excerpt">Resumo</Label><textarea id="article-excerpt" maxLength={500} className="min-h-24 w-full rounded-lg border px-3 py-2 text-base" value={form.excerpt} onChange={e => field('excerpt', e.target.value)} /></div>
    <div className="space-y-2"><Label>Conteúdo</Label><RichTextEditor ariaLabel="Conteúdo do artigo" value={form.content_html ?? ''} onChange={value => field('content_html', value)} /></div>
    <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="article-category">Categoria</Label><Input id="article-category" required maxLength={80} value={form.category} onChange={e => field('category', e.target.value)} /></div><div className="space-y-2"><Label htmlFor="article-author">Autoria</Label><Input id="article-author" required maxLength={120} value={form.author_name} onChange={e => field('author_name', e.target.value)} /></div><div className="space-y-2"><Label htmlFor="article-cover">Imagem de capa (opcional)</Label><Input type="url" pattern="https://.*" id="article-cover" placeholder="https://…" value={form.cover_url ?? ''} onChange={e => field('cover_url', e.target.value || null)} /></div><div className="space-y-2"><Label htmlFor="article-alt">Descrição da imagem</Label><Input id="article-alt" value={form.cover_alt} onChange={e => field('cover_alt', e.target.value)} /></div></div>
    <div className="space-y-2"><Label htmlFor="article-status">Visibilidade</Label><select id="article-status" value={form.status} onChange={e => field('status', e.target.value as Artigo['status'])} className="min-h-11 w-full rounded-lg border bg-card px-3 text-base"><option value="draft">Rascunho — somente administradores</option><option value="published">Publicado — visível no blog</option><option value="archived">Arquivado — fora do blog</option></select></div>
    {(validation || save.isError) && <p role="alert" className="text-sm text-destructive">{validation || articleError(save.error)}</p>}
    <div className="flex flex-wrap gap-3"><Button type="submit" variant="cta" disabled={save.isPending}>{save.isPending ? 'Salvando…' : 'Salvar artigo'}</Button><Button type="button" variant="outline" onClick={() => preview.current?.showModal()}>Pré-visualizar</Button><Button type="button" variant="ghost" onClick={close} disabled={save.isPending}>Cancelar</Button></div>
  </form><dialog ref={preview} aria-label="Prévia do artigo" className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-3xl rounded-2xl border bg-card p-6 text-foreground backdrop:bg-brand-ink/50"><div className="mb-6 flex items-center justify-between gap-4"><strong>Prévia privada · alterações ainda não salvas</strong><Button variant="outline" onClick={() => preview.current?.close()}>Fechar</Button></div><h2 className="text-3xl font-extrabold">{form.title}</h2><p className="my-5 text-muted-foreground">{form.excerpt}</p><RichTextRenderer html={form.content_html} className="[&_h2]:mt-6 [&_h2]:text-2xl" /></dialog></section>
}

export default function ArtigosPage() {
  const query = useArtigos(true)
  const remove = useDeleteArtigo()
  const [editor, setEditor] = useState<Artigo | 'new' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [search, setSearch] = useState('')
  return <div className="flex flex-col gap-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-extrabold tracking-tight">Artigos do blog</h1><p className="mt-2 text-sm text-muted-foreground">Crie orientações, revise e publique no site.</p></div><Button variant="cta" disabled={editor !== null} onClick={() => { setFeedback(''); setEditor('new') }}><Plus />Novo artigo</Button></div>
    {editor !== null && <ArticleEditor key={editor === 'new' ? 'new' : editor.id} article={editor === 'new' ? undefined : editor} close={() => { setEditor(null); setFeedback('Editor fechado. Os artigos salvos aparecem na lista abaixo.') }} />}
    {feedback && <p role="status" className="text-sm text-primary">{feedback}</p>}
    {query.isLoading && <p role="status">Carregando artigos…</p>}
    {query.isError && <div role="alert"><p className="text-sm text-destructive">{articleError(query.error)}</p><Button variant="outline" className="mt-3" onClick={() => query.refetch()}>Tentar novamente</Button></div>}
    {remove.isError && <p role="alert" className="text-sm text-destructive">Não foi possível excluir. Tente novamente e confira sua permissão.</p>}
    {!!query.data?.length && <Input aria-label="Buscar artigos pelo título" placeholder="Buscar pelo título…" value={search} onChange={e => setSearch(e.target.value)} />}
    {query.data?.filter(a => a.title.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).map(a => <article key={a.id} className="rounded-2xl border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-lg font-bold">{a.title}</h2><p className="mt-2 text-xs text-muted-foreground">{a.category} · {a.author_name}</p></div><span className="rounded-full bg-accent px-3 py-1 text-xs text-primary">{{ draft: 'Rascunho', published: 'Publicado', archived: 'Arquivado' }[a.status]}</span></div><div className="mt-5 flex flex-wrap gap-3"><Button variant="outline" size="sm" disabled={editor !== null} onClick={() => { setEditor(a); setFeedback(''); window.scrollTo({ top: 0 }) }}>Editar</Button>{a.status === 'published' && <Button asChild variant="outline" size="sm"><Link to={`/blog/${a.slug}`}>Ver no blog</Link></Button>}<Button variant="ghost" size="sm" className="text-destructive" disabled={remove.isPending || editor !== null} onClick={() => { if (window.confirm(`Excluir permanentemente o artigo “${a.title}”? Para apenas retirar do blog, edite e escolha Arquivado.`)) remove.mutate(a.id, { onSuccess: () => setFeedback('Artigo excluído.') }) }}>Excluir</Button></div></article>)}
    {!query.isLoading && !query.isError && query.data?.length === 0 && <EmptyState icon={BookOpen} title="Nenhum artigo criado" description="Comece com uma orientação útil para quem procura trabalho ou oferece serviços." />}
  </div>
}
