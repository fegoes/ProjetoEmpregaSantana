import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ owner: 'user-one' as string | null, upload: vi.fn(), download: vi.fn(), from: vi.fn() }))
vi.mock('./supabase', () => ({ supabase: {
 auth: { getUser: async () => ({ data: { user: mocks.owner ? { id: mocks.owner } : null }, error: null }) },
 storage: { from: mocks.from },
} }))
import { privateGalleryFile, uploadPrivateImage } from './privateGallery'
import { uploadVagaGalleryPhoto } from './storage'
beforeEach(() => {
 mocks.owner = 'user-one'; mocks.upload.mockReset().mockResolvedValue({ error: null }); mocks.download.mockReset().mockResolvedValue({ data: new Blob(['jpg'], { type: 'image/jpeg' }), error: null })
 mocks.from.mockReset().mockImplementation((bucket: string) => ({ upload: (...args: unknown[]) => mocks.upload(bucket, ...args), download: mocks.download, getPublicUrl: (path: string) => ({ data: { publicUrl: `https://storage.test/public/${bucket}/${path}` } }) }))
})
describe('biblioteca privada reutilizável', () => {
 it('guarda novos uploads no usuário atual e não duplica no retry', async () => {
  const file = new File(['jpg'], 'foto.jpg', { type: 'image/jpeg' })
  const path = await uploadPrivateImage(file)
  expect(path).toMatch(/^user-one\/.+--foto.jpg$/)
  expect(await uploadPrivateImage(file)).toBe(path)
  expect(mocks.upload).toHaveBeenCalledTimes(1)
 })
 it('reutiliza original privado numa cópia pública sem armazenar URL assinada', async () => {
  const file = await privateGalleryFile('user-one/existente.jpg')
  const url = await uploadVagaGalleryPhoto(file, 'outra-vaga')
  expect(url).toContain('/public/public-media/vagas/outra-vaga/')
  expect(url).not.toContain('sign')
  expect(mocks.upload).toHaveBeenCalledTimes(1)
  expect(mocks.upload.mock.calls[0][0]).toBe('public-media')
 })
 it('guarda o original privado antes de criar a cópia de publicação', async () => {
  await uploadVagaGalleryPhoto(new File(['png'], 'foto.png', { type: 'image/png' }), 'vaga')
  expect(mocks.upload.mock.calls.map(call => call[0])).toEqual(['user-gallery', 'public-media'])
 })
 it('recusa caminho de outra pessoa antes de baixar', async () => {
  await expect(privateGalleryFile('user-two/foto.jpg')).rejects.toThrow('não pertence')
  await expect(privateGalleryFile('user-one/../user-two/foto.jpg')).rejects.toThrow('não pertence')
  expect(mocks.download).not.toHaveBeenCalled()
 })
 it('recusa acesso sem sessão e arquivos fora dos limites', async () => {
  mocks.owner = null
  await expect(privateGalleryFile('user-one/foto.jpg')).rejects.toThrow('Entre')
  await expect(uploadPrivateImage(new File(['gif'], 'x.gif', { type: 'image/gif' }))).rejects.toThrow('JPG ou PNG')
  expect(mocks.upload).not.toHaveBeenCalled()
 })
 it('não publica quando não consegue proteger o original na galeria', async () => {
  mocks.upload.mockResolvedValue({ error: new Error('storage denied') })
  await expect(uploadVagaGalleryPhoto(new File(['jpg'], 'x.jpg', { type: 'image/jpeg' }), 'vaga')).rejects.toThrow('galeria')
  expect(mocks.upload).toHaveBeenCalledTimes(1)
 })
})
