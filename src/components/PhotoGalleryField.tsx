import { FieldDialog } from './forms/FieldDialog'
import { confirmAction } from '@/lib/confirmAction'
import * as React from 'react'
import { X } from 'lucide-react'
import { useImageVariant } from '@/hooks/useImageVariant'
import { ExpandableImage } from './ImageLightbox'
import { ImageGuidance } from './ImageGuidance'
import { ImageSourcePicker } from './ImageSourcePicker'
interface PhotoGalleryFieldProps {label:string;photos:string[];onUpload:(file:File)=>Promise<string>;onChange:(photos:string[])=>void;hint?:string;onUploadingChange?:(busy:boolean)=>void}
export function PhotoGalleryField({label,photos,onUpload,onChange,onUploadingChange}:PhotoGalleryFieldProps) {
 const id=React.useId()
 const [pending,setPending]=React.useState(0)
 const uploading=(busy:boolean)=>{setPending(n=>Math.max(0,n+(busy?1:-1)));onUploadingChange?.(busy)}
 return <FieldDialog label={label} kind="image" summary={`${photos.length} foto(s) · gerenciar imagens`} busy={pending>0}><section className="min-w-0 space-y-4"><h3 className="text-sm font-medium">{label}</h3>
 <ImageSourcePicker disabled={pending>0} onBusyChange={uploading} inputId={id} label={`${label} — Computador`} onFile={async file=>{onChange([...photos,await onUpload(file)])}} />
 <div className="flex flex-wrap gap-4">{photos.map((url,index)=><figure key={url} className="relative w-full max-w-sm space-y-3 rounded-lg border p-3"><ExpandableImage images={photos} initialIndex={index} src={url} alt="Foto cadastrada" className="aspect-video w-full rounded object-contain" /><button type="button" className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-black/60 text-white" disabled={pending>0} aria-label="Remover foto" onClick={async()=>{if(await confirmAction('Remover esta foto da publicação? O original continuará na sua galeria.'))onChange(photos.filter(p=>p!==url))}}><X className="size-4" /></button><GalleryMobileUpload disabled={pending>0} onUploadingChange={uploading} desktop={url} upload={onUpload} /></figure>)}</div>
 <ImageGuidance purpose="gallery" src={photos[0]} />
 </section></FieldDialog>
}
function GalleryMobileUpload({desktop,upload,onUploadingChange,disabled}:{desktop:string;upload:(file:File)=>Promise<string>;onUploadingChange?:(busy:boolean)=>void;disabled?:boolean}) {
 const variant=useImageVariant(desktop)
 return <div className="space-y-2"><ImageSourcePicker disabled={disabled} onBusyChange={onUploadingChange} label="Imagem móvel (opcional)" onFile={async file=>{await variant.save(await upload(file))}} />{variant.data&&<ExpandableImage src={variant.data} alt="Prévia da versão móvel" className="h-24 w-full object-contain" />}</div>
}
