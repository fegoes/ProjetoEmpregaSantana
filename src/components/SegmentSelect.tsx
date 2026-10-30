import { useCategories } from '@/hooks/useCategories'
import { activeFor } from '@/lib/categories'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'

interface SegmentSelectProps {
  id: string
  /** Texto do segmento (empresas.sector guarda o nome, não um código) */
  value: string
  onChange: (value: string) => void
}

/**
 * Segmento da empresa, escolhido na lista que o superadmin gerencia.
 * Se o segmento atual não está na lista (empresa antiga, texto livre), ele continua aparecendo.
 * Sem nenhum segmento cadastrado, volta a ser um campo de texto.
 */
export function SegmentSelect({ id, value, onChange }: SegmentSelectProps) {
  const { data: categories } = useCategories()
  const segments = activeFor(categories, 'empresa')

  if (segments.length === 0) {
    return <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Ex.: Varejo" />
  }

  const known = segments.some((s) => s.label === value)
  return (
    <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecione o segmento</option>
      {value && !known && <option value={value}>{value} (atual)</option>}
      {segments.map((segment) => (
        <option key={segment.slug} value={segment.label}>
          {segment.label}
        </option>
      ))}
    </NativeSelect>
  )
}
