-- Configurações de classificação. Códigos existentes continuam válidos.
alter table public.categories drop constraint categories_kind_check;
alter table public.categories add constraint categories_kind_check check (kind in ('vaga','autonomo','empresa','both'));
alter table public.categories add column is_active boolean not null default true;
alter table public.empresas add column category text references public.categories(slug) on delete restrict;

create table public.record_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label text not null check (char_length(trim(label)) between 1 and 80),
  kind text not null check (kind in ('vaga','autonomo','empresa')),
  is_active boolean not null default true
);
insert into public.record_types(slug,label,kind) values
 ('clt','CLT','vaga'), ('pj','PJ','vaga'), ('temporario','Temporário','vaga'), ('freelance','Freelance','vaga');
alter table public.record_types enable row level security;
create policy record_types_read on public.record_types for select using (true);
create policy record_types_admin_write on public.record_types for all using (public.is_admin()) with check (public.is_admin());
grant select on public.record_types to anon,authenticated;
grant insert,update,delete on public.record_types to authenticated;
alter table public.vagas drop constraint vagas_employment_type_check;
alter table public.vagas add constraint vagas_employment_type_fkey foreign key(employment_type) references public.record_types(slug) on delete restrict;
alter table public.empresas add column type_slug text references public.record_types(slug) on delete restrict;
alter table public.autonomo_profiles add column type_slug text references public.record_types(slug) on delete restrict;

-- Identificadores e domínios são estáveis. Renomear o rótulo não rompe vínculos.
create function public.protect_taxonomy_identity() returns trigger language plpgsql set search_path=public as $$
begin
 if new.slug is distinct from old.slug or new.kind is distinct from old.kind then
  raise exception 'Identificador e área de uso não podem ser alterados. Crie outro item e reclassifique os cadastros.' using errcode='23514';
 end if;
 return new;
end; $$;
create trigger protect_category_identity before update on public.categories for each row execute function public.protect_taxonomy_identity();
create trigger protect_record_type_identity before update on public.record_types for each row execute function public.protect_taxonomy_identity();

-- A inativação conserva cadastros existentes, mas impede novas associações.
create function public.validate_record_taxonomy() returns trigger language plpgsql security definer set search_path=public as $$
declare domain text; selected_type text; old_type text; changed boolean;
begin
 domain := case tg_table_name when 'vagas' then 'vaga' when 'empresas' then 'empresa' else 'autonomo' end;
 changed := tg_op='INSERT';
 if tg_op='UPDATE' then changed := new.category is distinct from old.category; end if;
 if changed and new.category is not null and not exists (
  select 1 from public.categories where slug=new.category and is_active and (kind=domain or (kind='both' and domain in ('vaga','autonomo')))
 ) then raise exception 'Categoria indisponível para este cadastro.' using errcode='23514'; end if;
 if tg_table_name='vagas' then
  selected_type:=new.employment_type;
  if tg_op='UPDATE' then old_type:=old.employment_type; end if;
 else
  selected_type:=new.type_slug;
  if tg_op='UPDATE' then old_type:=old.type_slug; end if;
 end if;
 if (tg_op='INSERT' or selected_type is distinct from old_type) and selected_type is not null and not exists (
  select 1 from public.record_types where slug=selected_type and kind=domain and is_active
 ) then raise exception 'Tipo indisponível para este cadastro.' using errcode='23514'; end if;
 return new;
end; $$;
create trigger validate_vaga_taxonomy before insert or update on public.vagas for each row execute function public.validate_record_taxonomy();
create trigger validate_empresa_taxonomy before insert or update on public.empresas for each row execute function public.validate_record_taxonomy();
create trigger validate_autonomo_taxonomy before insert or update on public.autonomo_profiles for each row execute function public.validate_record_taxonomy();
create index empresas_category_idx on public.empresas(category);
