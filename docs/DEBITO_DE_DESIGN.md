# Débito de design

Registro rastreável da crítica de design de **2026-10-16**, feita com o
[Impeccable](https://github.com/) sobre as telas públicas e a área do candidato.
O original está em `.impeccable/critique/2026-10-16T11-09-13Z__src.md`, na branch
`claude/tender-rubin-eeuyjb`; aqui ele vira lista acompanhável.

**Nota: 17/40.** Zero P0, quatro P1.

Como a crítica rodou: app com dados de demonstração (Supabase simulado — 7 empresas,
11 vagas, 6 autônomos), sessão de candidata simulada, capturas em 1440px e 390px,
detector injetado nas páginas renderizadas. Painéis de empresa e admin ficaram fora
do escopo. A sessão foi marcada como *degraded* (sem sub-agentes).

## Notas por heurística

| # | Heurística | Nota | Problema principal |
|---|---|---|---|
| 1 | Visibilidade do status | 2 | candidatura enviada some sem confirmação |
| 2 | Linguagem do mundo real | 2 | "Checkout via Stripe chega na Fase 3", "R$ 99.00", "1 vagas ativas" |
| 3 | Controle e liberdade | 2 | sem voltar na vaga; candidatar-se tira a pessoa da página |
| 4 | Consistência | 3 | tokens coesos; filtro com dois padrões (checkbox × pílula) |
| 5 | Prevenção de erros | 1 | excluir currículo sem confirmação; regra de senha escondida |
| 6 | Reconhecer > lembrar | 2 | "Minhas candidaturas" fora de qualquer menu |
| 7 | Flexibilidade | 1 | sem ordenar, sem salvar vaga, sem compartilhar |
| 8 | Estética minimalista | 2 | destaques duplicados; quase todo card com selo "Destaque" |
| 9 | Recuperação de erros | 1 | erros do Supabase em inglês; falha do feed sem "tentar de novo" |
| 10 | Ajuda | 1 | nenhuma ajuda, FAQ ou explicação dos status |

## Veredito de especificidade

**Categoria-intercambiável.** A crítica confirmou, de forma independente, achados de
auditorias anteriores: hero de template (degradê, selo-pílula, título com duas
palavras coloridas, três números), `Sparkles` como selo "Destaque" em 4 arquivos,
card de molde único com vaga e autônomo indistinguíveis, hover-lift em tudo, logo
provisório de maleta.

A observação mais afiada: *"a marca diz que a pessoa é o centro, não a vaga, mas não
há pessoa, foto ou lugar real"* — e a linguagem gráfica do Instagram ("VAGA NOVA",
faixa de pontos e traços) nunca chegou ao produto.

Achados do detector no DOM renderizado: 8× `icon-tile-stack` na home,
`em-dash-overuse` (19 travessões), `edge-flush-cards` no carrossel, contraste 3.2:1
no selo "Publicada", salto de heading `h1→h3`, cards aninhados no cadastro. Sem
falsos positivos.

## O que já funcionava

1. Disciplina de cor — laranja só no CTA, texto escuro sobre laranja, zero cor fora
   do sistema de tokens.
2. Cadastro claro, com os três perfis em linguagem simples.
3. Base de acessibilidade — skip link, `lang="pt-BR"`, busca com 16px no celular
   (evita o zoom automático do iOS).

## Os quatro P1

Legenda de status: **resolvido na linha B** = tratado no redesenho "Mural da cidade",
que ainda não foi enviado (ver [ESTADO_DA_IDENTIDADE.md](./ESTADO_DA_IDENTIDADE.md));
**aberto** = segue como está na `main`.

### P1-1 · Becos sem saída no fluxo do candidato
"Minhas candidaturas" sem link em menu nenhum; sem currículo, a candidatura trava
numa mensagem sem botão; envio sem confirmação; perfil errado leva a redirect
silencioso; pós-login cai num hub com um card só.
**Proposta:** navegação do candidato (Vagas · Minhas candidaturas · Meu currículo),
candidatura na própria vaga com confirmação e criação de currículo inline, voltar
para onde estava após o login.
**Status:** resolvido na linha B (`ApplyToVaga`, `useCandidaturas`, `AuthLayout`).

