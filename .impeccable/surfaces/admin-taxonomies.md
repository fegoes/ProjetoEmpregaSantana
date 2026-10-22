---
version: 1
slug: admin-taxonomies
primary_target: src/pages/admin/TaxonomiesPage.tsx
related_targets: [src/pages/admin/ResourcePage.tsx, src/components/layout/PanelLayout.tsx]
---
# Configurações administrativas — Operate

Extensão do painel existente, sem substituição da identidade. Usuário pediu categorias de profissionais, empresas e vagas, tipos e melhorias nos formulários de cadastro. Considerados tipos de contratação para vagas e classificações próprias nos outros dois domínios. Oportunidades usam o domínio de vagas existente.

THESIS: configurar uma vez e usar nos cadastros, com identidade estável e desativação segura.
OWN-WORLD: lateral azul profundo #0D3A66, conteúdo claro, Montserrat/Poppins, componentes existentes. Referência funcional WordPress fixada pelo usuário.
STORY: Configurações → categorias/tipos → adicionar ou editar → selecionar nos formulários → salvar publicação. Inativação conserva cadastros anteriores e remove novas opções; exclusão em uso informa alternativa.
FIRST VIEWPORT: desktop com formulário de classificação à esquerda e lista filtrável à direita; mobile em coluna. Cadastro principal por fieldsets e publicação lateral em desktop, abaixo no mobile.
FORM: code-first, extensão da superfície admin-layout. Sem raster, sem nova paleta. Sem comp aprovada, identidade e organização administrativas já fixadas pelo usuário.
FINISH: capturas 390/1440 e testes de CRUD com rede simulada; SQL real 0024 exercitado em PostgreSQL isolado. Sem migrations ou escrita no banco remoto. Revisão fresca e documentação antes da conclusão.
