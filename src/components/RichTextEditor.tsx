import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Heading3, Italic, List, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

const TOOLS: { label: string; icon: LucideIcon; isActive: (e: Editor) => boolean; run: (e: Editor) => void }[] = [
  { label: 'Negrito', icon: Bold, isActive: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
  { label: 'Itálico', icon: Italic, isActive: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
  {
    label: 'Título',
    icon: Heading3,
    isActive: (e) => e.isActive('heading', { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  { label: 'Lista', icon: List, isActive: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
]

// Wrapper Tiptap usado em descrições de vaga/empresa/autônomo e resumo de currículo.
// A saída HTML é sempre sanitizada no render via <RichTextRenderer /> (nunca aqui).
// A barra de formatação (negrito, itálico, título, lista) funciona por toque; os
// atalhos de teclado continuam valendo.
export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [3] }, codeBlock: false, code: false, blockquote: false, horizontalRule: false, strike: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? 'Escreva aqui…' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'rounded-md border border-input bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm focus:border-ring focus:ring-[3px] focus:ring-ring/50',
      },
    },
  })

  return (
    <div className={cn('rich-editor flex flex-col gap-1.5', className)}>
      <div role="toolbar" aria-label="Formatação do texto" className="flex flex-wrap gap-1">
        {TOOLS.map(({ label, icon: Icon, isActive, run }) => {
          const active = editor ? isActive(editor) : false
          return (
            <button
              key={label}
              type="button"
              disabled={!editor}
              aria-label={label}
              aria-pressed={active}
              // não tira o foco do texto ao tocar no botão
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor && run(editor)}
              className={cn(
                'flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:px-3',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-accent',
              )}
            >
              <Icon className="size-4.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
