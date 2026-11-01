import { safeSectionColor } from './pageLayout'
import { newBlockId } from './blocks'
export interface PostSection { id: string; name: string; background: string; color: string; link: string; width: 'reading' | 'wide' | 'screen'; contentWidth: 'reading' | 'wide' | 'full'; spacing: number; height: 'auto' | 'screen'; html: string }
export const newPostSection = (html = ''): PostSection => ({ id: newBlockId(), name: 'Nova seção', background: '#ffffff', color: '#333333', link: '#1e63b6', width: 'reading', contentWidth: 'reading', spacing: 24, height: 'auto', html })
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export function parsePostSections(html: string): PostSection[] | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const nodes = Array.from(doc.body.children)
  if (!nodes.length || !nodes.every(n => n.hasAttribute('data-post-section'))) return null
  return nodes.map(n => { const d = newPostSection(); return { ...d, name: (n.getAttribute('data-name') || d.name).slice(0, 80), background: safeSectionColor(n.getAttribute('data-background')) || d.background, color: safeSectionColor(n.getAttribute('data-color')) || d.color, link: safeSectionColor(n.getAttribute('data-link')) || d.link, width: n.getAttribute('data-width') === 'screen' ? 'screen' : n.getAttribute('data-width') === 'wide' ? 'wide' : 'reading', contentWidth: n.getAttribute('data-content-width') === 'full' ? 'full' : n.getAttribute('data-content-width') === 'wide' ? 'wide' : 'reading', spacing: Math.min(96, Math.max(0, Number(n.getAttribute('data-spacing')) || 0)), height: n.getAttribute('data-height') === 'screen' ? 'screen' : 'auto', html: n.querySelector(':scope > [data-section-body]')?.innerHTML ?? n.innerHTML } })
}
export function serializePostSections(sections: PostSection[]): string {
  return sections.map(s => `<section data-post-section data-name="${escape(s.name)}" data-background="${safeSectionColor(s.background)}" data-color="${safeSectionColor(s.color)}" data-link="${safeSectionColor(s.link)}" data-width="${s.width}" data-content-width="${s.contentWidth}" data-spacing="${Math.min(96, Math.max(0, s.spacing))}" data-height="${s.height}"><div data-section-body>${s.html}</div></section>`).join('')
}
export function postVideo(value: string): { provider: string; href: string; embed?: string } | null {
  try { const u = new URL(value); if (u.protocol !== 'https:') return null; const host = u.hostname.replace(/^www\./, ''); let id = ''
    if (host === 'youtu.be') id = u.pathname.slice(1)
    if (host === 'youtube.com' || host === 'm.youtube.com') id = u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] || ''
    if (/^[\w-]{11}$/.test(id)) return { provider: 'YouTube', href: u.href, embed: `https://www.youtube.com/embed/${id}` }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') { const match = u.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([\w]+))?\/?$/); if (match) { const h = u.searchParams.get('h') || match[2]; return { provider: 'Vimeo', href: u.href, embed: `https://player.vimeo.com/video/${match[1]}${h ? `?h=${encodeURIComponent(h)}` : ''}` } } }
    if (host === 'instagram.com' && /^\/(p|reel|tv)\/[^/]+/.test(u.pathname)) return { provider: 'Instagram', href: u.href }
    return null
  } catch { return null }
}
export function postContentIssues(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, 'text/html'), issues: string[] = []
  for (const video of doc.querySelectorAll('[data-post-video]')) if (!postVideo(video.querySelector('a')?.getAttribute('href') || '')) issues.push('Complete o link de cada vídeo com um endereço válido do YouTube, Vimeo ou Instagram.')
  for (const gallery of doc.querySelectorAll('[data-post-gallery]')) if (!gallery.querySelector('img[src]:not([src=""])')) issues.push('Adicione ao menos uma imagem em cada galeria ou bloco de slides.')
  return [...new Set(issues)]
}
