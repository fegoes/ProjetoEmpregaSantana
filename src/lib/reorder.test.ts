import {describe,it,expect} from 'vitest'
import {reorderById} from './reorder'
describe('reordenação visual',()=>{
 it('move entre posições mantendo IDs e conteúdo',()=>{const blocks=[{id:'a',html:'A'},{id:'b',html:'B'},{id:'c',html:'C'}];expect(reorderById(blocks,'a','c').map(b=>b.html)).toEqual(['B','C','A']);expect(blocks.map(b=>b.id)).toEqual(['a','b','c']);expect(reorderById(blocks,'c','a')[0].id).toBe('c')})
 it('ignora alvos de outra lista',()=>{const blocks=[{id:'a'}];expect(reorderById(blocks,'external','a')).toEqual(blocks)})
})
