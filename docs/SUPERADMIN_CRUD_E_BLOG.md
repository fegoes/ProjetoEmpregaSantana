# Superadmin: cadastros e publicação editorial

Implementação de 30/10/2026, integrada à main junto da unificação das quatro branches.

## Cadastros

| Área | Operações |
| --- | --- |
| Usuários | Criar conta no Auth, consultar/editar nome, e-mail, contato, cidade/UF e situação; adicionar perfis; excluir a conta de autenticação e dados associados; redefinir senha |
| Candidatos | Criar perfil para uma conta existente, consultar/editar apresentação, cargo, pretensão, disponibilidade e links; excluir perfil, currículos e candidaturas preservando a conta e os demais perfis |
| Empresas | Criar com responsável, consultar/editar identificação, classificação, local, descrição, situação e verificação; excluir; trocar responsável; vincular e desvincular usuários |
| Vagas | Criar, consultar/editar conteúdo, empresa, modalidade, contratação, remuneração, datas e publicação; excluir |
| Autônomos | Criar perfil para conta existente, consultar/editar serviço, classificação, atendimento, remuneração e situação; excluir perfil preservando a conta |
| Seleções | Criar seleção para vaga e currículo existentes ou contratação de autônomo; consultar; editar título, situação e etapa; excluir processo e candidatura associada |
| Planos | Criar, consultar/editar público, valor, periodicidade, limites e benefícios; ativar/desativar; excluir quando não houver assinaturas vinculadas |
| Destaques (ADS) | Criar, consultar/editar cadastro destacado, identificação, período e situação; excluir |
| Páginas, categorias, tipos e posts | Mantido o CRUD existente e integrado à navegação |
| Aparência e visão geral | Aparência é configuração única editável; visão geral é um resumo dos demais registros |

Rotas novas principais: `/admin/usuarios/novo`, `/admin/usuarios/:id/editar`, `/admin/candidatos`, `/admin/candidatos/novo`, `/admin/candidatos/:id/editar`, `/admin/empresas/nova`, `/admin/empresas/:id/editar`, `/admin/vagas/nova`, `/admin/vagas/:id/editar`, `/admin/autonomos/novo`, `/admin/autonomos/:id/editar`.

Vínculos são gerenciados em **Empresas → Detalhes → Usuários vinculados à empresa**. Vincular concede o papel de empresa e acesso aos dados dessa empresa. O responsável principal não pode ser desvinculado; troque o responsável pela edição da empresa primeiro. O responsável anterior permanece como membro, até ser desvinculado explicitamente. Contas com várias empresas podem escolher a empresa de trabalho no próprio painel. Uma sessão já aberta pode precisar recarregar para receber os novos perfis.

A criação de usuário usa a Edge Function `admin-users`; não utiliza o cadastro público nem troca a sessão do operador. O e-mail é marcado como confirmado pela administração e nenhum convite é enviado. A senha inicial deve ter 12–128 caracteres. A autorização é conferida no servidor, com verificação de conta ativa e MFA quando configurado. A chave de serviço fica somente no servidor. Se a gravação do perfil falhar após criar a conta, a função tenta desfazer a criação; se não conseguir, informa que a conta deve ser localizada e corrigida na lista. Falha na mudança de e-mail após salvar o perfil é informada como atualização parcial.

Não é permitido excluir/desativar a própria conta pelo novo serviço nem excluir outra conta com acesso administrativo ainda ativo. A concessão/revogação de superadmin continua restrita à operação privilegiada já definida no projeto. A exclusão de usuário agora remove também o acesso no Auth, em vez de apagar apenas o perfil e deixar a credencial existente.

Alterações administrativas de etapa/situação da seleção são registradas como mensagens do sistema e sincronizam a candidatura. A exclusão remove o acompanhamento e seus registros associados; arquivos físicos no Storage não são apagados por SQL. A limpeza física desses arquivos deve seguir a política de retenção do ambiente.

## Blog no painel

