# Arquitetura

SPA em React servida estaticamente, falando direto com o Supabase pelo cliente.
Não há backend próprio: as regras de acesso vivem em RLS no Postgres
(ver [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md)).

## Stack

| Camada | Escolha |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 8 (`@vitejs/plugin-react`), `tsc -b` antes do bundle |
| Estilo | Tailwind CSS v4 via `@tailwindcss/vite`, **sem** `tailwind.config.js` |
| Componentes | shadcn/ui estilo "new-york" sobre Radix, em `src/components/ui/` |
| Roteamento | React Router 7, com `lazy()` por rota |
| Dados | TanStack Query sobre `@supabase/supabase-js` |
| Formulários | react-hook-form + zod |
| Editor | TipTap, com saída sanitizada por DOMPurify |
| Ícones | lucide-react |
| Testes | Vitest + jsdom + Testing Library |

## Estrutura de pastas

```
src/
  components/        componentes de domínio (VagaCard, AutonomoCard…)
    brand/           logotipo
    layout/          Navbar, RootLayout
    ui/              primitivas shadcn — não editar sem motivo
  contexts/          AuthContext, EmpresaContext
  hooks/             acesso a dados (TanStack Query) e utilidades de página
  lib/               utilitários puros, cliente Supabase, filtros de feed
  pages/
    public/          navegáveis sem login
    candidato/  autonomo/  empresa/  admin/   áreas autenticadas
    shared/          exigem login, sem papel específico
  routes/            guardas de rota
  types/             tipos gerados do schema do banco
supabase/
  migrations/        SQL versionado, imutável
  functions/         Edge Functions (hoje: sitemap)
public/
  brand/             selo da marca em SVG
middleware.ts        pré-renderização para crawlers sem JS
```

## Fluxo de dados

```
componente → hook (useVagas, useEmpresas…) → TanStack Query → supabase-js → Postgres
                                                                      ↑
                                                              RLS decide o que volta
```

O cliente nunca confia em filtro de UI para segurança: a RLS é a fronteira.
Filtro de feed (`src/lib/feedFilters.ts`) roda **no cliente**, sobre o conjunto
já autorizado — é refinamento de exibição, não controle de acesso.

Cache: `src/lib/queryClient.ts` centraliza a configuração do QueryClient.
Cada hook declara sua própria query key; a lista está em [HOOKS.md](./HOOKS.md).

## Contextos

| Contexto | Arquivo | Entrega |
|---|---|---|
| `AuthProvider` / `useAuth` | `src/contexts/AuthContext.tsx` | sessão, `profile`, papéis, `signOut` |
| `EmpresaProvider` / `useEmpresa` | `src/contexts/EmpresaContext.tsx` | empresa ativa do usuário dono, usada por todo `/empresa/*` |

## Rotas

**Públicas** — `/`, `/explorar`, `/vagas/:id`, `/autonomos/:id`, `/empresas/:id`,
`/planos`, `/sobre`, `/termos`, `/privacidade`, `/lgpd`, `/login`, `/cadastro`,
`/cadastro/confirmar`, `/esqueci-senha`, `/redefinir-senha`.

**Autenticadas** — `/perfil`, `/perfil/conta`, `/empresas` (diretório).

**Candidato** — `/candidato/onboarding`, `/candidato/cv`, `/candidato/cv/:id`,
`/candidato/candidaturas`.

**Autônomo** — `/autonomo/onboarding`, `/autonomo/perfil`, `/autonomo/plano`.

**Empresa** (dentro de `EmpresaContext`) — `/empresa/onboarding`, `/empresa/painel`,
`/empresa/perfil`, `/empresa/vagas`, `/empresa/vagas/nova`, `/empresa/vagas/:id/editar`,
`/empresa/vagas/:id/candidatos`, `/empresa/banco-de-curriculos`, `/empresa/plano`.

**Admin** (`profiles.is_admin`) — `/admin`, `/admin/empresas`, `/admin/empresas/:id`,
`/admin/vagas`, `/admin/usuarios`, `/admin/planos`, `/admin/paginas`, `/admin/ads`.

> `/empresas` (o diretório de quem contrata) está atrás de login. É o conteúdo que
> mais confere autoridade ao site e hoje o visitante anônimo não o vê — vale revisitar.

## SEO e crawlers

Meta tags estáticas em `index.html`; por rota, `useDocumentMeta` atualiza via
`useEffect` — o que **não** alcança crawler sem JS. Para esses, `middleware.ts`
detecta user-agents de bot e devolve HTML pré-renderizado com `canonical`, `og:url`
e JSON-LD. `JsonLd.tsx` emite `JobPosting` em `/vagas/:id` e `Organization` em
`/empresas/:id`. O sitemap é uma Edge Function (`supabase/functions/sitemap`).
