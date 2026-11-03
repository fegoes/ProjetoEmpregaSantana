import { useState } from 'react'
import { usePrivateGallery } from '@/hooks/usePrivateGallery'
import { privateGalleryFile } from '@/lib/privateGallery'
import { Button } from './ui/button'

export function PrivateGalleryPicker({ onChoose, disabled = false, onBusyChange }: { onBusyChange?: (busy: boolean) => void; onChoose: (file: File) => Promise<void>; disabled?: boolean }) {
  const [page, setPage] = useState(0)
  const gallery = usePrivateGallery(page)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return <div className="space-y-3">
    <p className="text-xs text-muted-foreground">Somente suas imagens. Escolha uma foto para reutilizar nesta publicação.</p>
    {gallery.isPending && <p role="status">Carregando sua galeria…</p>}
    {(gallery.isError || error) && <p role="alert" className="text-sm text-destructive">{error || 'Não foi possível carregar sua galeria.'} <button type="button" className="underline" onClick={() => { setError(''); void gallery.refetch() }}>Tentar novamente</button></p>}
    {gallery.data?.images.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma imagem nesta página. Envie uma foto pelo dispositivo ou por link.</p>}
    <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">{gallery.data?.images.map((image, index) => <button key={image.path} type="button" disabled={disabled || busy} aria-label={`Usar imagem ${index + 1} da minha galeria`} title={image.name} className="min-h-20 overflow-hidden rounded-lg border bg-muted p-1 hover:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50" onClick={async () => {
      setBusy(true); onBusyChange?.(true); setError('')
      try { await onChoose(await privateGalleryFile(image.path)) } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível selecionar a imagem.') } finally { setBusy(false); onBusyChange?.(false) }
    }}><img src={image.url} alt={`Imagem ${index + 1}`} className="aspect-square w-full object-contain" loading="lazy" /></button>)}</div>
    {(page > 0 || gallery.data?.hasMore) && <div className="flex items-center gap-3"><Button type="button" variant="outline" size="sm" disabled={page === 0 || busy || gallery.isFetching} onClick={() => setPage(page - 1)}>Anterior</Button><span className="text-xs">Página {page + 1}</span><Button type="button" variant="outline" size="sm" disabled={!gallery.data?.hasMore || busy || gallery.isFetching} onClick={() => setPage(page + 1)}>Próxima</Button></div>}
    {busy && <p role="status" className="text-sm">Selecionando imagem…</p>}
  </div>
}
