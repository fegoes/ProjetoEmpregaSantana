import * as React from 'react'
import { Button } from '@/components/ui/button'

interface ShowMoreGridProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
  pageSize?: number
}

// Evita despejar dezenas de cards de uma vez — mantém a página inicial enxuta
// e deixa o usuário pedir mais quando quiser.
export function ShowMoreGrid<T>({ items, renderItem, keyExtractor, pageSize = 9 }: ShowMoreGridProps<T>) {
  const [visible, setVisible] = React.useState(pageSize)
  const shown = items.slice(0, visible)
  const remaining = items.length - visible

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <React.Fragment key={keyExtractor(item)}>{renderItem(item)}</React.Fragment>
        ))}
      </div>
      {remaining > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setVisible((v) => v + pageSize)}>
            Mostrar mais ({remaining} restantes)
          </Button>
        </div>
      )}
    </div>
  )
}
