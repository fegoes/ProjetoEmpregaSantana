import { lazy, Suspense } from 'react'
const PrivateGalleryPicker = lazy(() => import('./PrivateGalleryPicker').then(module => ({ default: module.PrivateGalleryPicker })))
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IMAGE_ACCEPT, IMAGE_MIME_TYPES } from '@/lib/imageFormats'
import { remoteImageFile } from '@/lib/remoteImage'
export function ImageSourcePicker({label,onFile,disabled=false,inputId,onBusyChange,onLink,allowGallery=true}:{label:string;onFile:(file:File)=>Promise<void>;disabled?:boolean;inputId?:string;onBusyChange?:(busy:boolean)=>void;onLink?:(url:string)=>Promise<void>;allowGallery?:boolean}) {
 const generated=useId(),id=inputId??generated
 const [mode,setMode]=useState<'file'|'link'|'gallery'>('file'),[url,setUrl]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const send=async(file?:File)=>{setError('');setBusy(true);onBusyChange?.(true);try{const image=file??await remoteImageFile(url);if(!IMAGE_MIME_TYPES.includes(image.type)||image.size>5*1024*1024)throw new Error('Use somente JPG ou PNG, até 5 MB.');await onFile(image);if(!file)setUrl('')}catch(e){setError(e instanceof Error?e.message:'Não foi possível enviar a imagem. Tente novamente.')}finally{setBusy(false);onBusyChange?.(false)}}
 return <div className="min-w-0 space-y-3">
 <fieldset disabled={busy||disabled} className="flex flex-wrap gap-4"><legend className="sr-only">Origem da imagem: {label}</legend>{([['file','Arquivo do dispositivo'],['link','Link da imagem'],...(allowGallery ? [['gallery','Minha galeria'] as const] : [])] as const).map(([key,text])=><label key={key} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"><input type="radio" name={`${id}-source`} checked={mode===key} onChange={()=>{setMode(key);setError('')}} />{text}</label>)}</fieldset>
 {mode==='gallery'?<Suspense fallback={<p role="status">Abrindo galeria…</p>}><PrivateGalleryPicker disabled={disabled} onBusyChange={value=>{setBusy(value);onBusyChange?.(value)}} onChoose={onFile} /></Suspense>:mode==='file'?<div className="space-y-2"><Label htmlFor={id}>Arquivo JPG ou PNG — {label}</Label><input id={id} className="block min-h-11 w-full min-w-0 text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border file:bg-secondary file:px-3" type="file" accept={IMAGE_ACCEPT} disabled={busy||disabled} onClick={e=>{e.currentTarget.value=''}} onChange={e=>{const file=e.target.files?.[0];if(file)void send(file)}} /></div>:<div className="space-y-2"><Label htmlFor={`${id}-url`}>Link da imagem — {label}</Label><Input id={`${id}-url`} type="url" placeholder="https://site.com/imagem.jpg" value={url} disabled={busy||disabled} onChange={e=>{const value=e.target.value;setUrl(value);if(onLink){try{if(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw new Error('Use um link HTTPS público, sem usuário ou senha.')}e.target.setCustomValidity('');setError('');void onLink(value).catch(err=>setError(err instanceof Error?err.message:'Não foi possível selecionar a imagem.'))}catch{const message='Use um link HTTPS público válido.';e.target.setCustomValidity(message);setError(message)}}}} />{!onLink&&<Button type="button" variant="outline" disabled={busy||disabled||!url.trim()} onClick={()=>{void send()}}>Aplicar link da imagem</Button>}<p className="text-xs text-muted-foreground">{onLink?'A imagem será enviada ao salvar.':'Cole o link direto da imagem.'}</p></div>}
 <p className="text-xs text-muted-foreground">PNG ou JPEG · até 5 MB por imagem.</p>
 {busy&&<p role="status" className="text-sm">Preparando imagem…</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 </div>
}
