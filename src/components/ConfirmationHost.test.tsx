import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfirmationHost } from './ConfirmationHost'
import { AdminModal } from './admin/AdminModal'
import { answerConfirmation, cancelConfirmations, confirmAction, currentConfirmation } from '@/lib/confirmAction'
import { Button } from './ui/button'
afterEach(() => { cleanup(); cancelConfirmations() })
function Action({ done, nested = false }: { done: () => void; nested?: boolean }) {
 const button = <Button type="button" onClick={async () => { if (await confirmAction('Excluir a vaga? As candidaturas também serão apagadas.')) done() }}>Excluir vaga</Button>
 return <>{nested ? <AdminModal open onClose={() => {}} title="Editar vaga" description="Dados da vaga">{button}</AdminModal> : button}<ConfirmationHost /></>
}
describe('confirmações com a interface do sistema', () => {
 it('não executa antes da confirmação, explica consequências e permite cancelar', async () => {
  const done = vi.fn()
  render(<Action done={done} />)
  const trigger = screen.getByRole('button', { name: 'Excluir vaga' }); trigger.focus(); fireEvent.click(trigger)
  const dialog = await screen.findByRole('dialog', { name: 'Confirmar exclusão' })
  expect(dialog).toHaveAccessibleDescription('Excluir a vaga? As candidaturas também serão apagadas.')
  expect(done).not.toHaveBeenCalled()
  await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus())
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(done).not.toHaveBeenCalled()
  await waitFor(() => expect(trigger).toHaveFocus())
 })
 it('confirma uma única vez sem submeter o formulário por acidente', async () => {
  const done = vi.fn(), submit = vi.fn()
  render(<form onSubmit={submit}><Action done={done} /></form>)
  fireEvent.click(screen.getByRole('button', { name: 'Excluir vaga' }))
  fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Excluir' }))
  await waitFor(() => expect(done).toHaveBeenCalledOnce())
  expect(submit).not.toHaveBeenCalled()
 })
 it('Escape cancela inclusive uma confirmação sobre outro modal', async () => {
  const done = vi.fn()
  render(<Action done={done} nested />)
  fireEvent.click(screen.getByRole('button', { name: 'Excluir vaga' }))
  const dialog = await screen.findByRole('dialog', { name: 'Confirmar exclusão' })
  await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus())
  fireEvent.keyDown(dialog, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Confirmar exclusão' })).not.toBeInTheDocument())
  expect(done).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog', { name: 'Editar vaga' })).toBeInTheDocument()
 })
 it('mantém solicitações distintas em ordem e ignora resposta duplicada', async () => {
  const first = confirmAction('Primeira ação?'), second = confirmAction('Segunda ação?')
  const id = currentConfirmation()!.id
  answerConfirmation(id, true); answerConfirmation(id, true)
  expect(await first).toBe(true)
  expect(currentConfirmation()?.message).toBe('Segunda ação?')
  cancelConfirmations()
  expect(await second).toBe(false)
 })
})
