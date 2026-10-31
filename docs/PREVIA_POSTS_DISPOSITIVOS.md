# Prévia dos posts por dispositivo

O editor do blog tem botões Desktop e Celular na prévia lateral e na visualização em página inteira. A seleção é preservada ao abrir/fechar a página inteira; trocar a tela não salva, publica nem modifica o conteúdo do post.

- Desktop: viewport CSS de 1024 × 720 px.
- Celular: viewport CSS de 390 × 844 px.
- A área é reduzida proporcionalmente quando não cabe no painel, mantendo o viewport interno. O conteúdo longo pode ser rolado dentro da prévia.
- O mesmo corpo de artigo é renderizado em um iframe com os estilos e a aparência do site. Isso permite que media queries e fontes de imagens respondam à largura escolhida, independentemente do tamanho real do monitor do editor.
- Artigo, prévia social e prévia de busca oferecem o seletor de dispositivo. Redes sociais e buscadores podem apresentar o conteúdo de outra forma; são prévias editoriais.
- A prévia não permite navegar pelos links internos do texto. O iframe não executa scripts próprios. O conteúdo mantém a sanitização existente.
- As imagens móveis dependem das variantes cadastradas e da migration 0040, já documentada. Sem variante, permanece a imagem desktop. O seletor de tela não requer nova migration.

Validação: 221 testes, incluindo troca de largura sem recarregar o iframe/perder conteúdo. Navegador com dados sintéticos confirmou viewport 1024/390, seleção de duas capas diferentes e preservação do título ao entrar/sair da página inteira. Não foi publicado um post real para esse teste.
