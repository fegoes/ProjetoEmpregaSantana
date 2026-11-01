import { useState } from 'react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DraftImagesProvider } from './DraftImagesProvider'
import { useDraftImages } from '@/contexts/draftImagesContext'
import { RichTextRenderer } from './RichTextRenderer'
afterEach(()=>{cleanup();vi.unstubAllGlobals()})
function Body(){const draft=useDraftImages()!;const [refs]=useState(()=>{const desktop=draft.store.stageFile(new File(['jpg'],'desktop.jpg',{type:'image/jpeg'})),mobile=draft.store.stageFile(new File(['png'],'mobile.png',{type:'image/png'}));draft.store.setVariant(desktop,mobile);return {desktop,mobile}});return <RichTextRenderer html={`<p><img src="${refs.desktop}" alt="Prévia local"></p><script>alert(1)</script>`}/>}
describe('prévia sem envio',()=>{
 it('exibe as variantes locais no corpo do post sem retirar a sanitização',async()=>{const NativeURL=URL;let sequence=0;vi.stubGlobal('URL',class extends NativeURL{static createObjectURL(){return `blob:preview-${++sequence}`}static revokeObjectURL(){}});const {container}=render(<QueryClientProvider client={new QueryClient()}><DraftImagesProvider><Body/></DraftImagesProvider></QueryClientProvider>);expect(container.querySelector('img')).toHaveAttribute('src','blob:preview-1');await waitFor(()=>expect(container.querySelector('source')).toHaveAttribute('srcset','blob:preview-2'));expect(container.querySelector('script')).toBeNull()})
 it('não preserva uma referência blob não registrada como arquivo local',()=>{const {container}=render(<RichTextRenderer html={'<img src="blob:unregistered" onerror="alert(1)">'} />);expect(container.querySelector('img')).not.toHaveAttribute('onerror');expect(container.querySelector('img')).not.toHaveAttribute('src','blob:unregistered')})
})
