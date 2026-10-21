# EmpregaSantana — Identidade Visual & Design System

> Versão 2.0 — Paleta Fingestão aplicada; selo da marca vetorizado e em produção.
> **Fonte de verdade da paleta: a paleta Fingestão**, por decisão do cliente.
> Ela substitui o `#1E63B6`/`#FF8A00` do manual de marca, que foi a referência das
> versões 1.x. O restante do manual (tagline, verbos, praça, fundação, regras de
> logotipo) continua valendo.
> Os blocos de código deste documento refletem o que está em `src/index.css` hoje.

---

## 1. A marca em uma página

| Campo | Valor |
|---|---|
| **Nome** | EmpregaSantana (assinatura visual: `EMPREGA` + `Santana!`) |
| **Tagline oficial** | *"Somos muito mais que uma página, somos a sua conexão de empregabilidade no sertão."* |
| **Praça** | Santana do Ipanema — AL |
| **Fundação** | agosto de 2022 |
| **Categoria** | marketplace de trabalho (vagas fixas e temporárias + profissionais autônomos) |
| **Instagram** | `@emprega_santana` |
| **Hashtag** | `#empregasantana` |

### 1.1 Os quatro verbos da marca

O board de identidade define quatro pilares, cada um com um ícone. Eles são o vocabulário oficial da comunicação — use estas palavras, não sinônimos:

| Verbo | Frase | Papel |
|---|---|---|
| **Conectamos** | pessoas às oportunidades. | o que a plataforma faz |
| **Geramos** | oportunidades e crescimento. | o impacto econômico |
| **Impulsionamos** | carreiras e transformamos realidades. | o impacto na pessoa |
| **Acreditamos** | no potencial de cada pessoa. | o valor/posicionamento |

Versão curta, usada na assinatura de rodapé e em peças pequenas: **Conecta · Orienta · Transforma**.

Bloco de três linhas do verso do cartão (usar como está, com os destaques em laranja):

> Conectamos **talentos** às oportunidades.
> Orientamos caminhos.
> Transformamos **futuros**.

### 1.2 Tom de voz

Direto, acolhedor e concreto. A marca fala com quem está procurando trabalho, não com recrutador corporativo. Regras práticas extraídas das peças existentes:

- Verbo na primeira pessoa do plural ("Conectamos", "Acreditamos") — a marca age junto com a pessoa.
- **"Sertão"** é palavra da marca, não é acidente. O posicionamento é regional e isso é uma força, não uma limitação.
- Frases curtas. Nada de jargão de RH ("sinergia", "capital humano", "onboarding de talentos").
- Chamadas de ação sempre imperativas e específicas: "Confira na legenda", "Ver vagas", "Criar conta" — nunca "Saiba mais".

### 1.3 Dados de contato

⚠️ **Os contatos do cartão de visita do board são placeholders e precisam ser confirmados antes de qualquer aplicação real.**

| Campo | Valor no board | Situação |
|---|---|---|
| Telefone | `(82) 9 9999-9999` | **fictício** — número de preenchimento da arte |
| E-mail | `contato@empregasantana.com.br` | a confirmar (domínio existe?) |
| Instagram | `@emprega_santana` | provável, confirmar |
| Fundadora | Lícia Maciel (crachá) | confirmar grafia e cargo |

Enquanto não confirmados, **não** replique esses dados na aplicação (footer, página "Sobre", `<meta>` tags).

---

## 2. Leitura do logotipo

### 2.1 Anatomia

O logo é um **selo circular** composto por quatro elementos, cada um com significado:

| Elemento | Cor | Leitura |
|---|---|---|
| **Anel externo** | tinta `#0B1D39` | comunidade e ciclo — o mercado de trabalho local que se fecha e se retroalimenta |
| **Figura humana de braços abertos** | laranja `#FF5A2A` | **a pessoa é o centro da marca, não a vaga.** Braços erguidos = conquista, não súplica |
| **Dois currículos/documentos** | azul vivo `#1E90FF`, segurados pela figura | os dois lados do marketplace: quem oferece e quem procura |
| **Wordmark** | `EMPREGA` azul em bloco + `Santana!` laranja em script | o institucional e o afetivo, na mesma assinatura |

A exclamação em `Santana!` é parte do logotipo. Não remova.

### 2.2 Versões

| Versão | Quando usar |
|---|---|
| **Selo flat em SVG** | **é o que o produto usa** — `public/brand/logo-mark.svg`, via `<Logo />` |
| **Selo completo 3D** | peças de destaque, capa de rede social, brinde, apresentação — a partir de 96px |
| **Selo flat (2D)** | interface, favicon, qualquer aplicação abaixo de 48px. O 3D some/embola em tamanho pequeno |
| **Lockup horizontal** (selo + wordmark ao lado) | cabeçalho de site, assinatura de e-mail, rodapé de peça |
| **Monocromático branco** | sobre fundo `#0B1D39`, fotografia escura ou impressão em uma cor |
| **Símbolo isolado** (só o anel + figura) | avatar de rede social, favicon, app icon |

