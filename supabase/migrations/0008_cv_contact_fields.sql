-- EmpregaSantana — campos de contato/endereço no currículo.
-- Nome vem de profiles.full_name; Resumo/Experiência/Formação já existiam
-- (summary_html, experiences jsonb, education jsonb) mas sem UI própria —
-- a UI é adicionada no app, sem mudança de schema necessária para elas.

alter table public.cv_variants
  add column contact_email text,
  add column contact_phone text,
  add column address text;
