import * as React from 'react'
import DOMPurify from 'dompurify'
import { RICH_TEXT_CLASS } from '@/lib/richText'
import { cn } from '@/lib/utils'

interface RichTextRendererProps {
  html: string | null | undefined
  className?: string
}

// Regra fixa do projeto (docs/PRD.md seção 5): todo HTML gerado por usuário
// (Tiptap) passa por DOMPurify antes de ir para dangerouslySetInnerHTML.
export function RichTextRenderer({ html, className }: RichTextRendererProps) {
  const sanitized = React.useMemo(() => DOMPurify.sanitize(html ?? ''), [html])

  if (!sanitized) return null

  return <div className={cn(RICH_TEXT_CLASS, className)} dangerouslySetInnerHTML={{ __html: sanitized }} />
}
