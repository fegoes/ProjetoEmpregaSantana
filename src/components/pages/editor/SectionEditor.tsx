import { Sortable } from '@/components/admin/Sortable'
import * as React from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { BlockForm } from '@/components/pages/editor/BlockForms'
import { Field, OptionGroup, PageImageField, SwatchGroup } from '@/components/pages/editor/fields'
import { EditorRow, RowActions } from '@/components/pages/editor/rows'
import {
  BLOCK_TYPES,
  emptySectionColors,
  sectionColorWarnings,
  MAX_BLOCKS,
  blockLabel,
  blockSummary,
  cloneWithNewIds,
  moveItem,
  newBlock,
  readabilityWarning,
  type BackgroundColor,
  type Block,
  type ContentSection,
  type OverlayColor,
  type SectionBackground,
  type SectionStyle,
} from '@/lib/pageLayout'

const COLOR_OPTIONS: { value: BackgroundColor; label: string; swatch: string }[] = [
  { value: 'none', label: 'Sem cor', swatch: 'bg-background' },
  { value: 'white', label: 'Branco', swatch: 'bg-white' },
  { value: 'soft', label: 'Cinza claro', swatch: 'bg-secondary' },
  { value: 'blue', label: 'Azul', swatch: 'bg-brand-blue' },
  { value: 'ink', label: 'Azul profundo', swatch: 'bg-brand-ink' },
]

const OVERLAY_OPTIONS: { value: OverlayColor; label: string; swatch: string }[] = [
  { value: 'ink', label: 'Azul profundo', swatch: 'bg-brand-ink' },
  { value: 'black', label: 'Preto', swatch: 'bg-black' },
  { value: 'blue', label: 'Azul', swatch: 'bg-brand-blue' },
  { value: 'white', label: 'Branco', swatch: 'bg-white' },
]

