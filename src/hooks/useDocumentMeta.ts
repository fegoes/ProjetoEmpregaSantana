import { useEffect } from 'react'

interface DocumentMetaOptions {
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
export function useDocumentMeta({ title, description, image, type = 'website' }: DocumentMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    document.title = fullTitle

    if (description) {
      setMetaTag('name', 'description', description)
      setMetaTag('property', 'og:description', description)
      setMetaTag('name', 'twitter:description', description)
    }
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:type', type)
    setMetaTag('name', 'twitter:title', fullTitle)
    if (image) {
      setMetaTag('property', 'og:image', image)
      setMetaTag('name', 'twitter:image', image)
    }
  }, [title, description, image, type])
}
