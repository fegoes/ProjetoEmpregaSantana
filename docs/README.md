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

## Começando

```bash
npm ci
cp .env.example .env.local   # preencher com as credenciais do Supabase
npm run dev
```

Scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `lint`, `test`.

## Convenções que valem para o projeto inteiro

- **Nenhuma cor crua em componente.** Toda cor sai de token em `src/index.css`.
  `grep -rE "#[0-9a-fA-F]{6}|rgb\(|hsl\(" src/` deve retornar só esse arquivo.
- **Tailwind v4 CSS-first.** Não existe `tailwind.config.js`; os tokens vivem em
  `@theme inline` dentro de `src/index.css`.
- **Texto e UI em português.** Inclusive nomes de função de domínio.
- **Migrations são imutáveis.** Correção entra como migration nova, nunca editando
  uma já aplicada.
