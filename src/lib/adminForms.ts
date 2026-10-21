export const BRAZIL_STATES = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')
export function toLocalDateTime(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0,16)
}
export function validateAdminRecord(resource: string, values: Record<string, string | boolean>) {
  if (resource === 'vagas' && values.status === 'published' && !String(values.description_html ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g,' ').trim()) return 'Descreva a oportunidade antes de publicar: atividades, requisitos e condições de trabalho.'
  const website = String(values.website ?? '').trim()
  if (website && !/^https?:\/\//i.test(website)) return 'Informe o site completo, começando com https:// ou http://.'
  if (values.expires_at && !Number.isFinite(new Date(String(values.expires_at)).getTime())) return 'Confira a data de encerramento.'
  return ''
}
