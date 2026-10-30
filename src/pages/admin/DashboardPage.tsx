import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminAviso, AdminHeader, Tag } from '@/components/admin/AdminKit'
import { Button } from '@/components/ui/button'
import { useAdminResumo } from '@/hooks/useAdmin'
import { dataBR } from '@/lib/format'
import { cn } from '@/lib/utils'

function Numero({ rotulo, valor, to, alerta = false }: { rotulo: string; valor: number | undefined; to: string; alerta?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex flex-col gap-1 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        alerta && valor ? 'border-brand-orange/60' : '',
      )}
    >
      <span className="text-sm text-muted-foreground">{rotulo}</span>
      <span className="font-display text-3xl leading-none font-extrabold tabular-nums">{valor ?? '—'}</span>
      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        Abrir <ArrowRight className="size-3" />
      </span>
    </Link>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3" aria-label={titulo}>
      <h2 className="font-display text-sm font-bold tracking-wide text-muted-foreground uppercase">{titulo}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{children}</div>
    </section>
  )
}

/** Visão geral da plataforma: o que precisa de atenção e os números de pessoas, empresas, publicações e seleções. */
export default function AdminDashboardPage() {
  const { profile } = useAuth()
  const { data: r, isLoading, isError } = useAdminResumo()
  const primeiroNome = profile?.full_name?.split(' ')[0]

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title={primeiroNome ? `Olá, ${primeiroNome}` : 'Visão geral'} description="Você é superadmin: gerencia empresas, usuários, vagas, autônomos, categorias e as páginas do site." />

      {isError && <AdminAviso>Não foi possível carregar os números agora. Recarregue a página.</AdminAviso>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}

      {r && r.empresas.pendentes > 0 && (
        <section aria-label="Precisa de atenção" className="flex flex-col gap-3 rounded-2xl bg-brand-orange/12 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold">
              {r.empresas.pendentes === 1 ? '1 empresa espera aprovação' : `${r.empresas.pendentes} empresas esperam aprovação`}
            </h2>
            <Button asChild size="sm">
              <Link to="/admin/empresas?situacao=pendentes">Revisar empresas</Link>
            </Button>
          </div>
          <ul className="flex flex-col divide-y divide-brand-orange/25">
            {r.empresasPendentes.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="font-medium">
                  {e.nome_fantasia}
                  <span className="font-normal text-muted-foreground">
                    {' '}
                    · {[e.city, e.state].filter(Boolean).join(', ') || 'sem cidade'} · cadastro em {dataBR(e.created_at)}
                  </span>
                </span>
                <Link to={`/admin/empresas/${e.id}`} className="font-semibold text-primary hover:underline">
                  Ver dados
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Grupo titulo="Pessoas">
        <Numero rotulo="Usuários" valor={r?.usuarios} to="/admin/usuarios" />
        <Numero rotulo="Candidatos" valor={r?.candidatos} to="/admin/usuarios" />
        <Numero rotulo="Autônomos" valor={r?.autonomosPerfil} to="/admin/autonomos" />
        <Numero rotulo="Donos de empresa" valor={r?.empresasDonas} to="/admin/empresas" />
        <Numero rotulo="Superadmins" valor={r?.admins} to="/admin/usuarios" />
        <Numero rotulo="Contas desativadas" valor={r?.inativos} to="/admin/usuarios" />
      </Grupo>

      <Grupo titulo="Empresas">
        <Numero rotulo="Ativas" valor={r?.empresas.ativas} to="/admin/empresas?situacao=ativas" />
        <Numero rotulo="Pendentes de aprovação" valor={r?.empresas.pendentes} to="/admin/empresas?situacao=pendentes" alerta />
        <Numero rotulo="Suspensas" valor={r?.empresas.suspensas} to="/admin/empresas?situacao=suspensas" />
      </Grupo>

      <Grupo titulo="Publicações">
        <Numero rotulo="Vagas publicadas" valor={r?.vagas.publicadas} to="/admin/vagas" />
        <Numero rotulo="Vagas em rascunho" valor={r?.vagas.rascunho} to="/admin/vagas" />
        <Numero rotulo="Vagas pausadas ou encerradas" valor={r ? r.vagas.pausadas + r.vagas.encerradas : undefined} to="/admin/vagas" />
        <Numero rotulo="Autônomos no site" valor={r?.autonomos.ativos} to="/admin/autonomos" />
        <Numero rotulo="Autônomos pausados" valor={r?.autonomos.pausados} to="/admin/autonomos" />
      </Grupo>

      <Grupo titulo="Seleção e contratação">
        <Numero rotulo="Candidaturas" valor={r?.candidaturas} to="/admin/processos" />
        <Numero rotulo="Processos em andamento" valor={r?.processos.andamento} to="/admin/processos" />
        <Numero rotulo="Contratações" valor={r?.processos.contratados} to="/admin/processos" />
        <Numero rotulo="Processos encerrados" valor={r?.processos.encerrados} to="/admin/processos" />
      </Grupo>

      {r && r.vagas.semEmpresa > 0 && (
        <p className="text-sm text-muted-foreground">
          <Tag tone="red">Atenção</Tag> {r.vagas.semEmpresa === 1 ? '1 vaga está sem empresa' : `${r.vagas.semEmpresa} vagas estão sem empresa`}.{' '}
          <Link to="/admin/vagas" className="font-semibold text-primary hover:underline">
            Ver vagas
          </Link>
        </p>
      )}

      {r && r.ultimosUsuarios.length > 0 && (
        <section aria-label="Últimos cadastros" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-bold tracking-wide text-muted-foreground uppercase">Últimos cadastros</h2>
            <Link to="/admin/usuarios" className="text-sm font-semibold text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">
            {r.ultimosUsuarios.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span className="font-medium">{u.full_name ?? u.email}</span>
                <span className="text-muted-foreground">
                  {u.email} · {dataBR(u.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
