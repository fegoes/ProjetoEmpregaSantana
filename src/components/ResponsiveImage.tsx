import type { ImgHTMLAttributes } from 'react'
import { useImageVariant } from '@/hooks/useImageVariant'
const MOBILE_IMAGE_MEDIA = '(max-width: 639px)'
export function ResponsiveImage(props: ImgHTMLAttributes<HTMLImageElement>) {
 const {data:mobile,isLoading}=useImageVariant(props.src)
 if(isLoading)return <span aria-hidden="true" className={`block ${props.className??''}`} />
 if(!mobile)return <img {...props} />
 return <picture className="contents"><source media={MOBILE_IMAGE_MEDIA} srcSet={mobile} /><img {...props} /></picture>
}
