import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function useAllPlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('plans').select('*').order('audience').order('sort_order')
      if (error) throw error
      return data
    },
  })
}

function useTogglePlanActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from('plans').update({ is_active: isActive }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })
}

export default function AdminPlanosPage() {
  const { data: plans, isLoading } = useAllPlans()
  const toggleActive = useTogglePlanActive()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Cadastro de Planos</h1>
        <p className="text-sm text-muted-foreground">
          Checkout/cobrança via Stripe é implementado na Fase 3 (docs/PRD.md seção 6). Por ora, os planos são dados de referência.
        </p>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <Badge variant="outline">{plan.audience}</Badge>
              </div>
              <CardDescription>
                {plan.price_cents === 0 ? 'Grátis' : `R$ ${(plan.price_cents / 100).toFixed(2)}/mês`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge variant={plan.is_active ? 'default' : 'outline'}>
                {plan.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleActive.mutate({ id: plan.id, isActive: !plan.is_active })}
              >
                {plan.is_active ? 'Desativar' : 'Ativar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
