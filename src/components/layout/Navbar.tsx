import * as React from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Settings, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/database'
import { Button } from '@/components/ui/button'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { Logo } from '@/components/brand/Logo'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

const ROLE_LINKS: Record<UserRole, NavItem[]> = {
  candidato: [
    { to: '/candidato/candidaturas', label: 'Candidaturas' },
    { to: '/candidato/cv', label: 'Currículos' },
  ],
  empresa_owner: [{ to: '/empresa/painel', label: 'Minha empresa' }],
  autonomo: [{ to: '/autonomo/perfil', label: 'Meu perfil de autônomo' }],
}

function useNavItems(): NavItem[] {
  const { user, roles, isAdmin } = useAuth()
  const items: NavItem[] = [
    { to: '/', label: 'Início', end: true },
    { to: '/explorar', label: 'Explorar' },
  ]
  if (!user) return [...items, { to: '/planos', label: 'Planos' }]
  items.push({ to: '/empresas', label: 'Empresas' })
  for (const role of ['candidato', 'empresa_owner', 'autonomo'] as UserRole[]) {
    if (roles.includes(role)) items.push(...ROLE_LINKS[role])
  }
  if (isAdmin) items.push({ to: '/admin', label: 'Admin' })
  return items
}

const DESKTOP_LINK = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative flex h-10 items-center rounded-full px-3.5 text-sm font-medium transition-colors',
    isActive ? 'text-primary' : 'text-foreground/75 hover:text-foreground',
    // traço laranja sob o item ativo — o mesmo grafismo dos posts
    isActive && 'after:absolute after:inset-x-3.5 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-orange',
  )

const SHEET_LINK = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-12 items-center rounded-xl px-3 text-base font-medium transition-colors',
    isActive ? 'bg-accent text-primary' : 'text-foreground hover:bg-muted',
  )

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const items = useNavItems()
  const [menuOpen, setMenuOpen] = React.useState(false)

  // Fecha o menu do celular ao trocar de página
  React.useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  // Nas páginas de entrar/criar conta o botão da própria página já é a ação; não repetir no topo
  const onAuthPage = ['/login', '/cadastro'].includes(location.pathname)

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav aria-label="Principal" className="hidden items-center lg:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={DESKTOP_LINK}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Minha conta"
                  className="hidden h-10 items-center gap-2 rounded-full py-1 pr-3 pl-1 transition-colors hover:bg-muted lg:flex"
                >
                  <InitialsAvatar name={profile?.full_name ?? 'Usuário'} size="sm" />
                  <span className="max-w-28 truncate text-sm font-medium">
                    {profile?.full_name?.split(' ')[0] ?? 'Você'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuLabel>{profile?.full_name ?? 'Minha conta'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/perfil">
                    <UserIcon /> Meu perfil
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
            !onAuthPage && (
              <>
                <Button asChild variant="ghost" className="hidden rounded-full lg:inline-flex">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild variant="outline" className="hidden sm:inline-flex">
                  <Link to="/cadastro">Criar conta</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full sm:hidden">
                  <Link to="/login">Entrar</Link>
                </Button>
              </>
            )
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Abrir menu"
                className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted lg:hidden"
              >
                <Menu className="size-6" />
              </button>
            </SheetTrigger>
            <SheetContent title={user ? (profile?.full_name ?? 'Menu') : 'Menu'}>
              <nav aria-label="Principal" className="flex flex-col gap-1">
                {items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={SHEET_LINK}>
                    {item.label}
                  </NavLink>
                ))}
                <NavLink to="/sobre" className={SHEET_LINK}>
                  Sobre o EmpregaSantana
                </NavLink>
              </nav>
              <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                {user ? (
                  <>
                    <NavLink to="/perfil" end className={SHEET_LINK}>
                      Meu perfil
                    </NavLink>
                    <NavLink to="/perfil/conta" className={SHEET_LINK}>
                      Configurações
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex h-12 items-center rounded-xl px-3 text-left text-base font-medium text-destructive-ink hover:bg-muted"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg">
                      <Link to="/cadastro">Criar conta grátis</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link to="/login">Entrar</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
