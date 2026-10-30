import { describe, expect, it } from 'vitest'
import {
  ANEXO_MAX_BYTES,
  MODELO_PADRAO,
  caminhoDoAnexo,
  contraparte,
  documentosDoProcesso,
  ehImagem,
  feedbackPorEtapa,
  formatarBytes,
  horarioDaMensagem,
  lerModelo,
  modeloParaSalvar,
  nomeSeguro,
  progresso,
  resumoAndamento,
  rotuloStatus,
  temNovidade,
  tipoDoAnexo,
  validarAnexo,
  validarModelo,
  type Etapa,
  type Mensagem,
  type Processo,
} from '@/lib/hiring'

const processo = (patch: Partial<Processo> = {}): Processo => ({
  id: 'p1',
  origem: 'candidatura',
  empresa_id: 'e1',
  pessoa_id: 'u1',
  candidatura_id: 'c1',
  vaga_id: 'v1',
  titulo: 'Operador de caixa',
  empresa_nome: 'Mercado Bom Preço',
  pessoa_nome: 'Ana',
  status: 'em_andamento',
  motivo: null,
  etapa_atual_id: 'e2',
  ultima_atividade_em: '2026-11-10T12:00:00Z',
  ultima_atividade_por: 'u2',
  concluido_em: null,
  created_at: '2026-11-01T12:00:00Z',
  updated_at: '2026-11-10T12:00:00Z',
  ...patch,
})

const etapa = (posicao: number, status: Etapa['status'], tipo: Etapa['tipo'] = 'outra'): Etapa => ({
  id: `e${posicao}`,
  processo_id: 'p1',
  posicao,
  tipo,
  titulo: `Etapa ${posicao}`,
  descricao: null,
  status,
  iniciada_em: null,
  concluida_em: null,
})

const msg = (patch: Partial<Mensagem>): Mensagem => ({
  id: 'm',
  processo_id: 'p1',
  etapa_id: null,
  autor_id: 'u2',
  tipo: 'mensagem',
  corpo: 'oi',
  anexo_path: null,
  anexo_nome: null,
  anexo_tipo: null,
  anexo_tamanho: null,
  created_at: '2026-11-10T12:00:00Z',
  ...patch,
})

describe('modelo de etapas', () => {
  it('o padrão tem primeira "recebida" e última "conclusao"', () => {
    expect(MODELO_PADRAO[0].tipo).toBe('recebida')
    expect(MODELO_PADRAO.at(-1)?.tipo).toBe('conclusao')
    expect(MODELO_PADRAO.length).toBeGreaterThanOrEqual(2)
  })

  it('lê o modelo da vaga e corrige o que vier errado', () => {
    const lido = lerModelo([
      { tipo: 'recebida', titulo: ' Recebida ', descricao: 'Chegou' },
      { tipo: 'inventado', titulo: '   ' },
      { tipo: 'conclusao', titulo: 'Contratação', descricao: 42 },
    ])
    expect(lido).toEqual([
      { tipo: 'recebida', titulo: 'Recebida', descricao: 'Chegou' },
      { tipo: 'outra', titulo: 'Etapa 2', descricao: '' },
      { tipo: 'conclusao', titulo: 'Contratação', descricao: '' },
    ])
  })

  it('sem modelo próprio ou com modelo inválido, devolve nulo (vale o padrão)', () => {
    expect(lerModelo(null)).toBeNull()
    expect(lerModelo({ a: 1 })).toBeNull()
    expect(lerModelo([{ tipo: 'recebida', titulo: 'x' }])).toBeNull()
    expect(lerModelo(Array.from({ length: 13 }, () => ({ tipo: 'outra', titulo: 'x' })))).toBeNull()
  })

  it('não grava na vaga o que for igual ao padrão', () => {
    expect(modeloParaSalvar(MODELO_PADRAO.map((e) => ({ ...e })))).toBeNull()
    const alterado = MODELO_PADRAO.map((e) => ({ ...e }))
    alterado[2] = { ...alterado[2], titulo: 'Entrevista com o gerente' }
    expect(modeloParaSalvar(alterado)?.[2].titulo).toBe('Entrevista com o gerente')
    expect(modeloParaSalvar(MODELO_PADRAO.slice(0, 3))).toHaveLength(3)
  })

  it('valida quantidade e nomes', () => {
    expect(validarModelo(MODELO_PADRAO)).toBeNull()
    expect(validarModelo(MODELO_PADRAO.slice(0, 1))).toMatch(/duas etapas/)
    expect(validarModelo([...MODELO_PADRAO.slice(0, 2), { tipo: 'outra', titulo: '  ', descricao: '' }])).toMatch(/nome/)
    expect(validarModelo(Array.from({ length: 13 }, () => MODELO_PADRAO[1]))).toMatch(/no máximo/)
  })
})

