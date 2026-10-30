import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileQuestion } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AcoesEmpresa, AcoesPessoa } from '@/components/processo/Acoes'
import { Conversa } from '@/components/processo/Conversa'
import { Documentos } from '@/components/processo/Documentos'
import { EtapasTimeline } from '@/components/processo/EtapasTimeline'
import { NovidadeTag, ProcessoBadge } from '@/components/processo/ProcessoBadge'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { useLeituras, useMarcarLido, useMensagens, useProcesso } from '@/hooks/useProcessos'
import { documentosDoProcesso, feedbackPorEtapa, temNovidade } from '@/lib/hiring'
import { cn } from '@/lib/utils'

type Aba = 'andamento' | 'conversa' | 'documentos'

interface ProcessoPageProps {
  /** para onde o "voltar" leva, conforme o painel em que a pessoa está */
  back: { to: string; label: string }
  /** superadmin: vê tudo, não escreve nem muda etapa */
  somenteLeitura?: boolean
}

/**
 * Celular: três abas (Andamento, Conversa, Documentos). Computador: o andamento fica sempre à esquerda e a
 * barra com duas abas (Conversa, Documentos) fica na coluna da direita.
 */
function Abas({ aba, onChange, documentos, computador }: { aba: Aba; onChange: (aba: Aba) => void; documentos: number; computador?: boolean }) {
  const opcoes: { valor: Aba; rotulo: string }[] = [
    ...(computador ? [] : [{ valor: 'andamento' as const, rotulo: 'Andamento' }]),
    { valor: 'conversa', rotulo: 'Conversa' },
    { valor: 'documentos', rotulo: 'Documentos' },
  ]
  // no computador "Conversa" vale também quando nenhuma outra foi escolhida
  const ativa = (valor: Aba) => (computador ? valor === (aba === 'documentos' ? 'documentos' : 'conversa') : aba === valor)
  return (
    <div role="group" aria-label="Ver" className="inline-flex w-full rounded-full bg-secondary p-1 sm:w-auto">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={ativa(o.valor)}
          onClick={() => onChange(o.valor)}
          className={cn(
            'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold whitespace-nowrap transition-colors sm:flex-none sm:px-4',
            ativa(o.valor) ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.rotulo}
          {o.valor === 'documentos' && documentos > 0 && <span className="text-xs text-muted-foreground tabular-nums">{documentos}</span>}
        </button>
      ))}
    </div>
  )
}

