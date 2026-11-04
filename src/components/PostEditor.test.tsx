import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import { PostEditor } from './PostEditor'
import { newPostSection, serializePostSections } from '@/lib/postSections'
afterEach(cleanup)
function Editor({initial}:{initial:string}){const [value,setValue]=useState(initial);return <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PostEditor value={value} onChange={setValue}/><output data-testid="saved-html">{value}</output></QueryClientProvider>}
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
  fireEvent.change(await within(dialog).findByRole('textbox',{name:'Link do YouTube, Vimeo, Instagram ou arquivo de vídeo'}),{target:{value:'https://youtu.be/M7lc1UVf-VE'}})
  fireEvent.click(within(dialog).getByRole('button',{name:'Concluir'}))
  await waitFor(()=>expect(screen.getByTestId('saved-html').textContent).toContain('data-post-video'))
  expect(screen.getByTestId('saved-html')).toHaveTextContent('https://youtu.be/M7lc1UVf-VE')
  expect(screen.getByTestId('saved-html')).toHaveTextContent('Texto inicial')
  fireEvent.click(document.querySelector('.ProseMirror [data-post-video]')!)
  expect(screen.getByRole('button',{name:'Editar mídia selecionada'})).toBeEnabled()
  fireEvent.click(screen.getByRole('button',{name:'Editar mídia selecionada'}))
  const editing=await screen.findByRole('dialog',{name:'Editar mídia'})
  expect(await within(editing).findByRole('textbox',{name:'Link do YouTube, Vimeo, Instagram ou arquivo de vídeo'})).toHaveValue('https://youtu.be/M7lc1UVf-VE')
 })
 it('não insere vídeo sem endereço válido',async()=>{
  render(<Editor initial=""/>)
  fireEvent.click(screen.getByRole('button',{name:'Vídeo'}))
  const dialog=await screen.findByRole('dialog',{name:'Inserir mídia'})
  await within(dialog).findByRole('textbox',{name:'Link do YouTube, Vimeo, Instagram ou arquivo de vídeo'})
  fireEvent.click(within(dialog).getByRole('button',{name:'Concluir'}))
  expect(await within(dialog).findByRole('alert')).toBeInTheDocument()
  expect(screen.getByTestId('saved-html')).not.toHaveTextContent('data-post-video')
 })
 it('abre posts antigos em um único editor, preservando textos e imagens',()=>{
  render(<Editor initial={'<section data-post-block><p>Primeiro</p></section><section data-post-block><p>Segundo</p><img src="https://example.test/foto.jpg" alt="Foto anterior"></section>'}/>)
  const editor=screen.getByRole('textbox',{name:'Conteúdo da postagem'})
  expect(editor).toHaveTextContent('Primeiro')
  expect(editor).toHaveTextContent('Segundo')
  expect(editor.querySelector('img')).toHaveAttribute('src','https://example.test/foto.jpg')
  expect(screen.queryByRole('button',{name:'Adicionar seção vazia'})).not.toBeInTheDocument()
  expect(screen.queryByRole('button',{name:'Arrastar bloco 1'})).not.toBeInTheDocument()
 })
 it('abre seções antigas no editor contínuo sem gravar alterações só por abrir',()=>{
  const html=serializePostSections([newPostSection('<p>Conteúdo anterior</p>')])
  render(<Editor initial={html}/>)
  expect(screen.getByTestId('saved-html').textContent).toBe(html)
  expect(screen.getByRole('textbox',{name:'Conteúdo da postagem'})).toHaveTextContent('Conteúdo anterior')
  expect(screen.queryByRole('textbox',{name:'Nome da seção 1'})).not.toBeInTheDocument()
 })
 it('abre um único modal de imagem com envio e posição juntos',async()=>{
  render(<Editor initial="<p>Texto</p>"/>)
  fireEvent.click(screen.getByRole('button',{name:'Inserir imagem'}))
  const dialog=await screen.findByRole('dialog',{name:'Inserir imagem'})
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
  expect(within(dialog).getByLabelText('Arquivo JPG ou PNG — Imagem — Computador')).toBeInTheDocument()
  expect(within(dialog).getByRole('combobox',{name:'Posição da mídia'})).toBeInTheDocument()
  expect(within(dialog).queryByRole('button',{name:'Editar Imagem'})).not.toBeInTheDocument()
 })

})
