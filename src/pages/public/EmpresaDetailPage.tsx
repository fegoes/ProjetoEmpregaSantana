import { useParams } from 'react-router-dom'
import { useEmpresa } from '@/hooks/useEmpresas'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { VagaCard } from '@/components/VagaCard'
import { Badge } from '@/components/ui/badge'

export default function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: empresa, isLoading } = useEmpresa(id)

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando empresa…</p>
  if (!empresa) return <p className="text-sm text-muted-foreground">Empresa não encontrada.</p>

  const vagasPublicadas = (empresa.vagas ?? []).filter((v) => v.status === 'published')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{empresa.nome_fantasia}</h1>
          {empresa.is_verified && <Badge>Verificada</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">
          {empresa.sector} · {[empresa.city, empresa.state].filter(Boolean).join(' — ')}
        </p>
      </div>

      <RichTextRenderer html={empresa.description_html} />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Vagas abertas ({vagasPublicadas.length})</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vagasPublicadas.map((vaga) => (
            <VagaCard
              key={vaga.id}
              vaga={{
                ...vaga,
                empresas: { nome_fantasia: empresa.nome_fantasia, city: empresa.city, state: empresa.state },
              }}
            />
          ))}
        </div>
        {vagasPublicadas.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma vaga aberta no momento.</p>
        )}
      </div>
    </div>
  )
}
