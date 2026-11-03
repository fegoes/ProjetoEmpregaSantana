import { ExpandableImage } from '@/components/ImageLightbox'
import { ImageSourcePicker } from '@/components/ImageSourcePicker'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { usePrivateGallery } from '@/hooks/usePrivateGallery'
import { GALLERY_BUCKET, uploadPrivateImage } from '@/lib/privateGallery'
import { supabase } from '@/lib/supabase'
import { ImageGuidance } from '@/components/ImageGuidance'
import { Button } from '@/components/ui/button'

export default function GaleriaPage() {
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(0)
  const gallery = usePrivateGallery(page)
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: ['my-image-gallery', user?.id] })
  return <section className="max-w-4xl space-y-5">
    <h1 className="text-2xl font-bold">Minha galeria de imagens</h1>
    <p className="text-sm text-muted-foreground">Sua biblioteca é privada. Reutilize as fotos nos campos de imagem escolhendo “Minha galeria”. Novos uploads nas publicações também ficam guardados aqui. Ao publicar, uma cópia da foto fica visível na publicação; remover o original desta galeria não remove essa cópia.</p>
    <details className="rounded-xl border p-4"><summary className="cursor-pointer font-medium">Adicionar imagem</summary><div className="space-y-4 pt-4"><ImageGuidance purpose="gallery" />
      <ImageSourcePicker allowGallery={false} label="Imagem da galeria" disabled={busy || !user} onBusyChange={setBusy} onFile={async file => { await uploadPrivateImage(file); setPage(0); await refresh() }} />
    </div></details>
    {(error || gallery.isError) && <p role="alert" className="text-destructive">{error || 'Não foi possível carregar a galeria. Confira a conexão e o armazenamento privado.'} <button type="button" className="underline" onClick={() => { setError(''); void gallery.refetch() }}>Tentar novamente</button></p>}
    {gallery.isPending && <p role="status">Carregando suas imagens…</p>}
    {gallery.data?.images.length === 0 && <p>Sua galeria está vazia nesta página. Adicione uma imagem acima.</p>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{gallery.data?.images.map((image, index) => <figure key={image.path} className="space-y-2">
      <ExpandableImage images={gallery.data.images.map(item => item.url)} initialIndex={index} src={image.url} alt={`Imagem ${index + 1} da sua galeria pessoal`} className="aspect-video w-full rounded-lg bg-muted object-contain" />
      <figcaption className="truncate text-xs text-muted-foreground" title={image.name}>{image.name.replace(/^[a-f0-9-]{36}--/, '')}</figcaption>
      <Button variant="outline" disabled={busy} onClick={async () => {
        if (!window.confirm('Remover o original da galeria? As fotos já usadas em publicações continuarão disponíveis.')) return
        setBusy(true); setError('')
        try { const { error } = await supabase.storage.from(GALLERY_BUCKET).remove([image.path]); if (error) throw error; if (gallery.data.images.length === 1 && page > 0) setPage(page - 1); await refresh() } catch { setError('Não foi possível remover a imagem. Tente novamente.') } finally { setBusy(false) }
      }}>Remover da galeria</Button>
    </figure>)}</div>
    {(page > 0 || gallery.data?.hasMore) && <div className="flex items-center gap-3"><Button type="button" variant="outline" disabled={page === 0 || busy || gallery.isFetching} onClick={() => setPage(page - 1)}>Anterior</Button><span className="text-sm">Página {page + 1}</span><Button type="button" variant="outline" disabled={!gallery.data?.hasMore || busy || gallery.isFetching} onClick={() => setPage(page + 1)}>Próxima</Button></div>}
  </section>
}
