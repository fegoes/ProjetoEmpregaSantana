import * as React from 'react'
import { Input } from '@/components/ui/input'
import { EmpresaCard } from '@/components/EmpresaCard'
import { useEmpresasDiretorio } from '@/hooks/useEmpresas'

export default function EmpresasDirectoryPage() {
  const [search, setSearch] = React.useState('')
  const { data: empresas, isLoading } = useEmpresasDiretorio(search)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Empresas cadastradas</h1>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome…"
          className="mt-3 max-w-md"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando empresas…</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {empresas?.map((empresa) => (
          <EmpresaCard key={empresa.id} empresa={empresa} />
        ))}
      </div>
      {empresas?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma empresa ativa cadastrada ainda.</p>
      )}
    </div>
  )
}
