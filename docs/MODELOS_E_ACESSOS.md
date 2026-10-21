# Modelos funcionais e controle de acesso

Decisão confirmada: somente usuários especificamente autorizados podem administrar a plataforma. Cadastro público, confirmação de e-mail, nome, e-mail com prefixo “admin” e contratação de plano não concedem esse acesso.

## Base implementada

| Modelo | Fonte de dados | Comportamento disponível |
|---|---|---|
| Conta e perfis públicos | `auth.users`, `profiles`, `user_roles` | Cadastro e papéis aditivos: candidato, autônomo e empresa |
| Candidato e currículos | `candidato_profiles`, `cv_variants` | Currículos e dados do candidato |
| Empresa e equipe | `empresas`, `empresa_members` | Cadastro, vínculo do responsável, moderação e gestão |
| Profissional | `autonomo_profiles` | Perfil de serviços, cobrança, região e situação |
| Vaga | `vagas` | Cadastro, empresa opcional, publicação, pausa e encerramento |
| Candidatura | `candidaturas` | Envio de currículo e acompanhamento de situação |
| Blog | `artigos` | Rascunho, edição, prévia, publicação, arquivamento e exclusão |
| Conteúdo institucional | `paginas_institucionais` | Leitura pública e edição administrativa |
| Aparência | `site_appearance` | Preferências globais com prévia local antes do salvamento |
| Planos e destaques | `plans`, `subscriptions`, `ads` | Modelos existentes; não equivalem a um checkout de cobrança completo |

Migrations, tipos TypeScript e hooks já sustentam essa base. Os CRUDs administrativos compartilham o modelo de listagem/formulário em `src/pages/admin/ResourcePage.tsx`; o blog usa seu editor próprio. A próxima etapa é aprofundar os protótipos das páginas administrativas inspiradas no WordPress sobre esses comportamentos, sem inventar operações ou dados persistidos.

## Administração não é um perfil público

- `user_roles` admite somente `candidato`, `autonomo` e `empresa_owner`. Não há opção administrativa no cadastro ou na adição de perfis.
- O cliente só reconhece administração se o perfil consultado pertence ao usuário da sessão, está ativo e possui `profiles.is_admin = true`.
- Na troca de conta, privilégios anteriores são removidos durante o carregamento; o cache é limpo e respostas antigas são ignoradas.
- Rotas e menus administrativos permanecem protegidos. O protótipo `/#admin` é uma demonstração visual pública e não uma sessão administrativa; seu atalho fica na faixa do estudo, fora do menu do usuário de exemplo.
- A gestão de usuários não oferece Tornar admin ou Remover admin. A concessão/revogação não é feita pela interface pública nem pelo painel comum.

A migration `0023_restrict_admin_access.sql` reforça a autorização no banco: conta nova nasce sem admin independentemente de metadata; alterações de `is_admin` por requisições de usuários são rejeitadas, inclusive quando o usuário já é administrador; administradores desativados perdem a autorização. A edição normal do perfil continua permitida pelas políticas existentes.

A proteção segue a separação entre metadata editável e autorização no banco descrita na [documentação oficial de RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Provisionamento explícito dos operadores

Esta entrega não escolheu usuários reais nem concedeu acesso a alguém. O responsável deve selecionar os UUIDs das contas autorizadas no ambiente correto. Uma operação privilegiada de banco ou backend pode conceder/revogar `is_admin`; chaves de serviço não entram no navegador.

No SQL Editor autenticado como operador do banco, conferir primeiro a identidade da conta e então executar uma atualização pelo UUID exato, nunca por nome ou por prefixo de e-mail:

```sql
-- Substituir o marcador pelo UUID da conta explicitamente escolhida.
select p.id, u.email, p.full_name, p.is_active, p.is_admin
from public.profiles p join auth.users u on u.id = p.id
where p.id = 'UUID_DA_CONTA_ESCOLHIDA'::uuid;

update public.profiles
set is_admin = true
where id = 'UUID_DA_CONTA_ESCOLHIDA'::uuid and is_active
returning id, full_name, is_active, is_admin;
```

Para revogar, atualizar `is_admin = false` pelo mesmo UUID em operação privilegiada. Requisições autenticadas comuns não podem executar essa mudança. As demais ações administrativas continuam regidas pelas políticas de cada domínio.

A migration 0023 remove apenas o privilégio da antiga fixture `admin@empregasantana-seed.com`, cuja senha de demonstração está no histórico das migrations. Não apaga essa conta nem revoga outros administradores existentes. Antes de disponibilizar o ambiente, conferir a lista existente e provisionar os operadores aprovados; a fixture não deve ser usada como acesso administrativo.

## Verificação

`npm run test:database` executa a migration 0023 em PostgreSQL isolado com PGlite. Exercita metadata de cadastro, autopromoção, alterações por administrador da interface, inserção direta, contas inativas, manutenção da edição normal e concessão/revogação privilegiada. Os helpers de sessão usados no teste modelam os claims do Supabase; não substituem o gateway de autenticação real.

Os testes de aplicação cobrem isolamento de sessão, descarte de respostas antigas, limpeza de cache e bloqueio de papéis inválidos. O teste de PostgreSQL não executa as migrations históricas completas ou os serviços de Auth/Storage do Supabase.

O checkout continua sem configuração real de Supabase. Aplicar as migrations pendentes, incluindo 0021, 0022 e 0023, e validar no ambiente conectado antes da publicação. Nenhum acesso real foi alterado nesta rodada.

Resultado local: 15 verificações PostgreSQL e 11 testes de aplicação aprovados; build principal e protótipo aprovados, lint sem erros (quatro avisos preexistentes). Navegação administrativa autorizada, bloqueio de visitante/usuário comum e ausência do botão de promoção conferidos no Chrome com API simulada. A prévia do painel foi conferida em 320, 390 e 1440 px, com acesso ao estudo administrativo separado do menu do usuário.
