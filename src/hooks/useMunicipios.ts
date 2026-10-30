import { useQuery } from '@tanstack/react-query'

/** Municípios de um estado, pela API pública do IBGE. Se falhar, a lista fica vazia e o campo continua aceitando texto. */
export function useMunicipios(uf: string) {
  return useQuery({
    queryKey: ['ibge', 'municipios', uf],
    enabled: /^[A-Z]{2}$/.test(uf),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
    queryFn: async () => {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
      )
      if (!response.ok) throw new Error(`ibge-${response.status}`)
      const data = (await response.json()) as { nome: string }[]
      return data.map((m) => m.nome)
    },
  })
}
