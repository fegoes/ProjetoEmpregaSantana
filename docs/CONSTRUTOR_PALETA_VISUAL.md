# Paleta visual do construtor de páginas

Os modelos de seção e os elementos agora aparecem como botões compactos com ícone, nome e descrição por hover ou foco. O modelo Texto com imagem informa sua composição em duas colunas, empilhadas no celular.

Clique para acrescentar e abrir a edição, ou arraste o botão para os espaços de inserção entre seções ou entre blocos. O espaço final também aceita inserção. As áreas distinguem modelos de seção de elementos, ignoram arquivos externos e respeitam os limites existentes. A ordenação dos itens já criados continua pelas alças e pelos botões Subir/Descer. No celular ou teclado, use o clique e os controles de ordenação.

Uma seção agrupa seus elementos; Texto com imagem e Lista de ícones mantêm as composições já disponíveis. Esta implementação usa o fluxo ordenado de seções e blocos, sem posicionamento absoluto livre sobre a página. Imagens abrem a edição existente com arquivo local ou link, versões desktop/móvel e orientações de formato. A prévia acompanha as alterações pelo fluxo existente.

Sem migration. Implementação local, sem publicação remota. Verificações: testes de inserção por clique, posição por arraste e rejeição de payload externo; navegação Playwright com componentes reais em desktop e em 390 px, incluindo arraste de seção e abertura dos campos de imagem sem upload ou escrita no banco.
