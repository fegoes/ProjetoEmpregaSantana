import { expect, it } from 'vitest'
import { postEditorHtml } from './postEditorHtml'
it('retira a estrutura antiga e mantém a sequência, links, galerias e vídeos',()=>{
 const html='<section data-post-section data-background="#000000"><div data-section-body><section data-post-block><h2>Título</h2><p>Texto <a href="https://example.test">link</a></p></section><figure data-post-gallery="slides"><img src="https://example.test/foto.jpg" alt="Foto"></figure><div data-post-video><a href="https://youtu.be/M7lc1UVf-VE">Vídeo</a></div></div></section>'
 const result=postEditorHtml(html)
 expect(result).not.toMatch(/data-post-section|data-section-body|data-post-block/)
 expect(result).toContain('<h2>Título</h2>')
 expect(result).toContain('data-post-gallery="slides"')
 expect(result).toContain('data-post-video')
 expect(result.indexOf('<h2>')).toBeLessThan(result.indexOf('<figure'))
 expect(result).toContain('href="https://example.test"')
})
