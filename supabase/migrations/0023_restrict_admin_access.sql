-- Administração é concedida somente por operação privilegiada fora do cadastro público.
-- Não promove contas, não depende de e-mail/metadata e não cria administradores.
begin;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin and p.is_active from public.profiles p where p.id = auth.uid()), false);
$$;

create or replace function public.protect_profiles_is_admin()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  trusted_operator boolean := coalesce(auth.role() = 'service_role', false)
    or (auth.role() is null and session_user in ('postgres', 'supabase_admin'));
begin
  -- CURRENT_USER não identifica o solicitante numa função SECURITY DEFINER.
  if new.is_admin is distinct from old.is_admin and not trusted_operator then
    raise exception 'Acesso administrativo só pode ser concedido ou revogado por operação privilegiada.' using errcode = '42501';
  end if;
  if not trusted_operator and not public.is_admin() then
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$;

create function public.protect_profiles_admin_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  trusted_operator boolean := coalesce(auth.role() = 'service_role', false)
    or (auth.role() is null and session_user in ('postgres', 'supabase_admin'));
begin
  if new.is_admin and not trusted_operator then
    raise exception 'O cadastro público não permite criar administradores.' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger protect_profiles_admin_insert before insert on public.profiles
  for each row execute function public.protect_profiles_admin_insert();

-- Metadata enviada por um visitante nunca define privilégios.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, is_admin, is_active)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', false, true);
  return new;
end;
$$;

-- A fixture antiga tem senha pública de demonstração e não é um operador aprovado.
-- Preserva a conta e todos os demais dados; remove apenas seu privilégio administrativo.
update public.profiles set is_admin = false where email = 'admin@empregasantana-seed.com' and is_admin;

commit;
