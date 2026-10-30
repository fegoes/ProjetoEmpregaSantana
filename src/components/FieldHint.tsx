import { cn } from '@/lib/utils'

// Campo em branco é o que deixa currículo e perfil com cara de formulário
// genérico: a pessoa não sabe o que escrever e escreve pouco, e aí o card fica
// vazio. A dica diz o que entra ali e mostra um exemplo real da região.
export function FieldHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm leading-snug text-muted-foreground', className)}>{children}</p>
}
