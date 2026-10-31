// Funções puras compartilhadas com o middleware, sem dependências de interface.
/** Aceita só caminhos internos ("/vagas/1?x=y") vindos da URL — nunca "//site.com" ou "https://…". */
export function safeInternalPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return null
  try {
    const decoded=decodeURIComponent(path)
    if(decoded.startsWith('//') || [...decoded].some(char=>char==='\\'||char.charCodeAt(0)<32||char.charCodeAt(0)===127))return null
  } catch { return null }
  return path
}

/** Troca um item de lugar com o vizinho (para cima ou para baixo); nas pontas devolve a mesma lista. */
export function moveItem<T>(items: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return items
  const next = [...items]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

