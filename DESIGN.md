---
name: EmpregaSantana
description: Identidade oficial aplicada ao marketplace regional de trabalho.
colors:
  primary: "oklch(0.504 0.148 255.8)"
  primary-foreground: "oklch(1 0 0)"
  brand-ink: "oklch(0.344 0.090 252)"
  brand-blue-strong: "oklch(0.447 0.133 256)"
  brand-orange: "oklch(0.747 0.180 57.4)"
  brand-orange-strong: "oklch(0.720 0.180 55)"
  brand-orange-ink: "oklch(0.530 0.143 52.5)"
  brand-orange-foreground: "oklch(0.321 0 0)"
  background: "oklch(0.98 0 0)"
  foreground: "oklch(0.321 0 0)"
  card: "oklch(1 0 0)"
  secondary: "oklch(0.961 0 0)"
  muted-foreground: "oklch(0.50 0 0)"
  accent: "oklch(0.94 0.012 255.8)"
  accent-foreground: "oklch(0.344 0.09 252)"
  border: "oklch(0.90 0 0)"
  ring: "oklch(0.504 0.148 255.8 / 40%)"
  destructive: "oklch(0.577 0.245 27.325)"
  success: "oklch(0.58 0.13 155)"
  sidebar-text: "oklch(93.2% 0.032 255.585)"
  sidebar-selected: "rgb(255 255 255 / 0.15)"
  sidebar-hover: "rgb(255 255 255 / 0.10)"
typography:
  display:
    fontFamily: 'Montserrat, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Montserrat, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, sans-serif'
    fontSize: '15px'
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.428571
  label:
    fontFamily: 'Poppins, ui-sans-serif, system-ui, -apple-system, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: 1.428571
rounded:
  sm: 'calc(0.85rem - 6px)'
  md: 'calc(0.85rem - 3px)'
  lg: '0.85rem'
  xl: 'calc(0.85rem + 6px)'
  2xl: '1rem'
  full: '9999px'
spacing:
  1: '0.25rem'
  2: '0.5rem'
  3: '0.75rem'
  4: '1rem'
  5: '1.25rem'
  6: '1.5rem'
  8: '2rem'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    padding: '0.5rem 1.25rem'
    height: '2.5rem'
  button-cta:
    backgroundColor: '{colors.brand-orange}'
    textColor: '{colors.brand-orange-foreground}'
    rounded: '{rounded.full}'
    padding: '0.5rem 1.25rem'
    height: '2.5rem'
  button-cta-hover:
    backgroundColor: '{colors.brand-orange-strong}'
  button-outline:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.full}'
    height: '2.5rem'
  input:
    textColor: '{colors.foreground}'
    rounded: '{rounded.md}'
    padding: '0.25rem 0.75rem'
    height: '2.25rem'
  card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.xl}'
    padding: '1.5rem'
  badge-secondary:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.md}'
    padding: '0.125rem 0.5rem'
  panel-navigation-active:
    backgroundColor: '{colors.sidebar-selected}'
    textColor: '{colors.primary-foreground}'
    rounded: '{rounded.md}'
    padding: '0.625rem 0.75rem'
  navigation-active:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.primary}'
    rounded: '{rounded.full}'
    padding: '0.375rem 0.875rem'
---

# Design System: EmpregaSantana

## Overview

**Creative North Star: "Conexão de empregabilidade no sertão"**

A identidade é direta, acolhedora e regional: pessoas e oportunidades de trabalho em Santana do Ipanema e no sertão. A interface combina conteúdo e controles claros, navegação lateral em azul profundo e laranja reservado à ação, com Montserrat nos títulos e Poppins na leitura e operação. A lateral escura é uma extensão autorizada pelo responsável, não um modo escuro geral.