function AppearanceTab({
  style,
  variant,
  onChange,
}: {
  style: SectionStyle
  variant: 'section' | 'slide'
  onChange: (style: SectionStyle) => void
}) {
  const id = React.useId()
  const set = (patch: Partial<SectionStyle>) => onChange({ ...style, ...patch })
  const setBg = (patch: Partial<SectionBackground>) => onChange({ ...style, background: { ...style.background, ...patch }, ...(patch.color ? { colors: { ...(style.colors ?? emptySectionColors()), background: '' } } : {}) })
  const bg = style.background
  const warning = readabilityWarning(bg)

  return (
    <div className="flex flex-col gap-5">
      <details className="border-b pb-3"><summary className="min-h-11 cursor-pointer py-2 text-sm font-medium">Nome, tipo e dimensões</summary><div className="flex flex-col gap-5 pt-3">
      <Field label="Nome da seção" hint="Identifique esta parte no editor. O nome não aparece na página.">
        <Input value={style.name ?? ''} maxLength={80} onChange={e => set({ name: e.target.value })} />
      </Field>
      <Field label="Tipo de seção" hint="Cabeçalho, artigo e encerramento pertencem a esta página; não alteram o menu global do site.">
        <NativeSelect value={style.element ?? 'section'} onChange={e => set({ element: e.target.value as SectionStyle['element'] })}>
          <option value="section">Seção de conteúdo</option><option value="header">Cabeçalho da página</option><option value="article">Artigo</option><option value="footer">Encerramento da página</option>
        </NativeSelect>
      </Field>
      {variant === 'section' && (
        <OptionGroup
          label="Largura da seção"
          value={style.span}
          options={[
            { value: 'screen', label: 'Largura toda da tela' },
            { value: 'page', label: 'Largura do site' },
          ]}
          onChange={(span) => set({ span })}
          hint="Na largura toda, o fundo vai de uma borda da tela à outra. Na largura do site, ele acompanha as margens do conteúdo."
        />
      )}
      <OptionGroup
        label="Largura do conteúdo"
        value={style.contentWidth}
        options={[
          { value: 'narrow', label: 'Estreita' },
          { value: 'normal', label: 'Média' },
          { value: 'wide', label: 'Larga' },
          { value: 'full', label: 'Toda a seção' },
        ]}
        onChange={(contentWidth) => set({ contentWidth })}
        hint="Estreita é boa para ler texto; larga acompanha o menu do topo."
      />
      <OptionGroup
        label="Espaço acima e abaixo"
        value={style.paddingY}
        options={[
          { value: 'none', label: 'Nenhum' },
          { value: 'sm', label: 'Pequeno' },
          { value: 'md', label: 'Médio' },
          { value: 'lg', label: 'Grande' },
          { value: 'xl', label: 'Enorme' },
        ]}
        onChange={(paddingY) => set({ paddingY })}
      />
      <OptionGroup
        label="Altura mínima"
        value={style.minHeight}
        options={[
          { value: 'auto', label: 'Pelo conteúdo' },
          { value: 'md', label: 'Média' },
          { value: 'lg', label: 'Alta' },
          { value: 'screen', label: 'Compacta de destaque (modelo anterior)' },
          { value: 'viewport', label: 'Uma tela inteira · 100%' },
          { value: 'custom', label: 'Personalizada em pixels' },
        ]}
        onChange={(minHeight) => set({ minHeight })}
      />
      {style.minHeight === 'custom' && <Field label="Altura mínima em pixels" hint="Entre 120 e 2.000 px. O conteúdo pode aumentar a altura, sem ser cortado."><Input type="number" min={120} max={2000} value={style.customMinHeight ?? 560} onChange={e => set({ customMinHeight: Math.min(2000, Math.max(120, Number(e.target.value) || 120)) })} /></Field>}
      <p className="text-xs text-muted-foreground">A altura é mínima: textos e imagens podem aumentar a seção. Tela inteira acompanha a tela do dispositivo.</p>
      <OptionGroup
        label="Alinhamento"
        value={style.align}
        options={[
          { value: 'left', label: 'À esquerda' },
          { value: 'center', label: 'Centralizado' },
        ]}
        onChange={(align) => set({ align })}
      />

      </div></details>
      <SwatchGroup<BackgroundColor | ''> label="Cor de fundo" value={style.colors?.background ? '' : bg.color} options={COLOR_OPTIONS} onChange={(color) => { if (color) setBg({ color }) }} />

      <fieldset className="space-y-3 border-y py-4">
        <legend className="px-1 text-sm font-semibold">Cores da seção e dos itens</legend>
        <p className="text-xs text-muted-foreground">Deixe uma cor em Automática para manter o padrão do tema. As alterações aparecem na prévia enquanto você edita os blocos.</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Combinações de cores">
          {[
            { label: 'Azul', background: '#1e63b6', text: '#ffffff', link: '#ffffff', button: '#ffffff', buttonText: '#0d3a66' },
            { label: 'Claro', background: '#edf3fa', text: '#0d3a66', link: '#1e63b6', button: '#1e63b6', buttonText: '#ffffff' },
            { label: 'Profundo', background: '#0d3a66', text: '#ffffff', link: '#ffffff', button: '#ffffff', buttonText: '#0d3a66' },
          ].map(({ label, ...colors }) => <button type="button" key={label} className="min-h-11 rounded-full border px-3 text-sm hover:bg-accent" onClick={() => set({ colors })}>{label}</button>)}
        </div>
        {([{ key: 'background', label: 'Fundo da seção' }, { key: 'text', label: 'Texto' }, { key: 'link', label: 'Links' }, { key: 'button', label: 'Fundo dos botões' }, { key: 'buttonText', label: 'Texto dos botões' }] as const).map(({ key, label }) => {
          const colors = style.colors ?? emptySectionColors()
          return <div key={key} className="flex flex-wrap items-center justify-between gap-2 border-b py-2">
            <label htmlFor={`${id}-${key}`} className="text-sm">{label}</label>
            <div className="flex items-center gap-2"><input id={`${id}-${key}`} type="color" aria-label={label} value={colors[key] || (key === 'text' || key === 'buttonText' ? '#333333' : '#ffffff')} className="h-11 w-12 cursor-pointer rounded-md border bg-card p-1" onChange={e => set({ colors: { ...colors, [key]: e.target.value } })} /><button type="button" className="min-h-11 px-2 text-xs text-primary underline underline-offset-4" onClick={() => set({ colors: { ...colors, [key]: '' } })}>{colors[key] ? 'Restaurar automática' : 'Automática'}</button></div>
          </div>
        })}
        {sectionColorWarnings(style).map(warning => <p key={warning} role="status" className="text-sm text-destructive-ink">{warning}</p>)}
        {bg.imageUrl && <p className="text-xs text-muted-foreground">Sobre fotos, confira a leitura na prévia: o contraste depende também da imagem e da cobertura.</p>}
      </fieldset>
      <details><summary className="min-h-11 cursor-pointer py-2 text-sm font-medium">Imagem de fundo e cobertura</summary><div className="flex flex-col gap-5 pt-3">
      <PageImageField
        label="Imagem de fundo"
        purpose="banner"
        url={bg.imageUrl}
        onChange={(imageUrl) => setBg({ imageUrl })}
      />

      {bg.imageUrl && (
        <>
          <OptionGroup
            label="Parte da imagem em destaque"
            value={bg.imageFocus}
            options={[
              { value: 'top', label: 'Parte de cima' },
              { value: 'center', label: 'Centro' },
              { value: 'bottom', label: 'Parte de baixo' },
            ]}
            onChange={(imageFocus) => setBg({ imageFocus })}
          />
          <SwatchGroup label="Cor da cobertura sobre a imagem" value={bg.overlay} options={OVERLAY_OPTIONS} onChange={(overlay) => setBg({ overlay })} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cobertura" className="flex items-center justify-between text-sm font-medium">
              Intensidade da cobertura
              <span className="text-muted-foreground tabular-nums">{bg.overlayOpacity}%</span>
            </label>
            <input
              id="cobertura"
              type="range"
              min={0}
              max={90}
              step={5}
              value={bg.overlayOpacity}
              onChange={(e) => setBg({ overlayOpacity: Number(e.target.value) })}
              className="h-11 w-full accent-[var(--brand-blue)] md:h-8"
            />
            <p className="text-xs text-muted-foreground">A cobertura escurece (ou clareia) a foto para o texto ficar legível.</p>
            {warning && (
              <p role="status" className="text-sm text-destructive-ink">
                {warning}
              </p>
            )}
          </div>
        </>
      )}
      </div></details>
    </div>
  )
}