### 2.3 Regras de aplicação

- **Área de respiro:** margem livre em todos os lados equivalente a **25% do diâmetro do anel**. Nada entra nessa área — nem texto, nem borda, nem outro logo.
- **Tamanho mínimo:** 32px para o símbolo isolado, 120px de largura para o lockup com wordmark.
- **Fundos permitidos:** branco, `#F7F3EE` e `#0B1D39` (nesta última, use a versão monocromática branca ou o selo com anel claro).
- **Sobre fotografia:** só com chapado de cor ou overlay escuro (≥ 55% de `#0B1D39`) por baixo.

### 2.4 Usos proibidos

- Recolorir qualquer parte (nada de logo verde, roxo, degradê).
- Distorcer, inclinar, rotacionar ou aplicar sombra/contorno próprios.
- Trocar a tipografia do wordmark ou redigitar `EMPREGA Santana!` com outra fonte.
- Separar a figura laranja do anel para usar como ícone solto.
- Usar a versão 3D abaixo de 48px.
- Aplicar sobre fundo laranja `#FF5A2A` — o símbolo laranja desaparece.

---

## 3. Paleta

Cinco cores vindas da paleta Fingestão, mais três tons derivados que existem por
necessidade de acessibilidade. Os valores OKLCH são o que entra em `src/index.css` —
o projeto usa Tailwind v4, cujos tokens são OKLCH.

### 3.1 Cores da paleta

| Papel | Hex | OKLCH | Onde entra |
|---|---|---|---|
| **Tinta** | `#0B1D39` | `oklch(0.233 0.059 259)` | `--foreground` e `--brand-ink` — texto, anel do selo, âncora de autoridade |
| **Off-white quente** | `#F7F3EE` | `oklch(0.966 0.008 73.7)` | `--background` |
| **Azul vivo** | `#1E90FF` | `oklch(0.652 0.190 253.2)` | `--brand-blue-bright` — preenchimento, ilustração, borda de hero |
| **Azul claro** | `#A7D8FF` | `oklch(0.861 0.075 242.7)` | `--brand-sky` — superfície, tinta de fundo |
| **Laranja** | `#FF5A2A` | `oklch(0.683 0.209 36.1)` | `--brand-orange` — fundo de CTA e de destaque |

**A rampa de neutros tem três degraus.** A diferença entre eles é o que dá elevação
ao card sem sombra pesada; não colapse os dois primeiros:

| Superfície | Valor |
|---|---|
| Página | `#F7F3EE` |
| Card | `#FFFFFF` |
| Apoio (`--muted`, `--secondary`) | `#F1ECE6` |

O off-white quente é um ativo deliberado: cinza frio é o padrão de todo template,
neutro quente lê como editorial.

### 3.2 Os três derivados, e por que existem

Os dois tons médios da paleta original têm quase a mesma luminosidade — azul em
OKLCH L **0.652**, laranja L **0.683**. São gêmeos de peso, diferentes só em matiz.
Disso decorre que **nenhum dos dois pode ser texto** e **nenhum aceita label branco**:

| | sobre branco | sobre o fundo | branco sobre ele |
|---|---|---|---|
| `#1E90FF` | 3.24 ❌ | 2.93 ❌ | 3.24 ❌ |
| `#FF5A2A` | 3.11 ❌ | 2.82 ❌ | 3.11 ❌ |
| `#A7D8FF` | 1.51 ❌ | — | — |

Daí os três tons derivados. Não são cores novas de marca — não use em peça gráfica.

| Token | Hex | OKLCH | Por que existe |
|---|---|---|---|
| `--primary` / `--brand-blue` | `#0062C0` | `oklch(0.500 0.170 253.2)` | o azul que **pode ser texto**: link, foco, navegação, e botão cheio com label branco |
| `--brand-orange-strong` | `#EF4B16` | `oklch(0.640 0.209 36.1)` | hover do CTA |
| `--brand-orange-ink` | `#C3441F` | `oklch(0.560 0.170 36.1)` | laranja **como texto** sobre fundo claro |

### 3.3 Papéis não são intercambiáveis

Erro fácil de cometer e difícil de enxergar: usar o mesmo tom para pintar fundo e texto.

