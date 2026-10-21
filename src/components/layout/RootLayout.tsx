import { Link, Outlet } from 'react-router-dom'
import { MapPin } from 'lucide-react'
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
      <footer className="border-t bg-secondary/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size="sm" />
            <p className="mt-3 max-w-xs text-muted-foreground">
              Somos muito mais que uma página, somos a sua conexão de empregabilidade no sertão.
            </p>
            {/* Sinais de instituição: praça e data de fundação. Telefone e e-mail
                seguem fora até confirmação — ver docs/IDENTIDADE_VISUAL.md §1.3,
                o número do manual é fictício. */}
            <p className="mt-4 flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              Santana do Ipanema — Alagoas
            </p>
            <p className="mt-1 text-muted-foreground">Fundado em agosto de 2022</p>
          </div>

          <nav className="flex flex-col gap-2">
            <span className="font-display text-xs font-semibold tracking-wide uppercase">
              Institucional
            </span>
            <Link to="/sobre" className="text-muted-foreground hover:text-primary">
              Sobre
            </Link>
            <Link to="/planos" className="text-muted-foreground hover:text-primary">
              Planos
            </Link>
            <Link to="/explorar" className="text-muted-foreground hover:text-primary">
              Explorar vagas
            </Link>
          </nav>

          <nav className="flex flex-col gap-2">
            <span className="font-display text-xs font-semibold tracking-wide uppercase">
              Legal
            </span>
            <Link to="/termos" className="text-muted-foreground hover:text-primary">
              Termos de uso
            </Link>
            <Link to="/privacidade" className="text-muted-foreground hover:text-primary">
              Privacidade
            </Link>
            <Link to="/lgpd" className="text-muted-foreground hover:text-primary">
              LGPD
            </Link>
          </nav>
        </div>
        <div className="border-t">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} EmpregaSantana
          </p>
        </div>
      </footer>
    </div>
  )
}
