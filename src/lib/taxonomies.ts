import type { TaxonomyKind } from '@/types/database'
export const TAXONOMY_DOMAINS: Record<TaxonomyKind | 'both', string> = { vaga: 'Vagas e oportunidades', autonomo: 'Profissionais', empresa: 'Empresas', both: 'Vagas e profissionais' }
export function taxonomySlug(label: string) {
  return label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-$/, '')
}
export function taxonomyOptions<T extends { slug: string; label: string; kind: string; is_active?: boolean }>(items: T[], kind: TaxonomyKind, selected?: string) {
  return items.filter(item => (item.kind === kind || (item.kind === 'both' && kind !== 'empresa')) && (item.is_active !== false || item.slug === selected))
}
