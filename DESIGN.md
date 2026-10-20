---
name: EmpregaSantana
description: Mural de vagas e serviços de Santana do Ipanema e região, com a cara dos posts "VAGA NOVA".
colors:
  azul-marca: "oklch(0.504 0.148 255.8)"
  azul-marca-forte: "oklch(0.447 0.133 256)"
  azul-profundo: "oklch(0.344 0.090 252)"
  laranja-acao: "oklch(0.747 0.180 57.4)"
  laranja-acao-forte: "oklch(0.720 0.180 55)"
  laranja-texto: "oklch(0.530 0.143 52.5)"
  fundo-pagina: "oklch(0.98 0 0)"
  superficie-card: "oklch(1 0 0)"
  superficie-apoio: "oklch(0.961 0 0)"
  texto: "oklch(0.321 0 0)"
  texto-secundario: "oklch(0.50 0 0)"
  borda: "oklch(0.90 0 0)"
  sucesso-texto: "oklch(0.48 0.11 155)"
  erro-texto: "oklch(0.50 0.19 27.3)"
typography:
  display:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  card-title:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.025em"
  tag:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.025em"
rounded:
  tag: "4px"
  field: "10.6px"
  card: "16px"
  sheet: "24px"
  pill: "9999px"
spacing:
  gutter: "16px"
  card-padding: "20px"
  stack: "12px"
  section: "32px"
components:
  button-cta:
    backgroundColor: "{colors.laranja-acao}"
    textColor: "{colors.texto}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-cta-hover:
    backgroundColor: "{colors.laranja-acao-forte}"
  button-primary:
    backgroundColor: "{colors.azul-marca}"
    textColor: "{colors.superficie-card}"
    rounded: "{rounded.pill}"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.azul-marca-forte}"
  button-outline:
    backgroundColor: "{colors.fundo-pagina}"
    textColor: "{colors.texto}"
    rounded: "{rounded.pill}"
    height: "44px"
  chip:
    backgroundColor: "{colors.superficie-card}"
    textColor: "{colors.texto}"
    rounded: "{rounded.pill}"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.azul-profundo}"
    textColor: "{colors.superficie-card}"
  card:
    backgroundColor: "{colors.superficie-card}"
    textColor: "{colors.texto}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  card-poster:
    backgroundColor: "{colors.azul-profundo}"
    textColor: "{colors.superficie-card}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  tag-vaga-nova:
    backgroundColor: "{colors.laranja-acao}"
    textColor: "{colors.texto}"
    typography: "{typography.tag}"
    rounded: "{rounded.tag}"
    height: "20px"
  input:
    backgroundColor: "{colors.superficie-card}"
    textColor: "{colors.texto}"
    rounded: "{rounded.field}"
    height: "44px"
---

# Design System: EmpregaSantana

## Overview

**Creative North Star: "Mural da cidade"**

O site é o mural de vagas da cidade, com a mesma cara dos posts "VAGA NOVA" que o público já segue no Instagram: campos chapados de azul profundo, formas geométricas laranja e títulos em Montserrat pesada. O fundo é neutro e calmo; a cor aparece em blocos que ocupam regiões inteiras (a faixa de busca da home, os cards em destaque, a barra de ação do celular), nunca espalhada em detalhes.

É uma interface de trabalho: a pessoa veio achar uma vaga ou um profissional e agir. Por isso a densidade é de lista útil, não de vitrine. O dado principal de cada card é o salário; cidade, tipo de contrato e "há quanto tempo" vêm logo depois. Tudo funciona com o polegar: alvos de 44px, ações principais embaixo no celular, painéis que sobem de baixo.

Recusado: hero de startup centralizado numa caixa com degradê, selo-pílula acima do título, palavras coloridas no título, linha de números, ícone de brilho (✨) para destaque, cards que "levantam" no hover.

