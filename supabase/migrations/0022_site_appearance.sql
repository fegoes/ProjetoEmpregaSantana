-- Preferências públicas de apresentação. Não armazenar segredos nesta tabela.
begin;
create table public.site_appearance (
  id boolean primary key default true check (id),
  primary_color text not null default '#1E63B6' check (primary_color in ('#1E63B6', '#16529A', '#0D3A66')),
  background text not null default 'soft' check (background in ('soft', 'white')),
  font_scale text not null default 'normal' check (font_scale in ('normal', 'comfortable')),
  button_shape text not null default 'pill' check (button_shape in ('pill', 'rounded')),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.site_appearance for each row execute function public.set_updated_at();
alter table public.site_appearance enable row level security;
create policy appearance_public_read on public.site_appearance for select using (true);
create policy appearance_admin_write on public.site_appearance for all using (public.is_admin()) with check (public.is_admin());
grant select on public.site_appearance to anon, authenticated;
grant insert, update, delete on public.site_appearance to authenticated;
insert into public.site_appearance (id) values (true);
commit;
