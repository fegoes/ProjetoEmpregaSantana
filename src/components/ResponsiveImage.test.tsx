import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResponsiveImage } from './ResponsiveImage'
const variant=vi.hoisted(()=>({data:null as string|null,isLoading:false}))
vi.mock('@/hooks/useImageVariant',()=>({useImageVariant:()=>variant}))
describe('imagens por dispositivo',()=>{
 it('mantém a imagem desktop quando não há variante móvel',()=>{variant.data=null;variant.isLoading=false;const {container}=render(<ResponsiveImage src="https://example.test/desktop.jpg" alt="Capa" />);expect(screen.getByAltText('Capa')).toHaveAttribute('src','https://example.test/desktop.jpg');expect(container.querySelector('source')).toBeNull()})
 it('declara seleção nativa móvel e preserva desktop como fallback',()=>{variant.data='https://example.test/mobile.jpg';const {container}=render(<ResponsiveImage src="https://example.test/desktop.jpg" alt="Capa" />);expect(container.querySelector('source')).toHaveAttribute('media','(max-width: 639px)');expect(container.querySelector('source')).toHaveAttribute('srcset',variant.data);expect(container.querySelector('img')).toHaveAttribute('src','https://example.test/desktop.jpg')})
 it('não inicia download desktop antes de resolver as variantes',()=>{variant.isLoading=true;const {container}=render(<ResponsiveImage src="https://example.test/desktop.jpg" alt="Capa" />);expect(container.querySelector('img')).toBeNull();variant.isLoading=false})
})
