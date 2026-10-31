// Páginas montadas em seções e blocos.
//
// O desenho de uma página é um JSON guardado em paginas_institucionais.layout:
// uma lista de seções, cada seção com um fundo (cor ou imagem com cobertura de
// cor) e uma lista de blocos (título, texto, imagem, botões, texto com imagem,
// ícones, busca, vagas). Uma seção "slides" reúne várias seções que se alternam.
//
// Tudo o que vem do banco passa por normalizeLayout() antes de ser exibido ou
// editado: valor desconhecido vira o padrão e conteúdo inválido é descartado.
// Assim um JSON malformado nunca derruba a página.

import { newBlockId } from './blocks.js'
import { moveItem, safeInternalPath } from './utils.js'

export { moveItem }

export const LAYOUT_VERSION = 1

export const MAX_SECTIONS = 40
export const MAX_BLOCKS = 30
export const MAX_SLIDES = 8
export const MAX_ITEMS = 12
export const MAX_BUTTONS = 4

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type SectionSpan = 'screen' | 'page'
export type ContentWidth = 'narrow' | 'normal' | 'wide'
export type Spacing = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type MinHeight = 'auto' | 'md' | 'lg' | 'screen'
export type Align = 'left' | 'center'
export type BackgroundColor = 'none' | 'white' | 'soft' | 'blue' | 'ink'
export type OverlayColor = 'ink' | 'black' | 'blue' | 'white'
export type ImageFocus = 'top' | 'center' | 'bottom'
export type Tone = 'light' | 'dark'

export interface SectionBackground {
  color: BackgroundColor
  imageUrl: string
  imageFocus: ImageFocus
  overlay: OverlayColor
  /** 0 a 90 (%) */
  overlayOpacity: number
}

export interface SectionStyle {
  /** screen = o fundo vai de uma borda da tela à outra; page = acompanha a largura do site */
  span: SectionSpan
  contentWidth: ContentWidth
  paddingY: Spacing
  minHeight: MinHeight
  align: Align
  background: SectionBackground
}

export type LinkMode = 'none' | 'page' | 'url' | 'whatsapp' | 'phone'

export interface LinkValue {
  mode: LinkMode
  /** caminho do site, endereço, ou telefone, conforme o modo */
  value: string
  /** só WhatsApp: mensagem que já vem escrita */
  message: string
  /** só endereço da internet: abrir em outra aba */
  newTab: boolean
}

export type ButtonVariant = 'cta' | 'solid' | 'outline'

export interface ButtonItem {
  id: string
  label: string
  link: LinkValue
  variant: ButtonVariant
}

export type MediaKind = 'none' | 'icon' | 'image'

export interface MediaRef {
  kind: MediaKind
  icon: string
  imageUrl: string
  alt: string
}

export type HeadingSize = 'md' | 'lg' | 'xl'
export type TextSize = 'sm' | 'md' | 'lg'
export type ImageSize = 'sm' | 'md' | 'lg' | 'full'
export type MediaSize = 'sm' | 'md' | 'lg'
export type MediaSide = 'left' | 'right'

export interface HeadingBlock {
  id: string
  type: 'heading'
  title: string
  subtitle: string
  size: HeadingSize
}

export interface TextBlock {
  id: string
  type: 'text'
  html: string
  size: TextSize
}

export interface ImageBlock {
  id: string
  type: 'image'
  imageUrl: string
  alt: string
  size: ImageSize
  rounded: boolean
}

export interface ButtonsBlock {
  id: string
  type: 'buttons'
  items: ButtonItem[]
}

export interface MediaTextBlock {
  id: string
  type: 'media_text'
  title: string
  html: string
  media: MediaRef
  side: MediaSide
  mediaSize: MediaSize
  buttons: ButtonItem[]
}

export interface IconItem {
  id: string
  media: MediaRef
  title: string
  text: string
}

export interface IconListBlock {
  id: string
  type: 'icon_list'
  columns: 2 | 3 | 4
  items: IconItem[]
}

export interface SearchBlock {
  id: string
  type: 'search'
  placeholder: string
  buttonLabel: string
}

