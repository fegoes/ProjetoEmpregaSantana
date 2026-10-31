-- Cadastro com confirmação: o navegador ainda é anônimo, portanto o perfil e
-- papel público são criados na mesma transação do Auth, pelo trigger existente.
begin;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
declare initial_role text:=new.raw_user_meta_data->>'initial_role';
begin
  insert into public.profiles(id,email,full_name,phone,is_admin,is_active)
  values(new.id,new.email,left(nullif(trim(new.raw_user_meta_data->>'full_name'),''),180),
    left(nullif(trim(new.raw_user_meta_data->>'contact_phone'),''),30),false,true);
  if initial_role in ('candidato','autonomo','empresa_owner') then
    insert into public.user_roles(user_id,role) values(new.id,initial_role) on conflict(user_id,role) do nothing;
    if initial_role='candidato' then insert into public.candidato_profiles(id) values(new.id) on conflict(id) do nothing; end if;
  end if;
  return new;
end; $$;
commit;
