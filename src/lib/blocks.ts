// Descrições em blocos ("Sobre a vaga", "Requisitos", "Benefícios"...).
//
// O texto continua guardado em UMA coluna HTML (description_html), sem mudar o
// banco: cada bloco vira <section data-block><h2>Título</h2>…corpo…</section>.
// Texto antigo, escrito antes dos blocos, é lido como um bloco só.

export interface DescriptionBlock {
  id: string
  title: string
  /** HTML do corpo (parágrafos, negrito, itálico, subtítulos e listas) */
  html: string
}

export interface ParsedBlocks {
  blocks: DescriptionBlock[]
  /** true quando o texto já estava em blocos; false para texto antigo (um bloco só) */
  structured: boolean
}

export function newBlockId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `b${Math.random().toString(36).slice(2, 10)}`
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Texto puro de um trecho de HTML (para saber se um bloco tem conteúdo). */
export function htmlText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Blocos sem texto no corpo não vão para o texto final. */
export function blocksToHtml(blocks: DescriptionBlock[]): string {
  return blocks
    .filter((block) => htmlText(block.html).length > 0)
    .map((block) => {
      const title = block.title.trim()
      return `<section data-block>${title ? `<h2>${escapeHtml(title)}</h2>` : ''}${block.html}</section>`
    })
    .join('')
}

export function parseBlocks(html: string | null | undefined, legacyTitle = 'Descrição'): ParsedBlocks {
  const source = (html ?? '').trim()
  if (!htmlText(source)) return { blocks: [], structured: false }

  const doc = new DOMParser().parseFromString(`<body>${source}</body>`, 'text/html')
  const sections = Array.from(doc.body.children).filter(
    (el) => el.tagName === 'SECTION' && el.hasAttribute('data-block'),
  )

  if (sections.length === 0) {
    return { blocks: [{ id: newBlockId(), title: legacyTitle, html: source }], structured: false }
  }

  const blocks = sections.map((section) => {
    const first = section.firstElementChild
    let title = ''
    let body = section.innerHTML
    if (first && first.tagName === 'H2') {
      title = first.textContent?.trim() ?? ''
      first.remove()
      body = section.innerHTML
    }
    return { id: newBlockId(), title, html: body }
  })
  return { blocks, structured: true }
}

/** Sugestões de título, por tipo de texto, para o botão "Novo bloco". */
export const BLOCK_SUGGESTIONS = {
  vaga: [
    'Sobre a vaga',
    'Requisitos',
    'Experiência desejada',
    'Responsabilidades',
    'Benefícios',
    'Horário e local de trabalho',
    'Como se candidatar',
  ],
  empresa: ['Quem somos', 'O que fazemos', 'Nossa cultura', 'Benefícios para a equipe'],
  autonomo: ['Serviços que ofereço', 'Experiência', 'Como funciona o orçamento', 'Áreas de atendimento'],
} as const

export type BlocksKind = keyof typeof BLOCK_SUGGESTIONS

/** Blocos que já aparecem num texto novo. */
export const BLOCK_STARTERS: Record<BlocksKind, string[]> = {
  vaga: ['Sobre a vaga', 'Requisitos'],
  empresa: ['Quem somos'],
  autonomo: ['Serviços que ofereço'],
}

/** Texto corrido de uma descrição (sem os títulos dos blocos): serve para descrição de busca e resumos. */
export function descriptionToText(html: string | null | undefined): string {
  if (!html) return ''
  return htmlText(html.replace(/<h2[^>]*>[\s\S]*?<\/h2>/gi, ' '))
}
