import { mediaStyle } from './editorPlacement'
import { Extension } from '@tiptap/react'
export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48] as const
export const EditorFormatting = Extension.create({
 name: 'editorFormatting',
 addGlobalAttributes: () => [
  { types: ['textStyle'], attributes: { fontSize: {
   default: null,
   parseHTML: element => FONT_SIZES.some(size => `${size}px` === element.style.fontSize) ? element.style.fontSize : null,
   renderHTML: attributes => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
  } } },
  { types: ['image'], attributes: {
    mediaAlign: { default: 'center', parseHTML: element => element.style.marginLeft === '0px' || element.style.marginLeft === '0' ? 'left' : element.style.marginRight === '0px' || element.style.marginRight === '0' ? 'right' : 'center', renderHTML: () => ({}) },
    mediaWidth: { default: '100%', parseHTML: element => ['50%','75%','100%'].includes(element.style.width) ? element.style.width : '100%', renderHTML: attributes => ({ style: mediaStyle(attributes.mediaAlign ?? 'center', attributes.mediaWidth) }) },
  } },
  { types: ['paragraph','heading'], attributes: {
   textAlign: { default: null, parseHTML: element => ['left','center','right','justify'].includes(element.style.textAlign) ? element.style.textAlign : null, renderHTML: attributes => attributes.textAlign ? { style: `text-align: ${attributes.textAlign}` } : {} },
   lineHeight: { default: null, parseHTML: element => ['1','1.5','2'].includes(element.style.lineHeight) ? element.style.lineHeight : null, renderHTML: attributes => attributes.lineHeight ? { style: `line-height: ${attributes.lineHeight}` } : {} },
  } },
 ],
})
