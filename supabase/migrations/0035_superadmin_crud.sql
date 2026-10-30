-- Operações administrativas compostas são atômicas e autorizadas no banco.
begin;
create function public.admin_save_person(p_user_id uuid, p_details jsonb, p_roles text[] default '{}')
returns uuid language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Acesso reservado à administração.' using errcode='42501'; end if;
  if exists(select 1 from unnest(p_roles) r where r not in ('candidato','autonomo','empresa_owner')) then
    raise exception 'Perfil inválido.' using errcode='23514';
  end if;
  if p_user_id=auth.uid() and (p_details->>'is_active')::boolean is false then
    raise exception 'Você não pode desativar sua própria conta.' using errcode='23514';
  end if;
  update profiles set
    full_name=coalesce(nullif(trim(p_details->>'full_name'),''),full_name),
    phone=nullif(trim(p_details->>'phone'),''), city=nullif(trim(p_details->>'city'),''),
    state=nullif(trim(p_details->>'state'),''),
    is_active=coalesce((p_details->>'is_active')::boolean,is_active)
  where id=p_user_id;
  if not found then raise exception 'Conta não encontrada.' using errcode='23503'; end if;
  insert into user_roles(user_id,role) select p_user_id,r from unnest(p_roles) r on conflict(user_id,role) do nothing;
  if 'candidato'=any(p_roles) then
    insert into candidato_profiles(id) values(p_user_id) on conflict(id) do nothing;
  end if;
  return p_user_id;
end; $$;

create function public.admin_save_candidate(p_user_id uuid, p_data jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Acesso negado.' using errcode='42501'; end if;
  insert into candidato_profiles(id,headline,bio_html,desired_role,desired_salary_min,availability,linkedin_url,portfolio_url,pretensao_visible)
  values(p_user_id,nullif(trim(p_data->>'headline'),''),p_data->>'bio_html',nullif(trim(p_data->>'desired_role'),''),
    nullif(p_data->>'desired_salary_min','')::numeric,nullif(p_data->>'availability',''),nullif(p_data->>'linkedin_url',''),nullif(p_data->>'portfolio_url',''),coalesce((p_data->>'pretensao_visible')::boolean,false))
  on conflict(id) do update set headline=excluded.headline,bio_html=excluded.bio_html,desired_role=excluded.desired_role,
    desired_salary_min=excluded.desired_salary_min,availability=excluded.availability,linkedin_url=excluded.linkedin_url,
    portfolio_url=excluded.portfolio_url,pretensao_visible=excluded.pretensao_visible;
  insert into user_roles(user_id,role) values(p_user_id,'candidato') on conflict(user_id,role) do nothing;
  return p_user_id;
end; $$;

create function public.admin_delete_candidate(p_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Acesso negado.' using errcode='42501'; end if;
  delete from candidato_profiles where id=p_user_id;
  if not found then raise exception 'Candidato não encontrado.' using errcode='P0002'; end if;
  delete from user_roles where user_id=p_user_id and role='candidato';
end; $$;

create function public.admin_set_company_member(p_empresa uuid,p_user uuid,p_remove boolean default false)
returns void language plpgsql security definer set search_path=public as $$
declare owner uuid;
begin
  if not public.is_admin() then raise exception 'Acesso negado.' using errcode='42501'; end if;
  select owner_id into owner from empresas where id=p_empresa for update;
  if not found then raise exception 'Empresa não encontrada.' using errcode='23503'; end if;
  if p_remove then
    if owner=p_user then raise exception 'O responsável principal não pode ser desvinculado.' using errcode='23514'; end if;
    delete from empresa_members where empresa_id=p_empresa and user_id=p_user;
    if not exists(select 1 from empresa_members where user_id=p_user) and not exists(select 1 from empresas where owner_id=p_user) then
      delete from user_roles where user_id=p_user and role='empresa_owner';
    end if;
  else
    if not exists(select 1 from profiles where id=p_user and is_active) then raise exception 'Selecione uma conta ativa.' using errcode='23514'; end if;
    insert into empresa_members(empresa_id,user_id,role) values(p_empresa,p_user,case when owner=p_user then 'owner' else 'member' end)
    on conflict(empresa_id,user_id) do nothing;
    insert into user_roles(user_id,role) values(p_user,'empresa_owner') on conflict(user_id,role) do nothing;
  end if;
end; $$;

-- Validações também valem para chamadas diretas à API.
alter table candidato_profiles add constraint candidato_salary_positive check(desired_salary_min is null or desired_salary_min>=0);
revoke all on function public.admin_save_person(uuid,jsonb,text[]),public.admin_save_candidate(uuid,jsonb),public.admin_delete_candidate(uuid),public.admin_set_company_member(uuid,uuid,boolean) from public;
grant execute on function public.admin_save_person(uuid,jsonb,text[]),public.admin_save_candidate(uuid,jsonb),public.admin_delete_candidate(uuid),public.admin_set_company_member(uuid,uuid,boolean) to authenticated;
-- Contas e perfis devem acompanhar o e-mail canônico do Auth, inclusive na edição administrativa.
create function public.sync_auth_email_to_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
  update profiles set email=new.email where id=new.id;
  return new;
end; $$;
create trigger sync_auth_email_to_profile after update of email on auth.users for each row execute function public.sync_auth_email_to_profile();
-- Troca do responsável conserva os vínculos da equipe em uma única transação.
create function public.guard_company_owner() returns trigger language plpgsql security definer set search_path=public as $$
declare trusted boolean:=coalesce(auth.role()='service_role',false) or (auth.role() is null and session_user in ('postgres','supabase_admin'));
begin
  if tg_op='UPDATE' and new.owner_id is not distinct from old.owner_id then return new; end if;
  if tg_op='UPDATE' and not public.is_admin() and not trusted then raise exception 'Somente a administração pode trocar o responsável.' using errcode='42501'; end if;
  if not exists(select 1 from profiles where id=new.owner_id and is_active) then raise exception 'O responsável precisa ter uma conta ativa.' using errcode='23514'; end if;
  return new;
end; $$;
create trigger guard_company_owner before insert or update of owner_id on empresas for each row execute function public.guard_company_owner();
create function public.sync_company_owner_memberships() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.owner_id is not distinct from old.owner_id then return new; end if;
  update empresa_members set role='member' where empresa_id=new.id and user_id=old.owner_id;
  insert into empresa_members(empresa_id,user_id,role) values(new.id,new.owner_id,'owner') on conflict(empresa_id,user_id) do update set role='owner';
  insert into user_roles(user_id,role) values(new.owner_id,'empresa_owner') on conflict(user_id,role) do nothing;
  return new;
end; $$;
create trigger sync_company_owner_memberships after update of owner_id on empresas for each row execute function public.sync_company_owner_memberships();
commit;
