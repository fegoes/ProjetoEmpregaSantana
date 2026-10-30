-- CEP da empresa: usado no cadastro para preencher o endereço automaticamente.
-- Não aparece no perfil público (o endereço continua sendo o campo `address`).
alter table public.empresas add column zip_code text;
