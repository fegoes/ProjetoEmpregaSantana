# Posts: composição livre e formatação por seleção

Em **Superadmin → Posts do blog → Novo artigo**, o conteúdo começa vazio. O usuário adiciona uma seção e escolhe quais blocos quer inserir. Não há texto ou composição obrigatória.

Cada seção tem nome interno, cores de fundo/texto/links, largura externa, largura interna, altura mínima automática ou de uma tela e espaço vertical. Pode ser duplicada, excluída e movida para cima/baixo. Dentro dela podem ser criados, editados, duplicados, removidos e ordenados blocos de texto, título, lista, citação, imagem, separador, galeria, slides, vídeo e anúncio. Blocos dispõem de alça para arraste e ordenação por teclado/botões. As galerias e slides aceitam até 12 imagens.

**Texto, título, lista, citação e conteúdo do anúncio** usam o formatador compartilhado. Ao selecionar palavras/frases, aparece uma barra flutuante com negrito, itálico, sublinhado, riscado, cor e hiperlink. A barra fixa mantém as mesmas funções acessíveis, além de subtítulo, listas com/sem numeração e limpar marcações. O destino do hiperlink aceita http(s) e caminhos seguros do site, com escolha de abrir em outra aba e opção de remover o link. Imagens também podem ser inseridas na posição do cursor. Nomes internos, slug, autor, SEO e descrições alternativas são dados/metadados em texto simples, não corpos de conteúdo HTML.

O componente compartilhado `RichTextEditor` leva essas funções aos demais campos de conteúdo rico já usados por páginas, empresas, vagas, autônomos e currículo. A barra flutuante usa portal React e eventos do editor; não move nós DOM controlados pelo React. Isso evita a falha de desmontagem encontrada durante o teste com BubbleMenu/Tippy v2 e React 19. A solução mantém os controles fixos disponíveis para uso por teclado.

## Conteúdo legado e persistência

Posts antigos abrem no modo anterior de blocos, preservando seu HTML. **Organizar este post em seções** converte o conteúdo existente para a primeira seção e registra a conversão no rascunho imediatamente, sem exigir outra edição para que ela seja salva.

**Não exige migration nesta entrega.** Diferentemente da proposta inicial de adicionar uma coluna JSON, a implementação grava uma estrutura HTML explícita no `content_html` existente: contêineres `data-post-section` com metadados limitados e corpos `data-section-body`, contendo os blocos `data-post-block`. O HTML continua tendo texto, links e imagens de verdade; não é um JSON oculto em atributo ou script. Cores, enumerações e espaçamentos são normalizados na leitura pública. IDs de edição não precisam ser persistidos. HTML comum continua sendo aceito como legado, sem conversão automática destrutiva.

O renderer público mantém DOMPurify para HTML de texto; blocos especiais usam componentes React com URLs e provedores validados. HTML ativo/iframes arbitrários não são aceitos como players. A rota do artigo saiu do contêiner central externo para permitir seções de ponta a ponta, enquanto cabeçalho editorial e conteúdo legado conservam uma medida de leitura central.

## Imagens, vídeos e publicidade

- Imagem, galeria e slides reaproveitam o envio editorial local/link e variantes desktop/móvel, com descrições. Galeria abre ampliação; slides têm navegação manual. Regras de acesso ao armazenamento e galeria privada permanecem as existentes. Nenhum upload real foi feito durante o QA desta entrega.
- YouTube e Vimeo: validação de URL, cartão com carregamento sob demanda, iframe com origem construída a partir do identificador permitido e link para o original. Instagram: link para a publicação original; não foi criada integração oEmbed Meta. A disponibilidade real depende das permissões do vídeo. A prévia administrativa tem sandbox; a reprodução externa dentro dela pode ser limitada, permanecendo o link do original na leitura pública.
- Anúncio: conteúdo rico com texto, imagem e hiperlinks; identificado como **Publicidade**. Não há nova integração com rede de anúncios, campanha automática ou rastreamento.
- Publicação: bloqueia vídeos inválidos e galerias/slides sem imagens, além das validações existentes de categoria e descrição das imagens. Rascunhos podem permanecer incompletos.

## Verificação

245 testes passaram: compatibilidade e ordenação de HTML legado, criação de seção vazia sem bloco imposto, conversão persistida, normalização de estilos, preservação de marcações, rejeição de HTML ativo, validação de provedores e carregamento de player somente após clique. Build de produção e lint verificados; cinco avisos preexistentes de Fast Refresh permanecem.

Playwright com Auth/REST simulados: criação livre; seleção de texto e aplicação de negrito/itálico/sublinhado/cor/link; requisição de salvamento com seções e formatação; fechamento do editor e reabertura do registro. Teste de banco conectado e reprodução real nos provedores não fazem parte dessa evidência. Capturas em `output/playwright/wp-post-editor-desktop.png`, `wp-post-formatacao.png` e `wp-post-editor-mobile.png`, ignoradas pelo Git.

Referência funcional, sem incorporar o WordPress ao projeto: [trabalhar com blocos](https://wordpress.org/documentation/article/work-with-blocks/) e [inserir novos blocos](https://wordpress.org/documentation/article/adding-a-new-block/). Mantidos a identidade e os componentes existentes, sem novos tokens globais. Revisão visual inline, não independente. O estudo em `prototipos/editor-posts/` permanece como registro de exploração e não representa exatamente a interface integrada.
