import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { expect, it } from 'vitest'
import { EditorFormatting } from './editorFormatting'
it('salva e reabre tamanho, cor, alinhamento e entrelinhas',()=>{
 const extensions=[StarterKit,TextStyle,Color,Image,EditorFormatting]
 const editor=new Editor({extensions,content:'<p>Texto selecionado</p>'})
 editor.commands.selectAll()
 editor.chain().setMark('textStyle',{fontSize:'24px',color:'#123456'}).updateAttributes('paragraph',{textAlign:'center',lineHeight:'2'}).run()
 const html=editor.getHTML(),reopened=new Editor({extensions,content:html})
 expect(html).toContain('font-size: 24px')
 expect(html).toContain('text-align: center')
 expect(html).toContain('line-height: 2')
 expect(reopened.getJSON().content?.[0].attrs).toMatchObject({textAlign:'center',lineHeight:'2'})
 editor.destroy();reopened.destroy()
})
it('preserva alinhamento e largura da imagem ao reabrir',()=>{
 const editor=new Editor({extensions:[StarterKit,Image,EditorFormatting],content:'<img src="https://example.test/foto.jpg" style="display:block;width:50%;margin-left:auto;margin-right:0" alt="Foto">'})
 expect(editor.getJSON().content?.[0].attrs).toMatchObject({mediaAlign:'right',mediaWidth:'50%'})
 expect(editor.getHTML()).toContain('width: 50%')
 editor.destroy()
})
