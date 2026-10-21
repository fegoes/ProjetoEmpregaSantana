import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const LEGACY_EMPLOYMENT_LABELS: Record<string, string> = { clt: 'CLT', pj: 'PJ', temporario: 'Temporário', freelance: 'Freelance' }
export function useRecordTypes() {
  return useQuery({ queryKey: ['record-types'], queryFn: async () => {
    const { data, error } = await supabase.from('record_types').select('*').order('label')
    if (error) throw error
    return data
  } })
}
export function useEmploymentLabels() {
  const { data } = useRecordTypes()
  return { ...LEGACY_EMPLOYMENT_LABELS, ...Object.fromEntries((data ?? []).filter(t => t.kind === 'vaga').map(t => [t.slug, t.label])) }
}
