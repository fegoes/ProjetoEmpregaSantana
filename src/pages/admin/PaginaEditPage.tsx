import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, FileQuestion } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useAllPaginasInstitucionais,
  usePaginaPorId,
  useSavePagina,
  type Pagina,
  type PaginaChanges,
} from '@/hooks/usePaginasInstitucionais'
import { EditorContext } from '@/components/pages/editor/editorContext'
import { CheckField, Field, OptionGroup } from '@/components/pages/editor/fields'
import { PageBuilder } from '@/components/pages/editor/PageBuilder'
import { PagePreview } from '@/components/pages/editor/PagePreview'
import { EmptyState } from '@/components/EmptyState'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  SITE_LINK_TARGETS,
  collectIssues,
  homeStarterLayout,
  isValidSlug,
  layoutFromHtml,
  normalizeLayout,
  pagePath,
  parseLayout,
  type PageLayout,
} from '@/lib/pageLayout'
import { cn } from '@/lib/utils'

type Device = 'desktop' | 'mobile'

function saveErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String((error as { message: unknown }).message) : ''
  if (/duplicate|unique|23505/i.test(message)) return 'Já existe outra página com esse endereço. Troque o endereço na aba Configurações.'
  if (/layout|show_in|is_published|seo_description|column/i.test(message)) {
    return 'O banco de dados ainda não recebeu a atualização das páginas em seções. Aplique as migrações (supabase db push) e tente de novo.'
  }
  if (/row-level security|permission|42501/i.test(message)) return 'Sem permissão para salvar esta página. Entre de novo como superadmin.'
  return 'Não foi possível salvar. Confira a conexão e tente de novo.'
}

