import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usado para gerar meta description/JSON-LD a partir de campos *_html —
// esses lugares precisam de texto puro, não markup.
export function stripHtml(html: string | null | undefined, maxLength = 160): string {
  if (!html) return ''
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}

export { safeInternalPath, moveItem } from './portableUtils.js'

/** Texto para comparar na busca: minúsculo e sem acento ("Ação" -> "acao"). */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** Vale para a busca? Todas as palavras digitadas precisam aparecer em algum dos campos. */
export function matchesSearch(query: string, ...fields: (string | null | undefined)[]): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const haystack = normalizeText(fields.filter(Boolean).join(' '))
  return words.every((w) => haystack.includes(w))
}

const DIA_MS = 86_400_000

// Quantos itens entraram nos últimos `dias` — usado para mostrar atividade real
// em vez de total acumulado, que infla sem dizer se o site está vivo.
export function contarRecentes(itens: { created_at?: string | null }[], dias = 7): number {
  const limite = Date.now() - dias * DIA_MS
  return itens.filter((i) => {
    if (!i.created_at) return false
    const t = new Date(i.created_at).getTime()
    return !Number.isNaN(t) && t >= limite
  }).length
}
