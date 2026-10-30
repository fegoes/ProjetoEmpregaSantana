// Acompanhamento da contratação (processo seletivo).
//
// Uma candidatura vira um "processo": linha do tempo de etapas, conversa com
// feedback por etapa e documentos. A empresa também pode abrir um processo com
// um autônomo. O banco (migration 0024) guarda e protege tudo; aqui ficam os
// nomes, as etapas padrão, o andamento e a validação de arquivos.

import type { Database } from '@/types/database'

export type Processo = Database['public']['Tables']['processos']['Row']
export type Etapa = Database['public']['Tables']['processo_etapas']['Row']
export type Mensagem = Database['public']['Tables']['processo_mensagens']['Row']
export type EtapaTipo = Etapa['tipo']

export const ETAPAS_MIN = 2
export const ETAPAS_MAX = 12

// ---------------------------------------------------------------------------
// Etapas
// ---------------------------------------------------------------------------

export interface EtapaModelo {
  tipo: EtapaTipo
  titulo: string
  descricao: string
}

/** Tipos de etapa: a empresa escolhe um para cada etapa que cria; o tipo define o ícone e a leitura do andamento. */
export const ETAPA_TIPOS: { value: EtapaTipo; label: string }[] = [
  { value: 'recebida', label: 'Candidatura recebida' },
  { value: 'triagem', label: 'Análise do currículo' },
  { value: 'entrevista', label: 'Entrevista' },
  { value: 'documentos', label: 'Análise de documentos' },
  { value: 'aguardando', label: 'Aguardando posicionamento' },
  { value: 'conclusao', label: 'Contratação' },
  { value: 'outra', label: 'Outra etapa' },
]

/** Tipos que a empresa pode usar nas etapas do meio (a primeira e a última são fixas). */
export const ETAPA_TIPOS_DO_MEIO = ETAPA_TIPOS.filter((t) => t.value !== 'recebida' && t.value !== 'conclusao')

// O mesmo modelo existe em supabase/migrations/0024 (processo_modelo_padrao): vale quando a vaga não escolheu etapas.
export const MODELO_PADRAO: EtapaModelo[] = [
  { tipo: 'recebida', titulo: 'Candidatura recebida', descricao: 'A empresa recebeu seu currículo.' },
  { tipo: 'triagem', titulo: 'Análise do currículo', descricao: 'A empresa avalia seu currículo e decide quem segue.' },
  { tipo: 'entrevista', titulo: 'Entrevista', descricao: 'Conversa com a empresa para se conhecerem melhor.' },
  { tipo: 'documentos', titulo: 'Análise de documentos', descricao: 'Você envia os documentos pedidos e a empresa confere.' },
  { tipo: 'aguardando', titulo: 'Aguardando posicionamento', descricao: 'A empresa está decidindo e vai dar uma resposta.' },
  { tipo: 'conclusao', titulo: 'Contratação', descricao: 'Tudo certo: você foi contratado(a).' },
]

const TIPOS = new Set<string>(ETAPA_TIPOS.map((t) => t.value))

const texto = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

/** Lê as etapas guardadas na vaga. Devolve null quando não há modelo próprio ou ele não serve. */
export function lerModelo(raw: unknown): EtapaModelo[] | null {
  if (!Array.isArray(raw) || raw.length < ETAPAS_MIN || raw.length > ETAPAS_MAX) return null
  return raw.map((item, i) => {
    const r = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>
    return {
      tipo: (typeof r.tipo === 'string' && TIPOS.has(r.tipo) ? r.tipo : 'outra') as EtapaTipo,
      titulo: texto(r.titulo, 80) || `Etapa ${i + 1}`,
      descricao: texto(r.descricao, 300),
    }
  })
}

const mesmaEtapa = (a: EtapaModelo, b: EtapaModelo) => a.tipo === b.tipo && a.titulo === b.titulo && a.descricao === b.descricao

/** O que gravar na vaga: nada (nulo) quando as etapas são as padrão, para a vaga acompanhar o padrão. */
export function modeloParaSalvar(modelo: EtapaModelo[]): EtapaModelo[] | null {
  const igual = modelo.length === MODELO_PADRAO.length && modelo.every((e, i) => mesmaEtapa(e, MODELO_PADRAO[i]))
  return igual ? null : modelo.map((e) => ({ tipo: e.tipo, titulo: e.titulo.trim(), descricao: e.descricao.trim() }))
}

/** Aviso para o formulário da vaga; null quando as etapas estão boas. */
export function validarModelo(modelo: EtapaModelo[]): string | null {
  if (modelo.length < ETAPAS_MIN) return 'O processo precisa de pelo menos duas etapas.'
  if (modelo.length > ETAPAS_MAX) return `O processo pode ter no máximo ${ETAPAS_MAX} etapas.`
  if (modelo.some((e) => !e.titulo.trim())) return 'Dê um nome para cada etapa do processo.'
  return null
}

// ---------------------------------------------------------------------------
// Andamento
// ---------------------------------------------------------------------------

export function etapaAtual(etapas: Etapa[], processo: Pick<Processo, 'etapa_atual_id'>): Etapa | undefined {
  return etapas.find((e) => e.id === processo.etapa_atual_id)
}

export type TomAndamento = 'andamento' | 'sucesso' | 'encerrado'

/** Rótulo curto da situação do processo (para etiquetas e listas). */
export function rotuloStatus(processo: Pick<Processo, 'status' | 'motivo'>): string {
  if (processo.status === 'contratado') return 'Contratado(a)'
  if (processo.status === 'encerrado') return processo.motivo === 'desistencia' ? 'Desistiu' : 'Não seguiu'
  return 'Em andamento'
}

