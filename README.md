# EmpregaSantana

Marketplace de trabalho: vagas fixas e temporárias (por hora ou por entrega) e profissionais autônomos, tudo no mesmo lugar. *"Somos muito mais que uma página, somos a sua conexão de empregabilidade no sertão."*

- **Documento de produto/arquitetura:** [`docs/PRD.md`](docs/PRD.md)
- **CRUD e integração de dados:** [`docs/CRUD_E_INTEGRACAO.md`](docs/CRUD_E_INTEGRACAO.md)
- **Protótipos navegáveis de identidade aplicada:** [`docs/PROTOTIPOS.md`](docs/PROTOTIPOS.md) — execute `npm run prototype`
- **Análise de Gupy e Infojobs por tela:** [`docs/ANALISE_GUPY_INFOJOBS.md`](docs/ANALISE_GUPY_INFOJOBS.md)
- **Referências de UX e inspirações:** [`docs/REFERENCIAS_UX.md`](docs/REFERENCIAS_UX.md)
- **Impeccable e Playwright:** [`docs/FERRAMENTAS_DESIGN.md`](docs/FERRAMENTAS_DESIGN.md)
- **Identidade visual (marca, paleta, tipografia):** [`docs/IDENTIDADE_VISUAL.md`](docs/IDENTIDADE_VISUAL.md)

**Direção visual:** todo o site e sistema em modo claro, incluindo painéis autenticados, independentemente do tema do dispositivo. Responsividade obrigatória em toda a plataforma; área logada com menu global no topo e navegação do usuário à esquerda, recolhida em telas pequenas.

A home pública está sendo estudada como apresentação do projeto em formato de pitch, com referência narrativa no FinGestão. Os protótipos ficam em `prototipos/`, separados da aplicação funcional em `src/`.

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

### Implementação da direção visual

A aplicação principal recebeu home de apresentação, painel com menu lateral, busca e blog com gestão editorial. Consulte [IMPLEMENTACAO.md](docs/IMPLEMENTACAO.md) para configurar o Supabase, aplicar a migration 0021 e conhecer os limites da validação local. O protótipo independente continua disponível para comparação.

Administração, CRUDs e aparência: [ADMINISTRACAO.md](docs/ADMINISTRACAO.md). A prévia navegável da administração fica em `/#admin` no servidor de protótipos.

Modelos e permissões: [MODELOS_E_ACESSOS.md](docs/MODELOS_E_ACESSOS.md). Testes isolados de autorização: `npm run test:database`.

Publicação e diagnóstico de versões: [DEPLOY.md](docs/DEPLOY.md). O build gera `version.json`; compare a publicação com `npm run verify:deploy -- https://emprega-santana.vercel.app`. Alterações locais precisam estar no commit enviado ao GitHub para entrar no deploy.
