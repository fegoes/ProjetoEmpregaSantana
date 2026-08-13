-- EmpregaSantana — Fase 1: schema core (profiles, papéis, candidato, empresa, vagas, candidaturas)
-- Ver docs/PRD.md seção 2 para o desenho completo do modelo de dados.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 2.1 Identidade e papéis
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  city text,
  state text,
  country text not null default 'BR',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('candidato', 'autonomo', 'empresa_owner')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Cria profiles automaticamente a partir de auth.users
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2.6 Taxonomia compartilhada (categorias de vagas e serviços de autônomo)
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  kind text not null default 'both' check (kind in ('vaga', 'autonomo', 'both'))
);

-- ---------------------------------------------------------------------------
-- 2.3 Domínio Empresa
-- ---------------------------------------------------------------------------

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  razao_social text,
  nome_fantasia text not null,
  cnpj text unique,
  sector text,
  description_html text,
  logo_url text,
  cover_url text,
  website text,
  city text,
  state text,
  is_verified boolean not null default false,
  status text not null default 'pending' check (status in ('active', 'pending', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.empresa_members (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (empresa_id, user_id)
);

-- Ao criar uma empresa, o dono vira membro e ganha o papel empresa_owner
create function public.handle_new_empresa()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.empresa_members (empresa_id, user_id, role)
  values (new.id, new.owner_id, 'owner');

  insert into public.user_roles (user_id, role)
  values (new.owner_id, 'empresa_owner')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_empresa_created
  after insert on public.empresas
  for each row execute procedure public.handle_new_empresa();

-- ---------------------------------------------------------------------------
-- 2.4 Vagas e candidaturas
-- ---------------------------------------------------------------------------

create table public.vagas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas (id) on delete cascade,
  created_by uuid not null references public.profiles (id),
  title text not null,
  description_html text,
  employment_type text not null check (employment_type in ('clt', 'pj', 'temporario', 'freelance')),
  pricing_model text not null check (pricing_model in ('fixed_salary', 'hourly', 'per_delivery')),
  salary_min numeric,
  salary_max numeric,
  hourly_rate numeric,
  salary_visible boolean not null default true,
  location_city text,
  location_state text,
  is_remote boolean not null default false,
  category text references public.categories (slug),
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'closed')),
  is_featured boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vagas_status_idx on public.vagas (status);
create index vagas_empresa_id_idx on public.vagas (empresa_id);
create index vagas_category_idx on public.vagas (category);

-- ---------------------------------------------------------------------------
-- 2.2 Domínio Candidato
-- ---------------------------------------------------------------------------

