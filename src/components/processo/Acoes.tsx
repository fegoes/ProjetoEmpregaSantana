import * as React from 'react'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { mensagemDeErro, useAcaoProcesso, type AcaoProcesso } from '@/hooks/useProcessos'
import { etapaAtual, type Etapa, type Processo } from '@/lib/hiring'

/** Roda uma ação do processo, mostra o erro em português e limpa o campo de mensagem quando dá certo. */
function useExecutar(onOk: () => void) {
  const acao = useAcaoProcesso()
  const [erro, setErro] = React.useState<string | null>(null)
  const executar = (a: AcaoProcesso, confirmacao?: string) => {
    if (confirmacao && !window.confirm(confirmacao)) return
    setErro(null)
    acao.mutate(a, {
      onSuccess: onOk,
      onError: (e) => setErro(mensagemDeErro(e, 'Não foi possível concluir agora. Confira a conexão e tente de novo.')),
    })
  }
  return { executar, erro, ocupado: acao.isPending }
}

/** Controles da empresa: avançar etapa com feedback, mover, contratar, encerrar ou reabrir. */
export function AcoesEmpresa({ processo, etapas }: { processo: Processo; etapas: Etapa[] }) {
  const [mensagem, setMensagem] = React.useState('')
  const [destino, setDestino] = React.useState('')
  const { executar, erro, ocupado } = useExecutar(() => {
    setMensagem('')
    setDestino('')
  })
  const atual = etapaAtual(etapas, processo)
  const proxima = atual ? etapas.find((e) => e.posicao > atual.posicao) : undefined
  const outras = etapas.filter((e) => e.id !== processo.etapa_atual_id)
  const pessoa = processo.pessoa_nome

  if (processo.status === 'contratado') {
    return (
      <p className="flex items-start gap-2 text-sm text-muted-foreground">
        <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-success-ink" />
        Contratação concluída. A conversa e os documentos continuam abertos para o que faltar da admissão.
      </p>
    )
  }

  if (processo.status === 'encerrado') {
    return processo.motivo === 'reprovado' ? (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Você encerrou este processo. Mudou de ideia? Reabra e ele volta para a etapa em que parou.</p>
        {erro && (
          <p role="alert" className="text-sm text-destructive-ink">
            {erro}
          </p>
        )}
        <Button type="button" variant="outline" className="self-start" disabled={ocupado} onClick={() => executar({ tipo: 'reabrir', processoId: processo.id })}>
          <RotateCcw /> Reabrir processo
        </Button>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">{pessoa} desistiu deste processo.</p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`fb-${processo.id}`}>Feedback para {pessoa} (opcional)</Label>
        <Textarea
          id={`fb-${processo.id}`}
          rows={3}
          maxLength={4000}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Ex.: Gostamos do seu currículo. Vamos marcar a entrevista."
        />
        <p className="text-xs text-muted-foreground">Fica registrado na etapa atual e {pessoa} vê na conversa.</p>
      </div>

      {proxima && (
        <Button
          type="button"
          size="lg"
          disabled={ocupado}
          className="h-auto min-h-12 whitespace-normal py-2 text-center"
          onClick={() => executar({ tipo: 'avancar', processoId: processo.id, mensagem })}
        >
          Concluir etapa e avançar para “{proxima.titulo}”
        </Button>
      )}

      {outras.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`dest-${processo.id}`}>Ou ir direto para outra etapa</Label>
          <div className="flex gap-2">
            <NativeSelect id={`dest-${processo.id}`} value={destino} onChange={(e) => setDestino(e.target.value)}>
              <option value="">Escolha a etapa…</option>
              {outras.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.posicao}. {e.titulo}
                </option>
              ))}
            </NativeSelect>
            <Button
              type="button"
              variant="outline"
              disabled={ocupado || !destino}
              onClick={() => executar({ tipo: 'avancar', processoId: processo.id, etapaId: destino, mensagem })}
            >
              Mover
            </Button>
          </div>
        </div>
      )}

      {erro && (
        <p role="alert" className="text-sm text-destructive-ink">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="cta"
          disabled={ocupado}
          onClick={() => executar({ tipo: 'contratar', processoId: processo.id, mensagem }, `Marcar ${pessoa} como contratado(a)? O processo é concluído.`)}
        >
          Marcar como contratado(a)
        </Button>
        <Button
          type="button"
          variant="outline"
          className="text-destructive-ink"
          disabled={ocupado}
          onClick={() =>
            executar(
              { tipo: 'encerrar', processoId: processo.id, mensagem },
              `Encerrar o processo com ${pessoa} sem contratar? ${mensagem.trim() ? 'O feedback escrito acima será enviado.' : 'Dica: escreva um feedback acima, a pessoa vai ler.'}`,
            )
          }
        >
          Encerrar sem contratar
        </Button>
      </div>
    </div>
  )
}

/** Controle de quem é acompanhado (candidato ou autônomo): desistir do processo. */
export function AcoesPessoa({ processo }: { processo: Processo }) {
  const [aberto, setAberto] = React.useState(false)
  const [motivo, setMotivo] = React.useState('')
  const { executar, erro, ocupado } = useExecutar(() => {
    setAberto(false)
    setMotivo('')
  })

  if (processo.status !== 'em_andamento') return null

  if (!aberto) {
    return (
      <Button type="button" variant="ghost" size="sm" className="self-start text-destructive-ink" onClick={() => setAberto(true)}>
        Desistir do processo
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`desistir-${processo.id}`}>Quer contar o motivo? (opcional)</Label>
        <Textarea id={`desistir-${processo.id}`} rows={2} maxLength={4000} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </div>
      {erro && (
        <p role="alert" className="text-sm text-destructive-ink">
          {erro}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={ocupado}
          onClick={() => executar({ tipo: 'desistir', processoId: processo.id, mensagem: motivo }, 'Desistir deste processo? A empresa será avisada.')}
        >
          Confirmar desistência
        </Button>
        <Button type="button" variant="ghost" onClick={() => setAberto(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
