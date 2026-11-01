import { describe, expect, it } from 'vitest'
import {
  BLOCK_TYPES,
  collectIssues,
  layoutExcerpt,
  SECTION_TEMPLATES,
  cloneWithNewIds,
  defaultBackground,
  firstHeadingId,
  headingOutline,
  homeStarterLayout,
  isValidSlug,
  layoutFromHtml,
  linkProblem,
  moveItem,
  newBlock,
  normalizeLayout,
  pagePath,
  parseLayout,
  readabilityWarning,
  resolveLink,
  safeImageUrl,
  sectionTone,
  slugify,
  starterLayout,
  type ContentSection,
  type LinkValue,
  type PageLayout,
} from '@/lib/pageLayout'

const link = (patch: Partial<LinkValue>): LinkValue => ({ mode: 'url', value: '', message: '', newTab: false, ...patch })

function allIds(layout: PageLayout): string[] {
  const ids: string[] = []
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk)
    else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        if (k === 'id' && typeof v === 'string') ids.push(v)
        else walk(v)
      }
    }
  }
  walk(layout)
  return ids
}

describe('resolveLink', () => {
  it('aceita caminho do site', () => {
    expect(resolveLink(link({ mode: 'page', value: '/explorar' }))).toEqual({ href: '/explorar', internal: true, newTab: false })
    expect(resolveLink(link({ mode: 'page', value: '/cadastro?perfil=empresa' }))?.href).toBe('/cadastro?perfil=empresa')
  })

  it('recusa caminhos que saem do site', () => {
    expect(resolveLink(link({ mode: 'page', value: '//outro.com' }))).toBeNull()
    expect(resolveLink(link({ mode: 'page', value: 'https://outro.com' }))).toBeNull()
    expect(resolveLink(link({ mode: 'url', value: '//outro.com' }))).toBeNull()
  })

  it('aceita endereço da internet e completa o https', () => {
    expect(resolveLink(link({ value: 'https://exemplo.com.br/a?b=1', newTab: true }))).toEqual({
      href: 'https://exemplo.com.br/a?b=1',
      internal: false,
      newTab: true,
    })
    expect(resolveLink(link({ value: 'www.exemplo.com.br' }))?.href).toBe('https://www.exemplo.com.br/')
  })

  it('recusa esquemas perigosos', () => {
    expect(resolveLink(link({ value: 'javascript:alert(1)' }))).toBeNull()
    expect(resolveLink(link({ value: 'JaVaScRiPt:alert(1)' }))).toBeNull()
    expect(resolveLink(link({ value: 'data:text/html,<b>oi</b>' }))).toBeNull()
    expect(resolveLink(link({ value: 'vbscript:x' }))).toBeNull()
  })

  it('monta o link do WhatsApp com DDI e mensagem', () => {
    expect(resolveLink(link({ mode: 'whatsapp', value: '(82) 99999-1234', message: 'Olá, vi o site' }))).toEqual({
      href: 'https://wa.me/5582999991234?text=Ol%C3%A1%2C%20vi%20o%20site',
      internal: false,
      newTab: true,
    })
    expect(resolveLink(link({ mode: 'whatsapp', value: '5582999991234' }))?.href).toBe('https://wa.me/5582999991234')
    expect(resolveLink(link({ mode: 'whatsapp', value: '12345' }))).toBeNull()
  })

  it('monta o link de telefone', () => {
    expect(resolveLink(link({ mode: 'phone', value: '(82) 3621-0000' }))?.href).toBe('tel:+558236210000')
  })

  it('sem destino não há link', () => {
    expect(resolveLink(link({ mode: 'none', value: '/x' }))).toBeNull()
    expect(resolveLink(link({ mode: 'page', value: '  ' }))).toBeNull()
    expect(resolveLink(undefined)).toBeNull()
  })
})

describe('linkProblem', () => {
  it('avisa quando o destino falta ou não funciona', () => {
    expect(linkProblem(link({ mode: 'none' }))).toMatch(/Escolha/)
    expect(linkProblem(link({ mode: 'url', value: '' }))).toMatch(/Falta/)
    expect(linkProblem(link({ mode: 'url', value: 'javascript:x' }))).toMatch(/não funciona/)
    expect(linkProblem(link({ mode: 'whatsapp', value: '123' }))).toMatch(/DDD/)
    expect(linkProblem(link({ mode: 'page', value: '/sobre' }))).toBeNull()
  })
})

