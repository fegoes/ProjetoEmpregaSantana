import { Sortable } from '@/components/admin/Sortable'
import * as React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OptionGroup, CheckField } from '@/components/pages/editor/fields'
import { EditorRow, RowActions } from '@/components/pages/editor/rows'
import { SectionEditor } from '@/components/pages/editor/SectionEditor'
import {
  MAX_SECTIONS,
  MAX_SLIDES,
  SECTION_TEMPLATES,
  cloneWithNewIds,
  moveItem,
  newSlide,
  sectionLabel,
  sectionSummary,
  type Section,
  type SlideInterval,
  type SlidesSection,
} from '@/lib/pageLayout'

function SlidesEditor({ section, onChange }: { section: SlidesSection; onChange: (section: SlidesSection) => void }) {
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => new Set(section.slides[0] ? [section.slides[0].id] : []))
  const setSlides = (slides: SlidesSection['slides']) => onChange({ ...section, slides })
  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="flex flex-col gap-5">
      <OptionGroup
        label="Largura do carrossel"
        value={section.span}
        options={[
          { value: 'screen', label: 'Largura toda da tela' },
          { value: 'page', label: 'Largura do site' },
        ]}
        onChange={(span) => onChange({ ...section, span })}
      />
      <div className="flex flex-col gap-2">
        <CheckField
          label="Trocar de slide sozinho"
          checked={section.autoplay}
          onChange={(autoplay) => onChange({ ...section, autoplay })}
        />
        {section.autoplay && (
          <OptionGroup
            label="Tempo em cada slide"
            value={section.interval}
            options={[
              { value: 5 as SlideInterval, label: '5 segundos' },
              { value: 8 as SlideInterval, label: '8 segundos' },
              { value: 12 as SlideInterval, label: '12 segundos' },
            ]}
            onChange={(interval) => onChange({ ...section, interval })}
            hint="A troca para quando a pessoa passa o mouse ou usa o teclado, e não acontece para quem prefere menos movimento."
          />
        )}
      </div>

      <Sortable items={section.slides} onChange={setSlides} label="Slides"><ul className="flex flex-col divide-y border-y">
        {section.slides.map((slide, index) => (
          <EditorRow
            key={slide.id}
            sortableId={slide.id}
            id={`slide-${slide.id}`}
            label={`Slide ${index + 1}`}
            summary={sectionSummary(slide)}
            open={openIds.has(slide.id)}
            onToggle={() => toggle(slide.id)}
          >
            <SectionEditor
              variant="slide"
              section={slide}
              onChange={(next) => setSlides(section.slides.map((s) => (s.id === slide.id ? next : s)))}
            />
            <RowActions
              index={index}
              count={section.slides.length}
              onMove={(delta) => setSlides(moveItem(section.slides, index, delta))}
              onDuplicate={() => {
                const copy = cloneWithNewIds(slide)
                const next = [...section.slides]
                next.splice(index + 1, 0, copy)
                setSlides(next)
                setOpenIds((current) => new Set(current).add(copy.id))
              }}
              canDuplicate={section.slides.length < MAX_SLIDES}
              onRemove={() => {
                if (window.confirm(`Apagar o slide ${index + 1}? Não dá para desfazer.`)) {
                  setSlides(section.slides.filter((s) => s.id !== slide.id))
                }
              }}
              canRemove={section.slides.length > 1}
              removeLabel="Apagar slide"
            />
          </EditorRow>
        ))}
      </ul></Sortable>

      {section.slides.length < MAX_SLIDES && (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => {
            const slide = newSlide()
            setSlides([...section.slides, slide])
            setOpenIds((current) => new Set(current).add(slide.id))
          }}
        >
          <Plus /> Adicionar slide
        </Button>
      )}
    </div>
  )
}

interface PageBuilderProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
}

/** Lista de seções da página: modelos para começar, ordem, duplicar, apagar e edição de cada uma. */
export function PageBuilder({ sections, onChange }: PageBuilderProps) {
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => new Set())
  const [picking, setPicking] = React.useState(sections.length === 0)

  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const update = (next: Section) => onChange(sections.map((s) => (s.id === next.id ? next : s)))

  const add = (build: () => Section) => {
    const section = build()
    onChange([...sections, section])
    setOpenIds((current) => new Set(current).add(section.id))
    setPicking(false)
    window.setTimeout(() => {
      document.getElementById(`secao-${section.id}`)?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    }, 80)
  }

  const remove = (section: Section) => {
    const filled = section.type === 'slides' || section.blocks.length > 0
    if (filled && !window.confirm('Apagar esta seção com todo o conteúdo? Não dá para desfazer.')) return
    onChange(sections.filter((s) => s.id !== section.id))
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">A página está vazia. Escolha um modelo para a primeira seção.</p>
      ) : (
        <Sortable items={sections} onChange={onChange} label="Seções"><ul className="flex flex-col divide-y border-y">
          {sections.map((section, index) => (
            <EditorRow
              key={section.id}
            sortableId={section.id}
              id={`secao-${section.id}`}
              label={`${index + 1}. ${sectionLabel(section)}`}
              summary={sectionSummary(section)}
              open={openIds.has(section.id)}
              onToggle={() => toggle(section.id)}
            >
              {section.type === 'slides' ? (
                <SlidesEditor section={section} onChange={update} />
              ) : (
                <SectionEditor section={section} onChange={update} />
              )}
              <RowActions
                index={index}
                count={sections.length}
                onMove={(delta) => onChange(moveItem(sections, index, delta))}
                onDuplicate={() => {
                  const copy = cloneWithNewIds(section)
                  const next = [...sections]
                  next.splice(index + 1, 0, copy)
                  onChange(next)
                  setOpenIds((current) => new Set(current).add(copy.id))
                }}
                canDuplicate={sections.length < MAX_SECTIONS}
                onRemove={() => remove(section)}
                removeLabel="Apagar seção"
              />
            </EditorRow>
          ))}
        </ul></Sortable>
      )}

      {sections.length < MAX_SECTIONS &&
        (picking ? (
          <div className="flex flex-col gap-3" role="group" aria-label="Modelos de seção">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Escolha um modelo</p>
              {sections.length > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setPicking(false)}>
                  Cancelar
                </Button>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SECTION_TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => add(t.build)}
                  className="flex flex-col gap-0.5 rounded-xl border bg-card p-3.5 text-left transition-colors hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span className="text-sm font-semibold">{t.label}</span>
                  <span className="text-sm text-muted-foreground">{t.description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Button type="button" variant="outline" className="self-start" onClick={() => setPicking(true)}>
            <Plus /> Adicionar seção
          </Button>
        ))}
    </div>
  )
}
