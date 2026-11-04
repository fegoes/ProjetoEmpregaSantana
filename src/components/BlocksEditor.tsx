import { confirmAction } from '@/lib/confirmAction'
import * as React from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BLOCK_STARTERS,
  BLOCK_SUGGESTIONS,
  blocksToHtml,
  htmlText,
  newBlockId,
  parseBlocks,
  type BlocksKind,
  type DescriptionBlock,
} from '@/lib/blocks'
import { cn } from '@/lib/utils'

interface BlocksEditorProps {
  value: string
  onChange: (html: string) => void
  kind: BlocksKind
}

function initialBlocks(value: string, kind: BlocksKind): DescriptionBlock[] {
  const parsed = parseBlocks(value)
  if (parsed.blocks.length > 0) return parsed.blocks
  return BLOCK_STARTERS[kind].map((title) => ({ id: newBlockId(), title, html: '' }))
}

/**
 * Descrição em blocos: cada bloco tem título e um texto com negrito, itálico,
 * título e lista. Os blocos abrem e fecham (sanfona), o que mantém o formulário
 * curto no celular. O resultado sai como um HTML só (ver lib/blocks.ts).
 */
export function BlocksEditor({ value, onChange, kind }: BlocksEditorProps) {
  const [blocks, setBlocks] = React.useState<DescriptionBlock[]>(() => initialBlocks(value, kind))
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => new Set(blocks[0] ? [blocks[0].id] : []))
  const blocksRef = React.useRef(blocks)
  const lastEmitted = React.useRef(value)

  // O texto pode chegar depois (edição de uma vaga já salva): recomeça a partir dele.
  React.useEffect(() => {
    if (value === lastEmitted.current) return
    lastEmitted.current = value
    const next = initialBlocks(value, kind)
    blocksRef.current = next
    setBlocks(next)
    setOpenIds(new Set(next[0] ? [next[0].id] : []))
  }, [value, kind])

  const commit = (next: DescriptionBlock[]) => {
    blocksRef.current = next
    setBlocks(next)
    const html = blocksToHtml(next)
    lastEmitted.current = html
    onChange(html)
  }

  const update = (id: string, patch: Partial<DescriptionBlock>) =>
    commit(blocksRef.current.map((block) => (block.id === id ? { ...block, ...patch } : block)))

  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else return new Set([id])
      return next
    })

  const move = (index: number, delta: -1 | 1) => {
    const list = [...blocksRef.current]
    const target = index + delta
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    commit(list)
  }

  const remove = async (block: DescriptionBlock) => {
    if (!(await confirmAction(`Apagar o bloco "${block.title || 'sem título'}"? O texto dele será perdido.`))) {
      return
    }
    commit(blocksRef.current.filter((b) => b.id !== block.id))
  }

  const add = (title: string) => {
    const block: DescriptionBlock = { id: newBlockId(), title, html: '' }
    commit([...blocksRef.current, block])
    setOpenIds((current) => new Set(current).add(block.id))
    // foca o título (bloco em branco) ou o texto (título sugerido)
    window.setTimeout(() => {
      const root = document.getElementById(`block-${block.id}`)
      const target = title ? root?.querySelector<HTMLElement>('.ProseMirror') : root?.querySelector<HTMLElement>('input')
      target?.focus()
    }, 60)
  }

  const used = new Set(blocks.map((b) => b.title.trim().toLowerCase()))
  const suggestions = BLOCK_SUGGESTIONS[kind].filter((title) => !used.has(title.toLowerCase())).slice(0, 4)

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y border-y">
        {blocks.map((block, index) => {
          const open = openIds.has(block.id)
          const empty = htmlText(block.html).length === 0
          return (
            <li key={block.id} id={`block-${block.id}`} className="py-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggle(block.id)}
                  aria-expanded={open}
                  aria-controls={`block-body-${block.id}`}
                  aria-label={open ? 'Recolher o bloco' : 'Abrir o bloco'}
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <ChevronDown className={cn('size-5 transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')} />
                </button>
                <Input
                  aria-label={`Título do bloco ${index + 1}`}
                  placeholder="Título do bloco (ex.: Requisitos)"
                  className="font-semibold"
                  value={block.title}
                  onChange={(e) => update(block.id, { title: e.target.value })}
                />
              </div>

              {open && (
                <div id={`block-body-${block.id}`} className="flex flex-col gap-3 pt-2 pb-1 sm:pl-12">
                  <RichTextEditor value={block.html} onChange={(html) => update(block.id, { html })} placeholder="Escreva aqui…" />
                  {empty && (
                    <p className="text-sm text-muted-foreground">Sem texto.</p>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => move(index, -1)}>
                      <ArrowUp /> Subir
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === blocks.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown /> Descer
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="text-destructive-ink" onClick={() => remove(block)}>
                      <Trash2 /> Apagar bloco
                    </Button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" onClick={() => add('')}>
          <Plus /> Novo bloco
        </Button>
        {suggestions.length > 0 && (
          <details><summary className="cursor-pointer text-xs text-muted-foreground">Sugestões</summary><div role="group" aria-label="Sugestões de bloco" className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => add(title)}
                className="h-10 rounded-full border bg-card px-3.5 text-sm font-medium transition-colors hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                + {title}
              </button>
            ))}
          </div></details>
        )}
      </div>
    </div>
  )
}
