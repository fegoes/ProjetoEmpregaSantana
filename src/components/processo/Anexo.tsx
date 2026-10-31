import { useQuery } from '@tanstack/react-query'
import { ExternalLink, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { urlDoDocumento, useAbrirDocumento } from '@/hooks/useProcessos'
import { ehImagem, formatarBytes, type Mensagem } from '@/lib/hiring'

type AnexoDaMensagem = Pick<Mensagem, 'anexo_path' | 'anexo_nome' | 'anexo_tipo' | 'anexo_tamanho'>

/** Arquivo anexado a uma mensagem: nome, tamanho, prévia (se for imagem) e botão para abrir. */
export function Anexo({ anexo }: { anexo: AnexoDaMensagem }) {
  const { abrir, abrindo, erro } = useAbrirDocumento()
  const path = anexo.anexo_path as string
  const imagem = ehImagem(anexo.anexo_tipo)
  const nome = anexo.anexo_nome ?? 'Documento'

  const previa = useQuery({
    queryKey: ['processos', 'url', path],
    enabled: imagem,
    staleTime: 90_000,
    retry: false,
    queryFn: () => urlDoDocumento(path),
  })

  return (
    <div className="flex flex-col gap-2">
      {imagem && previa.data && (
        <button type="button" onClick={() => void abrir(path)} className="block w-fit overflow-hidden rounded-lg" aria-label={`Abrir ${nome}`}>
          <img src={previa.data} alt={nome} loading="lazy" className="max-h-52 max-w-full rounded-lg object-contain" />
        </button>
      )}
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          {imagem ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{nome}</p>
          <p className="text-xs text-muted-foreground">{formatarBytes(anexo.anexo_tamanho)}</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={abrindo} onClick={() => void abrir(path)}>
          {abrindo ? <Loader2 className="animate-spin" /> : <ExternalLink />} Abrir
        </Button>
      </div>
      {erro && (
        <p role="alert" className="text-sm text-destructive-ink">
          {erro}
        </p>
      )}
    </div>
  )
}
