import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/empresas', label: 'Empresas' },
  { to: '/admin/usuarios', label: 'Usuários' },
  { to: '/admin/planos', label: 'Planos' },
  { to: '/admin/vagas', label: 'Vagas' },
  { to: '/admin/ads', label: 'ADS' },
]

export default function AdminLayout() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="flex gap-2 lg:w-48 lg:flex-col">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
