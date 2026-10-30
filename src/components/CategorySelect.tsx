import { useCategories } from '@/hooks/useCategories'
import { NativeSelect } from '@/components/ui/native-select'

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
    <NativeSelect id={id} className={className} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecione uma categoria</option>
      {options.map((category) => (
        <option key={category.slug} value={category.slug}>
          {category.label}
        </option>
      ))}
    </NativeSelect>
  )
}
