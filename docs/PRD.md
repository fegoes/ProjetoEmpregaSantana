# EmpregaSantana — PRD & Documento de Arquitetura

> Versão 1.0 — Documento inicial de produto e arquitetura, base para o início do desenvolvimento.

---

## 1. Visão Geral do Produto

**EmpregaSantana** é um marketplace de trabalho no modelo **OLX + LinkedIn**: navegação pública e aberta (qualquer visitante vê vagas e prestadores de serviço sem precisar de conta), com cadastro exigido apenas para agir (candidatar-se, contratar, publicar).

### 1.1 Personas

| Persona | O que faz | Diferencial |
|---|---|---|
| **Candidato** | Cadastra dados pessoais e monta **currículos** (pode ter múltiplos currículos, cada um direcionado a um tipo de vaga) para se candidatar a vagas de empresas. | Foco em emprego formal/temporário via candidatura a vagas publicadas. |
| **Autônomo** | Cadastra um perfil profissional de serviços (pedreiro, eletricista, encanador, consultor, auditor etc.), cobrando por hora ou por entrega/conclusão de serviço. | Fica **publicamente disponível para contratação direta** — não se candidata a vagas, é encontrado. |
| **Empresa** | Cadastra vagas e oportunidades, escolhendo se a contratação é fixa (CLT/PJ) ou temporária (por hora/por entrega). | Gerencia um painel próprio com vagas e candidaturas recebidas. |

Um mesmo usuário pode acumular papéis (ex.: ser Candidato e também Autônomo). Empresa é tratada como uma entidade própria, gerida por um usuário "dono".

### 1.2 Regras de navegação pública vs. logada

- **Público (sem login):** Home (feed de vagas + autônomos), página de detalhe de vaga, página de detalhe de autônomo, página pública de uma empresa, Explorar (busca), página de Planos, Login/Cadastro.
- **Exige login:** candidatar-se a uma vaga, contratar/entrar em contato com um autônomo, ver o **diretório** de todas as Empresas, Meu Perfil, qualquer painel de gestão (candidato, autônomo, empresa, admin).

### 1.3 Menu principal (conforme especificado)

`Home` (lista de vagas) | `Empresas` (diretório — só logado) | `Explorar` (busca) | `Meu Perfil` (só logado) | `Login` / `Logout` (Login mostra link "Criar conta" abaixo).

---

## 2. Modelo de Dados (Postgres / Supabase)

### 2.1 Identidade e papéis

**`profiles`** — 1:1 com `auth.users`, criado via trigger no signup
| coluna | tipo | nota |
|---|---|---|
| `id` | uuid PK | `references auth.users(id)` |
| `full_name` | text | |
| `email` | text | cópia do e-mail do auth, para busca no admin |
| `phone` | text | |
| `avatar_url` | text | |
| `city`, `state` | text | |
| `country` | text | default `'BR'` |
| `is_admin` | boolean | default `false` — só setado via seed/promoção manual, **fonte única de verdade para admin** |
| `created_at`, `updated_at` | timestamptz | |

**`user_roles`** — papéis são **aditivos** (um usuário pode ter vários)
| coluna | tipo | nota |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | `references profiles(id)` |
| `role` | text | check `in ('candidato','autonomo','empresa_owner')` — admin **não** entra aqui, fica só em `profiles.is_admin` para evitar duplicidade |
| `created_at` | timestamptz | |
| unique | `(user_id, role)` | |

### 2.2 Domínio Candidato

**`candidato_profiles`** — 1:1 com `profiles`, criado quando o usuário ativa o papel candidato
- `id uuid PK references profiles(id)`
- `headline text`, `bio_html text` (Tiptap, sanitizado com DOMPurify no render)
- `desired_role text`, `desired_salary_min numeric`, `pretensao_visible boolean default false`
- `availability text` — check `in ('imediata','15_dias','30_dias','a_combinar')`
- `linkedin_url text`, `portfolio_url text`
- `created_at`, `updated_at`

