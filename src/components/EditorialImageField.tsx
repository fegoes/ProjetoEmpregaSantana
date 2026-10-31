import { useImageVariant } from '@/hooks/useImageVariant'
import { ImageGuidance, type ImagePurpose } from './ImageGuidance'
import { useState } from 'react'
import { uploadEditorialImage } from '@/lib/storage'
import { ImageSourcePicker } from './ImageSourcePicker'
function SingleEditorialImageField({label,value,onChange,onUploadingChange,purpose='content',disabled=false}:{label:string;value:string;onChange:(url:string)=>void|Promise<void>;onUploadingChange?:(busy:boolean)=>void;purpose?:ImagePurpose;disabled?:boolean}) {
 const [busy,setBusy]=useState(false)
 return <section className="space-y-3"><h4 className="text-sm font-medium">{label}</h4><ImageSourcePicker label={label} disabled={disabled||busy} onBusyChange={value=>{setBusy(value);onUploadingChange?.(value)}} onFile={async file=>{await onChange(await uploadEditorialImage(file))}} />{value&&<><img src={value} alt={`Prévia: ${label}`} className="max-h-40 max-w-full rounded-lg object-contain" /><button type="button" disabled={disabled||busy} className="min-h-11 text-sm text-destructive underline" onClick={()=>{void onChange('')}}>Remover imagem</button></>}<ImageGuidance purpose={purpose} src={value} /></section>
}

export function EditorialImageField(props: Parameters<typeof SingleEditorialImageField>[0]) {
 const variant=useImageVariant(props.value)
 return <fieldset className="min-w-0 space-y-5"><legend className="mb-2 font-semibold">{props.label}</legend>
 <SingleEditorialImageField {...props} label={`${props.label} — Desktop`} />
 <SingleEditorialImageField disabled={!props.value} {...props} label={`${props.label} — Móvel (opcional)`} value={variant.data??''} onChange={async url=>{await variant.save(url||null)}} />
 {!props.value&&<p className="text-sm text-muted-foreground">Envie a versão desktop para habilitar o envio móvel separado.</p>}
 <p className="text-sm text-muted-foreground">A versão móvel é usada abaixo de 640 px; sem ela, usamos a desktop. Imagens sociais usam a versão desktop nas prévias externas.</p>
 </fieldset>
}
