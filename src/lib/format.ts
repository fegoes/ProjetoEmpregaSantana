// Formatação de valores mostrados ao consumidor (salário, data, local).
// Tudo em pt-BR: "R$ 1.518", "há 2 dias", "Santana do Ipanema, AL".

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const brlCents = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

/** R$ sem centavos quando o valor é inteiro; com centavos quando não é. */
export function formatBRL(value: number): string {
  // Intl separa "R$" do número com espaço inseparável (U+00A0); normaliza para espaço comum
  // para o texto quebrar e ser copiado de forma previsível.
  const formatted = Number.isInteger(value) ? brl.format(value) : brlCents.format(value)
  return formatted.replace(/\u00a0/g, ' ')
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

export interface VagaPayFields {
  pricing_model: string
  salary_min?: number | null
  salary_max?: number | null
  hourly_rate?: number | null
  salary_visible?: boolean | null
}

/** Remuneração da vaga numa linha: "R$ 2.100 a R$ 2.600/mês", "R$ 35/hora", "Pago por entrega". */
export function formatVagaPay(vaga: VagaPayFields): string {
  if (vaga.salary_visible === false) return 'Salário a combinar'
  if (vaga.pricing_model === 'fixed_salary' && vaga.salary_min) {
    if (vaga.salary_max && vaga.salary_max > vaga.salary_min) {
      return `${formatBRL(vaga.salary_min)} a ${formatBRL(vaga.salary_max)}/mês`
    }
    return `${formatBRL(vaga.salary_min)}/mês`
  }
  if (vaga.pricing_model === 'hourly' && vaga.hourly_rate) return `${formatBRL(vaga.hourly_rate)}/hora`
  if (vaga.pricing_model === 'per_delivery') return 'Pago por entrega'
  return 'Salário a combinar'
}

/** Valor da vaga é um número de verdade (e não "a combinar")? Usado para dar destaque visual. */
export function hasVagaPayValue(vaga: VagaPayFields): boolean {
  if (vaga.salary_visible === false) return false
  return Boolean(
    (vaga.pricing_model === 'fixed_salary' && vaga.salary_min) || (vaga.pricing_model === 'hourly' && vaga.hourly_rate),
  )
}

export interface AutonomoPayFields {
  pricing_model: string
  hourly_rate?: number | null
  delivery_rate_note?: string | null
}

export function formatAutonomoPay(autonomo: AutonomoPayFields): string {
  if (autonomo.hourly_rate) return `A partir de ${formatBRL(autonomo.hourly_rate)}/hora`
  if (autonomo.delivery_rate_note) return autonomo.delivery_rate_note
  return 'Orçamento a combinar'
}

export const EMPLOYMENT_LABELS: Record<string, string> = {
  clt: 'CLT',
  pj: 'PJ',
  temporario: 'Temporário',
  freelance: 'Freelance',
}

export const AUTONOMO_PRICING_LABELS: Record<string, string> = {
  hourly: 'Cobra por hora',
  per_delivery: 'Cobra por serviço',
  both: 'Por hora ou por serviço',
}

/** "Santana do Ipanema, AL" — ou o fallback quando não há cidade nem estado. */
export function formatLocal(city: string | null | undefined, state: string | null | undefined, fallback = 'Local a combinar'): string {
  return [city, state].filter(Boolean).join(', ') || fallback
}

const DAY_MS = 86_400_000

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** "hoje", "ontem", "há 3 dias", "há 2 semanas", "há 4 meses". */
export function timeAgo(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)
  if (days <= 0) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 7) return `há ${days} dias`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? 'há 1 semana' : `há ${weeks} semanas`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return months === 1 ? 'há 1 mês' : `há ${months} meses`
  }
  const years = Math.floor(days / 365)
  return years === 1 ? 'há 1 ano' : `há ${years} anos`
}

/** Publicada há no máximo 3 dias: ganha o selo "Vaga nova". */
export function isVagaNova(iso: string | null | undefined, now: Date = new Date()): boolean {
  if (!iso) return false
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false
  return (startOfDay(now) - startOfDay(date)) / DAY_MS <= 3
}

/** Telefone brasileiro → número para wa.me (com DDI 55). Retorna null quando não dá para montar. */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return digits
  return null
}
