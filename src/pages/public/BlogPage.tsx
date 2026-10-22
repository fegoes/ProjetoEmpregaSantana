import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { useArtigo, useArtigos, type Artigo } from '@/hooks/useArtigos'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { JsonLd } from '@/components/JsonLd'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'

function ArticleCover({ article }: { article: Pick<Artigo, 'title' | 'cover_url' | 'cover_alt' | 'category'> }) {
  return article.cover_url ? <img src={article.cover_url} alt={article.cover_alt} className="aspect-[16/9] w-full rounded-2xl bg-accent/30 object-contain" loading="lazy" width={800} height={450} /> : <div className="flex aspect-[16/9] flex-col justify-center rounded-2xl bg-accent p-6 text-brand-ink"><span className="max-w-sm font-display text-2xl leading-snug font-extrabold sm:text-3xl">{article.title}</span></div>
}

export default function BlogPage() {
  const query = useArtigos()
  const [category, setCategory] = useState('Todos')
  const categories = ['Todos', ...new Set(query.data?.map(a => a.category) ?? [])]
  const filtered = query.data?.filter(a => category === 'Todos' || a.category === category) ?? []
  const featured = filtered[0]
  useDocumentMeta({ title: 'Dicas de carreira', description: 'Orientação para procurar trabalho, apresentar seu talento e criar novas oportunidades.', canonical: '/blog' })
  return <div className="flex flex-col gap-8">
    <section className="relative overflow-hidden rounded-3xl bg-accent/50 px-6 py-10 sm:px-10 lg:pr-72"><img src="/illustrations/nossa-gente.png" alt="" width="1536" height="1024" className="right-6 bottom-0 hidden h-52 w-64 object-contain lg:absolute lg:block" /><h1 className="max-w-3xl text-3xl leading-tight font-extrabold tracking-tight text-brand-ink sm:text-5xl">Orientação para<br />o seu próximo passo.</h1><p className="mt-5 max-w-xl text-sm leading-loose text-muted-foreground">Ideias práticas para procurar trabalho, apresentar seu talento e criar novas oportunidades.</p></section>
    {query.isLoading && <p role="status">Carregando orientações…</p>}
    {query.isError && <div role="alert" className="rounded-xl border p-6"><p>Não foi possível carregar os artigos.</p><Button onClick={() => query.refetch()} variant="outline" className="mt-4">Tentar novamente</Button></div>}
    {!query.isLoading && !query.isError && <>
      <div className="flex flex-wrap gap-2" aria-label="Categorias">{categories.map(c => <button type="button" aria-pressed={category === c} key={c} onClick={() => setCategory(c)} className={`min-h-11 rounded-full border px-4 py-2 text-xs ${category === c ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'}`}>{c}</button>)}</div>
      {featured ? <><article className="grid items-center gap-7 md:grid-cols-2 md:gap-12"><Link to={`/blog/${featured.slug}`}><ArticleCover article={featured} /></Link><div><span className="text-xs font-medium text-primary">{featured.category}</span><h2 className="mt-4 text-2xl leading-snug font-extrabold tracking-tight text-brand-ink sm:text-3xl"><Link to={`/blog/${featured.slug}`}>{featured.title}</Link></h2><p className="mt-4 text-sm leading-loose text-muted-foreground">{featured.excerpt}</p><p className="mt-4 text-xs text-muted-foreground">{featured.author_name} · {new Date(featured.published_at!).toLocaleDateString('pt-BR')}</p><Link to={`/blog/${featured.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">Ler orientação<ArrowRight className="size-4" /></Link></div></article><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{filtered.slice(1).map(a => <article key={a.id}><Link to={`/blog/${a.slug}`}><ArticleCover article={a} /><p className="mt-5 text-xs text-primary">{a.category}</p><h2 className="mt-3 text-lg leading-relaxed font-bold text-brand-ink">{a.title}</h2><p className="mt-3 text-sm leading-loose text-muted-foreground">{a.excerpt}</p></Link></article>)}</div></> : <EmptyState icon={BookOpen} title="Novas orientações em breve" description="Enquanto isso, explore as oportunidades da região." action={<Button asChild variant="outline"><Link to="/explorar">Explorar vagas</Link></Button>} />}
    </>}
  </div>
}

export function BlogArticlePage() {
  const { slug } = useParams()
  const query = useArtigo(slug)
  const article = query.data
  useDocumentMeta({ title: article?.seo_title || article?.title || 'Artigo', description: article?.seo_description || article?.excerpt, image: article?.social_image_url || article?.cover_url || undefined, socialTitle: article?.social_title || article?.title, socialDescription: article?.social_description || article?.excerpt, imageAlt: article?.social_image_alt || article?.cover_alt, keywords: article?.keywords, noindex: article?.noindex, type: 'article', canonical: article?.canonical_url || (slug ? `/blog/${slug}` : '/blog') })
  if (query.isLoading) return <p role="status">Carregando artigo…</p>
  if (query.isError) return <div role="alert"><p>Não foi possível carregar este artigo.</p><Button onClick={() => query.refetch()} variant="outline" className="mt-4">Tentar novamente</Button></div>
  if (!article) return <EmptyState icon={BookOpen} title="Artigo não encontrado" description="Este conteúdo pode ter sido retirado do ar." action={<Button asChild variant="outline"><Link to="/blog">Voltar às orientações</Link></Button>} />
  return <article className="mx-auto max-w-3xl">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title, description: article.excerpt, datePublished: article.published_at, dateModified: article.updated_at, author: { '@type': 'Person', name: article.author_name }, ...(article.cover_url ? { image: article.cover_url } : {}) }} />
    <Link to="/blog" className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm text-primary"><ArrowLeft className="size-4" />Voltar às dicas de carreira</Link><h1 className="text-3xl leading-tight font-extrabold tracking-tight text-brand-ink sm:text-5xl">{article.title}</h1><p className="mt-6 text-lg leading-loose text-muted-foreground">{article.excerpt}</p><p className="my-7 border-y py-4 text-xs text-muted-foreground">{article.author_name} · Publicado em {new Date(article.published_at!).toLocaleDateString('pt-BR')}</p>{article.cover_url && <ArticleCover article={article} />}<RichTextRenderer html={article.content_html} className="mt-9 text-base leading-loose [&_h2]:mt-9 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_p]:mb-5" /><div className="mt-10 rounded-2xl border bg-card p-6"><h2 className="text-xl font-bold">Vamos dar o próximo passo?</h2><p className="mt-3 text-sm text-muted-foreground">Encontre oportunidades e profissionais da região.</p><Button asChild variant="cta" className="mt-5"><Link to="/explorar">Explorar oportunidades<ArrowRight /></Link></Button></div>
  </article>
}
