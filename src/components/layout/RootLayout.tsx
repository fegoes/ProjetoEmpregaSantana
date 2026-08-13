import { Link, Outlet } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan text-white">
              <Briefcase className="size-3.5" strokeWidth={2.4} />
            </span>
            Emprega<span className="text-brand-orange-strong">Santana</span>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground">
            <Link to="/sobre" className="hover:text-primary">
              Sobre
            </Link>
            <Link to="/planos" className="hover:text-primary">
              Planos
            </Link>
            <Link to="/termos" className="hover:text-primary">
              Termos
            </Link>
            <Link to="/privacidade" className="hover:text-primary">
              Privacidade
            </Link>
          </nav>
          <p className="text-muted-foreground">Conectando pessoas e oportunidades desde 2026.</p>
        </div>
      </footer>
    </div>
  )
}
