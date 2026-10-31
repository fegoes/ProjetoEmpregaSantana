import { useId, useState } from 'react'
import { Upload, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IMAGE_ACCEPT, IMAGE_MIME_TYPES } from '@/lib/imageFormats'
import { remoteImageFile } from '@/lib/remoteImage'
export function ImageSourcePicker({label,onFile,disabled=false,inputId,onBusyChange}:{label:string;onFile:(file:File)=>Promise<void>;disabled?:boolean;inputId?:string;onBusyChange?:(busy:boolean)=>void}) {
 const generated=useId(),id=inputId??generated
 const [mode,setMode]=useState<'file'|'link'>('file'),[url,setUrl]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const send=async(file?:File)=>{setError('');setBusy(true);onBusyChange?.(true);try{const image=file??await remoteImageFile(url);if(!IMAGE_MIME_TYPES.includes(image.type)||image.size>5*1024*1024)throw new Error('Use somente JPG ou PNG, até 5 MB.');await onFile(image);if(!file)setUrl('')}catch(e){setError(e instanceof Error?e.message:'Não foi possível enviar a imagem. Tente novamente.')}finally{setBusy(false);onBusyChange?.(false)}}
 return <div className="min-w-0 space-y-3">
 <div role="group" aria-label={`Origem da imagem: ${label}`} className="flex flex-wrap gap-2"><Button type="button" size="sm" variant={mode==='file'?'default':'outline'} disabled={busy||disabled} aria-pressed={mode==='file'} onClick={()=>{setMode('file');setError('')}}><Upload className="size-4" />Enviar arquivo</Button><Button type="button" size="sm" variant={mode==='link'?'default':'outline'} disabled={busy||disabled} aria-pressed={mode==='link'} onClick={()=>{setMode('link');setError('')}}><LinkIcon className="size-4" />Usar link</Button></div>
 {mode==='file'?<div className="space-y-2"><Label htmlFor={id}>Arquivo JPG ou PNG — {label}</Label><input id={id} className="block min-h-11 w-full min-w-0 text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border file:bg-secondary file:px-3" type="file" accept={IMAGE_ACCEPT} disabled={busy||disabled} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void send(file)}} /></div>:<div className="space-y-2"><Label htmlFor={`${id}-url`}>Link da imagem — {label}</Label><Input id={`${id}-url`} type="url" placeholder="https://site.com/imagem.jpg" value={url} disabled={busy||disabled} onChange={e=>setUrl(e.target.value)} /><Button type="button" variant="outline" disabled={busy||disabled||!url.trim()} onClick={()=>{void send()}}>Importar imagem do link</Button><p className="text-xs text-muted-foreground">Use o endereço direto da imagem. O servidor de origem precisa permitir a importação.</p></div>}
 <p className="text-xs text-muted-foreground">Do computador ou celular, ou por link HTTPS · somente JPG e PNG · até 5 MB.</p>
 {busy&&<p role="status" className="text-sm">Enviando imagem…</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 </div>
}
