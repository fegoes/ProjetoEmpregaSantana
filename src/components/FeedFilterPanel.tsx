import * as React from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import {
  DEFAULT_FEED_FILTERS,
  EMPLOYMENT_TYPE_OPTIONS,
  PRICING_MODEL_OPTIONS,
  hasActiveFilters,
  toggleInList,
  type FeedFilters,
} from '@/lib/feedFilters'
import { cn } from '@/lib/utils'

interface FeedFilterPanelProps {
  value: FeedFilters
  onChange: (filters: FeedFilters) => void
  layout?: 'sidebar' | 'inline'
}

function Pill({
  checked,
  onClick,
  children,
}: {
  checked: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        checked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function CheckboxRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: () => void
  children: ReactNode
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {children}
    </label>
  )
}

export function FeedFilterPanel({ value, onChange, layout = 'sidebar' }: FeedFilterPanelProps) {
  const { data: categories } = useCategories()
  const inline = layout === 'inline'
  const [expanded, setExpanded] = React.useState(false)
  const activeCount =
    value.categories.length + value.employmentTypes.length + value.pricingModels.length + (value.remoteOnly ? 1 : 0)

  const sectionClass = inline ? 'flex flex-col gap-2' : 'flex flex-col gap-2.5'
  const optionsClass = inline ? 'flex flex-wrap gap-2' : 'flex flex-col gap-1.5'

  return (
    <div className={inline ? 'flex flex-col gap-4' : 'flex flex-col gap-4 lg:gap-6'}>
      {!inline && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-sm font-semibold lg:cursor-default"
          >
            <SlidersHorizontal className="size-4" /> Filtros
            {activeCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {activeCount}
              </span>
            )}
            <ChevronDown className={cn('size-4 transition-transform lg:hidden', expanded && 'rotate-180')} />
          </button>
          {hasActiveFilters(value) && (
            <button
              type="button"
              onClick={() => onChange(DEFAULT_FEED_FILTERS)}
              className="text-xs text-primary hover:underline"
            >
              Limpar
            </button>
          )}
        </div>
      )}

      <div className={cn('flex flex-col gap-4', !inline && (expanded ? 'flex' : 'hidden'), !inline && 'lg:flex lg:gap-6')}>
      <div className={sectionClass}>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">O que buscar</p>
        <div className={optionsClass}>
          {inline ? (
            <>
              <Pill checked={value.showVagas} onClick={() => onChange({ ...value, showVagas: !value.showVagas })}>
                Vagas
              </Pill>
              <Pill
                checked={value.showAutonomos}
                onClick={() => onChange({ ...value, showAutonomos: !value.showAutonomos })}
              >
                Autônomos
              </Pill>
            </>
          ) : (
            <>
              <CheckboxRow
                checked={value.showVagas}
                onChange={() => onChange({ ...value, showVagas: !value.showVagas })}
              >
                Vagas
              </CheckboxRow>
              <CheckboxRow
                checked={value.showAutonomos}
                onChange={() => onChange({ ...value, showAutonomos: !value.showAutonomos })}
              >
                Autônomos
              </CheckboxRow>
            </>
          )}
        </div>
      </div>

      <div className={sectionClass}>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Contratação</p>
        <div className={optionsClass}>
          {EMPLOYMENT_TYPE_OPTIONS.map((option) =>
            inline ? (
              <Pill
                key={option.value}
                checked={value.employmentTypes.includes(option.value)}
                onClick={() => onChange({ ...value, employmentTypes: toggleInList(value.employmentTypes, option.value) })}
              >
                {option.label}
              </Pill>
            ) : (
              <CheckboxRow
                key={option.value}
                checked={value.employmentTypes.includes(option.value)}
                onChange={() => onChange({ ...value, employmentTypes: toggleInList(value.employmentTypes, option.value) })}
              >
                {option.label}
              </CheckboxRow>
            ),
          )}
        </div>
      </div>

      <div className={sectionClass}>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Pagamento</p>
        <div className={optionsClass}>
          {PRICING_MODEL_OPTIONS.map((option) =>
            inline ? (
              <Pill
                key={option.value}
                checked={value.pricingModels.includes(option.value)}
                onClick={() => onChange({ ...value, pricingModels: toggleInList(value.pricingModels, option.value) })}
              >
                {option.label}
              </Pill>
            ) : (
              <CheckboxRow
                key={option.value}
                checked={value.pricingModels.includes(option.value)}
                onChange={() => onChange({ ...value, pricingModels: toggleInList(value.pricingModels, option.value) })}
              >
                {option.label}
              </CheckboxRow>
            ),
          )}
        </div>
      </div>

      <div className={sectionClass}>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Local</p>
        {inline ? (
          <Pill checked={value.remoteOnly} onClick={() => onChange({ ...value, remoteOnly: !value.remoteOnly })}>
            Somente remoto
          </Pill>
        ) : (
          <CheckboxRow checked={value.remoteOnly} onChange={() => onChange({ ...value, remoteOnly: !value.remoteOnly })}>
            Somente remoto
          </CheckboxRow>
        )}
      </div>

      {categories && categories.length > 0 && (
        <div className={sectionClass}>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Categoria</p>
          <div className={cn(optionsClass, !inline && 'max-h-56 overflow-y-auto pr-1')}>
            {categories.map((category) =>
              inline ? (
                <Pill
                  key={category.slug}
                  checked={value.categories.includes(category.slug)}
                  onClick={() => onChange({ ...value, categories: toggleInList(value.categories, category.slug) })}
                >
                  {category.label}
                </Pill>
              ) : (
                <CheckboxRow
                  key={category.slug}
                  checked={value.categories.includes(category.slug)}
                  onChange={() => onChange({ ...value, categories: toggleInList(value.categories, category.slug) })}
                >
                  {category.label}
                </CheckboxRow>
              ),
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
