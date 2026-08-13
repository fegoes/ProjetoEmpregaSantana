import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface PlaceholderPageProps {
  title: string
  phase: string
  description?: string
}

// Usado nas telas cujo desenho já está no PRD (docs/PRD.md) mas cuja
// implementação funcional pertence a uma fase posterior (ver seção 8).
export function PlaceholderPage({ title, phase, description }: PlaceholderPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{phase}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description ?? 'Esta tela está desenhada no PRD e será implementada em uma fase seguinte.'}
      </CardContent>
    </Card>
  )
}
