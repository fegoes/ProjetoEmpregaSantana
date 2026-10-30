# Visual preservado após comparação local e web

Em 23/10/2026, o usuário esclareceu que rejeita as mudanças visuais recentes e quer preservar imagens, posts e o menu deste trabalho.

## Base mantida

A branch local `codex/configuracoes-categorias-tipos`, commit `1061a3b`, já contém a versão escolhida: menu reduzido, ilustrações da home, três posts com capas e imagens, editor de blog e painel administrativo. Esses arquivos foram preservados sem alterações.

## Alterações visuais excluídas

Os commits `82c58b7` e `aef20b0`, na branch `claude/visual-identity-analysis-docs-gt4qov`, reformulam cards, grafismos de capa, avatares de empresas, apresentação da home, formulários e estilos gerais. Eles não foram incorporados à versão local. A PR #5 já mesclada não contém esse conjunto de mudanças visuais; não foi revertida.

## Correções funcionais aproveitadas

Foram trazidas da PR #5 somente as correções de tela em branco: tratamento de exceções de renderização, aviso quando falta configuração do Supabase e página para endereço inexistente. O componente `RouteSeoDefaults`, acrescentado posteriormente neste trabalho, continua presente. Nenhuma mudança no cadastro de administradores, senhas, categorias, imagens ou conteúdo editorial foi feita.

## Conferência

- Build de produção aprovado e 40 testes passando.
- Comparação com o site público encontrou as quatro ilustrações da home e o menu simplificado em ambos os ambientes.
- O manifesto público anuncia `1061a3b` com alterações locais; o fingerprint publicado difere do código local. Isso não permite atribuir todas as diferenças ao número de uma PR.
- Sem commit, push, nova PR, exclusão de branch, alteração do banco ou deploy nesta rodada. As modificações funcionais estão nos arquivos locais para revisão.
- Conferência final de home, blog, catálogo e endereço inexistente em 390/1440: oito capturas, sem overflow, imagens quebradas ou erros de página. A listagem vazia de artigos foi simulada somente no navegador de teste para verificar de forma estável os três conteúdos locais; nenhuma configuração ou dado do banco foi modificado.
