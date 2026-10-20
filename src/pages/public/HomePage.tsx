import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PosterShape } from '@/components/PosterShape'
import { FeedBrowser } from '@/components/feed/FeedBrowser'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

function SearchBand() {
  const [term, setTerm] = React.useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = term.trim()
    navigate(q ? `/explorar?q=${encodeURIComponent(q)}` : '/explorar')
  }

  return (
    <section className="relative -mx-4 -mt-8 overflow-hidden bg-brand-ink px-4 pt-8 pb-9 text-white sm:mx-0 sm:mt-0 sm:rounded-3xl sm:px-10 sm:py-12">
      <PosterShape size="band" />
      <div className="relative max-w-2xl sm:max-w-[min(42rem,62%)]">
        <h1 className="pr-10 text-[1.75rem] leading-[1.12] font-extrabold tracking-tight text-balance sm:pr-0 sm:text-[2.5rem]">
          Vagas e serviços em Santana do Ipanema e região
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-white/80 sm:text-base">
          Emprego fixo, trabalho temporário e profissionais autônomos do sertão. Tudo num só lugar.
        </p>

        <form onSubmit={handleSearch} role="search" className="mt-6 flex max-w-xl gap-2">
          <label htmlFor="home-search" className="sr-only">
            Buscar vagas ou serviços
          </label>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="home-search"
              type="search"
              enterKeyHint="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Cargo ou serviço"
              className="h-12 w-full rounded-full border-0 bg-card pr-4 pl-12 text-base text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-brand-orange/70"
            />
          </div>
          <Button type="submit" size="lg" variant="cta" className="h-12 px-6">
            Buscar
          </Button>
        </form>

        <p className="mt-5 text-sm text-white/75">
          Quer anunciar?{' '}
          <Link to="/cadastro?perfil=empresa" className="font-semibold text-white underline hover:text-brand-orange">
            Publique uma vaga
          </Link>{' '}
          ou{' '}
          <Link to="/cadastro?perfil=autonomo" className="font-semibold text-white underline hover:text-brand-orange">
            divulgue seus serviços
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { user, profile } = useAuth()

  useDocumentMeta({
    title: 'Vagas e autônomos',
    description:
      'Vagas fixas e temporárias, e profissionais autônomos, em um só lugar. Encontre sua próxima vaga ou contrate um profissional de confiança.',
  })

  const firstName = profile?.full_name?.split(' ')[0]

  return (
    <div className="flex flex-col gap-8">
      {user ? (
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
            {firstName ? `${firstName}, veja as vagas de hoje` : 'Vagas e serviços de hoje'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Santana do Ipanema e região</p>
        </div>
      ) : (
        <SearchBand />
      )}

      <FeedBrowser />
    </div>
  )
}