describe('safeImageUrl', () => {
  it('só deixa passar endereços http(s) e caminhos do site', () => {
    expect(safeImageUrl('https://x.supabase.co/a.jpg?v=1')).toBe('https://x.supabase.co/a.jpg?v=1')
    expect(safeImageUrl('/imagens/a.jpg')).toBe('/imagens/a.jpg')
    expect(safeImageUrl('javascript:alert(1)')).toBe('')
    expect(safeImageUrl('data:image/svg+xml,<svg onload=alert(1)>')).toBe('')
    expect(safeImageUrl('//outro.com/a.jpg')).toBe('')
    expect(safeImageUrl(42)).toBe('')
  })
})

describe('normalizeLayout', () => {
  it('JSON que não é um desenho vira vazio', () => {
    expect(parseLayout(null)).toBeNull()
    expect(parseLayout('texto')).toBeNull()
    expect(parseLayout({ sections: 'x' })).toBeNull()
    expect(normalizeLayout(undefined).sections).toEqual([])
  })

  it('descarta seção e bloco de tipo desconhecido', () => {
    const layout = normalizeLayout({
      sections: [
        { type: 'nada', id: 'a' },
        { type: 'section', id: 'b', blocks: [{ type: 'video', id: 'x' }, { type: 'feed', id: 'y' }, null, 3] },
      ],
    })
    expect(layout.sections).toHaveLength(1)
    const section = layout.sections[0] as ContentSection
    expect(section.blocks.map((b) => b.type)).toEqual(['feed'])
  })

  it('troca valores fora da lista pelos padrões', () => {
    const layout = normalizeLayout({
      sections: [
        {
          type: 'section',
          style: { span: 'enorme', paddingY: 'xxl', align: 'direita', background: { color: 'rosa', overlayOpacity: 999, imageUrl: 'javascript:x' } },
          blocks: [{ type: 'heading', size: 'gigante' }],
        },
      ],
    })
    const s = layout.sections[0] as ContentSection
    expect(s.style.span).toBe('page')
    expect(s.style.paddingY).toBe('md')
    expect(s.style.align).toBe('left')
    expect(s.style.background.color).toBe('none')
    expect(s.style.background.overlayOpacity).toBe(90)
    expect(s.style.background.imageUrl).toBe('')
    expect(s.blocks[0]).toMatchObject({ type: 'heading', size: 'lg' })
  })

  it('limita a opacidade entre 0 e 90', () => {
    const make = (n: unknown) =>
      (normalizeLayout({ sections: [{ type: 'section', style: { background: { overlayOpacity: n } } }] }).sections[0] as ContentSection).style
        .background.overlayOpacity
    expect(make(-20)).toBe(0)
    expect(make(47.6)).toBe(48)
    expect(make('muito')).toBe(55)
  })

  it('gera identificadores quando faltam ou se repetem', () => {
    const layout = normalizeLayout({
      sections: [
        { type: 'section', id: 'dup', blocks: [{ type: 'feed', id: 'dup' }, { type: 'feed' }] },
        { type: 'section', id: 'dup', blocks: [] },
      ],
    })
    const ids = allIds(layout)
    expect(ids).toHaveLength(4)
    expect(new Set(ids).size).toBe(4)
  })

  it('limita quantidades', () => {
    const buttons = Array.from({ length: 9 }, (_, i) => ({ id: `b${i}`, label: 'x' }))
    const layout = normalizeLayout({
      sections: [{ type: 'section', blocks: [{ type: 'buttons', items: buttons }] }],
    })
    const block = (layout.sections[0] as ContentSection).blocks[0]
    expect(block.type === 'buttons' && block.items).toHaveLength(4)
  })

  it('slides: força o tipo das telas e mantém o carrossel', () => {
    const layout = normalizeLayout({
      sections: [{ type: 'slides', autoplay: true, interval: 12, slides: [{ blocks: [{ type: 'feed' }] }, { type: 'slides' }] }],
    })
    const s = layout.sections[0]
    expect(s.type).toBe('slides')
    if (s.type === 'slides') {
      expect(s.autoplay).toBe(true)
      expect(s.interval).toBe(12)
      expect(s.slides).toHaveLength(2)
      expect(s.slides.every((slide) => slide.type === 'section')).toBe(true)
    }
  })

  it('o que a normalização devolve já é estável', () => {
    const once = normalizeLayout(homeStarterLayout())
    expect(normalizeLayout(once)).toEqual(once)
  })
})

