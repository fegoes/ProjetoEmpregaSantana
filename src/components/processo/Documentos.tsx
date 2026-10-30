import { Anexo } from '@/components/processo/Anexo'
import { documentosDoProcesso, horarioDaMensagem, type Etapa, type Mensagem, type Processo } from '@/lib/hiring'

/** Todos os documentos enviados no processo, dos dois lados, num só lugar. */
export function Documentos({ processo, etapas, mensagens, userId }: { processo: Processo; etapas: Etapa[]; mensagens: Mensagem[]; userId: string }) {
  const docs = documentosDoProcesso(mensagens)
  const titulos = new Map(etapas.map((e) => [e.id, e.titulo]))

  if (docs.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum documento enviado ainda. Use “Anexar documento” na conversa para enviar.
      </p>
    )
  }

  return (
    <ul className="flex flex-col divide-y border-y">
      {docs.map((m) => (
        <li key={m.id} className="flex flex-col gap-2 py-3">
          <Anexo anexo={m} />
          <p className="text-xs text-muted-foreground">
            Enviado por {m.autor_id === userId ? 'você' : m.autor_id === processo.pessoa_id ? processo.pessoa_nome : processo.empresa_nome} ·{' '}
            {horarioDaMensagem(m.created_at)}
            {m.etapa_id && titulos.get(m.etapa_id) ? ` · etapa “${titulos.get(m.etapa_id)}”` : ''}
          </p>
        </li>
      ))}
    </ul>
  )
}
