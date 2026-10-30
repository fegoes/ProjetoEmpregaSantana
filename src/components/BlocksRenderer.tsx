import * as React from 'react'
import DOMPurify from 'dompurify'
import { ChevronDown } from 'lucide-react'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { parseBlocks } from '@/lib/blocks'
import { RICH_TEXT_CLASS } from '@/lib/richText'
import { cn } from '@/lib/utils'

interface BlocksRendererProps {
  html: string | null | undefined
  /** Nível do título de cada bloco (2 = logo abaixo do título da página; 3 = dentro de uma seção). */
  headingLevel?: 2 | 3
  className?: string
}

/**
 * Descrição em sanfona: cada bloco ("Sobre a vaga", "Requisitos"...) abre e fecha.
 * O primeiro já vem aberto. Texto antigo, sem blocos, aparece como parágrafos normais.
 */
export function BlocksRenderer({ html, headingLevel = 3, className }: BlocksRendererProps) {
  const parsed = React.useMemo(() => parseBlocks(DOMPurify.sanitize(html ?? '')), [html])

  if (parsed.blocks.length === 0) return null
  if (!parsed.structured) return <RichTextRenderer html={html} className={className} />

  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <div className={cn('flex flex-col divide-y overflow-hidden rounded-2xl border bg-card', className)}>
      {parsed.blocks.map((block, index) => (
        <details key={block.id} open={index === 0} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
            <Heading className="font-display text-base font-bold">{block.title || 'Informações'}</Heading>
            <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
          </summary>
          <div className={cn(RICH_TEXT_CLASS, 'px-4 pt-1 pb-4 text-[15px]')} dangerouslySetInnerHTML={{ __html: block.html }} />
        </details>
      ))}
    </div>
  )
}
