import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { expect, it } from 'vitest'
import { insertionRange } from './editorPlacement'
it('localiza cursor, limites do parágrafo e limites do documento sem substituir texto selecionado',()=>{
 const editor=new Editor({extensions:[StarterKit],content:'<p>Primeiro</p><p>Segundo</p>'})
 const doc=editor.state.doc,second=doc.child(0).nodeSize,selection={from:second+3,to:second+5}
 expect(insertionRange(doc,selection,'cursor')).toEqual({from:second+3,to:second+3})
 expect(insertionRange(doc,selection,'before')).toEqual({from:second,to:second})
 expect(insertionRange(doc,selection,'after')).toEqual({from:doc.content.size,to:doc.content.size})
 expect(insertionRange(doc,selection,'start')).toEqual({from:0,to:0})
 expect(insertionRange(doc,selection,'end')).toEqual({from:doc.content.size,to:doc.content.size})
 editor.destroy()
})
