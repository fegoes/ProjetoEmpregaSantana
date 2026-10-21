# Publicação das revisões do sistema

## Diagnóstico em 21/10/2026

O endereço `https://emprega-santana.vercel.app` servia `assets/index-DExUXBO-.js` e `assets/AdminLayout-PiVUZVaA.js`. O segundo arquivo continha o menu administrativo antigo, sem lateral azul. As rotas `admin/aparencia` e `admin/profissionais` não estavam no bundle principal. A consulta foi pública, sem login ou alteração de dados.

O GitHub (`main`, commit `ee6d3c0`) também continha o layout antigo. As revisões administrativas estavam nas alterações locais, incluindo arquivos novos ainda não versionados. As mudanças remotas de marca, utilitários e documentação foram reunidas com as revisões locais na branch `codex/integrar-revisoes-administracao`. Nos conflitos de layout, foram preservados os requisitos desta conversa: modo claro, navegação azul escura, home de apresentação e novos fluxos. O selo SVG recebido do GitHub foi preservado.

## Conteúdo da versão

- A aplicação real está em `src/`; `prototipos/` é um estudo independente. A publicação usa `npm run build` e saída `dist`, explicitamente definidos no `vercel.json`.
- Administração em `/admin`, sem cabeçalho e rodapé públicos, navegação azul escura e acesso ao site. Listas e formulários de vagas, profissionais e empresas; gestão do blog; aparência persistida.
- Conta comum com menu lateral azul, menu público superior e sem administração para contas não provisionadas.
- Cada build gera `dist/version.json` com data, commit, indicação de mudanças locais e impressão digital das entradas de publicação. Não contém credenciais.

## Publicar e conferir

1. Revisar e enviar a branch ao GitHub; integrar na branch configurada como produção na Vercel. Um commit local não atualiza o site. A correção foi enviada no [PR #3, em rascunho](https://github.com/fegoes/ProjetoEmpregaSantana/pull/3). Não houve integração na main nem deploy de produção nesta rodada.
2. Confirmar na Vercel o repositório, branch e commit escolhidos, diretório raiz do projeto, comando `npm run build`, saída `dist` e variáveis `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Chave de serviço nunca vai no frontend.
3. Conferir o projeto Supabase de destino e seu histórico antes de aplicar as migrations pendentes. Esta versão precisa de 0021 (blog), 0022 (aparência) e 0023 (acesso administrativo), além das anteriores. Deploy do frontend não executa migrations. O provisionamento reservado está em [MODELOS_E_ACESSOS.md](MODELOS_E_ACESSOS.md).
4. Depois da publicação, gerar o build do mesmo código e comparar:

```sh
npm ci
npm run build
npm run verify:deploy -- https://emprega-santana.vercel.app
```

O verificador falha se o build local estiver desatualizado, se a identificação não existir no servidor ou se os códigos diferirem. `version.json` não usa cache. Esse resultado confirma a identidade do código; não comprova banco, permissões ou persistência.

5. Com contas de teste autorizadas, validar login, bloqueio do admin para conta comum, menu azul em desktop/celular e criação/edição/exclusão nos domínios publicados. Confirmar que aparência persiste após recarregar e que artigos publicados aparecem no blog. Reimplantar a função de sitemap quando necessário.

## Limites

Nenhuma conta real foi utilizada nesta investigação. O banco remoto não foi alterado nem suas migrations verificadas. A renderização local com API simulada não substitui a validação do ambiente publicado.

## Validação da integração

Build TypeScript/Vite aprovado; 18 testes Vitest e 15 verificações PostgreSQL isoladas aprovados; lint sem erros, com quatro avisos preexistentes. O build de produção foi servido localmente e verificado no Chrome em 390 e 1440px: nove rotas administrativas e duas verificações adicionais de conta comum/bloqueio do admin, total de 20, com API e sessão simuladas. Não houve erro de execução ou transbordamento horizontal detectado nessas verificações. A lateral retornou o token azul profundo, e o admin não exibiu cabeçalho ou rodapé público. O comparador aceitou o build local e recusou o deploy antigo sem identificação. Isso não valida persistência ou RLS do projeto remoto.

## Etapa de categorias e tipos

A extensão posterior de Configurações requer também `0024_admin_taxonomies.sql`. O manifesto de build inclui essa dependência; publicar o frontend não aplica a migration. Campos e regras estão em [CATEGORIAS_E_TIPOS.md](CATEGORIAS_E_TIPOS.md).