/** Tela do acompanhamento, igual para os dois lados: andamento por etapas, conversa e documentos. */
export default function ProcessoPage({ back, somenteLeitura = false }: ProcessoPageProps) {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: processo, isLoading, isError } = useProcesso(id)
  const { data: mensagens = [] } = useMensagens(processo ? id : undefined)
  const { data: leituras } = useLeituras(user?.id)
  const marcarLido = useMarcarLido(user?.id)
  const [aba, setAba] = React.useState<Aba>('andamento')

  useDocumentMeta({ title: processo ? `Acompanhamento: ${processo.titulo}` : 'Acompanhamento' })

  const ultima = processo?.ultima_atividade_em
  const processoId = processo?.id
  const marcar = marcarLido.mutate
  // abrir a tela conta como ler: some o aviso de novidade
  React.useEffect(() => {
    if (processoId && ultima && !somenteLeitura) marcar(processoId)
  }, [processoId, ultima, marcar, somenteLeitura])

  const feedbacks = React.useMemo(() => feedbackPorEtapa(mensagens), [mensagens])
  const documentos = React.useMemo(() => documentosDoProcesso(mensagens).length, [mensagens])

  const voltar = (
    <Link to={back.to} className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline md:min-h-9">
      <ArrowLeft className="size-4" /> {back.label}
    </Link>
  )

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>
  if (isError || !processo || !user) {
    return (
      <div className="flex flex-col gap-4">
        {voltar}
        <EmptyState
          icon={FileQuestion}
          title="Não encontramos este acompanhamento"
          description="Ele pode ter sido apagado, ou pertence a outra conta."
          action={
            <Button asChild variant="outline">
              <Link to={back.to}>{back.label}</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const ladoEmpresa = processo.pessoa_id !== user.id
  const novidade = !somenteLeitura && temNovidade(processo, user.id, leituras?.get(processo.id))
  const doAutonomo = processo.origem === 'autonomo'
  const direita: Aba = aba === 'andamento' ? 'conversa' : aba

  return (
    <div className="flex flex-col gap-6">
      {voltar}

      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">{doAutonomo ? 'Contratação de serviço' : 'Processo seletivo'}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">{ladoEmpresa || somenteLeitura ? processo.pessoa_nome : processo.titulo}</h1>
          <ProcessoBadge processo={processo} />
          {novidade && <NovidadeTag />}
        </div>
        <p className="text-sm text-muted-foreground">
          {somenteLeitura ? `${processo.empresa_nome} · ${processo.titulo}` : ladoEmpresa ? (doAutonomo ? 'Profissional autônomo' : `Vaga: ${processo.titulo}`) : processo.empresa_nome}
          {' · '}
          {!somenteLeitura && ladoEmpresa && !doAutonomo && processo.vaga_id && (
            <Link to={`/empresa/vagas/${processo.vaga_id}/candidatos`} className="font-medium text-primary hover:underline">
              Ver currículo
            </Link>
          )}
          {!somenteLeitura && ladoEmpresa && doAutonomo && (
            <Link to={`/autonomos/${processo.pessoa_id}`} className="font-medium text-primary hover:underline">
              Ver perfil público
            </Link>
          )}
          {(!ladoEmpresa || somenteLeitura) && processo.vaga_id && (
            <Link to={`/vagas/${processo.vaga_id}`} className="font-medium text-primary hover:underline">
              Ver a vaga
            </Link>
          )}
        </p>
      </header>

      <div className="lg:hidden">
        <Abas aba={aba} onChange={setAba} documentos={documentos} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
        <section aria-label="Andamento" className={cn('flex flex-col gap-8', aba !== 'andamento' && 'hidden lg:flex')}>
          <EtapasTimeline processo={processo} etapas={processo.etapas} feedbacks={feedbacks} />
          <div className="flex flex-col gap-3 border-t pt-6">
            <h2 className="font-display text-base font-bold">{somenteLeitura ? 'Acompanhamento' : ladoEmpresa ? 'O que fazer agora' : 'Sua participação'}</h2>
            {somenteLeitura ? (
              <p className="text-sm text-muted-foreground">Você está vendo este processo como superadmin. A empresa e a pessoa conduzem as etapas; aqui é só leitura.</p>
            ) : ladoEmpresa ? (
              <AcoesEmpresa processo={processo} etapas={processo.etapas} />
            ) : (
              <AcoesPessoa processo={processo} />
            )}
            {!somenteLeitura && !ladoEmpresa && processo.status === 'em_andamento' && (
              <p className="text-sm text-muted-foreground">Converse com a empresa e envie os documentos que ela pedir na aba Conversa.</p>
            )}
          </div>
        </section>

        <section aria-label={direita === 'conversa' ? 'Conversa' : 'Documentos'} className={cn('flex flex-col gap-4', aba === 'andamento' && 'hidden lg:flex')}>
          <div className="hidden lg:block">
            <Abas computador aba={aba} onChange={setAba} documentos={documentos} />
          </div>
          {direita === 'conversa' ? (
            <Conversa processo={processo} etapas={processo.etapas} mensagens={mensagens} userId={user.id} ladoEmpresa={ladoEmpresa} somenteLeitura={somenteLeitura} />
          ) : (
            <Documentos processo={processo} etapas={processo.etapas} mensagens={mensagens} userId={user.id} />
          )}
        </section>
      </div>
    </div>
  )
}
