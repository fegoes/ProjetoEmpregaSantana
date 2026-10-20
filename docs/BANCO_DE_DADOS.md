# Banco de dados

Postgres gerenciado pelo Supabase. Todo acesso vem do cliente, então **RLS é a
única fronteira de segurança** — não existe camada de servidor própria para
reforçar regra.

## Identidade e papéis

### `profiles`
1:1 com `auth.users`, criado por trigger no signup.

| coluna | tipo | nota |
|---|---|---|
| `id` | uuid PK | `references auth.users(id) on delete cascade` |
| `full_name`, `email`, `phone`, `avatar_url` | text | `email` é cópia, para busca no admin |
| `city`, `state` | text | |
| `country` | text | default `'BR'` |
| `is_admin` | boolean | **fonte única de verdade para admin** |
| `is_active` | boolean | desativação pelo admin (migration 0012) |
| `created_at`, `updated_at` | timestamptz | |

### `user_roles`
Papéis são **aditivos** — um usuário pode ser candidato e autônomo ao mesmo tempo.

`role` aceita `candidato`, `autonomo`, `empresa_owner`. Admin **não** entra aqui,
fica só em `profiles.is_admin`. Único por `(user_id, role)`.

## Empresas

### `empresas`
`owner_id` → `profiles` com `on delete restrict` (não se apaga dono de empresa).

Campos: `razao_social`, `nome_fantasia` (obrigatório), `cnpj` (único), `sector`,
`description_html`, `logo_url`, `cover_url`, `website`, `city`, `state`,
`is_verified`, `status` (`active` | `pending` | `suspended`), `is_active`.

Perfil estendido (migration 0007), cada um com um par `*_visible` de consentimento:
`address`, `mission_vision_values_html`, `org_chart_html`, `interior_photo_urls`,
`employee_count`.

> **Sem telefone e sem e-mail.** A tabela não tem coluna de contato público — o
> perfil de empresa estruturalmente não consegue exibir um número. `profiles.phone`
> é do usuário dono, não da empresa.

### `empresa_members`
Liga usuários a empresas (`role` default `owner`). Único por `(empresa_id, user_id)`.

## Vagas e candidaturas

### `vagas`
| coluna | nota |
|---|---|
| `empresa_id` | `on delete cascade` |
| `created_by` | → `profiles` |
| `title`, `description_html` | |
| `employment_type` | `clt` \| `pj` \| `temporario` \| `freelance` |
| `pricing_model` | `fixed_salary` \| `hourly` \| `per_delivery` |
| `salary_min`, `salary_max`, `hourly_rate`, `salary_visible` | |
| `location_city`, `location_state`, `is_remote` | |
| `category` | → `categories.slug` |
| `status` | `draft` \| `published` \| `paused` \| `closed` |
| `is_featured`, `expires_at` | |
| `icon_key` | ícone manual quando não há foto (0016) |
| `photo_url`, `photo_urls[]` | foto única e galeria (0006, 0017) |

> Não existe `published_at`. O `status` vai de `draft` a `published` sem registrar
> quando — então o `datePosted` do JSON-LD usa `created_at`, que subestima o frescor
> de qualquer vaga que ficou em rascunho antes de publicar.

### `candidaturas`
`vaga_id` + `candidato_id` + `cv_variant_id`, `cover_note`, `status`
(`enviada` → `em_analise` → `entrevista` → `aprovada`/`rejeitada`).
Única por `(vaga_id, candidato_id)`.

## Candidato

`candidato_profiles` (1:1 com `profiles`): `headline`, `bio_html`, `desired_role`,
`desired_salary_min`, `pretensao_visible`, `availability`, `linkedin_url`, `portfolio_url`.

`cv_variants`: múltiplos currículos por candidato. `experiences` e `education` são
`jsonb`, `skills` é `text[]`. Flags `is_default`, `is_public`. Campos de contato
estruturado vieram na migration 0008.

## Autônomo

`autonomo_profiles` (1:1 com `profiles`): `headline`, `category`, `description_html`,
`pricing_model` (`hourly` | `per_delivery` | `both`), `hourly_rate`,
`delivery_rate_note`, `service_area_city/state`, `serves_remote`, `availability`,
`portfolio_urls[]`, `status`, `is_featured`.

