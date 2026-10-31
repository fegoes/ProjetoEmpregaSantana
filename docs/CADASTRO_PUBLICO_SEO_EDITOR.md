# Cadastro público, indexação e editor visual

Atualização de 30/10/2026 (horário de Recife).

## Cadastro e confirmação

O erro principal era tentar inserir `user_roles` no navegador logo após `signUp`. Com confirmação de e-mail ativa, o Supabase devolve um usuário sem sessão; a escrita anônima é recusada pela RLS. O cadastro agora envia nome, telefone e perfil público como metadata, e `0038_public_registration.sql` cria perfil e papel na transação do Auth. O trigger aceita somente candidato, autônomo e empresa, sempre com `is_admin=false`. O responsável informou a aplicação da migration no banco durante esta tarefa; não foi usada credencial administrativa para executá-la por esta sessão.

Fluxo corrigido:

1. A pessoa abre a vaga ou escolhe publicar pela empresa. O conteúdo público não exige login.
2. Ao criar conta, informa nome, telefone com DDD, e-mail e senha. O perfil inicial é inferido pela ação de origem e pode ser alterado no formulário.
3. O serviço recebe um `emailRedirectTo` para `/auth/confirmar`, preservando o destino escolhido.
4. A tela explica a confirmação e oferece reenvio com espera de 60 segundos, mensagens de erro e opção de login. Não armazena senha nem coloca o e-mail nos parâmetros da URL.
5. O callback processa confirmação, sessão e links expirados. Tokens são retirados do endereço depois do processamento. Um link inválido não é tratado como confirmação por existir uma sessão anterior.
6. A pessoa continua para completar o perfil. O candidato retorna à vaga com `candidatar=1`; se precisar, cria o currículo e volta à mesma vaga para enviar. A empresa conclui seus dados antes de acessar a criação da vaga.

A aprovação da empresa continua sendo uma regra da plataforma: uma empresa pendente precisa de aprovação pelo superadmin para publicar. A tela informa essa etapa, em vez de apresentar uma gravação que será recusada. O cadastro de conta e a confirmação de e-mail não aprovam a empresa automaticamente.

A hidratação da sessão agora diferencia conta inativa de falha temporária ao carregar perfil. Em uma falha de leitura, a sessão é mantida com acesso privado bloqueado e opção de tentar novamente. Consultas disparadas por `onAuthStateChange` são adiadas para fora do callback, evitando chamadas Supabase sob o bloqueio interno do Auth.

## Configuração do Supabase

A consulta pública a `/auth/v1/settings` confirmou que o provedor de e-mail está ativo e a confirmação está habilitada (`mailer_autoconfirm=false`). Essa consulta não revela a configuração SMTP nem a lista de URLs permitidas.

Conferir no painel do projeto:

- **Authentication → URL Configuration → Site URL:** `https://emprega-santana.vercel.app`.
- **Redirect URLs:** permitir `https://emprega-santana.vercel.app/auth/confirmar**` para o callback e seus parâmetros de retorno. Manter também `/redefinir-senha**` para a recuperação de senha existente. URLs locais, se necessárias, devem ser configuradas explicitamente para desenvolvimento.
- **Email provider:** manter a confirmação habilitada. O código não anuncia envio de confirmação quando o serviço cria sessão automaticamente.
- **E-mail de confirmação:** usar `{{ .ConfirmationURL }}` no link do template. Se usar um template com token hash, apontar para `/auth/confirmar?token_hash={{ .TokenHash }}&type=signup` e preservar o retorno desejado.
- **SMTP de produção:** conferir remetente, credenciais, verificação do domínio e limites do provedor. O remetente do sistema e a caixa Gmail do destinatário têm funções diferentes. O serviço SMTP padrão do Supabase tem restrições e não substitui um provedor de envio de produção.

Não há credencial administrativa do Supabase disponível nesta máquina nesta sessão. O aceite de uma solicitação de envio pela API não comprova a entrega na caixa de entrada. A validação real deve registrar o resultado da API e a confirmação de recebimento pelo destinatário, sem trocar a senha de uma conta existente.

