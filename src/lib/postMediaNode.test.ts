import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { expect, it } from 'vitest'
import { PostMediaNode } from './postMediaNode'
it('preserva galerias e vídeos com seus atributos sem executar marcação ativa',()=>{
 const editor=new Editor({extensions:[StarterKit,PostMediaNode],content:'<p>Antes</p><figure data-post-gallery="slides"><img src="https://example.test/foto.jpg" alt="Foto" onerror="alert(1)"><script>alert(1)</script></figure><div data-post-video><a href="https://youtu.be/M7lc1UVf-VE">Vídeo</a></div><p>Depois</p>'})
 const html=editor.getHTML()
 expect(html).toContain('data-post-gallery="slides"')
 expect(html).toContain('data-post-video')
 expect(html).toContain('Depois')
 expect(html).not.toContain('<script')
 expect(html).not.toContain('onerror')
 editor.destroy()
})
it('mantém blobs do rascunho e elimina blobs que não pertencem a ele',()=>{
 const editor=new Editor({extensions:[StarterKit,PostMediaNode.configure({localRefs:()=>['blob:known']})],content:'<figure data-post-gallery="grid"><img src="blob:known" alt="Foto"><img src="blob:foreign" alt="Outra"></figure>'})
 expect(editor.getHTML()).toContain('src="blob:known"')
 expect(editor.getHTML()).not.toContain('src="blob:foreign"')
 editor.destroy()
})