**`cv_variants`** — o coração do requisito de "múltiplos currículos"
- `id uuid PK`
- `candidato_id uuid references candidato_profiles(id)`
- `title text` — rótulo escolhido pelo candidato (ex.: "CV — Vendas", "CV — Logística")
- `summary_html text` (Tiptap, sanitizado)
- `experiences jsonb`, `education jsonb`, `skills text[]` — **JSONB na Fase 1** para reduzir superfície de schema; normalizar em tabelas próprias só se surgir necessidade real de filtro estruturado
- `is_default boolean default false`
- `is_public boolean default false` — habilita aparecer no banco de currículos de empresas com plano `cv_database_access`
- `pdf_url text` — alternativa: upload de PDF (bucket Supabase Storage `cv-uploads`)
- `created_at`, `updated_at`

### 2.3 Domínio Empresa

**`empresas`**
- `id uuid PK`
- `owner_id uuid references profiles(id)`
- `razao_social text`, `nome_fantasia text`, `cnpj text unique`
- `sector text`
- `description_html text` (Tiptap, sanitizado)
- `logo_url text`, `cover_url text`, `website text`
- `city text`, `state text`
- `is_verified boolean default false` — selo verificado pelo admin
- `status text` — check `in ('active','pending','suspended')`, default `'pending'`
- `created_at`, `updated_at`

**`empresa_members`** — preparado para múltiplos gestores por empresa (não exposto na UI ainda; v1 sempre tem 1 linha, o `owner_id`)
- `empresa_id uuid references empresas(id)`
- `user_id uuid references profiles(id)`
- `role text default 'owner'`

### 2.4 Vagas e Candidaturas

**`vagas`**
- `id uuid PK`
- `empresa_id uuid references empresas(id) NULL` — **anulável**, para suportar vaga sem empresa cadastrada (fluxo assistido pelo admin)
- `created_by uuid references profiles(id)` — sempre setado (admin ou usuário empresa)
- `title text`, `description_html text` (Tiptap, sanitizado)
- `employment_type text` — check `in ('clt','pj','temporario','freelance')`
- `pricing_model text` — check `in ('fixed_salary','hourly','per_delivery')`
- `salary_min numeric`, `salary_max numeric`, `hourly_rate numeric`, `salary_visible boolean default true`
- `location_city text`, `location_state text`, `is_remote boolean default false`
- `category text` — mesma taxonomia de `autonomo_profiles.category` (ver `categories`)
- `status text` — check `in ('draft','published','paused','closed')`, default `'draft'`
- `is_featured boolean default false` — setado por plano/ADS
- `expires_at timestamptz`
- `created_at`, `updated_at`

**`candidaturas`**
- `id uuid PK`
- `vaga_id uuid references vagas(id)`
- `candidato_id uuid references candidato_profiles(id)`
- `cv_variant_id uuid references cv_variants(id)` — qual currículo foi usado
- `cover_note text`
- `status text` — check `in ('enviada','em_analise','entrevista','aprovada','rejeitada')`, default `'enviada'`
- unique `(vaga_id, candidato_id)` — reenvio atualiza `cv_variant_id` (upsert), não duplica linha
- `created_at`, `updated_at`

### 2.5 Domínio Autônomo

**`autonomo_profiles`**
- `id uuid PK references profiles(id)`
- `headline text`, `category text` (taxonomia compartilhada com `vagas.category`)
- `description_html text` (Tiptap, sanitizado)
- `pricing_model text` — check `in ('hourly','per_delivery','both')`
- `hourly_rate numeric`, `delivery_rate_note text` (texto livre, ex.: "a partir de R$150/serviço")
- `service_area_city text`, `service_area_state text`, `serves_remote boolean default false`
- `availability text`, `portfolio_urls text[]`
- `status text` — check `in ('active','paused')`, default `'active'`
- `is_featured boolean default false`
- `created_at`, `updated_at`

### 2.6 Taxonomia compartilhada

**`categories`**
- `id uuid PK`, `slug text unique`, `label text`
- `kind text` — check `in ('vaga','autonomo','both')`, default `'both'` — permite filtro único no Home/Explorar cobrindo vagas e autônomos