function PageEditor({ pagina }: { pagina: Pagina }) {
  const { user } = useAuth()
  const save = useSavePagina()
  const { data: todas } = useAllPaginasInstitucionais()

  const system = pagina.is_system
  const [title, setTitle] = React.useState(pagina.title)
  const [slug, setSlug] = React.useState(pagina.slug)
  const [seo, setSeo] = React.useState(pagina.seo_description ?? '')
  const [published, setPublished] = React.useState(pagina.is_published)
  const [inHeader, setInHeader] = React.useState(pagina.show_in_header)
  const [inFooter, setInFooter] = React.useState(pagina.show_in_footer)
  const [layout, setLayout] = React.useState<PageLayout | null>(() => parseLayout(pagina.layout))
  const [contentHtml, setContentHtml] = React.useState(pagina.content_html)
  const [device, setDevice] = React.useState<Device>('desktop')
  const [message, setMessage] = React.useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const snapshot = JSON.stringify({ title, slug, seo, published, inHeader, inFooter, layout, contentHtml })
  const [savedSnapshot, setSavedSnapshot] = React.useState(snapshot)
  const dirty = snapshot !== savedSnapshot

  React.useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const linkTargets = React.useMemo(
    () => [
      ...SITE_LINK_TARGETS,
      ...(todas ?? [])
        .filter((p) => !p.is_system)
        .map((p) => ({ path: pagePath(p.slug, false), label: p.is_published ? p.title : `${p.title} (rascunho)` })),
    ],
    [todas],
  )

  const issues = React.useMemo(() => (layout ? collectIssues(layout) : []), [layout])
  const path = pagePath(system ? pagina.slug : slug, system)

  const handleSave = async () => {
    if (!user) return
    setMessage(null)
    if (!title.trim()) return setMessage({ kind: 'error', text: 'A página precisa de um nome.' })
    if (!system && !isValidSlug(slug)) {
      return setMessage({ kind: 'error', text: 'O endereço deve ter só letras minúsculas, números e hífens. Corrija na aba Configurações.' })
    }
    const cleaned = layout ? normalizeLayout(layout) : null
    const changes: PaginaChanges = {
      title: title.trim(),
      seo_description: seo.trim() || null,
      content_html: contentHtml,
      layout: cleaned,
      ...(system ? {} : { slug, is_published: published, show_in_header: inHeader, show_in_footer: inFooter }),
    }
    try {
      await save.mutateAsync({ id: pagina.id, changes, userId: user.id })
      setLayout(cleaned)
      setSavedSnapshot(JSON.stringify({ title: title.trim(), slug, seo: seo.trim(), published, inHeader, inFooter, layout: cleaned, contentHtml }))
      if (title !== title.trim()) setTitle(title.trim())
      if (seo !== seo.trim()) setSeo(seo.trim())
      setMessage({ kind: 'ok', text: 'Alterações salvas.' })
    } catch (error) {
      setMessage({ kind: 'error', text: saveErrorMessage(error) })
    }
  }

  const startLayout = (next: PageLayout) => {
    setLayout(next)
    setMessage(null)
  }

  const resetHome = () => {
    if (window.confirm('Voltar ao desenho padrão do site? As seções montadas aqui deixam de aparecer (ao salvar).')) setLayout(null)
  }

  return (
    <EditorContext.Provider value={{ pageId: pagina.id, linkTargets }}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Link
            to="/admin/paginas"
            onClick={(e) => {
              if (dirty && !window.confirm('Há alterações sem salvar. Sair mesmo assim?')) e.preventDefault()
            }}
            className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline md:min-h-9"
          >
            <ArrowLeft className="size-4" /> Páginas do site
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold tracking-tight">{title || 'Sem nome'}</h1>
              <p className="text-sm text-muted-foreground">
                {path}
                {system ? ' · página do sistema' : published ? ' · publicada' : ' · rascunho'}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={path} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Ver no site
              </a>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="editar" className="gap-4">
          <TabsList className="h-11 w-full sm:w-fit">
            <TabsTrigger value="editar" className="px-5">
              Editar
            </TabsTrigger>
            <TabsTrigger value="visualizar" className="px-5" disabled={!layout}>
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="config" className="px-5">
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editar" className="flex flex-col gap-4">
            {layout ? (
              <>
                {issues.length > 0 && (
                  <div role="status" className="rounded-xl bg-brand-orange/12 p-4 text-sm">
                    <p className="font-semibold">Vale conferir antes de publicar</p>
                    <ul className="mt-1.5 list-disc pl-5 text-muted-foreground">
                      {issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid min-w-0 items-start gap-6 xl:grid-cols-2">
                  <div id="edicao-pagina" className="min-w-0 scroll-mt-20"><a href="#previa-pagina" className="mb-3 inline-flex min-h-11 items-center text-sm text-primary underline xl:hidden">Ver prévia das alterações</a><p className="mb-4 text-sm text-muted-foreground">Crie seções, escolha as cores e edite seus itens no mesmo lugar. Arraste seções e blocos pela alça ou use Subir e Descer.</p><PageBuilder sections={layout.sections} onChange={(sections) => setLayout({ ...layout, sections })} /></div>
                  <aside id="previa-pagina" className="min-w-0 scroll-mt-20 space-y-3 xl:sticky xl:top-6"><a href="#edicao-pagina" className="inline-flex min-h-11 items-center text-sm text-primary underline xl:hidden">Voltar à edição das seções</a><h2 className="font-semibold">Prévia em tempo real</h2><OptionGroup label="Dispositivo da prévia" value={device} options={[{ value: 'desktop', label: 'Computador' }, { value: 'mobile', label: 'Celular' }]} onChange={setDevice} /><p className="text-xs text-muted-foreground">Conteúdo, cores e dimensões aparecem aqui antes de salvar. Use Visualizar para ampliar.</p><PagePreview layout={layout} title={title} device={device} /></aside>
                </div>
                {pagina.slug === 'inicio' && (
                  <div>
                    <Button type="button" variant="ghost" size="sm" className="text-destructive-ink" onClick={resetHome}>
                      Voltar ao desenho padrão do site
                    </Button>
                  </div>
                )}
              </>
            ) : pagina.slug === 'inicio' ? (
              <div className="flex max-w-xl flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Hoje a página inicial mostra o desenho padrão do site: a apresentação do projeto e as imagens editoriais. Para
                  mudar, comece por um modelo em seções e revise os textos, as cores e as imagens antes de publicar.
                </p>
                <Button type="button" className="self-start" onClick={() => startLayout(homeStarterLayout())}>
                  Personalizar a página inicial
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="max-w-xl text-sm text-muted-foreground">
                  Esta página tem só um campo de texto. Para usar seções de largura total, imagens de fundo, slides e botões, passe para o modo em
                  seções. O texto atual vai junto, sem perder nada.
                </p>
                <RichTextEditor value={contentHtml} onChange={setContentHtml} />
                <Button
                  type="button"
                  variant="outline"
                  className="self-start"
                  onClick={() => startLayout(layoutFromHtml(title.trim() || pagina.title, contentHtml))}
                >
                  Montar com seções
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="visualizar" className="flex flex-col gap-3">
            <OptionGroup
              label="Ver como"
              value={device}
              options={[
                { value: 'desktop', label: 'Computador' },
                { value: 'mobile', label: 'Celular' },
              ]}
              onChange={setDevice}
              hint="É uma prévia do que está na tela agora, mesmo sem salvar. As listas de vagas aparecem só como aviso."
            />
            {layout && (
              <PagePreview layout={layout} title={title} device={device} />
            )}
          </TabsContent>

          <TabsContent value="config" className="flex max-w-xl flex-col gap-5">
            <Field label="Nome da página" htmlFor="cfg-titulo">
              <Input id="cfg-titulo" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
            </Field>

            {!system && (
              <Field
                label="Endereço"
                htmlFor="cfg-slug"
                hint="Se você trocar, o link antigo deixa de funcionar. Só letras minúsculas, números e hífens."
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-sm text-muted-foreground">/pagina/</span>
                  <Input
                    id="cfg-slug"
                    value={slug}
                    maxLength={60}
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={!isValidSlug(slug)}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  />
                </div>
              </Field>
            )}

            <Field
              label="Resumo para o Google e para prévias de link (opcional)"
              htmlFor="cfg-seo"
              hint={`${seo.length}/300. Se ficar vazio, usamos o começo do texto da página.`}
            >
              <Textarea id="cfg-seo" rows={3} maxLength={300} value={seo} onChange={(e) => setSeo(e.target.value)} />
            </Field>

            {!system && (
              <div className="flex flex-col gap-1">
                <OptionGroup
                  label="Situação"
                  value={published ? 'on' : 'off'}
                  options={[
                    { value: 'off', label: 'Rascunho' },
                    { value: 'on', label: 'Publicada' },
                  ]}
                  onChange={(v) => setPublished(v === 'on')}
                  hint="Rascunho: só o superadmin vê a página. Publicada: qualquer pessoa com o link."
                />
                <p className="mt-3 text-sm font-medium">Onde aparece o link</p>
                <CheckField label="No menu do topo" checked={inHeader} onChange={setInHeader} />
                <CheckField label="No rodapé" checked={inFooter} onChange={setInFooter} />
                {!published && (inHeader || inFooter) && (
                  <p className="text-xs text-muted-foreground">O link só aparece depois que a página for publicada.</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:rounded-xl sm:border sm:px-4">
          <Button onClick={handleSave} disabled={save.isPending || !dirty}>
            {save.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
          <p
            role={message?.kind === 'error' ? 'alert' : 'status'}
            className={cn('text-sm', message?.kind === 'error' ? 'text-destructive-ink' : 'text-muted-foreground')}
          >
            {message ? message.text : dirty ? 'Há alterações sem salvar.' : ''}
          </p>
        </div>
      </div>
    </EditorContext.Provider>
  )
}

export default function AdminPaginaEditPage() {
  const { id } = useParams()
  const { data: pagina, isLoading, isError } = usePaginaPorId(id)

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (isError || !pagina) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Página não encontrada"
        description="Ela pode ter sido apagada."
        action={
          <Button asChild variant="outline">
            <Link to="/admin/paginas">Voltar para as páginas</Link>
          </Button>
        }
      />
    )
  }
  return <PageEditor key={pagina.id} pagina={pagina} />
}