describe('andamento', () => {
  const etapas = [etapa(1, 'concluida'), etapa(2, 'atual'), etapa(3, 'pendente'), etapa(4, 'pendente')]

  it('descreve a etapa atual', () => {
    expect(resumoAndamento(processo(), etapas)).toBe('Etapa 2 de 4: Etapa 2')
  })

  it('descreve processo contratado e encerrado', () => {
    expect(resumoAndamento(processo({ status: 'contratado' }), etapas)).toBe('Contratação concluída')
    expect(resumoAndamento(processo({ status: 'encerrado', motivo: 'reprovado' }), etapas)).toMatch(/empresa encerrou/)
    expect(resumoAndamento(processo({ status: 'encerrado', motivo: 'desistencia' }), etapas)).toMatch(/desistiu/)
  })

  it('rótulos de situação', () => {
    expect(rotuloStatus(processo())).toBe('Em andamento')
    expect(rotuloStatus(processo({ status: 'contratado' }))).toBe('Contratado(a)')
    expect(rotuloStatus(processo({ status: 'encerrado', motivo: 'reprovado' }))).toBe('Não seguiu')
    expect(rotuloStatus(processo({ status: 'encerrado', motivo: 'desistencia' }))).toBe('Desistiu')
  })

  it('progresso conta etapas concluídas e puladas', () => {
    expect(progresso(processo(), etapas)).toBe(25)
    expect(progresso(processo(), [etapa(1, 'concluida'), etapa(2, 'pulada'), etapa(3, 'atual'), etapa(4, 'pendente')])).toBe(50)
    expect(progresso(processo({ status: 'contratado' }), etapas)).toBe(100)
    expect(progresso(processo(), [])).toBe(0)
  })
})

describe('novidades', () => {
  it('é novidade quando a última atividade é de outra pessoa e depois da última leitura', () => {
    expect(temNovidade(processo(), 'u1', undefined)).toBe(true)
    expect(temNovidade(processo(), 'u1', '2026-11-10T11:00:00Z')).toBe(true)
    expect(temNovidade(processo(), 'u1', '2026-11-10T13:00:00Z')).toBe(false)
  })

  it('o que a própria pessoa fez não conta', () => {
    expect(temNovidade(processo({ ultima_atividade_por: 'u1' }), 'u1', undefined)).toBe(false)
  })

  it('sem autor da atividade ou sem login, não há novidade', () => {
    expect(temNovidade(processo({ ultima_atividade_por: null }), 'u1', undefined)).toBe(false)
    expect(temNovidade(processo(), undefined, undefined)).toBe(false)
  })

  it('cada lado vê o nome do outro', () => {
    expect(contraparte(processo(), 'u1')).toBe('Mercado Bom Preço')
    expect(contraparte(processo(), 'u2')).toBe('Ana')
  })
})

