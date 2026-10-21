import { useEffect, useRef, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Briefcase, Building2, ChevronRight, ExternalLink, FileText, Grid2X2, LogOut, Menu, Palette, Settings, UserRound, Users, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { InitialsAvatar } from '@/components/InitialsAvatar'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PanelLayout({ children, mode = 'user' }: { children: ReactNode; mode?: 'user' | 'admin' }) {
  const { profile, roles, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const drawer = useRef<HTMLDialogElement>(null)
  const admin = mode === 'admin'
  useEffect(() => { drawer.current?.close() }, [location.key])
  const resources = [
    { to: '/admin/vagas', label: 'Vagas', icon: Briefcase, create: '/admin/vagas/nova', all: 'Todas as vagas', add: 'Adicionar vaga' },
    { to: '/admin/profissionais', label: 'Profissionais', icon: Users, create: '/admin/profissionais/novo', all: 'Todos os profissionais', add: 'Adicionar profissional' },
    { to: '/admin/empresas', label: 'Empresas', icon: Building2, create: '/admin/empresas/nova', all: 'Todas as empresas', add: 'Adicionar empresa' },
  ]
  const userLinks = [
    { to: '/perfil', label: 'Visão geral', icon: Grid2X2, end: true },
    ...(roles.includes('candidato') ? [
      { to: '/candidato/cv', label: 'Meus currículos', icon: FileText, end: false },
      { to: '/candidato/candidaturas', label: 'Minhas candidaturas', icon: Briefcase, end: false },
    ] : []),
    ...(roles.includes('autonomo') ? [
      { to: '/autonomo/perfil', label: 'Perfil de serviços', icon: UserRound, end: false },
      { to: '/autonomo/plano', label: 'Plano de autônomo', icon: Grid2X2, end: false },
    ] : []),
    ...(roles.includes('empresa_owner') ? [
      { to: '/empresa/painel', label: 'Minha empresa', icon: Building2, end: true },
      { to: '/empresa/vagas', label: 'Vagas e candidatos', icon: Briefcase, end: false },
      { to: '/empresa/perfil', label: 'Perfil da empresa', icon: UserRound, end: false },
      { to: '/empresa/plano', label: 'Plano da empresa', icon: Grid2X2, end: false },
      { to: '/empresa/banco-de-curriculos', label: 'Banco de currículos', icon: FileText, end: false },
    ] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Administração', icon: Settings, end: false }] : []),
    { to: '/perfil/conta', label: 'Configurações da conta', icon: Settings, end: false },
  ]
  const adminLinks = [
    { to: '/admin/artigos', label: 'Blog · artigos', icon: BookOpen, end: false },
    { to: '/admin/paginas', label: 'Páginas do site', icon: FileText, end: false },
    { to: '/admin/usuarios', label: 'Usuários e acessos', icon: Users, end: false },
    { to: '/admin/aparencia', label: 'Aparência', icon: Palette, end: false },
    { to: '/admin/planos', label: 'Planos', icon: Grid2X2, end: false },
    { to: '/admin/ads', label: 'Destaques', icon: Briefcase, end: false },
    { to: '/perfil/conta', label: 'Minha conta', icon: Settings, end: false },
  ]
  const linkClass = ({ isActive }: { isActive: boolean }) => cn('flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-white', isActive ? 'bg-white/15 font-semibold text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white')
  const navigation = <>
    {admin && <div className="mb-5 border-b border-white/20 pb-5"><Logo asLink={false} size="sm" className="[&>span:last-child]:text-white [&>span:last-child>span]:text-brand-orange" /><p className="mt-3 text-xs text-blue-100">Administração</p></div>}
    <div className="mb-5 flex items-center gap-3 border-b border-white/20 pb-5"><InitialsAvatar name={profile?.full_name ?? 'Minha conta'} size="md" className="bg-white/15 text-white" /><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{profile?.full_name ?? 'Minha conta'}</p><p className="text-xs text-blue-100">{admin ? 'Gestão do EmpregaSantana' : 'Seu espaço no EmpregaSantana'}</p></div></div>
    <nav aria-label={admin ? 'Administração' : 'Opções do usuário'} className="flex flex-col gap-1">
      {admin ? <><NavLink to="/admin" end className={linkClass}><Grid2X2 className="size-4 shrink-0" />Painel</NavLink>
        {resources.map(({ to, label, icon: Icon, create, all, add }) => <div key={to}><NavLink to={to} className={linkClass}><Icon className="size-4 shrink-0" />{label}<ChevronRight className={cn('ml-auto size-3.5', location.pathname.startsWith(to) && 'rotate-90')} /></NavLink>{location.pathname.startsWith(to) && <div className="my-1 ml-4 flex flex-col gap-1 border-l border-white/25 pl-3"><NavLink to={to} end className={linkClass}>{all}</NavLink><NavLink to={create} className={linkClass}>{add}</NavLink></div>}</div>)}
        <div><NavLink to="/admin/configuracoes/categorias" className={() => linkClass({ isActive: location.pathname.startsWith('/admin/configuracoes') })}><Settings className="size-4 shrink-0" />Configurações<ChevronRight className={cn('ml-auto size-3.5', location.pathname.startsWith('/admin/configuracoes') && 'rotate-90')} /></NavLink>{location.pathname.startsWith('/admin/configuracoes') && <div className="my-1 ml-4 flex flex-col gap-1 border-l border-white/25 pl-3"><NavLink to="/admin/configuracoes/categorias" className={linkClass}>Categorias</NavLink><NavLink to="/admin/configuracoes/tipos" className={linkClass}>Tipos de cadastro</NavLink></div>}</div>
        {adminLinks.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={linkClass}><Icon className="size-4 shrink-0" />{label}</NavLink>)}
        <Link to="/" className={linkClass({ isActive: false })}><ExternalLink className="size-4 shrink-0" />Visitar o site</Link>
      </> : <>{userLinks.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={linkClass}><Icon className="size-4 shrink-0" /><span>{label}</span></NavLink>)}<Link to="/perfil#perfis" className={linkClass({ isActive: false })}><UserRound className="size-4" />Adicionar perfil</Link></>}
      <button type="button" className={cn(linkClass({ isActive: false }), 'mt-4 border-t border-white/20 text-left')} onClick={async () => { await signOut(); navigate('/') }}><LogOut className="size-4 shrink-0" />Sair da conta</button>
    </nav>
  </>
  const sidebarClass = 'bg-brand-ink text-white'
  return <div className={admin ? 'min-h-dvh lg:pl-64' : 'grid min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8'}>
    <aside className={cn(sidebarClass, admin ? 'fixed inset-y-0 left-0 hidden w-64 overflow-y-auto p-4 lg:block' : 'hidden min-w-0 self-start rounded-xl p-4 lg:block')}>{navigation}</aside>
    <div className={cn('min-w-0', admin && 'px-4 py-6 sm:px-8 lg:py-10')}>
      <Button type="button" variant="outline" className="mb-6 lg:hidden" onClick={() => drawer.current?.showModal()} aria-haspopup="dialog"><Menu />{admin ? 'Menu da administração' : 'Meu painel'}</Button>
      {admin ? <main id="main-content" className="mx-auto max-w-7xl">{children}</main> : children}
    </div>
    <dialog ref={drawer} aria-label={admin ? 'Menu da administração' : 'Meu painel'} className={cn(sidebarClass, 'panel-drawer m-0 h-dvh max-h-dvh w-[min(360px,92vw)] max-w-none border-0 p-5 backdrop:bg-brand-ink/50')}>
      <div className="mb-6 flex items-center justify-between gap-3"><strong>{admin ? 'Administração' : 'Meu painel'}</strong><button type="button" className="grid size-11 shrink-0 place-items-center rounded-md hover:bg-white/10 focus-visible:outline-white" aria-label="Fechar menu do painel" onClick={() => drawer.current?.close()}><X /></button></div>{navigation}
    </dialog>
  </div>
}