export interface FeedBlock {
  id: string
  type: 'feed'
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | ButtonsBlock
  | MediaTextBlock
  | IconListBlock
  | SearchBlock
  | FeedBlock

export type BlockType = Block['type']

export interface ContentSection {
  id: string
  type: 'section'
  style: SectionStyle
  blocks: Block[]
}

export type SlideInterval = 5 | 8 | 12

export interface SlidesSection {
  id: string
  type: 'slides'
  span: SectionSpan
  autoplay: boolean
  interval: SlideInterval
  slides: ContentSection[]
}

export type Section = ContentSection | SlidesSection

export interface PageLayout {
  version: typeof LAYOUT_VERSION
  sections: Section[]
}

// ---------------------------------------------------------------------------
// Leitura segura do JSON
// ---------------------------------------------------------------------------

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)

function oneOf<T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function list(value: unknown, max: number): unknown[] {
  return Array.isArray(value) ? value.slice(0, max) : []
}

/** Aceita só endereços http(s) ou caminhos do próprio site — nunca "javascript:" nem "data:". */
export function safeImageUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const url = value.trim().slice(0, 1000)
  if (/^https?:\/\//i.test(url)) return url
  return safeInternalPath(url) ?? ''
}

class IdBook {
  private seen = new Set<string>()
  take(raw: unknown): string {
    let id = typeof raw === 'string' && raw.length > 0 && raw.length <= 64 ? raw : ''
    if (!id || this.seen.has(id)) id = newBlockId()
    this.seen.add(id)
    return id
  }
}

// ---------------------------------------------------------------------------
// Padrões
// ---------------------------------------------------------------------------

export function defaultBackground(): SectionBackground {
  return { color: 'none', imageUrl: '', imageFocus: 'center', overlay: 'ink', overlayOpacity: 55 }
}

export function defaultStyle(): SectionStyle {
  return {
    span: 'page',
    contentWidth: 'wide',
    paddingY: 'md',
    minHeight: 'auto',
    align: 'left',
    background: defaultBackground(),
  }
}

export function defaultLink(): LinkValue {
  return { mode: 'none', value: '', message: '', newTab: false }
}

export function defaultMedia(): MediaRef {
  return { kind: 'none', icon: 'briefcase', imageUrl: '', alt: '' }
}

export function newButton(patch: Partial<ButtonItem> = {}): ButtonItem {
  return { id: newBlockId(), label: 'Saiba mais', link: defaultLink(), variant: 'cta', ...patch }
}

export function newIconItem(patch: Partial<IconItem> = {}): IconItem {
  return { id: newBlockId(), media: { ...defaultMedia(), kind: 'icon' }, title: '', text: '', ...patch }
}

// ---------------------------------------------------------------------------
// Normalização
// ---------------------------------------------------------------------------

const SPANS = ['screen', 'page'] as const
const WIDTHS = ['narrow', 'normal', 'wide'] as const
const SPACINGS = ['none', 'sm', 'md', 'lg', 'xl'] as const
const HEIGHTS = ['auto', 'md', 'lg', 'screen'] as const
const ALIGNS = ['left', 'center'] as const
const COLORS = ['none', 'white', 'soft', 'blue', 'ink'] as const
const OVERLAYS = ['ink', 'black', 'blue', 'white'] as const
const FOCUS = ['top', 'center', 'bottom'] as const
const LINK_MODES = ['none', 'page', 'url', 'whatsapp', 'phone'] as const
const VARIANTS = ['cta', 'solid', 'outline'] as const
const MEDIA_KINDS = ['none', 'icon', 'image'] as const
const HEADING_SIZES = ['md', 'lg', 'xl'] as const
const TEXT_SIZES = ['sm', 'md', 'lg'] as const
const IMAGE_SIZES = ['sm', 'md', 'lg', 'full'] as const
const MEDIA_SIZES = ['sm', 'md', 'lg'] as const
const SIDES = ['left', 'right'] as const
const COLUMNS = [2, 3, 4] as const
const INTERVALS = [5, 8, 12] as const

function normBackground(raw: unknown): SectionBackground {
  const d = defaultBackground()
  if (!isRec(raw)) return d
  const opacity = typeof raw.overlayOpacity === 'number' && Number.isFinite(raw.overlayOpacity) ? raw.overlayOpacity : d.overlayOpacity
  return {
    color: oneOf(raw.color, COLORS, d.color),
    imageUrl: safeImageUrl(raw.imageUrl),
    imageFocus: oneOf(raw.imageFocus, FOCUS, d.imageFocus),
    overlay: oneOf(raw.overlay, OVERLAYS, d.overlay),
    overlayOpacity: Math.min(90, Math.max(0, Math.round(opacity))),
  }
}

