import { PlaceholderPage } from '@/pages/PlaceholderPage'

export default function EmpresaPlanoPage() {
  return (
    <PlaceholderPage
      title="Plano da empresa"
      description="A contratação dos planos pelo site está sendo preparada. Por enquanto, sua empresa usa o plano gratuito, e você pode ver os planos disponíveis na página Planos."
      back={{ to: '/planos', label: 'Ver os planos' }}
    />
  )
}
