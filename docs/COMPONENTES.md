# Componentes

Três camadas: primitivas (`ui/`), domínio (raiz de `components/`) e layout
(`layout/`, `brand/`).

## Primitivas — `src/components/ui/`

shadcn/ui estilo "new-york" sobre Radix: `badge`, `button`, `card`, `dropdown-menu`,
`input`, `label`, `separator`, `tabs`, `textarea`. Usam `data-slot` e `cn()`.

Em geral não se edita. A exceção deliberada é o **`button`**, que carrega a
identidade da marca:

| Variante | Quando usar |
|---|---|
| `cta` | **ação principal da tela — uma só.** Fundo laranja, label na tinta navy |
| `default` | ação secundária, confirmação de formulário. Azul com label branco |
| `outline` | ação terciária, filtro |
| `ghost` / `link` | navegação, ação leve |
| `destructive` | exclusão |

O laranja é a cor mais cara da paleta: se tudo é laranja, nada é. Ver
[IDENTIDADE_VISUAL.md](./IDENTIDADE_VISUAL.md) §3.

## Marca — `brand/Logo.tsx`

Fonte única do lockup, usada por Navbar, RootLayout e LoginPage.

```tsx
<Logo />                                        // selo + wordmark
<Logo variant="mark" size="lg" asLink={false} />  // só o selo
```

`variant`: `mark` | `full` · `size`: `sm` | `md` | `lg` · `asLink` embrulha em link
para a home. O selo vem de `public/brand/logo-mark.svg`; trocar a arte não exige
mexer em quem chama.

## Layout

| Componente | Responsabilidade |
|---|---|
| `layout/Navbar.tsx` | topo fixo, navegação, menu da conta |
| `layout/RootLayout.tsx` | casca da página, link "pular para o conteúdo", rodapé institucional (praça, fundação, links legais) |

## Cards de domínio

`VagaCard`, `AutonomoCard`, `EmpresaCard` compartilham a mesma anatomia: `rounded-2xl`,
tile de ícone 44px (ou logo/avatar), título, subtítulo, badges e metadados.

Decisões que valem para os três:

- **Realce de hover é só borda e sombra.** O `-translate-y` simultâneo em toda a grade
  era o que mais fazia a listagem parecer template.
- **Badge só aparece quando há rótulo conhecido.** Valor de enum fora do mapa não
  deve renderizar cápsula vazia.
- **`VagaCard` mostra recência** ("Publicada há 3 dias") via `publicadaHa`.
- Sem empresa associada, o rótulo é "Empresa não informada" — nunca atribuir a vaga
  ao próprio site.

## Apoio

| Componente | Para quê |
|---|---|
| `FeaturedCarousel` | faixa de destaques no topo do feed |
| `ImageCarousel` | galeria dentro do card e na página de detalhe |
| `ShowMoreGrid` | grade paginada no cliente, evita despejar dezenas de cards |
| `FeedFilterPanel` | painel lateral de filtros, ligado a `feedFilters.ts` |
| `EmptyState` | estado vazio com ícone, título e orientação |
| `StatusBadge` | status de candidatura — verde confirmado, azul em andamento, laranja atenção, vermelho encerrado |
| `InitialsAvatar` | iniciais em círculo com cor derivada do nome, restrita à paleta da marca |
| `CategorySelect`, `IconPickerField` | seleção de categoria e de ícone da vaga |
| `ImageUploadField`, `PhotoGalleryField` | upload único e galeria, sobre `lib/storage.ts` |
| `ExperienceEditor`, `EducationEditor` | blocos repetíveis do currículo (`jsonb`) |
| `RichTextEditor` | TipTap, para os campos `*_html` |
| `RichTextRenderer` | renderiza `*_html` **sanitizado com DOMPurify** — todo HTML vindo do banco passa por aqui |
| `JsonLd` | injeta dados estruturados, escapando `<` |

## Ao criar um componente

1. Cor só por token. Nada de hex.
2. Reaproveite a anatomia dos cards em vez de inventar outra.
3. Ícone decorativo leva `aria-hidden`; ícone que carrega sentido precisa de rótulo.
4. HTML vindo do banco **sempre** via `RichTextRenderer`.
