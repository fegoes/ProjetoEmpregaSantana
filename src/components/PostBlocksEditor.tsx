import { useState } from 'react'
import { Button } from './ui/button'
import { PostSectionsEditor } from './PostSectionsEditor'
import { PostBlockListEditor } from './PostBlockListEditor'
import { newPostSection, parsePostSections, serializePostSections } from '@/lib/postSections'
export function PostBlocksEditor(props: {value:string;onChange:(html:string)=>void;disabled?:boolean;onUploadingChange?:(busy:boolean)=>void}) {
  const [sectionMode,setSectionMode]=useState(()=>!props.value.trim() || Boolean(parsePostSections(props.value)))
  if(sectionMode)return <PostSectionsEditor {...props} />
  return <div className="space-y-4"><Button type="button" variant="outline" disabled={props.disabled} onClick={()=>{props.onChange(serializePostSections([newPostSection(props.value)]));setSectionMode(true)}}>Organizar este post em seções</Button><PostBlockListEditor {...props} /></div>
}
