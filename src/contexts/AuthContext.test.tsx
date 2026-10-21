import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import { queryClient } from '@/lib/queryClient'
import type { UserRole } from '@/types/database'

const controls = vi.hoisted(() => ({
  getSession: vi.fn(), signUp: vi.fn(), from: vi.fn(),
  listener: null as null | ((event: string, session: unknown) => void),
  profiles: new Map<string, Promise<unknown>>(),
}))
vi.mock('@/lib/supabase', () => ({ supabase: {
  auth: {
    getSession: controls.getSession, signUp: controls.signUp,
    onAuthStateChange: (callback: typeof controls.listener) => { controls.listener = callback; return { data: { subscription: { unsubscribe: vi.fn() } } } },
    signOut: async () => { controls.listener?.('SIGNED_OUT', null); return { error: null } },
  },
  from: controls.from,
} }))

function Probe() {
  const auth = useAuth()
  return <><output data-testid="state">{JSON.stringify({ id: auth.user?.id, admin: auth.isAdmin, loading: auth.loading })}</output><button onClick={() => auth.signUp('test@example.test', 'local-test-only', 'admin' as UserRole)}>Cadastro inválido</button><button onClick={() => auth.addRole('admin' as UserRole)}>Papel inválido</button></>
}
const read = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}')
const session = (id: string) => ({ user: { id } })
const profile = (id: string, is_admin: boolean) => ({ data: { id, is_admin, is_active: true } })
function deferred() {
  let resolve!: (value: unknown) => void
  const promise = new Promise<unknown>(done => { resolve = done })
  return { promise, resolve }
}

beforeEach(() => {
  controls.profiles.clear()
  controls.signUp.mockReset()
  controls.getSession.mockReset().mockResolvedValue({ data: { session: null } })
  controls.from.mockReset().mockImplementation((table: string) => ({ select: () => ({ eq: (_column: string, id: string) => table === 'profiles' ? { single: () => controls.profiles.get(id) ?? Promise.resolve({ data: null }) } : Promise.resolve({ data: [{ role: 'candidato' }] }) }) }))
})
afterEach(() => { cleanup(); queryClient.clear() })

describe('isolamento da sessão administrativa', () => {
  it('retira acesso e cache anterior enquanto troca de administrador para usuário comum', async () => {
    controls.profiles.set('admin-a', Promise.resolve(profile('admin-a', true)))
    controls.getSession.mockResolvedValue({ data: { session: session('admin-a') } })
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(read().admin).toBe(true))
    queryClient.setQueryData(['admin', 'usuarios'], ['registro privado'])
    const ordinary = deferred()
    controls.profiles.set('ordinary-b', ordinary.promise)
    act(() => controls.listener?.('SIGNED_IN', session('ordinary-b')))
    expect(read()).toMatchObject({ id: 'ordinary-b', admin: false, loading: true })
    expect(queryClient.getQueryData(['admin', 'usuarios'])).toBeUndefined()
    await act(async () => ordinary.resolve(profile('ordinary-b', false)))
    await waitFor(() => expect(read()).toMatchObject({ id: 'ordinary-b', admin: false, loading: false }))
  })
  it('ignora resposta antiga de perfil admin depois que outra sessão já foi carregada', async () => {
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(read().loading).toBe(false))
    const oldAdmin = deferred()
    controls.profiles.set('admin-a', oldAdmin.promise)
    controls.profiles.set('ordinary-b', Promise.resolve(profile('ordinary-b', false)))
    act(() => controls.listener?.('SIGNED_IN', session('admin-a')))
    act(() => controls.listener?.('SIGNED_IN', session('ordinary-b')))
    await waitFor(() => expect(read()).toMatchObject({ id: 'ordinary-b', loading: false }))
    await act(async () => oldAdmin.resolve(profile('admin-a', true)))
    expect(read()).toMatchObject({ id: 'ordinary-b', admin: false, loading: false })
  })
  it('recusa admin nos fluxos de cadastro e adição de papel antes de chamar a API', async () => {
    controls.profiles.set('ordinary-b', Promise.resolve(profile('ordinary-b', false)))
    controls.getSession.mockResolvedValue({ data: { session: session('ordinary-b') } })
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(read().loading).toBe(false))
    const previousCalls = controls.from.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: 'Cadastro inválido' }))
    fireEvent.click(screen.getByRole('button', { name: 'Papel inválido' }))
    expect(controls.signUp).not.toHaveBeenCalled()
    expect(controls.from.mock.calls.length).toBe(previousCalls)
  })
  it('não reinicia o painel em notificações repetidas da mesma sessão validada', async () => {
    controls.profiles.set('admin-a', Promise.resolve(profile('admin-a', true)))
    const signedIn = { ...session('admin-a'), access_token: 'same-token' }
    controls.getSession.mockResolvedValue({ data: { session: signedIn } })
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(read()).toMatchObject({ admin: true, loading: false }))
    const previousCalls = controls.from.mock.calls.length
    act(() => controls.listener?.('SIGNED_IN', signedIn))
    expect(read()).toMatchObject({ admin: true, loading: false })
    expect(controls.from.mock.calls.length).toBe(previousCalls)
    act(() => controls.listener?.('SIGNED_OUT', null))
    await waitFor(() => expect(read()).toMatchObject({ admin: false, loading: false }))
  })
  it('revalida acesso quando o mesmo usuário recebe um token diferente', async () => {
    controls.profiles.set('admin-a', Promise.resolve(profile('admin-a', true)))
    controls.getSession.mockResolvedValue({ data: { session: { ...session('admin-a'), access_token: 'old-token' } } })
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(read().admin).toBe(true))
    const revalidation = deferred()
    controls.profiles.set('admin-a', revalidation.promise)
    act(() => controls.listener?.('SIGNED_IN', { ...session('admin-a'), access_token: 'new-token' }))
    expect(read()).toMatchObject({ admin: false, loading: true })
    await act(async () => revalidation.resolve(profile('admin-a', false)))
    await waitFor(() => expect(read()).toMatchObject({ admin: false, loading: false }))
  })
  it('falha fechada quando a sessão não pode ser recuperada', async () => {
    controls.getSession.mockRejectedValue(new Error('falha de sessão simulada'))
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(read()).toMatchObject({ admin: false, loading: false }))
    expect(read().id).toBeUndefined()
  })
})
