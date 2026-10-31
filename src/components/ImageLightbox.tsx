import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { ResponsiveImage } from './ResponsiveImage'
import { cn } from '@/lib/utils'
export function ImageLightbox({images,alt,open,onClose,initialIndex=0}:{images:string[];alt:string;open:boolean;onClose:()=>void;initialIndex?:number}) {
 const [index,setIndex]=useState(initialIndex),opener=useRef<HTMLElement|null>(null)
 useEffect(()=>{if(open)setIndex(initialIndex)},[open,initialIndex])
 const selected=Math.max(0,Math.min(index,images.length-1))
 const move=(delta:number)=>setIndex(i=>(i+delta+images.length)%images.length)
 return <Dialog.Root open={open&&images.length>0} onOpenChange={value=>{if(!value)onClose()}}><Dialog.Portal><Dialog.Overlay onClick={e=>e.stopPropagation()} className="fixed inset-0 z-50 bg-black/75" /><Dialog.Content onClick={e=>e.stopPropagation()} onOpenAutoFocus={()=>{opener.current=document.activeElement as HTMLElement}} onCloseAutoFocus={e=>{e.preventDefault();opener.current?.focus()}} onKeyDown={e=>{if(images.length>1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();e.stopPropagation();move(e.key==='ArrowLeft'?-1:1)}}} className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_2rem)] max-w-6xl max-h-[calc(100dvh_-_2rem)] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-4 shadow-lg">
 <Dialog.Title className="pr-12 text-lg font-semibold">Visualizar imagem</Dialog.Title><Dialog.Description className="mt-1 text-sm text-muted-foreground">{alt} · {selected+1} de {images.length}. Imagem inteira, sem recorte.</Dialog.Description>
 <Dialog.Close aria-label="Fechar visualização" className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-lg hover:bg-muted"><X className="size-5" /></Dialog.Close>
 <div className="my-3 flex h-[65dvh] min-h-0 items-center justify-center bg-muted"><ResponsiveImage src={images[selected]} alt={alt} className="size-full object-contain" /></div>
 {images.length>1&&<div className="flex justify-between gap-3"><button type="button" className="flex min-h-11 items-center gap-2 rounded-lg border px-3" onClick={()=>move(-1)}><ChevronLeft className="size-4" />Anterior</button><button type="button" className="flex min-h-11 items-center gap-2 rounded-lg border px-3" onClick={()=>move(1)}>Próxima<ChevronRight className="size-4" /></button></div>}
 </Dialog.Content></Dialog.Portal></Dialog.Root>
}
export function ExpandableImage({wrapperClassName,images,initialIndex=0,...props}:ImgHTMLAttributes<HTMLImageElement>&{wrapperClassName?:string;images?:string[];initialIndex?:number}) {
 const [open,setOpen]=useState(false)
 if(!props.src)return null
 return <span className={cn('relative block max-w-full',wrapperClassName)}><ResponsiveImage {...props} /><button type="button" aria-label={`Ampliar imagem: ${props.alt||'Foto'}`} className="absolute inset-0 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-ring" onClick={e=>{e.preventDefault();e.stopPropagation();setOpen(true)}}><span className="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-black/65 text-white"><Expand className="size-4" /></span></button><ImageLightbox images={images??[props.src]} initialIndex={initialIndex} alt={props.alt||'Foto'} open={open} onClose={()=>setOpen(false)} /></span>
}
