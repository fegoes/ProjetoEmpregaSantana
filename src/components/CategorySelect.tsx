import { useCategories } from '@/hooks/useCategories'
import { taxonomyOptions } from '@/lib/taxonomies'
import { cn } from '@/lib/utils'

interface CategorySelectProps {
  id?: string
  kind: 'vaga' | 'autonomo' | 'empresa'
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CategorySelect({ id, kind, value, onChange, className }: CategorySelectProps) {
  const query = useCategories()
  const categories = query.data
  const options = taxonomyOptions(categories ?? [], kind, value)

  return (
    <>
    <select
      disabled={query.isLoading || query.isError}
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
    {query.isError && <p role="alert" className="text-xs text-destructive">Não foi possível carregar as categorias. Recarregue a página e tente novamente.</p>}
    </>
  )
}