| Token | Papel | Nunca use para |
|---|---|---|
| `--brand-orange` `#FF5A2A` | fundo de CTA e destaque | texto |
| `--brand-orange-strong` `#EF4B16` | **fundo** de hover do CTA | texto |
| `--brand-orange-ink` `#C3441F` | **texto** laranja | fundo de CTA |
| `--brand-blue-bright` `#1E90FF` | preenchimento, ilustração | texto |
| `--brand-sky` `#A7D8FF` | superfície, badge | texto |
| `--primary` `#0062C0` | link, foco, botão cheio | — |

### 3.4 Proporção de uso

```
60%  neutros (#F7F3EE, branco, #0B1D39)   → estrutura, texto, superfícies
30%  azul (#0062C0 / #1E90FF / #A7D8FF)   → navegação, links, foco, confiança
10%  laranja (#FF5A2A)                    → ação. CTA principal e destaque, nada mais
```

**O laranja é a cor mais cara da paleta.** Numa tela, no máximo um CTA laranja.

### 3.5 Acessibilidade — valores conferidos

AA exige **4.5:1** para texto normal e **3:1** para texto grande (≥24px, ou ≥18.7px
em negrito). Todos os pares abaixo foram calculados, não estimados.

| Combinação | Contraste | |
|---|---|---|
| tinta `#0B1D39` sobre o fundo | 15.22:1 | ✅ |
| tinta sobre card branco | 16.81:1 | ✅ |
| `--muted-foreground` `#5D6572` sobre apoio | 5.01:1 | ✅ |
| `--primary` `#0062C0` sobre o fundo | 5.42:1 | ✅ |
| branco sobre `--primary` | 5.99:1 | ✅ |
| `--brand-orange-ink` sobre o fundo | 4.56:1 | ✅ |
| **tinta sobre `#FF5A2A`** (label do CTA) | 5.40:1 | ✅ |
| tinta sobre `#EF4B16` (hover do CTA) | 4.55:1 | ✅ |
| tinta sobre `#A7D8FF` | 11.14:1 | ✅ |
| **branco sobre `#FF5A2A`** | 2.36:1 | ❌ **nunca** |
| **branco sobre `#1E90FF`** | 3.24:1 | ❌ **nunca** |

Regras que saem disso:

- **Label de CTA laranja é a tinta navy, nunca branco.**
- Laranja como texto é sempre `--brand-orange-ink`.
- `#1E90FF` e `#A7D8FF` não recebem texto. São preenchimento.
- Cuidado ao escurecer o laranja: como o label também é escuro, **escurecer o fundo
  reduz o contraste**. O hover não pode passar de `oklch(0.64 …)`.

## 4. Tipografia

Duas famílias, ambas no Google Fonts, ambas com bom suporte a português.

| Família | Pesos | Papel |
|---|---|---|
| **Montserrat** | 600, 700, 800 | Títulos, wordmark, números de destaque, rótulos em caixa alta |
| **Poppins** | 400, 500, 600 | Corpo de texto, botões, legendas, formulários, tudo o mais |

Montserrat é geométrica e fechada — ganha peso e autoridade em título. Poppins é geométrica e aberta — respira melhor em texto corrido. A dupla é a mesma do board de identidade.

### 4.1 Substituição em `index.html`

Trocar o bloco de fontes atual (`index.html:11-16`, hoje carregando Plus Jakarta Sans) por:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Poppins:ital,wght@0,400;0,500;0,600;1,400&display=swap"
  rel="stylesheet"
