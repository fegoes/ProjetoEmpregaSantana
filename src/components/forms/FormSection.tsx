import { useState, type ReactNode, type FormEvent } from 'react'
import { ChevronDown, UserRound, MapPin, BriefcaseBusiness, FileText, Image, Settings2, GraduationCap, Banknote, Tag, type LucideIcon } from 'lucide-react'
const iconFor = (title: string): LucideIcon => /foto|imagem|logo/i.test(title) ? Image : /endereço|local/i.test(title) ? MapPin : /formaç/i.test(title) ? GraduationCap : /experi|empresa/i.test(title) ? BriefcaseBusiness : /contat|ident|conta/i.test(title) ? UserRound : /remunera|valor|salário/i.test(title) ? Banknote : /class|interesse/i.test(title) ? Tag : /texto|resumo|conteúdo/i.test(title) ? FileText : Settings2
export function FormSection({ title, description, defaultOpen = false, children }: { title: string; description?: ReactNode; defaultOpen?: boolean; children: ReactNode }) {
 const Icon = iconFor(title)
 const [error, setError] = useState(false)
 const reveal = (event: FormEvent<HTMLDetailsElement>) => {
   event.preventDefault()
   let element = event.target as HTMLElement | null
   while (element) { if (element instanceof HTMLDetailsElement) element.open = true; element = element.parentElement }
   setError(true)
   requestAnimationFrame(() => (event.target as HTMLElement).focus())
 }
 return <details open={defaultOpen || undefined} className="group min-w-0 rounded-xl border bg-card" onInvalidCapture={reveal} onChangeCapture={() => setError(false)}>
  <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden"><Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /><span className="flex-1">{title}</span><ChevronDown className="size-4 text-muted-foreground group-open:rotate-180" aria-hidden="true" /></summary>
  <div className="min-w-0 space-y-4 border-t px-4 py-5">{description && <div className="text-sm text-muted-foreground">{description}</div>}{error && <p role="alert" className="text-sm text-destructive">Preencha ou corrija os campos desta seção.</p>}{children}</div>
 </details>
}
