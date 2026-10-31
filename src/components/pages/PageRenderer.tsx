import { ResponsiveImage } from '@/components/ResponsiveImage'
import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Pause, Play, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { FeedBrowser } from '@/components/feed/FeedBrowser'
import { iconFor } from '@/lib/pageIcons'
import {
  headingOutline,
  resolveLink,
  sectionTone,
  type Align,
  type BackgroundColor,
  type Block,
  type ButtonItem,
  type ContentSection,
  type HeadingBlock,
  type HeadingOutline,
  type IconListBlock,
  type ImageBlock,
  type MediaRef,
  type MediaTextBlock,
  type MinHeight,
  type OverlayColor,
  type PageLayout,
  type SearchBlock,
  type Section,
  type SectionSpan,
  type SlidesSection,
  type Spacing,
  type TextBlock,
  type Tone,
} from '@/lib/pageLayout'
import { cn } from '@/lib/utils'

// Desenha uma página montada no painel. Cada seção é um "container" de CSS:
// os tamanhos respondem à largura da própria seção (e não da janela), por isso
// a visualização do painel em largura de celular se comporta como o celular.

interface RenderState {
  outline: HeadingOutline
  h1Id: string | null
  /** Visualização dentro do painel: nada navega e as listas do site viram um aviso. */
  preview: boolean
}

const RenderContext = React.createContext<RenderState>({ outline: { h1: null, text: {}, items: {} }, h1Id: null, preview: false })
const useRender = () => React.useContext(RenderContext)

// ---------------------------------------------------------------------------
// Tabelas de classes (escritas por extenso para o Tailwind encontrar)
// ---------------------------------------------------------------------------

const BG_COLOR: Record<BackgroundColor, string> = {
  none: '',
  white: 'bg-card',
  soft: 'bg-secondary',
  blue: 'bg-brand-blue',
  ink: 'bg-brand-ink',
}

const OVERLAY_COLOR: Record<OverlayColor, string> = {
  ink: 'bg-brand-ink',
  black: 'bg-black',
  blue: 'bg-brand-blue',
  white: 'bg-white',
}

const IMAGE_FOCUS = { top: 'object-top', center: 'object-center', bottom: 'object-bottom' } as const

const MIN_HEIGHT: Record<MinHeight, string> = {
  auto: '',
  md: 'min-h-[22rem]',
  lg: 'min-h-[30rem]',
  screen: 'min-h-[min(44rem,85svh)]',
}

const PADDING_Y: Record<Spacing, string> = {
  none: 'py-0',
  sm: 'py-6 @2xl:py-8',
  md: 'py-10 @2xl:py-12',
  lg: 'py-14 @2xl:py-20',
  xl: 'py-20 @2xl:py-28',
}

const HEADING_SIZE = {
  md: 'text-2xl @2xl:text-3xl',
  lg: 'text-3xl @2xl:text-4xl',
  xl: 'text-4xl @2xl:text-5xl',
} as const

const TEXT_SIZE = { sm: 'text-sm', md: 'text-base', lg: 'text-lg @2xl:text-xl' } as const

const IMAGE_SIZE = { sm: 'max-w-xs', md: 'max-w-xl', lg: 'max-w-3xl', full: 'max-w-none' } as const

const MEDIA_COLUMNS = {
  right: {
    sm: '@3xl:grid-cols-[minmax(0,1fr)_12rem]',
    md: '@3xl:grid-cols-[minmax(0,1fr)_22rem]',
    lg: '@3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
  },
  left: {
    sm: '@3xl:grid-cols-[12rem_minmax(0,1fr)]',
    md: '@3xl:grid-cols-[22rem_minmax(0,1fr)]',
    lg: '@3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
  },
} as const

const ICON_TILE = {
  sm: { box: 'size-14', icon: 'size-7' },
  md: { box: 'size-20', icon: 'size-10' },
  lg: { box: 'size-28', icon: 'size-14' },
} as const

const LIST_COLUMNS = {
  2: '@xl:grid-cols-2',
  3: '@xl:grid-cols-2 @3xl:grid-cols-3',
  4: '@xl:grid-cols-2 @3xl:grid-cols-4',
} as const

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// ---------------------------------------------------------------------------
// Mídia (imagem ou ícone)
// ---------------------------------------------------------------------------

