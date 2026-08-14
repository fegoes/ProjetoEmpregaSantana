# EmpregaSantana — Identidade Visual & Design System

> Versão 1.1 — Leitura do manual de marca oficial e especificação de como aplicá-lo no produto.
> Fonte de verdade: **o manual de marca**. Onde o código diverge, o código é que muda (ver §9).
> Estado: **Bloco 1 aplicado** (tokens e tipografia, §9.1). Blocos 2 e 3 pendentes.
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
| **Anel externo** | azul `#1E63B6` | comunidade e ciclo — o mercado de trabalho local que se fecha e se retroalimenta |
| **Figura humana de braços abertos** | laranja `#FF8A00` | **a pessoa é o centro da marca, não a vaga.** Braços erguidos = conquista, não súplica |
| **Dois currículos/documentos** | azul, segurados pela figura | os dois lados do marketplace: quem oferece e quem procura |
| **Wordmark** | `EMPREGA` azul em bloco + `Santana!` laranja em script | o institucional e o afetivo, na mesma assinatura |

A exclamação em `Santana!` é parte do logotipo. Não remova.

### 2.2 Versões

| Versão | Quando usar |
|---|---|
| **Selo completo 3D** | peças de destaque, capa de rede social, brinde, apresentação — a partir de 96px |
| **Selo flat (2D)** | interface, favicon, qualquer aplicação abaixo de 48px. O 3D some/embola em tamanho pequeno |
| **Lockup horizontal** (selo + wordmark ao lado) | cabeçalho de site, assinatura de e-mail, rodapé de peça |
| **Monocromático branco** | sobre fundo `#0D3A66`, fotografia escura ou impressão em uma cor |
| **Símbolo isolado** (só o anel + figura) | avatar de rede social, favicon, app icon |

### 2.3 Regras de aplicação

- **Área de respiro:** margem livre em todos os lados equivalente a **25% do diâmetro do anel**. Nada entra nessa área — nem texto, nem borda, nem outro logo.
- **Tamanho mínimo:** 32px para o símbolo isolado, 120px de largura para o lockup com wordmark.
- **Fundos permitidos:** branco, `#F2F2F2` e `#0D3A66` (nesta última, use a versão monocromática branca ou o selo com anel claro).
- **Sobre fotografia:** só com chapado de cor ou overlay escuro (≥ 55% de `#0D3A66`) por baixo.

### 2.4 Usos proibidos

- Recolorir qualquer parte (nada de logo verde, roxo, degradê).
- Distorcer, inclinar, rotacionar ou aplicar sombra/contorno próprios.
- Trocar a tipografia do wordmark ou redigitar `EMPREGA Santana!` com outra fonte.
- Separar a figura laranja do anel para usar como ícone solto.
- Usar a versão 3D abaixo de 48px.
- Aplicar sobre fundo laranja `#FF8A00` — o símbolo laranja desaparece.

---

## 3. Paleta

Cinco cores oficiais. Os valores OKLCH abaixo foram convertidos a partir dos hex do manual e são o que entra em `src/index.css` — o projeto usa **Tailwind v4**, cujos tokens são OKLCH.

### 3.1 Cores oficiais

| Papel | Hex | OKLCH | Onde entra |
|---|---|---|---|
| **Azul marca** | `#1E63B6` | `oklch(0.504 0.148 255.8)` | `--primary` — links, foco, estado ativo, chips, anel do logo |
| **Azul profundo** | `#0D3A66` | `oklch(0.344 0.090 252)` | `--brand-ink` — títulos, fundos chapados, cor fixa do logotipo |
| **Laranja ação** | `#FF8A00` | `oklch(0.747 0.180 57.4)` | `--brand-orange` — fundo de CTA, ribbon de destaque, figura do logo |
| **Neutro claro** | `#F2F2F2` | `oklch(0.961 0 0)` | `--secondary` / `--muted` — fundos de seção, superfícies de apoio |
| **Neutro escuro** | `#333333` | `oklch(0.321 0 0)` | `--foreground` — texto corrido |

### 3.2 Cores de sistema derivadas

