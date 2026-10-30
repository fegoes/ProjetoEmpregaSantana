import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AdminHeader, AdminList, AdminRow, Tag } from '@/components/admin/AdminKit'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { formatBRL } from '@/lib/format'

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      void queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

const PUBLICO = { empresa: 'Empresas', autonomo: 'Autônomos' } as const

/** Planos que aparecem na página Planos. Ativar mostra no site; desativar esconde. */
export default function AdminPlanosPage() {
  const { data: plans, isLoading } = useAllPlans()
  const toggleActive = useTogglePlanActive()

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Planos"
        description="Os planos que empresas e autônomos veem na página Planos. A cobrança online ainda não está ligada: por enquanto o plano serve de vitrine, e quem escolhe um fala com a equipe."
      />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {(['empresa', 'autonomo'] as const).map((publico) => {
        const doPublico = (plans ?? []).filter((p) => p.audience === publico)
        if (doPublico.length === 0) return null
        return (
          <section key={publico} className="flex flex-col gap-3" aria-label={`Planos para ${PUBLICO[publico]}`}>
            <h2 className="font-display text-sm font-bold tracking-wide text-muted-foreground uppercase">Para {PUBLICO[publico]}</h2>
            <AdminList>
              {doPublico.map((plan) => (
                <AdminRow
                  key={plan.id}
                  title={plan.name}
                  badges={<Tag tone={plan.is_active ? 'green' : 'neutral'}>{plan.is_active ? 'Ativo' : 'Inativo'}</Tag>}
                  subtitle={plan.price_cents === 0 ? 'Grátis' : `${formatBRL(plan.price_cents / 100)} por mês`}
                  actions={
                    <Button size="sm" variant="outline" disabled={toggleActive.isPending} onClick={() => toggleActive.mutate({ id: plan.id, isActive: !plan.is_active })}>
                      {plan.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                  }
                />
              ))}
            </AdminList>
          </section>
        )
      })}
    </div>
  )
}
