# Estado da identidade visual

> Atualizado em 2026-10-22, contra `main` em `c0b1d6a`.

Existem hoje **duas linhas de identidade** no repositório. Este documento é o mapa
das duas — serve para que ninguém reverta uma delas de novo sem perceber.

Se você só precisa da referência de marca, vá para
[IDENTIDADE_VISUAL.md](./IDENTIDADE_VISUAL.md). Este aqui é sobre *o que está onde*.

---

## Linha A — o que está no ar (`main`)

Resultado das PRs #2, #3 e #4.

| Aspecto | Estado |
|---|---|
| Paleta no CSS | manual da marca: `#1E63B6`, `#FF8A00`, neutros cinza frio |
| Tema escuro | **removido** — `color-scheme: only light`, bloco `.dark` apagado, zero `dark:` no código |
| Azul | deixou de ser constante: a página de Aparência (`src/pages/admin/AparenciaPage.tsx:25`) permite escolher entre `#1E63B6`, `#16529A` e `#0D3A66` |
| Selo | SVGs em `public/brand/`, carregados por `src/components/brand/Logo.tsx:26` |
| Registro de design | `DESIGN.md` na raiz, tokens em nomes técnicos, lido pelo `npm run design:scan` |

A PR #2 trouxe a paleta Fingestão; o commit `33caeda` ("Reúne revisões locais com a
versão atual do GitHub") a reverteu. **A reversão pegou o CSS, mas não os assets** —
daí o conflito nº 1 abaixo.

Vale registrar o acerto da linha A: a migration `0023_restrict_admin_access` põe
`is_admin()` como `security definer` e adiciona trigger contra escalar privilégio.

## Linha B — redesenho parado, sem PR

Branch **`claude/tender-rubin-eeuyjb`**, três commits, partindo de 8 commits atrás
da `main` (não tem blog, taxonomias, Aparência nem a `0023`).

| Commit | O que traz |
|---|---|
| `eed7eb8` | skills de design, agentes do Impeccable, MCP do Playwright |
| `a187d6c` | crítica de design do Impeccable — **17/40** (ver [DEBITO_DE_DESIGN.md](./DEBITO_DE_DESIGN.md)) |
| `5804b69` | redesenho **"Mural da cidade"**: telas públicas e área do candidato |

O que o redesenho propõe:

- Hero de startup trocado por faixa chapada com busca; `.brand-mesh` removida em
  favor do componente `BrandDivider` (três pontos laranja + linha, o elemento
  gráfico do board).
- Card de vaga vira o cartaz **"VAGA NOVA"** dos posts do Instagram; selo "Vaga
  nova" para anúncios de até 3 dias; estrela no lugar do `Sparkles`.
- Cards passam a mostrar salário, contrato, cidade e data.
- Dois tokens de sistema novos, com contraste medido: `--success-ink` e
  `--destructive-ink`, porque os tons base reprovam sobre o próprio fundo lavado
  (3,2:1 e 3,8:1 → 5,2:1 e 5,3:1).
- Marca nas superfícies do navegador: `scrollbar-color`, `caret-color`,
  `accent-color` e `::selection`.
- Mobile: barra de ação fixa com `env(safe-area-inset-bottom)`, alvos de 44px,
  fim do "levantar" no hover.
- Componentes novos: `ApplyToVaga`, `BackLink`, `BrandDivider`, `PosterShape`,
  `ShareWhatsAppButton`, `FeedBrowser`, `AuthLayout`, `PasswordInput`, `sheet`.
- `src/lib/format.ts` com testes.
- **Mantém o tema escuro**, que a linha A removeu.

---

## Conflitos entre as duas linhas

### 1. O selo está numa paleta e a interface em outra

Os SVGs de `public/brand/` seguem na paleta Fingestão enquanto o CSS voltou ao
manual. Distância perceptual medida (ΔE OKLab; o limiar de percepção é ≈ 0.02):

| Par | ΔE | |
|---|---|---|
| figura do selo `#FF5A2A` × CTA `#FF8A00` | **0.101** | cores distintas |
| anel `#0B1D39` × `--brand-ink` `#0D3A66` | **0.116** | cores distintas |
| currículos `#1E90FF` × `--primary` `#1E63B6` | **0.154** | cores distintas |

Na prática: **a navbar exibe dois laranjas diferentes lado a lado**, em toda página.

Resquícios da mesma reversão incompleta, ainda em valores Fingestão:

- `index.html:10` — `<meta name="theme-color" content="#0B1D39">`
- `public/site.webmanifest:7-8` — `background_color: #F7F3EE`, `theme_color: #0B1D39`

### 2. `.brand-edge` não existe mais, mas quatro telas a usam

A classe foi removida do CSS na reversão; as referências ficaram. Não quebra o
build — a classe simplesmente não resolve, e as quatro telas perderam o tratamento
de fundo em silêncio.

`src/pages/public/LoginPage.tsx:33` · `CadastroPage.tsx:57` ·
`ForgotPasswordPage.tsx:31` · `ResetPasswordPage.tsx:38`

Hoje `src/index.css:114` define apenas `.brand-mesh`.

### 3. Recência órfã

`publicadaHa` e `contarRecentes` seguem em `src/lib/utils.ts` com testes passando e
**nenhum consumidor** — a exibição saiu dos cards na reversão. Consequência: nenhuma
vaga mostra data, então o visitante não distingue um anúncio de ontem de um de oito
meses. O dado chega ao componente e é descartado.

### 4. `DESIGN.md` divergiu

Mesmo arquivo, dois conteúdos: tokens em nomes técnicos na `main`, em português na
linha B, com `description` diferente.

### 5. Tema escuro

Removido na linha A, mantido na linha B. Integrar a linha B sem decidir isso
reintroduz um tema que a `main` desligou de propósito.

---

## O que depende de decisão humana

1. **Qual paleta vence** — o selo (Fingestão) ou o CSS (manual). Enquanto não se
   decide, o conflito nº 1 continua visível em produção. Os resquícios de
   `theme-color` e do manifest seguem a mesma decisão.
2. **Se a linha B entra** — e, se entrar, rebaseada sobre a `main` atual, resolvendo
   antes o tema escuro e o `DESIGN.md`.
3. **Se o azul configurável convive com a identidade** — a página de Aparência tornou
   o azul uma preferência de instalação. Isso precisa estar no manual de marca, ou
   a marca e o produto vão divergir de novo.

## Pendências de produto que não são de identidade

Registradas aqui porque aparecem na crítica de design e em auditoria anterior:

- **Contas de seed em produção**: `seed-demo-password` aparece 3× em
  `supabase/migrations/0003_seed_demo_data.sql` e 1× em `0004_seed_admin_user.sql`,
  incluindo um admin. A `0023` impede escalar privilégio, mas não remove conta que
  já nasce com acesso.
- **Seed fora de Alagoas**: `emp_cities` em `0003` lista São Paulo, Recife, Curitiba
  e outras; nenhum registro na praça da marca.
- **Sem contato em lugar nenhum**: rodapé e `/sobre` não têm telefone, e-mail nem
  endereço, enquanto Termos, Privacidade e LGPD mandam procurar "os canais de
  contato indicados na página Sobre".
