import * as React from 'react'

export interface EditorState {
  /** Pasta onde as imagens da página são guardadas */
  pageId: string
  /** Páginas que podem ser destino de um botão */
  linkTargets: { path: string; label: string }[]
}

export const EditorContext = React.createContext<EditorState>({ pageId: 'nova', linkTargets: [] })

export const useEditorState = () => React.useContext(EditorContext)
