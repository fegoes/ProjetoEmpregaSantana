# Imagens e fotos

Os campos de upload de logo, galerias, imagens de páginas e imagens editoriais exibem recomendações de dimensão, formatos e limite de arquivo. São recomendações para o layout atual, não limites obrigatórios de resolução.

| Uso | Dimensão recomendada | Exibição |
| --- | --- | --- |
| Logo | 512 × 512 px | Marca inteira, contida na área quadrada |
| Galeria de empresa, vaga ou portfólio | 1600 × 900 px | Preenche cards/carrosséis; pode haver recorte |
| Fundo de seção/banner | 1920 × 1080 px | Preenche a seção; recorte depende da tela e foco escolhido |
| Capa do artigo | 1536 × 1024 px | Imagem inteira na área 3:2 do blog |
| Compartilhamento | 1200 × 630 px | Prévia nessa proporção; serviços externos podem recortar |
| Conteúdo e blocos | 1600 px de largura; verticais com 1200 px de altura | Proporção preservada no conteúdo; blocos pequenos podem recortar |

Uma imagem com boa resolução atende celular e desktop: o layout reduz sua exibição conforme o espaço. Não são exigidos dois arquivos nem adicionadas novas colunas ao banco. Horizontais, verticais e quadradas são aceitas, sem impor resolução mínima ou cortar o arquivo original. Em áreas com recorte, manter rostos e informações essenciais no centro. O editor de páginas já permite escolher o foco de fundos.

Formatos de upload: JPG, PNG, WebP e AVIF, até 5 MB por arquivo, com validação compartilhada. HEIC/HEIF deve ser convertido antes do envio. Imagens existentes não são alteradas. URL externa não passa pelo upload; precisa apontar para imagem HTTPS acessível publicamente.

A ajuda expansível explica o comportamento em celular e desktop e permite ver o original sem recorte, suas dimensões e um aviso de possível perda de nitidez quando a largura é menor que 600 px. Essa prévia não simula exatamente cada card ou dispositivo. As prévias de página/post continuam disponíveis para conferir a composição final.

Nenhuma migration necessária para esta alteração. Validação: build, lint, suíte existente de 213 testes e inspeção do editor em 390 e 1440 px, sem overflow horizontal na captura móvel. Capturas locais em `output/playwright/orientacao-imagens-*.png` usam sessão e API sintéticas, sem gravar conteúdo real.
