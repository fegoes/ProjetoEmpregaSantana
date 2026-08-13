-- EmpregaSantana — cria um usuário admin de demonstração
-- Necessário porque a migration 0003 populou empresas/autônomos/candidatos,
-- mas nenhum usuário com acesso ao painel /admin.

do $$
declare
  v_admin_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_admin_id, 'authenticated', 'authenticated',
    'admin@empregasantana-seed.com',
    extensions.crypt('seed-demo-password', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Administrador EmpregaSantana'),
    now(), now(), '', '', '', ''
  );

  update public.profiles set is_admin = true where id = v_admin_id;
end $$;
