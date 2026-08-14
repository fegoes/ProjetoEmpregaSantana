import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function usePlans() {
  return useQuery({
    queryKey: ['plans', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('audience')
        .order('sort_order')
      if (error) throw error
      return data
    },
  })
}

export default function PlanosPage() {
  const { data: plans, isLoading } = usePlans()

  useDocumentMeta({
    title: 'Planos',
    description: 'Planos para empresas e autônomos no EmpregaSantana: destaque nos resultados, mais vagas ativas e acesso ao banco de currículos.',
  })

  const empresaPlans = plans?.filter((p) => p.audience === 'empresa') ?? []
  const autonomoPlans = plans?.filter((p) => p.audience === 'autonomo') ?? []

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Planos</h1>
        <p className="text-sm text-muted-foreground">
          Checkout via Stripe chega na Fase 3 — por enquanto esta é a vitrine de planos.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando planos…</p>}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Para empresas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {empresaPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.price_cents === 0 ? 'Grátis' : `R$ ${(plan.price_cents / 100).toFixed(2)}/mês`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>{plan.max_active_vagas ? `${plan.max_active_vagas} vagas ativas` : 'Vagas ilimitadas'}</span>
                {plan.featured_placement && <Badge variant="secondary">Destaque nos resultados</Badge>}
                {plan.cv_database_access && <Badge variant="secondary">Banco de currículos</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Para autônomos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {autonomoPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.price_cents === 0 ? 'Grátis' : `R$ ${(plan.price_cents / 100).toFixed(2)}/mês`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plan.featured_placement && <Badge variant="secondary">Destaque nos resultados</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
