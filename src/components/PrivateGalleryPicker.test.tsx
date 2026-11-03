import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PrivateGalleryPicker } from './PrivateGalleryPicker'
const mocks = vi.hoisted(() => ({ file: new File(['jpg'], 'foto.jpg', { type: 'image/jpeg' }), download: vi.fn() }))
vi.mock('@/hooks/usePrivateGallery', () => ({ usePrivateGallery: () => ({ data: { images: [{ path: 'own/foto.jpg', name: 'foto.jpg', url: 'https://preview.test/signed' }], hasMore: false } }) }))
vi.mock('@/lib/privateGallery', () => ({ privateGalleryFile: mocks.download }))
describe('seleção da galeria', () => {
 it('entrega arquivo reutilizável, não a URL temporária, e bloqueia durante download', async () => {
  let resolve!: (file: File) => void
  mocks.download.mockReturnValue(new Promise<File>(done => { resolve = done }))
  const choose = vi.fn().mockResolvedValue(undefined), busy = vi.fn()
  render(<PrivateGalleryPicker onChoose={choose} onBusyChange={busy} />)
  fireEvent.click(screen.getByRole('button', { name: 'Usar imagem 1 da minha galeria' }))
  expect(busy).toHaveBeenCalledWith(true)
  expect(choose).not.toHaveBeenCalled()
  resolve(mocks.file)
  await waitFor(() => expect(choose).toHaveBeenCalledWith(mocks.file))
  await waitFor(() => expect(busy).toHaveBeenLastCalledWith(false))
 })
})