create table public.candidato_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  headline text,
  bio_html text,
  desired_role text,
  desired_salary_min numeric,
  pretensao_visible boolean not null default false,
  availability text check (availability in ('imediata', '15_dias', '30_dias', 'a_combinar')),
  linkedin_url text,
  portfolio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cv_variants (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid not null references public.candidato_profiles (id) on delete cascade,
  title text not null,
  summary_html text,
  experiences jsonb not null default '[]',
  education jsonb not null default '[]',
  skills text[] not null default '{}',
  is_default boolean not null default false,
  is_public boolean not null default false,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cv_variants_candidato_id_idx on public.cv_variants (candidato_id);

create table public.candidaturas (
  id uuid primary key default gen_random_uuid(),
  vaga_id uuid not null references public.vagas (id) on delete cascade,
  candidato_id uuid not null references public.candidato_profiles (id) on delete cascade,
  cv_variant_id uuid not null references public.cv_variants (id),
  cover_note text,
  status text not null default 'enviada' check (status in ('enviada', 'em_analise', 'entrevista', 'aprovada', 'rejeitada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vaga_id, candidato_id)
);

create index candidaturas_vaga_id_idx on public.candidaturas (vaga_id);
create index candidaturas_candidato_id_idx on public.candidaturas (candidato_id);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.empresas
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.vagas
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.candidato_profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.cv_variants
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.candidaturas
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — ver docs/PRD.md seção 2.8 para o resumo por tabela
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.empresas enable row level security;
alter table public.empresa_members enable row level security;
alter table public.vagas enable row level security;
alter table public.candidato_profiles enable row level security;
alter table public.cv_variants enable row level security;
alter table public.candidaturas enable row level security;

create function public.is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create function public.is_empresa_member(target_empresa_id uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.empresa_members
    where empresa_id = target_empresa_id and user_id = auth.uid()
  );
$$;

-- profiles: dono lê/edita o próprio registro; admin tudo
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- user_roles: dono lê/gerencia os próprios papéis; admin tudo
create policy "user_roles_select_own" on public.user_roles for select using (user_id = auth.uid() or public.is_admin());
create policy "user_roles_insert_own" on public.user_roles for insert with check (user_id = auth.uid() or public.is_admin());
create policy "user_roles_delete_own" on public.user_roles for delete using (user_id = auth.uid() or public.is_admin());

-- categories: leitura pública, escrita só admin
create policy "categories_select_all" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- empresas: público vê ativas; dono/membro gerencia a própria; admin tudo
create policy "empresas_select_public" on public.empresas
  for select using (status = 'active' or owner_id = auth.uid() or public.is_admin());
create policy "empresas_insert_own" on public.empresas
  for insert with check (owner_id = auth.uid() or public.is_admin());
create policy "empresas_update_own" on public.empresas
  for update using (public.is_empresa_member(id) or public.is_admin());
create policy "empresas_delete_admin" on public.empresas
  for delete using (public.is_admin());

-- empresa_members: visível/gerenciável só por membros da empresa e admin
create policy "empresa_members_select" on public.empresa_members
  for select using (public.is_empresa_member(empresa_id) or public.is_admin());
create policy "empresa_members_admin_write" on public.empresa_members
  for all using (public.is_admin()) with check (public.is_admin());

-- vagas: público vê publicadas; empresa gerencia as próprias; admin tudo (incl. sem empresa)
create policy "vagas_select_public" on public.vagas
  for select using (
    status = 'published'
    or public.is_admin()
    or (empresa_id is not null and public.is_empresa_member(empresa_id))
  );
create policy "vagas_insert_empresa_or_admin" on public.vagas
  for insert with check (
    public.is_admin()
    or (empresa_id is not null and public.is_empresa_member(empresa_id))
  );
create policy "vagas_update_empresa_or_admin" on public.vagas
  for update using (
    public.is_admin()
    or (empresa_id is not null and public.is_empresa_member(empresa_id))
  );
create policy "vagas_delete_empresa_or_admin" on public.vagas
  for delete using (
    public.is_admin()
    or (empresa_id is not null and public.is_empresa_member(empresa_id))
  );

-- candidato_profiles: só o dono e admin
create policy "candidato_profiles_select_own" on public.candidato_profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "candidato_profiles_write_own" on public.candidato_profiles
  for all using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- cv_variants: só o dono do currículo e admin (acesso de empresas via plano entra na Fase 3 com função dedicada)
create policy "cv_variants_owner" on public.cv_variants
  for all using (
    public.is_admin()
    or candidato_id = auth.uid()
  ) with check (
    public.is_admin()
    or candidato_id = auth.uid()
  );

-- candidaturas: candidato vê/gerencia as próprias; empresa vê/atualiza as de suas vagas; admin tudo
create policy "candidaturas_select" on public.candidaturas
  for select using (
    candidato_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.vagas v
      where v.id = vaga_id and v.empresa_id is not null and public.is_empresa_member(v.empresa_id)
    )
  );
create policy "candidaturas_insert_own" on public.candidaturas
  for insert with check (candidato_id = auth.uid());
create policy "candidaturas_update" on public.candidaturas
  for update using (
    candidato_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.vagas v
      where v.id = vaga_id and v.empresa_id is not null and public.is_empresa_member(v.empresa_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Seed mínimo de categorias
-- ---------------------------------------------------------------------------

insert into public.categories (slug, label, kind) values
  ('administrativo', 'Administrativo', 'vaga'),
  ('vendas', 'Vendas', 'both'),
  ('logistica', 'Logística', 'both'),
  ('ti', 'Tecnologia da Informação', 'both'),
  ('pedreiro', 'Pedreiro', 'autonomo'),
  ('eletricista', 'Eletricista', 'autonomo'),
  ('encanador', 'Encanador', 'autonomo'),
  ('consultor', 'Consultor', 'autonomo'),
  ('auditor', 'Auditor', 'autonomo'),
  ('diarista', 'Diarista / Limpeza', 'autonomo');
