import { Sortable } from '@/components/admin/Sortable'
import * as React from 'react'
import { Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BlockForm } from '@/components/pages/editor/BlockForms'
import { OptionGroup, PageImageField, SwatchGroup } from '@/components/pages/editor/fields'
import { EditorRow, RowActions } from '@/components/pages/editor/rows'
import {
  BLOCK_TYPES,
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
  const set = (patch: Partial<SectionStyle>) => onChange({ ...style, ...patch })
  const setBg = (patch: Partial<SectionBackground>) => onChange({ ...style, background: { ...style.background, ...patch } })
  const bg = style.background
  const warning = readabilityWarning(bg)

  return (
    <div className="flex flex-col gap-5">
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
          { value: 'screen', label: 'Quase a tela toda' },
        ]}
        onChange={(minHeight) => set({ minHeight })}
      />
      <OptionGroup
        label="Alinhamento"
        value={style.align}
        options={[
          { value: 'left', label: 'À esquerda' },
          { value: 'center', label: 'Centralizado' },
        ]}
        onChange={(align) => set({ align })}
      />

      <SwatchGroup label="Cor de fundo" value={bg.color} options={COLOR_OPTIONS} onChange={(color) => setBg({ color })} />

      <PageImageField
        label="Imagem de fundo"
        url={bg.imageUrl}
        onChange={(imageUrl) => setBg({ imageUrl })}
        hint="JPG ou PNG, até 5 MB. Prefira uma foto larga (1600 px ou mais)."
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
    <Tabs defaultValue="conteudo">
      <TabsList className="h-11 w-full sm:w-fit">
        <TabsTrigger value="conteudo" className="px-5">
          Conteúdo
        </TabsTrigger>
        <TabsTrigger value="aparencia" className="px-5">
          Aparência
        </TabsTrigger>
      </TabsList>

      <TabsContent value="conteudo" className="flex flex-col gap-3 pt-2">
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
      </TabsContent>

      <TabsContent value="aparencia" className="pt-3">
        <AppearanceTab style={section.style} variant={variant} onChange={(style) => onChange({ ...section, style })} />
      </TabsContent>
    </Tabs>
  )
}
