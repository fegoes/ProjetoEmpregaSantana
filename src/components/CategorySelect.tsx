import { useCategories } from '@/hooks/useCategories'
import { cn } from '@/lib/utils'

interface CategorySelectProps {
  id?: string
  kind: 'vaga' | 'autonomo'
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CategorySelect({ id, kind, value, onChange, className }: CategorySelectProps) {
  const { data: categories } = useCategories()
  const options = (categories ?? []).filter((c) => c.kind === kind || c.kind === 'both')

  return (
    <select
      id={id}
      className={cn('h-9 rounded-md border border-input bg-transparent px-3 text-sm', className)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Selecione uma categoria</option>
      {options.map((category) => (
        <option key={category.slug} value={category.slug}>
          {category.label}
        </option>
      ))}
    </select>
  )
}