function IconTile({ icon, tone, size }: { icon: string; tone: Tone; size: 'sm' | 'md' | 'lg' | 'item' }) {
  const Icon = iconFor(icon)
  // Em listas o ícone fica solto, sem quadrado de fundo; o quadrado só aparece quando o ícone é o destaque do bloco
  if (size === 'item') {
    return <Icon aria-hidden className={cn('size-8 shrink-0', tone === 'light' ? 'text-white' : 'text-primary')} strokeWidth={1.75} />
  }
  const dims = ICON_TILE[size]
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl',
        dims.box,
        tone === 'light' ? 'bg-white/12 text-white' : 'bg-accent text-primary',
      )}
    >
      <Icon className={dims.icon} strokeWidth={1.75} />
    </span>
  )
}

function MediaView({ media, tone, size }: { media: MediaRef; tone: Tone; size: 'sm' | 'md' | 'lg' | 'item' }) {
  const { preview } = useRender()
  if (media.kind === 'icon') return <IconTile icon={media.icon} tone={tone} size={size} />
  if (media.kind === 'image') {
    if (!media.imageUrl) {
      return preview ? (
        <span className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border-2 border-dashed border-current/40 text-sm opacity-70">
          Imagem não escolhida
        </span>
      ) : null
    }
    return (
      <ResponsiveImage
        src={media.imageUrl}
        alt={media.alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'rounded-2xl object-contain',
          size === 'item' ? 'size-16' : cn('h-auto w-full', size === 'sm' && 'mx-auto max-w-48'),
        )}
      />
    )
  }
  return null
}

const hasMedia = (media: MediaRef, preview: boolean) =>
  media.kind === 'icon' || (media.kind === 'image' && (Boolean(media.imageUrl) || preview))

// ---------------------------------------------------------------------------
// Botões
// ---------------------------------------------------------------------------

