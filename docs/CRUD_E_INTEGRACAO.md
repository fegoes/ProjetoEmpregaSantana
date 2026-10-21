# CRUD e integração dos dados

**Requisito confirmado em 20/10/2026:** as telas funcionais precisam consultar e gravar dados reais, com operações de criar, visualizar, editar e excluir ou desativar conforme cada domínio e papel. Uma ação demonstrativa do protótipo não equivale a essa integração.

## Inventário inicial (antes da implementação)

Leitura estática, sem validação em um banco conectado nesta rodada. Há apenas `.env.example` no checkout; não foi encontrada configuração local de Supabase. Isso não comprova o estado de outros ambientes ou do deploy.

| Domínio | Operações já presentes | O que deve ser concluído ou validado |
|---|---|---|
| Vagas | Criar/atualizar por upsert, listar, detalhe e excluir; `useEmpresaVagas.ts`, formulários/listas de empresa e admin | Feedback de erro/sucesso, confirmação do impacto de excluir, cache dos detalhes/painéis e permissões por empresa |
| Currículos | Criar/atualizar, listar, consultar detalhe e excluir; `useCvVariants.ts` | Validação e feedback, confirmação ao excluir, cache do detalhe e comportamento quando usado em candidatura |
| Empresas | Cadastro no onboarding, leitura, edição pelo dono, status/verificação/exclusão pelo admin | Estados completos e quais ações cabem ao dono; exclusão envolve vagas, candidaturas e vínculos |
| Autônomos | Onboarding por upsert, leitura pública e edição do perfil | Publicar/pausar, prévia, erros de salvamento e regra explícita de retirada do perfil; não inventar exclusão em cascata |
| Conta/perfil | Consulta, atualização de nome/telefone e administração de status | `PerfilContaPage.tsx` precisa tratar o retorno da atualização antes de afirmar sucesso; separar dados pessoais de dados públicos |
| Candidaturas | Criar/atualizar currículo enviado por upsert, leitura pelo candidato/empresa e mudança de status pela empresa | Erro e confirmação de envio; decidir política de desistência. Não oferecer excluir candidatura como CRUD genérico sem regra de negócio |
| Páginas institucionais | Leitura e atualização de registros existentes | Validar gestão de slugs fixos; criar/excluir página pode não ser necessário para conteúdo legal |
| Blog/artigos | Não há módulo de posts | Criar rascunho, listar, editar, pré-visualizar, publicar, retirar do ar e política de exclusão; modelo, rotas, SEO e RLS ainda precisam de implementação |
| Planos | Leitura e ativar/desativar no admin | Cadastro e edição de limites/preços; preservar assinaturas e histórico. Ativação de plano não implementa cobrança |
| ADS | Listagem de registros | Criar/editar período, posição, objeto e estado; separar gestão manual do futuro checkout |
| Categorias | Consulta para seleção e filtros | Decidir se haverá gestão pelo admin; proteger referências existentes antes de renomear/excluir |
| Usuários no admin | Leitura, ativar/desativar, flag admin e excluir perfil | Validar efeitos sobre papéis, dados vinculados e conta de autenticação; excluir `profiles` não deve ser apresentado automaticamente como remoção da identidade em `auth.users` |

As operações acima são chamadas presentes no código, não uma declaração de que todos os fluxos já funcionam em produção. As migrations continuam sendo a fonte de verdade das relações e permissões.

## Contrato de cada tela funcional

1. **Consultar:** carregamento, dados, vazio e erro distintos; filtros e paginação coerentes com a consulta.
2. **Criar:** formulário validado, estados de envio e retorno; após sucesso, mostrar o registro persistido e sua identificação.
3. **Editar:** carregar o registro correto, preservar valores em caso de falha e impedir envio duplicado; sinalizar alterações não salvas quando necessário.
4. **Excluir/desativar:** regra específica por domínio, confirmação proporcional ao impacto, lista de consequências reais e feedback após o banco confirmar. Usar pausa/arquivamento quando o negócio exigir preservação.
5. **Atualizar as outras áreas:** invalidar lista, detalhe, contagens e consultas relacionadas. Não usar um toast para esconder uma tela desatualizada.
6. **Permissão:** validar no banco por RLS e, quando necessário, em função de servidor. Menus e botões condicionais ajudam a navegação, mas não autorizam operações por si só.
7. **Responsividade e acesso:** ações por registro acessíveis em celular e teclado; formulários, confirmações, erros e estados de envio não podem ficar fora da tela.

