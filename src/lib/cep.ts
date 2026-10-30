import { onlyDigits } from '@/lib/masks'

export interface CepAddress {
  street: string
  district: string
  city: string
  uf: string
}

/** Consulta o ViaCEP. Devolve null quando o CEP não existe; lança erro quando a consulta falha. */
export async function lookupCep(cep: string, signal?: AbortSignal): Promise<CepAddress | null> {
  const digits = onlyDigits(cep)
  if (digits.length !== 8) return null
  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal })
  if (!response.ok) throw new Error(`viacep-${response.status}`)
  const data = (await response.json()) as {
    erro?: boolean | string
    logradouro?: string
    bairro?: string
    localidade?: string
    uf?: string
  }
  if (data.erro) return null
  return {
    street: data.logradouro ?? '',
    district: data.bairro ?? '',
    city: data.localidade ?? '',
    uf: data.uf ?? '',
  }
}

/** "Rua X, Bairro" — a parte do endereço que o CEP resolve (número e complemento a pessoa digita). */
export function addressLineFromCep(address: CepAddress): string {
  return [address.street, address.district].filter(Boolean).join(', ')
}
