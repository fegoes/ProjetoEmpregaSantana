import * as React from 'react'
import { Building2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EmpresaCard } from '@/components/EmpresaCard'
import { EmptyState } from '@/components/EmptyState'
import { ShowMoreGrid } from '@/components/ShowMoreGrid'
import { useEmpresasDiretorio } from '@/hooks/useEmpresas'

export default function EmpresasDirectoryPage() {
  const [search, setSearch] = React.useState('')
  const { data: empresas, isLoading } = useEmpresasDiretorio(search)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Empresas cadastradas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Conheça quem está contratando na plataforma.</p>
        <div className="relative mt-4 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome…"
            className="h-10 rounded-full pl-10"
          />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando empresas…</p>}

      {empresas && empresas.length > 0 && (
        <ShowMoreGrid
          key={search}
          items={empresas}
          keyExtractor={(empresa) => empresa.id}
          renderItem={(empresa) => <EmpresaCard empresa={empresa} />}
        />
      )}
      {empresas?.length === 0 && !isLoading && (
        <EmptyState
          icon={Building2}
          title="Nenhuma empresa encontrada"
          description="Ajuste sua busca ou volte mais tarde — novas empresas aparecem aqui assim que se cadastram."
        />
      )}
    </div>
  )
}
