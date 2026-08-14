// Renderiza dados estruturados schema.org para os crawlers (Google Jobs,
// rich results, LLMs) entenderem a página sem precisar "adivinhar" o
// conteúdo a partir do HTML visual.
export function JsonLd({ data }: { data: object }) {
  // Escapa "<" para que um valor com "</script>" (ex.: descrição de vaga)
  // não feche a tag prematuramente.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json">{json}</script>
}
