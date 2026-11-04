/** Remove apenas os contêineres do editor antigo, mantendo a ordem e as mídias. */
export function postEditorHtml(html: string): string {
 const doc = new DOMParser().parseFromString(html, 'text/html')
 for (const element of Array.from(doc.querySelectorAll('[data-post-section], [data-section-body], [data-post-block]')).reverse()) {
  element.replaceWith(...Array.from(element.childNodes))
 }
 return doc.body.innerHTML
}
