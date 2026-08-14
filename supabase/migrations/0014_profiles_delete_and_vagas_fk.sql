-- EmpregaSantana — profiles nunca teve policy de DELETE (só select/update).
-- Sem isso, o botão "Excluir" de admin/UsuariosPage falharia sempre, calado,
-- com 403. candidato_profiles/autonomo_profiles/user_roles/empresa_members
-- já cascateiam via FK — só falta a permissão em profiles em si.

create policy "profiles_delete_admin" on public.profiles
  for delete using (public.is_admin());

-- vagas.created_by não tinha "on delete", então por padrão bloqueia (como
-- restrict) excluir um perfil que já criou alguma vaga — mesmo não sendo
-- dono de empresa nenhuma. Não faz sentido travar a exclusão de usuário por
-- causa só de metadado de autoria; troca pra "set null" (a coluna já era
-- nullable, e o vínculo real de uma vaga é com a empresa, não com quem
-- clicou em salvar).
alter table public.vagas drop constraint vagas_created_by_fkey;
alter table public.vagas add constraint vagas_created_by_fkey
  foreign key (created_by) references public.profiles (id) on delete set null;
alter table public.vagas alter column created_by drop not null;
