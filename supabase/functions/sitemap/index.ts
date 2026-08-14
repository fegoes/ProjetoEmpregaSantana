// Sitemap XML dinâmico — gerado a partir dos dados reais (vagas publicadas,
// autônomos ativos, empresas ativas) em vez de um arquivo estático que fica
// desatualizado. Rode `supabase functions deploy sitemap` para publicar.
//
// Depois do deploy, configure no host do front-end (ex.: vercel.json) um
// rewrite de /sitemap.xml para esta função, e defina a env var SITE_URL
// (nas secrets da function) com o domínio final em produção.
import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://empregasantana.example.com'

const STATIC_ROUTES = ['', '/explorar', '/planos', '/sobre', '/termos', '/privacidade']

function xmlEscape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function urlEntry(path: string, lastmod?: string | null) {
  const loc = xmlEscape(`${SITE_URL}${path}`)
  const lastmodTag = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''
  return `<url><loc>${loc}</loc>${lastmodTag}</url>`
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const [vagas, autonomos, empresas] = await Promise.all([
    supabase.from('vagas').select('id, updated_at').eq('status', 'published'),
    supabase.from('autonomo_profiles').select('id, updated_at').eq('status', 'active'),
    supabase.from('empresas').select('id, updated_at').eq('status', 'active'),
  ])

  const entries = [
    ...STATIC_ROUTES.map((path) => urlEntry(path)),
    ...(vagas.data ?? []).map((v) => urlEntry(`/vagas/${v.id}`, v.updated_at)),
    ...(autonomos.data ?? []).map((a) => urlEntry(`/autonomos/${a.id}`, a.updated_at)),
    ...(empresas.data ?? []).map((e) => urlEntry(`/empresas/${e.id}`, e.updated_at)),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})
