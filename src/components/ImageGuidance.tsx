import { useId, useState } from 'react'

export type ImagePurpose = 'logo' | 'banner' | 'cover' | 'social' | 'content' | 'gallery'
const guidance: Record<ImagePurpose, { ideal: string; display: string }> = {
  logo: { ideal: 'Recomendado: 512 × 512 px (quadrada). PNG com fundo transparente funciona bem para logos.', display: 'A marca é exibida inteira em uma área quadrada, tanto no celular quanto no computador. Imagens retangulares podem deixar espaço nas bordas.' },
  banner: { ideal: 'Recomendado: 1920 × 1080 px (16:9) para fundos e banners.', display: 'Fundos preenchem a seção e podem cortar mais as laterais no celular. Mantenha rostos, logos e informações importantes no centro. Use o ajuste de foco do editor e confira a prévia em cada largura.' },
  cover: { ideal: 'Recomendado: 1536 × 1024 px (3:2) para a capa do artigo.', display: 'No blog, a capa é exibida inteira em uma área 3:2 que acompanha a largura da tela. Outras proporções podem deixar espaço nas bordas.' },
  social: { ideal: 'Recomendado: 1200 × 630 px para a imagem de compartilhamento.', display: 'A prévia usa uma área 1200:630. Redes sociais podem aplicar outros recortes no celular e no computador; mantenha título e assunto no centro.' },
  content: { ideal: 'Recomendado: 1600 px de largura para imagens no conteúdo; para imagens verticais, prefira pelo menos 1200 px de altura.', display: 'A imagem acompanha a largura disponível, preservando a proporção no texto. Miniaturas e blocos pequenos podem usar recorte. Confira a prévia da página ou do post.' },
  gallery: { ideal: 'Recomendado: 1600 × 900 px (16:9) para fotos de vagas, ambientes e portfólio.', display: 'As fotos preenchem cards e carrosséis, com recorte que varia entre celular e computador. Mantenha o assunto no centro e evite texto nas bordas.' },
}

/** Recommendations do not constrain image dimensions or modify the original. */
export function ImageGuidance({ purpose, src, id }: { purpose: ImagePurpose; src?: string | null; id?: string }) {
  const fallbackId = useId()
  const [dimensions, setDimensions] = useState<{ src: string; width: number; height: number } | null>(null)
  const advice = guidance[purpose]
  return <div id={id ?? fallbackId} className="space-y-1 text-sm text-muted-foreground">
    <p>Imagem desktop: 1920 × 1080 px (horizontal) | Imagem móvel: 320 × 480 px (vertical).</p>
    {purpose === 'logo' && <p>Para logo ou foto de perfil, prefira uma imagem quadrada de 512 × 512 px.</p>}
    <p>Somente JPG e PNG · até 5 MB por imagem. Aceita imagens horizontais, verticais e quadradas; as dimensões acima são sugestões.</p>
    <details className="pt-1">
      <summary className="min-h-11 cursor-pointer py-2 font-medium text-foreground">Exibição no celular e no computador</summary>
      <p className="pb-2">Se a foto do celular estiver em HEIC/HEIF, converta para JPG ou PNG antes de enviar.</p>
      <p className="pb-2">{advice.display} O arquivo original é mantido, sem esticar ou deformar a foto.</p>
      {src && <div className="space-y-2">
        <p>Imagem original (sem recorte):</p>
        <img src={src} alt="Prévia da imagem selecionada, sem recorte" className="max-h-60 max-w-full rounded border object-contain" loading="lazy" onLoad={e => setDimensions({ src, width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} />
        {dimensions?.src === src && <p>{dimensions.width} × {dimensions.height} px. {dimensions.width < 600 && 'Esta imagem pode perder nitidez em áreas grandes; prefira uma versão com mais resolução.'}</p>}
      </div>}
    </details>
  </div>
}
