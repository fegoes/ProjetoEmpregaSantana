import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, Settings, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { Logo } from '@/components/brand/Logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const MOBILE_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  cn('flex w-full rounded-md px-2 py-1.5 text-sm', isActive ? 'font-semibold text-primary' : 'text-foreground')

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-accent text-primary' : 'text-foreground/70 hover:bg-accent hover:text-foreground',
  )

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const autonomos = new URLSearchParams(location.search).get('tipo') === 'autonomos'

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 py-3">
        <Logo className="max-sm:gap-1.5 max-sm:[&>span:first-child]:size-7 max-sm:[&>span:last-child]:text-sm" />

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={NAV_LINK_CLASS}>
            O projeto
          </NavLink>
          <NavLink to="/explorar" className={NAV_LINK_CLASS({ isActive: location.pathname === '/explorar' && !autonomos })}>
            Vagas
          </NavLink>
          <NavLink to="/explorar?tipo=autonomos" className={NAV_LINK_CLASS({ isActive: location.pathname === '/explorar' && autonomos })}>Autônomos</NavLink>
          <NavLink to="/blog" className={NAV_LINK_CLASS}>Dicas de carreira</NavLink>
          <NavLink to="/planos" className={NAV_LINK_CLASS}>
            Planos
          </NavLink>
          <NavLink to="/sobre" className={NAV_LINK_CLASS}>
            Sobre
          </NavLink>
          {user && (
            <NavLink to="/empresas" className={NAV_LINK_CLASS}>
              Empresas
            </NavLink>
          )}

        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Abrir menu de navegação"
                className="flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem asChild>
                <NavLink to="/" end className={MOBILE_LINK_CLASS}>
                  O projeto
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/explorar" className={MOBILE_LINK_CLASS({ isActive: location.pathname === '/explorar' && !autonomos })}>
                  Vagas
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild><NavLink to="/blog" className={MOBILE_LINK_CLASS}>Dicas de carreira</NavLink></DropdownMenuItem>
              <DropdownMenuItem asChild><NavLink to="/explorar?tipo=autonomos" className={MOBILE_LINK_CLASS({ isActive: location.pathname === '/explorar' && autonomos })}>Autônomos</NavLink></DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/planos" className={MOBILE_LINK_CLASS}>
                  Planos
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/sobre" className={MOBILE_LINK_CLASS}>
                  Sobre
                </NavLink>
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem asChild>
                  <NavLink to="/empresas" className={MOBILE_LINK_CLASS}>
                    Empresas
                  </NavLink>
                </DropdownMenuItem>
              )}
              {user ? (
                <DropdownMenuItem asChild>
                  <NavLink to="/perfil" className={MOBILE_LINK_CLASS}>
                    Meu Perfil
                  </NavLink>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/cadastro" className="flex w-full rounded-md px-2 py-1.5 text-sm">
                    Criar conta
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Abrir opções da conta" className="flex min-h-11 min-w-11 items-center gap-2 rounded-full py-0.5 pr-1 pl-0.5 transition-colors hover:bg-accent">
                  <InitialsAvatar name={profile?.full_name ?? 'Usuário'} size="sm" />
                  <span className="hidden max-w-28 truncate text-sm font-medium lg:inline">
                    {profile?.full_name?.split(' ')[0] ?? 'Você'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile?.full_name ?? 'Minha conta'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/perfil">
                    <UserIcon /> Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/perfil/conta">
                    <Settings /> Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/cadastro" className="hidden text-sm font-medium text-foreground/70 hover:text-primary lg:inline">
                Criar conta
              </Link>
              <Button asChild size="sm" variant="outline">
                <Link to="/login">Entrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
