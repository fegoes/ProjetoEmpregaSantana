import * as React from 'react'
import { X } from 'lucide-react'
import { useImageVariant } from '@/hooks/useImageVariant'
import { ResponsiveImage } from './ResponsiveImage'
import { ImageGuidance } from './ImageGuidance'
import { ImageSourcePicker } from './ImageSourcePicker'
interface PhotoGalleryFieldProps {label:string;photos:string[];onUpload:(file:File)=>Promise<string>;onChange:(photos:string[])=>void;hint?:string}
export function PhotoGalleryField({label,photos,onUpload,onChange,hint}:PhotoGalleryFieldProps) {
 const id=React.useId()
 return <section className="min-w-0 space-y-4"><h3 className="text-sm font-medium">{label}</h3>{hint&&<p className="text-sm text-muted-foreground">{hint}</p>}
 <ImageSourcePicker inputId={id} label={`${label} — Desktop`} onFile={async file=>{onChange([...photos,await onUpload(file)])}} />
 <div className="flex flex-wrap gap-4">{photos.map(url=><figure key={url} className="relative w-full max-w-sm space-y-3 rounded-lg border p-3"><ResponsiveImage src={url} alt="Foto cadastrada" className="aspect-video w-full rounded object-cover" /><button type="button" className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-black/60 text-white" aria-label="Remover foto" onClick={()=>onChange(photos.filter(p=>p!==url))}><X className="size-4" /></button><GalleryMobileUpload desktop={url} upload={onUpload} /></figure>)}</div>
 <ImageGuidance purpose="gallery" src={photos[0]} />
 </section>
}
function GalleryMobileUpload({desktop,upload}:{desktop:string;upload:(file:File)=>Promise<string>}) {
 const variant=useImageVariant(desktop)
 return <div className="space-y-2"><ImageSourcePicker label="Imagem móvel (opcional)" onFile={async file=>{await variant.save(await upload(file))}} />{variant.data&&<img src={variant.data} alt="Prévia da versão móvel" className="h-24 w-full object-contain" />}</div>
}
