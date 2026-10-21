# Funções utilitárias (`src/lib`)

## `utils.ts`

| Função | Assinatura | Para quê |
|---|---|---|
| `cn` | `(...inputs: ClassValue[]) => string` | junta classes com `clsx` e resolve conflito de Tailwind com `tailwind-merge`. Toda composição de `className` passa por aqui |
| `stripHtml` | `(html, maxLength = 160) => string` | tira markup dos campos `*_html` para meta description e JSON-LD, que precisam de texto puro |
| `publicadaHa` | `(iso) => string \| null` | data relativa em português: `hoje`, `ontem`, `há 5 dias`, `há 3 meses`, e mês/ano acima de um ano. Devolve `null` para entrada ausente, inválida **ou no futuro** — em vez de escrever "há -3 dias" |
| `contarRecentes` | `(itens, dias = 7) => number` | quantos itens têm `created_at` dentro da janela. Usado para mostrar atividade real em vez de total acumulado |

As duas últimas existem porque recência é o principal sinal de vida de um mural de
vagas, e o projeto não tem (nem precisa de) biblioteca de data.

## `feedFilters.ts`

Filtragem do feed **no cliente**, sobre dados que a RLS já autorizou. É refinamento
de exibição, nunca controle de acesso.

| Export | Para quê |
|---|---|
| `EMPLOYMENT_TYPE_OPTIONS`, `PRICING_MODEL_OPTIONS` | rótulos dos filtros, espelhando os enums do banco |
| `FeedFilters`, `DEFAULT_FEED_FILTERS` | formato e estado inicial |
| `hasActiveFilters(filters)` | se há filtro aplicado — controla o botão "Limpar" |
| `toggleInList(list, value)` | adiciona/remove de lista de seleção múltipla |
| `filterVagas`, `filterAutonomos` | aplicam os filtros a cada coleção |
| `FeedItem` | união discriminada: `{ kind: 'vaga' }` ou `{ kind: 'autonomo' }` |
| `mergeFeed(vagas, autonomos)` | intercala os dois tipos num feed só — destaques primeiro, depois `created_at` desc |

## `categoryIcons.tsx`

Mapa de categoria → ícone lucide, mais o conjunto que a empresa escolhe à mão.

| Export | Para quê |
|---|---|
| `iconForCategory(slug)` | ícone da categoria; `Briefcase` como fallback |
| `VAGA_ICON_OPTIONS` | 20 opções rotuladas para o seletor manual |
| `iconForVaga(iconKey, category)` | prioriza o ícone escolhido pela empresa, cai para a categoria |

**Regra:** um glifo, um significado. Antes `Sparkles` era ao mesmo tempo "eletricista"
e o selo "Destaque", e `Hammer` servia a construção, pedreiro e marceneiro. Ao
acrescentar categoria, confira que o ícone ainda não está em uso.

## `storage.ts`

Bucket único `public-media`. Um helper por tipo de upload, cada um compondo o caminho
e devolvendo a URL pública:

`uploadEmpresaLogo` · `uploadVagaPhoto` · `uploadEmpresaInteriorPhoto` ·
`uploadVagaGalleryPhoto` · `uploadAutonomoPortfolioPhoto`

## `supabase.ts`

Cria o cliente tipado com `Database` de `src/types/database.ts`. Lê
`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` e falha com mensagem explícita se
faltarem — por isso o app não sobe sem `.env.local`.

## `queryClient.ts`

Instância única do `QueryClient`. Alterar política de cache aqui, não hook a hook.
