-- Artigos editoriais. Rascunhos e arquivados são visíveis apenas para admin.
begin;
create table public.artigos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(trim(title)) between 1 and 180),
  excerpt text not null default '' check (char_length(excerpt) <= 500),
  content_html text not null default '',
  category text not null default 'Carreira' check (char_length(category) between 1 and 80),
  author_name text not null check (char_length(trim(author_name)) between 1 and 120),
  author_id uuid references public.profiles(id) on delete set null,
  cover_url text check (cover_url is null or cover_url ~ '^https://'),
  cover_alt text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index artigos_publication_idx on public.artigos(status, published_at desc);
create function public.set_artigo_publication() returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;
create trigger artigo_publication before insert or update on public.artigos
  for each row execute function public.set_artigo_publication();
create trigger set_updated_at before update on public.artigos
  for each row execute function public.set_updated_at();
alter table public.artigos enable row level security;
create policy artigos_public_read on public.artigos for select
  using (status = 'published' and published_at <= now());
create policy artigos_admin_all on public.artigos for all
  using (public.is_admin()) with check (public.is_admin());
grant select on public.artigos to anon, authenticated;
grant insert, update, delete on public.artigos to authenticated;
commit;
