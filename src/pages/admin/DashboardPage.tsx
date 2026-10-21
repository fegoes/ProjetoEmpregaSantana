import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function AdminDashboardPage() {
  const query = useQuery({ queryKey: ['admin', 'counts'], queryFn: async () => {
    const results = await Promise.all([
      supabase.from('vagas').select('id', { count: 'exact', head: true }),
      supabase.from('autonomo_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('empresas').select('id', { count: 'exact', head: true }),
      supabase.from('artigos').select('id', { count: 'exact', head: true }),
    ])
    for (const result of results) if (result.error) throw result.error
    return results.map(result => result.count ?? 0)
  } })
  const sections = [
    { path: 'vagas', name: 'Vagas', description: 'Cadastre oportunidades, revise informações e controle a publicação.' },
    { path: 'profissionais', name: 'Profissionais', description: 'Organize os serviços, regiões de atendimento e perfis publicados.' },
    { path: 'empresas', name: 'Empresas', description: 'Gerencie cadastros, responsáveis e verificação das empresas.' },
    { path: 'artigos', name: 'Blog', description: 'Prepare rascunhos, revise orientações e publique novos artigos.' },
  ]
  return <div className="space-y-8"><div><h1 className="text-2xl font-extrabold">Painel administrativo</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Cuide das oportunidades, das pessoas e do conteúdo do EmpregaSantana.</p></div>
    {query.isError && <div role="alert" className="rounded-xl border p-5"><p className="text-sm">Não foi possível atualizar os totais. Você pode acessar as áreas abaixo e tentar novamente.</p><Button className="mt-3" variant="outline" onClick={() => query.refetch()}>Atualizar totais</Button></div>}
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{sections.map((section, i) => <div key={section.path} className="border-b pb-5"><p className="text-sm text-muted-foreground">{section.name}</p><p className="mt-3 text-3xl font-semibold text-brand-ink" aria-label={`${section.name}: ${query.isLoading ? 'carregando' : query.isError ? 'indisponível' : query.data?.[i] ?? 0}`}>{query.isLoading || query.isError ? '—' : query.data?.[i] ?? 0}</p></div>)}</div>
    <section><h2 className="mb-5 text-lg font-bold">Gerenciar a plataforma</h2><div className="divide-y rounded-xl border bg-card px-5 sm:px-7">{sections.map(section => <Link key={section.path} to={`/admin/${section.path}`} className="flex min-h-24 items-center justify-between gap-4 py-5"><div className="min-w-0"><h3 className="font-semibold text-primary">{section.name}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.description}</p></div><ArrowRight className="size-5 shrink-0 text-primary" /></Link>)}</div></section>
    <section className="flex flex-col items-start justify-between gap-5 rounded-xl bg-accent p-6 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-brand-ink">Aparência do site e sistema</h2><p className="mt-2 text-sm leading-relaxed">Ajuste cores, texto e controles mantendo a identidade do projeto.</p></div><Button asChild variant="outline" className="shrink-0"><Link to="/admin/aparencia">Personalizar aparência</Link></Button></section>
  </div>
}