function normStyle(raw: unknown): SectionStyle {
  const d = defaultStyle()
  if (!isRec(raw)) return d
  return {
    span: oneOf(raw.span, SPANS, d.span),
    contentWidth: oneOf(raw.contentWidth, WIDTHS, d.contentWidth),
    paddingY: oneOf(raw.paddingY, SPACINGS, d.paddingY),
    minHeight: oneOf(raw.minHeight, HEIGHTS, d.minHeight),
    align: oneOf(raw.align, ALIGNS, d.align),
    background: normBackground(raw.background),
  }
}

function normLink(raw: unknown): LinkValue {
  if (!isRec(raw)) return defaultLink()
  return {
    mode: oneOf(raw.mode, LINK_MODES, 'none'),
    value: text(raw.value, 500).trim(),
    message: text(raw.message, 300),
    newTab: bool(raw.newTab, false),
  }
}

function normMedia(raw: unknown): MediaRef {
  const d = defaultMedia()
  if (!isRec(raw)) return d
  return {
    kind: oneOf(raw.kind, MEDIA_KINDS, 'none'),
    icon: text(raw.icon, 40) || d.icon,
    imageUrl: safeImageUrl(raw.imageUrl),
    alt: text(raw.alt, 200),
  }
}

function normButtons(raw: unknown, ids: IdBook): ButtonItem[] {
  return list(raw, MAX_BUTTONS)
    .filter(isRec)
    .map((b) => ({
      id: ids.take(b.id),
      label: text(b.label, 60),
      link: normLink(b.link),
      variant: oneOf(b.variant, VARIANTS, 'cta'),
    }))
}

function normBlock(raw: unknown, ids: IdBook): Block | null {
  if (!isRec(raw)) return null
  const id = ids.take(raw.id)
  switch (raw.type) {
    case 'heading':
      return {
        id,
        type: 'heading',
        title: text(raw.title, 200),
        subtitle: text(raw.subtitle, 400),
        size: oneOf(raw.size, HEADING_SIZES, 'lg'),
      }
    case 'text':
      return { id, type: 'text', html: text(raw.html, 30000), size: oneOf(raw.size, TEXT_SIZES, 'md') }
    case 'image':
      return {
        id,
        type: 'image',
        imageUrl: safeImageUrl(raw.imageUrl),
        alt: text(raw.alt, 200),
        size: oneOf(raw.size, IMAGE_SIZES, 'md'),
        rounded: bool(raw.rounded, true),
      }
    case 'buttons':
      return { id, type: 'buttons', items: normButtons(raw.items, ids) }
    case 'media_text':
      return {
        id,
        type: 'media_text',
        title: text(raw.title, 200),
        html: text(raw.html, 30000),
        media: normMedia(raw.media),
        side: oneOf(raw.side, SIDES, 'right'),
        mediaSize: oneOf(raw.mediaSize, MEDIA_SIZES, 'md'),
        buttons: normButtons(raw.buttons, ids),
      }
    case 'icon_list':
      return {
        id,
        type: 'icon_list',
        columns: oneOf(raw.columns, COLUMNS, 3),
        items: list(raw.items, MAX_ITEMS)
          .filter(isRec)
          .map((item) => ({
            id: ids.take(item.id),
            media: normMedia(item.media),
            title: text(item.title, 120),
            text: text(item.text, 400),
          })),
      }
    case 'search':
      return {
        id,
        type: 'search',
        placeholder: text(raw.placeholder, 80) || 'Cargo ou serviço',
        buttonLabel: text(raw.buttonLabel, 30) || 'Buscar',
      }
    case 'feed':
      return { id, type: 'feed' }
    default:
      return null
  }
}

function normContentSection(raw: Rec, ids: IdBook): ContentSection {
  return {
    id: ids.take(raw.id),
    type: 'section',
    style: normStyle(raw.style),
    blocks: list(raw.blocks, MAX_BLOCKS)
      .map((b) => normBlock(b, ids))
      .filter((b): b is Block => b !== null),
  }
}

function normSection(raw: unknown, ids: IdBook): Section | null {
  if (!isRec(raw)) return null
  if (raw.type === 'section') return normContentSection(raw, ids)
  if (raw.type === 'slides') {
    const slides = list(raw.slides, MAX_SLIDES)
      .filter(isRec)
      .map((s) => normContentSection({ ...s, type: 'section' }, ids))
    return {
      id: ids.take(raw.id),
      type: 'slides',
      span: oneOf(raw.span, SPANS, 'screen'),
      autoplay: bool(raw.autoplay, false),
      interval: oneOf(raw.interval, INTERVALS, 8),
      slides,
    }
  }
  return null
}