Este documento registra o sistema existente. A autoridade de marca continua em [IDENTIDADE_VISUAL.md](docs/IDENTIDADE_VISUAL.md); os tokens executáveis vivem em [src/index.css](src/index.css). Os componentes React em `src/components/ui/` e a navegação em `src/components/layout/` sustentam os padrões descritos. Em conflito, o manual prevalece sobre uma divergência do código. Não há substituição de identidade nem migração automática do aplicativo.

**Key Characteristics:**

- Conteúdo e controles em modo claro, inclusive com preferência escura do dispositivo. Por escolha posterior do responsável, a navegação lateral usa azul profundo.
- Neutros puros, azul institucional e laranja de ação.
- Hierarquia geométrica com leitura funcional e linguagem concreta.
- Descoberta pública e menus identificáveis em telas pequenas.

## Colors

### Primary

O azul institucional (`primary`) orienta navegação, links, verificação, foco e estados ativos. O azul profundo (`brand-ink`) identifica a marca e dá peso institucional. `brand-blue-strong` é a derivação para hover prevista no manual; o botão React padrão atualmente usa o azul primário com opacidade de 90%.

### Secondary

O laranja de ação (`brand-orange`) é reservado ao CTA prioritário e destaques. `brand-orange-strong` é seu fundo de hover; `brand-orange-ink` é exclusivamente o laranja de texto. São funções distintas, nunca tons intercambiáveis. Sucesso e erro usam os tokens semânticos existentes, sem virar novas cores de marca.

### Neutral

A página usa `background`, cards e popovers usam `card`, e áreas de apoio usam `secondary`. `foreground` conduz a leitura; `muted-foreground` indica informação secundária; `border` delimita controles e superfícies. `accent` é azul lavado para hover e seleção da navegação pública. Nas laterais, `brand-ink` recebe texto branco e `sidebar-text` (o azul claro do Tailwind instalado); seleção usa `sidebar-selected`, hover usa `sidebar-hover` e foco usa branco. Esses valores de interface não acrescentam uma nova cor de marca.

**The Laranja de Ação Rule.** Na interface, um único CTA laranja por tela; seu texto usa `brand-orange-foreground`, inclusive no hover. A proporção de referência do manual é 60% neutros, 30% azul e 10% laranja.

## Typography

**Display Font:** Montserrat, com fallback sans-serif.  
**Body Font:** Poppins, com fallback sans-serif.

A dupla é geométrica, com títulos fortes e texto operacional aberto. O frontmatter registra a escala recorrente; a home e outros contextos podem aumentar o título sem alterar a família.

- **Display:** título principal em Montserrat 800; a escala oficial cresce de `text-3xl` para `text-4xl` a partir de `sm`.
- **Headline:** títulos de seção em Montserrat 700.
- **Title:** títulos de cards de oportunidades em Poppins 600, com entrelinha curta.
- **Body:** Poppins 400 em tamanhos pequeno e base; textos secundários usam a mesma família.
- **Label:** botões em Poppins 600. Rótulos curtos em caixa alta usam Montserrat 600, tamanho extra pequeno e tracking amplo conforme o manual.

**The Título de Card Rule.** `h1` e `h2` recebem Montserrat na base; `h3` de vaga, empresa e autônomo permanece em Poppins. O componente genérico `CardTitle` ainda declara Montserrat: isso é uma diferença existente, não uma nova regra para títulos de oportunidades.

## Layout

O aplicativo usa contêiner central de largura máxima `max-w-6xl` (72rem), margens laterais de 1rem e conteúdo principal com respiro vertical de 2rem. A escala de espaçamento parte das utilidades Tailwind de 0.25rem. A navbar é aderente ao topo; links completos aparecem em `lg` (64rem), e o menu compacto aparece abaixo desse ponto. O lockup da navbar reduz a escala abaixo de `sm` para caber junto aos controles em 320px. Breakpoints de `sm` (40rem) e `lg` (64rem) são do Tailwind instalado, não valores copiados do estudo.

Nos painéis de usuários, a navegação global permanece no topo e as opções do usuário ficam à esquerda, com controles independentes em telas menores. Na administração, a decisão posterior do responsável substitui esse enquadramento por navegação própria, sem navbar nem rodapé público. O protótipo continua como estudo separado.

