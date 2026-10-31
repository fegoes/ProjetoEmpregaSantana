import { publicLayoutHtml } from './src/lib/publicLayoutHtml'
import { buildJobPosting, isOpenJob, type PublicJob } from './src/lib/jobSeo'
import { isPrivatePath } from './src/lib/authFlow'
// HTML sem JavaScript para buscadores e prévias de link, sempre consultando
// apenas dados públicos com a chave anônima. Humanos continuam na aplicação
// React; metadata e JobPosting usam a mesma função nas duas renderizações.
import { next } from '@vercel/edge'


export const config = {
  matcher: ['/sitemap.xml', '/robots.txt', '/((?!assets|.*\\..*).*)'],
}

// Google, Bing, leitores sem JavaScript e agentes de prévia de links.
const NO_JS_BOT_PATTERN =
  /Googlebot|Google-InspectionTool|bingbot|BingPreview|GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-Web|anthropic-ai|PerplexityBot|Perplexity-User|CCBot|Google-Extended|Applebot-Extended|Bytespider|Amazonbot|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|DuckDuckBot|YandexBot|Baiduspider|SemrushBot|AhrefsBot|MJ12bot/i

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
  socialTitle?: string
  socialDescription?: string
  imageAlt?: string
  canonicalUrl?: string | null
  noindex?: boolean
  keywords?: string[]
  article?: boolean
}

