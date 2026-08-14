-- EmpregaSantana — corrige lacuna de RLS: a empresa não conseguia ver o
-- nome/e-mail nem o currículo de quem se candidatou às próprias vagas,
-- porque profiles/candidato_profiles/cv_variants só liberavam leitura para
-- o próprio candidato ou admin. Aqui adicionamos policies adicionais
-- (somem-se às existentes) liberando leitura só do que é estritamente
-- necessário: o candidato que se candidatou a uma vaga da empresa, e
-- especificamente o cv_variant usado naquela candidatura (não todos os
-- currículos do candidato).

create policy "profiles_select_by_hiring_empresa" on public.profiles
  for select using (
    exists (
      select 1
      from public.candidaturas ca
      join public.vagas v on v.id = ca.vaga_id
      where ca.candidato_id = profiles.id
        and v.empresa_id is not null
        and public.is_empresa_member(v.empresa_id)
    )
  );

create policy "candidato_profiles_select_by_hiring_empresa" on public.candidato_profiles
  for select using (
    exists (
      select 1
      from public.candidaturas ca
      join public.vagas v on v.id = ca.vaga_id
      where ca.candidato_id = candidato_profiles.id
        and v.empresa_id is not null
        and public.is_empresa_member(v.empresa_id)
    )
  );

create policy "cv_variants_select_by_hiring_empresa" on public.cv_variants
  for select using (
    exists (
      select 1
      from public.candidaturas ca
      join public.vagas v on v.id = ca.vaga_id
      where ca.cv_variant_id = cv_variants.id
        and v.empresa_id is not null
        and public.is_empresa_member(v.empresa_id)
    )
  );