### 2.7 Planos, assinaturas e ADS

**`plans`**
- `id uuid PK`
- `audience text` — check `in ('empresa','autonomo')` — **duas famílias de planos**
- `name text` (ex.: "Empresa Free", "Empresa Pro", "Autônomo Destaque")
- `stripe_price_id text` (nulo na versão gratuita)
- `price_cents integer default 0`, `billing_interval text` — check `in ('month','year')`
- `max_active_vagas integer` (nulo = ilimitado; só se aplica a `audience='empresa'`)
- `featured_placement boolean default false`
- `cv_database_access boolean default false` (só empresa)
- `is_active boolean default true`, `sort_order integer`

**`subscriptions`**
- `id uuid PK`
- `empresa_id uuid references empresas(id) NULL`
- `autonomo_id uuid references autonomo_profiles(id) NULL`
- check: exatamente um dos dois não-nulo
- `plan_id uuid references plans(id)`
- `stripe_customer_id text`, `stripe_subscription_id text`
- `status text` — check `in ('trialing','active','past_due','canceled','incomplete')`
- `current_period_end timestamptz`
- `created_at`, `updated_at`
- **Só gravável por Edge Function (service role)**, nunca pelo cliente — atualizado via webhook do Stripe.

**`ads`** — tabela stub para o "Campo de ADS" (sem lógica de pagamento funcional nesta fase)
- `id uuid PK`
- `subject_type text` — check `in ('vaga','autonomo','empresa')`, `subject_id uuid`
- `placement text` (ex.: `'home_top'`, `'explorar_sidebar'`)
- `starts_at timestamptz`, `ends_at timestamptz`
- `status text` — check `in ('pending','active','expired')`, default `'pending'`
- `stripe_payment_intent_id text` (pagamento avulso, não recorrente)
- `created_at`

### 2.8 Resumo de RLS (Row Level Security)

| Tabela | SELECT público | CRUD do dono | Admin |
|---|---|---|---|
| `profiles` | nome/avatar apenas | próprio registro | tudo |
| `candidato_profiles` | nenhum | próprio | tudo |
| `cv_variants` | nenhum (acesso via função `SECURITY DEFINER` para empresas com plano) | próprio | tudo |
| `empresas` | onde `status='active'` | próprio (via `empresa_members`) | tudo |
| `vagas` | onde `status='published'` | vagas da própria empresa | tudo, incl. `empresa_id IS NULL` |
| `candidaturas` | nenhum | candidato: próprias; empresa: das próprias vagas | tudo |
| `autonomo_profiles` | onde `status='active'` | próprio | tudo |
| `plans` | todos (página de preços pública) | — | tudo |
| `subscriptions` | nenhum | leitura da própria | tudo |
| `ads` | nenhum | — | tudo |

---

## 3. Modelo de Papéis e Autenticação

- **Papéis aditivos**: `profiles` (1) + `user_roles` (0..N: candidato/autonomo/empresa_owner) + `is_admin` (flag isolada).
- **Fluxo de cadastro**: no signup, o usuário escolhe a intenção inicial ("Sou candidato" / "Sou autônomo" / "Quero contratar / Sou empresa"), o que insere a linha correspondente em `user_roles` e leva a um wizard de onboarding curto daquele perfil. Um novo papel pode ser adicionado depois em **Meu Perfil > Adicionar perfil**.
- **Roteamento do admin por e-mail**: login normal via Supabase Auth; ao autenticar, o `AuthContext` carrega `profiles.is_admin`. Se `true`, o usuário é redirecionado para `/admin` em vez do destino padrão (`/perfil`). A checagem é sempre no banco (RLS/Edge Functions também validam `is_admin`), nunca só no cliente. Contas admin são provisionadas manualmente (seed SQL ou promoção por outro admin) — sem auto-cadastro de admin.
- **`AuthContext`**: `session`, `user`, `profile`, `roles[]`, `isAdmin`, `loading` + métodos `signIn`, `signUp(role)`, `signOut`, `refreshProfile`, `addRole(role)`.
- **`EmpresaContext`** (equivalente enxuto do `CompanyContext` do FinGestão): `{ empresa, loading, refresh }`, escopado às rotas `/empresa/*`. Na v1, um usuário gerencia **uma** empresa (sem seletor); a tabela `empresa_members` já existe para permitir múltiplos gestores/múltiplas empresas por usuário no futuro sem migração de schema.
- **Guards de rota**: componente `<ProtectedRoute roles={[...]}>` redireciona não-autenticado para `/login?redirect=<path>` e papel não-autorizado para `/perfil` com aviso.