Não estão no manual, mas são **obrigatórias** para a interface funcionar (estado de hover e texto acessível). Derivam das oficiais e não são cores novas de marca — não use em peça gráfica.

| Token | Hex | OKLCH | Por que existe |
|---|---|---|---|
| `--brand-blue-strong` | `#17539C` | `oklch(0.447 0.133 256)` | `:hover` do azul marca — `#1E63B6` sem escurecer não dá feedback |
| `--brand-orange-strong` | `#F77F00` | `oklch(0.720 0.180 55)` | `:hover` do CTA laranja. Não escurecer além disso (ver §3.4) |
| `--brand-orange-ink` | `#A94E00` | `oklch(0.530 0.143 52.5)` | laranja **como texto** sobre fundo claro; `#FF8A00` reprova em contraste |

**A rampa de neutros tem três degraus**, e a diferença entre eles é o que dá elevação aos cards sem sombra pesada. Não colapse os dois primeiros:

| Superfície | Valor | Uso |
|---|---|---|
| Página | `#F8F8F8` `oklch(0.98 0 0)` | `--background` |
| Card | `#FFFFFF` `oklch(1 0 0)` | `--card` / `--popover` |
| Apoio | `#F2F2F2` `oklch(0.961 0 0)` | `--secondary` / `--muted` |

### 3.2.1 Os três laranjas não são intercambiáveis

Erro fácil de cometer e difícil de enxergar: usar o mesmo token para pintar fundo e texto. Cada tom tem um papel só.

| Token | Papel | Nunca use para |
|---|---|---|
| `--brand-orange` `#FF8A00` | fundo de CTA e de destaque | texto (2.36:1 no branco) |
| `--brand-orange-strong` `#F77F00` | **fundo** de hover do CTA | texto (2.63:1 no branco) |
| `--brand-orange-ink` `#A94E00` | **texto** laranja sobre fundo claro | fundo de CTA (escuro demais, some a hierarquia) |

`--brand-orange-ink` foi calibrado para o **pior fundo claro do projeto** — o badge com `bg-brand-orange/18`, que é branco puxado para creme (`#FFEAD1`). Ali ele entrega 4.75:1. Nos fundos mais claros sobra margem (5.56:1 no branco).

### 3.3 Proporção de uso

A regra que evita o site virar um carnaval — e que já está codificada nos comentários do `src/index.css` atual (linhas 9, 17 e 41), que continuam válidos:

```
60%  neutros (#F2F2F2, branco, #333333)  → estrutura, texto, superfícies
30%  azul (#1E63B6 / #0D3A66)            → navegação, links, foco, confiança
10%  laranja (#FF8A00)                   → ação. CTA principal e destaque, nada mais
```

**O laranja é a cor mais cara da paleta.** Se tudo é laranja, nada é. Numa tela, no máximo um CTA laranja — o resto é `variant="default"` (azul) ou `outline`.

### 3.4 Acessibilidade — leia antes de usar o laranja

Todos os valores abaixo foram verificados. Contraste WCAG AA exige **4.5:1** para texto normal e **3:1** para texto grande (≥ 24px, ou ≥ 18.7px em negrito).

| Combinação | Contraste | Veredito |
|---|---|---|
| **branco sobre `#FF8A00`** | **2.36:1** | ❌ **reprova até para texto grande** |
| `#333333` sobre `#FF8A00` | 5.35:1 | ✅ aprovado |
| `#0D3A66` sobre `#FF8A00` | 4.90:1 | ✅ aprovado |
| `#A94E00` sobre branco | 5.56:1 | ✅ aprovado — é o laranja de texto |
| `#A94E00` sobre `#F8F8F8` | 5.24:1 | ✅ aprovado |
| `#A94E00` sobre badge `orange/18` | 4.75:1 | ✅ aprovado — é o pior caso, calibrado por ele |
| `#F77F00` sobre branco | 2.63:1 | ❌ é tom de **fundo**, nunca de texto |
| `#FF8A00` sobre branco | 2.36:1 | ❌ nunca como texto em fundo claro |
| `#1E63B6` sobre branco | 5.97:1 | ✅ aprovado |
| `#0D3A66` sobre branco | 11.58:1 | ✅ aprovado |
| `#333333` sobre branco | 12.63:1 | ✅ aprovado |
| `#333333` sobre `#F2F2F2` | 11.29:1 | ✅ aprovado |
| `#1E63B6` sobre `#F2F2F2` | 5.34:1 | ✅ aprovado |
| `#0D3A66` sobre `#F2F2F2` | 10.34:1 | ✅ aprovado |
| `#333333` sobre `#F77F00` (hover do CTA) | 4.81:1 | ✅ aprovado |
| `#0D3A66` sobre `#F77F00` (hover do CTA) | 4.40:1 | ❌ reprova por pouco |