**Aplicação exclusiva em `prototipos/`:** contêiner de 1200px, expandido para 1300px em telas a partir de 1600px; margens de 32px, 24px, 20px e 16px conforme largura; breakpoints locais de 1150, 950, 760 e 360px. O estudo usa pitch com demonstração de papéis, busca/painel operacionais e artigos para leitura. A direção foi implementada também na aplicação real, conservando os tokens globais e as rotas existentes; veja o [contrato da aplicação](.impeccable/surfaces/src-app-tsx.md).

Na aplicação, os painéis de usuários usam `240px minmax(0, 1fr)` a partir de `lg`, com lateral azul profunda arredondada e o menu global no topo. A administração usa lateral azul profunda fixa à esquerda, largura de 16rem e rolagem independente; o conteúdo recebe o deslocamento correspondente e contêiner máximo de 80rem. Abaixo de `lg`, cada painel usa um diálogo lateral de até 360px ou 92vw. A home dispõe mensagem e demonstração em duas colunas no desktop e empilha os blocos no celular. A busca preserva termo, cidade e filtros na URL; o blog usa destaque editorial e leitura central de até `max-w-3xl`.

## Elevation & Depth

A separação principal vem dos três degraus de neutros e de bordas discretas. O código também contém sombras leves em cards, botões e campos; hover de botão e card aumenta sombra e desloca a superfície para cima. Portanto, o sistema não é estritamente plano. A navbar React usa fundo parcialmente transparente e desfoque; o cabeçalho do protótipo é branco sólido.

As rampas tonais do sidecar são sínteses de visualização em OKLCH, não cores oficiais adicionais; a paleta normativa permanece no frontmatter. O sidecar registra as sombras `xs`, `sm` e `md` do Tailwind instalado e a transição de 200ms dos componentes. O estudo usa transições locais de 160ms, sombra azul difusa em demonstrações e supressão de movimento quando solicitada pelo dispositivo. Essas escolhas locais não substituem os tokens de produção. A aplicação agora também respeita movimento reduzido globalmente, reduzindo duração de transições e animações e desativando rolagem suave; os controles de botão e summary têm altura mínima de 44px em ponteiros de toque.

## Shapes

O raio base é `--radius`; os raios pequenos, médios, grandes e extra grandes derivam dele. Botões usam cápsulas por padrão, com opção persistida de cantos de 12px por meio de `--button-radius`; links da navegação pública permanecem em cápsulas; campos e badges usam curvas médias. O card genérico usa o raio extra grande, enquanto cards de oportunidades sobrescrevem para `rounded-2xl`. Avatares e botões de ícone são circulares.

O protótipo tem raio local de 16px, áreas demonstrativas de 24px e campos de 9px. São diferenças de aplicação isolada; não redefinem a escala oficial.

## Components

### Buttons

Cápsulas por padrão, ou cantos de 12px conforme aparência salva, com Poppins semibold. A regra global de `[data-slot="button"]` usa `--button-radius`, inclusive nas variantes que declaram outro raio na classe; os previews acompanham essa variável. O primário é azul com texto branco; o CTA é laranja com texto escuro; outline usa contorno de 2px. O padrão mede 40px de altura, com variantes pequenas, grandes e de ícone. Hover do primário e CTA adiciona elevação; foco recebe anel visível de 3px. Desabilitado reduz opacidade e impede interação. Variantes secondary, ghost, link e destructive existem no componente React. A variante pequena mantém seu tamanho preexistente de 13px; isso não define um novo tamanho mínimo global de texto. A regra para ponteiro de toque amplia a altura dos botões para pelo menos 44px.

### Chips

Badges do componente compartilhado usam curvas médias, contorno e texto extra pequeno. Há variantes default, secondary, destructive e outline. Cards de oportunidades sobrescrevem o raio para cápsula. Destaques laranja usam o token de texto acessível sobre fundo laranja translúcido.