**Key Characteristics:**
- Fundo neutro (#F8F8F8), cards brancos planos com borda de 1px, sem sombra de elevação.
- Azul profundo como campo de cartaz; laranja só em ação e no grafismo.
- Card em destaque = cartaz "VAGA NOVA": azul profundo, texto branco, círculo laranja no canto.
- Salário em números tabulares como dado principal do card.
- Painéis inferiores (bottom sheet) no celular para filtros, menu e candidatura.

## Colors

Paleta oficial do manual de marca (docs/IDENTIDADE_VISUAL.md), aplicada em blocos: 60% neutros, 30% azul, 10% laranja.

### Primary
- **Azul marca** (oklch(0.504 0.148 255.8), #1E63B6): links, foco, item de menu ativo, botão secundário, rótulo "Profissional" nos cards.
- **Azul profundo** (oklch(0.344 0.090 252), #0D3A66): o campo de cartaz. Faixa de busca da home, card em destaque, plano em destaque, chip de categoria selecionado.

### Secondary
- **Laranja ação** (oklch(0.747 0.180 57.4), #FF8A00): fundo do CTA principal (Buscar, Candidatar-se, Chamar no WhatsApp), selo "Vaga nova", traço sob o item ativo do menu, círculo do grafismo. Texto sobre ele é sempre #333333.
- **Laranja texto** (oklch(0.530 0.143 52.5), #A94E00): laranja como texto sobre fundo claro. Sobre azul profundo, o laranja ação puro passa (4,9:1) e é usado no rótulo "Destaque".

### Neutral
- **Fundo da página** (oklch(0.98 0 0), #F8F8F8): chão de todas as telas.
- **Superfície de card** (oklch(1 0 0), #FFFFFF): cards, campos, painéis.
- **Superfície de apoio** (oklch(0.961 0 0), #F2F2F2): seletor Tudo/Vagas/Profissionais, caixas de status, rodapé.
- **Texto** (oklch(0.321 0 0), #333333) e **texto secundário** (oklch(0.50 0 0), #636363): corpo e informação de apoio.
- **Borda** (oklch(0.90 0 0), #DEDEDE): contorno de card, campo e divisores.
- **Sucesso texto** (oklch(0.48 0.11 155)) e **erro texto** (oklch(0.50 0.19 27.3)): texto de status sobre o próprio tom lavado; os tons base reprovam ali.

### Named Rules
**The One Orange Rule.** No máximo um botão laranja por tela (ou por painel aberto). O resto é azul ou contorno.
**The Poster Field Rule.** Azul profundo só aparece como campo inteiro (faixa, card, plano), nunca como cor de texto ou detalhe solto.
**The Dark-on-Orange Rule.** Sobre laranja, só texto #333333. Branco sobre laranja reprova (2,36:1).

## Typography

**Display Font:** Montserrat (com ui-sans-serif, system-ui)
**Body Font:** Poppins (com ui-sans-serif, system-ui)

**Character:** Montserrat 800 dá a voz de cartaz dos posts; Poppins aberta deixa as listas e descrições fáceis de ler no celular.

### Hierarchy
- **Display** (800, 1.75rem → 2.5rem, 1.12): título da faixa da home. Uma por tela, no máximo.
- **Headline** (800, 1.5rem → 1.875rem na vaga, 1.25): título de página (vaga, autônomo, "Minhas candidaturas").
- **Title** (700, 1.125rem, 1.4): títulos de seção ("Descrição da vaga", "Para empresas").
- **Card title** (Poppins 600, 15px, 1.375): título de card de vaga/profissional. Até 2 linhas.
- **Body** (Poppins 400, 15px, 1.625): descrições, com largura máxima de 68ch.
- **Label** (Montserrat 600, 12px, caixa alta, 0.025em): legendas de grupo de filtro.
- **Tag** (Montserrat 700, 11px, caixa alta): "Vaga nova", "Destaque".

### Named Rules
**The No Eyebrow Rule.** Nenhum rótulo acima de título. O título carrega o próprio peso; tipo, categoria e data vão depois do título.
**The Tabular Money Rule.** Todo valor em R$ usa números tabulares e o formato brasileiro (R$ 1.518/mês, R$ 39,90).

## Layout

Contêiner de 72rem (max-w-6xl) com margem lateral de 16px. No celular, a faixa da home encosta nas bordas e sob a barra de navegação.

Feed: seletor de tipo e chips de categoria no topo; no desktop (≥1024px) filtros na lateral esquerda (224px, fixos ao rolar); no celular, botão "Filtros" que abre painel inferior. Grade de cards: 1 coluna no celular, 2 a partir de 640px, 3 a partir de 1280px.

Páginas de detalhe: conteúdo à esquerda (descrição com até 68ch) e resumo à direita com o CTA (320px, fixo ao rolar) no desktop; no celular o resumo some e o CTA vai para uma barra fixa no rodapé, com área de respiro para o conteúdo e o rodapé do site.

Ritmo: 12px dentro de grupos, 20px de respiro interno dos cards, 32px entre seções.

## Elevation & Depth

Plano por padrão. A elevação vem da rampa de três neutros (página #F8F8F8 → card #FFFFFF → apoio #F2F2F2) e da borda de 1px. Sombra só onde algo realmente flutua sobre o conteúdo.

### Shadow Vocabulary
- **Barra fixa** (`box-shadow: 0 -6px 20px -12px oklch(0 0 0 / 0.3)`): barra de ação no rodapé do celular.
- **Painel** (`box-shadow: 0 -8px 32px -8px oklch(0 0 0 / 0.25)`): painel inferior / lateral (filtros, menu, candidatura).
- **Mínima** (`shadow-xs`): botões preenchidos e campos.

### Named Rules
**The Flat Card Rule.** Cards não ganham sombra nem se deslocam no hover; o hover muda só a cor da borda (azul) ou, no cartaz, a borda vira laranja.

## Shapes

Botões, chips e o seletor de tipo são pílulas (9999px). Cards têm cantos de 16px; campos, 10,6px; o selo "Vaga nova" é um retângulo de 4px, como uma etiqueta de cartaz. Painéis inferiores têm 24px no topo. O grafismo da marca é o círculo laranja: grande no canto inferior direito da faixa da home (desktop), pequeno no canto dos cards em destaque e da faixa no celular. Divisor de seção = três pontos laranja seguidos de uma linha de 1px (faixa de pontos e traço do board).

## Components

### Buttons
- **Shape:** pílula (9999px), 44px de altura no celular e 40px no desktop.
- **CTA:** laranja ação com texto #333333; hover laranja forte. Uma vez por tela.
- **Primary:** azul marca com texto branco; hover azul marca forte.
- **Outline:** borda de 2px neutra, hover com borda e texto azul.
- **Press:** escala 0.97 ao tocar (150ms ease-out); desligado com movimento reduzido. Nenhum botão "levanta" no hover.

### Chips
- **Style:** pílula branca com borda, 40px de altura no celular.
- **State:** selecionado vira campo azul profundo com texto branco. Nos filtros do painel inferior o selecionado é azul marca.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** branco; em destaque, azul profundo.
- **Shadow Strategy:** nenhuma (ver Elevation & Depth).
- **Border:** 1px neutra; hover azul marca a 50%.
- **Internal Padding:** 20px. Ordem fixa: título (até 2 linhas) → empresa ou especialidade → valor → contrato/tipo → local → selos e data.

### Inputs / Fields
- **Style:** branco, borda neutra de 1px, 10,6px de canto, 44px de altura (busca: 48px, pílula). Texto de 16px no celular para o iPhone não dar zoom.
- **Focus:** anel de 3px no azul marca a 50%; na faixa azul, anel laranja.
- **Error:** caixa com fundo vermelho lavado, ícone e texto em erro texto, dizendo o problema e o que fazer.

### Navigation
- Barra branca de 64px, fixa no topo. Desktop: links em Poppins 500; o ativo fica azul com um traço laranja de 2px embaixo. Celular: botão de menu de 44px que abre painel inferior com itens de 48px. Atalhos por perfil (Candidaturas, Currículos, Minha empresa).

### Card-cartaz "VAGA NOVA" (assinatura)
O card em destaque vira o post da marca: campo azul profundo, título e valor em branco, secundários em branco a 75%, círculo laranja de 80px saindo do canto superior direito e rótulo "★ Destaque" em laranja. Vaga publicada há até 3 dias recebe a etiqueta laranja "Vaga nova".

## Do's and Don'ts

### Do:
- **Do** mostrar o valor no card ("R$ 1.518/mês", "A partir de R$ 60/hora", "Salário a combinar").
- **Do** usar azul profundo em campos inteiros (faixa, cartaz, plano em destaque).
- **Do** manter a ação principal ao alcance do polegar: barra fixa no rodapé no celular, painel inferior para escolhas.
- **Do** separar cidade e estado com vírgula ("Santana do Ipanema, AL").
- **Do** usar o divisor de pontos e traço entre seções longas.

### Don't:
- **Don't** usar degradê, vidro/blur decorativo ou o ícone de brilho (✨).
- **Don't** pôr rótulo/eyebrow acima de título nem linha de números como prova social.
- **Don't** fazer cards ou botões subirem no hover.
- **Don't** usar travessão (—) como separador em dados de card.
- **Don't** pôr texto branco sobre laranja.
