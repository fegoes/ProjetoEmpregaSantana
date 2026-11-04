import { useMemo } from 'react'
import { RichTextEditor } from './RichTextEditor'
import { postEditorHtml } from '@/lib/postEditorHtml'
/** Um único editor visual para todos os posts, inclusive os criados no formato antigo. */
export function PostEditor(props: {value:string;onChange:(html:string)=>void;disabled?:boolean;onUploadingChange?:(busy:boolean)=>void}) {
 const value = useMemo(() => postEditorHtml(props.value), [props.value])
 return <RichTextEditor {...props} value={value} inline allowImages allowPostMedia ariaLabel="Conteúdo da postagem" placeholder="Escreva sua postagem…" />
}
