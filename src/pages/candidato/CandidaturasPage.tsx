import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
  const { data: cvs, isLoading: loadingCvs, isError: cvsError, refetch: refetchCvs } = useCvVariants(candidatoId)
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
      setSearchParams({ enviada: vagaId })
    },
  })

  React.useEffect(() => {
    const defaultCv = cvs?.find((cv) => cv.is_default) ?? cvs?.[0]
    if (defaultCv) setSelectedCv(defaultCv.id)
  }, [cvs])

  if (loadingCvs) return <p role="status">Carregando seus currículos…</p>
  if (cvsError) return <div role="alert"><p>Não foi possível carregar os currículos.</p><Button variant="outline" onClick={() => refetchCvs()}>Tentar novamente</Button></div>
  if (!cvs || cvs.length === 0) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-base">Candidatar-se a {vaga?.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Você precisa criar um currículo antes de se candidatar.
          <Button asChild className="mt-4"><Link to="/candidato/cv">Criar currículo</Link></Button>
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
          aria-label="Currículo para esta candidatura"
          value={selectedCv}
          onChange={(e) => setSelectedCv(e.target.value)}
        >
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.title}
            </option>
          ))}
        </select>
        {aplicar.isError && <p role="alert" className="text-sm text-destructive">Não foi possível enviar sua candidatura. Seus dados foram preservados; tente novamente.</p>}
        <Button variant="cta" onClick={() => aplicar.mutate()} disabled={aplicar.isPending || !selectedCv}>
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
  const { data: candidaturas, isLoading, isError, refetch } = useCandidaturas(user?.id)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Minhas candidaturas</h1>

      {vagaIdParaAplicar && user && (
        <AplicarForm vagaId={vagaIdParaAplicar} candidatoId={user.id} />
      )}

      {searchParams.get('enviada') && <p role="status" className="rounded-xl border bg-accent p-4 text-sm text-primary">Candidatura enviada. Acompanhe o retorno da empresa abaixo.</p>}
      {isError && <p role="alert" className="text-sm text-destructive">Não foi possível carregar as candidaturas. <button className="underline" onClick={() => refetch()}>Tentar novamente</button></p>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      <div className="flex flex-col gap-3">
        {candidaturas?.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <Link to={`/vagas/${c.vaga_id}`} className="font-medium text-primary hover:underline">{c.vagas?.title ?? 'Vaga indisponível'}</Link>
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
