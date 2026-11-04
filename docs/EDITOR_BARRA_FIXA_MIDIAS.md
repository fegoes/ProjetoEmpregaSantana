# Barra fixa e posicionamento de mídias

O editor mantém uma única barra junto ao texto, sem barra flutuante sobre a seleção. O conteúdo rola em uma área própria. Nos painéis, o deslocamento respeita a altura do cabeçalho; dentro de modais, a barra usa o topo do próprio campo.

A barra reúne negrito, itálico, sublinhado, riscado, subtítulo, listas, tamanho da fonte (12–48 px), cor, alinhamento à esquerda/centro/direita/justificado, entrelinhas, hiperlink e limpeza de formatação. Nos posts, inclui imagem, galeria, slides, vídeo, anúncio e edição da mídia selecionada. A formatação continua salva em HTML e é preservada na leitura e reabertura.

## Inserção e edição

Ao abrir o seletor, o editor registra a posição do cursor. O modal oferece:

- Posição: cursor, antes/depois do parágrafo, início/fim do texto.
- Alinhamento da mídia: esquerda, centro ou direita.
- Largura: metade, três quartos ou total.

Inserir uma mídia não elimina o texto que estava selecionado. Imagens e mídias existentes podem ser selecionadas no texto e reeditadas, inclusive movidas para outra posição. A apresentação pública respeita alinhamento e largura. O texto usa alinhamento horizontal e espaçamento entre linhas; não se gira a direção das letras.

## Vídeos por link ou arquivo

Links de YouTube/Vimeo usam os players já existentes; Instagram abre a publicação original. Links HTTPS diretos com extensão MP4/WebM usam o player nativo com controles e sem reprodução automática. Arquivos MP4/WebM de até 50 MB podem ser escolhidos no dispositivo. Nos posts, a prévia fica local e o upload só ocorre ao salvar; tentativas repetidas reaproveitam uploads já concluídos. Referências blob locais não são gravadas no banco.

O bucket de vídeos é separado das imagens e da galeria privada. JPEG/PNG continuam sendo os únicos formatos dos campos de foto. O envio/remoção de vídeos de posts é autorizado no servidor apenas ao superadmin. Arquivos usados nas publicações têm URL pública.

**Aplicar `supabase/migrations/0042_post_video_uploads.sql` no banco antes de utilizar uploads de vídeo em produção.** Cria o bucket `post-videos`, limite de 50 MB e políticas de acesso. Esta migration não foi aplicada remotamente pelo agente; não houve commit ou deploy nesta etapa. Links de provedores não dependem do novo bucket.

## Validação

Testes de editor cobrem tamanho, cor, alinhamento, entrelinhas e imagem posicionada ao reabrir; testes de posição cobrem cursor/parágrafos/início/fim; testes de rascunho cobrem upload adiado e retry sem duplicação. O teste SQL local aplica a sequência de migrations e verifica que contas comuns não enviam, listam ou excluem vídeos de posts.

Playwright com componentes reais verificou inserção no fim, mudança para o início, alinhamento/largura, manutenção da barra ao rolar e ausência de rolagem horizontal em 390 px. O salvamento foi simulado com callbacks locais: zero uploads antes de salvar e substituição dos blobs pelos endereços finais após salvar. Nenhum arquivo foi enviado ao armazenamento remoto durante essa validação.

## Evitar redundância

Uma única barra reúne as ações. A imagem do texto abre um único modal com origem, descrição, posição e dimensões, sem um segundo modal intermediário para escolher o arquivo. O botão de editar mídia só aparece quando uma mídia está selecionada. Controles de formatação textual ficam desabilitados ao selecionar uma imagem ou mídia. Link e arquivo são duas origens da mesma ação de vídeo; não há dois fluxos de upload concorrentes. O posicionamento e a normalização de largura/alinhamento são compartilhados entre inserção e renderização pública.