### P1-2 · Cara de template de IA na home e nos cards
**Proposta:** home com busca e "vagas novas hoje" — a listagem é o herói; card
inspirado no post "VAGA NOVA"; estrela no lugar do ✨; sem lift; logo oficial.
**Status:** parcialmente resolvido na linha B. Na `main`, a home foi reescrita pela
PR #3/#4 e melhorou bastante (abas por público, enquadramento do problema), mas
`Sparkles` e o hover-lift **continuam abertos**, e o logo oficial existe mas está
em paleta divergente.

### P1-3 · Cards não respondem ao que importa
Sem salário, sem data; vaga e autônomo iguais; excerto só no hover (inexistente no
celular) alterando a altura da linha; destaques repetidos no carrossel e na grade.
**Proposta:** salário em evidência ("R$ 1.518/mês"), contrato, cidade, "há 2 dias";
autônomo com rótulo próprio e "a partir de R$ 60/h".
**Status:** resolvido na linha B. **Aberto na `main`** — e com um agravante: as
funções de data `publicadaHa`/`contarRecentes` existem e estão testadas em
`src/lib/utils.ts`, sem nenhum consumidor.

### P1-4 · Celular não pensado para o polegar
"Candidatar-se" no fim da página; alvos pequenos (inputs 36px, Entrar 32px, Filtros
20px); hero ocupando a primeira tela; home com ~4.000px; Explorar vazio até digitar.
**Proposta:** barra fixa inferior, alvos de 44–48px, filtros em bottom sheet com
chips, Explorar mostrando tudo, hero compacto.
**Status:** resolvido na linha B (`sheet`, `safe-area-inset`, alvos de 44px).

## P2 · Linguagem e erros que quebram a confiança

"Fase 3" em Planos; "R$ 99.00/mês"; "1 vagas ativas"; status "Publicada" exposto ao
público; erros de autenticação em inglês ("Invalid login credentials"); salário sem
"/mês"; planos sem botão; excluir sem confirmação.
**Status:** "Fase 3" foi removido da `main`. O resto segue aberto; a linha B trata
os erros de auth em `src/lib/authErrors.ts` e a formatação em `src/lib/format.ts`.

## Red flags por persona

- **Casey** (celular, uma mão): hero ocupa a tela; rola até o fim para achar
  "Candidatar-se"; inputs de 36px; não dá para mandar a vaga no WhatsApp.
- **Jordan** (primeira vez): pós-login com um botão "Acessar"; não acha "Minhas
  candidaturas"; erro em inglês; "Hora ou entrega" não diz o preço.
- **Riley** (testa limites): exclui currículo sem confirmação; autônomo clicando
  "Candidatar-se" volta ao perfil sem explicação; feed falha sem retry.

## Observações menores

30 categorias em checkbox nativo de 13px · navbar "Home" em inglês · carrossel
cortado sem indicação · página da empresa repete o nome em cada card · sem
`prefers-reduced-motion` com hover-lift em tudo · login sem `autoComplete` ·
tagline repetida em hero, rodapé e meta.

## Perguntas que a crítica deixou em aberto

- E se a home fosse o mural de vagas da cidade, em vez de um hero de startup?
- Precisa de conta para a primeira candidatura, ou "Candidatar-se pelo WhatsApp"
  converteria mais?
- Vagas e autônomos precisam dividir o mesmo feed?

## Como rodar de novo

```
npm run design:install   # instala a CLI (ela não vem no node_modules)
npm run design:scan      # impeccable detect src/
```

O `design:scan` falha com `impeccable: not found` em ambiente novo enquanto o
`design:install` não roda. Vale lembrar que o detector de código-fonte não lê
classes Tailwind em `.tsx` — na crítica original o scan estático deu zero achados, e
tudo o que foi encontrado veio do detector injetado nas páginas já renderizadas.
