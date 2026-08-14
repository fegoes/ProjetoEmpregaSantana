// Vercel Edge Middleware — pré-renderização pra bots/crawlers sem JS.
//
// O app é uma SPA client-rendered: título, meta description, JSON-LD e o
// conteúdo de vaga/autônomo/empresa só existem depois que o React monta e
// consulta o Supabase. O Googlebot executa JS e indexa mesmo assim (com
// atraso, numa segunda passada), mas a maioria dos outros crawlers — Bing e
// praticamente todo bot de IA (GPTBot, ClaudeBot, PerplexityBot etc.) — só
// lê o HTML bruto da primeira resposta. Pra esses, hoje a página é uma
// casca vazia.
//
// Esse middleware detecta esses agentes pelo User-Agent e, só pras rotas
// públicas de conteúdo, devolve HTML já pronto (buscado direto do Supabase
// via REST, sem depender do bundle React) com título, meta description,
// JSON-LD e o texto da vaga/autônomo/empresa em markup semântico simples.
// Usuário comum (e o próprio Googlebot, que já funciona) passa direto pra
// SPA de sempre — o middleware não muda nada pra eles.

import { next } from '@vercel/edge'

const SUPABASE_URL = 'https://poxqrdbzlsvcoskqugrm.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBveHFyZGJ6bHN2Y29za3F1Z3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDQzNDAsImV4cCI6MjEwMjIyMDM0MH0.6_pRgEVfHeotwoav-rojqfariFpKm106qy2BGeLPd3c'

export const config = {
  matcher: ['/((?!assets|.*\\..*).*)'],
}

// Bots que NÃO executam JavaScript e por isso precisam do HTML pronto.
// Deliberadamente não inclui Googlebot/Bing-render — esses já renderizam
// JS e o site já funciona pra eles; interceptar à toa só adicionaria
// latência sem necessidade.
const NO_JS_BOT_PATTERN =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|PerplexityBot|Perplexity-User|CCBot|Google-Extended|Applebot-Extended|Bytespider|Amazonbot|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|DuckDuckBot|YandexBot|Baiduspider|SemrushBot|AhrefsBot|MJ12bot/i

