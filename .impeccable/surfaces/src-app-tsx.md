---
version: 1
slug: src-app-tsx
primary_target: src/App.tsx
related_targets: [src/pages/public/HomePage.tsx, src/pages/public/ExplorarPage.tsx, src/pages/public/BlogPage.tsx, src/components/layout/PanelLayout.tsx]
---

# Aplicação funcional a partir do estudo aprovado

O usuário autorizou a implementação após o protótipo: “quando finalizar pode implementar”. Mantêm-se suas escolhas: modo claro, responsividade, home como pitch inspirado na narrativa do FinGestão, Gupy/Infojobs para descoberta e conteúdo, navegação global no topo e opções do usuário à esquerda. CRUDs devem usar Supabase, sem dados fictícios embarcados.

THESIS: explicar a conexão regional na home e permitir executar descoberta, candidatura, gestão de perfis, currículos, vagas e conteúdo nas rotas reais.

OWN-WORLD: identidade oficial Montserrat/Poppins, #1E63B6, #0D3A66, #FF8A00, fundos #F8F8F8 e branco. Manter assinatura provisória existente. Não fabricar números, vagas, serviços ou depoimentos. Dados de QA são interceptações locais externas ao produto.

STORY: problema regional, proposta, demonstração por público, funcionamento, dúvidas e ação; busca e painel passam à gramática operacional, blog privilegia leitura.

FIRST VIEWPORT: mensagem e ação claras na home, demonstração interativa ao lado no desktop e abaixo no celular; dados consultados ou explicação verdadeira sem catálogo. Nas telas operacionais, identidade e tarefa precedem detalhes e ações.

FORM: implementação code-first da direção já prototipada, fixada pelo usuário a partir de https://fingestao.vercel.app/. Não há comp aprovado nem nova identidade. SEED REFERENCE: seed:3d480c23a1fb87e2 (sorteio anterior corroborado na rodada de protótipos). As referências servem à narrativa e organização, não à cópia de marca.

FINISH: revisão final com capturas válidas, detector e registro das decisões em DESIGN.md. Sem rasters gerados; imagens editoriais dependem de URLs cadastradas.

Limite verificável: checkout sem configuração real de Supabase. Migration editorial e RLS entregues em código, não aplicadas. QA de UI com API simulada não valida permissões reais nem produção.
