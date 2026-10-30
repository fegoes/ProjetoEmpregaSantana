import { Link } from 'react-router-dom'
import { Hourglass } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'

interface ComingSoonPageProps {
  title: string
  description: string
  /** Para onde levar a pessoa enquanto a tela não existe */
  back?: { to: string; label: string }
}

// Telas já previstas no PRD (docs/PRD.md, seção 6) cuja parte funcional entra
// numa fase seguinte. Aparece para o usuário final, então o texto é dele.
export function PlaceholderPage({ title, description, back }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <EmptyState
        icon={Hourglass}
        title="Chega em breve"
        description={description}
        action={
          back ? (
            <Button asChild variant="outline">
              <Link to={back.to}>{back.label}</Link>
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
