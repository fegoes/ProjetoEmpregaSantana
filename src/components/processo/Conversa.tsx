import * as React from 'react'
import { Paperclip, SendHorizonal, X } from 'lucide-react'
import { Anexo } from '@/components/processo/Anexo'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { mensagemDeErro, useEnviarMensagem } from '@/hooks/useProcessos'
import { ANEXO_ACCEPT, formatarBytes, horarioDaMensagem, validarAnexo, type Etapa, type Mensagem, type Processo } from '@/lib/hiring'
import { cn } from '@/lib/utils'

interface ConversaProps {
  processo: Processo
  etapas: Etapa[]
  mensagens: Mensagem[]
  userId: string
  /** quem está logado fala pela empresa (pode marcar a mensagem como feedback da etapa) */
  ladoEmpresa: boolean
  /** superadmin acompanhando: lê a conversa, mas não escreve */
  somenteLeitura?: boolean
}

function nomeDoAutor(m: Mensagem, processo: Processo, userId: string) {
  if (m.autor_id === userId) return 'Você'
  return m.autor_id === processo.pessoa_id ? processo.pessoa_nome : processo.empresa_nome
}

function Mensagens({ processo, etapas, mensagens, userId }: Omit<ConversaProps, 'ladoEmpresa'>) {
  const ref = React.useRef<HTMLDivElement>(null)
  const titulos = React.useMemo(() => new Map(etapas.map((e) => [e.id, e.titulo])), [etapas])

  // vai para o fim quando chega mensagem nova
  React.useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [mensagens.length])

  return (
    <div ref={ref} role="log" aria-live="polite" aria-label="Mensagens do processo" className="flex max-h-[26rem] min-h-40 flex-col gap-3 overflow-y-auto py-1 lg:max-h-[30rem]">
      {mensagens.map((m) => {
        if (m.tipo === 'sistema') {
          return (
            <p key={m.id} className="px-2 text-center text-xs text-muted-foreground">
              {m.corpo} · {horarioDaMensagem(m.created_at)}
            </p>
          )
        }
        const minha = m.autor_id === userId
        const feedback = m.tipo === 'feedback'
        return (
          <div key={m.id} className={cn('flex flex-col gap-1', minha ? 'items-end' : 'items-start')}>
            <p className="px-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{nomeDoAutor(m, processo, userId)}</span> · {horarioDaMensagem(m.created_at)}
            </p>
            <div
              className={cn(
                'flex max-w-[88%] flex-col gap-2 rounded-2xl px-3.5 py-2.5 text-[15px]',
                feedback ? 'border-l-4 border-primary bg-primary/8' : minha ? 'bg-accent' : 'bg-secondary',
              )}
            >
              {feedback && (
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                  Feedback{m.etapa_id && titulos.get(m.etapa_id) ? ` · ${titulos.get(m.etapa_id)}` : ''}
                </p>
              )}
              {m.corpo && <p className="break-words whitespace-pre-wrap">{m.corpo}</p>}
              {m.anexo_path && <Anexo anexo={m} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Conversa do processo: mensagens, feedback por etapa e envio de documentos (como num chat). */
export function Conversa({ processo, etapas, mensagens, userId, ladoEmpresa, somenteLeitura = false }: ConversaProps) {
  const enviar = useEnviarMensagem(processo.id, userId)
  const inputArquivo = React.useRef<HTMLInputElement>(null)
  const [texto, setTexto] = React.useState('')
  const [arquivo, setArquivo] = React.useState<File | null>(null)
  const [comoFeedback, setComoFeedback] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)
  const encerrado = processo.status === 'encerrado'
  const outroLado = ladoEmpresa ? processo.pessoa_nome : processo.empresa_nome

  const escolherArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const escolhido = e.target.files?.[0]
    e.target.value = ''
    if (!escolhido) return
    const problema = validarAnexo(escolhido)
    setErro(problema)
    setArquivo(problema ? null : escolhido)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (enviar.isPending || (!texto.trim() && !arquivo)) return
    setErro(null)
    enviar.mutate(
      { corpo: texto, arquivo, tipo: ladoEmpresa && comoFeedback ? 'feedback' : 'mensagem' },
      {
        onSuccess: () => {
          setTexto('')
          setArquivo(null)
          setComoFeedback(false)
        },
        onError: (err) => setErro(mensagemDeErro(err, 'Não foi possível enviar agora. Confira a conexão e tente de novo.')),
      },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {mensagens.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Ainda não há mensagens. {encerrado ? '' : `Escreva para ${outroLado} ou envie um documento.`}
        </p>
      ) : (
        <Mensagens processo={processo} etapas={etapas} mensagens={mensagens} userId={userId} />
      )}

      {somenteLeitura ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Você está acompanhando como superadmin: só leitura.</p>
      ) : encerrado ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Este processo foi encerrado. A conversa ficou só para leitura.</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-2 border-t pt-4">
          <label htmlFor={`msg-${processo.id}`} className="sr-only">
            Mensagem para {outroLado}
          </label>
          <Textarea
            id={`msg-${processo.id}`}
            rows={3}
            maxLength={4000}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={`Escreva para ${outroLado}…`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e)
            }}
          />

          {arquivo && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
              <Paperclip aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium">{arquivo.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatarBytes(arquivo.size)}</span>
              <button
                type="button"
                aria-label="Tirar o arquivo escolhido"
                onClick={() => setArquivo(null)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {ladoEmpresa && (
            <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" className="size-4" checked={comoFeedback} onChange={(e) => setComoFeedback(e.target.checked)} />
              Enviar como feedback da etapa atual
            </label>
          )}

          {erro && (
            <p role="alert" className="text-sm text-destructive-ink">
              {erro}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <input ref={inputArquivo} type="file" accept={ANEXO_ACCEPT} className="sr-only" tabIndex={-1} aria-hidden onChange={escolherArquivo} />
            <Button type="button" variant="outline" onClick={() => inputArquivo.current?.click()}>
              <Paperclip /> Anexar documento
            </Button>
            <Button type="submit" disabled={enviar.isPending || (!texto.trim() && !arquivo)}>
              <SendHorizonal /> {enviar.isPending ? 'Enviando…' : 'Enviar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">PDF, imagem (JPG, PNG, WEBP) ou Word, até 10 MB. Só você e {outroLado} abrem os arquivos.</p>
        </form>
      )}
    </div>
  )
}
