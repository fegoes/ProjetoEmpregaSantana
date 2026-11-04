import { useState } from 'react'
import { PostSectionsEditor } from './PostSectionsEditor'
import { PostBlockListEditor } from './PostBlockListEditor'
import { RichTextEditor } from './RichTextEditor'
import { parsePostSections } from '@/lib/postSections'
/** Novas postagens usam texto contínuo; estruturas antigas mantêm seu editor sem conversão. */
export function PostBlocksEditor(props: {value:string;onChange:(html:string)=>void;disabled?:boolean;onUploadingChange?:(busy:boolean)=>void}) {
 const [mode] = useState(() => parsePostSections(props.value) ? 'sections' : props.value.includes('data-post-block') ? 'blocks' : 'text')
 if(mode === 'sections')return <PostSectionsEditor {...props} />
 if(mode === 'blocks')return <PostBlockListEditor {...props} />
 return <RichTextEditor {...props} inline allowImages allowPostMedia ariaLabel="Conteúdo da postagem" placeholder="Escreva sua postagem…" />
}
