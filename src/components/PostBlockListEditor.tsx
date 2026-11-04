import { confirmAction } from '@/lib/confirmAction'
import { VisualInsertItem } from './pages/editor/VisualInserter'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react'
import { PostMediaBlockEditor } from './PostMediaBlockEditor'
import { RichTextEditor } from './RichTextEditor'
import { RichTextRenderer } from './RichTextRenderer'
import { EditorialImageField } from './EditorialImageField'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Sortable, DragHandle, useSortableItem } from './admin/Sortable'
import { moveItem } from '@/lib/utils'

interface Block {id:string;html:string;align:'left'|'center'|'right'}
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
function parse(html:string):Block[]{const doc=new DOMParser().parseFromString(html,'text/html');return Array.from(doc.body.childNodes).filter(node=>node.nodeType===1||node.textContent?.trim()).map(node=>node.nodeType===1?node as HTMLElement:Object.assign(doc.createElement('p'),{textContent:node.textContent})).map(el=>({id:crypto.randomUUID(),html:el.hasAttribute('data-post-block')?el.innerHTML:el.outerHTML,align:(el as HTMLElement).style.textAlign==='center'?'center':(el as HTMLElement).style.textAlign==='right'?'right':'left'}))}
const serialize=(blocks:Block[])=>blocks.map(b=>`<section data-post-block style="text-align: ${b.align}">${b.html}</section>`).join('')
function BlockItem({block,index,count,selected,select,change,move,duplicate,remove,disabled,uploading}:{block:Block;index:number;count:number;selected:boolean;select:()=>void;change:(b:Block)=>void;move:(d:-1|1)=>void;duplicate:()=>void;remove:()=>void;disabled:boolean;uploading?:(b:boolean)=>void}) {
  const sort=useSortableItem(block.id)
  const custom=/data-post-(gallery|video|ad)/.test(block.html)
  const image=!custom && /<figure[ >]|^<img[ >]/i.test(block.html)
  const doc=image?new DOMParser().parseFromString(block.html,'text/html'):null
  const img=doc?.querySelector('img'),caption=doc?.querySelector('figcaption')?.textContent??''
  const setImage=(src:string,alt:string,text:string)=>change({...block,html:`<figure data-image-block>${src?`<img src="${escape(src)}" alt="${escape(alt)}" />`:""}${text?`<figcaption>${escape(text)}</figcaption>`:''}</figure>`})
  return <li {...sort?.target} className={`min-w-0 rounded-xl border bg-card p-3 sm:p-4 ${sort?.over?'ring-2 ring-primary':''} ${selected?'border-primary':'border-border'}`}>
    <div className="flex flex-wrap items-center gap-1"><DragHandle id={block.id} label={`bloco ${index+1}`} /><button type="button" aria-expanded={selected} className="min-h-11 flex-1 text-left text-sm font-semibold" onClick={select}>Bloco {index+1}{image?' · Imagem':/^<hr/.test(block.html)?' · Separador':''}</button><Button type="button" size="icon" variant="ghost" aria-label={`Subir bloco ${index+1}`} disabled={disabled||index===0} onClick={()=>move(-1)}><ArrowUp /></Button><Button type="button" size="icon" variant="ghost" aria-label={`Descer bloco ${index+1}`} disabled={disabled||index===count-1} onClick={()=>move(1)}><ArrowDown /></Button><Button type="button" size="icon" variant="ghost" aria-label={`Duplicar bloco ${index+1}`} disabled={disabled} onClick={duplicate}><Copy /></Button><Button type="button" size="icon" variant="ghost" aria-label={`Excluir bloco ${index+1}`} disabled={disabled} onClick={remove}><Trash2 /></Button></div>
    {selected?<div className="space-y-4 border-t pt-4">{custom?<PostMediaBlockEditor html={block.html} onChange={html=>change({...block,html})} disabled={disabled} uploading={uploading} />:image?<><EditorialImageField onUploadingChange={uploading} label="Imagem do bloco" value={img?.getAttribute('src')??''} onChange={src=>setImage(src,img?.getAttribute('alt')??'',caption)} /><Label htmlFor={`alt-${block.id}`}>Descrição da imagem</Label><Input id={`alt-${block.id}`} value={img?.getAttribute('alt')??''} onChange={e=>setImage(img?.getAttribute('src')??'',e.target.value,caption)} /><Label htmlFor={`caption-${block.id}`}>Legenda (opcional)</Label><Input id={`caption-${block.id}`} value={caption} onChange={e=>setImage(img?.getAttribute('src')??'',img?.getAttribute('alt')??'',e.target.value)} /></>:!/^<hr/.test(block.html)?<RichTextEditor disabled={disabled} ariaLabel={`Conteúdo do bloco ${index+1}`} value={block.html} allowImages onUploadingChange={uploading} onChange={html=>change({...block,html})} />:<p className="text-sm text-muted-foreground">Separador visual entre os blocos.</p>}
      <label className="flex flex-wrap items-center gap-3 text-sm">Alinhamento<select className="min-h-11 rounded-md border bg-card px-3" value={block.align} onChange={e=>change({...block,align:e.target.value as Block['align']})}><option value="left">À esquerda</option><option value="center">Centralizado</option><option value="right">À direita</option></select></label>
    </div>:<div style={{textAlign:block.align}} className="min-w-0 py-2"><RichTextRenderer html={block.html} /></div>}
  </li>
}
export function PostBlockListEditor({value,onChange,disabled=false,onUploadingChange}:{value:string;onChange:(html:string)=>void;disabled?:boolean;onUploadingChange?:(busy:boolean)=>void}) {
  const [blocks,setBlocks]=useState<Block[]>(()=>parse(value)),[selected,setSelected]=useState<string|null>(null)
  const localUploads=useRef(0)
  const uploading=(busy:boolean)=>{localUploads.current=Math.max(0,localUploads.current+(busy?1:-1));onUploadingChange?.(busy)}
  const emitted=useRef(value)
  useEffect(()=>{if(value!==emitted.current){setBlocks(parse(value));emitted.current=value;setSelected(null)}},[value])
  const commit=(next:Block[])=>{if(disabled&&!localUploads.current)return;setBlocks(next);emitted.current=serialize(next);onChange(emitted.current)}
  const templates=[['Texto','<p></p>'],['Título','<h2></h2>'],['Imagem','<figure data-image-block></figure>'],['Lista','<ul><li><p></p></li></ul>'],['Citação','<blockquote><p></p></blockquote>'],['Separador','<hr />'],['Galeria','<figure data-post-gallery="grid"></figure>'],['Slides','<figure data-post-gallery="slides"></figure>'],['Vídeo','<div data-post-video><a href="">Abrir vídeo ou publicação original</a></div>'],['Anúncio','<aside data-post-ad><p></p></aside>']]
  return <div className="min-w-0 space-y-4"><p className="text-sm text-muted-foreground">Escolha um elemento. Passe o mouse sobre os ícones para identificá-los.</p><div role="group" aria-label="Adicionar bloco de postagem" className="flex flex-wrap gap-2">{templates.map(([label,html])=><VisualInsertItem key={label} kind="post" value={label} label={label} description={({Texto:"Parágrafos com formatação e links",Título:"Título ou subtítulo",Imagem:"Foto com versões desktop e móvel",Lista:"Lista de tópicos",Citação:"Trecho em destaque",Separador:"Linha entre conteúdos",Galeria:"Conjunto de imagens",Slides:"Imagens em carrossel",Vídeo:"YouTube, Vimeo ou publicação externa",Anúncio:"Espaço publicitário"} as Record<string,string>)[label]} disabled={disabled} onInsert={()=>{const b:Block={id:crypto.randomUUID(),html,align:'left'};commit([...blocks,b]);setSelected(b.id)}} />)}</div>
    <Sortable items={blocks} onChange={commit} label="Blocos do post"><ol className="space-y-3">{blocks.map((b,index)=><BlockItem key={b.id} block={b} index={index} count={blocks.length} selected={selected===b.id} select={()=>setSelected(b.id)} disabled={disabled} uploading={uploading} change={block=>commit(blocks.map(old=>old.id===block.id?block:old))} move={delta=>commit(moveItem(blocks,index,delta))} duplicate={()=>{const next=[...blocks],copy={...b,id:crypto.randomUUID()};next.splice(index+1,0,copy);commit(next);setSelected(copy.id)}} remove={async ()=>{if((await confirmAction('Excluir este bloco do post? A alteração será aplicada ao salvar.')))commit(blocks.filter(old=>old.id!==b.id))}} />)}</ol></Sortable>
    {!blocks.length&&<p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Adicione um bloco de texto, título ou imagem para começar.</p>}
  </div>
}
