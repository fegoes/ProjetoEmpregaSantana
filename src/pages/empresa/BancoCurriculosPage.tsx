import { PlaceholderPage } from '@/pages/PlaceholderPage'

export default function BancoCurriculosPage() {
  return (
    <PlaceholderPage
      title="Banco de currículos"
      description="Aqui você vai buscar currículos de candidatos que escolheram aparecer para empresas. Esse recurso será do plano Empresa Business."
      back={{ to: '/empresa/vagas', label: 'Ver minhas vagas' }}
    />
  )
}
