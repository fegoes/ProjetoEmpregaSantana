import { createPortal } from 'react-dom'
import { useEffect, useId, useState, type DragEvent } from 'react'
import { AlignLeft, Columns2, Heading, Image, Images, LayoutTemplate, List, MousePointer2, PanelBottom, PanelTop, Search, Square, Users, Video, Quote, Minus, Megaphone } from 'lucide-react'

const MIME = 'application/x-empregasantana-inserter'
const icons = { Texto: AlignLeft, Título: Heading, Imagem: Image, Lista: List, Citação: Quote, Separador: Minus, Galeria: Images, Slides: Images, Vídeo: Video, Anúncio: Megaphone, heading: Heading, text: AlignLeft, image: Image, buttons: MousePointer2, media_text: Columns2, icon_list: List, search: Search, feed: Users, cabecalho: PanelTop, artigo: LayoutTemplate, encerramento: PanelBottom, 'slide-centro': Image, 'slide-texto-imagem': Columns2, 'slide-icones': List, carrossel: Images, 'faixa-chamada': MousePointer2, texto: AlignLeft, 'texto-imagem': Columns2, icones: List, busca: Search, vagas: Users, 'em-branco': Square }

export function VisualInsertItem({ value, label, description, kind, onInsert, disabled = false }: { value: string; label: string; description: string; kind: 'section' | 'block' | 'post'; onInsert: () => void; disabled?: boolean }) {
  const id = useId()
  const [hint, setHint] = useState<{ left: number; top: number } | null>(null)
  const showHint = (element: HTMLButtonElement) => {
    const rect = element.getBoundingClientRect()
    setHint({ left: Math.max(8, Math.min(rect.left, window.innerWidth - 248)), top: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 110)) })
  }
  const Icon = icons[value as keyof typeof icons] ?? LayoutTemplate
  return <div className="group relative min-w-0">
    <button type="button" disabled={disabled} draggable={kind !== 'post' && !disabled} aria-label={label} aria-describedby={id} onMouseEnter={event => showHint(event.currentTarget)} onMouseLeave={() => setHint(null)} onFocus={event => showHint(event.currentTarget)} onBlur={() => setHint(null)} onKeyDown={event => { if (event.key === 'Escape') setHint(null) }} onClick={() => { setHint(null); onInsert() }}
      onDragStart={event => { setHint(null); event.stopPropagation(); event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData(`${MIME}-${kind}`, JSON.stringify({ kind, value })); window.dispatchEvent(new CustomEvent('builder-insert-drag', { detail: kind })) }}
      onDragEnd={() => window.dispatchEvent(new CustomEvent('builder-insert-drag', { detail: null }))}
      className="flex size-12 items-center justify-center rounded-lg border bg-card text-center disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing">
      <Icon className="size-7 text-primary" aria-hidden="true" />
    </button>
    {hint && createPortal(<div aria-hidden="true" style={hint} className="pointer-events-none fixed z-50 w-60 max-w-[calc(100vw-16px)] rounded-lg bg-brand-ink p-3 text-xs leading-relaxed text-white"><strong className="block">{label}</strong>{description}</div>, document.body)}
    <span id={id} className="sr-only">{label}: {description}. {kind === 'post' ? 'Clique para inserir.' : 'Clique para inserir ou arraste até o local desejado.'}</span>
  </div>
}

export function InsertDropZone({ kind, label, onInsert }: { kind: 'section' | 'block'; label: string; onInsert: (value: string) => void }) {
  const [over, setOver] = useState(false)
  const [active, setActive] = useState(false)
  useEffect(() => {
    const update = (event: Event) => { setActive((event as CustomEvent).detail === kind); setOver(false) }
    window.addEventListener('builder-insert-drag', update)
    return () => window.removeEventListener('builder-insert-drag', update)
  }, [kind])
  const accepts = (event: DragEvent) => event.dataTransfer.types.includes(`${MIME}-${kind}`)
  return <div hidden={!active} onDragOver={event => { if (accepts(event)) { event.preventDefault(); event.stopPropagation(); event.dataTransfer.dropEffect = 'copy'; setOver(true) } }}
    onDragLeave={() => setOver(false)} onDrop={event => {
      if (!accepts(event)) return
      event.preventDefault(); event.stopPropagation(); setOver(false)
      window.dispatchEvent(new CustomEvent('builder-insert-drag', { detail: null }))
      try { const data = JSON.parse(event.dataTransfer.getData(`${MIME}-${kind}`)); if (data.kind === kind && typeof data.value === 'string') onInsert(data.value) } catch { /* Ignore foreign drag payloads. */ }
    }}
    className={`${active ? 'flex' : 'hidden'} my-2 min-h-11 items-center justify-center rounded-lg border border-dashed px-3 text-center text-xs ${over ? 'border-primary bg-accent text-primary' : 'border-border text-muted-foreground'}`}>
    {label}
  </div>
}
