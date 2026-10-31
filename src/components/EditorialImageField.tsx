import { useImageVariant } from '@/hooks/useImageVariant'
import { IMAGE_ACCEPT } from '@/lib/imageFormats'
import { ImageGuidance, type ImagePurpose } from './ImageGuidance'
import { useEffect, useId, useState } from 'react'
import { uploadEditorialImage } from '@/lib/storage'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
function SingleEditorialImageField({ label, value, onChange, onUploadingChange, purpose = 'content', disabled = false, commitOnBlur = false }: { disabled?: boolean; commitOnBlur?: boolean; purpose?: ImagePurpose; label: string; value: string; onChange: (url: string) => void | Promise<void>; onUploadingChange?: (busy: boolean) => void }) {
 const id=useId(), [busy,setBusy]=useState(false), [error,setError]=useState(''),[draft,setDraft]=useState(value)
 useEffect(()=>setDraft(value),[value])
 return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} aria-describedby={`${id}-guide`} type="url" pattern="https://.*\.(?:[jJ][pP][eE]?[gG]|[pP][nN][gG])(?:\?.*)?" placeholder="https://…/imagem.jpg" value={draft} onChange={e=>{setDraft(e.target.value);if(!commitOnBlur)void onChange(e.target.value)}} onBlur={e=>{if(commitOnBlur&&e.target.checkValidity())void Promise.resolve(onChange(draft)).catch(err=>setError(err.message))}} disabled={busy||disabled} /><Label htmlFor={`${id}-file`} className="text-xs">Ou enviar uma imagem (até 5 MB)</Label><input id={`${id}-file`} className="block w-full min-w-0 text-xs" type="file" aria-describedby={`${id}-guide`} accept={IMAGE_ACCEPT} disabled={busy||disabled} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);onUploadingChange?.(true);setError('');try{await onChange(await uploadEditorialImage(file))}catch{setError('Não foi possível enviar a imagem. Confira formato, tamanho e conexão.')}finally{setBusy(false);onUploadingChange?.(false);e.target.value=''}}} /><ImageGuidance id={`${id}-guide`} purpose={purpose} src={value} />{busy&&<p role="status" className="text-xs">Enviando imagem…</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}</div>
}

export function EditorialImageField(props: Parameters<typeof SingleEditorialImageField>[0]) {
 const variant=useImageVariant(props.value)
 return <fieldset className="min-w-0 space-y-5"><legend className="mb-2 font-semibold">{props.label}</legend>
 <SingleEditorialImageField {...props} label={`${props.label} — Desktop`} />
 <SingleEditorialImageField disabled={!props.value} commitOnBlur {...props} label={`${props.label} — Móvel (opcional)`} value={variant.data??''} onChange={async url=>{await variant.save(url||null)}} />
 {!props.value&&<p className="text-sm text-muted-foreground">Envie a versão desktop para habilitar o envio móvel separado.</p>}
 <p className="text-sm text-muted-foreground">A versão móvel é usada abaixo de 640 px; sem ela, usamos a desktop. Imagens sociais usam a versão desktop nas prévias externas.</p>
 </fieldset>
}
