import { PlaceholderPage } from '@/pages/PlaceholderPage'

export default function AutonomoPlanoPage() {
  return (
    <PlaceholderPage
      title="Plano do autônomo"
      description="A contratação do plano Destaque pelo site está sendo preparada. Por enquanto, seu perfil usa o plano gratuito, e você pode ver os planos disponíveis na página Planos."
      back={{ to: '/planos', label: 'Ver os planos' }}
    />
  )
}
