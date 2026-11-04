import { useState, type ReactNode } from 'react'
import { ImagePlus, Type, BriefcaseBusiness, GraduationCap, Settings2, ChevronRight } from 'lucide-react'
import { AdminModal } from '@/components/admin/AdminModal'
import { Button } from '@/components/ui/button'
const icons = { image: ImagePlus, text: Type, work: BriefcaseBusiness, education: GraduationCap, settings: Settings2 }
/** Pequeno resumo na tela; edição focada em um modal. O estado pertence ao formulário. */
export function FieldDialog({ label, summary, kind = 'settings', busy = false, disabled = false, defaultOpen = false, children }: { label: string; summary?: string; kind?: keyof typeof icons; busy?: boolean; disabled?: boolean; defaultOpen?: boolean; children: ReactNode }) {
 const [open, setOpen] = useState(defaultOpen)
 const Icon = icons[kind]
 return <div className="min-w-0">
  <button type="button" disabled={disabled || busy} onClick={() => setOpen(true)} aria-label={`Editar ${label}`} aria-haspopup="dialog" className="flex min-h-14 w-full items-center gap-3 rounded-lg border bg-card p-3 text-left hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
   <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span><span className="block truncate text-xs text-muted-foreground">{summary || 'Adicionar informações'}</span></span><ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
  </button>
  <AdminModal open={open} onClose={() => setOpen(false)} busy={busy} title={label} description="Preencha e conclua.">
   <div className="space-y-5">{children}<div className="sticky bottom-0 border-t bg-card pt-4"><Button type="button" disabled={busy} onClick={() => setOpen(false)}>{busy ? 'Aguarde…' : 'Concluir'}</Button></div></div>
  </AdminModal>
 </div>
}
