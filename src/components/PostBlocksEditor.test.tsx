import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import { PostBlocksEditor } from './PostBlocksEditor'
import { newPostSection, serializePostSections } from '@/lib/postSections'
afterEach(cleanup)
function Editor({initial}:{initial:string}){const [value,setValue]=useState(initial);return <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PostBlocksEditor value={value} onChange={setValue}/><output data-testid="saved-html">{value}</output></QueryClientProvider>}
describe('postagem em texto contínuo',()=>{
 it('começa com um editor sem exigir seções ou blocos',()=>{
  render(<Editor initial=""/>)
  expect(screen.getByRole('textbox',{name:'Conteúdo da postagem'})).toBeInTheDocument()
  expect(screen.queryByRole('button',{name:'Adicionar seção vazia'})).not.toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Negrito'})).toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Vídeo'})).toBeInTheDocument()
 })
 it('insere vídeo entre os parágrafos pelo modal e preserva o link no conteúdo',async()=>{
  render(<Editor initial="<p>Texto inicial</p>"/>)
  fireEvent.click(screen.getByRole('button',{name:'Vídeo'}))
  const dialog=await screen.findByRole('dialog',{name:'Inserir mídia'})
  fireEvent.change(await within(dialog).findByRole('textbox',{name:'Link do YouTube, Vimeo ou Instagram'}),{target:{value:'https://youtu.be/M7lc1UVf-VE'}})
  fireEvent.click(within(dialog).getByRole('button',{name:'Concluir'}))
  await waitFor(()=>expect(screen.getByTestId('saved-html').textContent).toContain('data-post-video'))
  expect(screen.getByTestId('saved-html')).toHaveTextContent('https://youtu.be/M7lc1UVf-VE')
  expect(screen.getByTestId('saved-html')).toHaveTextContent('Texto inicial')
  fireEvent.click(document.querySelector('.ProseMirror [data-post-video]')!)
  expect(screen.getByRole('button',{name:'Editar mídia selecionada'})).toBeEnabled()
  fireEvent.click(screen.getByRole('button',{name:'Editar mídia selecionada'}))
  const editing=await screen.findByRole('dialog',{name:'Editar mídia'})
  expect(await within(editing).findByRole('textbox',{name:'Link do YouTube, Vimeo ou Instagram'})).toHaveValue('https://youtu.be/M7lc1UVf-VE')
 })
 it('não insere vídeo sem endereço válido',async()=>{
  render(<Editor initial=""/>)
  fireEvent.click(screen.getByRole('button',{name:'Vídeo'}))
  const dialog=await screen.findByRole('dialog',{name:'Inserir mídia'})
  await within(dialog).findByRole('textbox',{name:'Link do YouTube, Vimeo ou Instagram'})
  fireEvent.click(within(dialog).getByRole('button',{name:'Concluir'}))
  expect(await within(dialog).findByRole('alert')).toBeInTheDocument()
  expect(screen.getByTestId('saved-html')).not.toHaveTextContent('data-post-video')
 })
 it('preserva a ordenação e edição de posts já salvos em blocos',()=>{
  render(<Editor initial={'<section data-post-block><p>Primeiro</p></section><section data-post-block><p>Segundo</p></section>'}/>)
  fireEvent.keyDown(screen.getByRole('button',{name:'Arrastar bloco 2'}),{key:'ArrowUp',altKey:true})
  const html=screen.getByTestId('saved-html').textContent!
  expect(html.indexOf('Segundo')).toBeLessThan(html.indexOf('Primeiro'))
 })
 it('preserva seções antigas sem converter o conteúdo automaticamente',()=>{
  const html=serializePostSections([newPostSection('<p>Conteúdo anterior</p>')])
  render(<Editor initial={html}/>)
  expect(screen.getByTestId('saved-html').textContent).toBe(html)
  expect(screen.getByRole('textbox',{name:'Nome da seção 1'})).toBeInTheDocument()
 })
})
