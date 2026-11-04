import { confirmAction } from '@/lib/confirmAction'
import { FieldDialog } from './forms/FieldDialog'
import { useDraftImages } from '@/contexts/draftImagesContext'
import { ExpandableImage } from './ImageLightbox'
import { useImageVariant } from '@/hooks/useImageVariant'
import { ImageGuidance, type ImagePurpose } from './ImageGuidance'
import { useState } from 'react'
import { uploadEditorialImage } from '@/lib/storage'
import { ImageSourcePicker } from './ImageSourcePicker'
function SingleEditorialImageField({label,value,onChange,onUploadingChange,purpose='content',disabled=false}:{label:string;value:string;onChange:(url:string)=>void|Promise<void>;onUploadingChange?:(busy:boolean)=>void;purpose?:ImagePurpose;disabled?:boolean}) {
 const [busy,setBusy]=useState(false)
 const draft=useDraftImages()
 return <section className="space-y-3"><h4 className="text-sm font-medium">{label}</h4><ImageSourcePicker label={label} disabled={disabled||busy||draft?.saving} onLink={draft?async url=>{await onChange(draft.store.stageLink(url));draft.changed()}:undefined} onBusyChange={value=>{setBusy(value);onUploadingChange?.(value)}} onFile={async file=>{await onChange(draft?draft.store.stageFile(file):await uploadEditorialImage(file));draft?.changed()}} />{value&&<><ExpandableImage src={value} alt={`Prévia: ${label}`} className="max-h-40 max-w-full rounded-lg object-contain" /><button type="button" disabled={disabled||busy} className="min-h-11 text-sm text-destructive underline" onClick={async()=>{if(await confirmAction('Remover esta imagem?'))await onChange('')}}>Remover imagem</button></>}{draft&&value&&<p className="text-xs text-muted-foreground">A imagem será enviada ao salvar.</p>}<ImageGuidance purpose={purpose} src={value} /></section>
}

function EditorialImageFieldContent(props: Parameters<typeof SingleEditorialImageField>[0]) {
 const variant=useImageVariant(props.value)
 return <fieldset className="min-w-0 space-y-5"><legend className="sr-only">{props.label}</legend>
 <SingleEditorialImageField {...props} label={`${props.label} — Computador`} />
 <details className="border-t pt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-medium">Imagem para celular (opcional)</summary><div className="space-y-3 pt-2">
 <SingleEditorialImageField {...props} disabled={props.disabled||!props.value} label={`${props.label} — Celular (opcional)`} value={variant.data??''} onChange={async url=>{await variant.save(url||null)}} />
 {!props.value&&<p className="text-sm text-muted-foreground">Adicione a imagem para computador primeiro.</p>}
 </div></details>

 </fieldset>
}

export function EditorialImageField(props: Parameters<typeof SingleEditorialImageField>[0] & { inline?: boolean }) {
 const [uploads, setUploads] = useState(0)
 if(props.inline)return <EditorialImageFieldContent {...props} />
 return <FieldDialog label={props.label} kind="image" summary={props.value ? 'Imagem adicionada' : 'Opcional'} busy={uploads > 0} disabled={props.disabled}>
  <EditorialImageFieldContent {...props} onUploadingChange={busy => { setUploads(count => Math.max(0, count + (busy ? 1 : -1))); props.onUploadingChange?.(busy) }} />
 </FieldDialog>
}
