import { DragHandle, useSortableItem } from '@/components/admin/Sortable'
import * as React from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Linha que abre e fecha (sanfona): usada para seções, slides e blocos. */
export function EditorRow({
  id,
  sortableId,
  label,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string
  sortableId?: string
  label: string
  summary?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const sort=useSortableItem(sortableId??id)
  return (
    <li id={id} {...sort?.target} className={cn("py-1",sort?.over&&"rounded-lg ring-2 ring-primary")}>
      <div className="flex items-center"><DragHandle id={sortableId??id} label={label} />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${id}-corpo`}
        className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg px-1 text-left transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ChevronDown
          aria-hidden
          className={cn('size-5 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')}
        />
        <span className="max-w-[70%] min-w-0 truncate text-sm font-semibold">{label}</span>
        {summary && <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{summary}</span>}
      </button></div>
      {open && (
        <div id={`${id}-corpo`} className="flex flex-col gap-4 pt-2 pb-3 sm:pl-8">
          {children}
        </div>
      )}
    </li>
  )
}

export function RowActions({
  index,
  count,
  onMove,
  onDuplicate,
  onRemove,
  removeLabel,
  canRemove = true,
  canDuplicate = true,
}: {
  index: number
  count: number
  onMove: (delta: -1 | 1) => void
  onDuplicate?: () => void
  onRemove: () => void
  removeLabel: string
  canRemove?: boolean
  canDuplicate?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1 border-t pt-2">
      <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp /> Subir
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown /> Descer
      </Button>
      {onDuplicate && (
        <Button type="button" variant="ghost" size="sm" disabled={!canDuplicate} onClick={onDuplicate}>
          <Copy /> Duplicar
        </Button>
      )}
      <Button type="button" variant="ghost" size="sm" className="text-destructive-ink" disabled={!canRemove} onClick={onRemove}>
        <Trash2 /> {removeLabel}
      </Button>
    </div>
  )
}