---

## 4. Inventário de Rotas / Páginas

### Públicas (sem login)
| Rota | Conteúdo |
|---|---|
| `/` | Home — feed combinado: vagas publicadas + autônomos ativos (abas "Vagas" / "Autônomos" + "Todos") |
| `/vagas/:id` | Detalhe da vaga + CTA "Candidatar-se" (login-wall se deslogado) |
| `/autonomos/:id` | Perfil público do autônomo + CTA "Entrar em contato" (login-wall) |
| `/empresas/:id` | Painel público de uma empresa (sobre + vagas abertas) |
| `/explorar` | Busca por termo, filtros de categoria/cidade/tipo (vaga/autônomo/empresa) |
| `/planos` | Página pública de preços (planos empresa e autônomo) |
| `/login` | Login + link "Criar conta" |
| `/cadastro` | Cadastro com seletor de papel inicial |
| `/cadastro/confirmar` | Landing pós-confirmação de e-mail |
| `/sobre`, `/termos`, `/privacidade` | Institucionais |

### Autenticadas — comum
| Rota | Conteúdo |
|---|---|
| `/empresas` | Diretório logado: todas as empresas ativas (nome, setor, nº de vagas abertas) |
| `/perfil` | Hub "Meu Perfil": cards por papel ativo + opção de adicionar novo papel |
| `/perfil/conta` | Configurações de conta |

### Autenticadas — Candidato
| Rota | Conteúdo |
|---|---|
| `/candidato/onboarding` | Wizard inicial (cria `candidato_profiles`) |
| `/candidato/cv` | Lista de currículos (`cv_variants`), criar/duplicar/excluir/marcar padrão |
| `/candidato/cv/:id` | Editor de um currículo (Tiptap + campos estruturados) |
| `/candidato/candidaturas` | Candidaturas enviadas + status |

### Autenticadas — Autônomo
| Rota | Conteúdo |
|---|---|
| `/autonomo/onboarding` | Wizard inicial |
| `/autonomo/perfil` | Edição do perfil público de serviços |
| `/autonomo/plano` | Status do plano + upgrade (Stripe checkout) |

### Autenticadas — Empresa (dentro de `EmpresaContext`)
| Rota | Conteúdo |
|---|---|
| `/empresa/onboarding` | Cria `empresas` (seta `owner_id`, insere `empresa_members`) |
| `/empresa/painel` | Dashboard: vagas abertas, candidaturas recentes, status do plano |
| `/empresa/vagas` | Lista/gestão das próprias vagas |
| `/empresa/vagas/nova` | Criar vaga (Tiptap + seleção de `pricing_model`/`employment_type`) |
| `/empresa/vagas/:id/editar` | Editar vaga |
| `/empresa/vagas/:id/candidatos` | Candidaturas da vaga, preview do CV, mudança de status |
| `/empresa/perfil` | Edição do perfil público da empresa |
| `/empresa/plano` | Status do plano + upgrade |
| `/empresa/banco-de-curriculos` | Gated por `plans.cv_database_access` — busca em `cv_variants` públicos |

### Admin (`/admin/*`, guardado por `profiles.is_admin`)
| Rota | Conteúdo |
|---|---|
| `/admin` | Dashboard geral (contadores) |
| `/admin/empresas` | **Cadastro de Empresas** — listar/buscar/editar/verificar/suspender |
| `/admin/empresas/:id` | **Dados da empresa** — detalhe/edição, vagas daquela empresa |
| `/admin/usuarios` | **Cadastro de usuários** — todos os perfis, filtro por papel, promover a admin, suspender |
| `/admin/planos` | **Cadastro de Planos** — CRUD em `plans` (ambas as famílias) |
| `/admin/vagas` | **Lista de Vagas** — todas as vagas da plataforma, incluindo `empresa_id IS NULL` |
| `/admin/ads` | **Campo de ADS** — tela stub: lista `ads`, criação/status manual, sem fluxo de pagamento ainda |

