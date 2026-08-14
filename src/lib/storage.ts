import { supabase } from '@/lib/supabase'

const BUCKET = 'public-media'
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export class UploadError extends Error {}

async function uploadImage(file: File, path: string) {
  if (!file.type.startsWith('image/')) {
    throw new UploadError('Selecione um arquivo de imagem.')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError('A imagem deve ter até 5 MB.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
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