/>
```

### 4.2 Registro no tema

Em `src/index.css`, dentro de `@theme inline`:

```css
--font-sans: "Poppins", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-display: "Montserrat", ui-sans-serif, system-ui, sans-serif;
```

Isso habilita a classe `font-display` no Tailwind, que passa a ser aplicada em `h1`–`h3` e no wordmark.

> **Nota de migração (feita):** o `body` aplicava `font-feature-settings: "cv11", "ss01"` — features da Plus Jakarta Sans, que Poppins não tem. A linha foi removida, não herdada.

### 4.3 Escala de uso

Mapeada sobre os padrões que **já existem** no código, para a migração ser uma troca de família e não uma redação de layout:

| Nível | Classes | Família |
|---|---|---|
| H1 / hero | `text-3xl sm:text-4xl font-extrabold tracking-tight text-balance` | Montserrat 800 |
| H2 / seção | `text-xl font-bold tracking-tight` | Montserrat 700 |
| H3 / subtítulo | `text-lg font-semibold` | Montserrat 600 |
| Wordmark na navbar | `text-lg font-extrabold tracking-tight` | Montserrat 800 |
| Título de card | `text-[15px] leading-snug font-semibold` | Poppins 600 |
| Corpo | `text-sm` / `text-base` | Poppins 400 |
| Secundário | `text-sm text-muted-foreground` | Poppins 400 |
| Botão | `text-sm font-semibold` | Poppins 600 |
| Rótulo caixa alta | `text-xs font-semibold uppercase tracking-wide` | Montserrat 600 |

Regra: **caixa alta só em rótulo curto** (badge, categoria, "VAGA NOVA"). Nunca em frase.

> **Por que a regra base cobre só `h1, h2`.** Os únicos `<h3>` do projeto são os títulos de card (`VagaCard.tsx`, `AutonomoCard.tsx`, `EmpresaCard.tsx`), que a tabela acima define como **Poppins 600**. Aplicar `font-display` a `h3` no `@layer base` colocaria Montserrat exatamente onde ele não deve ir. Subtítulo de seção em Montserrat, quando existir, recebe a classe `font-display` explicitamente.

---

## 5. Tokens — bloco pronto para `src/index.css`

O projeto é **Tailwind v4 CSS-first**: não existe nem deve existir `tailwind.config.js` (`components.json` tem `"config": ""`). Todos os tokens vivem em `src/index.css`, arquivo único.

A arquitetura atual está correta e é preservada — mesmos nomes de token, mesmo `@custom-variant dark`, mesmo `--radius: 0.85rem`. **O que muda são os valores.** Dois tokens novos entram: `--brand-blue-strong` e `--brand-orange-ink`.

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.85rem;

  /* Paleta Fingestão. Substitui a do manual da marca (#1E63B6/#FF8A00) por
     decisão do cliente — ver docs/IDENTIDADE_VISUAL.md §3.
     Os dois tons médios do original (#1E90FF e #FF5A2A) têm quase a mesma
     luminosidade (OKLCH L 0.652 e 0.683), então nenhum serve de texto e
     nenhum aceita label branco. Daí os três derivados: primary, orange-strong
     e orange-ink carregam o texto; os vivos ficam só em preenchimento. */

  /* Neutros quentes: off-white #F7F3EE no lugar de cinza frio.
     Rampa de três degraus — página → card branco → superfície de apoio. */
  --background: oklch(0.966 0.008 73.7);   /* #F7F3EE */
  --foreground: oklch(0.233 0.059 259);    /* #0B1D39 — 15.2:1 sobre o fundo */
  --card: oklch(1 0 0);                    /* #FFFFFF */
  --card-foreground: oklch(0.233 0.059 259);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.233 0.059 259);

  /* Azul de trabalho: link, foco, navegação, botão cheio.
     Escurecido em relação ao #1E90FF para poder ser texto. */
  --primary: oklch(0.500 0.170 253.2);     /* #0062C0 — 5.42 no fundo */
  --primary-foreground: oklch(1 0 0);      /* branco — 5.99 sobre o azul */

  --secondary: oklch(0.945 0.010 73.7);    /* #F1ECE6 */
  --secondary-foreground: oklch(0.233 0.059 259);
  --muted: oklch(0.945 0.010 73.7);        /* #F1ECE6 */
  --muted-foreground: oklch(0.505 0.022 259); /* #5D6572 — 5.01 na pior superfície */
  --accent: oklch(0.925 0.040 243);        /* #D0EAFF — tinta de céu, hover de menu */
  --accent-foreground: oklch(0.300 0.070 257);

  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(1 0 0);
  --success: oklch(0.58 0.13 155);
  --success-foreground: oklch(1 0 0);

  --border: oklch(0.895 0.012 73.7);       /* #E1DBD4 */
  --input: oklch(0.895 0.012 73.7);
  --ring: oklch(0.500 0.170 253.2 / 45%);

  /* Marca: tinta fixa do logotipo, não muda entre claro e escuro */
  --brand-ink: oklch(0.233 0.059 259);            /* #0B1D39 */
  --brand-blue: oklch(0.500 0.170 253.2);         /* #0062C0 — azul que pode ser texto */
  --brand-blue-strong: oklch(0.440 0.165 253.2);  /* hover do azul */
  --brand-blue-bright: oklch(0.652 0.190 253.2);  /* #1E90FF — preenchimento, NUNCA texto */
  --brand-sky: oklch(0.861 0.075 242.7);          /* #A7D8FF — superfície, NUNCA texto */

  /* Laranja: cor de AÇÃO, reservada a CTA e destaque.
     Nunca recebe texto branco (3.11:1) — o label é sempre a tinta navy.
     Os três tons não são intercambiáveis:
       -orange        → fundo de CTA          (navy sobre ele: 5.40)
       -orange-strong → fundo de hover        (navy sobre ele: 4.55)
       -orange-ink    → laranja como TEXTO    (4.56 no fundo) */
  --brand-orange: oklch(0.683 0.209 36.1);        /* #FF5A2A */
  --brand-orange-strong: oklch(0.640 0.209 36.1); /* #EF4B16 */
  --brand-orange-ink: oklch(0.560 0.170 36.1);    /* #C3441F */
  --brand-orange-foreground: oklch(0.233 0.059 259); /* navy sobre laranja */

}

.dark {

  --background: oklch(0.190 0.040 259);    /* #081425 */
  --foreground: oklch(0.960 0.006 74);     /* #F4F1ED — 16.4:1 */
  --card: oklch(0.245 0.042 259);          /* #142134 */
  --card-foreground: oklch(0.960 0.006 74);
  --popover: oklch(0.245 0.042 259);
  --popover-foreground: oklch(0.960 0.006 74);

  --primary: oklch(0.720 0.150 253.2);     /* #5AA8FF — 7.46 sobre o fundo */
  --primary-foreground: oklch(0.190 0.040 259);

  --secondary: oklch(0.300 0.040 259);     /* #222E42 */
  --secondary-foreground: oklch(0.960 0.006 74);
  --muted: oklch(0.285 0.038 259);         /* #1F2A3D */
  --muted-foreground: oklch(0.730 0.025 259); /* #9EA8B8 — 6.74 no card */
  --accent: oklch(0.330 0.055 253);
  --accent-foreground: oklch(0.960 0.006 74);

  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.190 0.040 259);
  --success: oklch(0.66 0.14 155);
  --success-foreground: oklch(0.190 0.040 259);

  --border: oklch(1 0 0 / 13%);
  --input: oklch(1 0 0 / 17%);
  --ring: oklch(0.720 0.150 253.2 / 50%);

  /* Tinta do logotipo: idêntica ao tema claro, por definição */
  --brand-ink: oklch(0.233 0.059 259);
  --brand-blue: oklch(0.720 0.150 253.2);
  --brand-blue-strong: oklch(0.650 0.160 253.2);
  --brand-blue-bright: oklch(0.720 0.170 253.2);
  --brand-sky: oklch(0.861 0.075 242.7);

  --brand-orange: oklch(0.683 0.209 36.1);
  --brand-orange-strong: oklch(0.640 0.209 36.1);
  --brand-orange-ink: oklch(0.760 0.170 40);      /* #FF8657 — 6.79 no card escuro */
  --brand-orange-foreground: oklch(0.233 0.059 259);

}

@theme inline {
  --font-sans: "Poppins", ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-display: "Montserrat", ui-sans-serif, system-ui, sans-serif;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-brand-ink: var(--brand-ink);
  --color-brand-blue: var(--brand-blue);
  --color-brand-blue-strong: var(--brand-blue-strong);
  --color-brand-blue-bright: var(--brand-blue-bright);
  --color-brand-sky: var(--brand-sky);
  --color-brand-orange: var(--brand-orange);
  --color-brand-orange-strong: var(--brand-orange-strong);
  --color-brand-orange-ink: var(--brand-orange-ink);
  --color-brand-orange-foreground: var(--brand-orange-foreground);

  --radius-sm: calc(var(--radius) - 6px);
  --radius-md: calc(var(--radius) - 3px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 6px);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  /* Montserrat só em título de página e de seção. Os <h3> do projeto são
     títulos de card, que por especificação ficam em Poppins — ver §4.3 */
  h1,
  h2 {
    @apply font-display;
  }
}

@layer utilities {
  /* Faixa de marca para o topo de hero. Discreta de propósito: a mancha
     radial em dois cantos é assinatura de template, então aqui vira uma
     borda superior de cor sobre o fundo quente, sem degradê no miolo. */
  .brand-edge {
    border-top: 3px solid var(--brand-blue-bright);
    background-image: linear-gradient(
      to bottom,
      color-mix(in oklch, var(--brand-sky) 18%, transparent) 0%,
      transparent 42%
    );
  }
}
```

