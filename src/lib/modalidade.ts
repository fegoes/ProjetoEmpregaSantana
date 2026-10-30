import type { Category } from '@/lib/categories'
import { formatLocal } from '@/lib/format'

export const MODALIDADE_PRESENCIAL = 'modalidade-presencial'
export const MODALIDADE_REMOTA = 'modalidade-remota'

interface VagaModalidade {
  modalidade?: string | null
  is_remote: boolean
}

interface VagaLocal extends VagaModalidade {
  location_city: string | null
  location_state: string | null
}

/** Modalidade da vaga; vagas antigas, sem o campo, valem pelo que já diziam (remota ou presencial). */
export function vagaModalidade(vaga: VagaModalidade): string {
  return vaga.modalidade ?? (vaga.is_remote ? MODALIDADE_REMOTA : MODALIDADE_PRESENCIAL)
}

/** slug -> nome, como o superadmin escreveu (inclusive modalidades ocultas, para vagas que já usam). */
export function modalidadeLabels(categories: Category[] | undefined): Map<string, string> {
  return new Map((categories ?? []).filter((c) => c.kind === 'modalidade').map((c) => [c.slug, c.label]))
}

/**
 * Onde a vaga acontece, em uma linha: "Remota", "Híbrida · Santana do Ipanema, AL" ou só a cidade (presencial).
 * Sem a lista de nomes (carregando) vale o texto de sempre.
 */
export function modalidadeLocal(vaga: VagaLocal, labels?: Map<string, string>): string {
  const slug = vagaModalidade(vaga)
  const label = labels?.get(slug)
  if (vaga.is_remote) return label ?? 'Remoto'
  const city = formatLocal(vaga.location_city, vaga.location_state)
  if (!label || slug === MODALIDADE_PRESENCIAL) return city
  // sem cidade informada, só o nome da modalidade (não "Híbrida · Local a combinar")
  return vaga.location_city || vaga.location_state ? `${label} · ${city}` : label
}
