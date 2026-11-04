import { FormSection } from '@/components/forms/FormSection'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/RichTextEditor'

export type AdminField = { key: string; label: string; type?: 'text'|'email'|'password'|'number'|'url'|'datetime-local'|'select'|'checkbox'|'rich'; required?: boolean; disabled?: boolean; min?: number; maxLength?: number; hint?: string; options?: { value: string; label: string }[] }
export type AdminValues = Record<string, string | boolean>
export function AdminFields({ fields, values, set }: { fields: AdminField[]; values: AdminValues; set: (key: string, value: string | boolean) => void }) {
  const renderFields = (items: AdminField[]) => <div className="grid min-w-0 gap-5 sm:grid-cols-2">{items.map(field => <div className={field.type === 'rich' ? 'min-w-0 space-y-2 sm:col-span-2' : 'min-w-0 space-y-2'} key={field.key}>
    {field.type === 'checkbox' ? <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(values[field.key])} onChange={e => set(field.key,e.target.checked)} />{field.label}</label> : <>
      <Label htmlFor={`admin-${field.key}`}>{field.label}{field.required ? ' *' : ''}</Label>
      {field.type === 'select' ? <select id={`admin-${field.key}`} disabled={field.disabled} required={field.required} value={String(values[field.key] ?? '')} onChange={e => set(field.key,e.target.value)} className="min-h-11 w-full rounded-md border bg-card px-3 text-sm"><option value="">Selecione…</option>{field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        : field.type === 'rich' ? <RichTextEditor ariaLabel={field.label} value={String(values[field.key] ?? '')} onChange={value => set(field.key,value)} />
        : <Input id={`admin-${field.key}`} type={field.type ?? 'text'} required={field.required} disabled={field.disabled} maxLength={field.maxLength ?? 250} min={field.min} step={field.type === 'number' ? '0.01' : undefined} autoComplete={field.type === 'password' ? 'new-password' : undefined} value={String(values[field.key] ?? '')} onChange={e => set(field.key,e.target.value)} />}
    </>}{field.hint && <p className="text-xs leading-relaxed text-muted-foreground">{field.hint}</p>}
  </div>)}</div>
  const essential = fields.filter(field => field.required || ['role','status','is_active','title','name','full_name','email'].includes(field.key))
  const optional = fields.filter(field => !essential.includes(field))
  return <div className="space-y-4">{renderFields(essential)}{optional.length > 0 && <FormSection title="Informações adicionais">{renderFields(optional)}</FormSection>}</div>
}
