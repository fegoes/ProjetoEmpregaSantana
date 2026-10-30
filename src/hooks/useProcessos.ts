import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  caminhoDoAnexo,
  tipoDoAnexo,
  validarAnexo,
  type Etapa,
  type Mensagem,
  type Processo,
} from '@/lib/hiring'

const KEY = ['processos'] as const
const BUCKET = 'processo-docs'
/** Quanto tempo o link de um documento vale depois de aberto (o arquivo em si nunca fica público). */
const URL_SEGUNDOS = 120
/** A conversa se atualiza sozinha enquanto a tela está aberta. */
const ATUALIZA_A_CADA_MS = 8000

export type ProcessoComEtapas = Processo & { etapas: Etapa[] }

export type ProcessoFiltro =
  | { tipo: 'todos' }
  | { tipo: 'pessoa'; userId: string; origem?: Processo['origem'] }
  | { tipo: 'empresa'; empresaId: string; vagaId?: string }

async function etapasDe(ids: string[]): Promise<Etapa[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase.from('processo_etapas').select('*').in('processo_id', ids).order('posicao')
  if (error) throw error
  return data
}

/** Processos de quem está logado (candidato ou autônomo) ou de uma empresa (todos, ou de uma vaga), com as etapas. */
export function useProcessos(filtro: ProcessoFiltro | undefined) {
  return useQuery({
    queryKey: [...KEY, 'lista', filtro],
    enabled: Boolean(filtro),
    retry: false,
    queryFn: async (): Promise<ProcessoComEtapas[]> => {
      let query = supabase.from('processos').select('*').order('ultima_atividade_em', { ascending: false })
      if (filtro?.tipo === 'pessoa') {
        query = query.eq('pessoa_id', filtro.userId)
        if (filtro.origem) query = query.eq('origem', filtro.origem)
      } else if (filtro?.tipo === 'empresa') {
        query = query.eq('empresa_id', filtro.empresaId)
        if (filtro.vagaId) query = query.eq('vaga_id', filtro.vagaId)
      }
      const { data, error } = await query
      if (error) throw error
      const etapas = await etapasDe(data.map((p) => p.id))
      return data.map((p) => ({ ...p, etapas: etapas.filter((e) => e.processo_id === p.id) }))
    },
  })
}

/** Um processo com as etapas. Devolve nulo se não existe ou se a pessoa não participa dele. */
export function useProcesso(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, 'detalhe', id],
    enabled: Boolean(id),
    refetchInterval: ATUALIZA_A_CADA_MS,
    queryFn: async (): Promise<ProcessoComEtapas | null> => {
      const { data, error } = await supabase.from('processos').select('*').eq('id', id as string).maybeSingle()
      if (error) throw error
      if (!data) return null
      return { ...data, etapas: await etapasDe([data.id]) }
    },
  })
}

export function useMensagens(processoId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, 'mensagens', processoId],
    enabled: Boolean(processoId),
    refetchInterval: ATUALIZA_A_CADA_MS,
    queryFn: async (): Promise<Mensagem[]> => {
      const { data, error } = await supabase
        .from('processo_mensagens')
        .select('*')
        .eq('processo_id', processoId as string)
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}

/** Até quando cada processo foi lido por quem está logado (para destacar o que é novo). */
export function useLeituras(userId: string | undefined) {
  return useQuery({
    queryKey: [...KEY, 'leituras', userId],
    enabled: Boolean(userId),
    retry: false,
    queryFn: async (): Promise<Map<string, string>> => {
      const { data, error } = await supabase.from('processo_leituras').select('processo_id, lida_ate').eq('user_id', userId as string)
      if (error) throw error
      return new Map(data.map((l) => [l.processo_id, l.lida_ate]))
    },
  })
}

/** Erros que a pessoa pode ler: os avisos em português das funções do banco e os de validação de arquivo. */
export class ErroAmigavel extends Error {}

export function mensagemDeErro(error: unknown, padrao: string): string {
  if (error instanceof ErroAmigavel) return error.message
  const message = typeof error === 'object' && error && 'message' in error ? String((error as { message: unknown }).message) : ''
  // as funções do banco respondem em português, com frase completa
  if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^_]*\.$/.test(message) && !/violates|policy|permission/i.test(message)) return message
  return padrao
}

// ---------------------------------------------------------------------------
// Escrita
// ---------------------------------------------------------------------------

function sufixoUnico(): string {
  return globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10)
}

interface NovaMensagem {
  corpo: string
  arquivo?: File | null
  /** "feedback" só vale para a empresa (o banco confere) */
  tipo?: 'mensagem' | 'feedback'
}

