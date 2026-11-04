import { IMAGE_RECOMMENDATIONS } from '@/lib/imageRecommendations'
import { useId } from 'react'
export type ImagePurpose = 'logo' | 'banner' | 'cover' | 'social' | 'content' | 'gallery'
export function ImageGuidance({ purpose, id }: { purpose: ImagePurpose; src?: string | null; id?: string }) {
 const fallback = useId()
 const advice = IMAGE_RECOMMENDATIONS[purpose]
 return <details id={id ?? fallback} className="text-xs text-muted-foreground"><summary className="min-h-11 cursor-pointer py-3">Dimensões recomendadas</summary><p>Computador: {advice.desktop}.</p><p>Celular: {advice.mobile}.</p></details>
}
