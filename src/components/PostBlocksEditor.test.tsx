import {useState} from 'react'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {afterEach,describe,it,expect} from 'vitest'
import {PostBlocksEditor} from './PostBlocksEditor'
afterEach(cleanup)
function Editor({initial}:{initial:string}){const [value,setValue]=useState(initial);return <><PostBlocksEditor value={value} onChange={setValue}/><output data-testid="saved-html">{value}</output></>}
describe('editor visual de posts',()=>{
 it('move blocos com controles acessíveis e conserva o texto legado',()=>{render(<Editor initial={'Texto legado<p>Segundo bloco</p>'}/>);fireEvent.click(screen.getByRole('button',{name:'Descer bloco 1'}));const html=screen.getByTestId('saved-html').textContent!;expect(html.indexOf('Segundo bloco')).toBeLessThan(html.indexOf('Texto legado'));expect(html).toContain('data-post-block')})
 it('oferece reordenação pelo teclado na alça',()=>{render(<Editor initial={'<p>Primeiro</p><p>Segundo</p>'}/>);fireEvent.keyDown(screen.getByRole('button',{name:'Arrastar bloco 2'}),{key:'ArrowUp',altKey:true});const html=screen.getByTestId('saved-html').textContent!;expect(html.indexOf('Segundo')).toBeLessThan(html.indexOf('Primeiro'))})
})
