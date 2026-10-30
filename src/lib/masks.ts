// Máscaras e formatos dos campos de formulário (pt-BR). Cada função é pura:
// recebe o que a pessoa digitou e devolve o texto já formatado.

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** (82) 99999-0000 ou (82) 3333-0000. Aceita colar com +55. */
export function maskPhone(value: string): string {
  let digits = onlyDigits(value)
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2)
  digits = digits.slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  if (rest.length <= 4) return `(${ddd}) ${rest}`
  if (digits.length <= 10) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
}

/** 00.000.000/0000-00 */
export function maskCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14)
  let out = d.slice(0, 2)
  if (d.length > 2) out += `.${d.slice(2, 5)}`
  if (d.length > 5) out += `.${d.slice(5, 8)}`
  if (d.length > 8) out += `/${d.slice(8, 12)}`
  if (d.length > 12) out += `-${d.slice(12, 14)}`
  return out
}

/** 00000-000 */
export function maskCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function isCompleteCep(value: string): boolean {
  return onlyDigits(value).length === 8
}

/** CNPJ válido pelo dígito verificador. */
export function isValidCnpj(value: string): boolean {
  const d = onlyDigits(value)
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false
  const calc = (length: number) => {
    let sum = 0
    let weight = length - 7
    for (let i = 0; i < length; i++) {
      sum += Number(d[i]) * weight--
      if (weight < 2) weight = 9
    }
    const mod = sum % 11
    return mod < 2 ? 0 : 11 - mod
  }
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13])
}

const MAX_MONEY_DIGITS = 11 // até R$ 999.999.999,99

const moneyFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 1518 → "R$ 1.518,00". Vazio quando não há valor. */
export function formatMoneyInput(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return `R$ ${moneyFormat.format(value)}`
}

/**
 * O que a pessoa digitou → valor em reais. Os dígitos entram "da direita":
 * digitar 1, 5, 1, 8, 0, 0 mostra 0,01 → 0,15 → 1,51 → 15,18 → 151,80 → 1.518,00.
 */
export function parseMoneyInput(text: string): number | null {
  const digits = onlyDigits(text).slice(0, MAX_MONEY_DIGITS)
  if (!digits) return null
  return Number(digits) / 100
}

const SMALL_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

/** "santana DO ipanema" → "Santana do Ipanema"; "olho d'água das flores" → "Olho d'Água das Flores". */
export function titleCasePt(value: string): string {
  const words = value.trim().replace(/\s+/g, ' ').toLowerCase().split(' ')
  return words
    .map((word, index) => {
      if (!word) return word
      if (index > 0 && SMALL_WORDS.has(word)) return word
      const capitalize = (part: string) => part.charAt(0).toUpperCase() + part.slice(1)
      if (word.includes("'")) {
        const [left, ...right] = word.split("'")
        const head = left.length <= 1 ? left : capitalize(left)
        return `${head}'${right.map(capitalize).join("'")}`
      }
      return word.split('-').map(capitalize).join('-')
    })
    .join(' ')
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export type UF = (typeof UFS)[number]

export const DEFAULT_UF: UF = 'AL'
