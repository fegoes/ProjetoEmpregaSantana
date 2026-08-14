import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'

function useAllAds() {
  return useQuery({
    queryKey: ['admin', 'ads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ads').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export default function AdminAdsPage() {
  const { data: ads, isLoading } = useAllAds()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Campo de ADS</h1>
        <p className="text-sm text-muted-foreground">
          Impulsionamento pago (self-serve, checkout Stripe avulso) é roadmap pós-Fase 3 — ver docs/PRD.md
          seção 6.4. Esta tela só lista/gerencia registros manuais por enquanto.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {ads?.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nenhum destaque ativo</CardTitle>
            <CardDescription>Registros de ADS aparecerão aqui quando criados.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {ads?.map((ad) => (
          <Card key={ad.id}>
            <CardContent className="flex items-center justify-between py-3">
              <span>
                {ad.subject_type} · {ad.placement ?? 'sem posição definida'}
              </span>
              <StatusBadge status={ad.status} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