export function tomDoStatus(processo: Pick<Processo, 'status'>): TomAndamento {
  if (processo.status === 'contratado') return 'sucesso'
  if (processo.status === 'encerrado') return 'encerrado'
  return 'andamento'
}

/** "Etapa 3 de 6: Entrevista", "Contratado(a)", "Encerrado pela empresa"… */
export function resumoAndamento(processo: Processo, etapas: Etapa[]): string {
  if (processo.status === 'contratado') return 'Contratação concluída'
  if (processo.status === 'encerrado') return processo.motivo === 'desistencia' ? 'Você desistiu deste processo' : 'A empresa encerrou este processo'
  const atual = etapaAtual(etapas, processo)
  if (!atual) return 'Em andamento'
  return `Etapa ${atual.posicao} de ${etapas.length}: ${atual.titulo}`
}

/** Quanto do caminho já foi feito (0 a 100). */
export function progresso(processo: Pick<Processo, 'status'>, etapas: Etapa[]): number {
  if (etapas.length === 0) return 0
  if (processo.status === 'contratado') return 100
  const feitas = etapas.filter((e) => e.status === 'concluida' || e.status === 'pulada').length
  return Math.round((feitas / etapas.length) * 100)
}

/** Há mensagem ou mudança de etapa de outra pessoa que quem está logado ainda não viu. */
export function temNovidade(
  processo: Pick<Processo, 'ultima_atividade_em' | 'ultima_atividade_por'>,
  userId: string | undefined,
  lidaAte: string | undefined,
): boolean {
  if (!userId || !processo.ultima_atividade_por || processo.ultima_atividade_por === userId) return false
  return !lidaAte || processo.ultima_atividade_em > lidaAte
}

/** O outro lado da conversa, para o título da tela: a empresa vê a pessoa; a pessoa vê a empresa. */
export function contraparte(processo: Pick<Processo, 'pessoa_id' | 'pessoa_nome' | 'empresa_nome'>, userId: string | undefined): string {
  return processo.pessoa_id === userId ? processo.empresa_nome : processo.pessoa_nome
}

// ---------------------------------------------------------------------------
// Conversa e documentos
// ---------------------------------------------------------------------------

/** Feedbacks da empresa, agrupados pela etapa a que se referem. */
export function feedbackPorEtapa(mensagens: Mensagem[]): Map<string, Mensagem[]> {
  const mapa = new Map<string, Mensagem[]>()
  for (const m of mensagens) {
    if (m.tipo !== 'feedback' || !m.etapa_id) continue
    mapa.set(m.etapa_id, [...(mapa.get(m.etapa_id) ?? []), m])
  }
  return mapa
}

/** Todos os documentos enviados no processo, do mais recente para o mais antigo. */
export function documentosDoProcesso(mensagens: Mensagem[]): Mensagem[] {
  return mensagens.filter((m) => m.anexo_path).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

const dataHora = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const dia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

/** "14:32" no mesmo dia, "ontem 09:10" e "12 de nov., 14:32" para o resto. */
export function horarioDaMensagem(iso: string, agora: Date = new Date()): string {
  const d = new Date(iso)
  const inicio = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dias = Math.round((inicio(agora) - inicio(d)) / 86_400_000)
  if (dias === 0) return hora.format(d)
  if (dias === 1) return `ontem ${hora.format(d)}`
  return dataHora.format(d).replace('.', '')
}

export function dataCurta(iso: string): string {
  return dia.format(new Date(iso)).replace('.', '')
}

// ---------------------------------------------------------------------------
// Arquivos anexados
// ---------------------------------------------------------------------------

export const ANEXO_MAX_BYTES = 10 * 1024 * 1024

const TIPO_POR_EXTENSAO: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

const TIPOS_ACEITOS = new Set(Object.values(TIPO_POR_EXTENSAO))

export const ANEXO_ACCEPT = Object.keys(TIPO_POR_EXTENSAO)
  .map((ext) => `.${ext}`)
  .join(',')

interface ArquivoLike {
  name: string
  type: string
  size: number
}

/** Tipo do arquivo: o que o navegador informou, ou deduzido da extensão (alguns celulares não informam). */
export function tipoDoAnexo(file: Pick<ArquivoLike, 'name' | 'type'>): string | null {
  if (TIPOS_ACEITOS.has(file.type)) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return TIPO_POR_EXTENSAO[ext] ?? null
}

export const ehImagem = (tipo: string | null | undefined) => Boolean(tipo?.startsWith('image/'))

/** Mensagem para quem escolheu o arquivo; null quando pode enviar. */
export function validarAnexo(file: ArquivoLike): string | null {
  if (file.size === 0) return 'O arquivo está vazio.'
  if (!tipoDoAnexo(file)) return 'Envie um PDF, uma imagem (JPG, PNG ou WEBP) ou um documento do Word.'
  if (file.size > ANEXO_MAX_BYTES) return 'O arquivo deve ter até 10 MB.'
  return null
}

/** Nome para usar no caminho do arquivo: sem acento, espaço nem símbolo, mantendo a extensão. */
export function nomeSeguro(nome: string): string {
  const limpo = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
  const ponto = limpo.lastIndexOf('.')
  const base = ponto > 0 ? limpo.slice(0, ponto) : limpo
  const ext = ponto > 0 ? limpo.slice(ponto + 1) : ''
  const curto = base.slice(0, 60).replace(/-+$/, '') || 'arquivo'
  return ext ? `${curto}.${ext.slice(0, 5)}` : curto
}

/** Caminho no armazenamento: a primeira pasta é o processo (é o que o banco confere). */
export function caminhoDoAnexo(processoId: string, nome: string, sufixo: string): string {
  return `${processoId}/${sufixo}-${nomeSeguro(nome)}`
}

export function formatarBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}
