import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostPreviewFrame, PreviewDeviceSwitch, type PreviewDevice } from './PostPreview'
function Harness(){const [device,setDevice]=useState<PreviewDevice>('desktop');return <><PreviewDeviceSwitch device={device} onChange={setDevice} /><PostPreviewFrame device={device}><h1>Post em edição</h1></PostPreviewFrame></>}
describe('prévia por dispositivo',()=>{
 it('alterna o viewport real sem recarregar o frame ou perder o conteúdo',()=>{
  render(<Harness />)
  const frame=screen.getByTitle('Pré-visualização do post — Desktop') as HTMLIFrameElement
  frame.contentDocument!.body.innerHTML='<main id="post-preview-root"></main>';fireEvent.load(frame)
  expect(within(frame.contentDocument!.body).getByText('Post em edição')).toBeInTheDocument()
  expect(frame.style.width).toBe('1024px')
  fireEvent.click(screen.getByRole('button',{name:'Celular'}))
  expect(screen.getByRole('button',{name:'Celular'})).toHaveAttribute('aria-pressed','true')
  expect(screen.getByTitle('Pré-visualização do post — Celular')).toBe(frame)
  expect(frame.style.width).toBe('390px')
  expect(within(frame.contentDocument!.body).getByText('Post em edição')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button',{name:'Desktop'}));expect(frame.style.width).toBe('1024px')
 })
})
