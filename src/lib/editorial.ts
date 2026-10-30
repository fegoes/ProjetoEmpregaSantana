// Horários editoriais são explícitos para que a agenda não dependa do fuso do computador.
export const EDITORIAL_TIME_ZONE = 'America/Recife'
export function editorialDateInput(iso: string | null | undefined): string {
  if (!iso || !Number.isFinite(new Date(iso).getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:EDITORIAL_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso))
  const p=Object.fromEntries(parts.map(part=>[part.type,part.value]))
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`
}
export function editorialDateISO(value: string): string | null {
  if (!value) return null
  const date=new Date(`${value}:00-03:00`)
  return Number.isFinite(date.getTime()) ? date.toISOString() : null
}
export function editorialStatus(article: {status?: string;published_at?: string|null}, now = Date.now()) {
  if (article.status==='published') return article.published_at&&new Date(article.published_at).getTime()>now ? 'Agendado' : 'Publicado'
  return article.status==='archived'?'Arquivado':'Rascunho'
}
