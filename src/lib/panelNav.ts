import {
  BriefcaseBusiness,
  Building2,
  CreditCard,
  FileSearch,
  FileText,
  FilePlus2,
  LayoutDashboard,
  Megaphone,
  Send,
  Tags,
  UserCog,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types/database'

// Perfis do painel. "admin" é o superadmin da plataforma; "empresa" é o dono de
// empresa. São papéis diferentes: um não dá acesso ao outro.
export type PanelArea = 'admin' | 'empresa' | 'candidato' | 'autonomo' | 'conta'

export interface PanelUser {
  isAdmin: boolean
  roles: UserRole[]
}

export interface PanelNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export interface PanelNavGroup {
  label?: string
  items: PanelNavItem[]
}

export interface PanelAreaMeta {
  /** Nome que aparece no topo do menu lateral */
  title: string
  /** Texto curto do seletor de perfil */
  switchLabel: string
  /** Botão "ir para o site" do painel */
  siteButton: { label: string; to: (userId: string) => string }
  groups: PanelNavGroup[]
}

export const PANEL_AREAS: Record<PanelArea, PanelAreaMeta> = {
  admin: {
    title: 'Superadmin',
    switchLabel: 'Superadmin da plataforma',
    siteButton: { label: 'Ver o site', to: () => '/' },
    groups: [
      {
        label: 'Plataforma',
        items: [
          { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, end: true },
          { to: '/admin/empresas', label: 'Empresas', icon: Building2 },
          { to: '/admin/usuarios', label: 'Usuários', icon: Users },
          { to: '/admin/vagas', label: 'Vagas', icon: BriefcaseBusiness },
        ],
      },
      {
        label: 'Comercial',
        items: [
          { to: '/admin/planos', label: 'Planos', icon: CreditCard },
          { to: '/admin/ads', label: 'ADS', icon: Megaphone },
        ],
      },
      {
        label: 'Conteúdo e sistema',
        items: [
          { to: '/admin/paginas', label: 'Páginas institucionais', icon: FileText },
          { to: '/admin/categorias', label: 'Categorias', icon: Tags },
        ],
      },
    ],
  },
  empresa: {
    title: 'Painel da empresa',
    switchLabel: 'Empresa',
    siteButton: { label: 'Ver o site', to: () => '/' },
    groups: [
      {
        label: 'Contratação',
        items: [
          { to: '/empresa/painel', label: 'Visão geral', icon: LayoutDashboard, end: true },
          { to: '/empresa/vagas', label: 'Minhas vagas', icon: BriefcaseBusiness, end: true },
          { to: '/empresa/vagas/nova', label: 'Nova vaga', icon: FilePlus2 },
          { to: '/empresa/banco-de-curriculos', label: 'Banco de currículos', icon: FileSearch },
        ],
      },
      {
        label: 'Minha empresa',
        items: [
          { to: '/empresa/perfil', label: 'Perfil da empresa', icon: Building2 },
          { to: '/empresa/plano', label: 'Plano', icon: CreditCard },
        ],
      },
    ],
  },
  candidato: {
    title: 'Painel do candidato',
    switchLabel: 'Candidato',
    siteButton: { label: 'Encontrar vagas', to: () => '/' },
    groups: [
      {
        label: 'Minha busca',
        items: [
          { to: '/candidato/candidaturas', label: 'Candidaturas', icon: Send },
          { to: '/candidato/cv', label: 'Currículos', icon: FileText },
        ],
      },
    ],
  },
  autonomo: {
    title: 'Painel do autônomo',
    switchLabel: 'Autônomo',
    siteButton: { label: 'Ver meu perfil público', to: (userId) => `/autonomos/${userId}` },
    groups: [
      {
        label: 'Meus serviços',
        items: [
          { to: '/autonomo/perfil', label: 'Meu perfil', icon: Wrench },
          { to: '/autonomo/plano', label: 'Plano', icon: CreditCard },
        ],
      },
    ],
  },
  conta: {
    title: 'Minha conta',
    switchLabel: 'Minha conta',
    siteButton: { label: 'Ir para o site', to: () => '/' },
    groups: [
      {
        items: [
          { to: '/perfil', label: 'Meus perfis', icon: UserRound, end: true },
          { to: '/perfil/conta', label: 'Dados e senha', icon: UserCog },
        ],
      },
    ],
  },
}

/** Qual painel o endereço pertence. */
export function areaFromPath(pathname: string): PanelArea {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin'
  if (pathname.startsWith('/empresa/')) return 'empresa'
  if (pathname.startsWith('/candidato/')) return 'candidato'
  if (pathname.startsWith('/autonomo/')) return 'autonomo'
  return 'conta'
}

/** Perfis que a pessoa tem e, portanto, painéis que ela pode abrir (superadmin primeiro). */
export function availableAreas(user: PanelUser): PanelArea[] {
  const areas: PanelArea[] = []
  if (user.isAdmin) areas.push('admin')
  if (user.roles.includes('empresa_owner')) areas.push('empresa')
  if (user.roles.includes('candidato')) areas.push('candidato')
  if (user.roles.includes('autonomo')) areas.push('autonomo')
  return areas
}

export function areaHomePath(area: PanelArea): string {
  switch (area) {
    case 'admin':
      return '/admin'
    case 'empresa':
      return '/empresa/painel'
    case 'candidato':
      return '/candidato/candidaturas'
    case 'autonomo':
      return '/autonomo/perfil'
    default:
      return '/perfil'
  }
}

/** Destino do botão "Meu painel": o primeiro perfil da pessoa, ou a página de perfis se ainda não tem nenhum. */
export function panelPathFor(user: PanelUser): string {
  const [first] = availableAreas(user)
  return first ? areaHomePath(first) : '/perfil'
}

/**
 * Para onde ir logo depois do login (quando não há um destino pedido):
 * quem gerencia (superadmin e empresa) cai no painel; candidato e autônomo
 * caem no site, nas vagas.
 */
export function landingPathFor(user: PanelUser): string {
  if (user.isAdmin) return '/admin'
  if (user.roles.includes('empresa_owner')) return '/empresa/painel'
  return '/'
}
