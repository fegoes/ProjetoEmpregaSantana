import { useEffect, useState, type ReactNode } from 'react'
import { DraftImageStore } from '@/lib/draftImages'
import { DraftImagesContext } from '@/contexts/draftImagesContext'
export function DraftImagesProvider({children}:{children:ReactNode}) {
  const [store] = useState(() => new DraftImageStore())
  const [, changed] = useState(0)
  const [saving, setSaving] = useState(false)
  useEffect(() => () => store.dispose(), [store])
  return <DraftImagesContext.Provider value={{store, changed: () => changed(n => n + 1), saving, setSaving}}>{children}</DraftImagesContext.Provider>
}
