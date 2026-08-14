-- Fixture temporária só para verificar ao vivo o recurso de exclusão
-- (usuário/empresa/vaga) sem tocar nos dados de demo curados. O próprio
-- teste apaga esses registros ao exercitar a funcionalidade — nada fica
-- para trás além desta migration (inofensiva: só cria dados isolados,
-- sem tocar em nada existente).

do $$
declare
  v_candidato_id uuid := gen_random_uuid();
  v_empresa_owner_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_candidato_id, 'authenticated', 'authenticated',
    'delete-test-candidato@empregasantana-seed.com',
    extensions.crypt('TesteDelete123!', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Candidato Teste Delete'),
    now(), now(), '', '', '', ''
  );

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_empresa_owner_id, 'authenticated', 'authenticated',
    'delete-test-empresa@empregasantana-seed.com',
    extensions.crypt('TesteDelete123!', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Dono Empresa Teste Delete'),
    now(), now(), '', '', '', ''
  );

  insert into public.empresas (owner_id, nome_fantasia, status)
  values (v_empresa_owner_id, 'Empresa Teste Delete', 'active');
end $$;