describe('modelos de seção', () => {
  it('todo modelo gera uma seção válida, com identificadores únicos', () => {
    for (const template of SECTION_TEMPLATES) {
      const section = template.build()
      const layout: PageLayout = { version: 1, sections: [section] }
      const normalized = normalizeLayout(layout)
      expect(normalized.sections).toHaveLength(1)
      expect(normalized, template.key).toEqual(layout)
      const ids = allIds(layout)
      expect(new Set(ids).size, template.key).toBe(ids.length)
    }
  })

  it('os modelos de slide ocupam a largura da tela', () => {
    for (const key of ['slide-centro', 'slide-texto-imagem', 'slide-icones']) {
      const section = SECTION_TEMPLATES.find((t) => t.key === key)!.build()
      const first = section.type === 'slides' ? section.slides[0] : section
      expect(first.style.span, key).toBe('screen')
    }
  })

  it('todo tipo de bloco tem criação padrão', () => {
    for (const { type } of BLOCK_TYPES) {
      expect(newBlock(type).type).toBe(type)
    }
  })

  it('página nova e página antiga convertida têm um título e um texto', () => {
    const start = starterLayout('Contato')
    const section = start.sections[0] as ContentSection
    expect(section.blocks.map((b) => b.type)).toEqual(['heading', 'text'])
    expect(section.blocks[0]).toMatchObject({ title: 'Contato' })

    const legacy = layoutFromHtml('Sobre', '<p>Conteúdo antigo</p>')
    const text = (legacy.sections[0] as ContentSection).blocks[1]
    expect(text.type === 'text' && text.html).toBe('<p>Conteúdo antigo</p>')
  })

  it('a página inicial de partida tem busca e lista de vagas', () => {
    const types = homeStarterLayout().sections.flatMap((s) => (s.type === 'section' ? s.blocks.map((b) => b.type) : []))
    expect(types).toContain('search')
    expect(types).toContain('feed')
  })
})

describe('tom do texto', () => {
  it('fundo escuro pede texto claro, fundo claro pede texto escuro', () => {
    const bg = defaultBackground()
    expect(sectionTone({ ...bg, color: 'none' })).toBe('dark')
    expect(sectionTone({ ...bg, color: 'soft' })).toBe('dark')
    expect(sectionTone({ ...bg, color: 'ink' })).toBe('light')
    expect(sectionTone({ ...bg, color: 'blue' })).toBe('light')
  })

  it('com imagem, a cor da cobertura decide', () => {
    const bg = { ...defaultBackground(), imageUrl: 'https://x/a.jpg' }
    expect(sectionTone({ ...bg, overlay: 'ink' })).toBe('light')
    expect(sectionTone({ ...bg, overlay: 'black' })).toBe('light')
    expect(sectionTone({ ...bg, overlay: 'white' })).toBe('dark')
  })

  it('avisa quando a cobertura é fraca demais', () => {
    const bg = { ...defaultBackground(), imageUrl: 'https://x/a.jpg' }
    expect(readabilityWarning({ ...bg, overlayOpacity: 10 })).toMatch(/difícil de ler/)
    expect(readabilityWarning({ ...bg, overlayOpacity: 50 })).toBeNull()
    expect(readabilityWarning({ ...defaultBackground(), overlayOpacity: 0 })).toBeNull()
  })
})

describe('endereços das páginas', () => {
  it('páginas do sistema têm endereço fixo; as outras ficam em /pagina/', () => {
    expect(pagePath('inicio', true)).toBe('/')
    expect(pagePath('sobre', true)).toBe('/sobre')
    expect(pagePath('contato', false)).toBe('/pagina/contato')
  })

  it('slugify tira acento, espaço e símbolo', () => {
    expect(slugify('Fale Conosco!')).toBe('fale-conosco')
    expect(slugify('  Informações & Dúvidas  ')).toBe('informacoes-duvidas')
    expect(slugify('---')).toBe('')
    expect(slugify('a'.repeat(100))).toHaveLength(60)
  })

  it('valida o formato do endereço', () => {
    expect(isValidSlug('fale-conosco')).toBe(true)
    expect(isValidSlug('Fale')).toBe(false)
    expect(isValidSlug('a--b')).toBe(false)
    expect(isValidSlug('')).toBe(false)
  })
})