### Cards / Containers

Fundo de card branco, borda, sombra leve e espaçamento interno recorrente de 1.5rem. Cards de oportunidades têm respiro vertical de 1.25rem, títulos Poppins e estados de hover próprios. Não generalizar a família Montserrat do `CardTitle` genérico para os títulos de vagas.

### Inputs / Fields

Campo compartilhado com fundo transparente, borda `input`, raio médio e altura de 36px; texto base no celular e pequeno a partir de `md`. Foco altera a borda e mostra anel de 3px; erro usa `destructive`; desabilitado recebe cursor e opacidade próprios. O protótipo amplia campos para no mínimo 46px e usa texto de 16px nos campos de busca em celular. Isso descreve o estudo, não comprova acessibilidade completa do formulário de produção.

### Navigation

Navbar React aderente ao topo, com logo à esquerda, links em cápsulas e conta à direita. Item ativo combina fundo `accent`, texto azul e peso médio. Links completos e nome da conta aparecem em `lg`; abaixo desse ponto, o botão de navegação global mede 44px. Abaixo de `sm`, o lockup reduz símbolo e texto, preservando o componente de marca existente.

As laterais de usuários e administração usam `brand-ink`, links de altura mínima de 44px, ícone e texto em azul claro; ativo tem texto branco, peso semibold e fundo branco translúcido de 15%. Hover usa fundo branco a 10% e texto branco; foco recebe contorno branco. A lateral administrativa inclui acesso Visitar o site e submenus de listagem/inclusão em Vagas, Profissionais e Empresas quando o domínio está ativo. A inspiração WordPress organiza a gestão; não substitui a marca EmpregaSantana.

Abaixo de `lg`, Meu painel ou Menu da administração abre o diálogo lateral azul escuro, com fechamento próprio; mudanças de rota o fecham. No painel de usuário ele é independente do menu global. Na busca pública, o segmento ativo usa sublinhado azul e `aria-current`; os filtros permanecem na URL.

### Conteúdo editorial

O blog público usa destaque em duas colunas a partir de `md`, grade de artigos com duas colunas em `sm` e três em `lg`, categorias em cápsulas com `aria-pressed` e altura mínima de 44px. A capa é uma imagem cadastrada ou um bloco tipográfico em `accent`; não se gera uma imagem para preencher conteúdo ausente. O artigo mantém largura máxima de 48rem, corpo em Poppins e títulos em Montserrat. Estados de carregamento, erro e ausência de conteúdo são explícitos. A gestão editorial usa os componentes existentes no painel administrativo.

### Aparência e formulários administrativos

A página Aparência oferece seleção limitada de azul principal (marca, intenso ou profundo), fundo de conteúdo (cinza claro ou branco), escala de texto (padrão ou ampliada) e forma do botão (cápsula ou cantos arredondados). O código admite os azuis `#1E63B6`, `#16529A` e `#0D3A66`; a opção intensa é uma escolha de configuração da interface, não uma nova cor institucional. As opções de fundo são branco e o neutro de página existente; a lateral conserva `brand-ink` em todas elas. Os padrões preservam a identidade anterior.

`AppearanceSync` aplica a configuração obtida do singleton `site_appearance`: altera `--primary`, `--brand-blue`, `--background`, `--button-radius` e a escala raiz de 16px ou 17px. Os tamanhos em rem acompanham essa escala; tamanhos explícitos em px não são convertidos. O formulário dispõe campos e prévia em duas colunas apenas a partir de `xl` (80rem). Os selects têm altura mínima de 44px e rótulos explícitos. A prévia usa escala local de 16px/17px e corpo/ação de `0.875em`, sem alterar a raiz antes de salvar. Restaurar campos padrão modifica o rascunho local; exige salvar para persistir. Erro conserva escolhas e salvamento em andamento desabilita controles.