---

## 5. Estratégia de Componentes e Dados

- **UI**: shadcn/ui (componentes não editados em `src/components/ui/`) + Tailwind — mesma convenção do projeto de referência.
- **TanStack Query**: `staleTime: 30min`, sem refetch on window focus por padrão; exceção pontual em `candidaturas` (empresa triando candidatos em tempo real) com `staleTime` menor ou `invalidateQueries` manual pós-mutação.
- **Convenção de query keys**: `['vagas','list',filters]`, `['vagas','detail',id]`, `['cv-variants',candidatoId]`, `['candidaturas','by-vaga',vagaId]`, `['empresas','directory',filters]`.
- **Componentes compartilhados a construir cedo**: `<VagaCard>`, `<AutonomoCard>`, `<EmpresaCard>` (reuso em Home/Explorar/painéis), `<StatusBadge>`, `<RichTextEditor>` (wrapper Tiptap), `<RichTextRenderer>` (saída sanitizada com DOMPurify).
- **Pontos de uso de Tiptap + DOMPurify**: `vagas.description_html`, `empresas.description_html`, `autonomo_profiles.description_html`, `candidato_profiles.bio_html`, `cv_variants.summary_html` — regra fixa: autoria sempre via Tiptap, renderização sempre sanitizada antes de `dangerouslySetInnerHTML`.
- **Busca/Explorar**: Fase 1 usa full-text search nativo do Postgres (`tsvector`/`ILIKE`) via função RPC `search_all(term)`, evitando serviço externo (Algolia/Meilisearch) no MVP.
- **Formulários**: React Hook Form + Zod (padrão de mercado com shadcn/ui).

---

## 6. Planos e Monetização

### 6.1 Tiers de exemplo (a refinar com o cliente)

**Empresa**
| Plano | Vagas ativas | Destaque | Banco de currículos |
|---|---|---|---|
| Free | 1 | não | não |
| Pro | 10 | sim | não |
| Business | ilimitado | sim | sim |

**Autônomo**
| Plano | Destaque |
|---|---|
| Free | não |
| Destaque | sim |

### 6.2 Pontos de enforcement

- `max_active_vagas`: checado na Edge Function que publica a vaga (não só no cliente) — conta vagas `status='published'` da empresa contra o limite do plano antes de permitir a transição para `published`.
- `featured_placement` → `is_featured`: setado por Edge Function quando a assinatura fica `active` (via webhook); o feed público ordena `is_featured DESC, created_at DESC`.
- `cv_database_access`: gate no cliente (rota `/empresa/banco-de-curriculos`) **e** no servidor (RLS/RPC) — nunca confiar só no gate do cliente.

### 6.3 Fluxo Stripe

`create-checkout-session` (Edge Function) → Stripe Checkout → `stripe-webhook` (Edge Function) trata `checkout.session.completed` e `customer.subscription.updated/deleted` → upsert em `subscriptions` com service-role key → atualiza flags de plano. Chaves secretas do Stripe só existem em variáveis de ambiente de Edge Function, nunca no frontend.

### 6.4 ADS (futuro)

Nesta fase, `/admin/ads` é uma tela manual (sem Stripe). Roadmap: pagamento avulso via Stripe Payment Intent, populando `ads.stripe_payment_intent_id`, e uma Edge Function agendada alternando `ads.status` (`pending → active → expired`) conforme `starts_at`/`ends_at`, sincronizando com os campos `is_featured`.

---

## 7. Notas de Integrações