function renderPage(options: RenderPageOptions): string {
  const { siteUrl, title, description, path, image, jsonLd, bodyHtml } = options
  const canonical = escapeHtml(options.canonicalUrl || `${siteUrl}${path}`)
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
<meta name="robots" content="${options.noindex ? 'noindex, follow' : 'index, follow'}" />
<meta name="keywords" content="${escapeHtml((options.keywords ?? []).join(', '))}" />
<meta property="og:site_name" content="EmpregaSantana" />
<meta property="og:type" content="${options.article ? 'article' : 'website'}" />
<meta property="og:title" content="${escapeHtml(options.socialTitle || title)}" />
<meta property="og:description" content="${escapeHtml(options.socialDescription || description)}" />
<meta property="og:image" content="${safeImage}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image:alt" content="${escapeHtml(options.imageAlt || '')}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(options.socialTitle || title)}" />
<meta name="twitter:description" content="${escapeHtml(options.socialDescription || description)}" />
<meta name="twitter:image" content="${safeImage}" />
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
  const projectUrl = process.env.VITE_SUPABASE_URL
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!projectUrl || !publicKey) throw new Error('Configuração pública ausente')
  const res = await fetch(`${projectUrl}/rest/v1/${path}`, {
    headers: { apikey: publicKey }, signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error('Consulta pública indisponível')
  return res.json()
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  clt: 'CLT',
  pj: 'PJ',
  temporario: 'Temporário',
  freelance: 'Freelance',
}

type VagaRow = PublicJob

async function renderVaga(id: string, path: string, siteUrl: string): Promise<Response | null> {
  const rows = await supabaseSelect<VagaRow>(
    `vagas?id=eq.${encodeURIComponent(id)}&status=eq.published&or=(expires_at.is.null,expires_at.gt.${new Date().toISOString()})&select=title,description_html,status,expires_at,pricing_model,hourly_rate,employment_type,location_city,location_state,is_remote,salary_visible,salary_min,salary_max,created_at,updated_at,empresas(nome_fantasia,city,state,logo_url)`,
  )
  const vaga = rows[0]
  if (!vaga || !isOpenJob(vaga)) return new Response('Vaga não disponível', {status:404,headers:{'content-type':'text/plain; charset=utf-8','X-Robots-Tag':'noindex'}})

  const local = vaga.is_remote
    ? 'Remoto'
    : [vaga.location_city, vaga.location_state].filter(Boolean).join(', ') || 'A combinar'
  const empresaNome = vaga.empresas?.nome_fantasia ?? 'EmpregaSantana'
  const description = stripHtml(vaga.description_html) || `${vaga.title} em ${empresaNome}.`

  const jsonLd = buildJobPosting(vaga, `${siteUrl}${path}`)

  const bodyHtml = `
<article>
<h1>${escapeHtml(vaga.title)}</h1>
<p>${escapeHtml(empresaNome)} — ${escapeHtml(local)}${vaga.employment_type ? ` — ${escapeHtml(EMPLOYMENT_LABELS[vaga.employment_type] ?? vaga.employment_type)}` : ''}</p>
<div>${escapeHtml(stripHtml(vaga.description_html, Number.MAX_SAFE_INTEGER)).replace(/\n/g, '<br />')}</div>
<p><a href="/login?redirect=${encodeURIComponent(path+'?candidatar=1')}">Candidatar-se a esta vaga</a></p>
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
    `autonomo_profiles?id=eq.${encodeURIComponent(id)}&status=eq.active&select=headline,description_html,service_area_city,service_area_state,pricing_model,hourly_rate,profiles(full_name),categories(label)`,
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
    `empresas?id=eq.${encodeURIComponent(id)}&status=eq.active&select=nome_fantasia,description_html,sector,city,state,logo_url,website`,
  )
  const empresa = rows[0]
  if (!empresa) return null

  const vagas = await supabaseSelect<{ id: string; title: string }>(
    `vagas?empresa_id=eq.${encodeURIComponent(id)}&status=eq.published&or=(expires_at.is.null,expires_at.gt.${new Date().toISOString()})&select=id,title&order=is_featured.desc,created_at.desc&limit=20`,
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

async function renderHome(path: string, siteUrl: string): Promise<Response> {
  const rows=await supabaseSelect<PaginaRow>('paginas_institucionais?slug=eq.inicio&select=title,content_html,layout,seo_description')
  const custom=rows[0]
  const layout=publicLayoutHtml(custom?.layout)
  const bodyHtml=layout?`<h1>${escapeHtml(custom.title)}</h1>${layout}`:`
    <h1>Seu próximo passo começa perto de casa.</h1>
    <p>Quem procura trabalho e quem precisa de um profissional têm um lugar para se encontrar. Vagas, serviços e conexões que movimentam o nosso sertão.</p>
    <img src="/illustrations/nossa-gente.png" alt="Uma candidata, um profissional de serviços e uma empresária da região, juntos." />
    <p><a href="/explorar">Encontrar oportunidades</a></p>
    <h2>Um lugar. Diferentes caminhos.</h2>
    <h3>Para quem quer trabalhar.</h3><p>Encontre vagas na região e escolha o currículo certo para cada oportunidade.</p><img src="/illustrations/curriculo.jpg" alt="Uma candidata prepara seu currículo." />
    <h3>Para quem faz acontecer.</h3><p>Apresente seu serviço, mostre seu portfólio e deixe claro onde você atende.</p><img src="/illustrations/servicos.jpg" alt="Um profissional apresenta seu trabalho." />
    <h3>Para quem precisa contratar.</h3><p>Divulgue oportunidades e organize as candidaturas recebidas.</p><img src="/illustrations/contratacao.jpg" alt="Uma empresária conversa com um candidato." />
    <p><a href="/cadastro?perfil=empresa">Publicar uma vaga</a> · <a href="/blog">Dicas de carreira</a></p>`
  return new Response(renderPage({siteUrl,path,title:`${layout?custom.title:'Seu próximo passo começa perto de casa'} | EmpregaSantana`,description:custom?.seo_description||'Vagas, serviços e conexões que movimentam o nosso sertão. Conheça o EmpregaSantana.',bodyHtml}),{headers:{'content-type':'text/html; charset=utf-8'}})
}

interface PaginaRow {
  title: string
  content_html: string
  layout?: unknown
  seo_description?: string
}

async function renderStaticPage(slug: string, path: string, siteUrl: string, fallbackTitle: string): Promise<Response> {
  const rows = await supabaseSelect<PaginaRow>(`paginas_institucionais?slug=eq.${encodeURIComponent(slug)}&select=title,content_html,layout,seo_description`)
  const pagina = rows[0]
  if (!pagina && path.startsWith('/pagina/')) return new Response('Página não encontrada',{status:404,headers:{'X-Robots-Tag':'noindex'}})
  const layout=publicLayoutHtml(pagina?.layout)
  const title = pagina?.title ?? fallbackTitle
  const description = pagina?.seo_description || stripHtml(pagina?.content_html) || fallbackTitle

  return new Response(
    renderPage({
      siteUrl,
      title: `${title} | EmpregaSantana`,
      description,
      path,
      bodyHtml: `<article><h1>${escapeHtml(title)}</h1><div>${layout || escapeHtml(stripHtml(pagina?.content_html, Number.MAX_SAFE_INTEGER)).replace(/\n/g, '<br />')}</div></article>`,
    }),
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

interface BlogRow {
  cover_alt: string;
  seo_title: string; seo_description: string; social_title: string; social_description: string; social_image_url: string | null; social_image_alt: string; canonical_url: string | null; noindex: boolean; keywords: string[];
  slug: string
  title: string
  excerpt: string
  content_html: string
  author_name: string
  cover_url: string | null
  published_at: string
  updated_at: string
}

async function renderBlog(path: string, siteUrl: string, slug?: string): Promise<Response | null> {
  const params = new URLSearchParams({ status: 'eq.published', published_at: `lte.${new Date().toISOString()}`, select: '*', order: 'published_at.desc' })
  if (slug) params.set('slug', `eq.${slug}`)
  const rows = await supabaseSelect<BlogRow>(`artigos?${params}`)
  const article = slug ? rows[0] : undefined
  if (slug && !article) return new Response('Artigo não encontrado', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } })
  const title = article?.title ?? 'Dicas de carreira'
  const description = article?.excerpt ?? 'Orientação para o seu próximo passo, com o EmpregaSantana.'
  const bodyHtml = article
    ? `<article><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.author_name)}</p><p>${escapeHtml(article.excerpt)}</p><div>${escapeHtml(stripHtml(article.content_html, 30000))}</div></article>`
    : `<main><h1>Orientação para o seu próximo passo.</h1><ul>${rows.map(a => `<li><a href="/blog/${escapeHtml(a.slug)}">${escapeHtml(a.title)}</a><p>${escapeHtml(a.excerpt)}</p></li>`).join('')}</ul></main>`
  const jsonLd = article ? { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title, description, author: { '@type': 'Person', name: article.author_name }, datePublished: article.published_at, dateModified: article.updated_at } : undefined
  return new Response(renderPage({ siteUrl, title: `${article?.seo_title || title} | EmpregaSantana`, description: article?.seo_description || description, path, image: article?.social_image_url || article?.cover_url, socialTitle: article?.social_title || article?.title, socialDescription: article?.social_description || article?.excerpt, imageAlt: article?.social_image_alt || article?.cover_alt, canonicalUrl: article?.canonical_url, noindex: article?.noindex, keywords: article?.keywords, article: Boolean(article), jsonLd, bodyHtml }), { headers: { 'content-type': 'text/html; charset=utf-8' } })
}

async function renderSitemap(siteUrl: string): Promise<Response> {
  try {
    const collect = async (table: string, filters: string, path: (row: {id:string;slug?:string;updated_at?:string})=>string) => {
      const entries: string[]=[]
      for(let offset=0;offset<50000;offset+=1000){
        const rows=await supabaseSelect<{id:string;slug?:string;updated_at?:string}>(`${table}?${filters}&limit=1000&offset=${offset}`)
        for(const row of rows)entries.push(`<url><loc>${escapeHtml(siteUrl+path(row))}</loc>${row.updated_at?`<lastmod>${escapeHtml(new Date(row.updated_at).toISOString())}</lastmod>`:''}</url>`)
        if(rows.length<1000)break
      }
      return entries
    }
    const [jobs,professionals,companies,posts,pages]=await Promise.all([
      collect('vagas',`select=id,updated_at&status=eq.published&or=(expires_at.is.null,expires_at.gt.${new Date().toISOString()})&order=id`,r=>`/vagas/${r.id}`),
      collect('autonomo_profiles','select=id,updated_at&status=eq.active&order=id',r=>`/autonomos/${r.id}`),
      collect('empresas','select=id,updated_at&status=eq.active&order=id',r=>`/empresas/${r.id}`),
      collect('artigos',`select=id,slug,updated_at&status=eq.published&noindex=eq.false&published_at=lte.${new Date().toISOString()}&order=id`,r=>`/blog/${r.slug}`),
      collect('paginas_institucionais','select=id,slug,updated_at&is_published=eq.true&is_system=eq.false&order=id',r=>`/pagina/${r.slug}`),
    ])
    const staticPaths=['','/explorar','/empresas','/blog','/sobre','/planos','/termos','/privacidade','/lgpd']
    const entries=[...staticPaths.map(p=>`<url><loc>${escapeHtml(siteUrl+p)}</loc></url>`),...jobs,...professionals,...companies,...posts,...pages]
    if(entries.length>50000)throw new Error('Sitemap requer particionamento')
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`,{headers:{'content-type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=60, s-maxage=300'}})
  } catch {return new Response('Sitemap temporariamente indisponível',{status:503,headers:{'Retry-After':'60'}})}
}

