import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {useState} from 'react'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {afterEach,describe,it,expect} from 'vitest'
import {PostBlocksEditor} from './PostBlocksEditor'
afterEach(cleanup)
function Editor({initial}:{initial:string}){const [value,setValue]=useState(initial);return <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PostBlocksEditor value={value} onChange={setValue}/><output data-testid="saved-html">{value}</output></QueryClientProvider>}
describe('editor visual de posts',()=>{
 it('move blocos com controles acessíveis e conserva o texto legado',()=>{render(<Editor initial={'Texto legado<p>Segundo bloco</p>'}/>);fireEvent.click(screen.getByRole('button',{name:'Descer bloco 1'}));const html=screen.getByTestId('saved-html').textContent!;expect(html.indexOf('Segundo bloco')).toBeLessThan(html.indexOf('Texto legado'));expect(html).toContain('data-post-block')})
 it('oferece reordenação pelo teclado na alça',()=>{render(<Editor initial={'<p>Primeiro</p><p>Segundo</p>'}/>);fireEvent.keyDown(screen.getByRole('button',{name:'Arrastar bloco 2'}),{key:'ArrowUp',altKey:true});const html=screen.getByTestId('saved-html').textContent!;expect(html.indexOf('Segundo')).toBeLessThan(html.indexOf('Primeiro'))})
})

it('começa vazio e deixa o usuário escolher a seção e seu primeiro bloco',()=>{render(<Editor initial=""/>);expect(screen.getByText(/Sua postagem está vazia/)).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Adicionar seção vazia'}));expect(screen.getByRole('textbox',{name:'Nome da seção 1'})).toBeInTheDocument();expect(screen.queryByRole('textbox',{name:'Conteúdo do bloco 1'})).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Texto'}));expect(screen.getByRole('textbox',{name:'Conteúdo do bloco 1'})).toBeInTheDocument()})
it('converte HTML legado em uma seção sem perder o texto ao salvar',()=>{render(<Editor initial="<p>Texto preservado</p>"/>);fireEvent.click(screen.getByRole('button',{name:'Organizar este post em seções'}));expect(screen.getByTestId('saved-html')).toHaveTextContent('Texto preservado');expect(screen.getByTestId('saved-html').textContent).toContain('data-post-section')})
