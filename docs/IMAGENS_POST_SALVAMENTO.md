# Imagens dos posts: escolher agora, enviar ao salvar

A origem da imagem agora é uma escolha por rádio: **Arquivo do dispositivo** ou **Link da imagem**. Foi removido o botão redundante “Enviar arquivo”. O campo nativo de arquivo abre o seletor do computador/celular. Essa simplificação vale para os componentes compartilhados do sistema.

No editor do blog, as imagens novas permanecem no rascunho até **Salvar rascunho**, **Publicar** ou **Agendar**. Vale para capa, imagem social, imagens inseridas no texto, blocos de imagem, galerias, slides e anúncios, incluindo as versões desktop e móvel.

- Arquivo local: valida JPG/PNG de até 5 MB, cria URL blob temporária e exibe a prévia; não envia ao Storage durante a escolha.
- Link: um input recebe o endereço HTTPS direto, sem botão extra de importar. A prévia pode carregar a imagem do servidor externo; a importação para o armazenamento do projeto ocorre apenas ao salvar. O servidor de origem ainda precisa permitir a importação por CORS e o arquivo baixado deve ser JPG/PNG de até 5 MB.
- Versão móvel: a associação também fica local até o salvamento. Prévia desktop/móvel funciona antes do envio, inclusive no corpo de texto rico.
- Remover ou substituir uma imagem antes de salvar deixa sua referência fora do envio. Fechar sem salvar revoga as URLs temporárias e não envia arquivos ao armazenamento. Um arquivo escolhido para inserir no texto só participa do salvamento depois de clicar em Inserir na posição do cursor.

## Ordem do salvamento

1. Validar os campos da publicação.
2. Enviar somente os arquivos referenciados pelo rascunho final e suas variantes móveis.
3. Substituir as referências locais pelas URLs definitivas.
4. Salvar as associações móveis e a postagem.
5. Atualizar o cache das variantes e fechar o editor após sucesso.

Durante esse processo, os campos e o fechamento do editor ficam desabilitados. Em falha, o rascunho e suas escolhas permanecem para tentar novamente. Uploads já concluídos são reutilizados na mesma sessão, evitando duplicação no retry. Não se promete transação única entre Storage e banco: uma falha posterior pode deixar um arquivo enviado sem postagem concluída. Não é feita exclusão automática desses arquivos, para não apagar referências eventualmente compartilhadas.

Implementação: `DraftImageStore`, contexto local ao editor de artigo e integração aos campos editoriais e à leitura das variantes. A sanitização de HTML continua ativa; somente blobs registrados como arquivos locais pelo editor são restaurados após a limpeza para a prévia. Nenhuma URL blob deve ser persistida no artigo salvo. Não exige migration nova. As políticas e migrations de imagens existentes continuam necessárias.

Nos demais cadastros, o seletor compartilhado também perdeu o botão redundante; o momento do upload conserva o fluxo de salvamento já existente de cada cadastro. O envio adiado desta entrega é específico ao editor de posts, conforme o pedido.

## Verificação

254 testes passaram, incluindo seis casos de fila, importação adiada, descarte de referências removidas, variantes móveis e reutilização após falha; teste de link sem importação antecipada e testes da prévia local com sanitização. Build e lint conferidos. QA de navegador usa Auth, REST e Storage simulados, sem uploads reais durante o teste. Contagem observada: zero uploads/gravações antes de salvar; após salvar, dois uploads (desktop e móvel), uma associação de variante e artigo com URL HTTPS, sem referências blob.

Identidade Impeccable existente preservada: formulários claros, seleção nativa acessível, rótulos e foco dos componentes atuais. Não há mudança de paleta ou de tokens globais. Revisão visual inline, sem avaliador independente.
