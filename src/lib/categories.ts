import type { Database } from '@/types/database'

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryKind = Category['kind']

/** Tipos de lista que o superadmin gerencia (a aba "Vagas" mostra também as categorias "vaga e autônomo"). */
export type CategoryScope = 'vaga' | 'autonomo' | 'empresa' | 'modalidade'

export const CATEGORY_SCOPES: { value: CategoryScope; label: string; singular: string }[] = [
  { value: 'vaga', label: 'Vagas', singular: 'categoria de vaga' },
  { value: 'autonomo', label: 'Autônomos', singular: 'categoria de autônomo' },
  { value: 'empresa', label: 'Segmentos de empresa', singular: 'segmento de empresa' },
  { value: 'modalidade', label: 'Modalidade da vaga', singular: 'modalidade de vaga' },
]

/** Listas que têm o próprio tipo e não se misturam com as áreas de vagas e autônomos. */
const OWN_KIND: CategoryScope[] = ['empresa', 'modalidade']

/** is_active só é false quando o superadmin ocultou; sem a coluna (banco antigo) tudo conta como ativo. */
export const isActive = (category: Category) => category.is_active !== false

export function inScope(category: Category, scope: CategoryScope): boolean {
  if (OWN_KIND.includes(scope)) return category.kind === scope
  return category.kind === scope || category.kind === 'both'
}

/** Áreas de atuação (vagas e autônomos): fora segmentos de empresa e modalidades, que são outras listas. */
export const isAreaCategory = (category: Category) => category.kind !== 'empresa' && category.kind !== 'modalidade'

/** Categorias que o público e os formulários podem usar: ativas e do tipo pedido. */
export function activeFor(categories: Category[] | undefined, scope: CategoryScope, keepSlug?: string): Category[] {
  return (categories ?? []).filter((c) => inScope(c, scope) && (isActive(c) || c.slug === keepSlug))
}

/** Slug sem acento, em minúsculas e com hífens: "Mão de obra" -> "mao-de-obra". */
export function slugify(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SLUG_PREFIX: Partial<Record<CategoryScope, string>> = { empresa: 'segmento-', modalidade: 'modalidade-' }

/** Slug livre: acrescenta -2, -3... se já existir. Segmentos de empresa e modalidades levam prefixo ("segmento-", "modalidade-"). */
export function uniqueSlug(label: string, existing: string[], scope: CategoryScope): string {
  const prefix = SLUG_PREFIX[scope] ?? ''
  const core = slugify(label)
  // nome sem letras nem números ("???") vira só o prefixo, sem hífen sobrando
  const base = core ? `${prefix}${core}` : prefix ? prefix.slice(0, -1) : 'categoria'
  if (!existing.includes(base)) return base
  let n = 2
  while (existing.includes(`${base}-${n}`)) n++
  return `${base}-${n}`
}