describe('operações de lista', () => {
  it('moveItem troca de lugar e respeita as pontas', () => {
    expect(moveItem([1, 2, 3], 0, 1)).toEqual([2, 1, 3])
    expect(moveItem([1, 2, 3], 2, -1)).toEqual([1, 3, 2])
    const same = [1, 2, 3]
    expect(moveItem(same, 0, -1)).toBe(same)
    expect(moveItem(same, 2, 1)).toBe(same)
  })

  it('cloneWithNewIds copia tudo com identificadores novos', () => {
    const original = homeStarterLayout().sections[0]
    const copy = cloneWithNewIds(original)
    const a = allIds({ version: 1, sections: [original] })
    const b = allIds({ version: 1, sections: [copy] })
    expect(b).toHaveLength(a.length)
    expect(b.some((id) => a.includes(id))).toBe(false)
    expect({ ...copy, id: '', blocks: [] }).toEqual({ ...original, id: '', blocks: [] })
  })
})

describe('firstHeadingId', () => {
  it('acha o primeiro título com texto, inclusive no primeiro slide', () => {
    const layout = normalizeLayout({
      sections: [
        { type: 'section', id: 's1', blocks: [{ type: 'heading', id: 'vazio', title: '  ' }, { type: 'text', id: 't' }] },
        { type: 'slides', id: 's2', slides: [{ id: 'sl', blocks: [{ type: 'heading', id: 'h-slide', title: 'Olá' }] }] },
      ],
    })
    expect(firstHeadingId(layout)).toBe('h-slide')
  })

  it('devolve null quando não há título', () => {
    expect(firstHeadingId({ version: 1, sections: [] })).toBeNull()
  })
})

describe('collectIssues', () => {
  it('uma página bem montada não tem avisos', () => {
    expect(collectIssues(homeStarterLayout())).toEqual([])
  })

  it('avisa de seção vazia, botão sem destino, imagem sem descrição e cobertura fraca', () => {
    const layout = normalizeLayout({
      sections: [
        { type: 'section', blocks: [] },
        {
          type: 'section',
          style: { background: { imageUrl: 'https://x/a.jpg', overlayOpacity: 10 } },
          blocks: [
            { type: 'buttons', items: [{ label: 'Saiba mais', link: { mode: 'none' } }, { label: '', link: { mode: 'none' } }] },
            { type: 'image', imageUrl: 'https://x/b.jpg', alt: '' },
          ],
        },
      ],
    })
    const issues = collectIssues(layout)
    expect(issues.some((i) => i.startsWith('Seção 1') && i.includes('vazia'))).toBe(true)
    expect(issues.some((i) => i.includes('"Saiba mais"') && i.includes('Escolha'))).toBe(true)
    expect(issues.some((i) => i.includes('sem descrição'))).toBe(true)
    expect(issues.some((i) => i.includes('cobertura'))).toBe(true)
    // botão sem texto não gera aviso
    expect(issues.filter((i) => i.includes('não aparece. '))).toHaveLength(1)
  })

  it('indica o slide', () => {
    const layout = normalizeLayout({ sections: [{ type: 'slides', slides: [{ blocks: [{ type: 'feed' }] }, { blocks: [] }] }] })
    expect(collectIssues(layout)).toEqual(['Seção 1, slide 2: está vazia e não aparece no site.'])
  })
})

describe('layoutExcerpt', () => {
  it('usa a primeira frase de apoio ou texto', () => {
    const layout = normalizeLayout({
      sections: [{ type: 'section', blocks: [{ type: 'heading', title: 'Oi', subtitle: 'Frase de apoio' }, { type: 'text', html: '<p>Outro</p>' }] }],
    })
    expect(layoutExcerpt(layout)).toBe('Frase de apoio')
    expect(layoutExcerpt({ version: 1, sections: [] })).toBe('')
  })

  it('corta textos longos', () => {
    const layout = normalizeLayout({ sections: [{ type: 'section', blocks: [{ type: 'text', html: `<p>${'a'.repeat(300)}</p>` }] }] })
    expect(layoutExcerpt(layout, 50)).toHaveLength(50)
  })
})

