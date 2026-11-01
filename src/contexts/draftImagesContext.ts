import { createContext, useContext } from 'react'
import type { DraftImageStore } from '@/lib/draftImages'
export interface DraftImagesContextValue { store: DraftImageStore; changed: () => void; saving: boolean; setSaving: (saving: boolean) => void }
export const DraftImagesContext = createContext<DraftImagesContextValue | null>(null)
export const useDraftImages = () => useContext(DraftImagesContext)
