import { createPortal } from 'react-dom'
import Image from '@tiptap/extension-image'
import { EditorialImageField } from '@/components/EditorialImageField'
import { useState } from 'react'
import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { cn } from '@/lib/utils'
import { safeInternalPath } from '@/lib/portableUtils'

interface RichTextEditorProps {
  onUploadingChange?: (busy: boolean) => void
  allowImages?: boolean
  disabled?: boolean
  ariaLabel?: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

// Wrapper Tiptap usado em descrições de vaga/empresa/autônomo e resumo de currículo.
// A saída HTML é sempre sanitizada no render via <RichTextRenderer /> (nunca aqui).
export function RichTextEditor({ onUploadingChange, allowImages = false, disabled = false, ariaLabel, value, onChange, placeholder, className }: RichTextEditorProps) {
  const [selectionPosition, setSelectionPosition] = useState<{ left: number; top: number; width: number } | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [newTab, setNewTab] = useState(true)
  const [linkError, setLinkError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const editor = useEditor({
    extensions: [Underline, TextStyle, Color, Image.configure({ allowBase64: false }), StarterKit, Link.configure({ openOnClick: false, autolink: true })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none',
          className,
        ),
        'aria-label': ariaLabel ?? 'Editor de texto',
        'aria-multiline': 'true',
        role: 'textbox',
        'data-placeholder': placeholder ?? '',
      },
    },
  })

  useEffect(() => { editor?.setEditable(!disabled) }, [editor, disabled])

  useEffect(() => {
    if (editor && editor.getHTML() !== value) editor.commands.setContent(value, false)
  }, [editor, value])