describe('conversa e documentos', () => {
  it('agrupa feedbacks por etapa e ignora o resto', () => {
    const mapa = feedbackPorEtapa([
      msg({ id: '1', tipo: 'feedback', etapa_id: 'e1', corpo: 'ótimo' }),
      msg({ id: '2', tipo: 'mensagem', etapa_id: 'e1' }),
      msg({ id: '3', tipo: 'feedback', etapa_id: 'e1', corpo: 'segue' }),
      msg({ id: '4', tipo: 'feedback', etapa_id: null }),
      msg({ id: '5', tipo: 'sistema', etapa_id: 'e2' }),
    ])
    expect([...mapa.keys()]).toEqual(['e1'])
    expect(mapa.get('e1')?.map((m) => m.id)).toEqual(['1', '3'])
  })

  it('lista documentos do mais novo para o mais antigo', () => {
    const docs = documentosDoProcesso([
      msg({ id: 'a', anexo_path: 'p/a.pdf', created_at: '2026-11-01T10:00:00Z' }),
      msg({ id: 'b' }),
      msg({ id: 'c', anexo_path: 'p/c.pdf', created_at: '2026-11-03T10:00:00Z' }),
    ])
    expect(docs.map((m) => m.id)).toEqual(['c', 'a'])
  })

  it('horário: hoje só a hora, ontem com "ontem", antes com a data', () => {
    const agora = new Date(2026, 10, 10, 15, 0)
    expect(horarioDaMensagem(new Date(2026, 10, 10, 9, 5).toISOString(), agora)).toBe('09:05')
    expect(horarioDaMensagem(new Date(2026, 10, 9, 23, 30).toISOString(), agora)).toBe('ontem 23:30')
    expect(horarioDaMensagem(new Date(2026, 10, 2, 8, 0).toISOString(), agora)).toMatch(/^02 de nov/)
  })
})

describe('anexos', () => {
  const arquivo = (name: string, type: string, size = 1000) => ({ name, type, size })

  it('aceita PDF, imagem e Word', () => {
    expect(validarAnexo(arquivo('rg.pdf', 'application/pdf'))).toBeNull()
    expect(validarAnexo(arquivo('foto.jpg', 'image/jpeg'))).toBeNull()
    expect(validarAnexo(arquivo('curriculo.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))).toBeNull()
  })

  it('celular que não informa o tipo vale pela extensão', () => {
    expect(tipoDoAnexo(arquivo('RG.PDF', ''))).toBe('application/pdf')
    expect(validarAnexo(arquivo('foto.JPEG', ''))).toBeNull()
  })

  it('recusa tipo não aceito, vazio e grande demais', () => {
    expect(validarAnexo(arquivo('virus.exe', 'application/x-msdownload'))).toMatch(/PDF/)
    expect(validarAnexo(arquivo('pagina.html', 'text/html'))).toMatch(/PDF/)
    expect(validarAnexo(arquivo('x.svg', 'image/svg+xml'))).toMatch(/PDF/)
    expect(validarAnexo(arquivo('vazio.pdf', 'application/pdf', 0))).toMatch(/vazio/)
    expect(validarAnexo(arquivo('grande.pdf', 'application/pdf', ANEXO_MAX_BYTES + 1))).toMatch(/10 MB/)
    expect(validarAnexo(arquivo('limite.pdf', 'application/pdf', ANEXO_MAX_BYTES))).toBeNull()
  })

  it('nome seguro tira acento, espaço e símbolo e mantém a extensão', () => {
    expect(nomeSeguro('Carteira de Trabalho (frente).PDF')).toBe('carteira-de-trabalho-frente.pdf')
    expect(nomeSeguro('Declaração – João.png')).toBe('declaracao-joao.png')
    expect(nomeSeguro('../../etc/passwd')).toBe('etc-passwd')
    expect(nomeSeguro('???')).toBe('arquivo')
    expect(nomeSeguro('a'.repeat(200) + '.pdf').length).toBeLessThanOrEqual(66)
  })

  it('o caminho começa pela pasta do processo', () => {
    const caminho = caminhoDoAnexo('11111111-2222-3333-4444-555555555555', 'RG frente.pdf', 'abc123')
    expect(caminho).toBe('11111111-2222-3333-4444-555555555555/abc123-rg-frente.pdf')
    expect(caminho.split('/')[0]).toBe('11111111-2222-3333-4444-555555555555')
  })

  it('tamanho legível e detecção de imagem', () => {
    expect(formatarBytes(512)).toBe('512 B')
    expect(formatarBytes(2048)).toBe('2 KB')
    expect(formatarBytes(3.5 * 1024 * 1024)).toBe('3,5 MB')
    expect(formatarBytes(null)).toBe('')
    expect(ehImagem('image/png')).toBe(true)
    expect(ehImagem('application/pdf')).toBe(false)
    expect(ehImagem(null)).toBe(false)
  })
})
