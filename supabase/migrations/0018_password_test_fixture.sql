-- Fixture temporária só pra testar troca de senha ao vivo sem arriscar
-- alterar a senha documentada de nenhuma conta de demo real.
do $$
declare
  v_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
    'password-test@empregasantana-seed.com',
    extensions.crypt('SenhaAntiga123!', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Teste Senha'),
    now(), now(), '', '', '', ''
  );
end $$;
