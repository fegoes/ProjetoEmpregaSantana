> A integração posterior no aplicativo está descrita em `docs/EDITOR_POSTS_SECOES_FORMATACAO.md`. Este diretório conserva o estudo original; a proposta de migration abaixo foi substituída pela persistência HTML estruturada no campo existente.

# Estudo anterior à integração: post → seções → blocos

Substitui a prévia anterior de blocos isolados, rejeitada pelo usuário. Agora o post contém uma ou várias seções, cada uma com configuração visual própria; cada seção contém vários blocos ordenados. Nenhum arquivo do aplicativo React, banco ou post publicado foi alterado. Esta entrega continua sendo uma prévia para experimentar a estrutura antes da integração.

Abra http://127.0.0.1:4174/editor-posts/ e recarregue a aba se ela já estava aberta. Servidor estático na raiz do projeto:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipos
```

## O que funciona na demonstração

- Criar seção vazia, texto+tópicos ou seção independente de galeria, slides, vídeo ou anúncio. A nova seção entra após a atual; pode subir/descer, duplicar, excluir ou ordenar por arraste. Pelo menos uma seção é mantida, podendo ficar vazia.
- Configurar cada seção: nome interno; largura de leitura, ampla ou da tela; largura do conteúdo independente; altura automática, uma tela ou pixels; espaçamento, alinhamento e cinco cores (fundo, texto, links, fundo/texto dos botões). O conteúdo pode aumentar a altura mínima.
- Dentro de uma seção, inserir textos, tópicos, imagem única, galeria, slides, vídeo/publicação externa ou anúncio entre os blocos já existentes. Mover um bloco para outra seção, duplicar, excluir ou subir/descer. Uma mídia entre seções é representada por uma seção só de mídia; não há um segundo modelo de posicionamento concorrente.
- Texto rico com negrito, itálico, lista e hiperlink em palavra/frase selecionada. Selecione o trecho, informe o destino e aplique o link, escolhendo abrir em outra aba. Remoção do link também disponível. Apenas http(s) e caminhos internos; HTML editado passa por uma lista limitada de elementos/atributos no protótipo. Na implementação real deve continuar usando Tiptap e DOMPurify, não substituir pelo editor simplificado deste estudo.
- Imagem única/galeria/slides: arquivo local JPG/PNG de até 5 MB ou endereço; versões desktop e móvel em campos separados, descrição e legenda. Sem persistência ou envio: arquivo local usa URL blob temporária. Sem versão móvel, usa desktop. Imagens contidas, sem esticar; clique amplia em diálogo e permite navegar. Slides têm navegação manual, sem autoplay. As duas ilustrações iniciais são assets editoriais existentes, copiados de `public/illustrations`, sem representar pessoas ou anunciantes reais.
- Vídeo: URL do YouTube ou Vimeo vira cartão com opção de carregar o player; Instagram vira cartão com link para a publicação externa. Nada carrega iframe de plataforma automaticamente. Validação de domínio/formato e rejeição de esquemas como javascript. Reprodução real depende do vídeo e de sua permissão de incorporação e não foi comprovada por este QA. URL do Vimeo não listada/restrita pode exigir parâmetros e tratamento adicional na implementação. Não há integração oEmbed Meta ou credenciais de Instagram nesta prévia.
- Anúncio: título, mensagem, imagem opcional, destino e botão; identificado como Publicidade e exemplo. Sem rede publicitária, campanha real ou rastreamento. Implementação posterior deve permitir escolher campanha aprovada do sistema ou conteúdo manual autorizado, conservando a identificação de anúncio.
- Prévia desktop/móvel com viewport próprio, seleção por clique e acompanhamento da seção/bloco selecionado. No celular há atalhos Ver prévia/Voltar à estrutura. Ocultar seleção mostra o conteúdo sem o contorno do editor.

Recarregar ou restaurar perde as edições locais. Autor e texto são ilustrativos. Não há botão de publicação, nem simulação de salvamento no banco.

## Arquitetura para a integração posterior

Reaproveitar o modelo de seções e normalização das páginas, acrescentando blocos tipados de lista, vídeo, anúncio, galeria e slides de mídia. Persistir dados estruturados em JSON, em vez de aceitar scripts/iframes/CSS arbitrários dentro de `content_html`. A proposta de integração é adicionar um campo JSON de layout aos artigos, preservando o HTML antigo como fallback; isso exigirá uma migration específica a preparar na implementação, não executada nesta entrega. Migração/conversão de HTML deve ser explícita e manter títulos, links, imagens e texto existentes.

O renderer editorial deve continuar sendo um `article`, com um título principal e seções internas hierarquizadas, suportando fundo de ponta a ponta fora do contêiner central e conteúdo interno com medida de leitura independente. Capa, autor, categorias, slug, agenda, SEO e compartilhamento continuam no domínio de publicação existente. Cards de vídeo precisam de fallback Abrir original quando a incorporação falha. Galeria real deve listar apenas a mídia autorizada do próprio usuário, com as regras existentes de armazenamento, sem misturar imagens privadas de outras contas.

Referências primárias consultadas para o planejamento de players: [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) e [Vimeo — incorporação](https://help.vimeo.com/hc/en-us/articles/12426259908881-How-to-embed-my-video). A consulta à documentação Meta retornou HTTP 429; não foram assumidas permissões ou exigências de token sem verificação.

## Verificação e limites

Playwright/Chromium: três seções iniciais; hiperlink aplicado em trecho selecionado e refletido no artigo; galeria abre diálogo; arquivo JPG local refletido como blob; seção só de slides criada e avançada a 2/2; bloco de slides movido para a seção inicial (que passou a três blocos); link de YouTube gerou controle Carregar vídeo; URL javascript não gerou iframe; editor e artigo sem overflow horizontal a 390 e 320 px. Sintaxe dos dois scripts verificada com Node. Operações locais, sem autenticação ou escrita no backend.

Impeccable: identidade Montserrat/Poppins e cores existentes preservadas; revisão visual inline, não independente. Detector estático apontou a família Montserrat, mantida por identidade, e hierarquia estreita de títulos da interface, corrigida aumentando o h1. Não comprova acessibilidade completa, reprodução nos provedores ou compatibilidade em dispositivos físicos. Capturas: `output/playwright/post-sections-desktop.png`, `post-sections-media.png`, `post-sections-gallery.png` e `post-sections-mobile.png` (ignoradas pelo Git). DESIGN.md e tokens globais não foram alterados. CSS local da demonstração não foi canonizado como sistema global.

Figma permanece com a limitação de chamadas do plano Starter já identificada nesta rodada. O rascunho `Hy5gARcwMLcbxw1SqeGlVP` não contém telas completas e não deve ser apresentado como entrega pronta. A prévia navegável é o artefato disponível para revisão.
