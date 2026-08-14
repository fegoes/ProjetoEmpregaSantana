# EmpregaSantana

Marketplace de trabalho: vagas fixas e temporárias (por hora ou por entrega) e profissionais autônomos, tudo no mesmo lugar. *"Somos muito mais que uma página, somos a sua conexão de empregabilidade no sertão."*

- **Documento de produto/arquitetura:** [`docs/PRD.md`](docs/PRD.md)
- **Identidade visual (marca, paleta, tipografia):** [`docs/IDENTIDADE_VISUAL.md`](docs/IDENTIDADE_VISUAL.md)

## Stack

- **Frontend:** React 19 + TypeScript + Vite, React Router, TanStack Query
- **UI:** shadcn/ui (`new-york`) + Tailwind CSS v4 (CSS-first, tokens em `src/index.css`, sem `tailwind.config.js`)
- **Editor de texto rico:** Tiptap, com saída sempre sanitizada por DOMPurify antes de renderizar
- **Backend:** Supabase — Postgres com Row Level Security, Supabase Auth, Edge Functions (Deno) para lógica sensível (ex.: sitemap dinâmico)
- **Testes:** Vitest · **Lint:** ESLint

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as credenciais do seu projeto Supabase
npm run dev
```

Outros scripts: `npm run build`, `npm run lint`, `npm run test`.

## Banco de dados

As migrations em `supabase/migrations/` são a fonte de verdade do schema (tabelas, RLS, seed de categorias/planos). Para aplicar num projeto Supabase linkado:

```bash
supabase link --project-ref <seu-project-ref>
supabase db push
```

## Estrutura

```
src/
  components/   # componentes de UI compartilhados (cards, formulários, shadcn/ui em components/ui)
  contexts/      # AuthContext (sessão/papéis), EmpresaContext (empresa do usuário logado)
  hooks/         # data-fetching via TanStack Query, um hook por domínio
  pages/         # rotas, organizadas por área: public/ shared/ candidato/ autonomo/ empresa/ admin/
  lib/           # Supabase client, upload de storage, utilitários
  types/         # tipos do banco (espelham as migrations)
supabase/
  migrations/    # schema versionado
  functions/     # Edge Functions (Deno)
docs/            # PRD e identidade visual
```

## Papéis de usuário

Um mesmo usuário pode acumular papéis: **candidato** (currículo, candidaturas), **autônomo** (perfil de serviços público) e **empresa** (vagas, candidatos). O papel **admin** é uma flag em `profiles.is_admin`, provisionada manualmente — não há autocadastro de admin.
