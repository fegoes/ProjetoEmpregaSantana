-- Reseta a senha do fixture de teste (0018) — a inserção original não
-- estava autenticando; testando se a hash em si era o problema.
update auth.users
set encrypted_password = extensions.crypt('SenhaAntiga123!', extensions.gen_salt('bf'))
where email = 'password-test@empregasantana-seed.com';
