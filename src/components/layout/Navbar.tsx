import { Link, NavLink, useNavigate } from 'react-router-dom'
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

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={NAV_LINK_CLASS}>
            Home
          </NavLink>
          <NavLink to="/explorar" className={NAV_LINK_CLASS}>
            Explorar
          </NavLink>
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
          {user && (
            <NavLink to="/perfil" className={NAV_LINK_CLASS}>
              Meu Perfil
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Abrir menu de navegação"
                className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-accent md:hidden"
              >
                <Menu className="size-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem asChild>
                <NavLink to="/" end className={MOBILE_LINK_CLASS}>
                  Home
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/explorar" className={MOBILE_LINK_CLASS}>
                  Explorar
                </NavLink>
              </DropdownMenuItem>
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
                <button className="flex items-center gap-2 rounded-full py-0.5 pr-1 pl-0.5 transition-colors hover:bg-accent">
                  <InitialsAvatar name={profile?.full_name ?? 'Usuário'} size="sm" />
                  <span className="hidden max-w-28 truncate text-sm font-medium md:inline">
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
              <Link to="/cadastro" className="hidden text-sm font-medium text-foreground/70 hover:text-primary md:inline">
                Criar conta
              </Link>
              <Button asChild size="sm" variant="cta">
                <Link to="/login">Entrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
