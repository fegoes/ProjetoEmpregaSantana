import { Node } from '@tiptap/react'
import DOMPurify from 'dompurify'
/** Preserva mídias inseridas entre parágrafos sem expor marcação ativa no editor. */
export const PostMediaNode = Node.create<{ localRefs: () => string[] }>({
 name: 'postMedia', group: 'block', atom: true, selectable: true, draggable: true,
 addOptions: () => ({ localRefs: () => [] }),
 addAttributes: () => ({ html: { default: '' } }),
 parseHTML: () => ['figure[data-post-gallery]', 'div[data-post-video]', 'aside[data-post-ad]'].map(tag => ({ tag, priority: 1000, getAttrs: element => ({ html: element.outerHTML }) })),
 renderHTML({ node }) {
  let html = String(node.attrs.html)
  const placeholders = this.options.localRefs().map((ref, index) => [ref, `https://draft-preview.invalid/media-${index}`] as const)
  for (const [ref, placeholder] of placeholders) html = html.replaceAll(ref, placeholder)
  html = DOMPurify.sanitize(html)
  for (const [ref, placeholder] of placeholders) html = html.replaceAll(placeholder, ref)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const element = doc.body.firstElementChild ?? document.createElement('div')
  if (!element.textContent?.trim() && !element.querySelector('img[src]')) element.textContent = element.hasAttribute('data-post-gallery') ? 'Galeria' : 'Mídia'
  return element as HTMLElement
 },
})
