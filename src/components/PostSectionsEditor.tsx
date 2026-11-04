import { confirmAction } from '@/lib/confirmAction'
import { useRef, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { PostBlockListEditor } from './PostBlockListEditor'
import { moveItem } from '@/lib/utils'
import { newPostSection, parsePostSections, serializePostSections, type PostSection } from '@/lib/postSections'
interface Props { value: string; onChange: (html: string) => void; disabled?: boolean; onUploadingChange?: (busy: boolean) => void }
export function PostSectionsEditor({ value, onChange, disabled = false, onUploadingChange }: Props) {
  const [sections, setSections] = useState<PostSection[]>(() => parsePostSections(value) ?? (value.trim() ? [newPostSection(value)] : []))
  const count = useRef(0)
  const [busy, setBusy] = useState(false)
  const uploading = (loading: boolean) => { count.current = Math.max(0, count.current + (loading ? 1 : -1)); setBusy(count.current > 0); onUploadingChange?.(loading) }
  const commit = (next: PostSection[]) => { if (disabled && !busy) return; setSections(next); onChange(serializePostSections(next)) }
  const update = (section: PostSection) => commit(sections.map(s => s.id === section.id ? section : s))
  return <div className="min-w-0 space-y-5"><p className="text-sm text-muted-foreground">Você escolhe a composição. Crie seções e insira os blocos desejados; selecione palavras no texto para formatar ou inserir hiperlinks.</p>
    {sections.map((s, index) => <section key={s.id} className="min-w-0 space-y-4 rounded-xl border p-3 sm:p-4" aria-label={`Seção ${index + 1}`}>
      <Label htmlFor={`post-section-${s.id}`}>Nome da seção {index + 1}</Label><Input id={`post-section-${s.id}`} value={s.name} maxLength={80} disabled={disabled || busy} onChange={e => update({ ...s, name: e.target.value })} />
      <details><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Configurar dimensões e cores da seção</summary><div className="grid min-w-0 gap-4 py-4 sm:grid-cols-2">
        {([{ key: 'background', label: 'Fundo' }, { key: 'color', label: 'Texto' }, { key: 'link', label: 'Links' }] as const).map(({ key, label }) => <label key={key} className="flex min-h-11 items-center justify-between gap-2 text-sm">{label}<input aria-label={`${label} da seção ${index + 1}`} type="color" value={s[key]} disabled={disabled || busy} onChange={e => update({ ...s, [key]: e.target.value })} className="h-10 w-12 rounded border bg-card p-1" /></label>)}
        <label className="space-y-2 text-sm">Largura da seção<select className="min-h-11 w-full rounded border bg-card px-2" value={s.width} disabled={disabled || busy} onChange={e => update({ ...s, width: e.target.value as PostSection['width'] })}><option value="reading">Leitura</option><option value="wide">Ampla</option><option value="screen">Toda a largura disponível</option></select></label>
        <label className="space-y-2 text-sm">Conteúdo interno<select className="min-h-11 w-full rounded border bg-card px-2" value={s.contentWidth} disabled={disabled || busy} onChange={e => update({ ...s, contentWidth: e.target.value as PostSection['contentWidth'] })}><option value="reading">Leitura</option><option value="wide">Amplo</option><option value="full">Toda a seção</option></select></label>
        <label className="space-y-2 text-sm">Altura mínima<select className="min-h-11 w-full rounded border bg-card px-2" value={s.height} disabled={disabled || busy} onChange={e => update({ ...s, height: e.target.value as PostSection['height'] })}><option value="auto">Pelo conteúdo</option><option value="screen">Uma tela</option></select></label>
        <label className="space-y-2 text-sm">Espaço vertical<select className="min-h-11 w-full rounded border bg-card px-2" value={s.spacing} disabled={disabled || busy} onChange={e => update({ ...s, spacing: Number(e.target.value) })}>{[0, 24, 48, 80].map(v => <option key={v} value={v}>{v} px</option>)}</select></label>
      </div></details>
      <PostBlockListEditor value={s.html} onChange={html => update({ ...s, html })} disabled={disabled} onUploadingChange={uploading} />
      <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={disabled || busy || index === 0} onClick={() => commit(moveItem(sections, index, -1))}>Subir seção {index + 1}</Button><Button type="button" size="sm" variant="outline" disabled={disabled || busy || index === sections.length - 1} onClick={() => commit(moveItem(sections, index, 1))}>Descer seção {index + 1}</Button><Button type="button" size="sm" variant="outline" disabled={disabled || busy} onClick={() => { const copy = { ...s, id: newPostSection().id }; const next = [...sections]; next.splice(index + 1, 0, copy); commit(next) }}>Duplicar seção</Button><Button type="button" size="sm" variant="ghost" disabled={disabled || busy} onClick={async () => { if ((await confirmAction('Excluir esta seção e seus blocos? A alteração será aplicada ao salvar.'))) commit(sections.filter(x => x.id !== s.id)) }}>Excluir seção</Button></div>
    </section>)}
    {!sections.length && <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Sua postagem está vazia. Adicione uma seção e escolha seus blocos.</p>}
    <Button type="button" variant="outline" disabled={disabled || busy} onClick={() => commit([...sections, newPostSection()])}>Adicionar seção vazia</Button>
  </div>
}
