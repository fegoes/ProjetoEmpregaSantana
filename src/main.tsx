import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { AppearanceSync } from '@/hooks/useAppearance'
import { queryClient } from '@/lib/queryClient'
import { supabaseConfigurado } from '@/lib/supabase'
import { ConfiguracaoAusente } from '@/components/ConfiguracaoAusente'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/contexts/AuthContext'

const root = createRoot(document.getElementById('root')!)

// Sem credencial do Supabase nada funciona, e todo provider abaixo falharia.
// Melhor dizer isso do que entregar uma tela em branco.
if (!supabaseConfigurado) {
  root.render(
    <StrictMode>
      <ConfiguracaoAusente />
    </StrictMode>,
  )
} else {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <AppearanceSync />
              <App />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}
