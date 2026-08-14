-- EmpregaSantana — corrige recursão infinita de RLS introduzida em 0012.
--
-- profiles_select_public_autonomo/_empresa (migration 0011) consultam
-- autonomo_profiles/empresas. 0012 fez autonomo_profiles_select_public e
-- empresas_select_public consultarem profiles de volta (pra checar
-- is_active) — um EXISTS direto contra a tabela, não uma função. Como esse
-- EXISTS é uma query normal (não security definer), ele reaplica a RLS de
-- profiles, que consulta autonomo_profiles/empresas de novo: ciclo infinito.
-- Resultado ao vivo: todo select em profiles voltava 500 — inclusive pro
-- próprio admin carregar o perfil dele, derrubando o painel inteiro.
--
-- Mesma correção que is_admin()/is_empresa_member() já usam: função
-- security definer quebra o ciclo, porque roda com o dono da função
-- (bypassa RLS), não com o papel de quem chamou.

create function public.is_profile_active(target_id uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select coalesce((select is_active from public.profiles where id = target_id), false);
$$;

drop policy "autonomo_profiles_select_public" on public.autonomo_profiles;
create policy "autonomo_profiles_select_public" on public.autonomo_profiles
  for select using (
    (status = 'active' and public.is_profile_active(id))
    or id = auth.uid()
    or public.is_admin()
  );

drop policy "empresas_select_public" on public.empresas;
create policy "empresas_select_public" on public.empresas
  for select using (
    (status = 'active' and public.is_profile_active(owner_id))
    or owner_id = auth.uid()
    or public.is_admin()
  );

drop policy "candidaturas_insert_own" on public.candidaturas;
create policy "candidaturas_insert_own" on public.candidaturas
  for insert with check (
    candidato_id = auth.uid() and public.is_profile_active(auth.uid())
  );
