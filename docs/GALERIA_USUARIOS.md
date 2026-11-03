# Biblioteca privada de imagens

Cada usuário acessa **Minha galeria** no menu lateral (`/perfil/galeria`). Pode enviar JPG/PNG pelo dispositivo ou por link HTTPS, visualizar, paginar e remover seus originais. O bucket `user-gallery` permanece privado, com pastas por usuário e políticas de isolamento inclusive para administradores.

Todos os campos que usam `ImageSourcePicker` oferecem dispositivo, link e Minha galeria: perfis de candidatos/autônomos, empresas, vagas, páginas e posts, incluindo desktop e móvel. Selecionar uma imagem baixa o original autenticado e passa o arquivo pelo fluxo do formulário. URLs assinadas expiráveis são usadas apenas na prévia privada e nunca salvas nas publicações.

Novos uploads pelo serviço compartilhado guardam uma cópia original privada antes da cópia pública. Quando o arquivo foi selecionado da biblioteca, seu original é reaproveitado sem outro upload privado. Uma mesma imagem pode ser utilizada em várias publicações: cada destino mantém uma cópia pública independente. Excluir o original da biblioteca não apaga essas cópias nem quebra publicações existentes.

Nos posts, selecionar arquivos ou imagens da galeria mantém a prévia local; armazenamento privado e cópia pública só são enviados no salvamento. Campos de outras telas continuam com seu fluxo de upload atual. Se o armazenamento privado falhar, o upload apresenta erro em vez de publicar sem guardar o original. Retries do mesmo arquivo em memória reaproveitam o original já guardado.

Os originais antigos de `user-gallery` continuam selecionáveis. Arquivos enviados anteriormente apenas a `public-media` não são importados automaticamente: não se faz varredura de fotos de outras contas ou empresas. É possível adicioná-los à biblioteca por arquivo ou link autorizado. Desktop e móvel são selecionados separadamente; só JPG/PNG até 5 MB. As orientações técnicas de dimensões continuam específicas de cada campo, definidas em `ImageGuidance`.

## Banco e validação

Não há migration nova. É necessária a configuração já existente de `0039_user_image_gallery.sql` (bucket e políticas privadas). Variantes responsivas usam `0040_responsive_image_variants.sql`. Não foi feita alteração no banco remoto.

Testes de serviço verificam propriedade, sessão, formatos, reaproveitamento do original e cópia pública sem URL assinada. Testes de interface verificam as três origens e bloqueio enquanto a imagem é selecionada. `tests/database/unified-migrations.mjs` valida em PostgreSQL local que contas distintas não leem, enviam ou excluem arquivos de outra galeria.
