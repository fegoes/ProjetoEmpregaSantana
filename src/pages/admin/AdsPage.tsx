import { useQuery } from '@tanstack/react-query'
import { Megaphone } from 'lucide-react'
import { AdminHeader, AdminList, AdminRow } from '@/components/admin/AdminKit'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { dataBR } from '@/lib/format'
import { supabase } from '@/lib/supabase'

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

/** Destaques pagos cadastrados na plataforma. */
export default function AdminAdsPage() {
  const { data: ads, isLoading } = useAllAds()

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="ADS"
        description="Os destaques pagos que aparecem no site. Por enquanto eles são cadastrados pela equipe: a compra de destaque pelo próprio site ainda não existe."
      />

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {ads?.length === 0 && <EmptyState icon={Megaphone} title="Nenhum destaque cadastrado" description="Quando houver destaques pagos, eles aparecem aqui." />}

      {ads && ads.length > 0 && (
        <AdminList>
          {ads.map((ad) => (
            <AdminRow
              key={ad.id}
              title={`${ad.subject_type} · ${ad.placement ?? 'sem posição definida'}`}
              badges={<StatusBadge status={ad.status} />}
              meta={ad.created_at ? `cadastrado em ${dataBR(ad.created_at)}` : undefined}
            />
          ))}
        </AdminList>
      )}
    </div>
  )
}
