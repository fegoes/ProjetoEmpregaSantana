import { IMAGE_RECOMMENDATIONS } from '@/lib/imageRecommendations'
import { useId, useState } from 'react'

export type ImagePurpose = 'logo' | 'banner' | 'cover' | 'social' | 'content' | 'gallery'
/** Recommendations do not constrain image dimensions or modify the original. */
export function ImageGuidance({ purpose, src, id }: { purpose: ImagePurpose; src?: string | null; id?: string }) {
  const fallbackId = useId()
  const [dimensions, setDimensions] = useState<{ src: string; width: number; height: number } | null>(null)
  const advice = IMAGE_RECOMMENDATIONS[purpose]
  return <div id={id ?? fallbackId} className="space-y-1 text-sm text-muted-foreground">
    <p>Desktop: {advice.desktop} · Móvel: {advice.mobile}.</p>
    <p>Peso recomendado: {advice.weight}. JPG para fotos; PNG para transparência, logos e artes.</p>
    <p>Somente JPG e PNG · até 5 MB por imagem. Aceita imagens horizontais, verticais e quadradas; as dimensões acima são recomendações para este layout, não bloqueios.</p>
    <details className="pt-1">
      <summary className="min-h-11 cursor-pointer py-2 font-medium text-foreground">Exibição no celular e no computador</summary>
      <p className="pb-2">Se a foto do celular estiver em HEIC/HEIF, converta para JPG ou PNG antes de enviar.</p>
      <p className="pb-2">{advice.detail} O arquivo original é mantido, sem esticar ou deformar a foto.</p>
      {src && <div className="space-y-2">
        <p>Imagem original (sem recorte):</p>
        <img src={src} alt="Prévia da imagem selecionada, sem recorte" className="max-h-60 max-w-full rounded border object-contain" loading="lazy" onLoad={e => setDimensions({ src, width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} />
        {dimensions?.src === src && <p>{dimensions.width} × {dimensions.height} px. {purpose !== 'logo' && dimensions.width < 600 && 'Esta imagem pode perder nitidez em áreas grandes; prefira uma versão com mais resolução.'}</p>}
      </div>}
    </details>
  </div>
}
