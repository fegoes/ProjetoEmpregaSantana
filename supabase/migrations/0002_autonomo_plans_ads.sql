-- EmpregaSantana — Fase 2/3: autônomos, planos, assinaturas e stub de ADS
-- Ver docs/PRD.md seções 2.5, 2.7 e 2.8.

-- ---------------------------------------------------------------------------
-- 2.5 Domínio Autônomo
-- ---------------------------------------------------------------------------

create table public.autonomo_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  headline text,
  category text references public.categories (slug),
  description_html text,
  pricing_model text not null check (pricing_model in ('hourly', 'per_delivery', 'both')),
  hourly_rate numeric,
  delivery_rate_note text,
  service_area_city text,
  service_area_state text,
  serves_remote boolean not null default false,
  availability text,
  portfolio_urls text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'paused')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index autonomo_profiles_category_idx on public.autonomo_profiles (category);
create index autonomo_profiles_status_idx on public.autonomo_profiles (status);

create trigger set_updated_at before update on public.autonomo_profiles
  for each row execute procedure public.set_updated_at();

-- Ativar o papel autonomo automaticamente quando o perfil é criado
create function public.handle_new_autonomo_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'autonomo')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

create trigger on_autonomo_profile_created
  after insert on public.autonomo_profiles
  for each row execute procedure public.handle_new_autonomo_profile();

-- ---------------------------------------------------------------------------
-- 2.7 Planos, assinaturas e ADS
-- ---------------------------------------------------------------------------

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('empresa', 'autonomo')),
  name text not null,
  stripe_price_id text,
  price_cents integer not null default 0,
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year')),
  max_active_vagas integer,
  featured_placement boolean not null default false,
  cv_database_access boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas (id) on delete cascade,
  autonomo_id uuid references public.autonomo_profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_exactly_one_subject check (
    (empresa_id is not null and autonomo_id is null)
    or (empresa_id is null and autonomo_id is not null)
  )
);

create trigger set_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

create table public.ads (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('vaga', 'autonomo', 'empresa')),
  subject_id uuid not null,
  placement text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'active', 'expired')),
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.autonomo_profiles enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ads enable row level security;

-- autonomo_profiles: público vê ativos; dono gerencia o próprio; admin tudo
create policy "autonomo_profiles_select_public" on public.autonomo_profiles
  for select using (status = 'active' or id = auth.uid() or public.is_admin());
create policy "autonomo_profiles_write_own" on public.autonomo_profiles
  for all using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- plans: leitura pública (página de preços), escrita só admin
create policy "plans_select_all" on public.plans for select using (true);
create policy "plans_admin_write" on public.plans for all using (public.is_admin()) with check (public.is_admin());

-- subscriptions: leitura do próprio dono (empresa ou autônomo); escrita só admin/service role (webhooks)
create policy "subscriptions_select_own" on public.subscriptions
  for select using (
    public.is_admin()
    or (empresa_id is not null and public.is_empresa_member(empresa_id))
    or (autonomo_id is not null and autonomo_id = auth.uid())
  );
create policy "subscriptions_admin_write" on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

-- ads: só admin nesta fase (sem self-serve ainda)
create policy "ads_admin_all" on public.ads for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed mínimo de planos
-- ---------------------------------------------------------------------------

insert into public.plans (audience, name, price_cents, billing_interval, max_active_vagas, featured_placement, cv_database_access, sort_order) values
  ('empresa', 'Empresa Free', 0, 'month', 1, false, false, 1),
  ('empresa', 'Empresa Pro', 9900, 'month', 10, true, false, 2),
  ('empresa', 'Empresa Business', 29900, 'month', null, true, true, 3);

insert into public.plans (audience, name, price_cents, billing_interval, featured_placement, sort_order) values
  ('autonomo', 'Autônomo Free', 0, 'month', false, 1),
  ('autonomo', 'Autônomo Destaque', 3900, 'month', true, 2);
