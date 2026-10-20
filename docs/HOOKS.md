# Hooks

Todo acesso a dados passa por um hook em `src/hooks/`. Componente não chama
`supabase` direto — assim a query key fica num lugar só e a invalidação é previsível.

Convenção de query key: `[recurso, escopo, parâmetro]`. Ex.: `['vagas', 'detail', id]`.

## Vagas — `useVagas.ts`

| Hook | Query key | Retorna |
|---|---|---|
| `useVagasPublicadas(filters?)` | `['vagas','list',filters]` | vagas com `status = 'published'`, ordenadas por `created_at` desc, com a empresa embutida |
| `useVaga(id)` | `['vagas','detail',id]` | uma vaga com dados da empresa; desabilitado sem `id` |

## Vagas da empresa — `useEmpresaVagas.ts`

Área logada: inclui rascunho e pausada, que `useVagasPublicadas` não traz.

| Hook | Tipo | Observação |
|---|---|---|
| `useEmpresaVagas(empresaId)` | query `['vagas','by-empresa',id]` | todas as vagas da empresa |
| `useSaveVaga()` | mutation | cria ou atualiza; invalida `by-empresa` e `list` |
| `useDeleteVaga()` | mutation | invalida `by-empresa`, `list` e `['admin','vagas']` |
| `useVagaCandidaturas(vagaId)` | query `['candidaturas','by-vaga',id]` | candidaturas recebidas |
| `useUpdateCandidaturaStatus()` | mutation | move o status da candidatura |

## Autônomos — `useAutonomos.ts`

| Hook | Query key | Retorna |
|---|---|---|
| `useAutonomosAtivos(filters?)` | `['autonomos','list',filters]` | perfis `status = 'active'` |
| `useAutonomo(id)` | `['autonomos','detail',id]` | um perfil |

## Empresas — `useEmpresas.ts`

| Hook | Query key | Retorna |
|---|---|---|
| `useEmpresasDiretorio(search)` | `['empresas','directory',search]` | diretório com busca por nome |
| `useEmpresasCount()` | `['empresas','count']` | `count: 'exact'`, sem trazer linhas |
| `useEmpresa(id)` | `['empresas','detail',id]` | perfil público, respeitando as flags `*_visible` |
| `useEmpresaAdmin(id)` | `['empresas','admin-detail',id]` | visão do admin, com campos que o público não vê |

## Currículos — `useCvVariants.ts`

| Hook | Tipo | Observação |
|---|---|---|
| `useCvVariants(candidatoId)` | query `['cv-variants',id]` | lista de variantes do candidato |
| `useCvVariant(id)` | query `['cv-variants','detail',id]` | uma variante |
| `useSaveCvVariant()` | mutation | invalida a lista do candidato |
| `useDeleteCvVariant()` | mutation | recebe `candidatoId` para saber o que invalidar |

## Conteúdo institucional — `usePaginasInstitucionais.ts`

| Hook | Tipo | Observação |
|---|---|---|
| `usePaginaInstitucional(slug)` | query `['paginas-institucionais','by-slug',slug]` | alimenta `/sobre`, `/termos`, `/privacidade`, `/lgpd` |
| `useAllPaginasInstitucionais()` | query `['paginas-institucionais','list']` | listagem do admin |
| `useSavePaginaInstitucional()` | mutation | invalida todo o namespace `paginas-institucionais` |

## Taxonomia — `useCategories.ts`

`useCategories()` — `['categories','list']`. Categorias compartilhadas entre vaga e
autônomo; `kind` diz a qual lado cada uma serve.

## UI — `useDocumentMeta.ts`

`useDocumentMeta({ title, description, image?, type? })` escreve `<title>` e as meta
tags por `useEffect`.

> Só funciona para quem executa JavaScript. Prévia de link e crawler sem JS veem os
> valores estáticos do `index.html` — é por isso que existe o `middleware.ts` de
> pré-renderização.

## Escrevendo um hook novo

1. Query key seguindo `[recurso, escopo, parâmetro]`.
2. `enabled: Boolean(id)` quando o parâmetro pode faltar — evita disparo com `undefined`.
3. Mutation invalida **todas** as keys afetadas, inclusive as do admin.
4. Nunca filtre por permissão no cliente. Quem decide o que volta é a RLS.
