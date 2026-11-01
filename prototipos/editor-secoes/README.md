# Prévia do editor de seções

Estudo solicitado antes da implementação. A integração posterior no aplicativo está documentada em `docs/EDITOR_SECOES_CORES.md`; este diretório conserva a prévia original, sem ser uma reprodução exata do editor final.

Execute `npm run prototype` na raiz e abra http://localhost:4174/editor-secoes/ . O servidor de prévias é independente do aplicativo. Os controles modificam exclusivamente a página ilustrativa em um iframe de mesma origem. Não há persistência, autenticação nem publicação. A ação de explorar oportunidades é ilustrativa.

Figma: https://www.figma.com/design/nmDafiPbuVEDfcasCzxWrN?node-id=3-4 . Camadas nativas editáveis: desktop `3:4`, móvel `3:72`, comparação com contêiner `3:83`; componente de seleção `3:2`. A captura de referência está em `2:2`. O limite de chamadas do plano Starter impediu refinamento final e remoção dessa referência; o arquivo contém as duas representações. O Figma ilustra a proposta; o protótipo local é a referência funcional, com controles de verdade e medidas verificadas. O script de captura fica restrito ao protótipo, conforme orientação da ferramenta Figma.

## Comportamento proposto

- Largura da seção: contêiner da página ou toda a tela do dispositivo.
- Largura do conteúdo independente: leitura até 720 px, ampla até 1.152 px ou toda a seção, com margens internas de segurança.
- Altura mínima: automática, uma tela inteira ou pixels. Tela inteira usa `min-height: 100dvh`, não `height: 100%`: acompanha a área visível e deixa conteúdo longo aumentar a seção. A página continua rolável.
- Espaçamento vertical compacto, confortável ou amplo.
- Cores independentes para fundo da seção, texto, links, fundo e texto dos botões; combinações iniciais azul, clara e azul profundo. Razão de contraste calculada para texto/fundo, link/fundo e texto/fundo do botão; abaixo de 4,5:1 a prévia orienta ajustar. Não há bloqueio de publicação nesta demonstração.
- Alternância desktop/móvel; em telas estreitas a prévia se ajusta ao espaço disponível, com dimensões reais exibidas acima. Uma prévia de 358 px dentro de um celular de 390 px não representa incorretamente um viewport fixo de 390 px.

## Achados no código atual e implementação posterior

`SectionEditor.tsx` já oferece `span: screen|page`, largura de conteúdo e cores por tokens. `PageRenderer.tsx` limita `screen` na altura a `min(44rem,85svh)`, que não representa tela inteira. O estilo atual não contempla as cinco cores livres independentes da proposta.

Na implementação, a seção de largura total deve participar do layout externo da página, fora do contêiner central; somente o conteúdo interno recebe `max-width`. Não usar indiscriminadamente `width:100vw` dentro de um contêiner: a barra de rolagem e os ancestrais podem produzir deslocamento e overflow. Preservar blocos existentes, estilos de carrosséis e defaults ao normalizar layouts antigos. O protótipo ilustra essa arquitetura, mas ainda não modifica o renderer nem a persistência. Rever tratamento de imagens de fundo e overlays antes de aplicar cores livres, pois o contraste calculado contra uma cor sólida não comprova legibilidade sobre uma foto.

Não há migration nesta entrega de prévias. Na implementação, verificar o schema/normalizador do JSON de layout e a compatibilidade dos registros antigos antes de decidir sobre migration.

## Verificação

Playwright CLI em Chromium, 2026-10-31 (horário local):

- Desktop externo 1440 px: seção de 864 px = largura interna da prévia; tela inteira com 660 px = altura interna da prévia.
- Editor a 390 px: iframe de 358 px, sem overflow horizontal no editor ou na página.
- Editor a 320 px: sem overflow horizontal no editor ou na página.
- Seção no contêiner: 310 px dentro de viewport de 358 px, preservando 24 px de margem por lado.
- Cor do texto igual à do fundo: aviso correto de contraste 1,0:1; restaurar proposta recupera 6,0:1 no texto/links e 11,6:1 no botão.
- Capturas: `output/playwright/editor-secoes-desktop.png`, `editor-secoes-mobile.png`, `editor-secoes-mobile-preview.png` e `editor-secoes-figma.png` (ignoradas pelo Git).

Revisão visual feita inline, sem revisão independente por outro agente. Capturas desktop/móvel conferidas; controles e texto ilustrativo identificados. Ajustado o espaçamento interno das linhas de cor após o detector apontar proximidade à borda. A nova captura desktop inclui as opções de cor. Detector estático não comprova todos os critérios de acessibilidade: após a correção restaram avisos da família Montserrat, preservada por ser a identidade oficial, e aconselhamentos de escala local de medidas/cores/raios. Estes valores de estudo não foram canonizados em DESIGN.md ou no sidecar. Nenhum redesenho global foi realizado. Figma tem diferenças de composição em relação à prévia funcional, ainda pendentes de refinamento pelo limite do plano.
