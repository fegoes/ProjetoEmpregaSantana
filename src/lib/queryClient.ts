import { QueryClient } from '@tanstack/react-query'

// Convenção herdada do projeto de referência (docs/PRD.md seção 5):
// cache de longa duração por padrão, com overrides pontuais por query
// em telas que precisam de dados mais "quentes" (ex.: candidaturas).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