  useEffect(() => {
    if (!editor || disabled) { setSelectionPosition(null); return }
    const update = () => {
      if (editor.isDestroyed || (!editor.isFocused && !document.activeElement?.closest('[data-selection-toolbar]')) || editor.state.selection.empty || !editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to).trim()) { setSelectionPosition(null); return }
      try {
        const rect = editor.view.coordsAtPos(editor.state.selection.from)
        const bounds = editor.view.dom.getBoundingClientRect()
        const width = Math.min(560, window.innerWidth - 24, Math.max(240, bounds.width))
        const left = Math.max(12, Math.min(window.innerWidth - width - 12, Math.max(bounds.left, Math.min(bounds.right - width, rect.left - width / 2))))
        setSelectionPosition({ left, top: Math.max(8, rect.top > 150 ? rect.top - 140 : Math.min(window.innerHeight - 170, rect.bottom + 8)), width })
      } catch { setSelectionPosition(null) }
    }
    const blur = ({ event }: { event: FocusEvent }) => { if (!(event.relatedTarget as HTMLElement | null)?.closest?.('[data-selection-toolbar]')) setSelectionPosition(null) }
    editor.on('selectionUpdate', update); editor.on('transaction', update); editor.on('blur', blur)
    window.addEventListener('resize', update); window.addEventListener('scroll', update, true)
    return () => { editor.off('selectionUpdate', update); editor.off('transaction', update); editor.off('blur', blur); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true) }
  }, [editor, disabled])

  const toolbar = (floating = false) => <div role="toolbar" aria-label={floating ? 'Formatar texto selecionado' : 'Formatação do texto'} className="flex max-w-full flex-wrap items-center gap-1 rounded-lg border bg-card p-2 shadow-sm">
    {[
      { label: 'Negrito', active: editor?.isActive('bold'), run: () => editor?.chain().focus().toggleBold().run() },
      { label: 'Itálico', active: editor?.isActive('italic'), run: () => editor?.chain().focus().toggleItalic().run() },
      { label: 'Sublinhado', active: editor?.isActive('underline'), run: () => editor?.chain().focus().toggleUnderline().run() },
      { label: 'Riscado', active: editor?.isActive('strike'), run: () => editor?.chain().focus().toggleStrike().run() },
      ...(!floating ? [
        { label: 'Subtítulo', active: editor?.isActive('heading', { level: 2 }), run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: 'Lista', active: editor?.isActive('bulletList'), run: () => editor?.chain().focus().toggleBulletList().run() },
        { label: 'Lista numerada', active: editor?.isActive('orderedList'), run: () => editor?.chain().focus().toggleOrderedList().run() },
      ] : []),
    ].map(item => <button key={item.label} type="button" aria-pressed={Boolean(item.active)} disabled={disabled || !editor} onMouseDown={e => e.preventDefault()} onClick={item.run} className="min-h-11 rounded-md px-2 text-xs hover:bg-accent aria-pressed:bg-accent aria-pressed:text-primary disabled:opacity-50">{item.label}</button>)}
    <button type="button" disabled={disabled || !editor} onMouseDown={e => e.preventDefault()} aria-pressed={editor?.isActive('link') ?? false} onClick={() => { setLinkUrl(editor?.getAttributes('link').href ?? ''); setNewTab(editor?.isActive('link') ? editor.getAttributes('link').target === '_blank' : true); setLinkError(''); setLinkOpen(true) }} className="min-h-11 rounded-md px-2 text-xs hover:bg-accent">Hiperlink</button>
    <label className="flex min-h-11 items-center gap-1 px-2 text-xs">Cor do texto<input aria-label={floating ? 'Cor da seleção' : 'Cor do texto'} type="color" disabled={disabled || !editor} value={/^#[a-f0-9]{6}$/i.test(editor?.getAttributes('textStyle').color ?? '') ? editor!.getAttributes('textStyle').color : '#333333'} onChange={e => editor?.chain().focus().setColor(e.target.value).run()} className="h-8 w-9 cursor-pointer rounded border bg-card p-1" /></label>
    {!floating && <button type="button" disabled={disabled || !editor} onMouseDown={e => e.preventDefault()} onClick={() => editor?.chain().focus().unsetAllMarks().run()} className="min-h-11 px-2 text-xs text-primary">Limpar formatação</button>}
  </div>
  return <div className="min-w-0 space-y-2">
    {toolbar()}
    {editor && !disabled && selectionPosition && createPortal(<div data-selection-toolbar className="fixed z-50" style={selectionPosition}>{toolbar(true)}</div>, document.body)}
    {linkOpen && <div className="space-y-3 rounded-lg border bg-accent/30 p-3" role="group" aria-label="Editar hiperlink">
      <label className="block text-sm">Destino do hiperlink<input aria-label="Destino do hiperlink" type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="mt-2 min-h-11 w-full rounded-md border bg-card px-3" placeholder="https://… ou /pagina/…" /></label>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={newTab} onChange={e => setNewTab(e.target.checked)} />Abrir em outra aba</label>
      {linkError && <p role="alert" className="text-sm text-destructive-ink">{linkError}</p>}
      <div className="flex flex-wrap gap-2"><button type="button" disabled={disabled} className="min-h-11 rounded-md border bg-card px-3 text-sm" onClick={() => {
        const raw = linkUrl.trim()
        const internal = safeInternalPath(raw) !== null
        let valid = internal
        try { valid ||= ['https:', 'http:'].includes(new URL(raw).protocol) } catch { /* caminho interno validado acima */ }
        if (!valid) { setLinkError('Use um endereço http(s) válido ou um caminho do site.'); return }
        editor?.chain().focus().extendMarkRange('link').setLink({ href: raw, target: newTab ? '_blank' : null, rel: newTab ? 'noopener noreferrer' : null }).run()
        setLinkOpen(false)
      }}>Aplicar link</button><button type="button" disabled={disabled} className="min-h-11 px-3 text-sm text-primary" onClick={() => { editor?.chain().focus().extendMarkRange('link').unsetLink().run(); setLinkOpen(false) }}>Remover link</button><button type="button" className="min-h-11 px-3 text-sm" onClick={() => setLinkOpen(false)}>Cancelar</button></div>
    </div>}
    <EditorContent editor={editor} />
    {allowImages && <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Inserir imagem no texto</summary><div className="mt-4 space-y-3"><EditorialImageField onUploadingChange={onUploadingChange} label="Imagem para inserir no texto" value={imageUrl} onChange={setImageUrl} /><label className="block text-sm">Descrição da imagem<input className="mt-2 min-h-11 w-full rounded border px-3" value={imageAlt} onChange={e=>setImageAlt(e.target.value)} /></label><button type="button" disabled={disabled || !editor || !/^https:\/\//.test(imageUrl) || !imageAlt.trim()} className="min-h-11 rounded border px-3 text-sm disabled:opacity-50" onClick={()=>{editor?.chain().focus().setImage({src:imageUrl,alt:imageAlt.trim()}).run();setImageUrl('');setImageAlt('')}}>Inserir na posição do cursor</button><p className="text-xs text-muted-foreground">Posicione o cursor entre os parágrafos antes de abrir este painel. Selecione a imagem no texto e use Delete para remover.</p></div></details>}
  </div>
}
