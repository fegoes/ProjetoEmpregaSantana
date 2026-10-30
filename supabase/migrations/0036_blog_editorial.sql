-- Categorias múltiplas, local e publicação agendada; escrita continua só do superadmin.
begin;
create table public.blog_categories(
  id uuid primary key default gen_random_uuid(),
  name text not null unique check(char_length(trim(name)) between 1 and 80),
  slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug)<=100),
  description text not null default '' check(char_length(description)<=500),
  is_active boolean not null default true
);
alter table blog_categories enable row level security;
create policy blog_categories_read on blog_categories for select using(true);
create policy blog_categories_admin on blog_categories for all using(public.is_admin()) with check(public.is_admin());
grant select on blog_categories to anon,authenticated;
grant insert,update,delete on blog_categories to authenticated;
insert into blog_categories(name,slug)
select distinct category,'categoria-'||substr(md5(category),1,12) from artigos where trim(category)<>'';
alter table artigos add column category_ids uuid[] not null default '{}', add column location text not null default '' check(char_length(location)<=180);
update artigos a set category_ids=array[c.id] from blog_categories c where c.name=a.category;
create function public.validate_artigo_categories() returns trigger language plpgsql set search_path=public as $$
begin
  if cardinality(new.category_ids)>20 then raise exception 'Selecione até 20 categorias.' using errcode='23514'; end if;
  perform 1 from blog_categories where id=any(new.category_ids) for key share;
  if exists(select 1 from unnest(new.category_ids) c where not exists(select 1 from blog_categories b where b.id=c)) then
    raise exception 'Categoria de postagem não encontrada.' using errcode='23503';
  end if;
  if cardinality(new.category_ids)>0 then select name into new.category from blog_categories where id=new.category_ids[1]; end if;
  return new;
end; $$;
create trigger validate_artigo_categories before insert or update of category_ids on artigos for each row execute function public.validate_artigo_categories();
create function public.protect_blog_category_usage() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='DELETE' then
    if exists(select 1 from artigos where category_ids @> array[old.id]) then raise exception 'Categoria em uso. Reclassifique as postagens antes de excluir.' using errcode='23503'; end if;
    return old;
  end if;
  if new.name is distinct from old.name then update artigos set category=new.name where category_ids[1]=old.id; end if;
  return new;
end; $$;
create trigger protect_blog_category_delete before delete on blog_categories for each row execute function public.protect_blog_category_usage();
create trigger sync_blog_category_name after update of name on blog_categories for each row execute function public.protect_blog_category_usage();
create index artigos_category_ids_idx on artigos using gin(category_ids);
-- A policy artigos_public_read já exige published_at <= now(): agendamento não requer cron.
commit;
