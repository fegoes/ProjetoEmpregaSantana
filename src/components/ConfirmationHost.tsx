import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { answerConfirmation, cancelConfirmations, currentConfirmation, subscribeConfirmation } from '@/lib/confirmAction'
import { Button } from './ui/button'

/** Confirmações da aplicação, incluindo ações disparadas dentro de outros modais. */
export function ConfirmationHost() {
  const request = useSyncExternalStore(subscribeConfirmation, currentConfirmation, () => null)
  const cancel = useRef<HTMLButtonElement>(null)
  useEffect(() => () => cancelConfirmations(), [])
  if (!request) return null
  const answer = (value: boolean) => answerConfirmation(request.id, value)
  return <Dialog.Root key={request.id} open onOpenChange={open => { if (!open) answer(false) }}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50" />
    <Dialog.Content onCloseAutoFocus={event => { event.preventDefault(); if (request.opener?.isConnected) request.opener.focus() }} onOpenAutoFocus={event => { event.preventDefault(); cancel.current?.focus() }} onPointerDownOutside={event => event.preventDefault()} className="fixed top-1/2 left-1/2 z-[80] max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-card p-5 shadow-lg sm:p-6">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-accent text-primary"><AlertTriangle className="size-5" aria-hidden="true" /></div>
      <Dialog.Title className="pr-8 text-xl font-bold">{request.title}</Dialog.Title>
      <Dialog.Description className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">{request.message}</Dialog.Description>
      <Dialog.Close aria-label="Fechar confirmação" className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><X className="size-5" /></Dialog.Close>
      <div className="mt-6 flex flex-wrap justify-end gap-3"><Button ref={cancel} type="button" variant="outline" onClick={() => answer(false)}>Cancelar</Button><Button type="button" variant={request.destructive ? 'destructive' : 'default'} onClick={() => answer(true)}>{request.confirmLabel}</Button></div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>
}