Depois disso, estas classes ficam disponíveis: `bg-brand-orange`, `text-brand-orange-ink`, `bg-brand-blue`, `hover:bg-brand-blue-strong`, `bg-brand-ink`, `font-display`, `text-success`.

### 5.1 Regras de uso dos tokens

- **Nunca escreva hex, `rgb()` ou cor crua do Tailwind em componente.** Hoje o projeto é quase perfeito nisso: as únicas cores fora do sistema estão em `src/components/StatusBadge.tsx:27` (`violet-500/600/400`). Essa é a única exceção a eliminar.
- Tints e tons se fazem com sufixo de opacidade sobre o token (`bg-brand-orange/15`, `text-primary/70`), não com cor nova. É o padrão já adotado em `VagaCard`, `AutonomoCard` e `InitialsAvatar`.
- `--brand-ink` é cor de **logotipo**, não de texto. Não muda entre claro e escuro, por definição.

---

## 6. Aplicação por superfície do produto

O que muda em cada arquivo quando a identidade for aplicada. Nada aqui foi executado ainda.

### 6.1 Botões — `src/components/ui/button.tsx`

O componente já está estruturalmente certo (pill `rounded-full`, variante `cta` própria). Só os valores mudam.

| Variante | Uso | Resultado com os tokens novos |
|---|---|---|
| `cta` (linha 13) | **Ação principal da tela.** Uma por tela. "Candidatar-se", "Publicar vaga", "Criar conta" | `bg-brand-orange` + `text-brand-orange-foreground` (escuro — nunca branco) |
| `default` (linha 12) | Ação secundária, confirmação de formulário | azul `#0062C0` com texto branco |
| `outline` | Ação terciária, filtros | borda neutra, `hover:border-primary` |
| `ghost` / `link` | Navegação, ações destrutivas leves | texto `--primary` |

