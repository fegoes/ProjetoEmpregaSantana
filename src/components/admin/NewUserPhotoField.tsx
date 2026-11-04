import { confirmAction } from '@/lib/confirmAction'
import { FieldDialog } from '@/components/forms/FieldDialog'
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
 const [busy,setBusy]=useState(false)
 return <FieldDialog label="Foto do usuário" kind="image" summary={value.desktop?'Foto selecionada':'Opcional'} disabled={disabled} busy={busy}><section className="space-y-5">
 <ImageSourcePicker label="Foto do usuário — Computador" disabled={disabled} onBusyChange={busy=>{setBusy(busy);onUploadingChange(busy)}} onFile={async file=>onChange(current=>({...current,desktop:file}))} /><DraftPreview file={value.desktop} label="Prévia da foto desktop" />
 <ImageSourcePicker label="Foto do usuário — Celular" disabled={disabled||!value.desktop} onBusyChange={busy=>{setBusy(busy);onUploadingChange(busy)}} onFile={async file=>onChange(current=>({...current,mobile:file}))} /><DraftPreview file={value.mobile} label="Prévia da foto móvel" />
 {value.desktop&&<button type="button" disabled={disabled} className="min-h-11 text-sm text-destructive underline" onClick={async()=>{if(await confirmAction('Remover as fotos selecionadas?'))onChange({desktop:null,mobile:null})}}>Remover fotos selecionadas</button>}
 <ImageGuidance purpose="logo" />
 </section></FieldDialog>
}