export function useEnviarMensagem(processoId: string, userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ corpo, arquivo, tipo = 'mensagem' }: NovaMensagem) => {
      if (!userId) throw new ErroAmigavel('Entre na sua conta para enviar mensagens.')
      const texto = corpo.trim()
      if (!texto && !arquivo) throw new ErroAmigavel('Escreva uma mensagem ou escolha um arquivo.')

      let anexo: { anexo_path: string; anexo_nome: string; anexo_tipo: string; anexo_tamanho: number } | undefined
      if (arquivo) {
        const problema = validarAnexo(arquivo)
        if (problema) throw new ErroAmigavel(problema)
        const contentType = tipoDoAnexo(arquivo) as string
        const caminho = caminhoDoAnexo(processoId, arquivo.name, sufixoUnico())
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(caminho, arquivo, { contentType, cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError
        anexo = { anexo_path: caminho, anexo_nome: arquivo.name.slice(0, 200), anexo_tipo: contentType, anexo_tamanho: arquivo.size }
      }

      const { error } = await supabase
        .from('processo_mensagens')
        .insert({ processo_id: processoId, autor_id: userId, tipo, corpo: texto || null, ...anexo })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export type AcaoProcesso =
  | { tipo: 'avancar'; processoId: string; etapaId?: string | null; mensagem?: string }
  | { tipo: 'contratar'; processoId: string; mensagem?: string }
  | { tipo: 'encerrar'; processoId: string; mensagem?: string }
  | { tipo: 'reabrir'; processoId: string }
  | { tipo: 'desistir'; processoId: string; mensagem?: string }

/** As mudanças de etapa e de situação passam sempre pelas funções do banco (que conferem quem pode). */
export function useAcaoProcesso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (acao: AcaoProcesso) => {
      const mensagem = 'mensagem' in acao ? acao.mensagem?.trim() || null : null
      const resposta = await (async () => {
        switch (acao.tipo) {
          case 'avancar':
            return supabase.rpc('processo_avancar', { p_processo: acao.processoId, p_etapa: acao.etapaId ?? null, p_mensagem: mensagem })
          case 'contratar':
            return supabase.rpc('processo_contratar', { p_processo: acao.processoId, p_mensagem: mensagem })
          case 'encerrar':
            return supabase.rpc('processo_encerrar', { p_processo: acao.processoId, p_mensagem: mensagem })
          case 'reabrir':
            return supabase.rpc('processo_reabrir', { p_processo: acao.processoId })
          case 'desistir':
            return supabase.rpc('processo_desistir', { p_processo: acao.processoId, p_mensagem: mensagem })
        }
      })()
      if (resposta.error) throw resposta.error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
      void queryClient.invalidateQueries({ queryKey: ['candidaturas'] })
    },
  })
}

/** Empresa abre um processo com um autônomo; se já existe um em andamento, devolve esse. */
export function useIniciarContratacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ empresaId, autonomoId, mensagem }: { empresaId: string; autonomoId: string; mensagem?: string }) => {
      const { data, error } = await supabase.rpc('processo_iniciar_contratacao', {
        p_empresa: empresaId,
        p_autonomo: autonomoId,
        p_mensagem: mensagem?.trim() || null,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useMarcarLido(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (processoId: string) => {
      const { error } = await supabase.rpc('processo_marcar_lido', { p_processo: processoId })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...KEY, 'leituras', userId] })
    },
  })
}

/** Link temporário para abrir um documento (o bucket é privado: só quem participa do processo consegue). */
export async function urlDoDocumento(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, URL_SEGUNDOS)
  if (error || !data?.signedUrl) throw new ErroAmigavel('Não foi possível abrir o documento agora. Tente de novo.')
  return data.signedUrl
}

/** Abre o documento numa aba nova, usando um link temporário (o arquivo nunca fica público). */
export function useAbrirDocumento() {
  const [abrindo, setAbrindo] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  const abrir = async (path: string) => {
    setErro(null)
    setAbrindo(true)
    // a aba é aberta já no clique (antes da espera), senão o navegador bloqueia
    const aba = window.open('', '_blank')
    try {
      const url = await urlDoDocumento(path)
      if (aba) aba.location.href = url
      else window.location.assign(url)
    } catch (e) {
      aba?.close()
      setErro(e instanceof ErroAmigavel ? e.message : 'Não foi possível abrir o documento.')
    } finally {
      setAbrindo(false)
    }
  }
  return { abrir, abrindo, erro }
}
