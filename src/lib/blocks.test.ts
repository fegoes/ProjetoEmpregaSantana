import { describe, expect, it } from 'vitest'
import { blocksToHtml, descriptionToText, htmlText, parseBlocks, type DescriptionBlock } from './blocks'

const block = (title: string, html: string): DescriptionBlock => ({ id: title, title, html })

describe('blocksToHtml / parseBlocks', () => {
  it('round-trips titles and bodies', () => {
    const html = blocksToHtml([
      block('Sobre a vaga', '<p>Atendimento ao cliente.</p>'),
      block('Requisitos', '<ul><li><p>Ensino médio</p></li></ul>'),
    ])
    expect(html).toBe(
      '<section data-block><h2>Sobre a vaga</h2><p>Atendimento ao cliente.</p></section>' +
        '<section data-block><h2>Requisitos</h2><ul><li><p>Ensino médio</p></li></ul></section>',
    )
    const parsed = parseBlocks(html)
    expect(parsed.structured).toBe(true)
    expect(parsed.blocks.map((b) => b.title)).toEqual(['Sobre a vaga', 'Requisitos'])
    expect(parsed.blocks[1].html).toBe('<ul><li><p>Ensino médio</p></li></ul>')
  })

  it('escapes the block title', () => {
    const html = blocksToHtml([block('Salário <b> & bônus', '<p>x</p>')])
    expect(html).toContain('<h2>Salário &lt;b&gt; &amp; bônus</h2>')
    expect(parseBlocks(html).blocks[0].title).toBe('Salário <b> & bônus')
  })

  it('drops blocks that have no text', () => {
    const html = blocksToHtml([block('Vazio', '<p></p>'), block('Cheio', '<p>Texto</p>')])
    expect(parseBlocks(html).blocks.map((b) => b.title)).toEqual(['Cheio'])
  })

  it('reads old text (no blocks) as one block', () => {
    const parsed = parseBlocks('<p>Texto antigo</p><ul><li>a</li></ul>', 'Descrição da vaga')
    expect(parsed.structured).toBe(false)
    expect(parsed.blocks).toHaveLength(1)
    expect(parsed.blocks[0].title).toBe('Descrição da vaga')
    expect(parsed.blocks[0].html).toBe('<p>Texto antigo</p><ul><li>a</li></ul>')
  })

  it('returns nothing for empty text', () => {
    expect(parseBlocks('').blocks).toEqual([])
    expect(parseBlocks(null).blocks).toEqual([])
    expect(parseBlocks('<p></p>').blocks).toEqual([])
  })

  it('keeps a block without a title', () => {
    const parsed = parseBlocks('<section data-block><p>Só texto</p></section>')
    expect(parsed.blocks[0].title).toBe('')
    expect(parsed.blocks[0].html).toBe('<p>Só texto</p>')
  })
})

describe('text helpers', () => {
  it('extracts plain text', () => {
    expect(htmlText('<p>Olá&nbsp;<strong>mundo</strong></p>')).toBe('Olá mundo')
  })

  it('leaves block titles out of the search description', () => {
    const html = blocksToHtml([block('Sobre a vaga', '<p>Buscamos caixa.</p>'), block('Requisitos', '<p>Ensino médio.</p>')])
    expect(descriptionToText(html)).toBe('Buscamos caixa. Ensino médio.')
  })
})
