-- EmpregaSantana — páginas institucionais gerenciáveis pelo admin
-- Permite editar Sobre/Termos/Privacidade (e futuras páginas públicas
-- de conteúdo estático) sem precisar alterar código.

create table public.paginas_institucionais (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content_html text not null default '',
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.paginas_institucionais
  for each row execute procedure public.set_updated_at();

alter table public.paginas_institucionais enable row level security;

-- Leitura pública (são páginas institucionais, sempre abertas); escrita só admin.
create policy "paginas_institucionais_select_all" on public.paginas_institucionais
  for select using (true);
create policy "paginas_institucionais_admin_write" on public.paginas_institucionais
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.paginas_institucionais (slug, title, content_html) values
  (
    'sobre',
    'Sobre o EmpregaSantana',
    '<p>O EmpregaSantana conecta candidatos, autônomos e empresas em um só lugar: vagas fixas, trabalho temporário por hora ou por entrega, e profissionais disponíveis para contratação direta.</p>'
  ),
  (
    'termos',
    'Termos de uso',
    '<p>Conteúdo dos termos de uso a ser definido.</p>'
  ),
  (
    'privacidade',
    'Política de privacidade',
    '<p>Conteúdo da política de privacidade a ser definido.</p>'
  );
