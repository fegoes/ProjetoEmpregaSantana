-- EmpregaSantana — páginas montadas em seções e blocos
--
-- A tabela paginas_institucionais passa a guardar também o desenho da página
-- (layout, em JSON): seções de largura total ou da página, fundo com imagem e
-- cobertura de cor, slides, textos, botões com link, ícones e imagens. Quando
-- layout é nulo a página continua usando só content_html, como antes.
--
-- Além do desenho:
--   is_published   rascunho x publicada (rascunho só o superadmin enxerga)
--   is_system      páginas que já existem no site (início, sobre, termos…):
--                  não podem ser apagadas nem mudar de endereço
--   show_in_header / show_in_footer   aparecer no menu do topo e/ou no rodapé
--   seo_description   resumo para buscadores e prévia de link

alter table public.paginas_institucionais
  add column layout jsonb,
  add column is_published boolean not null default true,
  add column is_system boolean not null default false,
  add column show_in_header boolean not null default false,
  add column show_in_footer boolean not null default false,
  add column seo_description text;

alter table public.paginas_institucionais
  add constraint paginas_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  add constraint paginas_layout_shape check (
    layout is null
    or (jsonb_typeof(layout) = 'object' and octet_length(layout::text) <= 400000)
  ),
  add constraint paginas_seo_length check (seo_description is null or char_length(seo_description) <= 300);

update public.paginas_institucionais
set is_system = true
where slug in ('sobre', 'termos', 'privacidade', 'lgpd');

-- A página inicial passa a poder ser personalizada. Sem layout, o site mostra
-- o desenho padrão de sempre.
insert into public.paginas_institucionais (slug, title, content_html, is_system)
values ('inicio', 'Início', '', true)
on conflict (slug) do update set is_system = true;

-- ---------------------------------------------------------------------------
-- Regras que valem mesmo para quem chamar a API direto
-- ---------------------------------------------------------------------------

-- Páginas do sistema: endereço fixo, sempre publicadas, e ninguém troca esse status.
create function public.paginas_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.is_system := old.is_system;
  if old.is_system then
    new.slug := old.slug;
    new.is_published := true;
  end if;
  return new;
end;
$$;

create trigger paginas_guard before update on public.paginas_institucionais
  for each row execute procedure public.paginas_guard();

-- Leitura: o público vê só o que está publicado; o superadmin vê tudo.
drop policy "paginas_institucionais_select_all" on public.paginas_institucionais;
create policy "paginas_institucionais_select" on public.paginas_institucionais
  for select using (is_published or public.is_admin());

-- Escrita: só superadmin. Páginas do sistema não são criadas nem apagadas por aqui.
drop policy "paginas_institucionais_admin_write" on public.paginas_institucionais;
create policy "paginas_institucionais_admin_insert" on public.paginas_institucionais
  for insert with check (public.is_admin() and not is_system);
create policy "paginas_institucionais_admin_update" on public.paginas_institucionais
  for update using (public.is_admin()) with check (public.is_admin());
create policy "paginas_institucionais_admin_delete" on public.paginas_institucionais
  for delete using (public.is_admin() and not is_system);

-- ---------------------------------------------------------------------------
-- Imagens das páginas (fundos, slides, ícones em imagem)
-- ---------------------------------------------------------------------------

-- Substituir e apagar já são permitidos ao superadmin pelas policies de 0011.
create policy "public_media_paginas_admin_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = 'paginas'
    and public.is_admin()
    and (metadata->>'mimetype') like 'image/%'
  );
