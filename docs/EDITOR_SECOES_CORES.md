# Editor integrado de páginas, seções e cores

Em **Superadmin → Páginas do site → editar**, a primeira seção já abre para edição. Cada seção reúne configuração, cores e conteúdo, sem alternar entre abas de conteúdo e aparência.

- **Configuração, dimensões e cores**: recolhível; combinações Azul, Claro e Profundo e seletores independentes para fundo, texto, links, fundo e texto dos botões. Cada cor pode voltar a Automática. Escolher uma cor de fundo do tema remove apenas a substituição personalizada do fundo.
- **Nome, tipo e dimensões**: nome interno até 80 caracteres; seção, cabeçalho, artigo ou encerramento da página; largura do fundo e do conteúdo independentes; alinhamento e espaçamento.
- **Imagem de fundo e cobertura**: controles existentes de envio local/link e versões desktop/móvel, foco, cor/opacidade de cobertura. Fotografias não são esticadas.
- **Conteúdo e itens da seção**: títulos, texto rico, imagens, botões/destinos, texto com mídia, listas de ícones, busca e catálogo. Criar, editar, duplicar, remover e ordenar por arraste ou botões continua disponível.

Os novos modelos **Cabeçalho da página**, **Artigo** e **Encerramento da página** já incluem blocos editáveis. O tipo controla a marcação semântica da seção (`header`, `article`, `footer`, `section`); não altera o menu/cabeçalho global, o rodapé global nem os posts do blog. Esses domínios conservam seus próprios editores.

## Prévia e tamanhos

A edição mostra uma prévia ao lado no desktop e abaixo em telas menores, com alternância Computador/Celular. A aba Visualizar amplia a área. No celular, os links Ver prévia/Voltar à edição evitam percorrer todo o formulário. A prévia usa iframe com portal React: o mesmo renderer, tema e rascunho; media queries e `100dvh` se referem ao viewport do iframe. O indicador mostra a largura/altura interna real. Links da prévia não navegam e botões não executam ações públicas.

Largura **toda da tela** desenha a seção no layout público externo; somente o conteúdo interno recebe `max-width`. **Toda a seção** remove esse limite do contêiner interno, conservando margens de segurança e medidas de leitura dos blocos de texto. Não se injeta `100vw` dentro de um contêiner.

Altura **Uma tela inteira · 100%** usa `min-height:100dvh`, permitindo conteúdo maior. Altura personalizada: 120–2.000 px. Os modelos antigos que usam `screen` mantêm `min(44rem,85svh)` para não mudar páginas existentes; a opção nova usa `viewport`. Seções de carrossel recebem os mesmos controles de cores e conteúdo; a largura é controlada pelo carrossel.

## Persistência e segurança

Os dados usam o JSON existente `paginas_institucionais.layout`; **esta mudança não exige migration**. Novos campos opcionais de estilo passam pela normalização: cores só em hexadecimal de seis dígitos ou vazias, tipos em lista permitida e dimensões limitadas. JSON antigo recebe padrões sem trocar seu conteúdo, cores de tema ou altura anterior. CSS arbitrário não é aceito nesses campos. Permissões e fluxo de salvamento continuam os do editor superadmin existente.

Texto e links são herdados na seção; botões de conteúdo e busca usam as escolhas do fundo/texto do botão. Conteúdo rico pode manter formatações locais de seu HTML. Cards de vagas e profissionais preservam seu próprio desenho. Alertas de contraste para pares explicitamente configurados aparecem na seção e na lista de revisão antes de publicar; não impedem salvar. Sobre fotos, é necessário conferir a cobertura e a prévia: o cálculo de duas cores sólidas não comprova a legibilidade sobre uma imagem.

## Verificação da entrega

- 236 testes Vitest passaram, incluindo quatro casos novos: normalização de CSS/tags/dimensões, compatibilidade de alturas antigas, alertas de contraste/fotos e modelos semânticos editáveis.
- Build de produção passou; lint sem erros, com cinco avisos preexistentes de Fast Refresh.
- Playwright com Auth/REST simulados: trocar para Profundo atualizou o fundo para `rgb(13,58,102)`, texto branco e botão branco; editar título atualizou a prévia; salvar/reabrir preservou título, cores e tipo `ARTICLE`. Não houve escrita no banco real durante o QA.
- Prévia móvel: largura da seção igual ao viewport (388 px) e altura mínima igual à altura interna (638 px). Editor em 390 px sem overflow horizontal.
- Capturas locais ignoradas pelo Git: `output/playwright/editor-integrado-desktop.png` e `editor-integrado-mobile.png`.
- Detector estático nos três componentes principais não apontou achados; ele não analisa todos os estados e não comprova acessibilidade completa. Revisão visual inline, sem avaliação independente por outro agente. Identidade existente preservada, sem alteração de tokens globais. O estudo em `prototipos/editor-secoes/` e o arquivo Figma permanecem como referência anterior à integração, não como reprodução exata do editor entregue.
