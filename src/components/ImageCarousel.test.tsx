import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ImgHTMLAttributes } from 'react'
import { ImageCarousel } from './ImageCarousel'
vi.mock('@/components/ResponsiveImage',()=>({ResponsiveImage:(props:ImgHTMLAttributes<HTMLImageElement>)=><img {...props} />}))
describe('ampliação das fotos',()=>{
 it('abre carrossel sem acionar o link do card e permite navegar e fechar',async()=>{
  const navigate=vi.fn();render(<a href="/vagas/1" onClick={navigate}><ImageCarousel images={['/wide.jpg','/portrait.png']} alt="Fotos da vaga" /></a>)
  fireEvent.click(screen.getByRole('button',{name:'Ampliar fotos'}));const dialog=await screen.findByRole('dialog')
  expect(navigate).not.toHaveBeenCalled();expect(within(dialog).getByRole('img')).toHaveAttribute('src','/wide.jpg')
  fireEvent.click(within(dialog).getByRole('button',{name:'Próxima'}));expect(within(dialog).getByRole('img')).toHaveAttribute('src','/portrait.png')
  fireEvent.keyDown(dialog,{key:'ArrowLeft'});expect(within(dialog).getByRole('img')).toHaveAttribute('src','/wide.jpg')
  fireEvent.click(within(dialog).getByRole('button',{name:'Fechar visualização'}));await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());expect(navigate).not.toHaveBeenCalled()
 })
 it('não apresenta controles para uma galeria vazia',()=>{render(<ImageCarousel images={[]} alt="Sem fotos" />);expect(screen.queryByRole('button')).not.toBeInTheDocument()})
})