/** Lê o JSON salvo no banco. Devolve null quando não há desenho (página no modo texto simples). */
export function parseLayout(raw: unknown): PageLayout | null {
  if (!isRec(raw) || !Array.isArray(raw.sections)) return null
  const ids = new IdBook()
  const sections = list(raw.sections, MAX_SECTIONS)
    .map((s) => normSection(s, ids))
    .filter((s): s is Section => s !== null)
  return { version: LAYOUT_VERSION, sections }
}

/** Mesmo que parseLayout, mas sempre devolve um desenho (vazio quando o JSON não serve). */
export function normalizeLayout(raw: unknown): PageLayout {
  return parseLayout(raw) ?? { version: LAYOUT_VERSION, sections: [] }
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

export interface ResolvedLink {
  href: string
  /** true = endereço do próprio site (navega sem recarregar) */
  internal: boolean
  newTab: boolean
}

function brPhoneDigits(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return digits
  return null
}

/** Transforma o que foi escolhido no editor em um endereço seguro; null quando não dá para navegar. */
export function resolveLink(link: LinkValue | undefined): ResolvedLink | null {
  if (!link) return null
  const value = link.value.trim()
  if (!value) return null

  switch (link.mode) {
    case 'page': {
      const path = safeInternalPath(value)
      return path ? { href: path, internal: true, newTab: false } : null
    }
    case 'url': {
      if (value.startsWith('/')) {
        const path = safeInternalPath(value)
        return path ? { href: path, internal: true, newTab: false } : null
      }
      const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : /^[^\s/]+\.[^\s]+$/.test(value) ? `https://${value}` : ''
      if (!/^https?:\/\//i.test(withScheme)) return null
      try {
        const url = new URL(withScheme)
        return { href: url.toString(), internal: false, newTab: link.newTab }
      } catch {
        return null
      }
    }
    case 'whatsapp': {
      const digits = brPhoneDigits(value)
      if (!digits) return null
      const message = link.message.trim()
      const query = message ? `?text=${encodeURIComponent(message)}` : ''
      return { href: `https://wa.me/${digits}${query}`, internal: false, newTab: true }
    }
    case 'phone': {
      const digits = brPhoneDigits(value)
      return digits ? { href: `tel:+${digits}`, internal: false, newTab: false } : null
    }
    default:
      return null
  }
}

/** Aviso para o editor: o botão tem texto, mas o destino falta ou não funciona. */
export function linkProblem(link: LinkValue): string | null {
  if (link.mode === 'none') return 'Escolha para onde o botão leva.'
  if (!link.value.trim()) return 'Falta o destino do botão.'
  if (resolveLink(link)) return null
  switch (link.mode) {
    case 'url':
      return 'Esse endereço não funciona. Use https://… ou um caminho do site, como /explorar.'
    case 'whatsapp':
    case 'phone':
      return 'Informe o número com DDD.'
    default:
      return 'Esse destino não funciona.'
  }
}

/** Páginas fixas do site que podem ser destino de um botão. */
export const SITE_LINK_TARGETS: { path: string; label: string }[] = [
  { path: '/', label: 'Início' },
  { path: '/explorar', label: 'Explorar vagas e profissionais' },
  { path: '/planos', label: 'Planos' },
  { path: '/login', label: 'Entrar' },
  { path: '/cadastro', label: 'Criar conta' },
  { path: '/cadastro?perfil=empresa', label: 'Criar conta de empresa' },
  { path: '/cadastro?perfil=autonomo', label: 'Criar conta de autônomo' },
  { path: '/sobre', label: 'Sobre' },
  { path: '/termos', label: 'Termos de uso' },
  { path: '/privacidade', label: 'Política de privacidade' },
  { path: '/lgpd', label: 'Privacidade e LGPD' },
]

// ---------------------------------------------------------------------------
// Endereços das páginas
// ---------------------------------------------------------------------------

/** Páginas que já existem no site, com endereço próprio. */
export const SYSTEM_PAGE_PATHS: Record<string, string> = {
  inicio: '/',
  sobre: '/sobre',
  termos: '/termos',
  privacidade: '/privacidade',
  lgpd: '/lgpd',
}

export function pagePath(slug: string, isSystem: boolean): string {
  if (isSystem) return SYSTEM_PAGE_PATHS[slug] ?? `/${slug}`
  return `/pagina/${slug}`
}

export function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length <= 60
}

// ---------------------------------------------------------------------------
// Aparência
// ---------------------------------------------------------------------------

/** 'light' = texto claro (fundo escuro); 'dark' = texto escuro (fundo claro). */
export function sectionTone(bg: SectionBackground): Tone {
  if (bg.imageUrl) return bg.overlay === 'white' ? 'dark' : 'light'
  return bg.color === 'blue' || bg.color === 'ink' ? 'light' : 'dark'
}

/** Aviso para o editor quando o texto pode ficar difícil de ler sobre a imagem. */
export function readabilityWarning(bg: SectionBackground): string | null {
  if (!bg.imageUrl || bg.overlayOpacity >= 35) return null
  return 'Com pouca cobertura de cor, o texto pode ficar difícil de ler sobre a foto. Aumente a cobertura.'
}

// ---------------------------------------------------------------------------
// Blocos novos
// ---------------------------------------------------------------------------

export const BLOCK_TYPES: { type: BlockType; label: string; description: string }[] = [
  { type: 'heading', label: 'Título', description: 'Título grande com uma linha de apoio' },
  { type: 'text', label: 'Texto', description: 'Parágrafos com negrito, itálico, subtítulo e lista' },
  { type: 'image', label: 'Imagem', description: 'Uma foto ou ilustração' },
  { type: 'buttons', label: 'Botões', description: 'Até 4 botões que levam a uma página ou endereço' },
  { type: 'media_text', label: 'Texto com imagem ou ícone', description: 'Texto de um lado, imagem ou ícone do outro' },
  { type: 'icon_list', label: 'Lista de ícones', description: 'Vários itens com ícone ou imagem, título e texto' },
  { type: 'search', label: 'Campo de busca', description: 'Busca de vagas e serviços' },
  { type: 'feed', label: 'Vagas e profissionais', description: 'A lista do site, com filtros' },
]

export function newBlock(type: BlockType): Block {
  const id = newBlockId()
  switch (type) {
    case 'heading':
      return { id, type, title: 'Título da seção', subtitle: '', size: 'lg' }
    case 'text':
      return { id, type, html: '<p>Escreva aqui.</p>', size: 'md' }
    case 'image':
      return { id, type, imageUrl: '', alt: '', size: 'md', rounded: true }
    case 'buttons':
      return { id, type, items: [newButton()] }
    case 'media_text':
      return {
        id,
        type,
        title: 'Título',
        html: '<p>Escreva aqui.</p>',
        media: { ...defaultMedia(), kind: 'image' },
        side: 'right',
        mediaSize: 'md',
        buttons: [],
      }
    case 'icon_list':
      return {
        id,
        type,
        columns: 3,
        items: [
          newIconItem({ media: { ...defaultMedia(), kind: 'icon', icon: 'check' }, title: 'Primeiro item', text: 'Explique em uma frase.' }),
          newIconItem({ media: { ...defaultMedia(), kind: 'icon', icon: 'users' }, title: 'Segundo item', text: 'Explique em uma frase.' }),
          newIconItem({ media: { ...defaultMedia(), kind: 'icon', icon: 'map-pin' }, title: 'Terceiro item', text: 'Explique em uma frase.' }),
        ],
      }
    case 'search':
      return { id, type, placeholder: 'Cargo ou serviço', buttonLabel: 'Buscar' }
    case 'feed':
      return { id, type }
  }
}

export function newSection(patch: { style?: Partial<SectionStyle>; blocks?: Block[] } = {}): ContentSection {
  const base = defaultStyle()
  return {
    id: newBlockId(),
    type: 'section',
    style: { ...base, ...patch.style, background: { ...base.background, ...patch.style?.background } },
    blocks: patch.blocks ?? [],
  }
}

export function newSlides(slides?: ContentSection[]): SlidesSection {
  return {
    id: newBlockId(),
    type: 'slides',
    span: 'screen',
    autoplay: false,
    interval: 8,
    slides: slides ?? [newSlide(), newSlide()],
  }
}

/** Um slide: fundo escuro, texto no centro e um botão. A imagem de fundo é escolhida no editor. */
export function newSlide(patch: { title?: string; text?: string } = {}): ContentSection {
  return newSection({
    style: {
      span: 'screen',
      contentWidth: 'normal',
      paddingY: 'xl',
      minHeight: 'lg',
      align: 'center',
      background: { ...defaultBackground(), color: 'ink' },
    },
    blocks: [
      { ...(newBlock('heading') as HeadingBlock), title: patch.title ?? 'Título do slide', size: 'xl' },
      { ...(newBlock('text') as TextBlock), html: `<p>${patch.text ?? 'Uma frase curta para apoiar o título.'}</p>`, size: 'lg' },
      newBlock('buttons'),
    ],
  })
}

// ---------------------------------------------------------------------------
// Modelos de seção
// ---------------------------------------------------------------------------

export interface SectionTemplate {
  key: string
  label: string
  description: string
  build: () => Section
}

const darkBg = (color: BackgroundColor = 'ink'): Partial<SectionStyle> => ({
  background: { ...defaultBackground(), color },
})

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    key: 'slide-centro',
    label: 'Slide com texto no centro',
    description: 'Imagem de fundo na largura toda da tela, com texto e botão no meio',
    build: () => newSlides([newSlide()]),
  },
  {
    key: 'slide-texto-imagem',
    label: 'Slide com texto e imagem',
    description: 'Largura toda da tela: texto de um lado e uma imagem menor do outro',
    build: () =>
      newSection({
        style: { span: 'screen', contentWidth: 'wide', paddingY: 'xl', minHeight: 'md', ...darkBg() },
        blocks: [{ ...(newBlock('media_text') as MediaTextBlock), title: 'Título do slide', buttons: [newButton()] }],
      }),
  },
  {
    key: 'slide-icones',
    label: 'Slide com texto e ícones',
    description: 'Largura toda da tela: título e três itens com ícone',
    build: () =>
      newSection({
        style: { span: 'screen', contentWidth: 'wide', paddingY: 'xl', align: 'center', ...darkBg() },
        blocks: [{ ...(newBlock('heading') as HeadingBlock), size: 'lg' }, newBlock('icon_list')],
      }),
  },
  {
    key: 'carrossel',
    label: 'Carrossel de slides',
    description: 'Vários slides que se alternam, com setas e pontos',
    build: () => newSlides(),
  },
  {
    key: 'faixa-chamada',
    label: 'Faixa de chamada',
    description: 'Faixa colorida com uma frase e um botão',
    build: () =>
      newSection({
        style: { paddingY: 'lg', contentWidth: 'normal', align: 'center', ...darkBg('blue') },
        blocks: [
          { ...(newBlock('heading') as HeadingBlock), title: 'Pronto para começar?', size: 'md' },
          newBlock('buttons'),
        ],
      }),
  },
  {
    key: 'texto',
    label: 'Título e texto',
    description: 'Um título e parágrafos, na largura de leitura',
    build: () =>
      newSection({
        style: { contentWidth: 'narrow', paddingY: 'md' },
        blocks: [newBlock('heading'), newBlock('text')],
      }),
  },
  {
    key: 'texto-imagem',
    label: 'Texto com imagem',
    description: 'Texto de um lado e imagem do outro, em fundo claro',
    build: () =>
      newSection({
        style: { paddingY: 'lg', background: { ...defaultBackground(), color: 'white' } },
        blocks: [newBlock('media_text')],
      }),
  },
  {
    key: 'icones',
    label: 'Lista de ícones',
    description: 'Título e três itens com ícone, em fundo claro',
    build: () =>
      newSection({
        style: { paddingY: 'lg', align: 'center' },
        blocks: [newBlock('heading'), newBlock('icon_list')],
      }),
  },
  {
    key: 'busca',
    label: 'Chamada com busca',
    description: 'Título, frase de apoio e campo de busca de vagas',
    build: () =>
      newSection({
        style: { paddingY: 'lg', contentWidth: 'normal', ...darkBg() },
        blocks: [
          { ...(newBlock('heading') as HeadingBlock), title: 'Encontre vagas e serviços perto de você', size: 'lg' },
          { ...(newBlock('text') as TextBlock), html: '<p>Emprego fixo, trabalho temporário e profissionais autônomos.</p>' },
          newBlock('search'),
        ],
      }),
  },
  {
    key: 'vagas',
    label: 'Vagas e profissionais',
    description: 'A lista do site, com abas e filtros',
    build: () => newSection({ style: { paddingY: 'sm' }, blocks: [newBlock('feed')] }),
  },
  {
    key: 'em-branco',
    label: 'Seção em branco',
    description: 'Comece do zero e adicione os blocos que quiser',
    build: () => newSection({ blocks: [] }),
  },
]

