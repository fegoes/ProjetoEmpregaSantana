import {parseLayout,resolveLink,type Block,type ButtonItem} from './pageLayout.js'
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const text=(s:string)=>escape(s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim())
function image(url:string,alt:string){return url?`<img src="${escape(url)}" alt="${escape(alt)}" loading="lazy" />`:''}
function buttons(items:ButtonItem[]){return items.map(b=>{const link=resolveLink(b.link);return link?`<p><a href="${escape(link.href)}">${escape(b.label)}</a></p>`:''}).join('')}
function blockHtml(block:Block):string {
 switch(block.type){
  case 'heading':return `<h2>${escape(block.title)}</h2><p>${escape(block.subtitle)}</p>`
  case 'text':return `<p>${text(block.html)}</p>`
  case 'image':return image(block.imageUrl,block.alt)
  case 'buttons':return buttons(block.items)
  case 'media_text':return `<section><h2>${escape(block.title)}</h2><p>${text(block.html)}</p>${block.media.kind==='image'?image(block.media.imageUrl,block.media.alt):''}${buttons(block.buttons)}</section>`
  case 'icon_list':return `<ul>${block.items.map(i=>`<li><h3>${escape(i.title)}</h3><p>${escape(i.text)}</p>${i.media.kind==='image'?image(i.media.imageUrl,i.media.alt):''}</li>`).join('')}</ul>`
  case 'search':return '<p><a href="/explorar">Buscar vagas e serviços</a></p>'
  case 'feed':return '<p><a href="/explorar">Explorar vagas e profissionais</a></p>'
 }
}
export function publicLayoutHtml(raw:unknown):string|null {
 const layout=parseLayout(raw)
 if(!layout?.sections.length)return null
 return layout.sections.flatMap(section=>section.type==='slides'?section.slides:[section]).map(section=>`<section>${section.blocks.map(blockHtml).join('')}</section>`).join('')
}
