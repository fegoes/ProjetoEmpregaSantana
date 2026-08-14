-- EmpregaSantana — admin pode inativar usuários, e "suspender" empresa passa
-- a ter efeito real (hoje só trocava o badge: a empresa suspensa continuava
-- publicando vaga nova e as vagas antigas continuavam públicas).

alter table public.profiles add column is_active boolean not null default true;

-- Estende a proteção de auto-escalação da migration 0011: usuário não-admin
-- não pode reverter is_active pra true em si mesmo (nem is_admin, já coberto).
create or replace function public.protect_profiles_is_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    new.is_admin := old.is_admin;
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfil desativado some das listagens públicas
-- ---------------------------------------------------------------------------

drop policy "autonomo_profiles_select_public" on public.autonomo_profiles;
create policy "autonomo_profiles_select_public" on public.autonomo_profiles
  for select using (
    (status = 'active' and exists (select 1 from public.profiles p where p.id = autonomo_profiles.id and p.is_active))
    or id = auth.uid()
    or public.is_admin()
  );

drop policy "empresas_select_public" on public.empresas;
create policy "empresas_select_public" on public.empresas
  for select using (
    (status = 'active' and exists (select 1 from public.profiles p where p.id = empresas.owner_id and p.is_active))
    or owner_id = auth.uid()
    or public.is_admin()
  );

-- Candidato desativado não abre nova candidatura.
drop policy "candidaturas_insert_own" on public.candidaturas;
create policy "candidaturas_insert_own" on public.candidaturas
  for insert with check (
    candidato_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active)
  );

-- ---------------------------------------------------------------------------
-- Empresa suspensa: "apta a divulgar vagas" passa a ter efeito de verdade
-- ---------------------------------------------------------------------------

-- Não pode mais criar vaga nova enquanto suspensa (admin continua podendo, p/ moderação).
drop policy "vagas_insert_empresa_or_admin" on public.vagas;
create policy "vagas_insert_empresa_or_admin" on public.vagas
  for insert with check (
    public.is_admin()
    or (
      empresa_id is not null
      and public.is_empresa_member(empresa_id)
      and exists (select 1 from public.empresas e where e.id = empresa_id and e.status = 'active')
    )
  );

-- Vaga publicada de empresa suspensa some da busca pública (a empresa/admin
-- continuam vendo normalmente pelas outras condições do OR).
drop policy "vagas_select_public" on public.vagas;
create policy "vagas_select_public" on public.vagas
  for select using (
    public.is_admin()
    or (empresa_id is not null and public.is_empresa_member(empresa_id))
    or (
      status = 'published'
      and (
        empresa_id is null
        or exists (select 1 from public.empresas e where e.id = empresa_id and e.status = 'active')
      )
    )
  );