/** Desenho inicial para uma página nova. */
export function starterLayout(title: string): PageLayout {
  return {
    version: LAYOUT_VERSION,
    sections: [
      newSection({
        style: { contentWidth: 'narrow', paddingY: 'lg' },
        blocks: [{ ...(newBlock('heading') as HeadingBlock), title, size: 'lg' }, newBlock('text')],
      }),
    ],
  }
}

/** Passa o texto de uma página antiga (um único campo) para o modo em seções, sem perder nada. */
export function layoutFromHtml(title: string, html: string): PageLayout {
  return {
    version: LAYOUT_VERSION,
    sections: [
      newSection({
        style: { contentWidth: 'narrow', paddingY: 'lg' },
        blocks: [
          { ...(newBlock('heading') as HeadingBlock), title, size: 'lg' },
          { ...(newBlock('text') as TextBlock), html: html || '<p></p>' },
        ],
      }),
    ],
  }
}

/** Réplica da página inicial atual (faixa azul com busca e a lista de vagas), para personalizar a partir dela. */
export function homeStarterLayout(): PageLayout {
  return {
    version: LAYOUT_VERSION,
    sections: [
      newSection({
        style: { span: 'page', contentWidth: 'normal', paddingY: 'lg', ...darkBg() },
        blocks: [
          {
            ...(newBlock('heading') as HeadingBlock),
            title: 'Vagas e serviços em Santana do Ipanema e região',
            size: 'lg',
          },
          {
            ...(newBlock('text') as TextBlock),
            html: '<p>Emprego fixo, trabalho temporário e profissionais autônomos do sertão. Tudo num só lugar.</p>',
          },
          newBlock('search'),
          {
            ...(newBlock('text') as TextBlock),
            html: '<p>Quer anunciar? <a href="/cadastro?perfil=empresa">Publique uma vaga</a> ou <a href="/cadastro?perfil=autonomo">divulgue seus serviços</a>.</p>',
            size: 'sm',
          },
        ],
      }),
      newSection({ style: { paddingY: 'sm' }, blocks: [newBlock('feed')] }),
    ],
  }
}

