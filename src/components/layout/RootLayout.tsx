import { Link, Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Logo } from '@/components/brand/Logo'

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
          <Logo size="sm" />
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
          <p className="max-w-xs text-muted-foreground sm:text-right">
            Somos a sua conexão de empregabilidade no sertão — desde agosto de 2022.
          </p>
        </div>
      </footer>
    </div>
  )
}