## Como conectar os protótipos à aplicação

O estudo em `prototipos/` é independente. Na implementação real, transferir os componentes visuais escolhidos para `src/` e ligar cada ação aos hooks e tipos existentes, em vez de reutilizar arrays fictícios ou mensagens de simulação como persistência.

A navegação do painel organiza os CRUDs por domínio: candidato → currículos/candidaturas; autônomo → perfil; empresa → vagas/candidatos/perfil; administração → cadastros e conteúdo. Publicação e atualização de status são ações de negócio adicionais, além das quatro operações básicas.

Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente local apropriado e aplicar/verificar migrations no projeto correto antes da validação funcional. Credenciais privilegiadas não entram no frontend. Ambientes de teste devem usar registros próprios, para evitar criar ou excluir dados de usuários reais durante a conferência.

## Sequência sugerida

- Primeiro: vagas, currículos e perfis, reaproveitando os hooks existentes e fechando erros/sucesso/cache.
- Depois: revisão de candidatos, gestão de empresas e ações administrativas, com verificação de RLS e impactos de exclusão.
- Em seguida: módulo editorial de artigos e sua gestão; ampliar planos/ADS conforme o escopo comercial for confirmado.

Essa foi a sequência técnica proposta no inventário. A implementação subsequente está registrada abaixo; não houve gravações em Supabase real nem execução de migrations neste checkout.

## Critérios de validação funcional

Para cada domínio, criar um registro de teste, recarregar e encontrá-lo; editar, recarregar e confirmar a alteração; excluir/desativar e conferir o comportamento previsto. Testar sessão expirada, falha de rede, erro de validação, duplo clique e acesso de outro usuário sem permissão. Confirmar que lista, detalhe, painel e visão pública refletem o mesmo estado. A validação deve ocorrer no ambiente de teste com as políticas reais do banco.

## Implementação desta rodada

A home, busca, navegação global, painel e blog passaram para a aplicação real. As alterações não reutilizam registros fictícios do protótipo.

- Vagas e currículos: operações existentes reforçadas com confirmação de exclusão, retorno de erro, estados de envio e invalidação de consultas relacionadas. A vaga permite cadastrar remuneração e controlar sua divulgação.
- Candidaturas: envio com seleção de currículo, confirmação após retorno do banco e erro preservando o formulário; atualização de status pela empresa com feedback.
- Conta, empresa e autônomo: salvamento aguarda o retorno e apresenta erro ou confirmação; consultas públicas são invalidadas quando pertinentes.
- Painel: resumo de candidaturas e currículos consultados, menu por papel à esquerda e menu global superior; acesso continua protegido pelas rotas e políticas existentes.
- Blog: criação, leitura, edição, prévia privada, publicação, arquivamento e exclusão no admin. Público consulta apenas publicados. Migration `0021_blog_articles.sql`, RLS, tipos, hooks, metadados e sitemap incluídos.
- Busca: filtros preservados na URL, estados de erro/vazio e informações essenciais visíveis sem hover.

Planos, ADS, categorias e remoção de conta de autenticação não foram ampliados para um CRUD genérico. Mantêm seus fluxos existentes e pendências do inventário. Cobrança não foi implementada.

Build, testes e QA com API simulada verificam código e interface. O ciclo persistido e as políticas entre usuários precisam ser validados no Supabase configurado, conforme [IMPLEMENTACAO.md](IMPLEMENTACAO.md).


Atualização de acesso: a interface não promove nem revoga administradores. A concessão é privilegiada e explícita, conforme [MODELOS_E_ACESSOS.md](MODELOS_E_ACESSOS.md) e migration0023. Os modelos e CRUDs atuais formam a base para aprofundar os protótipos administrativos posteriormente.