// ---------------------------------------------------------------------------
// Operações de lista (imutáveis)
// ---------------------------------------------------------------------------

/** Cópia profunda com identificadores novos (duplicar seção ou bloco). */
export function cloneWithNewIds<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => cloneWithNewIds(v)) as T
  if (isRec(value)) {
    const out: Rec = {}
    for (const [key, v] of Object.entries(value)) {
      out[key] = key === 'id' && typeof v === 'string' ? newBlockId() : cloneWithNewIds(v)
    }
    return out as T
  }
  return value
}

/** Identificador do primeiro título da página: ele vira o <h1>; os demais viram <h2>. */
export function firstHeadingId(layout: PageLayout): string | null {
  const scan = (section: ContentSection): string | null => {
    for (const block of section.blocks) {
      if (block.type === 'heading' && block.title.trim()) return block.id
      if (block.type === 'media_text' && block.title.trim()) return block.id
    }
    return null
  }
  for (const section of layout.sections) {
    const found = section.type === 'section' ? scan(section) : section.slides[0] ? scan(section.slides[0]) : null
    if (found) return found
  }
  return null
}

/** Nível de cada título da página, para a hierarquia (h1 > h2 > h3) nunca pular um degrau. */
export interface HeadingOutline {
  /** bloco cujo título vira o <h1> */
  h1: string | null
  /** subtítulos dentro de blocos de texto: h2 quando ainda não houve nenhum h2 antes */
  text: Record<string, 'h2' | 'h3'>
  /** títulos dos itens de uma lista de ícones */
  items: Record<string, 'h2' | 'h3'>
}

