-- EmpregaSantana — candidatos criados direto no banco ganham o papel "candidato"
--
-- No app, o papel é gravado pela tela de ativação do perfil de candidato. Os
-- candidatos de demonstração (migration 0003) foram criados por SQL, com o
-- perfil mas sem o papel: entravam no site, mas o painel do candidato os
-- barrava como se não tivessem perfil. Quem tem candidato_profiles é candidato.

insert into public.user_roles (user_id, role)
select id, 'candidato'
from public.candidato_profiles
on conflict (user_id, role) do nothing;