A gestão de Vagas, Profissionais e Empresas usa formulários por domínio, com campos tipados, seleções, editor de texto rico e campos condicionais conforme modalidade de cobrança. Campos ficam em duas colunas a partir de `sm`; o editor ocupa a largura disponível. Listagens, formulários, mensagens de erro e ações reaproveitam os componentes e tokens existentes. Isso documenta o código e a composição; não comprova permissões nem operações em banco real. Ver [ADMINISTRACAO.md](docs/ADMINISTRACAO.md) e [contrato administrativo](.impeccable/surfaces/admin-layout.md).

### Marca e assinatura provisória

Usar o componente e os assets existentes, respeitando o manual. O selo vetorial oficial continua pendente; o fallback tile+ícone e o favicon SVG são provisórios. O estudo copia somente `public/favicon.svg`, sem imagens raster geradas. Sua assinatura tipográfica não equivale à entrega de um wordmark oficial. Não transformar esse fallback em instrução para redesenhar o logo.

### Limites de documentação e verificação

O estudo permanece separado do aplicativo em `src/`. Na implementação real, a home consulta o catálogo ou explica o serviço sem inventar registros; os painéis usam hooks Supabase. Blog público e gestão editorial foram implementados em código com a migration `0021` ainda pendente de aplicação no banco configurado. FinGestão orienta a narrativa do pitch; Gupy e Infojobs são referências funcionais, com 99Freelas como apoio. VintePila e LinkedIn foram retirados das referências de design.

A evidência registrada em `docs/PROTOTIPOS.md` e `.impeccable/review/responsive-report.json` cobre nove telas em seis larguras (54 combinações), sem overflow ou erros de execução detectados no Chrome. A correção final reposiciona identidade da oportunidade antes de salário/ação no celular. O parecer dessa rodada libera o escopo da lista de correções do estudo. Na rodada posterior da aplicação, o reviewer retornou `ship` limitado às 12 capturas avaliadas e ao contrato da implementação. Nenhum dos pareceres constitui aprovação universal de UI, matriz completa de estados, dispositivos reais, outros navegadores, leitor de tela ou integração de produção. Na extensão administrativa posterior, o reviewer apontou três achados e, após as correções, marcou os três como resolvidos com disposition `ship` restrita a esses achados e às 14 capturas originais. O checkout não possui configuração real de Supabase; as migrations `0021`/`0022` não foram aplicadas nem RLS foi validada em banco real. API e sessões sintéticas de QA não validam CRUD, permissões ou RLS em banco conectado.

**Não canonizado:** a folha local aplica Montserrat também a títulos de cards, usa neutros de apoio azulados, raios e escala maiores e outra composição de navbar. São diferenças do protótipo; nenhuma foi promovida a identidade oficial ou reparada nesta documentação. Rótulos decorativos e valores pontuais não viram padrões reutilizáveis por terem aparecido no estudo. O `CardTitle` genérico em Montserrat e o botão pequeno de 13px continuam como diferenças preexistentes, sem redefinir as regras de cards e leitura. As ações explicativas da demonstração e o acesso Entrar usam outline; o fechamento da home usa azul, preservando a prioridade laranja da ação principal.

## Do's and Don'ts

### Do:

- **Do** preservar os tokens de `src/index.css` e consultar o manual antes de introduzir valores de marca.
- **Do** usar texto escuro no CTA laranja e o token de laranja de texto em fundos claros.
- **Do** preservar foco visível, rótulos, reflow e identificação independente dos menus.
- **Do** manter exemplos e operações simuladas identificados no estudo local.

### Don't:

- **Don't** usar texto branco sobre o laranja de ação ou usar esse laranja como texto em fundo claro.
- **Don't** recolorir, distorcer ou reconstruir o selo oficial com tipografia substituta.
- **Don't** promover as diferenças visuais do protótipo a novas regras globais de marca.
- **Don't** inventar estatísticas, depoimentos ou oportunidades reais para preencher a interface.
