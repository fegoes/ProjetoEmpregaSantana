import { EditorFormatting, FONT_SIZES } from '@/lib/editorFormatting'
import { insertionRange, mediaStyle, type MediaPlacement, type MediaAlign } from '@/lib/editorPlacement'
import { NodeSelection } from '@tiptap/pm/state'
import { PostMediaNode } from '@/lib/postMediaNode'
import { postContentIssues } from '@/lib/postSections'
import { AdminModal } from './admin/AdminModal'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading2, List, ListOrdered, Link2, Eraser, Images, Video, Megaphone, GalleryHorizontal, Pencil, ImagePlus, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import { lazy, Suspense } from 'react'
const PostMediaEditor = lazy(() => import('./PostMediaBlockEditor').then(module => ({ default: module.PostMediaBlockEditor })))
import { FieldDialog } from './forms/FieldDialog'
import { stripHtml } from '@/lib/utils'
import { useDraftImages } from '@/contexts/draftImagesContext'
import Image from '@tiptap/extension-image'
import { EditorialImageField } from '@/components/EditorialImageField'
import { useState } from 'react'
import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { cn } from '@/lib/utils'
import { safeInternalPath } from '@/lib/portableUtils'

interface RichTextEditorProps {
  onUploadingChange?: (busy: boolean) => void
  inline?: boolean
  allowPostMedia?: boolean
  allowImages?: boolean
  disabled?: boolean
  ariaLabel?: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

// Wrapper Tiptap usado em descrições de vaga/empresa/autônomo e resumo de currículo.
// A saída HTML é sempre sanitizada no render via <RichTextRenderer /> (nunca aqui).
function RichTextEditorContent({ onUploadingChange, allowPostMedia = false, allowImages = false, disabled = false, ariaLabel, value, onChange, placeholder, className }: RichTextEditorProps) {
  const draftImages=useDraftImages()
  const [imageOpen,setImageOpen]=useState(false)
  const [imageEdit,setImageEdit]=useState(false)
  const [mediaSelection,setMediaSelection]=useState({from:1,to:1})
  const [placement,setPlacement]=useState<MediaPlacement>('cursor')
  const [mediaAlign,setMediaAlign]=useState<MediaAlign>('center')
  const [mediaWidth,setMediaWidth]=useState('100%')
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [newTab, setNewTab] = useState(true)
  const [linkError, setLinkError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [media, setMedia] = useState<string | null>(null)
  const [mediaEdit, setMediaEdit] = useState(false)
  const [mediaBusy, setMediaBusy] = useState(0)
  const [mediaError, setMediaError] = useState('')
  const editor = useEditor({
    extensions: [EditorFormatting, ...(allowPostMedia ? [PostMediaNode.configure({ localRefs: () => draftImages?.store.localRefs() ?? [] })] : []), Underline, TextStyle, Color, Image.configure({ allowBase64: false }), StarterKit, Link.configure({ openOnClick: false, autolink: true })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'min-h-48 bg-transparent px-4 py-3 text-sm leading-relaxed focus:outline-none',
          className,
        ),
        'aria-label': ariaLabel ?? 'Editor de texto',
        'aria-multiline': 'true',
        role: 'textbox',
        'data-placeholder': placeholder ?? '',
      },
    },
  })

  useEffect(() => { editor?.setEditable(!disabled, false) }, [editor, disabled])

  useEffect(() => {
    if (editor && editor.getHTML() !== value) editor.commands.setContent(value, false)
  }, [editor, value])

