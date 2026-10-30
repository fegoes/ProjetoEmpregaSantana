---
version: 1
slug: "src-pages-public-homepage-tsx"
primary_target: "src/pages/public/HomePage.tsx"
related_targets: ["src/pages/public/VagaDetailPage.tsx","src/pages/public/ExplorarPage.tsx","src/components/VagaCard.tsx","src/components/AutonomoCard.tsx"]
---

# Superfícies do consumidor: feed, busca, vaga, autônomo, planos, acesso e área do candidato

Modo: Operate (a pessoa vem achar uma vaga ou um profissional e agir). Home para visitante tem um topo de apresentação curto; o resto é produto.

Público e tarefa: quem procura trabalho em Santana do Ipanema e região, no celular, chegando por link do Instagram/WhatsApp. Achar vaga que serve, entender salário/local/contrato sem abrir, candidatar-se sem sair da vaga, acompanhar candidaturas.

Confirmado pelo usuário (2026-10-20): direção "Mural da cidade"; todos os P1 + P2 da crítica; logo provisório mantido; novidades: compartilhar no WhatsApp, selo "Vaga nova" (até 3 dias), candidatar-se na própria vaga, seletor Tudo · Vagas · Profissionais. Painéis de empresa e admin fora desta rodada (só herdam primitivas).

## Direction contract

THESIS: O feed é o mural de vagas da cidade, com a mesma cara dos posts "VAGA NOVA" do Instagram. Recusa o hero de startup centralizado em caixa com degradê, selo-pílula, palavras coloridas e linha de números.

OWN-WORLD: Fundo neutro #F8F8F8, cards brancos planos com borda, sem sombra de elevação nem levantar no hover. Azul profundo #0D3A66 é o campo de cartaz: faixa do topo da home e cards em destaque, com uma forma geométrica laranja #FF8A00 no canto (o grafismo dos posts). Laranja só em CTA e no grafismo. Montserrat 800 para títulos e rótulos curtos em caixa alta; Poppins para texto e títulos de card. Salário em números tabulares, como dado principal do card. Divisor de pontos e traço da marca sob títulos de seção.

STORY: Em um olhar a pessoa vê vagas reais da região com salário, cidade, contrato e há quanto tempo foram publicadas; filtra com um toque (Tudo · Vagas · Profissionais, categorias); abre, lê, candidata-se ali mesmo ou manda no WhatsApp; volta e acompanha em "Minhas candidaturas".

FIRST VIEWPORT: Topo: barra de navegação branca. Abaixo, faixa azul profunda de largura total com uma linha de título em Montserrat 800 ("Vagas e serviços em Santana do Ipanema e região"), busca grande com botão laranja "Buscar" e o grafismo laranja no canto direito; no celular ocupa no máximo ~45% da tela. Logo depois: seletor Tudo · Vagas · Profissionais e chips de categoria; em seguida os primeiros cards (destaques como cartaz azul no topo da lista). Ação primária = busca (visitante) e o card (todos).

FORM: Direção fixada pelo usuário ("Mural da cidade", 1ª da lista apresentada), sem rolagem de conceito. seed: none (unavailable). Assinatura: o card em destaque como cartaz "VAGA NOVA" (azul profundo, título branco, canto geométrico laranja).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
