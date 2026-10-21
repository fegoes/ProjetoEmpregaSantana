import type { VagaCardData } from '@/components/VagaCard'
import type { AutonomoCardData } from '@/components/AutonomoCard'

export const EMPLOYMENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'clt', label: 'CLT' },
  { value: 'pj', label: 'PJ' },
  { value: 'temporario', label: 'Temporário' },
  { value: 'freelance', label: 'Freelance' },
]

export const PRICING_MODEL_OPTIONS: { value: string; label: string }[] = [
  { value: 'fixed_salary', label: 'Salário fixo' },
  { value: 'hourly', label: 'Por hora' },
  { value: 'per_delivery', label: 'Por entrega' },
]

export interface FeedFilters {
  showVagas: boolean
  showAutonomos: boolean
  categories: string[]
  employmentTypes: string[]
  pricingModels: string[]
  remoteOnly: boolean
}

export const DEFAULT_FEED_FILTERS: FeedFilters = {
  showVagas: true,
  showAutonomos: true,
  categories: [],
  employmentTypes: [],
  pricingModels: [],
  remoteOnly: false,
}

export function hasActiveFilters(filters: FeedFilters): boolean {
  return (
    !filters.showVagas ||
    !filters.showAutonomos ||
    filters.categories.length > 0 ||
    filters.employmentTypes.length > 0 ||
    filters.pricingModels.length > 0 ||
    filters.remoteOnly
  )
}

export function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function filterVagas(vagas: VagaCardData[], filters: FeedFilters): VagaCardData[] {
  if (!filters.showVagas) return []
  return vagas.filter((vaga) => {
    if (filters.categories.length > 0 && !filters.categories.includes(vaga.category ?? '')) return false
    if (filters.employmentTypes.length > 0 && !filters.employmentTypes.includes(vaga.employment_type)) {
      return false
    }
    if (filters.pricingModels.length > 0 && !filters.pricingModels.includes(vaga.pricing_model)) return false
    if (filters.remoteOnly && !vaga.is_remote) return false
    return true
  })
}

export function filterAutonomos(autonomos: AutonomoCardData[], filters: FeedFilters): AutonomoCardData[] {
  if (!filters.showAutonomos) return []
  return autonomos.filter((autonomo) => {
    if (filters.remoteOnly && !autonomo.serves_remote) return false
    if (filters.categories.length > 0 && !filters.categories.includes(autonomo.category ?? '')) return false
    if (filters.pricingModels.length > 0) {
      const matches =
        filters.pricingModels.includes(autonomo.pricing_model) || (autonomo.pricing_model === 'both' && filters.pricingModels.some(model => model === 'hourly' || model === 'per_delivery'))
      if (!matches) return false
    }
    return true
  })
}

export type FeedItem =
  | { kind: 'vaga'; key: string; createdAt: string; featured: boolean; vaga: VagaCardData }
  | { kind: 'autonomo'; key: string; createdAt: string; featured: boolean; autonomo: AutonomoCardData }

export function mergeFeed(vagas: VagaCardData[], autonomos: AutonomoCardData[]): FeedItem[] {
  const items: FeedItem[] = [
    ...vagas.map((vaga): FeedItem => ({
      kind: 'vaga',
      key: `vaga-${vaga.id}`,
      createdAt: vaga.created_at ?? '',
      featured: vaga.is_featured,
      vaga,
    })),
    ...autonomos.map((autonomo): FeedItem => ({
      kind: 'autonomo',
      key: `autonomo-${autonomo.id}`,
      createdAt: autonomo.created_at ?? '',
      featured: autonomo.is_featured,
      autonomo,
    })),
  ]

  return items.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return a.createdAt < b.createdAt ? 1 : -1
  })
}

export function readFeedFilters(params: URLSearchParams): FeedFilters {
  const kind = params.get('tipo')
  return {
    showVagas: kind !== 'autonomos' && kind !== 'nenhum',
    showAutonomos: kind !== 'vagas' && kind !== 'nenhum',
    categories: params.getAll('categoria'),
    employmentTypes: params.getAll('contratacao').filter(v => EMPLOYMENT_TYPE_OPTIONS.some(o => o.value === v)),
    pricingModels: params.getAll('pagamento').filter(v => PRICING_MODEL_OPTIONS.some(o => o.value === v)),
    remoteOnly: params.get('remoto') === '1',
  }
}

export function writeFeedFilters(params: URLSearchParams, filters: FeedFilters): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const key of ['tipo', 'categoria', 'contratacao', 'pagamento', 'remoto']) next.delete(key)
  if (!filters.showVagas && !filters.showAutonomos) next.set('tipo', 'nenhum')
  else if (!filters.showVagas) next.set('tipo', 'autonomos')
  else if (!filters.showAutonomos) next.set('tipo', 'vagas')
  filters.categories.forEach(v => next.append('categoria', v))
  filters.employmentTypes.forEach(v => next.append('contratacao', v))
  filters.pricingModels.forEach(v => next.append('pagamento', v))
  if (filters.remoteOnly) next.set('remoto', '1')
  return next
}
