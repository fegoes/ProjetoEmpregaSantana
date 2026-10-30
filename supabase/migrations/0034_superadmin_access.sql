-- Unificação: mantém a proteção de is_admin da migration 0023; não promove contas demo.
-- Ajusta moderação e protege o último administrador existente.

create or replace function public.protect_empresas_moderation_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.status := old.status;
    new.is_verified := old.is_verified;
  end if;
  return new;
end;
$$;

create or replace function public.candidaturas_guard_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and auth.uid() is not null
     and coalesce(current_setting('app.processo_sync', true), '') <> 'on'
     and not public.is_admin() then
    new.status := old.status;
  end if;
  return new;
end;
$$;

-- Último superadmin: não pode perder a marca nem ser apagado por quem está logado no app.
create function public.protect_last_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if auth.uid() is not null and old.is_admin
       and not exists (select 1 from public.profiles where is_admin and id <> old.id) then
      raise exception 'Deve existir pelo menos um superadmin.' using errcode = '23514';
    end if;
    return old;
  end if;

  if auth.uid() is not null and old.is_admin and not new.is_admin
     and not exists (select 1 from public.profiles where is_admin and id <> old.id) then
    raise exception 'Deve existir pelo menos um superadmin.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger protect_last_admin_update before update of is_admin on public.profiles
  for each row execute procedure public.protect_last_admin();
create trigger protect_last_admin_delete before delete on public.profiles
  for each row execute procedure public.protect_last_admin();
