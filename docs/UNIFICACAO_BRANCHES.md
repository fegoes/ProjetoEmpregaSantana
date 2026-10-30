# Unificação local das branches — 30/10/2026

Origem: https://github.com/fegoes/ProjetoEmpregaSantana.git.
O remoto foi atualizado localmente com `git fetch origin --prune`. Após a autorização posterior e a validação local, a unificação e o pacote de CRUD/blog foram enviados à main do GitHub (implementação em fe8bdc2). Nenhuma operação no banco remoto foi realizada.

## Estado encontrado

| Branch remota | Commit consultado | Conteúdo exclusivo integrado |
| --- | --- | --- |
| main | 0b3d1b9 | Base publicada, documentação, blog, aparência, segurança administrativa e configurações |
| codex/configuracoes-categorias-tipos | 8b50dbf | Homepage com imagens, posts ilustrados, SEO e administração de senhas |
| claude/visual-identity-analysis-docs-gt4qov | aef20b0 | Identidade visual, componentes de imagem e orientações de formulários |
| claude/tender-rubin-eeuyjb | 34fce35 | Painéis, seleção/contratação, modalidades, categorias, máscaras e editor de páginas |

A main local estava 12 commits atrás de origin/main. A branch local tender-rubin tinha ainda c78a2e7, composto por evidências locais e um binário de ferramenta, ausente do remoto. Esse commit também participa da integração preparada. A antiga branch local codex/integrar-revisoes-administracao já era ancestral da main remota.

Backup local criado antes da integração: `backup/pre-unificacao-20261030` (c78a2e7).

## Decisões da integração

- A homepage padrão mantém a apresentação editorial e as quatro imagens existentes em `public/illustrations`: nossa-gente, curriculo, servicos e contratacao. O mural fica em `/explorar`. Um layout explicitamente publicado no editor para `inicio` continua podendo personalizar a página.
- Mantidos blog, SEO, gestão editorial e upload de imagens, incluindo o editor de texto rico usado nos blocos.
- Integrados os painéis e processos seletivos, sem conceder automaticamente acesso de empresa ao superadmin.
- Mantidas as configurações dinâmicas de tipos e categorias em formulários e filtros. Modalidades continuam na gestão de categorias do novo painel.
- Mantida a hidratação segura da autenticação e acrescentado o redirecionamento de login do painel.
- Mantida a alteração manual de senha via Edge Function `admin-password`, com auditoria.
- A regra de concessão de administrador da main (migration 0023) prevalece. A migration integrada 0034 não substitui essa regra nem promove a conta demo. A interface não oferece promoção/revogação incompatível com essa política.
- Os documentos de identidade da main foram preservados; documentos específicos da outra branch continuam disponíveis para consulta histórica.

## Situação Git para revisão

Os dois primeiros merges foram registrados localmente em 8e0a748 e f58ce4d, antes da orientação posterior para aguardar novos commits/envios. O merge final com tender-rubin foi concluído no commit de1662c. A orientação posterior autorizou os commits e o envio remoto após implementar o CRUD e o editor editorial. Os detalhes adicionais estão em SUPERADMIN_CRUD_E_BLOG.md. Nenhuma migration foi executada no banco remoto.

## Banco de dados: arquivos preparados, nenhuma execução remota

As migrations já presentes na linha principal mantêm seus números 0001–0027. As sete migrations exclusivas da branch do painel foram renumeradas:

| Arquivo antigo na branch do painel | Arquivo integrado | Mudança |
| --- | --- | --- |
| 0021_empresa_zip_code.sql | 0028_empresa_zip_code.sql | CEP da empresa |
| 0022_categories_admin.sql | 0029_categories_admin.sql | Segmentos e interesses do currículo |
| 0023_page_builder.sql | 0030_page_builder.sql | Layouts, publicação e menus de páginas |
| 0024_hiring_process.sql | 0031_hiring_process.sql | Seleção, mensagens, documentos e bucket privado |
| 0025_candidato_roles_backfill.sql | 0032_candidato_roles_backfill.sql | Perfis de candidato existentes |
| 0026_vaga_modalidade.sql | 0033_vaga_modalidade.sql | Modalidade de trabalho |
| 0027_superadmin_access.sql | 0034_superadmin_access.sql | Moderação e proteção do último administrador, sem promoção de demo |

**Antes de aplicar no projeto mantido:** consultar o histórico `supabase_migrations.schema_migrations` e conferir o schema efetivo. A numeração antiga foi usada para conteúdos diferentes pelas branches. Se alguma migration da branch do painel já foi aplicada sob o número antigo, reconciliar o histórico e as estruturas existentes antes de executar as versões renumeradas; não reaplicá-las cegamente. Não usar `db reset` nem `--include-all` para tentar contornar essa divergência.

Consulta somente de leitura para o responsável executar no SQL Editor:

```sql
select version, name
from supabase_migrations.schema_migrations
order by version;
```

Se o ambiente estiver exatamente no estado da main remota, conferir também quais migrations 0021–0027 já foram aplicadas; commits no GitHub não comprovam execução no banco. Depois aplicar apenas as faltantes, em ordem. As migrations editoriais 0025/0027 inserem conteúdo e a 0032 faz backfill de papéis: revisar antes da execução. A alteração manual de senha exige também a publicação da Edge Function `admin-password`; o merge do código não publica essa função.

## Validação local

- Instalação reproduzível com `npm ci --no-audit --no-fund`.
- Build TypeScript/Vite de produção aprovada.
- A integração inicial passou em 170 testes; a versão com CRUD e blog passou em 187 testes em 19 arquivos.
- ESLint sem erros; quatro avisos existentes de Fast Refresh. A verificação de espaços de código, testes e migrations passa; arquivos históricos de skills/evidências importados conservam avisos de espaços finais.
- Detector mecânico Impeccable sem ocorrências nos alvos inspecionados (homepage, navbar e usuários).
- Testes PostgreSQL existentes aprovados: administração, classificações, conteúdo editorial e auditoria de senhas.
- Novo teste `tests/database/unified-migrations.mjs` executa a sequência real das migrations de estrutura num PostgreSQL em memória. Seeds/fixtures de Auth são excluídos porque dependem do serviço Supabase/pgcrypto; Auth e Storage são simulados. Verifica números únicos, tabelas editoriais e de contratação e a proteção final contra autopromoção. Nenhum banco remoto participa.
- Homepage inspecionada no Chromium em desktop (1280 px) e celular emulado (390 px), imagem principal carregada e sem overflow horizontal em 390 px. Alternância “Quero contratar” verificada. Não foram exercitados fluxos com usuários autenticados nem dispositivos físicos.
- Capturas locais em `output/playwright/unificacao-home-desktop.png` e `output/playwright/unificacao-home-mobile.png`.