### 6.2 Logotipo — `src/components/brand/Logo.tsx`

Fonte única do lockup, consumida por `Navbar`, `RootLayout` e `LoginPage`. O selo é
carregado de `public/brand/logo-mark.svg`, então trocar a arte não exige tocar em
nenhum chamador.

```tsx
<Logo />                                          // selo + wordmark
<Logo size="sm" />                                // rodapé
<Logo variant="mark" size="lg" asLink={false} />  // só o selo, em telas de auth
```

O `<img>` é `aria-hidden` porque o wordmark ao lado já nomeia a marca; em
`variant="mark"` o nome acessível vem do `aria-label` do link. Isso evita o logo ser
anunciado duas vezes por leitor de tela.

### 6.3 Correções pontuais

| Arquivo | Situação hoje | Ação |
|---|---|---|
| `src/components/layout/RootLayout.tsx:40` | "Conectando pessoas e oportunidades desde 2026." | ❌ **Ano errado.** Trocar para "desde agosto de 2022" |
| `src/components/StatusBadge.tsx:27` | `bg-violet-500/12 text-violet-600 …` no status `entrevista` | Único vazamento fora dos tokens. Trocar por `bg-primary/12 text-primary border-primary/25` |
| `src/index.css` `font-feature-settings` | features da Plus Jakarta Sans | ✅ removido no Bloco 1 |
| `src/index.css` `.brand-mesh` | só laranja + tinta | ✅ usa `--brand-blue` desde o Bloco 1 |
| `index.html:9` | `<meta description>` sem a tagline | Usar a tagline oficial da §1 |

### 6.4 Laranja como texto — a migração que o Bloco 1 obrigou

Sete arquivos usavam `text-brand-orange-strong`, um tom pensado para **fundo** de hover. Com o laranja do manual (mais claro que o anterior), isso desabava para 2.63:1. Todos migraram para `text-brand-orange-ink`:

| Arquivo | Onde |
|---|---|
| `src/components/layout/Navbar.tsx` | wordmark "Santana" |
| `src/components/layout/RootLayout.tsx` | wordmark do rodapé |
| `src/pages/public/HomePage.tsx` | "profissional certo" no hero |
| `src/components/VagaCard.tsx` / `AutonomoCard.tsx` | ribbon "Destaque" |
| `src/components/StatusBadge.tsx` | status `pending` e `paused` |
| `src/components/InitialsAvatar.tsx` | terceira entrada da paleta |

`src/components/ui/button.tsx:13` **não** mudou: ali `brand-orange-strong` é `hover:bg-*`, que é o uso correto do token.

### 6.5 Componentes que já estão conformes

Não mexer — só herdam os tokens novos:

- `src/components/{VagaCard,AutonomoCard,EmpresaCard}.tsx` — padrão `rounded-2xl`, tile de categoria `size-11 rounded-xl bg-muted`, ribbon "Destaque" em `bg-brand-orange/15`.
- `src/components/EmptyState.tsx` — `rounded-2xl border-dashed`.
- `src/components/ui/*` — primitivas shadcn "new-york", todas em `data-slot` + `cn()`.

### 6.6 Iconografia

O board define cinco ícones conceituais. **Eles não viram um icon set novo** — o projeto já usa lucide (`iconLibrary: "lucide"` em `components.json`), e `src/lib/categoryIcons.tsx` já mapeia 30 categorias. O mapeamento dos cinco conceitos para o que existe:

| Conceito do board | Equivalente lucide | Onde já aparece |
|---|---|---|
| Conexão | `Handshake` | `vendas`, `consultor` em `categoryIcons.tsx:29,44` |
| Trabalho | `Briefcase` | fallback de `iconForCategory()` (`categoryIcons.tsx:61-62`) |
| Crescimento | `TrendingUp` | a adicionar — usar em estatísticas do hero |
| Potencial | `Star` | a adicionar — usar em "Destaque"/plano premium |
| Orientação | `FileText` | a adicionar — usar em currículo/dica de carreira |

