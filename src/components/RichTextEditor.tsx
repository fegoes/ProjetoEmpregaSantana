import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

// Wrapper Tiptap usado em descrições de vaga/empresa/autônomo e resumo de currículo.
// A saída HTML é sempre sanitizada no render via <RichTextRenderer /> (nunca aqui).
export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none',
          className,
        ),
        'data-placeholder': placeholder ?? '',
      },
    },
  })

  return <EditorContent editor={editor} />
}
