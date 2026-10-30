import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Falso quando faltam as variáveis de ambiente do Supabase. */
export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)

// Antes isto lançava no carregamento do módulo. Como `main.tsx` importa a cadeia
// de forma síncrona, a exceção acontecia *antes* de `createRoot().render()` — e o
// resultado era uma página em branco, sem nenhuma mensagem para o usuário. Agora a
// ausência de credencial vira uma tela explicativa (ver `main.tsx`), e o cliente é
// criado com valores inertes só para o módulo poder ser importado.
export const supabase = createClient<Database>(
  supabaseUrl || 'http://configuracao-ausente.invalid',
  supabaseAnonKey || 'configuracao-ausente',
)