Regra: ícone sempre `strokeWidth={2}` (2.4 quando dentro de tile chapado, como já é na Navbar), tamanho travado na escala do Tailwind (`size-4`, `size-5`, `size-11` para tile).

---

## 7. Assets

### 7.1 O que existe

```
public/
  brand/
    logo-mark.svg          selo completo — anel, figura, dois currículos
    logo-mono-white.svg    uma cor, para fundo #0B1D39
  favicon.svg              sem os currículos, que somem a 16px; fundo chapado
  favicon-96.png           fallback raster
  apple-touch-icon.png     180×180
  og-image.png             1200×630
  site.webmanifest
```

O selo foi vetorizado à mão, não exportado de render 3D: precisa ler a 16px, e o 3D
embola nesse tamanho. Validado por renderização em 16/24/32/48/96/160px sobre branco,
off-white e tinta.

**Regra de tamanho:** o selo completo leva os currículos a partir de 48px. Abaixo
disso use o favicon, que os remove.

### 7.2 Limpeza obrigatória

| Arquivo | O que é | Ação |
|---|---|---|
| `public/favicon.svg` | Raio roxo `#863bff` / `#7e14ff` — **sobra do scaffold do Vite** | Substituir. Contradiz a marca em toda aba do navegador |
| `public/icons.svg` | Sprite com `bluesky-icon`, `discord-icon`, `github-icon` em `#aa3bff` — também scaffold, **não referenciado em nenhum lugar de `src/`** | Deletar |

### 7.3 Referências a adicionar em `index.html`

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#0B1D39" />
<meta property="og:title" content="EmpregaSantana" />
<meta property="og:description" content="Somos muito mais que uma página, somos a sua conexão de empregabilidade no sertão." />
<meta property="og:image" content="/og-image.png" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

### 7.4 `site.webmanifest`

```json
{
  "name": "EmpregaSantana",
  "short_name": "EmpregaSantana",
  "description": "Somos muito mais que uma página, somos a sua conexão de empregabilidade no sertão.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#0B1D39",
  "icons": [
    { "src": "/brand/logo-mark.svg", "sizes": "any", "type": "image/svg+xml" },
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```

---

## 8. Aplicação fora do produto

O board já define as peças. Registrado aqui para a marca não se desviar quando alguém for produzir material novo.

### 8.1 Papelaria e brindes

| Peça | Especificação |
|---|---|
| **Cartão de visita** (frente) | fundo branco, selo à esquerda, tagline em Montserrat com "somos a sua conexão de empregabilidade" em laranja, contatos em Poppins, tarja `#0B1D39` no rodapé com "Fundado em agosto de 2022" |
| **Cartão** (verso) | fundo `#0062C0` chapado, selo centralizado, as três linhas "Conectamos/Orientamos/Transformamos" com os substantivos em laranja |
| **Crachá** | fundo branco, selo, nome em Montserrat 700, cargo em Poppins 500 caixa alta, cordão azul |
| **Camiseta** | fundo `#0B1D39`, selo + wordmark centralizados no peito, tagline abaixo em corpo pequeno |
| **Ecobag** | cru/natural, selo em uma cor no centro |
| **Caderno** | capa `#0B1D39`, selo centralizado, "Fundado em agosto de 2022" abaixo |
| **Caneca** | branca, selo de um lado, wordmark do outro |
| **Caneta** | corpo azul, wordmark em laranja ao longo do corpo |

### 8.2 Redes sociais — os três templates

| Template | Fundo | Uso |
|---|---|---|
| **Vaga Nova** | `#0B1D39` com formas geométricas laranja | anúncio de vaga. Título em Montserrat 800 caixa alta, "CONFIRA NA LEGENDA" + `#empregasantana` |
| **Dica de Carreira** | branco / `#F7F3EE` | conteúdo educativo. "DICA" em azul, "DE CARREIRA" em laranja, corpo em Poppins, logo no canto inferior |
| **Institucional** | `#FF5A2A` chapado | frases de posicionamento. **Texto na tinta `#0B1D39`, nunca branco** (§3.5) |

Constantes em todos: onda/curva de transição entre os blocos de cor, selo sempre presente (canto inferior direito ou centralizado), nunca mais de duas cores de fundo por peça.

### 8.3 Elemento gráfico de apoio

O board traz uma faixa de pontos e traços (`•••——figura——••`) que funciona como divisor e como metáfora da conexão. Usar como separador entre seções em peça longa e como ornamento de rodapé. No produto, o equivalente é a `.brand-mesh` (§5).

