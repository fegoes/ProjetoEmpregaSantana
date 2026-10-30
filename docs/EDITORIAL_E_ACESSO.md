# Blog, imagens e acesso administrativo

Mudanças locais de 22/10/2026, sem commit, push, PR ou deploy.

## Editor e conteúdo

O blog tem três posts originais preparados em `src/content/editorialDrafts.ts`: organização do currículo, apresentação de serviços e escrita de vagas. Podem ser abertos individualmente na área de artigos. A migration0025 também os insere como **rascunhos**, sem sobrescrever um slug existente. Nenhum texto é publicado automaticamente.

O editor mantém formulário e prévia lado a lado em telas largas, empilhados em celulares. As prévias mostram artigo, resultado de busca e cartão de compartilhamento. O campo de conteúdo aceita imagens na posição do cursor, com texto alternativo, por URL HTTPS ou upload. Imagens podem ser removidas com seleção e Delete. Capa e imagem social são independentes; uploads aceitam JPG/PNG/WebP/AVIF até 5 MB e usam o bucket público existente, em pasta editorial com escrita reservada ao admin. Não colocar documentos ou imagens privadas nesse bucket. O salvamento aguarda uploads em andamento.

SEO por artigo: título e descrição de busca, palavras-chave, canonical personalizada e noindex. Compartilhamento: título, descrição, imagem e descrição da imagem, com fallback para título/resumo/capa. A conferência editorial não é pontuação de posicionamento. Palavras-chave não garantem ranqueamento. As configurações alimentam metadados React e HTML de robôs no middleware; artigos noindex ficam fora do sitemap. Metadados padrão por rota evitam reaproveitar título e imagem do artigo anterior, e áreas privadas recebem noindex.

A distribuição da ilustração ocorre na home, no blog e no rodapé compartilhado das páginas públicas. O painel administrativo permanece concentrado nas tarefas. Origem do asset e decisão de navegação em `NAVEGACAO_ESSENCIAL.md`.

## Senha: duas opções

A gestão de usuários oferece envio de e-mail e definição manual. A definição manual exige confirmação de uma senha com 12–128 caracteres e chama a função `admin-password`. O navegador não recebe chave privilegiada, não persiste senhas e limpa os campos ao concluir ou cancelar.

No servidor, a função valida o token no Auth, consulta o perfil do solicitante e exige admin ativo. Quando há fator verificado, exige sessão aal2. Antes da alteração, a RPC reserva um evento com limite de cinco tentativas por administrador em dez minutos. A senha é atualizada pelo endpoint administrativo no servidor; apenas resultado, ator, alvo e data entram na auditoria. Falhas de autorização, reserva ou alteração no Auth não retornam sucesso. Se o Auth confirmar a senha mas a confirmação da auditoria falhar, a interface informa senha definida e auditoria pendente; o evento reservado permanece disponível, sem registrar a senha. Os identificadores históricos não bloqueiam a exclusão posterior da conta. A troca manual não solicita um link de redefinição; notificações de segurança do provedor dependem da configuração do Auth. Não foi implementada invalidação imediata de todos os tokens já emitidos.

Referência de implementação: [Supabase — atualização administrativa de usuário](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid). Essa API deve ser utilizada somente no servidor.

## Ativação necessária

Aplicar 0025 (campos editoriais, rascunhos e permissão de mídia) e 0026 (auditoria e limite de senha) após as migrations anteriores. Implantar `admin-password` no projeto correto, com `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente da função; nunca variáveis VITE para a chave de serviço. Reimplantar a função de sitemap e publicar o frontend/middleware no fluxo habitual quando solicitado.

Não houve alteração de senhas ou dados reais, aplicação de migrations ou implantação remota nesta etapa. Testes de servidor usam requisições simuladas; a persistência e as permissões do ambiente real ainda precisam de validação.

## Verificação local

Build aprovado; 37 testes Vitest aprovados, incluindo autorização da função, conta comum/desativada, token expirado, MFA, limite de tentativas, confirmação de auditoria e metadados HTML para robôs. Lint sem erros e quatro avisos preexistentes. `npm run test:database` inclui testes isolados de acesso, classificações, migration editorial e auditoria de senha; não é uma validação do Supabase remoto.

Chrome com API/sessão simuladas: home, blog e artigo em 320/390/768/1440px; editor e usuários nas mesmas quatro larguras, total de 20 capturas sem transbordamento horizontal detectado. Exercitados menu, seleção de público, texto inicial, prévia social, imagem no conteúdo, payload de salvamento e ação de senha manual. Nenhuma senha real foi alterada.

Revisão visual: primeira rodada de evidência pediu recaptura de uma imagem lazy; as capturas foram refeitas após carregar imagens. A revisão completa apontou três correções (cortes nas capas, instrução de tamanho da senha e ícones da conferência de SEO). O veredito posterior considerou as três resolvidas; seu alcance é essa lista de correções, não uma certificação de todo o produto.