async function renderCompanyDirectory(path:string,siteUrl:string) {
  const rows=await supabaseSelect<{id:string;nome_fantasia:string;city:string|null;state:string|null}>('empresas?select=id,nome_fantasia,city,state&status=eq.active&order=nome_fantasia&limit=1000')
  return new Response(renderPage({siteUrl,path,title:'Empresas da região | EmpregaSantana',description:'Conheça empresas e oportunidades em Santana do Ipanema e região.',bodyHtml:`<h1>Empresas cadastradas</h1><ul>${rows.map(c=>`<li><a href="/empresas/${encodeURIComponent(c.id)}">${escapeHtml(c.nome_fantasia)}</a> ${escapeHtml([c.city,c.state].filter(Boolean).join(', '))}</li>`).join('')}</ul>`}),{headers:{'content-type':'text/html; charset=utf-8'}})
}

export default async function middleware(request: Request) {
  const incoming = new URL(request.url)
  if (incoming.pathname === '/sitemap.xml') return await renderSitemap(incoming.origin)
  if (incoming.pathname === '/robots.txt') return new Response(`User-agent: *
Allow: /
Sitemap: ${incoming.origin}/sitemap.xml
`, {headers:{'content-type':'text/plain; charset=utf-8'}})
  if (isPrivatePath(incoming.pathname)) {
    const response = next(); response.headers.set('X-Robots-Tag','noindex, nofollow'); return response
  }
  const userAgent = request.headers.get('user-agent')
  if (!isNoJsBot(userAgent)) return next()

  const url = new URL(request.url)
  const path = url.pathname
  const siteUrl = url.origin

  try {
    const customPage = path.match(/^\/pagina\/([a-z0-9]+(?:-[a-z0-9]+)*)$/)
    if (customPage) return await renderStaticPage(customPage[1],path,siteUrl,'Página')
    if (path === '/empresas') return await renderCompanyDirectory(path,siteUrl)
    if (path === '/blog') return await renderBlog(path, siteUrl) ?? next()
    const blogMatch = path.match(/^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/)
    if (blogMatch) return await renderBlog(path, siteUrl, blogMatch[1]) ?? next()

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
    return new Response('Serviço temporariamente indisponível. Tente novamente.',{status:503,headers:{'Retry-After':'60','content-type':'text/plain; charset=utf-8'}})
  }

  return next()
}
