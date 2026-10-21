import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type Appearance = Omit<Database['public']['Tables']['site_appearance']['Row'], 'id' | 'updated_at'>
export const DEFAULT_APPEARANCE: Appearance = { primary_color: '#1E63B6', background: 'soft', font_scale: 'normal', button_shape: 'pill' }
export function useAppearance() {
  return useQuery({ queryKey: ['appearance'], staleTime: 60_000, retry: false, queryFn: async () => {
    const { data, error } = await supabase.from('site_appearance').select('*').eq('id', true).maybeSingle()
    if (error) throw error
    return data ?? DEFAULT_APPEARANCE
  } })
}
export function AppearanceSync() {
  const { data } = useAppearance()
  useEffect(() => {
    const value = data ?? DEFAULT_APPEARANCE
    const root = document.documentElement
    root.style.setProperty('--primary', value.primary_color)
    root.style.setProperty('--brand-blue', value.primary_color)
    root.style.setProperty('--background', value.background === 'white' ? '#FFFFFF' : '#F8F8F8')
    root.style.setProperty('--button-radius', value.button_shape === 'rounded' ? '0.75rem' : '9999px')
    root.style.fontSize = value.font_scale === 'comfortable' ? '17px' : '16px'
    return () => { for (const key of ['--primary', '--brand-blue', '--background', '--button-radius', 'font-size']) root.style.removeProperty(key) }
  }, [data])
  return null
}
