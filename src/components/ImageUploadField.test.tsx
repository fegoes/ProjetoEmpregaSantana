import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ImageUploadField } from './ImageUploadField'
vi.stubGlobal('URL', Object.assign(URL, {createObjectURL:vi.fn(()=>"blob:test"),revokeObjectURL:vi.fn()}))
const save=vi.hoisted(()=>vi.fn().mockResolvedValue(undefined))
vi.mock('@/hooks/useImageVariant',()=>({useImageVariant:()=>({data:null,save})}))
describe('uploads separados',()=>{
 it('mostra dois campos e impede envio móvel antes da imagem desktop',()=>{render(<ImageUploadField label="Foto" currentUrl={null} onUpload={vi.fn()} onUploaded={vi.fn()} />);fireEvent.click(screen.getByRole('button',{name:'Editar Foto'}));fireEvent.click(screen.getByText('Imagem para celular (opcional)',{exact:true}));expect(screen.getByLabelText('Foto — Computador')).toBeEnabled();expect(screen.getByLabelText('Foto — Celular (opcional)')).toBeDisabled()})
 it('salva a imagem móvel sem substituir o valor desktop do formulário',async()=>{const onUploaded=vi.fn(),upload=vi.fn().mockResolvedValue('https://example.test/mobile.jpg');render(<ImageUploadField label="Foto" currentUrl="https://example.test/desktop.jpg" onUpload={upload} onUploaded={onUploaded} />);fireEvent.click(screen.getByRole('button',{name:'Editar Foto'}));fireEvent.click(screen.getByText('Imagem para celular (opcional)',{exact:true}));fireEvent.change(screen.getByLabelText('Foto — Celular (opcional)'),{target:{files:[new File(['jpg'],'mobile.jpg',{type:'image/jpeg'})]}});await waitFor(()=>expect(save).toHaveBeenCalledWith('https://example.test/mobile.jpg'));expect(onUploaded).not.toHaveBeenCalled()})
})
