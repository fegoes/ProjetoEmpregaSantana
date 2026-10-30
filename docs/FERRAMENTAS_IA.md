# Ferramentas de IA do projeto (Claude Code)

Skills, agentes e servidores MCP versionados no repositório, para que qualquer sessão do Claude Code (local ou na nuvem) aberta neste projeto já os encontre.

## Skills (`.claude/skills/`)

| Pacote | Origem | Skills |
| --- | --- | --- |
| **Impeccable** (pbakaus) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable), build para Claude Code, v4.6.0 | `impeccable` |
| **Emil Kowalski** | [emilkowalski/skills](https://github.com/emilkowalski/skills) | `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-performance`, `animation-vocabulary`, `apple-design`, `break-ui`, `mobile-native`, `pick-ui-library`, `prototype`, `ask-sonner`, `animate-expo`, `write-swift` |
| **Taste Skill** (Leonxlnx) | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `design-taste-frontend`, `design-taste-frontend-v1`, `redesign-existing-projects`, `high-end-visual-design`, `minimalist-ui`, `gpt-taste`, `image-to-code`, `imagegen-frontend-web`, `imagegen-frontend-mobile`, `industrial-brutalist-ui`, `stitch-design-taste`, `brandkit`, `full-output-enforcement` |

## Agentes (`.claude/agents/`)

Do Impeccable: `impeccable-finish-reviewer`, `impeccable-documenter`, `impeccable-asset-producer`, `impeccable-manual-edit-applier`.

## MCP

- **Playwright** (`.mcp.json`): navegador automatizado para testar e capturar telas. Já vem habilitado em `.claude/settings.json`. Por padrão usa o Google Chrome instalado na máquina.
- **Figma**: usado pela conexão do app (claude.ai → Conectores), não por `.mcp.json`.

### Playwright nas sessões na nuvem

O container da nuvem não tem Google Chrome, só o Chromium em `/opt/pw-browsers`. Para o MCP do Playwright funcionar lá, adicione estas variáveis de ambiente nas configurações do ambiente (menu do ambiente na barra de título da sessão → Editar):

```
PLAYWRIGHT_MCP_EXECUTABLE_PATH=/opt/pw-browsers/chromium
PLAYWRIGHT_MCP_HEADLESS=true
PLAYWRIGHT_MCP_SANDBOX=false
```

Localmente não é preciso definir nada.

## Atualizando

```bash
# Emil Kowalski e Taste Skill (rastreados em skills-lock.json)
npx skills update -p

# Impeccable (instalador oficial; mantém o formato do Claude Code, sem ligar hooks)
npx impeccable update --project --no-hooks
```

O instalador do Impeccable baixa de `impeccable.style`, que fica bloqueado na rede padrão das sessões na nuvem; rode a atualização localmente. A skill em si funciona na nuvem: o motor é baixado do GitHub Releases na primeira execução.

O Impeccable não fica no `skills-lock.json` de propósito: o `npx skills add` instala a variante genérica (caminhos de `.agents/` e sintaxe do Codex) e sem os agentes. A cópia aqui é a build para Claude Code do próprio repositório (`.claude/skills/impeccable` + `.claude/agents/`).

Os hooks automáticos do Impeccable (detector de design após cada edição) **não** foram ativados. Para ligar numa máquina: `/impeccable hooks on`.