interface SectionEditorProps {
  section: ContentSection
  onChange: (section: ContentSection) => void
  /** slide = dentro de um carrossel (a largura da tela é definida pelo carrossel) */
  variant?: 'section' | 'slide'
}

/** Conteúdo (blocos) e aparência (fundo, largura, espaços) de uma seção. */
export function SectionEditor({ section, onChange, variant = 'section' }: SectionEditorProps) {
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => new Set())

  const setBlocks = (blocks: Block[]) => onChange({ ...section, blocks })
  const updateBlock = (block: Block) => setBlocks(section.blocks.map((b) => (b.id === block.id ? block : b)))
  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const addBlock = (type: Block['type']) => {
    const block = newBlock(type)
    setBlocks([...section.blocks, block])
    setOpenIds((current) => new Set(current).add(block.id))
  }

  const removeBlock = (block: Block) => {
    const filled = block.type !== 'feed' && block.type !== 'search' && blockSummary(block).trim().length > 0
    if (filled && !window.confirm(`Apagar o bloco "${blockLabel(block.type)}"? Não dá para desfazer.`)) return
    setBlocks(section.blocks.filter((b) => b.id !== block.id))
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <details className="rounded-xl border p-4" open>
        <summary className="cursor-pointer text-sm font-semibold">Configuração, dimensões e cores</summary>
        <div className="pt-5"><AppearanceTab style={section.style} variant={variant} onChange={(style) => onChange({ ...section, style })} /></div>
      </details>
      <div className="flex min-w-0 flex-col gap-3">
        <h3 className="text-base font-semibold">Conteúdo e itens da seção</h3>
        <p className="text-xs text-muted-foreground">Adicione, edite ou arraste os blocos. Eles usam as cores desta seção e aparecem na prévia em tempo real.</p>
        {section.blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta seção ainda não tem blocos. Adicione um abaixo.</p>
        ) : (
          <Sortable items={section.blocks} onChange={setBlocks} label="Blocos"><ul className="flex flex-col divide-y border-y">
            {section.blocks.map((block, index) => (
              <EditorRow
                key={block.id}
            sortableId={block.id}
                id={`bloco-${block.id}`}
                label={blockLabel(block.type)}
                summary={blockSummary(block)}
                open={openIds.has(block.id)}
                onToggle={() => toggle(block.id)}
              >
                <BlockForm block={block} onChange={updateBlock} />
                <RowActions
                  index={index}
                  count={section.blocks.length}
                  onMove={(delta) => setBlocks(moveItem(section.blocks, index, delta))}
                  onDuplicate={() => {
                    const copy = cloneWithNewIds(block)
                    const next = [...section.blocks]
                    next.splice(index + 1, 0, copy)
                    setBlocks(next)
                    setOpenIds((current) => new Set(current).add(copy.id))
                  }}
                  canDuplicate={section.blocks.length < MAX_BLOCKS}
                  onRemove={() => removeBlock(block)}
                  removeLabel="Apagar bloco"
                />
              </EditorRow>
            ))}
          </ul></Sortable>
        )}

        {section.blocks.length < MAX_BLOCKS && (
          <div role="group" aria-label="Adicionar bloco" className="flex flex-wrap gap-2">
            {BLOCK_TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                title={t.description}
                onClick={() => addBlock(t.type)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border bg-card px-3.5 text-sm font-medium transition-colors hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <Plus className="size-4" aria-hidden /> {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
