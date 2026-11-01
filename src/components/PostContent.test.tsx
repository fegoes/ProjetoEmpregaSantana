import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PostContent } from './PostContent'
import { newPostSection, serializePostSections, postContentIssues } from '@/lib/postSections'
afterEach(cleanup)
describe('leitura das postagens',()=>{
 it('mantém as marcações de texto e cores da seção, removendo HTML ativo',()=>{const s=newPostSection('<section data-post-block><p><strong>Negrito</strong> <u>Sublinhado</u> <span style="color: rgb(30, 99, 182)">Azul</span><script>alert(1)</script></p></section>');s.background='#edf3fa';const {container}=render(<PostContent html={serializePostSections([s])}/>);expect(container.querySelector('strong')).toHaveTextContent('Negrito');expect(container.querySelector('u')).toHaveTextContent('Sublinhado');expect(container.querySelector('span')).toHaveStyle({color:'rgb(30, 99, 182)'});expect(container.querySelector('.post-content-section')).toHaveStyle({backgroundColor:'#edf3fa'});expect(container.querySelector('script')).toBeNull()})
 it('somente cria o player permitido após a escolha de carregar o vídeo',()=>{const {container}=render(<PostContent html={'<section data-post-block><div data-post-video><a href="https://youtube.com/watch?v=M7lc1UVf-VE">Vídeo</a></div></section>'}/>);expect(container.querySelector('iframe')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Carregar vídeo'}));expect(container.querySelector('iframe')).toHaveAttribute('src','https://www.youtube.com/embed/M7lc1UVf-VE')})
 it('orienta corrigir vídeos e galerias vazias antes de publicar',()=>{expect(postContentIssues('<div data-post-video><a href="javascript:alert(1)">X</a></div><figure data-post-gallery="grid"></figure>')).toHaveLength(2);expect(postContentIssues('<p>Conteúdo normal</p>')).toEqual([])})
})
