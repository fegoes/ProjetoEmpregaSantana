import { useImageVariant } from '@/hooks/useImageVariant'
import { IMAGE_ACCEPT } from '@/lib/imageFormats'
import * as React from 'react'
import { ImageGuidance, type ImagePurpose } from './ImageGuidance'
import { ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UploadError } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface ImageUploadFieldProps {
  label: string
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
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setPreview(currentUrl ?? null)
  }, [currentUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    setUploading(true)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const url = await onUpload(file)
      onUploaded(url)
      setPreview(url)
    } catch (err) {
      setError(err instanceof UploadError ? err.message : err instanceof Error ? err.message : 'Não foi possível enviar a imagem.')
      setPreview(currentUrl ?? null)
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
            <img src={preview} alt="" className={cn("size-full", purpose === 'logo' ? 'object-contain' : 'object-cover')} />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || disabled}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? 'Trocar imagem' : 'Enviar imagem'}
          </Button>
          {preview && onRemove && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive-ink" disabled={uploading || disabled} onClick={onRemove}>
              Remover imagem
            </Button>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <input
          ref={inputRef}
          id={id}
          aria-describedby={`${id}-guide`}
          disabled={uploading || disabled}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <ImageGuidance id={`${id}-guide`} purpose={purpose ?? (shape === 'square' ? 'content' : 'banner')} src={preview} />
    </div>
  )
}

export function ImageUploadField(props: ImageUploadFieldProps) {
 const variant=useImageVariant(props.currentUrl)
 const [variantError,setVariantError]=React.useState('')
 return <fieldset className="min-w-0 space-y-5"><legend className="mb-2 font-semibold">{props.label}</legend>
  <SingleImageUploadField {...props} label={`${props.label} — Desktop`} />
  <SingleImageUploadField disabled={!props.currentUrl} {...props} label={`${props.label} — Móvel (opcional)`} currentUrl={variant.data} onUpload={async file=>{const url=await props.onUpload(file);await variant.save(url);return url}} onUploaded={()=>{}} onRemove={variant.data?()=>{void variant.save(null).catch(e=>setVariantError(e.message));}:undefined} />
  {!props.currentUrl&&<p className="text-sm text-muted-foreground">Envie a imagem desktop para habilitar o envio móvel.</p>}
  {variantError&&<p role="alert" className="text-destructive">{variantError}</p>}
  <p className="text-sm text-muted-foreground">Em telas menores que 640 px, a versão móvel é usada quando disponível; nas demais, a desktop. Sem versão móvel, a desktop é mantida.</p>
 </fieldset>
}
