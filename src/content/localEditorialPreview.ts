import type { Artigo } from '@/hooks/useArtigos'
import { editorialDrafts } from './editorialDrafts'
import { editorialImage } from './editorialImages'

/** Local previews never replace database content or appear in a production build. */
export const localEditorialPreview: Artigo[] = import.meta.env.DEV ? editorialDrafts.map((draft, index) => {
  const cover = editorialImage(draft.category ?? '')
  return {
    id: `local-editorial-${index}`, slug: draft.slug, title: draft.title,
    excerpt: draft.excerpt ?? '', content_html: draft.content_html ?? '', category: draft.category ?? '',
    author_name: draft.author_name ?? 'Equipe EmpregaSantana', author_id: null,
    cover_url: cover.src, cover_alt: cover.alt, social_image_url: cover.src, social_image_alt: cover.alt,
    seo_title: draft.seo_title ?? '', seo_description: draft.seo_description ?? '',
    social_title: draft.social_title ?? '', social_description: draft.social_description ?? '',
    keywords: draft.keywords ?? [], canonical_url: null, noindex: true,
    status: 'published', published_at: '2026-10-23T12:00:00Z',
    created_at: '2026-10-23T12:00:00Z', updated_at: '2026-10-23T12:00:00Z',
  }
}) : []
