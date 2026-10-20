# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Quem procura trabalho** em Santana do Ipanema (AL) e região: emprego formal (CLT/PJ), trabalho temporário ou por entrega. É o público principal. Usa quase sempre o celular, muitas vezes com uma mão, e chega por link compartilhado (WhatsApp, Instagram @emprega_santana).
- **Quem contrata:** empresas locais que publicam vagas e gerenciam candidaturas, e pessoas que precisam encontrar um profissional autônomo (eletricista, diarista, pedreiro…).
- **Autônomos:** mantêm um perfil público de serviços para serem encontrados e contratados direto. Não se candidatam a vagas.

Um mesmo usuário pode acumular papéis (candidato, autônomo, dono de empresa).

## Product Purpose

Marketplace de trabalho regional: vagas fixas, temporárias e profissionais autônomos num lugar só. Navegação pública e aberta. Conta só é exigida para agir (candidatar-se, contratar, publicar). Sucesso = quem procura trabalho acha uma vaga que serve e se candidata sem travar; quem contrata encontra alguém da região.

## Positioning

A conexão de empregabilidade do sertão: regional (Santana do Ipanema e cidades vizinhas), não nacional, e reúne vaga formal, bico/temporário e autônomo no mesmo feed. A marca já existe fora do site (Instagram, posts "VAGA NOVA", papelaria) desde agosto de 2022.

## Operating Context

- Divulgação de vagas acontece no Instagram e circula por WhatsApp; o site é para onde esses links levam.
- Fluxo do candidato: ver vaga → criar conta → montar um ou mais currículos → candidatar-se escolhendo o currículo → acompanhar o status (enviada, em análise, entrevista, aprovada, não aprovada).
- Fluxo da empresa: painel com vagas, candidaturas recebidas, banco de currículos (por plano).
- Admin modera empresas, vagas, usuários, planos e páginas institucionais.

## Capabilities and Constraints

- Stack: React 19 + TypeScript + Vite, Tailwind v4 (tokens em `src/index.css`), shadcn/ui, Supabase (Postgres com RLS, Auth, Storage, Edge Functions). Deploy na Vercel.
- Planos pagos ainda **não têm checkout** (Stripe previsto); não prometer pagamento online.
- Contato direto com autônomo exige login.
- HTML de usuário (Tiptap) sempre sanitizado com DOMPurify.

## Brand Commitments

- Manual de marca em `docs/IDENTIDADE_VISUAL.md` é a fonte de verdade: azul `#1E63B6`, azul profundo `#0D3A66`, laranja de ação `#FF8A00` (nunca com texto branco), neutros `#F2F2F2`/`#333333`; Montserrat (títulos, rótulos) + Poppins (texto, títulos de card).
- Tom de voz: direto, acolhedor, concreto; "sertão" é palavra da marca; CTAs imperativos e específicos, nunca "Saiba mais"; sem jargão de RH.
- Tagline: "Somos muito mais que uma página, somos a sua conexão de empregabilidade no sertão."
- Logo oficial (selo circular) ainda não existe em arquivo: o produto usa o lockup provisório de `src/components/brand/Logo.tsx` até o usuário enviar o selo.

## Evidence on Hand

- Sem fotos reais, depoimentos ou números de resultado no repositório. Não inventar.
- Contatos do cartão de visita do board são placeholders (ver manual §1.3): não publicar.

## Product Principles

1. Quem procura trabalho vem primeiro: salário, local, tipo de contrato e data respondidos antes do clique.
2. Celular primeiro: ação principal ao alcance do polegar, alvos de toque de 44px.
3. Regional e reconhecível: o site precisa parecer a mesma marca que o público já segue no Instagram.
4. Nunca deixar a pessoa sem saída: todo estado vazio, erro ou bloqueio diz o que fazer em seguida.

## Accessibility & Inclusion

WCAG AA de contraste (tabela verificada no manual §3.4). Público amplo, com níveis variados de familiaridade digital: linguagem simples, rótulos visíveis, nada que dependa só de hover.
