-- Categorias gerenciadas pelo superadmin (tela /admin/categorias).
--  * kind passa a aceitar 'empresa' (segmentos de empresa)
--  * categorias podem ser ocultadas sem apagar (is_active): apagar é bloqueado
--    pelo banco quando há vaga ou autônomo usando a categoria
--  * currículos ganham áreas de interesse (usam as categorias de vaga)
-- A escrita em categories já é só do admin (policy categories_admin_write).

alter table public.categories drop constraint if exists categories_kind_check;
alter table public.categories
  add constraint categories_kind_check check (kind in ('vaga', 'autonomo', 'both', 'empresa'));

alter table public.categories add column if not exists is_active boolean not null default true;

-- Segmentos de empresa iniciais (os mesmos setores dos dados de demonstração).
-- empresas.sector continua sendo o texto do segmento, então empresas antigas não mudam.
insert into public.categories (slug, label, kind) values
  ('segmento-tecnologia', 'Tecnologia', 'empresa'),
  ('segmento-construcao-civil', 'Construção Civil', 'empresa'),
  ('segmento-varejo', 'Varejo', 'empresa'),
  ('segmento-saude', 'Saúde', 'empresa'),
  ('segmento-educacao', 'Educação', 'empresa'),
  ('segmento-alimentacao', 'Alimentação', 'empresa'),
  ('segmento-logistica', 'Logística', 'empresa'),
  ('segmento-servicos-financeiros', 'Serviços Financeiros', 'empresa'),
  ('segmento-industrial', 'Industrial', 'empresa'),
  ('segmento-agronegocio', 'Agronegócio', 'empresa'),
  ('segmento-design-marketing', 'Design & Marketing', 'empresa'),
  ('segmento-turismo-hotelaria', 'Turismo & Hotelaria', 'empresa')
on conflict (slug) do nothing;

-- Áreas de interesse de cada currículo (slugs de categorias de vaga)
alter table public.cv_variants add column if not exists categories text[] not null default '{}';