export function headingOutline(layout: PageLayout): HeadingOutline {
  const h1 = firstHeadingId(layout)
  const outline: HeadingOutline = { h1, text: {}, items: {} }
  let seenH2 = false
  const visit = (section: ContentSection) => {
    for (const block of section.blocks) {
      if ((block.type === 'heading' || block.type === 'media_text') && block.title.trim() && block.id !== h1) seenH2 = true
      if ((block.type === 'text' || block.type === 'media_text') && /<h3[\s>]/i.test(block.html)) {
        outline.text[block.id] = seenH2 ? 'h3' : 'h2'
        seenH2 = true
      }
      if (block.type === 'icon_list' && block.items.some((item) => item.title.trim())) {
        outline.items[block.id] = seenH2 ? 'h3' : 'h2'
        seenH2 = true
      }
    }
  }
  for (const section of layout.sections) {
    if (section.type === 'section') visit(section)
    else section.slides.forEach(visit)
  }
  return outline
}

// ---------------------------------------------------------------------------
// Resumos para o editor
// ---------------------------------------------------------------------------

const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function clip(value: string, max = 60): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

export function blockLabel(type: BlockType): string {
  return BLOCK_TYPES.find((b) => b.type === type)?.label ?? 'Bloco'
}

export function blockSummary(block: Block): string {
  switch (block.type) {
    case 'heading':
      return clip(block.title)
    case 'text':
      return clip(plain(block.html))
    case 'image':
      return block.imageUrl ? clip(block.alt || 'Imagem') : 'Sem imagem'
    case 'buttons':
      return clip(block.items.map((b) => b.label).filter(Boolean).join(' · ')) || 'Sem botões'
    case 'media_text':
      return clip(block.title || plain(block.html))
    case 'icon_list':
      return `${block.items.length} ${block.items.length === 1 ? 'item' : 'itens'}`
    case 'search':
      return block.buttonLabel
    case 'feed':
      return 'Lista do site'
  }
}

