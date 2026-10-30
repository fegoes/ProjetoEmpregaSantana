import { useCategories } from '@/hooks/useCategories'
import { activeFor } from '@/lib/categories'
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
  // Categorias ocultas pelo superadmin saem da lista, mas a já escolhida continua aparecendo
  const options = activeFor(categories, kind, value)

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
