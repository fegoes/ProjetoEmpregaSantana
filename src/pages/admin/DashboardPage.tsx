import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

function useAdminCounts() {
  return useQuery({
    queryKey: ['admin', 'counts'],
    queryFn: async () => {
      const [profiles, empresas, vagas, candidaturas] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('empresas').select('id', { count: 'exact', head: true }),
        supabase.from('vagas').select('id', { count: 'exact', head: true }),
        supabase.from('candidaturas').select('id', { count: 'exact', head: true }),
      ])
      return {
        usuarios: profiles.count ?? 0,
        empresas: empresas.count ?? 0,
        vagas: vagas.count ?? 0,
        candidaturas: candidaturas.count ?? 0,
      }
    },
  })
}

export default function AdminDashboardPage() {
  const { data: counts } = useAdminCounts()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Painel administrativo</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Usuários', value: counts?.usuarios },
          { label: 'Empresas', value: counts?.empresas },
          { label: 'Vagas', value: counts?.vagas },
          { label: 'Candidaturas', value: counts?.candidaturas },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl">{item.value ?? '—'}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