⚠️ **Conflito conhecido com o board de identidade.** O card institucional "CONECTAMOS PESSOAS ÀS OPORTUNIDADES" no board usa **texto branco sobre laranja**. Em peça impressa e em post de Instagram isso é uma escolha estética aceitável. **Na interface do produto é uma violação de acessibilidade e não deve ser replicada.**

Regras práticas:

- Sobre `#FF8A00` só entra `#333333` ou `#0D3A66`. Nunca branco.
- **`#333333` é o único texto seguro no CTA laranja**, porque o hover escurece o fundo para `#F77F00` e ali o `#0D3A66` cai para 4.40:1. `#0D3A66` sobre laranja só em peça estática, no tom base.
- Cuidado ao escurecer o laranja: como o texto de apoio também é escuro, **escurecer o fundo *reduz* o contraste**. O hover não pode passar de `oklch(0.72 …)`.
- Laranja como *texto* sobre fundo claro é sempre `#A94E00` (`--brand-orange-ink`), nunca `#FF8A00` nem `#F77F00`.
- Isso já está correto no código atual: `src/components/ui/button.tsx:13` usa `text-brand-orange-foreground` (escuro) na variante `cta`. Mantenha assim.

---

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

  /* Neutros do manual (#F2F2F2 / #333333): cinza puro, sem viés de temperatura.
     Rampa de três degraus para dar elevação sem sombra pesada —
     página #F8F8F8 → card #FFFFFF → superfície de apoio #F2F2F2 */
  --background: oklch(0.98 0 0);           /* #F8F8F8 */
  --foreground: oklch(0.321 0 0);          /* #333333 — 11.9:1 sobre o fundo */
  --card: oklch(1 0 0);                    /* #FFFFFF */
  --card-foreground: oklch(0.321 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.321 0 0);

  /* Azul da marca — navegação, links, foco, estado ativo, verificação */
  --primary: oklch(0.504 0.148 255.8);     /* #1E63B6 */
  --primary-foreground: oklch(1 0 0);      /* branco — 5.97:1 sobre o azul */

  --secondary: oklch(0.961 0 0);           /* #F2F2F2 */
  --secondary-foreground: oklch(0.321 0 0);
  --muted: oklch(0.961 0 0);               /* #F2F2F2 */
  --muted-foreground: oklch(0.50 0 0);     /* #636363 — 5.4:1 na superfície mais escura */
  --accent: oklch(0.94 0.012 255.8);       /* #E6ECF3 — azul lavado, hover de menu */
  --accent-foreground: oklch(0.344 0.09 252);

  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(1 0 0);
  --success: oklch(0.58 0.13 155);
  --success-foreground: oklch(1 0 0);

  --border: oklch(0.90 0 0);               /* #DEDEDE */
  --input: oklch(0.90 0 0);
  --ring: oklch(0.504 0.148 255.8 / 40%);

  /* Marca fixa (logotipo) — azul profundo constante, não muda entre claro/escuro */
  --brand-ink: oklch(0.344 0.090 252);            /* #0D3A66 */
  --brand-blue: oklch(0.504 0.148 255.8);         /* #1E63B6 */
  --brand-blue-strong: oklch(0.447 0.133 256);    /* #17539C — hover do azul */

  /* Laranja: cor de AÇÃO. Reservada a CTA de alta prioridade e destaque.
     Nunca recebe texto branco (2.36:1) — ver docs/IDENTIDADE_VISUAL.md §3.4
     Os três tons têm papéis distintos e NÃO são intercambiáveis:
       -orange        → fundo de CTA
       -orange-strong → fundo de hover do CTA (claro demais para texto)
       -orange-ink    → laranja como texto, calibrado para o pior fundo claro
                        do projeto (badge em bg-brand-orange/18): 4.75:1 */
  --brand-orange: oklch(0.747 0.180 57.4);        /* #FF8A00 — só como fundo */
  --brand-orange-strong: oklch(0.720 0.180 55);   /* #F77F00 — hover, 4.81:1 com #333 */
  --brand-orange-ink: oklch(0.530 0.143 52.5);    /* #A94E00 — laranja como TEXTO */
  --brand-orange-foreground: oklch(0.321 0 0);    /* #333333 sobre laranja: 5.35:1 */
}

