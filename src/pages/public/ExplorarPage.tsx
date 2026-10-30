import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { FeedBrowser } from '@/components/feed/FeedBrowser'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

export default function ExplorarPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [term, setTerm] = React.useState(searchParams.get('q') ?? '')
  const [debounced, setDebounced] = React.useState(searchParams.get('q') ?? '')

  useDocumentMeta({
    title: 'Explorar',
    description: 'Busque por cargo, categoria de serviço ou palavra-chave entre vagas e autônomos no EmpregaSantana.',
  })

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      const q = term.trim()
      setDebounced(q)
      setSearchParams(q ? { q } : {}, { replace: true })
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  const clear = () => {
    setTerm('')
    setDebounced('')
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">Buscar vagas e profissionais</h1>
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-4 max-w-xl">
          <label htmlFor="explorar-search" className="sr-only">
            Buscar por cargo, serviço ou palavra-chave
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id="explorar-search"
            type="search"
            enterKeyHint="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Ex.: vendedor, eletricista, enfermagem"
            className="h-12 w-full rounded-full border bg-card pr-12 pl-12 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
          />
          {term && (
            <button
              type="button"
              onClick={clear}
              aria-label="Limpar busca"
              className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </form>
      </div>

      <FeedBrowser search={debounced} onClearSearch={clear} />
    </div>
  )
}
