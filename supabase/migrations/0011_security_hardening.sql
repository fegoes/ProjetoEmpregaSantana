-- EmpregaSantana — correções encontradas em revisão de segurança.
--
-- 0) CRÍTICO — escalação de privilégio. "profiles_update_own" e
--    "empresas_update_own" (migration 0001) são policies de UPDATE só com
--    USING, sem WITH CHECK. Pela própria semântica do Postgres, quando falta
--    WITH CHECK numa policy de UPDATE, o USING é reaproveitado também como
--    check da linha nova — e o USING de ambas só valida QUEM é o dono da
--    linha, nunca QUAIS valores estão sendo gravados. Na prática:
--      - qualquer usuário autenticado podia rodar
--        supabase.from('profiles').update({ is_admin: true }).eq('id', meuId)
--        direto do console do navegador e virar admin — é literalmente a
--        mesma chamada que AdminUsuariosPage.tsx faz, só que sem o botão.
--      - qualquer dono/membro de empresa podia se auto-aprovar
--        (status: 'active') e se auto-verificar (is_verified: true) sem
--        passar pela moderação do admin, invalidando o fluxo descrito no
--        próprio onboarding ("fica pendente até verificação do admin").
--    RLS não expressa bem "pode editar a linha mas não este campo" (USING/
--    WITH CHECK são por linha, não por coluna). Trigger com OLD/NEW resolve
--    isso de forma direta — mesmo padrão já usado em set_updated_at() etc.
create function public.protect_profiles_is_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

create trigger protect_profiles_is_admin
  before update on public.profiles
  for each row execute procedure public.protect_profiles_is_admin();

create function public.protect_empresas_moderation_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    new.status := old.status;
    new.is_verified := old.is_verified;
  end if;
  return new;
end;
$$;

create trigger protect_empresas_moderation_fields
  before update on public.empresas
  for each row execute procedure public.protect_empresas_moderation_fields();

-- 1) profiles: só tinha policy de leitura "dono ou admin". Qualquer join público
--    para nome/avatar de autônomo ou de contato de empresa (useAutonomos, cards)
--    voltava null via PostgREST — o app caía no fallback "Profissional autônomo"
--    em vez do nome real. Adiciona leitura pública aditiva, escopada só a quem
--    já tem uma listagem pública ativa (autônomo ativo, ou dono/membro de
--    empresa ativa) — não abre profiles de candidato nenhum.
create policy "profiles_select_public_autonomo" on public.profiles
  for select using (
    exists (
      select 1 from public.autonomo_profiles ap
      where ap.id = profiles.id and ap.status = 'active'
    )
  );

create policy "profiles_select_public_empresa" on public.profiles
  for select using (
    exists (
      select 1 from public.empresa_members em
      join public.empresas e on e.id = em.empresa_id
      where em.user_id = profiles.id and e.status = 'active'
    )
  );

-- 2) empresas: os campos estendidos (endereço, missão/visão, organograma, fotos
--    internas, nº de funcionários) têm uma flag "*_visible" para a empresa
--    decidir se aparece no perfil público (pedido original do usuário). Mas RLS
--    é por LINHA, não por coluna: useEmpresa()/useEmpresasDiretorio() usam
--    select('*'), então o valor "oculto" sempre viajou no JSON da resposta —
--    o toggle só escondia a renderização no React. Dava pra ver o campo
--    marcado como oculto só abrindo a aba Network do navegador.
--    View com CASE mascara o valor no nível da leitura pública; dono (edição)
--    e admin continuam lendo a tabela base direto, sem mudança.
create view public.empresas_public
with (security_invoker = true)
as
select
  id, owner_id, razao_social, nome_fantasia, cnpj, sector, description_html,
  logo_url, cover_url, website, city, state, is_verified, status,
  case when address_visible then address else null end as address,
  address_visible,
  case when mission_visible then mission_vision_values_html else null end as mission_vision_values_html,
  mission_visible,
  case when org_chart_visible then org_chart_html else null end as org_chart_html,
  org_chart_visible,
  case when interior_photos_visible then interior_photo_urls else '{}'::text[] end as interior_photo_urls,
  interior_photos_visible,
  case when employee_count_visible then employee_count else null end as employee_count,
  employee_count_visible,
  created_at, updated_at
from public.empresas;

grant select on public.empresas_public to anon, authenticated;

-- 3) storage: a validação de tipo/tamanho de arquivo (uploadImage em
--    src/lib/storage.ts) só roda no cliente. Uma chamada direta à API de
--    storage (com um token autenticado válido, sem passar pelo app) podia
--    subir qualquer tipo de arquivo — não só imagem — no bucket público,
--    incluindo HTML/SVG com script. Passa a exigir mimetype image/* na
--    própria policy. Aproveita para dar ao admin poder de mover/remover
--    qualquer arquivo (moderação), não só o próprio uploader.
drop policy "public_media_insert" on storage.objects;
create policy "public_media_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] in ('empresas', 'vagas')
    and (metadata->>'mimetype') like 'image/%'
  );

drop policy "public_media_update_own" on storage.objects;
create policy "public_media_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-media' and (owner = auth.uid() or public.is_admin()))
  with check (bucket_id = 'public-media' and (owner = auth.uid() or public.is_admin()));

drop policy "public_media_delete_own" on storage.objects;
create policy "public_media_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-media' and (owner = auth.uid() or public.is_admin()));
