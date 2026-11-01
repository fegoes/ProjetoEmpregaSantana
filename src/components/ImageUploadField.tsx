import { ExpandableImage } from './ImageLightbox'
import { ImageSourcePicker } from './ImageSourcePicker'
import { useImageVariant } from '@/hooks/useImageVariant'
import * as React from 'react'
import { ImageGuidance, type ImagePurpose } from './ImageGuidance'
import { ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UploadError } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface ImageUploadFieldProps {
  label: string
  onUploadingChange?: (busy:boolean)=>void
  disabled?: boolean
  currentUrl: string | null | undefined
  onUpload: (file: File) => Promise<string>
  onUploaded: (url: string) => void
  shape?: 'square' | 'banner'
  hint?: string
  purpose?: ImagePurpose
  /** Quando informado, aparece o botão "Remover imagem" */
  onRemove?: () => void
}

// Componente "burro": faz upload e devolve a URL via onUploaded — quem persiste
// no banco é a página que o usa (mesmo padrão dos outros formulários).
function SingleImageUploadField({
  label,
  onUploadingChange,
  disabled = false,
  currentUrl,
  onUpload,
  onUploaded,
  shape = 'square',
  hint,
  purpose,
  onRemove,
}: ImageUploadFieldProps) {
  const id = React.useId()
  const [preview, setPreview] = React.useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    setPreview(currentUrl ?? null)
  }, [currentUrl])

  const handleFile = async (file: File) => {
    setUploading(true)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const url = await onUpload(file)
      onUploaded(url)
      setPreview(url)
    } catch (err) {
      setPreview(currentUrl ?? null)
      throw err instanceof Error ? err : new UploadError('Não foi possível enviar a imagem. Confira conexão e permissão.')
    } finally {
      setUploading(false)
      URL.revokeObjectURL(objectUrl)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden border bg-muted text-muted-foreground',
            shape === 'square' ? 'size-16 rounded-xl' : 'aspect-video w-40 rounded-lg',
          )}
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : preview ? (
            <ExpandableImage wrapperClassName="size-full" src={preview} alt="" className={cn("size-full", purpose === 'logo' ? 'object-contain' : 'object-contain')} />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {preview && onRemove && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive-ink" disabled={uploading || disabled} onClick={onRemove}>
              Remover imagem
            </Button>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>

      </div>
      <ImageSourcePicker inputId={id} label={label} disabled={uploading||disabled} onBusyChange={onUploadingChange} onFile={handleFile} />
      <ImageGuidance id={`${id}-guide`} purpose={purpose ?? (shape === 'square' ? 'content' : 'banner')} src={preview} />
    </div>
  )
}

export function ImageUploadField(props: ImageUploadFieldProps) {
 const variant=useImageVariant(props.currentUrl)
 const [variantError,setVariantError]=React.useState('')
 return <fieldset className="min-w-0 space-y-5"><legend className="mb-2 font-semibold">{props.label}</legend>
  <SingleImageUploadField {...props} label={`${props.label} — Desktop`} />
  <SingleImageUploadField {...props} disabled={props.disabled||!props.currentUrl} label={`${props.label} — Móvel (opcional)`} currentUrl={variant.data} onUpload={async file=>{const url=await props.onUpload(file);await variant.save(url);return url}} onUploaded={()=>{}} onRemove={variant.data?()=>{void variant.save(null).catch(e=>setVariantError(e.message));}:undefined} />
  {!props.currentUrl&&<p className="text-sm text-muted-foreground">Envie a imagem desktop para habilitar o envio móvel.</p>}
  {variantError&&<p role="alert" className="text-destructive">{variantError}</p>}
  <p className="text-sm text-muted-foreground">Em telas menores que 640 px, a versão móvel é usada quando disponível; nas demais, a desktop. Sem versão móvel, a desktop é mantida.</p>
 </fieldset>
}
