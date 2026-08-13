import * as React from 'react'
import DOMPurify from 'dompurify'
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

  return (
    <div
      className={cn(
        'max-w-none text-sm leading-relaxed [&_a]:underline [&_a]:text-primary [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