describe('headingOutline', () => {
  const page = (blocks: unknown[]) => normalizeLayout({ sections: [{ type: 'section', blocks }] })

  it('subtítulo do texto sobe para h2 quando só existe o h1 antes', () => {
    const layout = page([
      { type: 'heading', id: 'h', title: 'Sobre' },
      { type: 'text', id: 't', html: '<h3>O que fazemos</h3><p>x</p>' },
    ])
    expect(headingOutline(layout)).toEqual({ h1: 'h', text: { t: 'h2' }, items: {} })
  })

  it('depois de um título h2, o subtítulo fica h3', () => {
    const layout = page([
      { type: 'heading', id: 'h1', title: 'Principal' },
      { type: 'heading', id: 'h2', title: 'Seção' },
      { type: 'text', id: 't', html: '<h3>Sub</h3>' },
    ])
    expect(headingOutline(layout).text).toEqual({ t: 'h3' })
  })

  it('textos sem subtítulo não entram', () => {
    expect(headingOutline(page([{ type: 'heading', id: 'a', title: 'x' }, { type: 'text', id: 't', html: '<p>oi</p>' }])).text).toEqual({})
  })

  it('itens de uma lista de ícones seguem a mesma regra', () => {
    const sem = page([{ type: 'icon_list', id: 'l', items: [{ id: 'i', title: 'Busque' }] }])
    expect(headingOutline(sem).items).toEqual({ l: 'h2' })
    const com = page([
      { type: 'heading', id: 'a', title: 'Principal' },
      { type: 'heading', id: 'b', title: 'Como funciona' },
      { type: 'icon_list', id: 'l', items: [{ id: 'i', title: 'Busque' }] },
    ])
    expect(headingOutline(com).items).toEqual({ l: 'h3' })
  })
})

describe('configuração integrada de seções', () => {
  it('normaliza cores e impede CSS arbitrário, tags e dimensões inválidas', () => {
    const layout = normalizeLayout({ sections: [{ type: 'section', style: { element: 'script', customMinHeight: -10, colors: { background: '#ABCDEF', text: 'url(javascript:alert(1))', link: 'red' }, contentWidth: 'full', minHeight: 'custom' }, blocks: [] }] })
    const section = layout.sections[0] as ContentSection
    expect(section.style.element).toBe('section')
    expect(section.style.colors).toMatchObject({ background: '#abcdef', text: '', link: '' })
    expect(section.style.customMinHeight).toBe(120)
    expect(section.style.contentWidth).toBe('full')
    expect(normalizeLayout(layout)).toEqual(layout)
  })
  it('mantém a altura dos modelos antigos e permite tela inteira nas novas seções', () => {
    const layout = normalizeLayout({ sections: ['screen', 'viewport'].map(minHeight => ({ type: 'section', style: { minHeight }, blocks: [] })) })
    expect(layout.sections.map(section => (section as ContentSection).style.minHeight)).toEqual(['screen', 'viewport'])
  })
  it('inclui aviso de contraste no fluxo de publicação e não afirma medir sobre fotos', () => {
    const raw = { sections: [{ type: 'section', style: { colors: { background: '#ffffff', text: '#ffffff', link: '#ffffff', button: '#000000', buttonText: '#000000' } }, blocks: [{ type: 'heading', title: 'Título' }] }] }
    expect(collectIssues(normalizeLayout(raw)).filter(x => x.includes('contraste'))).toHaveLength(3)
    Object.assign(raw.sections[0].style, { background: { imageUrl: 'https://example.test/foto.png' } })
    expect(collectIssues(normalizeLayout(raw)).filter(x => x.includes('contraste'))).toHaveLength(1)
  })
  it('oferece cabeçalho, artigo e encerramento com itens editáveis', () => {
    for (const key of ['cabecalho', 'artigo', 'encerramento']) {
      const section = SECTION_TEMPLATES.find(template => template.key === key)!.build() as ContentSection
      expect(section.blocks.length).toBeGreaterThan(1)
      expect(section.style.name).toBeTruthy()
      expect(normalizeLayout({ sections: [section] }).sections[0]).toEqual(section)
    }
  })
})
