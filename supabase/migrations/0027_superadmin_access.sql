-- EmpregaSantana — acesso do superadmin
--
-- 1) As travas de segurança (migrations 0011, 0012 e 0024) desfazem qualquer
--    mudança em is_admin, is_active, status e is_verified feita por quem NÃO é
--    superadmin. Só que o SQL rodado pelo painel do Supabase ou por uma migration
--    também "não é superadmin" (não há usuário logado), então a marca de
--    superadmin era desfeita sem nenhum erro. Resultado: a conta de superadmin de
--    demonstração (migration 0004), quando aplicada depois das travas, ficava
--    sem a marca; e dar o acesso na mão pelo editor SQL também não funcionava.
--    Agora as travas só barram quem está logado no app. Quem tem acesso direto ao
--    banco (editor SQL, migrations, chave de serviço) continua podendo.
--
--    Isso não abre brecha: pela API, sem usuário logado, a RLS já impede qualquer
--    alteração nessas tabelas.
--
-- 2) Nunca sobra a plataforma sem superadmin: pelo app, não dá para remover a
--    marca nem apagar o último.
--
-- 3) Garante a marca na conta de superadmin de demonstração.

create or replace function public.protect_profiles_is_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.is_admin := old.is_admin;
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$;

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

-- Conta de superadmin de demonstração (migration 0004): garante a marca, se a conta existir.
update public.profiles
set is_admin = true
where email = 'admin@empregasantana-seed.com' and not is_admin;