**Posts do blog** (`/admin/artigos`) reúne criação, edição, busca, filtro por rascunho/agendado/publicado/arquivado e exclusão. O editor oferece:

- Título, slug editável e indicação do endereço `/blog/slug`;
- Resumo, texto rico, imagens no conteúdo e capa com descrição;
- Múltiplas categorias, autoria e local da publicação;
- Data e hora explícitas no fuso **America/Recife (UTC−3)**;
- Rascunho, publicação imediata, agendamento por data futura e arquivamento;
- Prévia do artigo, de busca e de compartilhamento, com pré-visualização de página inteira;
- Metadados SEO, URL canônica, palavras-chave e instrução de indexação.

A pré-visualização e a página pública usam `ArticleBody`, para manter a mesma renderização do texto, autoria, local e data. Prévia não salva nem publica. **Categorias do blog** (`/admin/blog/categorias`) tem cadastro, nome, slug, descrição, ativação, edição e exclusão. Categorias em uso exigem reclassificar os posts antes da exclusão.

Para agendar, escolher **Publicar / agendar** e informar data futura; o botão mostra **Agendar publicação**. A policy de leitura no banco e as consultas do site exigem `status='published'` e `published_at <= now()`. O conteúdo fica disponível no horário sem depender de cron. As consultas públicas atualizam a cada minuto e ao retomar a janela, com cache de 30 segundos. Rascunhos/arquivados continuam privados mesmo que tenham data passada. A autoria informada é editorial; não concede permissão à conta correspondente. Empresas e usuários comuns continuam sem escrita no blog.

## Ativação do backend — nenhuma execução remota feita nesta tarefa

Além das migrations pendentes da unificação (ver `UNIFICACAO_BRANCHES.md`), foram acrescentadas:

| Migration | Conteúdo |
| --- | --- |
| `0035_superadmin_crud.sql` | Operações atômicas de pessoas, candidatos e vínculos, proteção e sincronização da troca de responsável, sincronização de e-mail do Auth |
| `0036_blog_editorial.sql` | Categorias editoriais, múltiplas categorias por post, local, proteção de categorias em uso e sincronização do nome principal |
| `0037_admin_process_crud.sql` | CRUD administrativo de seleções e sincronização de etapas/candidaturas |

Antes de aplicar, conferir `supabase_migrations.schema_migrations` e o schema real: as branches antigas reutilizaram números para conteúdos diferentes. Não reaplicar migrations já executadas sob nomes antigos e não usar `db reset` para resolver a divergência. Depois de reconciliar o histórico, aplicar somente as migrations faltantes em ordem.

Também publicar as funções:

```sh
supabase functions deploy admin-users
supabase functions deploy admin-password
```

`admin-password` pertence à integração anterior e só precisa ser publicada se ainda estiver pendente. As variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são lidas no ambiente das funções. Nunca colocar a chave de serviço em variável `VITE_*` nem no frontend. O push ao GitHub não executa migrations nem publica essas funções.

## Verificação

- Build TypeScript/Vite de produção aprovada.
- 187 testes unitários/de componentes/handlers em 19 arquivos, incluindo autorização do serviço de usuários, falhas parciais/compensação e fuso editorial.
- ESLint sem erros; quatro avisos de Fast Refresh já existentes nos módulos com hooks/componentes exportados juntos.
- Testes PostgreSQL em memória das migrations reais: autorização e restrição de privilégios, candidatos, transferência de responsável, vínculos idempotentes e múltiplos, manutenção de papéis, categorias, agendamento, rascunhos e CRUD de seleções.
- Chromium com dados de teste interceptados localmente: criação de usuário, candidato e empresa, vínculo de equipe, prévia do blog e salvamento de post agendado. Nenhum cadastro real foi criado no Supabase.
- Layout inspecionado em desktop e celular emulado; nenhuma validação foi feita em dispositivo físico ou em um projeto Supabase remoto com as novas migrations aplicadas.
