import * as React from 'react'
import type { ReactNode } from 'react'
import { useCategories } from '@/hooks/useCategories'
import {
  EMPLOYMENT_TYPE_OPTIONS,
  PRICING_MODEL_OPTIONS,
  toggleInList,
  type FeedFilters,
} from '@/lib/feedFilters'
import { cn } from '@/lib/utils'

interface FeedFilterPanelProps {
  value: FeedFilters
  onChange: (filters: FeedFilters) => void
  /** 'sidebar' = lista de caixinhas no desktop; 'sheet' = chips grandes no painel do celular */
  layout?: 'sidebar' | 'sheet'
}

const VISIBLE_CATEGORIES = 8

function Chip({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      className={cn(
        'h-11 rounded-full border px-4 text-sm font-medium transition-colors',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:border-primary/50',
      )}
    >
      {children}
    </button>
  )
}

function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md text-sm hover:text-primary">
      <input type="checkbox" className="size-4 shrink-0" checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-display text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</legend>
      {children}
    </fieldset>
  )
}

export function FeedFilterPanel({ value, onChange, layout = 'sidebar' }: FeedFilterPanelProps) {
  const { data: categories } = useCategories()
  const [showAllCategories, setShowAllCategories] = React.useState(false)
  const sheet = layout === 'sheet'
  const optionsClass = sheet ? 'flex flex-wrap gap-2' : 'flex flex-col'

  const option = (checked: boolean, toggle: () => void, label: string, key: string) =>
    sheet ? (
      <Chip key={key} checked={checked} onClick={toggle}>
        {label}
      </Chip>
    ) : (
      <CheckRow key={key} checked={checked} onChange={toggle}>
        {label}
      </CheckRow>
    )

  // No desktop a lista de categorias começa curta; as marcadas aparecem sempre.
  const visibleCategories = React.useMemo(() => {
    if (!categories) return []
    if (sheet || showAllCategories) return categories
    const selected = categories.filter((c) => value.categories.includes(c.slug))
    const rest = categories.filter((c) => !value.categories.includes(c.slug))
    return [...selected, ...rest].slice(0, Math.max(VISIBLE_CATEGORIES, selected.length))
  }, [categories, sheet, showAllCategories, value.categories])

  return (
    <div className={cn('flex flex-col', sheet ? 'gap-6' : 'gap-6')}>
      <Section title="Contratação">
        <div className={optionsClass}>
          {EMPLOYMENT_TYPE_OPTIONS.map((o) =>
            option(
              value.employmentTypes.includes(o.value),
              () => onChange({ ...value, employmentTypes: toggleInList(value.employmentTypes, o.value) }),
              o.label,
              o.value,
            ),
          )}
        </div>
      </Section>

      <Section title="Pagamento">
        <div className={optionsClass}>
          {PRICING_MODEL_OPTIONS.map((o) =>
            option(
              value.pricingModels.includes(o.value),
              () => onChange({ ...value, pricingModels: toggleInList(value.pricingModels, o.value) }),
              o.label,
              o.value,
            ),
          )}
        </div>
      </Section>

      <Section title="Local">
        <div className={optionsClass}>
          {option(value.remoteOnly, () => onChange({ ...value, remoteOnly: !value.remoteOnly }), 'Só trabalho remoto', 'remote')}
        </div>
      </Section>

      {categories && categories.length > 0 && (
        <Section title="Categoria">
          <div className={optionsClass}>
            {visibleCategories.map((c) =>
              option(
                value.categories.includes(c.slug),
                () => onChange({ ...value, categories: toggleInList(value.categories, c.slug) }),
                c.label,
                c.slug,
              ),
            )}
          </div>
          {!sheet && categories.length > VISIBLE_CATEGORIES && (
            <button
              type="button"
              onClick={() => setShowAllCategories((v) => !v)}
              className="mt-1 self-start text-sm font-medium text-primary hover:underline"
            >
              {showAllCategories ? 'Mostrar menos' : `Ver todas as ${categories.length} categorias`}
            </button>
          )}
        </Section>
      )}
    </div>
  )
}
