import { useEffect } from 'react'

interface DocumentMetaOptions {
  canonical?: string
  title: string
  description?: string
  image?: string
  type?: 'website' | 'article' | 'profile'
}

const SITE_NAME = 'EmpregaSantana'

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Atualiza título + meta description/OG/Twitter por rota. Ajuda o Google
// (que executa JS) a indexar cada página com seu próprio título/descrição;
// crawlers que não executam JS (ex.: prévias de link) ainda veem os
// valores padrão do index.html.
export function useDocumentMeta({ title, description, image, canonical, type = 'website' }: DocumentMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    document.title = fullTitle

    if (description) {
      setMetaTag('name', 'description', description)
      setMetaTag('property', 'og:description', description)
      setMetaTag('name', 'twitter:description', description)
    }
    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
      link.href = new URL(canonical, window.location.origin).href
      setMetaTag('property', 'og:url', link.href)
    } else document.querySelector('link[rel="canonical"]')?.remove()
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:type', type)
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('property', 'og:image', image ?? new URL('/og-image.png', window.location.origin).href)
    setMetaTag('name', 'twitter:image', image ?? new URL('/og-image.png', window.location.origin).href)
  }, [title, description, image, type, canonical])
}
