-- EmpregaSantana — campos estendidos do perfil de empresa, cada um com uma
-- flag própria para a empresa decidir se exibe no perfil público ou não.

alter table public.empresas
  add column address text,
  add column address_visible boolean not null default true,
  add column mission_vision_values_html text,
  add column mission_visible boolean not null default true,
  add column org_chart_html text,
  add column org_chart_visible boolean not null default true,
  add column interior_photo_urls text[] not null default '{}',
  add column interior_photos_visible boolean not null default true,
  add column employee_count text,
  add column employee_count_visible boolean not null default true;