  const capturePosition = () => {
    if(editor)setMediaSelection({from:editor.state.selection.from,to:editor.state.selection.to})
    setPlacement('cursor');setMediaAlign('center');setMediaWidth('100%')
  }
  const placeMedia = (type:string,attrs:Record<string,unknown>,editing:boolean) => {
    if(!editor)return
    if(editing&&placement==='cursor'){editor.chain().focus().setNodeSelection(mediaSelection.from).updateAttributes(type,attrs).run();return}
    const range=insertionRange(editor.state.doc,mediaSelection,placement)
    const position=editing&&range.from>=mediaSelection.to?range.from-(mediaSelection.to-mediaSelection.from):range.from
    const chain=editor.chain().focus()
    if(editing)chain.deleteRange(mediaSelection)
    chain.insertContentAt(position,[{type,attrs},{type:'paragraph'}]).run()
  }
  const paragraphType=editor?.isActive('heading')?'heading':'paragraph'
  const paragraphAttrs=editor?.getAttributes(paragraphType) ?? {}
  const alignText=(align:string)=>editor?.chain().focus().updateAttributes('paragraph',{textAlign:align}).updateAttributes('heading',{textAlign:align}).run()
  const placementControls = (editing=false) => <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {<label className="text-sm">{editing?'Posição':'Inserir'}<select aria-label="Posição da mídia" value={placement} onChange={event=>setPlacement(event.target.value as MediaPlacement)} className="mt-1 min-h-11 w-full rounded border bg-card px-2"><option value="cursor">{editing?'Manter posição atual':'Na posição do cursor'}</option><option value="before">Antes do parágrafo</option><option value="after">Depois do parágrafo</option><option value="start">No início do texto</option><option value="end">No fim do texto</option></select></label>}
    <label className="text-sm">Alinhamento<select aria-label="Alinhamento da mídia" value={mediaAlign} onChange={event=>setMediaAlign(event.target.value as MediaAlign)} className="mt-1 min-h-11 w-full rounded border bg-card px-2"><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label>
    <label className="text-sm">Largura<select aria-label="Largura da mídia" value={mediaWidth} onChange={event=>setMediaWidth(event.target.value)} className="mt-1 min-h-11 w-full rounded border bg-card px-2"><option value="50%">Metade</option><option value="75%">Três quartos</option><option value="100%">Toda a largura</option></select></label>
  </div>
  const textSelectionActive=Boolean(editor)&&!editor?.isActive('image')&&!editor?.isActive('postMedia')
  const toolbar = () => <div role="toolbar" aria-label="Formatação do texto" className="sticky top-[var(--editor-toolbar-offset,0px)] z-20 flex max-w-full flex-wrap items-center gap-1 rounded-t-lg border-b bg-card p-2">
    {[
      {label:'Negrito',Icon:Bold,active:editor?.isActive('bold'),run:()=>editor?.chain().focus().toggleBold().run()},
      {label:'Itálico',Icon:Italic,active:editor?.isActive('italic'),run:()=>editor?.chain().focus().toggleItalic().run()},
      {label:'Sublinhado',Icon:UnderlineIcon,active:editor?.isActive('underline'),run:()=>editor?.chain().focus().toggleUnderline().run()},
      {label:'Riscado',Icon:Strikethrough,active:editor?.isActive('strike'),run:()=>editor?.chain().focus().toggleStrike().run()},
      {label:'Subtítulo',Icon:Heading2,active:editor?.isActive('heading',{level:2}),run:()=>editor?.chain().focus().toggleHeading({level:2}).run()},
      {label:'Lista',Icon:List,active:editor?.isActive('bulletList'),run:()=>editor?.chain().focus().toggleBulletList().run()},
      {label:'Lista numerada',Icon:ListOrdered,active:editor?.isActive('orderedList'),run:()=>editor?.chain().focus().toggleOrderedList().run()},
    ].map(item=><button key={item.label} type="button" aria-label={item.label} title={item.label} aria-pressed={Boolean(item.active)} disabled={disabled||!editor||!textSelectionActive} onMouseDown={event=>event.preventDefault()} onClick={item.run} className="flex size-11 items-center justify-center rounded hover:bg-accent aria-pressed:bg-accent"><item.Icon className="size-4" aria-hidden="true"/></button>)}
    <select aria-label="Tamanho da fonte" title="Tamanho da fonte" value={editor?.getAttributes('textStyle').fontSize ?? ''} disabled={disabled||!editor||!textSelectionActive} onChange={event=>editor?.chain().focus().setMark('textStyle',{fontSize:event.target.value||null}).run()} className="h-11 rounded border bg-card px-2 text-sm"><option value="">Padrão</option>{FONT_SIZES.map(size=><option key={size} value={`${size}px`}>{size} px</option>)}</select>
    <label className="flex min-h-11 items-center px-1"><span className="sr-only">Cor do texto</span><input aria-label="Cor do texto" title="Cor do texto" type="color" disabled={disabled||!editor||!textSelectionActive} value={/^#[a-f0-9]{6}$/i.test(editor?.getAttributes('textStyle').color ?? '')?editor!.getAttributes('textStyle').color:'#333333'} onChange={event=>editor?.chain().focus().setColor(event.target.value).run()} className="h-9 w-9 rounded border bg-card p-1"/></label>
    {[{value:'left',label:'Alinhar à esquerda',Icon:AlignLeft},{value:'center',label:'Centralizar texto',Icon:AlignCenter},{value:'right',label:'Alinhar à direita',Icon:AlignRight},{value:'justify',label:'Justificar texto',Icon:AlignJustify}].map(item=><button key={item.value} type="button" aria-label={item.label} title={item.label} disabled={disabled||!editor||!textSelectionActive} aria-pressed={(paragraphAttrs.textAlign||'left')===item.value} onMouseDown={event=>event.preventDefault()} onClick={()=>alignText(item.value)} className="flex size-11 items-center justify-center rounded hover:bg-accent aria-pressed:bg-accent"><item.Icon className="size-4" aria-hidden="true"/></button>)}
    <select aria-label="Espaçamento entre linhas" title="Espaçamento entre linhas" value={paragraphAttrs.lineHeight??''} disabled={disabled||!editor||!textSelectionActive} onChange={event=>editor?.chain().focus().updateAttributes('paragraph',{lineHeight:event.target.value||null}).updateAttributes('heading',{lineHeight:event.target.value||null}).run()} className="h-11 rounded border bg-card px-2 text-sm"><option value="">Entrelinhas</option><option value="1">Simples</option><option value="1.5">1,5</option><option value="2">Duplo</option></select>
    <button type="button" aria-label="Hiperlink" title="Hiperlink" disabled={disabled||!editor||!textSelectionActive} onMouseDown={event=>event.preventDefault()} onClick={()=>{setLinkUrl(editor?.getAttributes('link').href??'');setLinkError('');setLinkOpen(true)}} className="flex size-11 items-center justify-center rounded hover:bg-accent"><Link2 className="size-4" aria-hidden="true"/></button>
    <button type="button" aria-label="Limpar formatação" title="Limpar formatação" disabled={disabled||!editor||!textSelectionActive} onMouseDown={event=>event.preventDefault()} onClick={()=>editor?.chain().focus().unsetAllMarks().run()} className="flex size-11 items-center justify-center rounded hover:bg-accent"><Eraser className="size-4" aria-hidden="true"/></button>
    {allowImages&&<button type="button" aria-label={editor?.isActive('image')?'Editar imagem':'Inserir imagem'} title="Imagem" disabled={disabled||!editor} onMouseDown={event=>event.preventDefault()} onClick={()=>{capturePosition();const editing=Boolean(editor?.isActive('image'));setImageEdit(editing);if(editing){const attrs=editor!.getAttributes('image');setImageUrl(attrs.src);setImageAlt(attrs.alt||'');setMediaAlign(attrs.mediaAlign||'center');setMediaWidth(attrs.mediaWidth||'100%')}setImageOpen(true)}} className="flex size-11 items-center justify-center rounded hover:bg-accent"><ImagePlus className="size-4" aria-hidden="true"/></button>}
    {allowPostMedia && <div className="flex flex-wrap gap-1" aria-label="Inserir mídia">{[
      {label:'Galeria', Icon:Images, html:'<figure data-post-gallery="grid"></figure>'},
      {label:'Slides', Icon:GalleryHorizontal, html:'<figure data-post-gallery="slides"></figure>'},
      {label:'Vídeo', Icon:Video, html:'<div data-post-video><a href="">Vídeo</a></div>'},
      {label:'Anúncio', Icon:Megaphone, html:'<aside data-post-ad><p></p></aside>'},
    ].map(item=><button key={item.label} type="button" aria-label={item.label} title={item.label} disabled={disabled} onMouseDown={event=>event.preventDefault()} className="flex size-11 items-center justify-center rounded-lg border hover:bg-accent" onClick={()=>{capturePosition();setMedia(item.html);setMediaEdit(false);setMediaError('')}}><item.Icon className="size-5" aria-hidden="true" /></button>)}
    {editor?.isActive('postMedia')&&<button type="button" aria-label="Editar mídia selecionada" title="Editar mídia selecionada" onMouseDown={event=>event.preventDefault()} disabled={disabled||!editor?.isActive('postMedia')} className="flex size-11 items-center justify-center rounded-lg border disabled:opacity-40" onClick={()=>{capturePosition();const html=editor?.getAttributes('postMedia').html ?? '';const element=new DOMParser().parseFromString(html,'text/html').body.firstElementChild as HTMLElement|null;setMediaAlign(element?.getAttribute('data-media-align') as MediaAlign || 'center');setMediaWidth(element?.getAttribute('data-media-width') || '100%');setMedia(html);setMediaEdit(true);setMediaError('')}}><Pencil className="size-5" aria-hidden="true" /></button>}</div>}
  </div>
  return <div className="relative min-w-0 rounded-lg border bg-card" onClickCapture={event=>{
    const media=(event.target as HTMLElement).closest('[data-post-gallery], [data-post-video], [data-post-ad]')
    if(!editor || !media || !editor.view.dom.contains(media))return
    event.preventDefault();event.stopPropagation()
    editor.state.doc.descendants((node,position)=>{
      if(node.type.name==='postMedia' && editor.view.nodeDOM(position)===media){editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc,position)));editor.view.focus();return false}
    })
  }}>
    {toolbar()}
    {linkOpen && <div className="space-y-3 rounded-lg border bg-accent/30 p-3" role="group" aria-label="Editar hiperlink">
      <label className="block text-sm">Destino do hiperlink<input aria-label="Destino do hiperlink" type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="mt-2 min-h-11 w-full rounded-md border bg-card px-3" placeholder="https://… ou /pagina/…" /></label>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={newTab} onChange={e => setNewTab(e.target.checked)} />Abrir em outra aba</label>
      {linkError && <p role="alert" className="text-sm text-destructive-ink">{linkError}</p>}
      <div className="flex flex-wrap gap-2"><button type="button" disabled={disabled} className="min-h-11 rounded-md border bg-card px-3 text-sm" onClick={() => {
        const raw = linkUrl.trim()
        const internal = safeInternalPath(raw) !== null
        let valid = internal
        try { valid ||= ['https:', 'http:'].includes(new URL(raw).protocol) } catch { /* caminho interno validado acima */ }
        if (!valid) { setLinkError('Use um endereço http(s) válido ou um caminho do site.'); return }
        editor?.chain().focus().extendMarkRange('link').setLink({ href: raw, target: newTab ? '_blank' : null, rel: newTab ? 'noopener noreferrer' : null }).run()
        setLinkOpen(false)
      }}>Aplicar link</button><button type="button" disabled={disabled} className="min-h-11 px-3 text-sm text-primary" onClick={() => { editor?.chain().focus().extendMarkRange('link').unsetLink().run(); setLinkOpen(false) }}>Remover link</button><button type="button" className="min-h-11 px-3 text-sm" onClick={() => setLinkOpen(false)}>Cancelar</button></div>
    </div>}
    <EditorContent editor={editor} className="max-h-[45dvh] overflow-y-auto" />
    <AdminModal open={media !== null} onClose={()=>setMedia(null)} busy={mediaBusy>0} title={mediaEdit?'Editar mídia':'Inserir mídia'} description="Imagem, vídeo ou anúncio no texto.">
     {media !== null && <Suspense fallback={<p>Carregando…</p>}><PostMediaEditor html={media} onChange={setMedia} disabled={disabled||mediaBusy>0} uploading={busy=>{setMediaBusy(count=>Math.max(0,count+(busy?1:-1)));onUploadingChange?.(busy)}} /></Suspense>}
     <div className="my-4">{placementControls(mediaEdit)}</div>
     {mediaError&&<p role="alert" className="text-sm text-destructive">{mediaError}</p>}
     <button type="button" disabled={disabled||mediaBusy>0} className="mt-4 min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground" onClick={()=>{
       const issue=postContentIssues(media ?? '', url => Boolean(draftImages?.store.isVideo(url)))[0] || (media?.includes('data-post-ad') && !stripHtml(media) && !/<img\b/.test(media) ? 'Preencha o anúncio.' : undefined);if(issue){setMediaError(issue);return}
       if(!editor || !media)return
       const element=new DOMParser().parseFromString(media,'text/html').body.firstElementChild as HTMLElement
       element.setAttribute('data-media-align',mediaAlign);element.setAttribute('data-media-width',mediaWidth);element.setAttribute('style',mediaStyle(mediaAlign,mediaWidth))
       const html=element.outerHTML
       placeMedia('postMedia',{html},mediaEdit)
       setMedia(null)
     }}>Concluir</button>
    </AdminModal>
    <AdminModal open={imageOpen} onClose={()=>setImageOpen(false)} busy={mediaBusy>0} title={imageEdit?'Editar imagem':'Inserir imagem'} description="Escolha a imagem e a posição no texto.">
     <div className="space-y-4"><EditorialImageField inline onUploadingChange={busy=>{setMediaBusy(count=>Math.max(0,count+(busy?1:-1)));onUploadingChange?.(busy)}} label="Imagem" value={imageUrl} onChange={setImageUrl}/><label className="block text-sm">Descrição da imagem<input aria-label="Descrição da imagem" className="mt-1 min-h-11 w-full rounded border px-3" value={imageAlt} onChange={event=>setImageAlt(event.target.value)}/></label>{placementControls(imageEdit)}
     <button type="button" disabled={disabled||!editor||mediaBusy>0||(!/^https:\/\//.test(imageUrl)&&!draftImages?.store.isLocal(imageUrl))||!imageAlt.trim()} className="min-h-11 rounded bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50" onClick={()=>{if(!editor)return;placeMedia('image',{src:imageUrl,alt:imageAlt.trim(),mediaAlign,mediaWidth},imageEdit);setImageOpen(false);setImageUrl('');setImageAlt('')}}>{imageEdit?'Salvar imagem':'Inserir imagem no texto'}</button></div>
    </AdminModal>
  </div>
}

export function RichTextEditor(props: RichTextEditorProps) {
 const [uploads, setUploads] = useState(0)
 if(props.inline)return <RichTextEditorContent {...props} />
 return <FieldDialog label={props.ariaLabel || 'Texto'} kind="text" summary={stripHtml(props.value).slice(0, 100) || props.placeholder || 'Escrever texto'} busy={uploads > 0} disabled={props.disabled}>
  <RichTextEditorContent {...props} onUploadingChange={busy => { setUploads(count => Math.max(0, count + (busy ? 1 : -1))); props.onUploadingChange?.(busy) }} />
 </FieldDialog>
}