- **Stripe** — confirmado, reaproveitado diretamente do padrão do FinGestão.
- **Gemini AI** — roadmap (Fase 4, fora do MVP). Melhor encaixe: reescrever/gerar resumo de currículo dentro do editor Tiptap de `cv_variants.summary_html` (baixo risco, contido em Edge Function). Matching vaga↔candidato é interessante mas exige volume real de dados para valer a pena — adiar.
- **WhatsApp Cloud API** — roadmap, não crítico para MVP. Notificações (nova candidatura, mudança de status) devem começar por **e-mail** (menor fricção de implementação) via uma abstração genérica de `notifications`, com WhatsApp entrando depois como canal plugável.

---

## 8. Plano de Fases de Construção

**Fase 1 — Navegação pública + Auth + loop Empresa↔Candidato** ✅ concluída
- Migrations: `profiles`, `user_roles`, `categories`, `empresas`, `empresa_members`, `vagas`, `candidato_profiles`, `cv_variants`, `candidaturas` + RLS base.
- `AuthContext`, cadastro/login com seletor de papel, `ProtectedRoute`.
- Home (vagas; aba autônomo pode ficar stub), `/vagas/:id`, `/explorar` (busca só de vagas inicialmente).
- Onboarding de empresa, CRUD de vagas, fluxo completo de candidatura (candidato aplica com um CV, empresa vê e muda status).
- CRUD de currículos (`cv_variants`) com Tiptap + DOMPurify.
- **Este corte sozinho já entrega um marketplace funcional de dois lados** — é o corte certo se houver pressão de prazo.

**Fase 2 — Autônomo + Admin** ✅ concluída
- `autonomo_profiles` (schema/RLS/onboarding/`/autonomo/perfil`), aba de autônomos no Home/Explorar, busca combinada.
- Suíte completa `/admin/*`: usuários, empresas (incl. Dados da empresa), Lista de Vagas (incl. vagas sem empresa), Cadastro de Planos (schema + CRUD, sem Stripe ainda).
- Diretório `/empresas` logado.

**Fase 3 — Planos/Stripe + stub de ADS** ⏳ pendente (próxima fase)
- `plans`/`subscriptions` (dados já existem da Fase 2); aqui entra o dinheiro: Edge Functions `create-checkout-session` e `stripe-webhook`, páginas `/empresa/plano` e `/autonomo/plano`, enforcement (`max_active_vagas`, `featured_placement`, `cv_database_access`), `/empresa/banco-de-curriculos`.
- Tabela `ads` + tela manual `/admin/ads`.
- Página pública `/planos`.

### 8.1 Status desta rodada (2026-08-13)

**Feito nesta sessão** (além das Fases 1 e 2 completas):
- Sistema de design próprio: paleta azul/ciano (marca/confiança) + laranja (CTAs de ação), tipografia Plus Jakarta Sans, cantos arredondados, avatares com iniciais, ícones por categoria, hero com busca e estatísticas reais, empty states ilustrados. Aplicado em Navbar, Home, cards, StatusBadge, Login/Cadastro e páginas de detalhe.
- Dados de demonstração reais no Supabase (não mockados): migration `0003_seed_demo_data.sql` com 16 empresas, 48 vagas, 18 autônomos, 8 candidatos e 20 candidaturas, aplicada no projeto remoto já linkado (`ProjetoEmpregaSantana`).
- Verificação visual em navegador (Playwright headless) nas páginas públicas, em claro e escuro, sem erros de console.