> **Lacuna de confiança:** não há `is_verified`, nota/avaliações nem
> `years_of_experience`. Só `empresas` tem selo de verificação. O lado do
> marketplace em que um estranho entra na sua casa para fazer serviço elétrico
> não tem nenhuma primitiva de verificação. Experiência existe apenas como texto
> livre dentro de `headline` — não é filtrável nem conferível.

## Planos, assinaturas e anúncios

`plans`: `audience` (`empresa` | `autonomo`), `price_cents`, `billing_interval`,
`max_active_vagas`, `featured_placement`, `cv_database_access`, `sort_order`.

`subscriptions`: aponta para empresa **ou** autônomo (constraint
`subscriptions_exactly_one_subject` garante exatamente um), com campos Stripe e
`current_period_end`.

`ads`: `subject_type`/`subject_id`, `placement`, janela `starts_at`/`ends_at`,
`status`. Somente admin. **Nenhuma página pública consome `ads` hoje.**

> O fluxo Stripe não está implementado: `stripe_price_id` é nulo no seed e as
> funções de checkout/webhook não existem em `supabase/functions/`.

## Conteúdo institucional

`paginas_institucionais`: `slug`, `title`, `content_html`, `updated_by`, timestamps.
Leitura pública, escrita só admin. Alimenta `/sobre`, `/termos`, `/privacidade`, `/lgpd`.
A página renderiza `title` + `content_html` e **não** mostra `updated_at`, embora a
coluna exista — para documento legal, a data de atualização é convenção de confiança.

## RLS

Toda tabela tem RLS ligada. Resumo da intenção:

| Tabela | Leitura | Escrita |
|---|---|---|
| `profiles` | própria + admin | própria |
| `empresas` | pública | dono; exclusão só admin |
| `vagas` | públicas as `published`; dono vê as suas | dono da empresa |
| `autonomo_profiles` | pública as `active` | o próprio |
| `candidato_profiles` / `cv_variants` | o próprio **+ empresa que o está contratando** | o próprio |
| `candidaturas` | candidato e empresa da vaga | candidato cria, empresa atualiza status |
| `categories`, `plans`, `paginas_institucionais` | pública | admin |
| `ads`, `empresa_members` | admin | admin |

Migrations relevantes de segurança: **0009** restringe o acesso da empresa aos dados
do candidato ao necessário; **0011** é um endurecimento geral; **0013** corrige
recursão de política.

## Storage

Bucket único **`public-media`** (migration 0006). Helpers em `src/lib/storage.ts`,
um por tipo de upload (logo de empresa, foto de vaga, galeria, portfólio de autônomo).

## Migrations

`0001` core · `0002` autônomo/planos/ads · `0003` seed de demonstração ·
`0004` admin do seed · `0005` páginas institucionais · `0006` storage ·
`0007` perfil estendido de empresa · `0008` contato no currículo ·
`0009` empresa vê dados do candidato · `0010` LGPD · `0011` endurecimento ·
`0012` desativação pelo admin · `0013` recursão de RLS · `0014` exclusão de perfil ·
`0015` fixture de teste · `0016` `icon_key` · `0017` galeria ·
`0018`/`0019` fixture de senha · `0020` conteúdo legal.

## Dados de demonstração — avisos

`0003_seed_demo_data.sql` popula 16 empresas, 48 vagas, 18 autônomos, 8 candidatos
e 20 candidaturas. Três coisas a saber antes de confiar nesses dados:

1. **Geografia incoerente.** O seed original espalha as empresas por SP, PE, MG, PR,
   RS, RJ, SC, BA, CE, DF e AP — nenhuma em Alagoas. A `Construtora Santana` ficava
   em Santana do **Amapá**. Corrigido por migration posterior para a microrregião de
   Santana do Ipanema.
2. **CNPJs são sequenciais e inválidos** (sem dígito verificador), e `is_verified`
   é atribuído por `i % 3` — não significa nada.
3. **As contas do seed são contas reais.** `0003` e `0004` inserem usuários em
   `auth.users` com senha conhecida, incluindo um admin. Precisam ser removidas, ou
   movidas para um projeto Supabase separado, antes de qualquer lançamento.
