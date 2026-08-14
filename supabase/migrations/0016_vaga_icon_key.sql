-- EmpregaSantana — ícone escolhido manualmente pela empresa para a vaga,
-- usado como fallback quando não há foto. Independente da categoria (que já
-- tinha um ícone derivado automaticamente) — a empresa pode preferir um
-- ícone diferente do que a categoria sugere.

alter table public.vagas add column icon_key text;
