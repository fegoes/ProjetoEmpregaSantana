import type { Node } from '@tiptap/pm/model'
export type MediaPlacement = 'cursor' | 'before' | 'after' | 'start' | 'end'
export function insertionRange(doc: Node, selection: { from: number; to: number }, placement: MediaPlacement) {
 const from = Math.max(0, Math.min(doc.content.size, selection.from))
 const to = Math.max(from, Math.min(doc.content.size, selection.to))
 if (placement === 'start') return { from: 0, to: 0 }
 if (placement === 'end') return { from: doc.content.size, to: doc.content.size }
 if (placement === 'cursor') return { from, to: from }
 const position = doc.resolve(from)
 for (let depth = position.depth; depth > 0; depth--) if (position.node(depth).isTextblock) {
  const at = placement === 'before' ? position.before(depth) : position.after(depth)
  return { from: at, to: at }
 }
 return { from: placement === 'before' ? from : to, to: placement === 'before' ? from : to }
}
export const MEDIA_WIDTHS = ['50%', '75%', '100%'] as const
export type MediaAlign = 'left' | 'center' | 'right'
export function mediaPresentation(align: string, width: string) {
 return { display: 'block' as const, width: MEDIA_WIDTHS.includes(width as typeof MEDIA_WIDTHS[number]) ? width : '100%', maxWidth: '100%', marginLeft: align === 'left' ? '0' : 'auto', marginRight: align === 'right' ? '0' : 'auto' }
}
export function mediaStyle(align: MediaAlign, width: string) {
 const style=mediaPresentation(align,width)
 return `display: ${style.display}; width: ${style.width}; max-width: ${style.maxWidth}; margin-left: ${style.marginLeft}; margin-right: ${style.marginRight}`
}