**Pendências técnicas identificadas nesta rodada** (não bloqueiam uso, mas devem entrar no backlog):
1. **Sem alternador de tema** — o CSS de dark mode existe e foi validado, mas não há botão/toggle nem detecção automática de `prefers-color-scheme` na UI; hoje o site sempre abre no claro.
2. **Sem code-splitting de rotas** — o bundle de produção passou de 500 kB (aviso do Vite); vale introduzir `React.lazy`/`import()` por rota antes de ir para produção.
3. **Truncamento de título em 1 linha** nos cards (`VagaCard`/`AutonomoCard`) — títulos longos cortam cedo; considerar `line-clamp-2`.
4. **Sem paginação/scroll infinito** — Home e Explorar carregam a lista inteira de uma vez; ok para dezenas de vagas, não escala para centenas.
5. **Áreas logadas não verificadas visualmente nesta rodada** — só as páginas públicas foram conferidas no navegador. `/empresa/*`, `/candidato/*`, `/autonomo/*` e `/admin/*` (incluindo os editores Tiptap) herdam o novo sistema de design mas ainda não foram abertas numa sessão logada para confirmar visualmente.
6. **Contas de seed são contas reais no projeto Supabase de produção** — os 42 usuários fake (`rh.empresaN@empregasantana-seed.com`, `autonomoN@…`, `candidatoN@…`) têm login funcional com a senha `seed-demo-password`. Bom para testar o produto agora; deve ser limpo (ou movido para um projeto Supabase separado de staging) antes de qualquer lançamento real.
7. **CNPJs do seed são números fake sequenciais**, sem dígito verificador válido — não usar como referência de formato/validação futura.

**Sugestão de ordem para a próxima sessão:**
1. Login com um usuário de seed (ex. `rh.empresa1@empregasantana-seed.com` / `seed-demo-password`) e revisão visual dos painéis logados + editor Tiptap.
2. Toggle de tema claro/escuro (rápido, alto impacto percebido).
3. `line-clamp` nos cards + paginação simples na Home/Explorar.
4. Início da Fase 3 (Stripe): schema já pronto, falta só as Edge Functions e as telas de checkout.

**Fase 4 (roadmap, fora do MVP)** — IA (Gemini) para CV, notificações (e-mail → WhatsApp), pagamento real de ADS + agendamento, upgrade de busca se o full-text do Postgres não bastar, normalização das sub-tabelas de CV se filtro estruturado virar requisito.

---

## 9. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript, Vite, React Router |
| UI | shadcn/ui + Tailwind CSS |
| Estado assíncrono | TanStack Query |
| Editor rich text | Tiptap + DOMPurify (sanitização obrigatória antes de renderizar) |
| Deploy frontend | Vercel |
| Backend/dados | Supabase (Postgres + RLS, Supabase Auth, Edge Functions em Deno/TypeScript) |
| Migrations | SQL versionado em `supabase/migrations/`, aplicado via Supabase CLI |
| Pagamentos | Stripe (checkout + webhooks via Edge Function) |
| Testes | Vitest, ESLint |

**Regra dura herdada do FinGestão**: integrações sensíveis (Stripe, IA, mensageria) nunca rodam no frontend — sempre em Edge Function.

### Arquivos/caminhos críticos para o início da implementação

- `supabase/migrations/0001_init_core_schema.sql` — profiles, user_roles, categories, empresas, empresa_members, vagas, candidato_profiles, cv_variants, candidaturas + RLS
- `supabase/migrations/0002_autonomo_plans_ads.sql` — autonomo_profiles, plans, subscriptions, ads
- `src/contexts/AuthContext.tsx`
- `src/contexts/EmpresaContext.tsx`
- `src/routes/index.tsx` — árvore de rotas da seção 4, envolvida em `ProtectedRoute` por papel
- `supabase/functions/create-checkout-session/index.ts`, `supabase/functions/stripe-webhook/index.ts` — Fase 3
- `src/components/RichTextEditor.tsx`, `src/components/RichTextRenderer.tsx`

---

## 10. Checklist de Cobertura vs. Requisitos Originais

- [x] 3 perfis (Candidato, Autônomo, Empresa) com papéis acumuláveis
- [x] Candidato com múltiplos currículos (`cv_variants`)
- [x] Autônomo cobrando por hora ou por entrega, público na Home
- [x] Empresa escolhendo contratação fixa ou temporária (hora/entrega)
- [x] Navegação pública tipo OLX + cadastro para desbloquear ações tipo LinkedIn
- [x] Menu: Home | Empresas (diretório logado) | Explorar | Meu Perfil | Login/Logout
- [x] Login normal roteando por e-mail/flag para o admin
- [x] Admin: Cadastro de Empresas, Cadastro de usuários, Cadastro de Planos, Lista de Vagas (com/sem empresa), Campo de ADS, Dados da empresa
