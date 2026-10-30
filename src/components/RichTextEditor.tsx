import Image from '@tiptap/extension-image'
import { EditorialImageField } from '@/components/EditorialImageField'
import { useState } from 'react'
import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { cn } from '@/lib/utils'

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
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const editor = useEditor({
    extensions: [Image.configure({ allowBase64: false }), StarterKit, Link.configure({ openOnClick: false, autolink: true })],
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

  return <div className="min-w-0 space-y-2">
    <div role="group" aria-label="Formatação do texto" className="flex flex-wrap gap-2">
      {[
        { label: 'Negrito', active: editor?.isActive('bold'), run: () => editor?.chain().focus().toggleBold().run() },
        { label: 'Itálico', active: editor?.isActive('italic'), run: () => editor?.chain().focus().toggleItalic().run() },
        { label: 'Título', active: editor?.isActive('heading', { level: 2 }), run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: 'Lista', active: editor?.isActive('bulletList'), run: () => editor?.chain().focus().toggleBulletList().run() },
      ].map(item => <button key={item.label} type="button" aria-pressed={Boolean(item.active)} disabled={!editor} onClick={item.run} className="min-h-10 rounded-md border px-3 py-2 text-xs aria-pressed:bg-accent aria-pressed:text-primary">{item.label}</button>)}
    </div>
    <EditorContent editor={editor} />
    {allowImages && <details className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-medium">Inserir imagem no texto</summary><div className="mt-4 space-y-3"><EditorialImageField onUploadingChange={onUploadingChange} label="Imagem para inserir no texto" value={imageUrl} onChange={setImageUrl} /><label className="block text-sm">Descrição da imagem<input className="mt-2 min-h-11 w-full rounded border px-3" value={imageAlt} onChange={e=>setImageAlt(e.target.value)} /></label><button type="button" disabled={disabled || !editor || !/^https:\/\//.test(imageUrl) || !imageAlt.trim()} className="min-h-11 rounded border px-3 text-sm disabled:opacity-50" onClick={()=>{editor?.chain().focus().setImage({src:imageUrl,alt:imageAlt.trim()}).run();setImageUrl('');setImageAlt('')}}>Inserir na posição do cursor</button><p className="text-xs text-muted-foreground">Posicione o cursor entre os parágrafos antes de abrir este painel. Selecione a imagem no texto e use Delete para remover.</p></div></details>}
  </div>
}