function PageButton({ item, tone }: { item: ButtonItem; tone: Tone }) {
  const { preview } = useRender()
  const label = item.label.trim()
  const resolved = resolveLink(item.link)
  if (!label || (!resolved && !preview)) return null

  const light = tone === 'light'
  const variant = item.variant === 'cta' ? 'cta' : item.variant === 'outline' ? 'outline' : 'default'
  const className = cn(
    'h-auto min-h-12 w-full whitespace-normal py-2 text-center @md:w-auto',
    item.variant === 'solid' && light && 'bg-white text-brand-ink hover:bg-white/90',
    item.variant === 'outline' && light && 'border-white/80 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white',
  )

  if (!resolved || preview) {
    return (
      <Button type="button" size="lg" variant={variant} className={className} onClick={(e) => e.preventDefault()}>
        {label}
      </Button>
    )
  }
  if (resolved.internal) {
    return (
      <Button asChild size="lg" variant={variant} className={className}>
        <Link to={resolved.href}>{label}</Link>
      </Button>
    )
  }
  return (
    <Button asChild size="lg" variant={variant} className={className}>
      <a href={resolved.href} {...(resolved.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {label}
      </a>
    </Button>
  )
}

function ButtonRow({ items, tone, align }: { items: ButtonItem[]; tone: Tone; align: Align }) {
  const visible = items.filter((item) => item.label.trim())
  if (visible.length === 0) return null
  return (
    <div className={cn('flex w-full flex-wrap gap-3', align === 'center' ? 'justify-center' : 'justify-start')}>
      {visible.map((item) => (
        <PageButton key={item.id} item={item} tone={tone} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Blocos
// ---------------------------------------------------------------------------

function richClass(tone: Tone, size: keyof typeof TEXT_SIZE, align: Align) {
  return cn(
    TEXT_SIZE[size],
    'max-w-[68ch] [&_a]:text-current',
    tone === 'light' && '[&_li]:marker:text-current',
    align === 'center' && 'mx-auto',
  )
}

// Na prévia do painel a página já tem o próprio <h1>: os títulos viram <h2>.
function useHeadingTag(id: string): 'h1' | 'h2' {
  const { h1Id, preview } = useRender()
  return !preview && id === h1Id ? 'h1' : 'h2'
}

function HeadingView({ block, tone, align }: { block: HeadingBlock; tone: Tone; align: Align }) {
  const Tag = useHeadingTag(block.id)
  if (!block.title.trim() && !block.subtitle.trim()) return null
  return (
    <div className={cn('w-full max-w-3xl', align === 'center' && 'mx-auto')}>
      {block.title.trim() && (
        <Tag className={cn('font-display leading-[1.1] font-extrabold tracking-tight text-balance', HEADING_SIZE[block.size])}>
          {block.title}
        </Tag>
      )}
      {block.subtitle.trim() && (
        <p className={cn('mt-3 text-base text-pretty @2xl:text-lg', tone === 'light' ? 'text-white/85' : 'text-muted-foreground')}>
          {block.subtitle}
        </p>
      )}
    </div>
  )
}

/** Subtítulos do editor são <h3>; sem um <h2> antes deles, a página pularia um degrau: sobem para <h2>. */
function withOutline(html: string, level: 'h2' | 'h3' | undefined): string {
  return level === 'h2' ? html.replace(/<(\/?)h3\b/gi, '<$1h2') : html
}

function TextView({ block, tone, align }: { block: TextBlock; tone: Tone; align: Align }) {
  const { outline } = useRender()
  return <RichTextRenderer html={withOutline(block.html, outline.text[block.id])} className={richClass(tone, block.size, align)} />
}

function ImageView({ block, align }: { block: ImageBlock; align: Align }) {
  const { preview } = useRender()
  if (!block.imageUrl) {
    return preview ? (
      <span className="flex aspect-video w-full max-w-xl items-center justify-center rounded-2xl border-2 border-dashed border-current/40 text-sm opacity-70">
        Imagem não escolhida
      </span>
    ) : null
  }
  return (
    <ResponsiveImage
      src={block.imageUrl}
      alt={block.alt}
      loading="lazy"
      decoding="async"
      className={cn('h-auto w-full', IMAGE_SIZE[block.size], block.rounded && 'rounded-2xl', align === 'center' && 'mx-auto')}
    />
  )
}

function MediaTextView({ block, tone }: { block: MediaTextBlock; tone: Tone }) {
  const { preview, outline } = useRender()
  const withMedia = hasMedia(block.media, preview)
  const Tag = useHeadingTag(block.id)
  return (
    <div
      className={cn(
        'grid w-full items-center gap-6 text-left @3xl:gap-12',
        withMedia && MEDIA_COLUMNS[block.side][block.mediaSize],
      )}
    >
      <div className={cn('flex min-w-0 flex-col gap-4', block.side === 'left' && withMedia && '@3xl:order-2')}>
        {block.title.trim() && (
          <Tag className="font-display text-2xl leading-[1.15] font-extrabold tracking-tight text-balance @2xl:text-3xl">{block.title}</Tag>
        )}
        <RichTextRenderer html={withOutline(block.html, outline.text[block.id])} className={richClass(tone, 'md', 'left')} />
        <ButtonRow items={block.buttons} tone={tone} align="left" />
      </div>
      {withMedia && (
        <div
          className={cn(
            'min-w-0',
            // empilhado: com a imagem à esquerda ela vem primeiro; à direita, depois do texto
            block.side === 'left' && 'order-first @3xl:order-1',
            block.media.kind === 'icon' && '@3xl:justify-self-center',
          )}
        >
          <MediaView media={block.media} tone={tone} size={block.mediaSize} />
        </div>
      )}
    </div>
  )
}

function IconListView({ block, tone, align }: { block: IconListBlock; tone: Tone; align: Align }) {
  const { outline } = useRender()
  if (block.items.length === 0) return null
  const Title = outline.items[block.id] ?? 'h3'
  const centered = align === 'center'
  return (
    <ul className={cn('mt-2 grid w-full grid-cols-1 gap-8 @2xl:mt-4', LIST_COLUMNS[block.columns])}>
      {block.items.map((item) => (
        <li key={item.id} className={cn('flex gap-4', centered ? 'flex-col items-center text-center' : 'items-start text-left')}>
          <span className={cn(!centered && 'mt-0.5')}>
            <MediaView media={item.media} tone={tone} size="item" />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            {item.title.trim() && <Title className="font-display text-lg leading-snug font-bold">{item.title}</Title>}
            {item.text.trim() && (
              <p className={cn('text-[15px] leading-relaxed', tone === 'light' ? 'text-white/85' : 'text-muted-foreground')}>{item.text}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

function SearchView({ block, align }: { block: SearchBlock; align: Align }) {
  const navigate = useNavigate()
  const { preview } = useRender()
  const [term, setTerm] = React.useState('')
  const inputId = `busca-${block.id}`

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (preview) return
    const q = term.trim()
    navigate(q ? `/explorar?q=${encodeURIComponent(q)}` : '/explorar')
  }

  return (
    <form onSubmit={submit} role="search" className={cn('flex w-full max-w-xl gap-2', align === 'center' && 'mx-auto')}>
      <label htmlFor={inputId} className="sr-only">
        Buscar vagas ou serviços
      </label>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          id={inputId}
          type="search"
          enterKeyHint="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={block.placeholder}
          className="h-12 w-full rounded-full border border-input bg-card pr-4 pl-12 text-base text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-brand-orange/70"
        />
      </div>
      <Button type="submit" size="lg" variant="cta" className="h-12 px-6">
        {block.buttonLabel}
      </Button>
    </form>
  )
}

function FeedView({ tone }: { tone: Tone }) {
  const { preview } = useRender()
  if (preview) {
    return (
      <div className="w-full rounded-2xl border-2 border-dashed border-current/40 px-4 py-10 text-center text-sm opacity-80">
        Aqui aparecem as vagas e os profissionais publicados no site, com os filtros.
      </div>
    )
  }
  return (
    <div className={cn('w-full text-left', tone === 'light' && 'rounded-3xl bg-background p-4 text-foreground @2xl:p-6')}>
      <FeedBrowser />
    </div>
  )
}

function BlockView({ block, tone, align }: { block: Block; tone: Tone; align: Align }) {
  switch (block.type) {
    case 'heading':
      return <HeadingView block={block} tone={tone} align={align} />
    case 'text':
      return <TextView block={block} tone={tone} align={align} />
    case 'image':
      return <ImageView block={block} align={align} />
    case 'buttons':
      return <ButtonRow items={block.items} tone={tone} align={align} />
    case 'media_text':
      return <MediaTextView block={block} tone={tone} />
    case 'icon_list':
      return <IconListView block={block} tone={tone} align={align} />
    case 'search':
      return <SearchView block={block} align={align} />
    case 'feed':
      return <FeedView tone={tone} />
  }
}

// ---------------------------------------------------------------------------
// Seção
// ---------------------------------------------------------------------------

const bumpPadding = (p: Spacing): Spacing => (p === 'none' || p === 'sm' || p === 'md' ? 'lg' : p)

function Surface({
  section,
  span,
  embedded = false,
  roomForControls = false,
}: {
  section: ContentSection
  span: SectionSpan
  /** dentro de um carrossel: sem cantos próprios e preenchendo a altura do slide */
  embedded?: boolean
  roomForControls?: boolean
}) {
  const { style, blocks } = section
  const bg = style.background
  const tone = sectionTone(bg)
  const surfaced = Boolean(bg.imageUrl) || bg.color !== 'none'
  const paddingY = roomForControls ? bumpPadding(style.paddingY) : style.paddingY

  const widthClass =
    style.contentWidth === 'narrow' ? 'max-w-2xl' : style.contentWidth === 'normal' ? 'max-w-4xl' : span === 'screen' ? 'max-w-6xl' : 'max-w-none'
  const sideClass = span === 'screen' ? 'px-4' : surfaced ? 'px-5 @2xl:px-10' : 'px-0'

  return (
    <section
      className={cn(
        '@container relative isolate flex flex-col justify-center overflow-clip',
        embedded && 'h-full',
        span === 'page' && !embedded && 'rounded-3xl',
        // com foto, a cor da cobertura fica por baixo: se a foto demorar ou falhar, o texto continua legível
        bg.imageUrl ? OVERLAY_COLOR[bg.overlay] : BG_COLOR[bg.color],
        MIN_HEIGHT[style.minHeight],
        tone === 'light' ? 'text-white' : 'text-foreground',
      )}
    >
      {bg.imageUrl && (
        <>
          <ResponsiveImage
            src={bg.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className={cn('absolute inset-0 -z-10 size-full object-contain', IMAGE_FOCUS[bg.imageFocus])}
          />
          <span
            aria-hidden
            className={cn('absolute inset-0 -z-10', OVERLAY_COLOR[bg.overlay])}
            style={{ opacity: bg.overlayOpacity / 100 }}
          />
        </>
      )}
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-4 @2xl:gap-5',
          widthClass,
          sideClass,
          PADDING_Y[paddingY],
          style.align === 'center' ? 'items-center text-center' : 'items-start text-left',
        )}
      >
        {blocks.map((block) => (
          <BlockView key={block.id} block={block} tone={tone} align={style.align} />
        ))}
      </div>
    </section>
  )
}

function PageFrame({ span, first, last, children }: { span: SectionSpan; first: boolean; last: boolean; children: React.ReactNode }) {
  if (span === 'screen') return <>{children}</>
  return <div className={cn('mx-auto w-full max-w-6xl px-4 py-3', first && 'pt-6', last && 'pb-8')}>{children}</div>
}

// ---------------------------------------------------------------------------
// Slides
// ---------------------------------------------------------------------------

function SlidesView({ section }: { section: SlidesSection }) {
  const { preview } = useRender()
  const reducedMotion = useReducedMotion()
  const count = section.slides.length
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const [hovering, setHovering] = React.useState(false)
  const current = Math.min(index, Math.max(count - 1, 0))
  const running = section.autoplay && count > 1 && !paused && !hovering && !reducedMotion && !preview

  React.useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), section.interval * 1000)
    return () => window.clearInterval(timer)
  }, [running, count, section.interval])

  if (count === 0) return null

  const go = (delta: number) => setIndex((current + delta + count) % count)

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques"
      className={cn('relative overflow-clip', section.span === 'page' && 'rounded-3xl')}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      <div className="grid" aria-live={running ? 'off' : 'polite'}>
        {section.slides.map((slide, i) => {
          const active = i === current
          return (
            <div
              key={slide.id}
              inert={!active}
              aria-hidden={!active}
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${count}`}
              className={cn(
                'col-start-1 row-start-1 transition-[opacity,visibility] duration-500 motion-reduce:transition-none',
                active ? 'visible opacity-100' : 'invisible opacity-0',
              )}
            >
              <Surface section={slide} span={section.span} embedded roomForControls={count > 1} />
            </div>
          )
        })}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          <SlideButton label="Slide anterior" onClick={() => go(-1)}>
            <ChevronLeft className="size-5" />
          </SlideButton>
          <div className="flex items-center">
            {section.slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir para o slide ${i + 1}`}
                aria-current={i === current}
                onClick={() => setIndex(i)}
                className="group flex size-6 items-center justify-center outline-none"
              >
                <span
                  className={cn(
                    'block h-2 rounded-full bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.25)] transition-[width,opacity] duration-200 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black/60 motion-reduce:transition-none',
                    i === current ? 'w-6 opacity-100' : 'w-2 opacity-60',
                  )}
                />
              </button>
            ))}
          </div>
          <SlideButton label="Próximo slide" onClick={() => go(1)}>
            <ChevronRight className="size-5" />
          </SlideButton>
          {section.autoplay && !reducedMotion && (
            <SlideButton label={paused ? 'Retomar a troca automática' : 'Pausar a troca automática'} onClick={() => setPaused((p) => !p)}>
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </SlideButton>
          )}
        </div>
      )}
    </div>
  )
}

function SlideButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full bg-black/45 text-white transition-colors outline-none hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60"
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

function SectionView({ section, first, last }: { section: Section; first: boolean; last: boolean }) {
  if (section.type === 'slides') {
    return (
      <PageFrame span={section.span} first={first} last={last}>
        <SlidesView section={section} />
      </PageFrame>
    )
  }
  return (
    <PageFrame span={section.style.span} first={first} last={last}>
      <Surface section={section} span={section.style.span} />
    </PageFrame>
  )
}

interface PageRendererProps {
  layout: PageLayout
  /** Título da página: vira o <h1> escondido quando nenhum bloco tem título. */
  title: string
  preview?: boolean
}

export function PageRenderer({ layout, title, preview = false }: PageRendererProps) {
  const state = React.useMemo(() => {
    const outline = headingOutline(layout)
    return { outline, h1Id: outline.h1, preview }
  }, [layout, preview])
  return (
    <RenderContext.Provider value={state}>
      <div className="flex flex-col">
        {!state.h1Id && !preview && <h1 className="sr-only">{title}</h1>}
        {layout.sections.map((section, i) => (
          <SectionView key={section.id} section={section} first={i === 0} last={i === layout.sections.length - 1} />
        ))}
      </div>
    </RenderContext.Provider>
  )
}
