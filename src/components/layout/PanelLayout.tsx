import * as React from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Briefcase, Check, ChevronsUpDown, ExternalLink, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PANEL_AREAS, areaFromPath, areaHomePath, availableAreas, type PanelArea } from '@/lib/panelNav'
import { cn } from '@/lib/utils'

const COLLAPSE_KEY = 'empregasantana:painel-recolhido'

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

function SuperadminChip() {
  return (
    <span className="inline-flex h-6 items-center rounded-[4px] bg-brand-orange px-2 font-display text-[11px] font-bold tracking-wide text-brand-orange-foreground uppercase">
      Superadmin
    </span>
  )
}

/** Seletor de perfil: quem tem mais de um perfil troca de painel por aqui (como o seletor de sites do WordPress). */
function AreaSwitcher({ area, collapsed }: { area: PanelArea; collapsed: boolean }) {
  const { isAdmin, roles } = useAuth()
  const areas = availableAreas({ isAdmin, roles })
  const meta = PANEL_AREAS[area]
  const label = area === 'admin' ? <SuperadminChip /> : <span className="truncate font-display font-bold">{meta.title}</span>


  // Um perfil só (e já estamos nele): só o nome, sem menu
  const others = areas.filter((a) => a !== area)
  if (others.length === 0) {
    return collapsed ? null : <div className="flex h-11 items-center px-3 text-white">{label}</div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-white transition-colors hover:bg-white/10 focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:outline-none"
          aria-label={`Perfil atual: ${meta.title}. Trocar de perfil`}
        >
          {collapsed ? <span className="sr-only">{meta.title}</span> : label}
          <ChevronsUpDown className="size-4 shrink-0 text-white/70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-64">
        <DropdownMenuLabel>Trocar de perfil</DropdownMenuLabel>
        {areas.map((a) => (
          <DropdownMenuItem key={a} asChild>
            <Link to={areaHomePath(a)} className="h-10">
              {a === area ? <Check className="size-4" /> : <span className="size-4" />}
              {PANEL_AREAS[a].switchLabel}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link to="/perfil" className="h-10">
            <span className="size-4" />
            Minha conta
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PanelSidebar({
  area,
  collapsed = false,
  onNavigate,
  onToggle,
}: {
  area: PanelArea
  collapsed?: boolean
  onNavigate?: () => void
  onToggle?: () => void
}) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const meta = PANEL_AREAS[area]

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-full flex-col bg-brand-ink text-white">
      <div className={cn('flex h-16 shrink-0 items-center gap-2.5 px-4', collapsed && 'justify-center px-0')}>
        <Link
          to="/"
          onClick={onNavigate}
          aria-label="EmpregaSantana: ir para o site"
          className="flex items-center gap-2.5 rounded-lg focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:outline-none"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-ink">
            <Briefcase className="size-4.5" strokeWidth={2.4} />
          </span>
          {!collapsed && (
            <span className="font-display text-lg font-extrabold tracking-tight">
              Emprega<span className="text-brand-orange">Santana</span>
            </span>
          )}
        </Link>
      </div>

      <div className="px-3 pb-2">
        <AreaSwitcher area={area} collapsed={collapsed} />
      </div>

      <nav aria-label={meta.title} className="flex-1 overflow-y-auto px-3 pb-4">
        {meta.groups.map((group, index) => (
          <div key={group.label ?? index} className={cn(index > 0 && 'mt-2')}>
            {group.label && !collapsed && (
              <p className="px-3 pt-3 pb-1.5 font-display text-xs font-semibold tracking-wide text-white/70 uppercase">
                {group.label}
              </p>
            )}
            {group.label && collapsed && index > 0 && <div className="mx-3 my-2 border-t border-white/10" />}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:outline-none',
                          collapsed && 'justify-center px-0',
                          isActive ? 'bg-white text-brand-ink' : 'text-white/85 hover:bg-white/10 hover:text-white',
                        )
                      }
                    >
                      <Icon className="size-5 shrink-0" strokeWidth={2} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {onToggle&&<button type="button" onClick={onToggle} aria-expanded={!collapsed} aria-label={collapsed?'Expandir menu':'Recolher menu'} title={collapsed?'Expandir menu':'Recolher menu'} className="mx-3 flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 text-sm text-white/85 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white">{collapsed?<PanelLeftOpen className="size-5" />:<PanelLeftClose className="size-5" />}{!collapsed&&'Recolher menu'}</button>}
      <div className={cn('shrink-0 border-t border-white/10 p-3', collapsed && 'flex flex-col items-center')}>
        {!collapsed && (
          <div className="mb-2 flex items-center gap-3 px-1">
            <InitialsAvatar name={profile?.full_name ?? 'Usuário'} size="sm" className="bg-white/15 text-white" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile?.full_name ?? 'Minha conta'}</p>
              <p className="truncate text-xs text-white/70">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Sair' : undefined}
          aria-label="Sair"
          className={cn(
            'flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:outline-none',
            collapsed ? 'w-11 justify-center px-0' : 'w-full',
          )}
        >
          <LogOut className="size-5 shrink-0" />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </div>
  )
}

/**
 * Casca dos painéis (superadmin, empresa, candidato, autônomo e conta): só o
 * menu lateral e a área de trabalho, sem o cabeçalho e o rodapé do site.
 */
export function PanelLayout() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const area = areaFromPath(location.pathname)
  const meta = PANEL_AREAS[area]
  const [collapsed, setCollapsed] = React.useState(readCollapsed)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      try {
        window.localStorage.setItem(COLLAPSE_KEY, value ? '0' : '1')
      } catch {
        /* sem armazenamento: o menu só não lembra a escolha */
      }
      return !value
    })
  }

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>

      <aside
        id="panel-sidebar"
        className={cn(
          'sticky top-0 hidden h-dvh shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none lg:block',
          collapsed ? 'w-[4.5rem]' : 'w-72',
        )}
      >
        <PanelSidebar area={area} collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      <DialogPrimitive.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/50 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 lg:hidden" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-[19rem] max-w-[86vw] shadow-2xl outline-none duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left motion-reduce:animate-none lg:hidden">
            <DialogPrimitive.Title className="sr-only">Menu do painel</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Navegação do painel: {meta.title}</DialogPrimitive.Description>
            <PanelSidebar area={area} onNavigate={() => setDrawerOpen(false)} />
            <DialogPrimitive.Close
              aria-label="Fechar menu"
              className="absolute top-2.5 right-2.5 flex size-11 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:outline-none"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            className="-ml-2 flex size-11 items-center justify-center rounded-full transition-colors hover:bg-muted lg:hidden"
          >
            <Menu className="size-6" />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!collapsed}
            aria-controls="panel-sidebar"
            className="-ml-2 hidden min-h-11 items-center justify-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
            <span>{collapsed?'Expandir menu':'Recolher menu'}</span>
          </button>

          <p className="min-w-0 flex-1 truncate font-display text-base font-bold lg:text-lg">{meta.title}</p>

          <Button asChild variant="outline" size="sm">
            <Link to={user ? meta.siteButton.to(user.id) : '/'}>
              <ExternalLink />
              <span className="hidden sm:inline">{meta.siteButton.label}</span>
              <span className="sm:hidden">Site</span>
            </Link>
          </Button>
          <InitialsAvatar name={profile?.full_name ?? 'Usuário'} size="sm" className="hidden sm:flex" />
        </header>

        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
