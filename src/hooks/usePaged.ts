import * as React from 'react'

/** Mostra a lista aos poucos: os primeiros itens e um "mostrar mais". Volta ao começo quando `resetKey` muda (busca, filtro). */
export function usePaged<T>(items: T[], size = 30, resetKey?: unknown) {
  const [visible, setVisible] = React.useState(size)
  React.useEffect(() => setVisible(size), [resetKey, size])
  return {
    shown: items.slice(0, visible),
    remaining: Math.max(items.length - visible, 0),
    more: () => setVisible((v) => v + size),
  }
}
