import { useId, useState, type DragEvent } from 'react'
import { AlignLeft, Columns2, Heading, Image, Images, LayoutTemplate, List, MousePointer2, PanelBottom, PanelTop, Search, Square, Users } from 'lucide-react'

const MIME = 'application/x-empregasantana-inserter'
const icons = { heading: Heading, text: AlignLeft, image: Image, buttons: MousePointer2, media_text: Columns2, icon_list: List, search: Search, feed: Users, cabecalho: PanelTop, artigo: LayoutTemplate, encerramento: PanelBottom, 'slide-centro': Image, 'slide-texto-imagem': Columns2, 'slide-icones': List, carrossel: Images, 'faixa-chamada': MousePointer2, texto: AlignLeft, 'texto-imagem': Columns2, icones: List, busca: Search, vagas: Users, 'em-branco': Square }

export function VisualInsertItem({ value, label, description, kind, onInsert }: { value: string; label: string; description: string; kind: 'section' | 'block'; onInsert: () => void }) {
  const id = useId()
  const Icon = icons[value as keyof typeof icons] ?? LayoutTemplate
  return <div className="group relative min-w-0">
    <button type="button" draggable aria-describedby={id} title={description} onClick={onInsert}
      onDragStart={event => { event.stopPropagation(); event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData(`${MIME}-${kind}`, JSON.stringify({ kind, value })) }}
      className="flex min-h-24 w-full cursor-grab flex-col items-center justify-center gap-2 rounded-xl border bg-card px-2 py-3 text-center transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing">
      <Icon className="size-7 text-primary" aria-hidden="true" /><span className="text-xs font-medium leading-snug">{label}</span>
    </button>
    <span id={id} role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-60 max-w-[75vw] rounded-lg bg-brand-ink p-3 text-xs leading-relaxed text-white group-hover:block group-focus-within:block">{description}. Clique para inserir ou arraste até o local desejado.</span>
  </div>
}

export function InsertDropZone({ kind, label, onInsert }: { kind: 'section' | 'block'; label: string; onInsert: (value: string) => void }) {
  const [over, setOver] = useState(false)
  const accepts = (event: DragEvent) => event.dataTransfer.types.includes(`${MIME}-${kind}`)
  return <div onDragOver={event => { if (accepts(event)) { event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'copy'; setOver(true) } }}
    onDragLeave={() => setOver(false)} onDrop={event => {
      if (!accepts(event)) return
      event.preventDefault(); event.stopPropagation(); setOver(false)
      try { const data = JSON.parse(event.dataTransfer.getData(`${MIME}-${kind}`)); if (data.kind === kind && typeof data.value === 'string') onInsert(data.value) } catch { /* Ignore foreign drag payloads. */ }
    }}
    className={`my-2 flex min-h-11 items-center justify-center rounded-lg border border-dashed px-3 text-center text-xs ${over ? 'border-primary bg-accent text-primary' : 'border-border text-muted-foreground'}`}>
    {label}
  </div>
}
