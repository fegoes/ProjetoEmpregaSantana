import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useCvVariants } from '@/hooks/useCvVariants'
import { useVaga } from '@/hooks/useVagas'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

function useCandidaturas(candidatoId: string | undefined) {
  return useQuery({
    queryKey: ['candidaturas', 'by-candidato', candidatoId],
    enabled: Boolean(candidatoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidaturas')
        .select('*, vagas ( title, empresas ( nome_fantasia ) )')
        .eq('candidato_id', candidatoId as string)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

function AplicarForm({ vagaId, candidatoId }: { vagaId: string; candidatoId: string }) {
  const { data: vaga } = useVaga(vagaId)
  const { data: cvs } = useCvVariants(candidatoId)
  const [selectedCv, setSelectedCv] = React.useState<string>('')
  const queryClient = useQueryClient()
  const [, setSearchParams] = useSearchParams()

  const aplicar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('candidaturas')
        .upsert(
          { vaga_id: vagaId, candidato_id: candidatoId, cv_variant_id: selectedCv },
          { onConflict: 'vaga_id,candidato_id' },
        )
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidaturas', 'by-candidato', candidatoId] })
      setSearchParams({})
    },
  })

  React.useEffect(() => {
    const defaultCv = cvs?.find((cv) => cv.is_default) ?? cvs?.[0]
    if (defaultCv) setSelectedCv(defaultCv.id)
  }, [cvs])

  if (!cvs || cvs.length === 0) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-base">Candidatar-se a {vaga?.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Você precisa criar um currículo antes de se candidatar.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-base">Candidatar-se a {vaga?.title}</CardTitle>
        <CardDescription>Escolha qual currículo enviar</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={selectedCv}
          onChange={(e) => setSelectedCv(e.target.value)}
        >
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.title}
            </option>
          ))}
        </select>
        <Button onClick={() => aplicar.mutate()} disabled={aplicar.isPending || !selectedCv}>
          {aplicar.isPending ? 'Enviando…' : 'Enviar candidatura'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function CandidaturasPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const vagaIdParaAplicar = searchParams.get('aplicar')
  const { data: candidaturas, isLoading } = useCandidaturas(user?.id)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Minhas candidaturas</h1>

      {vagaIdParaAplicar && user && (
        <AplicarForm vagaId={vagaIdParaAplicar} candidatoId={user.id} />
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="flex flex-col gap-3">
        {candidaturas?.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{c.vagas?.title}</p>
                <p className="text-sm text-muted-foreground">{c.vagas?.empresas?.nome_fantasia}</p>
              </div>
              <StatusBadge status={c.status} />
            </CardContent>
          </Card>
        ))}
      </div>
      {candidaturas?.length === 0 && !vagaIdParaAplicar && (
        <p className="text-sm text-muted-foreground">Você ainda não se candidatou a nenhuma vaga.</p>
      )}
    </div>
  )
}