Fontes: [signUp](https://supabase.com/docs/reference/javascript/auth-signup), [eventos de autenticação](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## Páginas públicas e buscadores

- Vagas publicadas, empresas ativas, profissionais e artigos públicos continuam acessíveis sem login. O diretório `/empresas` também foi aberto, usando apenas os campos de apresentação pública.
- Googlebot, Bing e outros leitores recebem HTML com o conteúdo público, incluindo o texto de seções personalizadas sem depender de executar JavaScript. A autorização das consultas continua sendo anônima, sujeita à RLS.
- `JobPosting` usa a mesma função no React e na pré-renderização: organização, localização, validade, modalidade e remuneração somente quando autorizada para exibição.
- Vagas expiradas saem da exploração e do sitemap. Não recebem `JobPosting` ativo. Robôs recebem 404 para vaga indisponível; uma falha do banco recebe 503 com tentativa posterior, em vez de ser confundida com exclusão.
- `/sitemap.xml` é entregue como XML pelo middleware da hospedagem, sem depender do deploy separado da antiga função `sitemap`. Lista URLs absolutas, incluindo páginas publicadas no editor visual, consulta registros públicos em páginas e não responde um sitemap vazio como sucesso quando o banco falha.
- `robots.txt` aponta para o sitemap absoluto. Painéis, login, cadastro, recuperação e callback recebem `X-Robots-Tag: noindex` e metadados privados. O controle de acesso continua no Auth e na RLS, não em robots.txt.

Tornar uma página rastreável não garante prazo nem posição nos resultados. O proprietário deve cadastrar o sitemap no Search Console e acompanhar os relatórios de indexação e de vagas. [Orientações do Google para vagas](https://developers.google.com/search/docs/appearance/structured-data/job-posting).

## Edição de páginas e posts

O post continua salvo como HTML sanitizado; não depende de uma nova migration editorial. O editor agora oferece blocos de texto, título, imagem com descrição/legenda, lista, citação e separador. É possível selecionar, editar, duplicar, excluir, alinhar e reordenar blocos. A prévia acompanha as mudanças antes de salvar. Conteúdo legado é carregado como blocos, incluindo texto sem tags.

Páginas, seções, slides e blocos possuem alças de arraste. A reordenação fica restrita à própria lista, sem mover acidentalmente um bloco para uma seção incompatível. Os controles Subir/Descer continuam disponíveis para toque e teclado; nas alças, Alt + seta também reordena. As páginas têm edição e prévia simultâneas, além da visualização ampliada existente. A implementação não é uma instalação do WordPress nem um editor de camadas absolutas: mantém o modelo responsivo de seções e blocos do projeto.

O menu lateral tem comandos explícitos de recolher/expandir, permanece em uma faixa de ícones no desktop e salva a preferência local. A troca de perfil permanece disponível na versão recolhida para contas com múltiplos perfis. No celular, o menu é uma gaveta que fecha ao navegar. Não há recolhimento por temporizador que interrompa uma edição.

## Verificação local

- 213 testes em 24 arquivos aprovados: autenticação, callback, destinos seguros, indexação, salário oculto, falhas temporárias e reordenação.
- Build de produção aprovado. Há aviso de tamanho de chunk; não é erro de build.
- ESLint sem erros; avisos de Fast Refresh nos módulos que exportam hooks e componentes juntos.
- Sequência de migrations reais verificada em PostgreSQL em memória, incluindo cadastro pelo trigger e rejeição de promoção via metadata. Seeds específicos do serviço Auth continuam fora desse teste isolado.
- Chromium com API interceptada localmente: cadastro sem escrita anônima e com retorno à vaga, menu recolhido persistente após reload, arraste real de blocos e edição de página com prévia simultânea.
- Capturas em `output/playwright/`: `cadastro-confirmacao-desktop.png`, `editor-post-blocos.png`, `paginas-editor-previa.png`.
