import * as React from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UploadError } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface ImageUploadFieldProps {
  label: string
  currentUrl: string | null | undefined
  onUpload: (file: File) => Promise<string>
  onUploaded: (url: string) => void
  shape?: 'square' | 'banner'
  hint?: string
}

// Componente "burro": faz upload e devolve a URL via onUploaded — quem persiste
// no banco é a página que o usa (mesmo padrão dos outros formulários).
export function ImageUploadField({
  label,
  currentUrl,
  onUpload,
  onUploaded,
  shape = 'square',
  hint,
}: ImageUploadFieldProps) {
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
      setError(err instanceof UploadError ? err.message : 'Não foi possível enviar a imagem.')
      setPreview(currentUrl ?? null)
    } finally {
      setUploading(false)
      URL.revokeObjectURL(objectUrl)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden border bg-muted text-muted-foreground',
            shape === 'square' ? 'size-16 rounded-xl' : 'aspect-video w-40 rounded-lg',
          )}
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? 'Trocar imagem' : 'Enviar imagem'}
          </Button>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
