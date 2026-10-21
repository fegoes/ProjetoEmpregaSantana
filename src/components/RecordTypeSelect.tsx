import { useRecordTypes } from '@/hooks/useRecordTypes'
import { taxonomyOptions } from '@/lib/taxonomies'
import type { TaxonomyKind } from '@/types/database'
import { cn } from '@/lib/utils'
export function RecordTypeSelect({ kind, value, onChange, id, required, className }: { kind: TaxonomyKind; value: string; onChange: (value: string) => void; id?: string; required?: boolean; className?: string }) {
  const query = useRecordTypes()
  const options = taxonomyOptions(query.data ?? [], kind, value)
  return <><select id={id} required={required} disabled={query.isLoading || query.isError} className={cn('min-h-11 w-full rounded-md border bg-card px-3 text-sm',className)} value={value} onChange={e => onChange(e.target.value)}><option value="">{query.isLoading ? 'Carregando tipos…' : 'Selecione um tipo'}</option>{options.map(item => <option key={item.slug} value={item.slug} disabled={item.is_active === false && item.slug !== value}>{item.label}{item.is_active === false ? ' (inativo)' : ''}</option>)}</select>{query.isError && <p role="alert" className="text-xs text-destructive">Não foi possível carregar os tipos. Recarregue a página e tente novamente.</p>}</>
}
