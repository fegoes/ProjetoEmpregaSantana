export interface Confirmation {
  id: number
  message: string
  title: string
  confirmLabel: string
  destructive: boolean
  opener: HTMLElement | null
}
type Pending = Confirmation & { resolve: (confirmed: boolean) => void }
let queue: Pending[] = []
let sequence = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(listener => listener())
export const subscribeConfirmation = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
export const currentConfirmation = (): Confirmation | null => queue[0] ?? null
export function confirmAction(message: string, options: Partial<Pick<Confirmation, 'title' | 'confirmLabel' | 'destructive'>> = {}): Promise<boolean> {
  const deletion = /^(Excluir|Apagar|Remover)\b/i.exec(message)
  const discard = /sem salvar|não salvas|ainda não salvos/i.test(message)
  const restore = /^Voltar ao desenho/i.test(message)
  return new Promise(resolve => {
    queue.push({ opener: typeof document === 'undefined' ? null : document.activeElement as HTMLElement, id: ++sequence, message, title: deletion ? 'Confirmar exclusão' : discard ? 'Descartar alterações?' : restore ? 'Restaurar página?' : 'Confirmar ação', confirmLabel: deletion?.[1] ?? (discard ? 'Continuar sem salvar' : restore ? 'Restaurar' : 'Confirmar'), destructive: !!deletion || discard || restore, ...options, resolve })
    emit()
  })
}
export function answerConfirmation(id: number, confirmed: boolean) {
  if (queue[0]?.id !== id) return
  const current = queue.shift()!
  emit()
  current.resolve(confirmed)
}
export function cancelConfirmations() {
  const pending = queue
  queue = []
  emit()
  pending.forEach(item => item.resolve(false))
}
