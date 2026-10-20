import { Link, Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Logo } from '@/components/brand/Logo'

const FOOTER_LINKS = [
  { to: '/explorar', label: 'Explorar' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/planos', label: 'Planos' },
  { to: '/termos', label: 'Termos' },
  { to: '/privacidade', label: 'Privacidade' },
  { to: '/lgpd', label: 'LGPD' },
]

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
      <footer className="border-t bg-secondary/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3">
            <Logo size="sm" />
            <p className="max-w-xs text-muted-foreground">
              Somos a sua conexão de empregabilidade no sertão, desde agosto de 2022.
            </p>
          </div>
          <nav aria-label="Rodapé" className="-mx-2 flex flex-wrap text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex h-11 items-center px-2 hover:text-primary hover:underline sm:h-9"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
