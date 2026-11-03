import { useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PageBuilder } from './PageBuilder'
import { newSection, type Section } from '@/lib/pageLayout'
vi.mock('./SectionEditor', () => ({ SectionEditor: () => <p>Editar conteúdo inserido</p> }))
afterEach(cleanup)
function Harness() {
 const [sections, setSections] = useState<Section[]>([newSection({ style: { name: 'Seção existente' }, blocks: [] })])
 return <><output data-testid="order">{sections.map(section => section.type === 'slides' ? 'slides' : section.blocks.map(block => block.type).join(',') || 'vazia').join('|')}</output><PageBuilder sections={sections} onChange={setSections} /></>
}
function transfer() {
 const data = new Map<string, string>()
 return { get types() { return [...data.keys()] }, setData: (type: string, value: string) => data.set(type, value), getData: (type: string) => data.get(type) ?? '', effectAllowed: '', dropEffect: '' }
}
describe('paleta visual de seções', () => {
 it('insere o modelo escolhido por clique e abre a edição', () => {
  render(<Harness />)
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar seção' }))
  const tile = screen.getByRole('button', { name: 'Texto com imagem' })
  expect(tile).toHaveAttribute('draggable', 'true')
  expect(tile).toHaveAccessibleDescription(/Duas colunas/)
  fireEvent.click(tile)
  expect(screen.getByTestId('order')).toHaveTextContent('vazia|media_text')
  expect(screen.getAllByText('Editar conteúdo inserido')).toHaveLength(2)
 })
 it('arrasta um novo modelo para antes de uma seção existente', () => {
  render(<Harness />)
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar seção' }))
  const dataTransfer = transfer()
  fireEvent.dragStart(screen.getByRole('button', { name: 'Texto com imagem' }), { dataTransfer })
  const zone = screen.getByText('Arraste um modelo para inserir uma seção aqui')
  fireEvent.dragOver(zone, { dataTransfer })
  fireEvent.drop(zone, { dataTransfer })
  expect(screen.getByTestId('order')).toHaveTextContent('media_text|vazia')
 })
 it('ignora elementos e arquivos externos em zonas de seção', () => {
  render(<Harness />)
  const dataTransfer = transfer()
  dataTransfer.setData('text/plain', 'arquivo externo')
  fireEvent.drop(screen.getByText('Arraste um modelo para inserir uma seção aqui'), { dataTransfer })
  expect(screen.getByTestId('order')).toHaveTextContent(/^vazia$/)
 })
})
