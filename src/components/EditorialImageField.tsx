import { IMAGE_ACCEPT } from '@/lib/imageFormats'
import { ImageGuidance, type ImagePurpose } from './ImageGuidance'
import { useId, useState } from 'react'
import { uploadEditorialImage } from '@/lib/storage'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
export function EditorialImageField({ label, value, onChange, onUploadingChange, purpose = 'content' }: { purpose?: ImagePurpose; label: string; value: string; onChange: (url: string) => void; onUploadingChange?: (busy: boolean) => void }) {
 const id=useId(), [busy,setBusy]=useState(false), [error,setError]=useState('')
 return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} aria-describedby={`${id}-guide`} type="url" pattern="https://.*\.(?:[jJ][pP][eE]?[gG]|[pP][nN][gG])(?:\?.*)?" placeholder="https://…/imagem.jpg" value={value} onChange={e=>onChange(e.target.value)} disabled={busy} /><Label htmlFor={`${id}-file`} className="text-xs">Ou enviar uma imagem (até 5 MB)</Label><input id={`${id}-file`} className="block w-full min-w-0 text-xs" type="file" aria-describedby={`${id}-guide`} accept={IMAGE_ACCEPT} disabled={busy} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);onUploadingChange?.(true);setError('');try{onChange(await uploadEditorialImage(file))}catch{setError('Não foi possível enviar a imagem. Confira formato, tamanho e conexão.')}finally{setBusy(false);onUploadingChange?.(false);e.target.value=''}}} /><ImageGuidance id={`${id}-guide`} purpose={purpose} src={value} />{busy&&<p role="status" className="text-xs">Enviando imagem…</p>}{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}</div>
}
