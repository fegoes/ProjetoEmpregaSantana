# Documentação do EmpregaSantana

Marketplace de trabalho de Santana do Ipanema — AL. Vagas fixas e temporárias de
empresas, mais profissionais autônomos disponíveis para contratação direta.

Navegação pública e aberta: qualquer visitante vê vagas e autônomos sem conta.
Cadastro só é exigido para **agir** — candidatar-se, contratar, publicar.

## Índice

| Documento | Para quê |
|---|---|
| [PRD.md](./PRD.md) | Produto e requisitos: personas, regras de negócio, fases, monetização |
| [ARQUITETURA.md](./ARQUITETURA.md) | Stack, estrutura de pastas, fluxo de dados, rotas, build |
| [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md) | Tabelas, colunas, RLS, migrations, storage |
| [HOOKS.md](./HOOKS.md) | Todos os hooks de dados e de UI, com assinatura e chave de cache |
| [COMPONENTES.md](./COMPONENTES.md) | Componentes de domínio, layout e primitivas |
| [FUNCOES.md](./FUNCOES.md) | Utilitários de `src/lib` |
| [IDENTIDADE_VISUAL.md](./IDENTIDADE_VISUAL.md) | Marca, paleta, tipografia, tokens e regras de acessibilidade |
| [ESTADO_DA_IDENTIDADE.md](./ESTADO_DA_IDENTIDADE.md) | **Leia antes de mexer em cor.** As duas linhas de identidade que convivem hoje, os conflitos entre elas e o que depende de decisão |
| [DEBITO_DE_DESIGN.md](./DEBITO_DE_DESIGN.md) | Crítica de design de 2026-10-16 (17/40) como lista acompanhável, com o status de cada item |

## Começando

```bash
npm ci
cp .env.example .env.local   # preencher com as credenciais do Supabase
npm run dev
```

⚠️ **O passo do `.env.local` não é opcional.** Ele está no `.gitignore` (via
`*.local`), então todo clone novo começa sem ele. Sem `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` o app não carrega vaga, perfil nem autenticação — e até
a correção de outubro/2026 isso aparecia como **página totalmente em branco**,
com a única pista no console do navegador.

Hoje a falta de credencial avisa em dois lugares: uma linha amarela no terminal
ao subir o `npm run dev`, e uma tela explicando o que configurar. Em produção as
variáveis são embutidas no bundle pelo Vite, então mudá-las exige novo deploy.

Scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `lint`, `test`.

## Convenções que valem para o projeto inteiro

- **Nenhuma cor crua em componente.** Toda cor sai de token em `src/index.css`.
  `grep -rE "#[0-9a-fA-F]{6}|rgb\(|hsl\(" src/` deve retornar só esse arquivo.
- **Tailwind v4 CSS-first.** Não existe `tailwind.config.js`; os tokens vivem em
  `@theme inline` dentro de `src/index.css`.
- **Texto e UI em português.** Inclusive nomes de função de domínio.
- **Migrations são imutáveis.** Correção entra como migration nova, nunca editando
  uma já aplicada.

- [Unificação das branches](UNIFICACAO_BRANCHES.md)
- [CRUD do superadmin e editor do blog](SUPERADMIN_CRUD_E_BLOG.md)

- [Cadastro público, SEO e edição visual](CADASTRO_PUBLICO_SEO_EDITOR.md)
- [Orientações de imagens e fotos](IMAGENS_E_FOTOS.md)
- [Fotos e galeria privada dos usuários — migration 0039](GALERIA_USUARIOS.md)
- [Especificação técnica e campos separados desktop/móvel — migration 0040](IMAGENS_RESPONSIVAS.md)
- [Cadastros por modal no superadmin](MODAIS_SUPERADMIN.md)
- [Prévia dos posts em desktop e celular](PREVIA_POSTS_DISPOSITIVOS.md)
- [Editor integrado de páginas, seções e cores](EDITOR_SECOES_CORES.md)
- [Posts com seções e formatação por seleção](EDITOR_POSTS_SECOES_FORMATACAO.md)
- [Imagens dos posts enviadas ao salvar](IMAGENS_POST_SALVAMENTO.md)
- [Envio de imagens por arquivo local ou link](ENVIO_IMAGENS_LOCAL_LINK.md)
- [Campos de imagens por cadastro e visualizador sem cortes](CAMPOS_IMAGENS_E_VISUALIZADOR.md)
- [Edição completa da empresa: superadmin e empresário — migration 0041](GESTAO_EMPRESA_SUPERADMIN_EMPRESARIO.md)