---

## 9. Histórico de decisões de paleta

| Quando | Decisão | Motivo |
|---|---|---|
| v1.0 | Manual da marca (`#1E63B6` / `#FF8A00`) vira fonte de verdade | o código rodava uma paleta anterior ao manual |
| v1.1 | Laranja usado como texto migra para um tom próprio | o laranja do manual é claro demais para texto: reprovava em AA |
| **v2.0** | **Paleta Fingestão substitui a do manual** | decisão do cliente. A tinta `#0B1D39` e o off-white quente `#F7F3EE` são ganho claro; os dois tons médios precisaram de derivados para passar em AA (§3.2) |

O que **não** mudou e segue do manual: tagline, os quatro verbos, praça, data de
fundação, regras de aplicação do logotipo e a dupla tipográfica Montserrat + Poppins.

### 9.1 Dívidas conhecidas

- **Não há alternador de tema.** O bloco `.dark` existe, está completo e validado,
  mas nenhum controle na UI o ativa.
- **Escalas implícitas.** Só cor e raio são tokenizados; espaçamento, sombra e
  tipografia são utilitários repetidos à mão.
- **Áreas logadas nunca passaram por revisão visual** (painel de empresa, admin,
  onboarding). Herdam os tokens, mas o layout não foi desenhado.
- **`empresas` não tem coluna de telefone nem e-mail**, então o perfil público de
  empresa estruturalmente não exibe contato.
- **`autonomo_profiles` não tem verificação nem avaliação** — ver
  [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md).

## 10. Checklist de conformidade

Marcar conforme a implementação avançar.

**Tokens e tipografia**
- [x] `src/index.css` com a paleta do manual (§5)
- [x] `--brand-blue-strong` e `--brand-orange-ink` criados
- [x] Montserrat + Poppins carregados em `index.html` (§4.1)
- [x] `--font-display` registrado e aplicado em `h1`–`h2` (ver nota na §4.3)
- [x] `font-feature-settings` da Plus Jakarta Sans removido
- [x] `CardTitle` (`ui/card.tsx`) com `font-display` — cobre os 29 usos (onboarding, login, cadastro, formulários, dashboards)
- [x] `<h1>` de página unificado em `font-extrabold tracking-tight` nas 15 páginas internas que ainda usavam `font-semibold`

**Logotipo e assets**
- [x] `src/components/brand/Logo.tsx` criado
- [x] As 3 cópias do lockup substituídas (`Navbar.tsx`, `RootLayout.tsx`, `LoginPage.tsx`)
- [ ] `public/brand/` com `logo-mark.svg`, `logo-full.svg`, `logo-mono-white.svg` — **depende do usuário exportar o selo oficial** (§7.1); até lá, `Logo.tsx` usa o fallback tile+ícone
- [x] `favicon.svg` roxo do Vite substituído (tile+ícone provisório, cores da marca)
- [x] `public/icons.svg` deletado
- [x] `apple-touch-icon.png`, `favicon-96.png` e `site.webmanifest` adicionados (`og-image.png` já existia da rodada de SEO; refazer quando o selo oficial chegar)

**Conformidade**
- [x] `StatusBadge.tsx:27` sem `violet-*`
- [x] `grep -rE "#[0-9a-fA-F]{6}|rgb\(|hsl\(" src/` retorna só `src/index.css`
- [x] Ano da fundação corrigido para agosto de 2022 (`RootLayout.tsx`)
- [x] Tagline oficial no `<meta description>`, no hero e no footer
- [x] Nenhum texto branco sobre `#FF5A2A` nem sobre `#1E90FF` na interface (§3.5)
- [x] `.brand-mesh` usando `--brand-blue`
- [x] Laranja usado como texto migrado para `--brand-orange-ink` (8 usos, 7 arquivos)

**Documentação**
- [x] `docs/PRD.md` atualizado (§8.1 corrigido + novo §8.2 registrando a migração)
- [x] `README.md` reescrito (era o boilerplate do Vite, em inglês)

---

## Anexo — verificação dos valores

Conversões hex↔OKLCH e contrastes desta doc foram calculados pelas fórmulas oficiais (sRGB → OKLab, Björn Ottosson) e pela definição de luminância relativa da WCAG 2.1. Para reconferir após qualquer alteração de paleta:

- OKLCH: qualquer conversor que implemente OKLab, ou `oklch()` direto no DevTools do Chrome.
- Contraste: WebAIM Contrast Checker, ou a aba Accessibility do DevTools.

Os pares críticos a revalidar em qualquer mudança de cor são os da tabela §3.5 — especialmente qualquer combinação que envolva `#FF5A2A` ou `#1E90FF`.
