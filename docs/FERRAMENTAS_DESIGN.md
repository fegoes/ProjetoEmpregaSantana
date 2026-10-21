# Ferramentas de design e pesquisa

Instaladas no projeto em **20/10/2026**, como dependências de desenvolvimento com versões fixadas no `package-lock.json`:

| Ferramenta | Versão | Uso |
|---|---|---|
| Impeccable | 4.7.0 | Skill de design e detector de padrões de UI |
| Playwright CLI | 0.1.22 | Navegação, snapshots e capturas para pesquisa |
| Playwright | 1.64.1 | Automação do navegador e disponibilidade da API no projeto |

## Instalação e uso

```bash
npm ci
npm run design:install
npm run design:scan
npm run browser -- --help
```

O [instalador oficial do Impeccable](https://github.com/pbakaus/impeccable) instala a skill local em `.agents/skills/impeccable/`. A instalação foi feita para Codex, sem hooks automáticos. Binários baixados ficam ignorados no Git; o launcher os obtém quando necessário. A skill estará disponível para descoberta em uma nova sessão; neste trabalho suas instruções foram lidas diretamente. Os documentos de produto e identidade existentes continuam sendo a referência do projeto.

```bash
mkdir -p output/playwright
npm run browser -- -s=pesquisa open https://www.infojobs.com.br --headed
npm run browser -- -s=pesquisa snapshot
npm run browser -- -s=pesquisa screenshot --filename=output/playwright/infojobs.png
npm run browser -- -s=pesquisa close
```

O [Playwright](https://playwright.dev/docs/browsers) depende de um navegador compatível. Nesta máquina, o download do Chromium da versão 1.64.1 retornou `Playwright does not support chromium on mac13`. A pesquisa foi executada com sucesso pelo CLI usando o **Google Chrome já instalado**. Em um sistema operacional suportado, `npx playwright install chromium` instala o Chromium compatível. Não é necessário instalar a CLI globalmente.

## Evidências desta pesquisa

Capturas desktop de Infojobs, 99Freelas e Portal Gupy em `output/playwright/`; snapshots e logs operacionais em `.playwright-cli/`. Ambas as pastas são locais e ignoradas pelo Git. A captura do Infojobs contém seu modal de cookies.

Para repetir a análise, abrir as URLs de [REFERENCIAS_UX.md](REFERENCIAS_UX.md), capturar o estado atual e registrar data, tamanho de tela e eventuais bloqueios. Não inferir sucesso em páginas protegidas a partir de screenshots da home.

## Modo claro do produto

A aplicação declara `color-scheme: only light` no CSS e no HTML, usa um único conjunto de tokens claros e não mantém variantes `.dark`. Essa decisão vale para o site e todos os painéis, mesmo quando o dispositivo está configurado para tema escuro.

## Validação da entrega

- `npm run build`: aprovado.
- `npm run test -- --run`: 2 testes existentes aprovados.
- `npm run lint`: sem erros; 4 avisos de Fast Refresh em `badge`, `button`, `AuthContext` e `EmpresaContext`.
- `npm run design:scan`: 95 arquivos examinados por correspondência de padrões, sem achados reportados. O próprio detector informa que contraste e outras verificações de página renderizada não são cobertos por essa execução.
- Login conferido visualmente em 1200 × 665 e 390 × 844 com preferência de tema escuro emulada: permaneceu claro, `color-scheme` calculado `light only`, sem transbordamento horizontal nessas duas larguras. Execução local com configuração Supabase fictícia apenas para renderização; autenticação e painéis com dados reais não foram testados.
- O npm reportou 34 vulnerabilidades na árvore completa durante a instalação (1 baixa, 27 moderadas, 4 altas, 2 críticas). Não foi executado `npm audit fix`; a origem e a correção dessas ocorrências precisam de análise própria.


A rodada aprofundada de Gupy e Infojobs está em [ANALISE_GUPY_INFOJOBS.md](ANALISE_GUPY_INFOJOBS.md). As capturas e snapshots adicionais ficam em `output/playwright/gupy-infojobs/`.
