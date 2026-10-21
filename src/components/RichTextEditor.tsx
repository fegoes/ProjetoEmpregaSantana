import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  ariaLabel?: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

// Wrapper Tiptap usado em descrições de vaga/empresa/autônomo e resumo de currículo.
// A saída HTML é sempre sanitizada no render via <RichTextRenderer /> (nunca aqui).
export function RichTextEditor({ ariaLabel, value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: true })],
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
  </div>
}
