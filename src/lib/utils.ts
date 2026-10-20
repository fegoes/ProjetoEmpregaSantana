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

const DIA_MS = 86_400_000

// Recência é o principal sinal de vida de um mural de vagas: sem data, não dá
// pra saber se o anúncio é de hoje ou de oito meses atrás. O projeto não tem
// (nem precisa de) biblioteca de data — isto cobre o caso de uso inteiro.
export function publicadaHa(iso: string | null | undefined): string | null {
  if (!iso) return null
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return null

  const hoje = new Date()
  const meiaNoite = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const dias = Math.round((meiaNoite(hoje) - meiaNoite(data)) / DIA_MS)

  if (dias < 0) return null
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias < 30) return `há ${dias} dias`
  if (dias < 60) return 'há 1 mês'
  if (dias < 365) return `há ${Math.floor(dias / 30)} meses`
  return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

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
