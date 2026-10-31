import { IMAGE_MIME_TYPES } from './imageFormats'
import { supabase } from '@/lib/supabase'

const BUCKET = 'public-media'
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export class UploadError extends Error {}

async function uploadImage(file: File, path: string) {
  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    throw new UploadError('Use somente JPG ou PNG. Converta fotos HEIC/HEIF do celular antes de enviar.')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError('A imagem deve ter até 5 MB.')
  }

  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const fullPath = `${path}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(fullPath, file, {
    upsert: true,
    cacheControl: '3600',
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fullPath)
  // Evita servir uma versão em cache do arquivo antigo no mesmo caminho.
  return `${data.publicUrl}?v=${Date.now()}`
}

export function uploadEmpresaLogo(file: File, empresaId: string) {
  return uploadImage(file, `empresas/${empresaId}/logo`)
}

export function uploadVagaPhoto(file: File, vagaId: string) {
  return uploadImage(file, `vagas/${vagaId}/photo`)
}

export function uploadEmpresaInteriorPhoto(file: File, empresaId: string) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return uploadImage(file, `empresas/${empresaId}/interior-${unique}`)
}

export function uploadVagaGalleryPhoto(file: File, vagaId: string) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return uploadImage(file, `vagas/${vagaId}/foto-${unique}`)
}

export function uploadAutonomoPortfolioPhoto(file: File, autonomoId: string) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return uploadImage(file, `autonomos/${autonomoId}/portfolio-${unique}`)
}

export function uploadPaginaImage(file: File, paginaId: string) {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return uploadImage(file, `paginas/${paginaId}/img-${unique}`)
}

export function uploadEditorialImage(file: File) {
  return uploadImage(file, `editorial/${crypto.randomUUID()}`)
}

export function uploadProfilePhoto(file: File, userId: string) {
  return uploadImage(file, `profiles/${userId}/${crypto.randomUUID()}`)
}
