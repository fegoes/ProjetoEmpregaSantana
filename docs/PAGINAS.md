# Montando páginas do site

Guia para o superadmin. Fica em **Painel → Páginas do site**.

## O que dá para fazer

- Personalizar o **Início**, o **Sobre**, os **Termos** e a **Privacidade**.
- Criar **páginas novas** (ex.: Fale conosco, Como funciona), que ficam em `/pagina/<endereço>`.
- Deixar o link de uma página nova no **menu do topo** e/ou no **rodapé**.

## Conceitos

Uma página é uma pilha de **seções**. Cada seção tem **blocos** dentro.

### Seção

Na aba **Aparência** de cada seção:

| Opção | O que muda |
| --- | --- |
| Largura da seção | **Largura toda da tela**: o fundo vai de uma borda à outra. **Largura do site**: o fundo acompanha as margens do conteúdo. |
| Largura do conteúdo | Estreita (boa para ler), média ou larga (alinhada ao menu do topo). |
| Espaço acima e abaixo | Nenhum, pequeno, médio, grande ou enorme. |
| Altura mínima | Pelo conteúdo, média, alta ou quase a tela toda. |
| Alinhamento | À esquerda ou centralizado. |
| Cor de fundo | Sem cor, branco, cinza claro, azul ou azul profundo. |
| Imagem de fundo | Foto com **cobertura de cor** (azul profundo, preto, azul ou branco) de 0 a 90%. Use pelo menos 35% para o texto ficar legível. |

### Slides

Os modelos **Slide com texto no centro**, **Slide com texto e imagem** e **Slide com texto e ícones** criam uma seção de largura toda, com imagem de fundo. O modelo **Carrossel de slides** junta vários slides que se alternam, com setas e pontos. A troca automática é opcional e para quando a pessoa passa o mouse ou usa o teclado.

### Blocos

- **Título**: título grande com uma frase de apoio.
- **Texto**: parágrafos com negrito, itálico, subtítulo e lista.
- **Imagem**: tamanho pequeno, médio, grande ou largura toda; escreva a descrição da imagem.
- **Botões**: até 4, nas cores laranja (destaque), azul ou só contorno.
- **Texto com imagem ou ícone**: texto de um lado, imagem ou ícone do outro (esquerda ou direita, tamanho pequeno, médio ou grande), com botões opcionais.
- **Lista de ícones**: 2, 3 ou 4 itens por linha, cada um com ícone ou imagem, título e texto.
- **Campo de busca**: leva quem busca à página Explorar.
- **Vagas e profissionais**: a lista do site, com abas e filtros.

### Para onde um botão leva

- **Uma página do site**: Início, Explorar, Planos, Entrar, Criar conta, Sobre, Termos, Privacidade e as páginas que você criou.
- **Endereço da internet**: `https://…` (pode abrir em outra aba) ou um caminho do site, como `/explorar`.
- **WhatsApp**: número com DDD e, se quiser, a mensagem já escrita.
- **Telefone**: abre a ligação no celular.

Botão sem texto ou sem destino válido **não aparece** no site; o editor avisa antes de publicar.

## Fluxo de trabalho

1. **Nova página** → dê o nome (o endereço é sugerido) → **Criar e editar**.
2. Em **Editar**, adicione seções por modelo e preencha os blocos. Use **Subir** e **Descer** para mudar a ordem, **Duplicar** para copiar.
3. Em **Visualizar**, confira no tamanho de computador e de celular, mesmo sem salvar.
4. Em **Configurações**, escolha **Publicada** (ou deixe como **Rascunho**, que só o superadmin vê), onde o link aparece e o resumo para o Google.
5. **Salvar**.

A página **Início** começa com o desenho padrão do site. Clique em **Personalizar a página inicial** para partir de uma cópia dele; **Voltar ao desenho padrão do site** desfaz a personalização. **Sobre**, **Termos** e **Privacidade** passam do texto simples para seções com **Montar com seções**, sem perder o texto atual.

## Imagens

JPG ou PNG, até 5 MB, de preferência com 1600 px de largura ou mais. Ficam guardadas no armazenamento público do projeto, na pasta `paginas/`. Só o superadmin envia imagens para ela.

## Atualização do banco

Esta função precisa da migration `0023_page_builder.sql`. Aplique com `supabase db push`. Enquanto ela não for aplicada, o site continua mostrando as páginas de sempre, mas salvar no painel mostra um aviso de que falta atualizar o banco.
