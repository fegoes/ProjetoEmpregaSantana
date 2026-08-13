import { PlaceholderPage } from '@/pages/PlaceholderPage'

export default function BancoCurriculosPage() {
  return (
    <PlaceholderPage
      title="Banco de currículos"
      phase="Fase 3 do roadmap (docs/PRD.md seção 6)"
      description='Gated pelo plano "cv_database_access". Buscará cv_variants com is_public=true via função dedicada, respeitando RLS.'
    />
  )
}
