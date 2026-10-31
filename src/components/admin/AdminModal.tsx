import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
export function AdminModal({open,onClose,title,description,children,busy=false}:{open:boolean;onClose:()=>void;title:string;description:string;children:ReactNode;busy?:boolean}) {
 const opener=useRef<HTMLElement|null>(null)
 return <Dialog.Root open={open} onOpenChange={value=>{if(!value&&!busy)onClose()}}><Dialog.Portal>
 <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
 <Dialog.Content onOpenAutoFocus={e=>{opener.current=document.activeElement as HTMLElement;const first=(e.target as HTMLElement).querySelector<HTMLElement>('input:not([disabled]),textarea:not([disabled]),select:not([disabled])');if(first){e.preventDefault();first.focus()}}} onCloseAutoFocus={e=>{e.preventDefault();opener.current?.focus()}} className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-card p-5 shadow-lg sm:p-6" onEscapeKeyDown={e=>{if(busy)e.preventDefault()}} onPointerDownOutside={e=>e.preventDefault()}>
 <div className="mb-5 pr-10"><Dialog.Title className="text-xl font-bold">{title}</Dialog.Title><Dialog.Description className="mt-2 text-sm text-muted-foreground">{description}</Dialog.Description></div>
 <Dialog.Close disabled={busy} aria-label="Fechar modal" className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><X className="size-5" /></Dialog.Close>
 {children}
 </Dialog.Content></Dialog.Portal></Dialog.Root>
}
