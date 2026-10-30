import path from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const OBRIGATORIAS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const

// Clone novo não tem `.env.local` (está no .gitignore via `*.local`), e sem as
// credenciais o app só consegue mostrar a tela de configuração ausente. Avisar
// no terminal evita o "rodei em dev e não apareceu nada" — antes a única pista
// ficava no console do navegador.
//
// Precisa ler `mode` pelo hook, e não por `defineConfig(({ mode }) => …)`:
// `vitest.config.ts` faz `mergeConfig` deste arquivo, e o merge não aceita
// config em forma de callback.
function avisarEnvAusente(): Plugin {
  return {
    name: 'emprega-santana:aviso-env',
    configResolved(config) {
      if (config.mode === 'test') return
      const env = loadEnv(config.mode, config.envDir || config.root, 'VITE_')
      const faltando = OBRIGATORIAS.filter((chave) => !env[chave])
      if (faltando.length === 0) return

      const amarelo = '\x1b[33m'
      const reset = '\x1b[0m'
      console.warn(`\n${amarelo}⚠  ${faltando.join(' e ')} não definida(s).${reset}`)
      console.warn('   O servidor sobe, mas o app vai exibir a tela de configuração ausente.')
      console.warn('   Para resolver: cp .env.example .env.local e preencha as credenciais do Supabase.\n')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), avisarEnvAusente()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
