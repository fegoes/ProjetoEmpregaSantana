# Administração e navegação dos painéis

Decisão confirmada pelo responsável em 20/10/2026: administração com menus inspirados no WordPress, lateral azul profunda, conteúdo claro, sem cabeçalho público, gestão dos cadastros e aparência. O painel do usuário também pode ter lateral azul escura.

A referência é a organização de funções na [documentação oficial das telas administrativas do WordPress](https://wordpress.org/documentation/article/administration-screens/). O projeto aplica sua própria marca e seus domínios; não instala WordPress ou seus plugins.

## Estrutura implementada

- Administração: navegação fixa à esquerda no desktop; conteúdo utiliza a largura disponível, sem navbar ou rodapé público. Painel, vagas, profissionais, empresas, blog, páginas, usuários, aparência, planos, destaques, conta, Visitar o site e saída.
- Vagas, profissionais e empresas: submenus de listagem e inclusão aparecem quando a área está ativa. Formulários de edição têm rotas próprias.
- Celular: botão Menu da administração abre uma gaveta azul escura. Escape e botão de fechar retornam ao conteúdo; trocar de rota fecha a gaveta.
- Usuário comum: mantém a navegação global superior e ganha lateral azul escura e gaveta correspondente. Conteúdo continua claro.
- Protótipo: `/#admin` permite examinar a composição sem login; dados e ações são explicitamente ilustrativos. `/#painel` demonstra a lateral azul dos usuários. O protótipo permanece separado do aplicativo.

## Gestão conectada no aplicativo

| Área | Rotas | Operações |
|---|---|---|
| Vagas | `/admin/vagas`, `/nova`, `/:id/editar` | Buscar, filtrar, criar, ler, editar, publicar/pausar/encerrar e excluir; empresa opcional, remuneração e visibilidade |
| Profissionais | `/admin/profissionais`, `/novo`, `/:id/editar` | Criar perfil de serviços para uma conta existente, ler, editar, ativar/pausar, destacar e excluir o perfil |
| Empresas | `/admin/empresas`, `/nova`, `/:id/editar`, `/:id` | Criar com responsável existente, ler/detalhar, editar dados, situação e verificação e excluir |
| Blog | `/admin/artigos` | Criar, editar, pré-visualizar, publicar, arquivar e excluir artigos |
| Aparência | `/admin/aparencia` | Consultar, pré-visualizar e salvar preferências globais |

A criação de empresa e de perfil profissional aproveita os triggers existentes de associação de papéis. Não se criam contas de autenticação pelo navegador do administrador. O formulário vincula uma conta já cadastrada. Alterar o responsável de uma empresa existente não está disponível neste formulário, pois exige reconciliar equipe e propriedade.

As exclusões apresentam consequências antes da confirmação. Excluir profissional remove o perfil de serviços e vínculos dependentes no banco; preserva sua conta de acesso e outros papéis. Excluir empresa ou vaga conserva as cascatas existentes descritas na confirmação. Arquivos físicos do Storage não recebem limpeza automática nova nesta rodada.

Os cadastros usam insert/update/delete com retorno de registro e invalidam consultas após sucesso. Falhas preservam os campos e exibem recuperação; não há persistência fictícia no aplicativo. Busca e filtro das listas são locais sobre os registros consultados; grandes volumes ainda pedem paginação no servidor.

## Aparência persistida

A migration `0022_site_appearance.sql` cria uma configuração singleton pública de apresentação. Somente administradores podem gravar por RLS. A tabela não contém segredos.

Opções: azul principal entre três variações controladas, fundo branco/cinza claro, texto padrão/ampliado e botões cápsula/arredondados. A prévia é privada ao formulário até salvar; após o retorno do banco, os estilos são aplicados ao site e ao sistema. Restaurar campos padrão exige salvar para efetivar. Os menus laterais continuam azul profundo e o conteúdo continua em modo claro.

Aplicar as migrations pendentes, incluindo 0021 (blog) e 0022 (aparência), no ambiente Supabase correto e configurar `.env.local`. Veja [IMPLEMENTACAO.md](IMPLEMENTACAO.md). Nenhuma migration ou alteração de dados reais foi executada neste checkout. QA de interface usa respostas de API e sessão simuladas, sem comprovar permissões reais do banco.


## Verificação desta entrega

- Build principal e build dos protótipos aprovados; lint sem erros, com quatro avisos preexistentes de Fast Refresh; cinco testes automatizados aprovados.
- Aplicativo: 61 verificações de telas/larguras, incluindo formulários e texto ampliado, sem transbordamento ou erros de execução detectados. CRUD de vagas, empresas e profissionais e salvamento/recarregamento de aparência conferidos com API simulada.
- Protótipo: 35 combinações de sete telas em cinco larguras, sem transbordamento ou erros de execução detectados; gaveta e formulário demonstrativo conferidos.
- Revisão final: três achados corrigidos — campos de remuneração por modalidade, escala local da prévia e largura do filtro de situação. As dez verificações adicionais passaram; o reviewer marcou os três como resolvidos, `disposition: ship`, no escopo das correções e recapturas analisadas.
- Redirecionamentos de visitante e usuário sem permissão administrativa conferidos com sessões simuladas. Isso não comprova RLS no banco real.
- Registro visual em `DESIGN.md` e `.impeccable/design.json`, com nove previews. O agente de documentação atingiu limite de uso depois de salvar os arquivos; a conferência foi concluída diretamente pelo agente principal, verificando seções canônicas, previews e correspondência com o código.

Essas verificações não certificam todas as telas/estados ou dispositivos reais. Supabase, migrations e permissões ainda precisam da validação no ambiente conectado.


## Acesso administrativo reservado

Somente contas explicitamente provisionadas recebem administração. O cadastro público nunca concede esse acesso; o painel de usuários não oferece promoção a admin. A migration0023 reforça a proteção no banco e retira o privilégio da fixture administrativa antiga. Modelos, regras, testes e provisionamento por UUID estão em [MODELOS_E_ACESSOS.md](MODELOS_E_ACESSOS.md). A migração ainda precisa ser aplicada no ambiente real.
