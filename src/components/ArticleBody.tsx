import { ExpandableImage } from '@/components/ImageLightbox'
import { PostContent } from '@/components/PostContent'
import { editorialPreviewSrc } from '@/content/editorialImages'
import { EDITORIAL_TIME_ZONE } from '@/lib/editorial'
import type { ArtigoInput } from '@/hooks/useArtigos'

export function ArticleBody({ article, categories }: { article: ArtigoInput; categories?: string[] }) {
  return <article className="min-w-0 break-words"><div className="mx-auto max-w-3xl px-4">
    <p className="mb-4 text-sm text-primary">{categories?.join(' · ')||article.category}</p>
    <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-brand-ink sm:text-4xl">{article.title||'Título do seu artigo'}</h1>
    {article.excerpt&&<p className="mt-6 text-lg leading-loose text-muted-foreground">{article.excerpt}</p>}
    <p className="my-7 border-y py-4 text-sm text-muted-foreground">{article.author_name||'Autor'}{article.published_at&&` · ${new Intl.DateTimeFormat('pt-BR',{timeZone:EDITORIAL_TIME_ZONE,dateStyle:'long',timeStyle:'short'}).format(new Date(article.published_at))}`}{article.location&&` · ${article.location}`}</p>
    {article.cover_url&&<ExpandableImage src={editorialPreviewSrc(article.cover_url)} alt={article.cover_alt??''} width={1536} height={1024} className="aspect-[3/2] w-full rounded-xl bg-accent/30 object-contain" />}
    </div><div className="mt-9"><PostContent html={article.content_html ?? ''} /></div>
  </article>
}
