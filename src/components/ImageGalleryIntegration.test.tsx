import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ImageSourcePicker } from './ImageSourcePicker'
const mocks = vi.hoisted(() => ({ file: new File(['jpg'], 'guardada.jpg', { type: 'image/jpeg' }), download: vi.fn() }))
vi.mock('@/hooks/usePrivateGallery', () => ({ usePrivateGallery: () => ({ data: { images: [{ path: 'own/guardada.jpg', name: 'guardada.jpg', url: 'https://preview.test/temporary' }], hasMore: false } }) }))
vi.mock('@/lib/privateGallery', () => ({ privateGalleryFile: mocks.download }))
it('campo compartilhado oferece as três origens e reutiliza imagem da biblioteca', async () => {
 mocks.download.mockResolvedValue(mocks.file)
 const onFile = vi.fn().mockResolvedValue(undefined), busy = vi.fn()
 render(<ImageSourcePicker label="Foto da vaga" onFile={onFile} onBusyChange={busy} />)
 expect(screen.getByRole('radio', { name: 'Arquivo do dispositivo' })).toBeChecked()
 expect(screen.getByRole('radio', { name: 'Link da imagem' })).toBeInTheDocument()
 fireEvent.click(screen.getByRole('radio', { name: 'Minha galeria' }))
 fireEvent.click(await screen.findByRole('button', { name: 'Usar imagem 1 da minha galeria' }))
 await waitFor(() => expect(onFile).toHaveBeenCalledWith(mocks.file))
 expect(mocks.download).toHaveBeenCalledWith('own/guardada.jpg')
 await waitFor(() => expect(busy).toHaveBeenLastCalledWith(false))
})