.dark {
  --background: oklch(0.17 0.028 252);     /* #06101B */
  --foreground: oklch(0.96 0.004 90);      /* #F3F2EF — 17.1:1 */
  --card: oklch(0.22 0.030 252);           /* #101B28 */
  --card-foreground: oklch(0.96 0.004 90);
  --popover: oklch(0.22 0.030 252);
  --popover-foreground: oklch(0.96 0.004 90);

  --primary: oklch(0.70 0.130 255.8);      /* #66A0EE — 7.1:1 sobre o fundo */
  --primary-foreground: oklch(0.17 0.028 252);

  --secondary: oklch(0.27 0.026 252);      /* #1D2733 */
  --secondary-foreground: oklch(0.96 0.004 90);
  --muted: oklch(0.26 0.024 252);
  --muted-foreground: oklch(0.70 0.020 252);  /* #96A0AB — 7.2:1 */
  --accent: oklch(0.30 0.030 252);
  --accent-foreground: oklch(0.96 0.004 90);

  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.17 0.028 252);
  --success: oklch(0.66 0.14 155);
  --success-foreground: oklch(0.17 0.028 252);

  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 16%);
  --ring: oklch(0.70 0.130 255.8 / 50%);

  /* Cor de logotipo: idêntica ao tema claro, por definição */
  --brand-ink: oklch(0.344 0.090 252);
  --brand-blue: oklch(0.70 0.130 255.8);
  --brand-blue-strong: oklch(0.63 0.135 256);

  --brand-orange: oklch(0.780 0.170 57.4);        /* #FF9732 — 8.9:1 sobre o fundo */
  --brand-orange-strong: oklch(0.720 0.175 55);   /* #F5810F — 4.83:1 com #333 */
  --brand-orange-ink: oklch(0.780 0.170 57.4);    /* no escuro o laranja puro já passa */
  --brand-orange-foreground: oklch(0.321 0 0);
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
  /* Mancha de fundo discreta para heros e cabeçalhos — laranja + azul da marca */
  .brand-mesh {
    background-image:
      radial-gradient(50% 65% at 8% 10%, color-mix(in oklch, var(--brand-orange) 14%, transparent) 0%, transparent 100%),
      radial-gradient(55% 70% at 100% 100%, color-mix(in oklch, var(--brand-blue) 10%, transparent) 0%, transparent 100%);
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
| `default` (linha 12) | Ação secundária, confirmação de formulário | azul `#1E63B6` com texto branco |
| `outline` | Ação terciária, filtros | borda neutra, `hover:border-primary` |
| `ghost` / `link` | Navegação, ações destrutivas leves | texto `--primary` |

### 6.2 Logotipo — extrair para componente

O lockup está **duplicado em três arquivos**, cada um com medidas próprias:

- `src/components/layout/Navbar.tsx:34-41` — tile `size-9 rounded-2xl bg-brand-ink` + `<Briefcase>` + wordmark
- `src/components/layout/RootLayout.tsx:20-25` — mesma coisa em `size-7 rounded-xl`
- `src/pages/public/LoginPage.tsx:37` — mesma coisa em `size-11 rounded-2xl`

Criar `src/components/brand/Logo.tsx` como fonte única e substituir os três usos:

```tsx
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type LogoProps = {
  /** 'mark' = só o selo; 'full' = selo + wordmark */
  variant?: 'mark' | 'full'
  size?: 'sm' | 'md' | 'lg'
  asLink?: boolean
  className?: string
}

const MARK_SIZE = { sm: 'size-7', md: 'size-9', lg: 'size-11' }
const TEXT_SIZE = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' }

export function Logo({ variant = 'full', size = 'md', asLink = true, className }: LogoProps) {
  const content = (
    <span className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/brand/logo-mark.svg"
        alt=""
        aria-hidden
        className={cn(MARK_SIZE[size], 'shrink-0')}
      />
      {variant === 'full' && (
        <span className={cn('font-display font-extrabold tracking-tight', TEXT_SIZE[size])}>
          Emprega<span className="text-brand-orange-ink">Santana</span>
        </span>
      )}
    </span>
  )

  return asLink ? (
    <Link to="/" aria-label="EmpregaSantana — página inicial">{content}</Link>
  ) : (
    content
  )
}
```

Observe: o `<img>` é `aria-hidden` porque o texto ao lado já nomeia a marca; no `variant="mark"` o nome acessível vem do `aria-label` do link. Isso evita o logo ser anunciado duas vezes por leitor de tela.

> Enquanto `public/brand/logo-mark.svg` não existir (§7), o componente pode manter o fallback atual — tile `bg-brand-ink` com `<Briefcase>` do lucide. A extração para componente único vale a pena **antes** mesmo do asset existir, porque troca 3 edições por 1.

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

## 7. Assets a produzir

⚠️ **Nenhum arquivo de imagem pôde ser gerado nesta rodada** — o logo chegou como imagem de referência, não como arquivo vetorial no repositório. Esta seção especifica o que precisa ser exportado e onde depositar.

### 7.1 Estrutura alvo

```
public/
  brand/
    logo-mark.svg          # selo flat, sem wordmark, 512×512 viewBox quadrado
    logo-full.svg          # lockup horizontal selo + wordmark
    logo-mono-white.svg    # versão de uma cor, para fundo #0D3A66
    logo-3d.png            # selo 3D, 1024×1024, fundo transparente (peças/apresentação)
  favicon.svg              # selo flat simplificado, legível a 16px
  favicon-96.png           # fallback raster
  apple-touch-icon.png     # 180×180, fundo #FFFFFF chapado (iOS não respeita transparência)
  og-image.png             # ✅ JÁ EXISTE — revisar quando o logo oficial chegar
  site.webmanifest
```

> **Atualização:** a `main` trouxe SEO (`og-image.png`, `robots.txt`, sitemap, meta tags OG/Twitter em `index.html`) depois que este documento foi escrito. O `og-image.png` existe e as meta tags OG/Twitter já estão no lugar — o que resta da §7.3 é `favicon`, `apple-touch-icon`, `manifest` e `theme-color`. Quando o logo oficial chegar, o `og-image.png` deve ser refeito com o selo e a tagline.

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
<meta name="theme-color" content="#1E63B6" />
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
  "theme_color": "#1E63B6",
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
| **Cartão de visita** (frente) | fundo branco, selo à esquerda, tagline em Montserrat com "somos a sua conexão de empregabilidade" em laranja, contatos em Poppins, tarja `#0D3A66` no rodapé com "Fundado em agosto de 2022" |
| **Cartão** (verso) | fundo `#1E63B6` chapado, selo centralizado, as três linhas "Conectamos/Orientamos/Transformamos" com os substantivos em laranja |
| **Crachá** | fundo branco, selo, nome em Montserrat 700, cargo em Poppins 500 caixa alta, cordão azul |
| **Camiseta** | fundo `#1E63B6`, selo + wordmark centralizados no peito, tagline abaixo em corpo pequeno |
| **Ecobag** | cru/natural, selo em uma cor no centro |
| **Caderno** | capa `#0D3A66`, selo centralizado, "Fundado em agosto de 2022" abaixo |
| **Caneca** | branca, selo de um lado, wordmark do outro |
| **Caneta** | corpo azul, wordmark em laranja ao longo do corpo |

### 8.2 Redes sociais — os três templates

| Template | Fundo | Uso |
|---|---|---|
| **Vaga Nova** | `#0D3A66` com formas geométricas laranja | anúncio de vaga. Título em Montserrat 800 caixa alta, "CONFIRA NA LEGENDA" + `#empregasantana` |
| **Dica de Carreira** | branco / `#F2F2F2` | conteúdo educativo. "DICA" em azul, "DE CARREIRA" em laranja, corpo em Poppins, logo no canto inferior |
| **Institucional** | `#FF8A00` chapado | frases de posicionamento. **Texto em `#333333` ou `#0D3A66`, não branco** (§3.4) |

Constantes em todos: onda/curva de transição entre os blocos de cor, selo sempre presente (canto inferior direito ou centralizado), nunca mais de duas cores de fundo por peça.

### 8.3 Elemento gráfico de apoio

O board traz uma faixa de pontos e traços (`•••——figura——••`) que funciona como divisor e como metáfora da conexão. Usar como separador entre seções em peça longa e como ornamento de rodapé. No produto, o equivalente é a `.brand-mesh` (§5).

---

## 9. Divergências entre o manual e o código, e plano de migração

Estado em `HEAD` (`6bfa705`). **O manual é a fonte de verdade em todas as linhas abaixo.**

| # | Item | Manual | Código hoje | Veredito |
|---|---|---|---|---|
| 1 | Azul primário | `#1E63B6` | `oklch(0.4 0.09 255)` ≈ `#234877` | Código muda. O navy atual é mais escuro e dessaturado que o azul da marca |
| 2 | Azul profundo | `#0D3A66` | `--brand-ink` `oklch(0.2 0.03 258)` ≈ `#0D1624` | Código muda. O atual é quase preto, perde o azul |
| 3 | Laranja | `#FF8A00` | `oklch(0.705 0.191 41.6)` ≈ `#FE6D2E` | Código muda. O atual puxa para o vermelho; o da marca é âmbar |
| 4 | Neutros | `#F2F2F2` / `#333333` | cinzas frios (`0.99 0.002 260`) | Código muda para cinza puro |
| 5 | Tipografia | Montserrat + Poppins | Plus Jakarta Sans | Código muda. Duas famílias, com hierarquia título/corpo |
| 6 | Logo | selo circular | `<Briefcase>` + wordmark em JSX, 3 cópias | Código muda + depende de asset (§7) |
| 7 | Fundação | agosto de **2022** | footer diz "desde **2026**" | **Erro factual no código.** `RootLayout.tsx:40` |
| 8 | Favicon | — | raio roxo `#863bff` do scaffold Vite | Descartar |
| 9 | Tagline | definida | não aparece em lugar nenhum | Adicionar em `<meta>`, hero e footer |

**O que NÃO muda** (a arquitetura atual está certa e o manual não a contradiz): Tailwind v4 CSS-first sem `tailwind.config.js`; tokens em OKLCH; `--radius: 0.85rem`; botão pill com variante `cta`; cards `rounded-2xl`; `InitialsAvatar` com paleta restrita; `.brand-mesh`; `iconForCategory()`.

### 9.1 Ordem de execução sugerida

**Bloco 1 — Tokens e tipografia** ✅ **APLICADO** (`src/index.css`, `index.html`)
Paleta da §5, fontes da §4.1, `font-feature-settings` removido. Mudou a aparência do site inteiro de uma vez.

A previsão de "sem tocar em nenhum componente" **não se confirmou**, e vale registrar o porquê. `--brand-orange-strong` acumulava dois papéis incompatíveis: fundo de hover do CTA (1 uso) e cor de texto (8 usos). Como o laranja do manual é mais claro que o antigo, trocar só o token teria piorado o contraste do laranja-texto de 3.72:1 para 2.63:1 — uma regressão de acessibilidade. Os 8 usos de texto migraram para `--brand-orange-ink` em 7 arquivos (`InitialsAvatar`, `AutonomoCard`, `VagaCard`, `StatusBadge`, `Navbar`, `RootLayout`, `HomePage`); `hover:bg-brand-orange-strong` em `button.tsx:13` ficou como estava.

*Visível para o usuário final: sim, integralmente.*

**Bloco 2 — Logotipo e assets** (`src/components/brand/Logo.tsx`, `public/brand/`, `index.html`)
Extrair o `<Logo>` da §6.2 e substituir as 3 cópias; depositar os assets da §7; deletar `public/icons.svg`; adicionar favicon, manifest e OG tags.
*Depende de export do logo pelo usuário. A extração do componente pode ir antes, com o fallback atual.*

**Bloco 3 — Varredura de conformidade**
Corrigir o `violet` em `StatusBadge.tsx:27`, o ano em `RootLayout.tsx:40`, a `.brand-mesh`, a `<meta description>`; adicionar a tagline ao hero da HomePage; atualizar `docs/PRD.md:347` (hoje descreve o design system antigo, "paleta azul/ciano + Plus Jakarta Sans") e reescrever o `README.md`, que ainda é o boilerplate em inglês do Vite.
*Visível para o usuário final: parcialmente (footer, hero, badge de entrevista).*

### 9.2 Dívidas conhecidas que a migração deveria resolver junto

- **Não há alternador de tema.** O bloco `.dark` existe, é completo e está validado — mas nenhum controle na UI o ativa. O site sempre abre claro. Já registrado em `docs/PRD.md` §8.1.
- **Escalas implícitas.** Só cor e raio são tokenizados. Espaçamento, sombra e tipografia são utilitários Tailwind repetidos à mão pelos arquivos. A §4.3 desta doc é o primeiro passo para tokenizar a tipografia.
- **Áreas logadas nunca passaram por revisão visual** (painel de empresa, admin, onboarding). A migração de tokens as alcança automaticamente, mas o layout delas não foi desenhado.

---

## 10. Checklist de conformidade

Marcar conforme a implementação avançar.

**Tokens e tipografia**
- [x] `src/index.css` com a paleta do manual (§5)
- [x] `--brand-blue-strong` e `--brand-orange-ink` criados
- [x] Montserrat + Poppins carregados em `index.html` (§4.1)
- [x] `--font-display` registrado e aplicado em `h1`–`h2` (ver nota na §4.3)
- [x] `font-feature-settings` da Plus Jakarta Sans removido

**Logotipo e assets**
- [ ] `src/components/brand/Logo.tsx` criado
- [ ] As 3 cópias do lockup substituídas (`Navbar.tsx`, `RootLayout.tsx`, `LoginPage.tsx`)
- [ ] `public/brand/` com `logo-mark.svg`, `logo-full.svg`, `logo-mono-white.svg`
- [ ] `favicon.svg` roxo do Vite substituído
- [ ] `public/icons.svg` deletado
- [ ] `apple-touch-icon.png`, `og-image.png` e `site.webmanifest` adicionados

**Conformidade**
- [ ] `StatusBadge.tsx:27` sem `violet-*`
- [ ] `grep -rE "#[0-9a-fA-F]{6}|rgb\(|hsl\(" src/` retorna só `src/index.css`
- [ ] Ano da fundação corrigido para agosto de 2022 (`RootLayout.tsx:40`)
- [ ] Tagline oficial no `<meta description>`, no hero e no footer
- [x] Nenhum texto branco sobre `#FF8A00` na interface (§3.4)
- [x] `.brand-mesh` usando `--brand-blue`
- [x] Laranja usado como texto migrado para `--brand-orange-ink` (8 usos, 7 arquivos)

**Documentação**
- [ ] `docs/PRD.md:347` atualizado (descreve o design system antigo)
- [ ] `README.md` reescrito (hoje é o boilerplate do Vite, em inglês)

---

## Anexo — verificação dos valores

Conversões hex↔OKLCH e contrastes desta doc foram calculados pelas fórmulas oficiais (sRGB → OKLab, Björn Ottosson) e pela definição de luminância relativa da WCAG 2.1. Para reconferir após qualquer alteração de paleta:

- OKLCH: qualquer conversor que implemente OKLab, ou `oklch()` direto no DevTools do Chrome.
- Contraste: WebAIM Contrast Checker, ou a aba Accessibility do DevTools.

Os pares críticos a revalidar em qualquer mudança de cor são os da tabela §3.4 — especialmente qualquer combinação que envolva `#FF8A00`.
