import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'
const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock('@/hooks/usePaginasInstitucionais', () => ({ usePaginaInstitucional: query }))
vi.mock('@/components/pages/BuilderPage', () => ({ BuilderPage: ({ pagina }: { pagina: { title: string } }) => <h1>{pagina.title}</h1> }))
vi.mock('@/components/RichTextRenderer', () => ({ RichTextRenderer: ({ html }: { html: string }) => <div>{html}</div> }))
vi.mock('@/hooks/useDocumentMeta', () => ({ useDocumentMeta: vi.fn() }))
afterEach(cleanup)
const current = { title: 'Inicial atualizada', layout: { version: 1, sections: [] }, content_html: '', seo_description: '' }
describe('inicial sem prévia antiga', () => {
  it('espera a consulta antes de mostrar o conteúdo definitivo', () => {
    query.mockReturnValue({ isPending: true, isFetching: true })
    const { rerender } = render(<HomePage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText(/Seu próximo passo/)).not.toBeInTheDocument()
    query.mockReturnValue({ data: current, isPending: false, isFetching: false })
    rerender(<HomePage />)
    expect(screen.getByRole('heading', { name: current.title })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
  it('não exibe conteúdo antigo do cache durante a revalidação', () => {
    query.mockReturnValue({ data: { ...current, title: 'Versão anterior' }, isFetching: true })
    render(<HomePage />)
    expect(screen.queryByText('Versão anterior')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
  it('falha de rede oferece nova tentativa sem restaurar a página original', () => {
    const refetch = vi.fn()
    query.mockReturnValue({ isError: true, refetch })
    render(<HomePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(refetch).toHaveBeenCalledOnce()
    expect(screen.queryByText(/Seu próximo passo/)).not.toBeInTheDocument()
  })
  it('preserva conteúdo textual salvo quando não há layout', () => {
    query.mockReturnValue({ data: { ...current, layout: null, content_html: 'Texto atual salvo' } })
    render(<HomePage />)
    expect(screen.getByText('Texto atual salvo')).toBeInTheDocument()
  })
})