export function sectionLabel(section: Section): string {
  if (section.type === 'slides') return section.slides.length > 1 ? 'Carrossel de slides' : 'Slide'
  const bg = section.style.background
  if (section.style.span === 'screen' && (bg.imageUrl || bg.color !== 'none')) return 'Slide'
  return 'Seção'
}

export function sectionSummary(section: Section): string {
  if (section.type === 'slides') return `${section.slides.length} ${section.slides.length === 1 ? 'slide' : 'slides'}`
  const first = section.blocks.find((b) => blockSummary(b))
  if (!first) return 'Sem blocos'
  const more = section.blocks.length - 1
  return `${blockSummary(first)}${more > 0 ? ` (+${more})` : ''}`
}

/** Texto curto da página (primeiro subtítulo ou texto), para descrição em buscadores e prévias. */
export function layoutExcerpt(layout: PageLayout, max = 160): string {
  const clipTo = (value: string) => (value.length > max ? `${value.slice(0, max - 1)}…` : value)
  const blocksOf = (s: Section) => (s.type === 'section' ? s.blocks : s.slides.flatMap((slide) => slide.blocks))
  for (const section of layout.sections) {
    for (const block of blocksOf(section)) {
      if (block.type === 'heading' && block.subtitle.trim()) return clipTo(block.subtitle.trim())
      if (block.type === 'text' || block.type === 'media_text') {
        const value = plain(block.html)
        if (value) return clipTo(value)
      }
    }
  }
  return ''
}

// ---------------------------------------------------------------------------
// Avisos antes de publicar
// ---------------------------------------------------------------------------

/** Problemas que não impedem de salvar, mas deixam a página pior ou fazem algo sumir. */
export function collectIssues(layout: PageLayout): string[] {
  const issues: string[] = []

  const checkSection = (section: ContentSection, where: string) => {
    if (section.blocks.length === 0) issues.push(`${where}: está vazia e não aparece no site.`)
    const readability = readabilityWarning(section.style.background)
    if (readability) issues.push(`${where}: ${readability}`)

    const checkButtons = (items: ButtonItem[]) => {
      for (const item of items) {
        if (!item.label.trim()) continue
        const problem = linkProblem(item.link)
        if (problem) issues.push(`${where}: o botão "${item.label.trim()}" não aparece. ${problem}`)
      }
    }
    const checkMedia = (media: MediaRef) => {
      if (media.kind === 'image' && media.imageUrl && !media.alt.trim()) issues.push(`${where}: uma imagem está sem descrição.`)
    }

    for (const block of section.blocks) {
      if (block.type === 'buttons') checkButtons(block.items)
      if (block.type === 'media_text') {
        checkButtons(block.buttons)
        checkMedia(block.media)
      }
      if (block.type === 'icon_list') block.items.forEach((item) => checkMedia(item.media))
      if (block.type === 'image' && block.imageUrl && !block.alt.trim()) issues.push(`${where}: uma imagem está sem descrição.`)
    }
  }

  layout.sections.forEach((section, i) => {
    if (section.type === 'section') checkSection(section, `Seção ${i + 1}`)
    else section.slides.forEach((slide, j) => checkSection(slide, `Seção ${i + 1}, slide ${j + 1}`))
  })

  return [...new Set(issues)].slice(0, 20)
}
