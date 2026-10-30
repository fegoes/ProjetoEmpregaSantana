/** Local editorial illustrations. A custom cover always takes precedence. */
export const editorialImages = {
  curriculo: { src: '/illustrations/curriculo.jpg', alt: 'Uma candidata prepara seu currículo em um computador.' },
  servicos: { src: '/illustrations/servicos.jpg', alt: 'Um profissional registra um trabalho para seu portfólio de serviços.' },
  contratacao: { src: '/illustrations/contratacao.jpg', alt: 'Uma empresária conversa com um candidato em seu comércio.' },
}

export function editorialImage(category: string) {
  const normalized = category.toLocaleLowerCase('pt-BR')
  if (normalized.includes('empresa') || normalized.includes('contrata')) return editorialImages.contratacao
  if (normalized.includes('autônom') || normalized.includes('autonom') || normalized.includes('serviço')) return editorialImages.servicos
  return editorialImages.curriculo
}

/** Resolve our bundled covers locally while keeping HTTPS URLs for persisted posts. */
export function editorialPreviewSrc(url: string) {
  if (import.meta.env.DEV) {
    const known = Object.values(editorialImages).find(image => url === `https://emprega-santana.vercel.app${image.src}`)
    if (known) return known.src
  }
  return url
}
