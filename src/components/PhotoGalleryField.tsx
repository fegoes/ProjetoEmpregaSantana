import { useImageVariant } from '@/hooks/useImageVariant'
import { ResponsiveImage } from '@/components/ResponsiveImage'
import { IMAGE_ACCEPT } from '@/lib/imageFormats'
import * as React from 'react'
import { ImageGuidance } from './ImageGuidance'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { UploadError } from '@/lib/storage'

interface PhotoGalleryFieldProps {
  label: string
  photos: string[]
  onUpload: (file: File) => Promise<string>
  onChange: (photos: string[]) => void
  hint?: string
}

// Galeria simples: cada foto some do array ao remover (o arquivo em si fica
// no storage — mesmo trade-off aceito para a logo, sem custo relevante aqui).
export function PhotoGalleryField({ label, photos, onUpload, onChange, hint }: PhotoGalleryFieldProps) {
  const id = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    setUploading(true)
    try {
      const url = await onUpload(file)
      onChange([...photos, url])
    } catch (err) {
      setError(err instanceof UploadError ? err.message : 'Não foi possível enviar a imagem.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (url: string) => {
    onChange(photos.filter((p) => p !== url))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label} — Desktop</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex flex-wrap gap-3">
        {photos.map((url) => (
          <div key={url} className="group relative w-48 shrink-0 space-y-2 rounded-lg border p-2">
            <ResponsiveImage src={url} alt="" className="aspect-video w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
              aria-label="Remover foto"
            >
              <X className="size-3" />
            </button>
            <GalleryMobileUpload desktop={url} upload={onUpload} />
          </div>
        ))}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          <span className="text-xs">Adicionar</span>
        </button>
      </div>
      <ImageGuidance id={`${id}-guide`} purpose="gallery" src={photos[0]} />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input id={id} aria-describedby={`${id}-guide`} ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={handleFileChange} />
    </div>
  )
}

function GalleryMobileUpload({desktop,upload}:{desktop:string;upload:(file:File)=>Promise<string>}) {
 const variant=useImageVariant(desktop)
 const [busy,setBusy]=React.useState(false),[error,setError]=React.useState('')
 return <div className="space-y-1"><label className="block text-sm">Imagem móvel (opcional)<input className="block max-w-full text-xs" type="file" accept={IMAGE_ACCEPT} disabled={busy} onChange={async e=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;setBusy(true);setError('')
 try{await variant.save(await upload(file))}catch(e){setError(e instanceof Error?e.message:'Não foi possível enviar a versão móvel.')}finally{setBusy(false)}
 }} /></label>{variant.data&&<img src={variant.data} alt="Prévia da versão móvel" className="h-20 w-full object-contain" />}{busy&&<p role="status">Enviando…</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}</div>
}
