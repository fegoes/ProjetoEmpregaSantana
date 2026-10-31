# Imagens desktop e móvel

Esta especificação substitui a orientação genérica de 1920 × 1080 / 320 × 480. Não existe uma dimensão única ideal para todo o sistema. As metas abaixo consideram as áreas atuais, proporção e densidade de pixels; são recomendações, sem bloquear imagens de outras resoluções.

| Uso | Desktop | Móvel | Peso desejável |
| --- | --- | --- | --- |
| Perfil e logo | 512 × 512, 1:1 | 512 × 512, 1:1 | até 150 KB |
| Fundo/banner | 2560 × 1440, 16:9 | 1280 × 1600, 4:5 | até 600 / 300 KB |
| Capa do blog | 1536 × 1024, 3:2 | 960 × 640, 3:2 | até 350 / 200 KB |
| Galeria/portfólio/vaga | 1920 × 1080, 16:9 | 960 × 540, 16:9 | até 400 / 200 KB |
| Conteúdo | 1600 px de largura | 960 px de largura | até 350 / 200 KB |
| Compartilhamento social | 1200 × 630 | 1200 × 630 | até 300 KB |

A capa de artigo tem largura máxima de 768 px: 1536 px atende 2×. Uma imagem de 320 px não atende com nitidez uma área de 390 px em um celular 2× (780 px) ou 3× (1170 px). As metas móveis maiores atendem os tamanhos mais comuns, sem prometer resolução máxima em todo monitor ou dispositivo. Imagens de conteúdo mantêm altura proporcional. Banners podem ter arte móvel diferente. Cabeçalhos de vagas/autônomos usam área 21:9 no desktop, e cards 16:9. A exibição atual contém a imagem inteira e preserva espaços neutros quando a proporção difere. Peso em KB é meta editorial, não garantia automática de compressão; o limite de upload continua 5 MB.

Somente JPG e PNG são aceitos. JPG é indicado para fotografia; PNG para transparência, logos, diagramas e artes que precisem de precisão. Reduzir dimensões antes do upload, remover metadados desnecessários e exportar em sRGB. As imagens não são automaticamente recomprimidas nesta alteração.

## Envio e persistência

Campos compartilhados de upload e campos editoriais apresentam Desktop e Móvel separadamente. Primeiro envie a desktop; a móvel é opcional e pode ter outro enquadramento. Galerias de publicações têm um campo móvel por foto desktop. A galeria pessoal tem entradas desktop e móvel separadas e mantém os arquivos privados; ela é uma coleção pessoal, não associa automaticamente um arquivo privado a uma publicação pública.

Atualização: a migration `0041_company_image_management.sql` estende as permissões ao superadmin e aos responsáveis autorizados pelos arquivos da empresa, vaga ou perfil, verificando a pasta real do arquivo. A galeria privada permanece isolada.

A migration `0040_responsive_image_variants.sql` cria `image_variants`, exclusivamente para associar arquivos já públicos e pertencentes à mesma conta. Não altera as URLs desktop salvas em posts e perfis nem quebra registros antigos. As permissões iniciais eram do uploader; a atualização 0041 permite a gestão compartilhada autorizada, sem conceder acesso a imagens privadas de terceiros. Imagens externas por URL continuam funcionando como desktop, mas para associar uma versão móvel é necessário enviar ambos os arquivos pelo sistema; a propriedade dos dois é verificada no servidor.

Imagens renderizadas usam `<picture><source media="(max-width: 639px)">`: abaixo de 640 px usa móvel, quando existente; em outras larguras, desktop. Sem variante, ou quando a consulta está indisponível, mantém desktop. Capas, cards, carrosséis, logos, fotos de perfil, páginas do construtor e imagens em texto rico contemplam a variante. No texto rico a associação é aplicada após a consulta, podendo haver download inicial da desktop. Prévias de upload exibem cada arquivo original, sem alterar a arte. Bots e metadados sociais usam a imagem desktop. A versão móvel social afeta somente a prévia interna.

Aplicar **0039**, se ainda pendente, e **0040**, em ordem. Nenhuma delas foi executada pelo agente no banco remoto.

## Fontes e validação

- [MDN: imagens responsivas](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
- [MDN: elemento picture](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture)
- [MDN: formatos de imagem](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)

Os números da tabela são escolhas técnicas para este layout, não dimensões universais prescritas pelas fontes. Testes verificam fallback, seletor móvel, envio independente e autorização de propriedade no PostgreSQL local. A galeria privada conserva testes que impedem acesso entre contas.
