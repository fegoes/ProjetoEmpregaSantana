import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { formatBRL, plural } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

type Plan = NonNullable<ReturnType<typeof usePlans>['data']>[number]

function planFeatures(plan: Plan): string[] {
  const features: string[] = []
  if (plan.audience === 'empresa') {
    features.push(plan.max_active_vagas ? plural(plan.max_active_vagas, 'vaga ativa por vez', 'vagas ativas por vez') : 'Vagas ativas ilimitadas')
    features.push('Painel com as candidaturas recebidas')
  } else {
    features.push('Perfil público de serviços')
    features.push('Contato direto pelo WhatsApp')
  }
  if (plan.featured_placement) features.push('Destaque no topo das buscas')
  if (plan.cv_database_access) features.push('Acesso ao banco de currículos')
  return features
}

function PlanCard({ plan, highlighted }: { plan: Plan; highlighted: boolean }) {
  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border p-5',
        highlighted ? 'border-brand-ink bg-brand-ink text-white' : 'bg-card',
      )}
    >
      <div>
        <h3 className="font-display text-lg font-bold">{plan.name}</h3>
        <p className="mt-1 tabular-nums">
          {plan.price_cents === 0 ? (
            <span className="text-2xl font-bold">Grátis</span>
          ) : (
            <>
              <span className="text-2xl font-bold">{formatBRL(plan.price_cents / 100)}</span>
              <span className={highlighted ? 'text-white/75' : 'text-muted-foreground'}>/mês</span>
            </>
          )}
        </p>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {planFeatures(plan).map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className={cn('mt-0.5 size-4 shrink-0', highlighted ? 'text-brand-orange' : 'text-success-ink')} />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  )
}

function PlanSection({
  title,
  description,
  plans,
  cta,
}: {
  title: string
  description: string
  plans: Plan[]
  cta: { to: string; label: string }
}) {
  if (plans.length === 0) return null
  // O plano pago do meio (ou o único pago) recebe o tratamento de cartaz
  const paid = plans.filter((p) => p.price_cents > 0)
  const highlightedId = paid[Math.floor((paid.length - 1) / 2)]?.id

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">{description}</p>
        </div>
        <Button asChild variant="cta" className="self-start sm:self-auto">
          <Link to={cta.to}>{cta.label}</Link>
        </Button>
      </div>
      <div className={cn('grid gap-4', plans.length >= 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2')}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} highlighted={plan.id === highlightedId} />
        ))}
      </div>
    </section>
  )
}

export default function PlanosPage() {
  const { data: plans, isLoading, isError, refetch } = usePlans()

  useDocumentMeta({
    title: 'Planos',
    description: 'Planos para empresas e autônomos no EmpregaSantana: destaque nos resultados, mais vagas ativas e acesso ao banco de currículos.',
  })

  const empresaPlans = plans?.filter((p) => p.audience === 'empresa') ?? []
  const autonomoPlans = plans?.filter((p) => p.audience === 'autonomo') ?? []

  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">Planos para quem anuncia</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Procurar vaga e se candidatar é sempre grátis. Os planos são para empresas que publicam vagas e para autônomos
          que querem aparecer mais.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando planos…</p>}
      {isError && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>Não conseguimos carregar os planos.</span>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      <PlanSection
        title="Para empresas"
        description="Publique vagas e receba currículos de gente da região."
        plans={empresaPlans}
        cta={{ to: '/cadastro?perfil=empresa', label: 'Criar conta de empresa' }}
      />
      <PlanSection
        title="Para autônomos"
        description="Mostre seus serviços para quem precisa contratar."
        plans={autonomoPlans}
        cta={{ to: '/cadastro?perfil=autonomo', label: 'Criar perfil de autônomo' }}
      />
    </div>
  )
}
