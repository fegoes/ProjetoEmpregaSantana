import { describe, expect, it } from 'vitest'
import { DEFAULT_FEED_FILTERS, filterAutonomos, readFeedFilters, writeFeedFilters } from './feedFilters'

const professional = { id: '1', headline: 'Serviços', category: null, pricing_model: 'hourly', hourly_rate: 50, service_area_city: 'Santana do Ipanema', service_area_state: 'AL', is_featured: false, profiles: { full_name: 'Teste' } }

describe('filtros públicos', () => {
  it('preserva busca e cidade ao persistir e restaurar filtros múltiplos', () => {
    const filters = { ...DEFAULT_FEED_FILTERS, showAutonomos: false, categories: ['comercio', 'servicos'], employmentTypes: ['clt'], pricingModels: ['hourly'], remoteOnly: true }
    const params = writeFeedFilters(new URLSearchParams('q=vendas&cidade=Santana'), filters)
    expect(params.get('q')).toBe('vendas')
    expect(params.get('cidade')).toBe('Santana')
    expect(readFeedFilters(params)).toEqual(filters)
  })
  it('restaura inclusive a seleção sem tipos e ignora contratos inválidos', () => {
    expect(readFeedFilters(writeFeedFilters(new URLSearchParams(), { ...DEFAULT_FEED_FILTERS, showVagas: false, showAutonomos: false }))).toMatchObject({ showVagas: false, showAutonomos: false })
    expect(readFeedFilters(new URLSearchParams('contratacao=desconhecido')).employmentTypes).toEqual([])
  })
  it('aplica remoto a autônomos e mantém formas de cobrança compatíveis', () => {
    const remote = { ...professional, id: '2', serves_remote: true, pricing_model: 'both' }
    expect(filterAutonomos([professional, remote], { ...DEFAULT_FEED_FILTERS, remoteOnly: true, pricingModels: ['hourly'] })).toEqual([remote])
    expect(filterAutonomos([remote], { ...DEFAULT_FEED_FILTERS, pricingModels: ['fixed_salary'] })).toEqual([])
  })
})