function isNoJsBot(userAgent: string | null): boolean {
  if (!userAgent) return false
  return NO_JS_BOT_PATTERN.test(userAgent)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(html: string | null | undefined, maxLength = 300): string {
  if (!html) return ''
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}

function jsonLdScript(data: Record<string, unknown>): string {
  // Evita a sequência "</script>" fechar a tag prematuramente se algum
  // valor de texto contiver isso.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return `<script type="application/ld+json">${json}</script>`
}

interface RenderPageOptions {
  siteUrl: string
  title: string
  description: string
  path: string
  image?: string | null
  jsonLd?: Record<string, unknown> | null
  bodyHtml: string
}

function renderPage(options: RenderPageOptions): string {
  const { siteUrl, title, description, path, image, jsonLd, bodyHtml } = options
  const canonical = `${siteUrl}${path}`
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeImage = image ? escapeHtml(image) : `${siteUrl}/og-image.png`

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeTitle}</title>
<meta name="description" content="${safeDescription}" />
<link rel="canonical" href="${canonical}" />
<meta name="robots" content="index, follow" />
<meta property="og:site_name" content="EmpregaSantana" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:image" content="${safeImage}" />
<meta property="og:url" content="${canonical}" />
<meta name="twitter:card" content="summary_large_image" />
${jsonLd ? jsonLdScript(jsonLd) : ''}
</head>
<body>
<header><a href="/">EmpregaSantana</a> — Somos a sua conexão de empregabilidade no sertão.</header>
<main>
${bodyHtml}
</main>
<footer><a href="/sobre">Sobre</a> · <a href="/planos">Planos</a> · <a href="/termos">Termos</a> · <a href="/privacidade">Privacidade</a> · <a href="/lgpd">LGPD</a></footer>
</body>
</html>`
}

async function supabaseSelect<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY },
  })
  if (!res.ok) return []
  return res.json()
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  clt: 'CLT',
  pj: 'PJ',
  temporario: 'Temporário',
  freelance: 'Freelance',
}

interface VagaRow {
  title: string
  description_html: string | null
  employment_type: string
  location_city: string | null
  location_state: string | null
  is_remote: boolean
  salary_min: number | null
  salary_max: number | null
  created_at: string
  empresas: { nome_fantasia: string; city: string | null; state: string | null; logo_url: string | null } | null
}

async function renderVaga(id: string, path: string, siteUrl: string): Promise<Response | null> {
  const rows = await supabaseSelect<VagaRow>(
    `vagas?id=eq.${id}&status=eq.published&select=title,description_html,employment_type,location_city,location_state,is_remote,salary_min,salary_max,created_at,updated_at,empresas(nome_fantasia,city,state,logo_url)`,
  )
  const vaga = rows[0]
  if (!vaga) return null

  const local = vaga.is_remote
    ? 'Remoto'
    : [vaga.location_city, vaga.location_state].filter(Boolean).join(', ') || 'A combinar'
  const empresaNome = vaga.empresas?.nome_fantasia ?? 'EmpregaSantana'
  const description = stripHtml(vaga.description_html) || `${vaga.title} em ${empresaNome}.`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: vaga.title,
    description: stripHtml(vaga.description_html, 5000) || vaga.title,
    datePosted: vaga.created_at,
    ...(vaga.employment_type && { employmentType: vaga.employment_type.toUpperCase() }),
    hiringOrganization: { '@type': 'Organization', name: empresaNome },
    jobLocation: vaga.is_remote
      ? undefined
      : {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: vaga.location_city,
            addressRegion: vaga.location_state,
            addressCountry: 'BR',
          },
        },
    ...(vaga.is_remote && {
      jobLocationType: 'TELECOMMUTE',
      applicantLocationRequirements: { '@type': 'Country', name: 'BR' },
    }),
    ...(vaga.salary_min && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'BRL',
        value: {
          '@type': 'QuantitativeValue',
          minValue: vaga.salary_min,
          maxValue: vaga.salary_max ?? vaga.salary_min,
          unitText: 'MONTH',
        },
      },
    }),
  }

  const bodyHtml = `
<article>
<h1>${escapeHtml(vaga.title)}</h1>
<p>${escapeHtml(empresaNome)} — ${escapeHtml(local)}${vaga.employment_type ? ` — ${escapeHtml(EMPLOYMENT_LABELS[vaga.employment_type] ?? vaga.employment_type)}` : ''}</p>
<div>${escapeHtml(stripHtml(vaga.description_html, 5000)).replace(/\n/g, '<br />')}</div>
</article>`

  return new Response(
    renderPage({
      siteUrl,
      title: `${vaga.title} — ${empresaNome} | EmpregaSantana`,
      description,
      path,
      image: vaga.empresas?.logo_url,
      jsonLd,
      bodyHtml,
    }),
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

interface AutonomoRow {
  headline: string | null
  description_html: string | null
  service_area_city: string | null
  service_area_state: string | null
  profiles: { full_name: string | null } | null
  categories: { label: string } | null
}

async function renderAutonomo(id: string, path: string, siteUrl: string): Promise<Response | null> {
  const rows = await supabaseSelect<AutonomoRow>(
    `autonomo_profiles?id=eq.${id}&status=eq.active&select=headline,description_html,service_area_city,service_area_state,pricing_model,hourly_rate,profiles(full_name),categories(label)`,
  )
  const autonomo = rows[0]
  if (!autonomo) return null

  const name = autonomo.profiles?.full_name ?? 'Profissional autônomo'
  const local = [autonomo.service_area_city, autonomo.service_area_state].filter(Boolean).join(', ') || 'A combinar'
  const description = stripHtml(autonomo.description_html) || autonomo.headline || `${name} no EmpregaSantana.`

  const bodyHtml = `
<article>
<h1>${escapeHtml(name)}</h1>
<p>${escapeHtml(autonomo.headline ?? '')}</p>
<p>${escapeHtml(autonomo.categories?.label ?? '')} — ${escapeHtml(local)}</p>
<div>${escapeHtml(stripHtml(autonomo.description_html, 5000)).replace(/\n/g, '<br />')}</div>
</article>`

  return new Response(
    renderPage({
      siteUrl,
      title: `${name} — ${autonomo.headline ?? 'Autônomo'} | EmpregaSantana`,
      description,
      path,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        jobTitle: autonomo.headline,
        description: stripHtml(autonomo.description_html, 5000),
      },
      bodyHtml,
    }),
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

interface EmpresaRow {
  nome_fantasia: string
  description_html: string | null
  sector: string | null
  city: string | null
  state: string | null
  logo_url: string | null
  website: string | null
}

async function renderEmpresa(id: string, path: string, siteUrl: string): Promise<Response | null> {
  const rows = await supabaseSelect<EmpresaRow>(
    `empresas?id=eq.${id}&status=eq.active&select=nome_fantasia,description_html,sector,city,state,logo_url,website`,
  )
  const empresa = rows[0]
  if (!empresa) return null

  const vagas = await supabaseSelect<{ id: string; title: string }>(
    `vagas?empresa_id=eq.${id}&status=eq.published&select=id,title&order=is_featured.desc,created_at.desc&limit=20`,
  )

  const description = stripHtml(empresa.description_html) || `${empresa.nome_fantasia} no EmpregaSantana.`
  const vagasList = vagas.map((v) => `<li><a href="/vagas/${v.id}">${escapeHtml(v.title)}</a></li>`).join('')

  const bodyHtml = `
<article>
<h1>${escapeHtml(empresa.nome_fantasia)}</h1>
<p>${escapeHtml(empresa.sector ?? '')} — ${escapeHtml([empresa.city, empresa.state].filter(Boolean).join(', '))}</p>
<div>${escapeHtml(stripHtml(empresa.description_html, 3000)).replace(/\n/g, '<br />')}</div>
<h2>Vagas abertas</h2>
<ul>${vagasList || '<li>Nenhuma vaga aberta no momento.</li>'}</ul>
</article>`

  return new Response(
    renderPage({
      siteUrl,
      title: `${empresa.nome_fantasia} | EmpregaSantana`,
      description,
      path,
      image: empresa.logo_url,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: empresa.nome_fantasia,
        description: stripHtml(empresa.description_html, 3000),
        ...(empresa.logo_url && { logo: empresa.logo_url }),
        ...(empresa.website && { url: empresa.website }),
      },
      bodyHtml,
    }),
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

interface VagaListItem {
  id: string
  title: string
  location_city: string | null
  location_state: string | null
  is_remote: boolean
  empresas: { nome_fantasia: string } | null
}

async function renderHome(path: string, siteUrl: string): Promise<Response> {
  const vagas = await supabaseSelect<VagaListItem>(
    `vagas?status=eq.published&select=id,title,employment_type,location_city,location_state,is_remote,empresas(nome_fantasia)&order=is_featured.desc,created_at.desc&limit=40`,
  )
  const items = vagas
    .map((v) => {
      const local = v.is_remote ? 'Remoto' : [v.location_city, v.location_state].filter(Boolean).join(', ')
      return `<li><a href="/vagas/${v.id}">${escapeHtml(v.title)}</a> — ${escapeHtml(v.empresas?.nome_fantasia ?? '')} (${escapeHtml(local || 'A combinar')})</li>`
    })
    .join('')

  const bodyHtml = `
<h1>Vagas e autônomos no sertão alagoano</h1>
<p>Somos muito mais que uma página: somos a sua conexão de empregabilidade no sertão. Vagas fixas, trabalhos temporários e autônomos — tudo em um só lugar.</p>
<h2>Vagas em destaque</h2>
<ul>${items || '<li>Nenhuma vaga publicada no momento.</li>'}</ul>
<p><a href="/explorar">Ver todas as vagas e autônomos</a></p>`

  return new Response(
    renderPage({
      siteUrl,
      title: 'EmpregaSantana — vagas e autônomos em um só lugar',
      description:
        'Somos muito mais que uma página, somos a sua conexão de empregabilidade no sertão. Vagas fixas e temporárias, e profissionais autônomos, em um só lugar.',
      path,
      bodyHtml,
    }),
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

interface PaginaRow {
  title: string
  content_html: string
}

async function renderStaticPage(slug: string, path: string, siteUrl: string, fallbackTitle: string): Promise<Response> {
  const rows = await supabaseSelect<PaginaRow>(`paginas_institucionais?slug=eq.${slug}&select=title,content_html`)
  const pagina = rows[0]
  const title = pagina?.title ?? fallbackTitle
  const description = stripHtml(pagina?.content_html) || fallbackTitle

  return new Response(
    renderPage({
      siteUrl,
      title: `${title} | EmpregaSantana`,
      description,
      path,
      bodyHtml: `<article><h1>${escapeHtml(title)}</h1><div>${escapeHtml(stripHtml(pagina?.content_html, 5000)).replace(/\n/g, '<br />')}</div></article>`,
    }),
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent')
  if (!isNoJsBot(userAgent)) return next()

  const url = new URL(request.url)
  const path = url.pathname
  const siteUrl = url.origin

  try {
    if (path === '/') {
      return await renderHome(path, siteUrl)
    }

    const vagaMatch = path.match(/^\/vagas\/([^/]+)$/)
    if (vagaMatch) {
      const res = await renderVaga(vagaMatch[1], path, siteUrl)
      if (res) return res
      return next()
    }

    const autonomoMatch = path.match(/^\/autonomos\/([^/]+)$/)
    if (autonomoMatch) {
      const res = await renderAutonomo(autonomoMatch[1], path, siteUrl)
      if (res) return res
      return next()
    }

    const empresaMatch = path.match(/^\/empresas\/([^/]+)$/)
    if (empresaMatch) {
      const res = await renderEmpresa(empresaMatch[1], path, siteUrl)
      if (res) return res
      return next()
    }

    if (path === '/sobre') return await renderStaticPage('sobre', path, siteUrl, 'Sobre o EmpregaSantana')
    if (path === '/termos') return await renderStaticPage('termos', path, siteUrl, 'Termos de uso')
    if (path === '/privacidade') return await renderStaticPage('privacidade', path, siteUrl, 'Política de privacidade')
    if (path === '/lgpd') return await renderStaticPage('lgpd', path, siteUrl, 'Privacidade e LGPD')
  } catch {
    // Se o Supabase falhar por qualquer motivo, cai pra SPA normal em vez
    // de mostrar erro pro bot.
    return next()
  }

  return next()
}
