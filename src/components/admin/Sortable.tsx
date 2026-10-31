import { createContext, useContext, useId, useState, type ReactNode, type DragEvent, type KeyboardEvent } from 'react'
import { GripVertical } from 'lucide-react'
import { reorderById } from '@/lib/reorder'
const Context=createContext<{scope:string;ids:string[];dragged:string|null;over:string|null;start:(id:string|null)=>void;hover:(id:string|null)=>void;move:(source:string,target:string)=>void}|null>(null)
export function Sortable<T extends {id:string}>({items,onChange,children,label}:{items:T[];onChange:(items:T[])=>void;children:ReactNode;label:string}) {
  const scope=useId(),[dragged,start]=useState<string|null>(null),[over,hover]=useState<string|null>(null),[announcement,setAnnouncement]=useState('')
  const move=(source:string,target:string)=>{const next=reorderById(items,source,target);onChange(next);start(null);hover(null);setAnnouncement(`${label}: item movido para a posição ${next.findIndex(i=>i.id===source)+1}.`)}
  return <Context.Provider value={{scope,ids:items.map(i=>i.id),dragged,over,start,hover,move}}>{children}<p role="status" className="sr-only">{announcement}</p></Context.Provider>
}
export function useSortableItem(id:string) {
  const context=useContext(Context)
  if(!context)return null
  return {over:context.over===id,dragging:context.dragged===id,
    target:{onDragOver:(e:DragEvent)=>{if(context.dragged){e.preventDefault();e.stopPropagation();e.dataTransfer.dropEffect='move';context.hover(id)}},onDrop:(e:DragEvent)=>{if(context.dragged){e.preventDefault();e.stopPropagation();const data=e.dataTransfer.getData('text/plain');if(data===context.scope+':'+context.dragged)context.move(context.dragged,id)}}},
    handle:{draggable:true,onDragStart:(e:DragEvent)=>{e.stopPropagation();context.start(id);e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',context.scope+':'+id)},onDragEnd:()=>{context.start(null);context.hover(null)},onKeyDown:(e:KeyboardEvent)=>{if(e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();const target=context.ids[context.ids.indexOf(id)+(e.key==='ArrowUp'?-1:1)];if(target)context.move(id,target)}}}}
}
export function DragHandle({id,label}:{id:string;label:string}) {
  const sort=useSortableItem(id)
  return sort?<button type="button" {...sort.handle} aria-label={`Arrastar ${label}`} title="Arraste para reordenar. No teclado: Alt + seta para cima ou para baixo." className="flex size-11 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"><GripVertical className="size-5" /></button>:null
}
