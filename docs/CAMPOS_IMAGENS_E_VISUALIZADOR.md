# Campos de imagens e visualização integral

## Campos disponíveis

| Cadastro | Superadmin (criar/editar) | Acesso do usuário |
| --- | --- | --- |
| Empresa | Logo, capa e fotos da empresa, com controle de exibição pública | Logo no cadastro inicial e no perfil; fotos do ambiente na edição do perfil |
| Candidato | Foto no formulário do candidato e da conta de acesso | Foto na ativação do perfil, Minha conta e área de currículos |
| Autônomo | Foto de perfil e portfólio | Foto na ativação e no perfil; portfólio na edição |
| Vaga | Fotos desde a criação | Fotos disponíveis antes do primeiro salvamento da vaga |
| Blog/páginas | Campos existentes de capa, conteúdo, compartilhamento e construtor | Publicações administradas no superadmin |

Os campos reutilizam o envio local/link, versões desktop/móvel e validação JPG/PNG até 5 MB. Arquivos de logo agora recebem nomes únicos: um novo uploader autorizado não precisa sobrescrever um arquivo que pertencia a outro operador. URLs antigas permanecem válidas.

Empresa/vaga geram um UUID estável antes do envio, para associar a pasta e o registro ao salvar. As fotos da vaga atualizam a lista e o campo legado singular, inclusive ao remover a última foto. O superadmin envia fotos de usuário como arquivo próprio e vincula `profiles.avatar_url` ao salvar; não recebe acesso à galeria pessoal privada do usuário. Em caso de falha após criar uma conta, a tentativa seguinte usa a conta já criada para evitar duplicar o usuário.

## Imagem inteira e ampliação

Fotos usam `object-fit: contain`: mantêm sua proporção, sem deformação ou corte. Áreas com outra proporção recebem espaços neutros acima/abaixo ou nas laterais. Isso atende imagens 16:9, 16:10, retratos e quadradas sem obrigar recorte. Resolução baixa ainda pode perder nitidez; a mudança não acrescenta pixels à foto.

Carrosséis de vagas/portfólios têm botão Ampliar. Campos de envio, galerias pessoais/da empresa e capas editoriais também oferecem ampliação. O visualizador mantém a imagem inteira e permite Anterior/Próxima, setas do teclado, Escape e fechamento identificado. Imagens dentro de cards com link são ampliadas sem navegar para a outra página. Anexos de conversa conservam a ação própria de abrir arquivo; sua prévia também contém a imagem inteira.

Imagens privadas continuam com URL temporária e sem consulta ao catálogo público de variantes. Fotos da empresa mantêm sua opção de exibição pública; ela não transforma o bucket público em armazenamento privado. A galeria pessoal segue privada.

## Validação e banco

Aplicar a migration 0041_company_image_management.sql para a administração de imagens por superadmin e responsáveis autorizados. Dependências anteriores 0039 (galeria/foto) e 0040 (variantes) continuam necessárias, se estiverem pendentes. O agente não executou migrations no banco remoto.

232 testes passaram, além do build e lint sem erros. PostgreSQL isolado confirmou a permissão do admin para vincular foto e a impossibilidade de uma conta comum alterar a foto de outra. Navegador com API/armazenamento sintéticos confirmou salvamento da logo e sua recuperação na edição, `contain` no carrossel/visualizador e tela móvel sem overflow. Nenhum arquivo/cadastro de produção foi criado nessa validação.
