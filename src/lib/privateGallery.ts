import { supabase } from './supabase'
import { IMAGE_MIME_TYPES } from './imageFormats'

export const GALLERY_BUCKET = 'user-gallery'
const remembered = new WeakMap<File, { owner: string; path: string }>()
export function validateGalleryFile(file: Blob) {
  if (!IMAGE_MIME_TYPES.includes(file.type) || file.size > 5242880) throw new Error('Use somente JPG ou PNG, até 5 MB.')
}
async function currentOwner() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Entre na sua conta para acessar sua galeria.')
  return data.user.id
}
export function assertOwnGalleryPath(owner: string, path: string) {
  if (!path.startsWith(`${owner}/`) || path.slice(owner.length + 1).includes('/') || !path.slice(owner.length + 1) || path.slice(owner.length + 1) === '..') throw new Error('Esta imagem não pertence à sua galeria.')
}
/** Guarda o original privado uma vez por arquivo/sessão de edição. */
export async function uploadPrivateImage(file: File) {
  validateGalleryFile(file)
  const owner = await currentOwner()
  const previous = remembered.get(file)
  if (previous?.owner === owner) return previous.path
  const filename = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80) || 'imagem'
  const path = `${owner}/${crypto.randomUUID()}--${filename}.${file.type === 'image/png' ? 'png' : 'jpg'}`
  const { error } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file)
  if (error) throw new Error('Não foi possível guardar a imagem na sua galeria. Tente novamente.')
  remembered.set(file, { owner, path })
  return path
}
/** A URL temporária serve só à prévia. Nunca é persistida na publicação. */
export async function privateGalleryFile(path: string) {
  const owner = await currentOwner()
  assertOwnGalleryPath(owner, path)
  const { data, error } = await supabase.storage.from(GALLERY_BUCKET).download(path)
  if (error || !data) throw new Error('Não foi possível abrir essa imagem. Tente novamente.')
  validateGalleryFile(data)
  const file = new File([data], path.split('/').pop()!, { type: data.type })
  remembered.set(file, { owner, path })
  return file
}
