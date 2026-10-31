import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { ImageSourcePicker } from '@/components/ImageSourcePicker'
import { ImageGuidance } from '@/components/ImageGuidance'
import { ExpandableImage } from '@/components/ImageLightbox'
export type NewUserPhotos={desktop:File|null;mobile:File|null}
function DraftPreview({file,label}:{file:File|null;label:string}) {
 const [url,setUrl]=useState('')
 useEffect(()=>{if(!file){setUrl('');return}const object=URL.createObjectURL(file);setUrl(object);return()=>URL.revokeObjectURL(object)},[file])
 return url?<ExpandableImage src={url} alt={label} className="h-32 w-full object-contain" />:null
}
/** Aguarda a criação da conta para salvar os arquivos na pasta do usuário correto. */
export function NewUserPhotoField({value,onChange,onUploadingChange,disabled}:{value:NewUserPhotos;onChange:Dispatch<SetStateAction<NewUserPhotos>>;onUploadingChange:(busy:boolean)=>void;disabled:boolean}) {
 return <section className="space-y-5"><h2 className="font-semibold">Foto do usuário (opcional)</h2><p className="text-sm text-muted-foreground">Escolha as fotos agora. Elas serão enviadas e vinculadas depois que a conta for criada.</p>
 <ImageSourcePicker label="Foto do usuário — Desktop" disabled={disabled} onBusyChange={onUploadingChange} onFile={async file=>onChange(current=>({...current,desktop:file}))} /><DraftPreview file={value.desktop} label="Prévia da foto desktop" />
 <ImageSourcePicker label="Foto do usuário — Móvel" disabled={disabled||!value.desktop} onBusyChange={onUploadingChange} onFile={async file=>onChange(current=>({...current,mobile:file}))} /><DraftPreview file={value.mobile} label="Prévia da foto móvel" />
 {value.desktop&&<button type="button" disabled={disabled} className="min-h-11 text-sm text-destructive underline" onClick={()=>onChange({desktop:null,mobile:null})}>Remover fotos selecionadas</button>}
 <ImageGuidance purpose="logo" />
 </section>
}
