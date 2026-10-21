# Protótipos navegáveis — identidade aplicada

Estudo local criado em **20/10/2026** a partir das decisões do responsável pelo projeto. Demonstra identidade visual, organização de páginas e interações; não substitui a aplicação em `src/`.

## Abrir

```bash
npm ci
npm run prototype
```

Abrir o endereço impresso pelo Vite, normalmente `http://127.0.0.1:4174/`. Se a porta estiver ocupada, usar a porta indicada no terminal. Para gerar a versão estática: `npm run prototype:build`; saída em `prototipos/dist/`.

## Páginas para avaliar

| Página | Caminho dentro do protótipo | O que demonstra |
|---|---|---|
| Home | `/#inicio` | Pitch regional, dificuldade, solução, públicos, funcionamento, dúvidas e chamada para começar |
| Identidade | `/#identidade` | Paleta oficial, tipografia, assinatura provisória e aplicação entre páginas |
| Vagas | `/#vagas` | Busca, cidade, filtros, ordenação, cards e estado vazio |
| Oportunidade | `/#vaga/loja` | Resumo, descrição e revisão antes da candidatura simulada |
| Autônomos | `/#autonomos` | Serviço, região, cobrança e perfil/contato demonstrativo |
| Painel | `/#painel` | Menu do site no topo; menu do usuário à esquerda; candidaturas e próximos passos |
| Currículos | `/#painel/curriculos` | Versões, prévia e edição demonstrativa |
| Candidaturas | `/#painel/candidaturas` | Status e retorno da candidatura simulada |
| Empresa | `/#painel/empresa` | Vagas, contagens ilustrativas e revisão de candidatos |
| Autônomo logado | `/#painel/autonomo` | Edição demonstrativa do perfil de serviços |
| Conta | `/#painel/conta` | Campos pessoais e retorno de uma ação simulada |
| Blog | `/#blog` | Conteúdo em destaque, categorias e artigos |
| Artigo | `/#artigo/primeiro-curriculo` | Leitura, sumário e ação relacionada |

As URLs com `#` pertencem exclusivamente ao estudo e não alteram as rotas da aplicação principal.

## Decisões aplicadas

- **Home como pitch:** referência narrativa escolhida pelo responsável: [FinGestão](https://fingestao.vercel.app/). A home apresenta o projeto e demonstra seus caminhos antes de levar à área de busca. Não foram transferidas promessas comerciais, estatísticas ou funcionalidades da referência.
- **Identidade existente:** Montserrat/Poppins, azul e laranja oficiais, neutros claros e assinatura provisória do projeto. O selo vetorial oficial continua pendente, conforme [IDENTIDADE_VISUAL.md](IDENTIDADE_VISUAL.md).
- **Modo claro:** aplicado em todas as páginas e controles, inclusive com preferência escura do dispositivo.
- **Menus separados:** navegação global no topo e opções do usuário à esquerda no painel. Em celular, os botões Menu do site e Meu painel abrem gavetas independentes, com Escape e retorno do foco.
- **Referências funcionais:** organização de oportunidades e conteúdo inspirada no estudo de Gupy e Infojobs; 99Freelas permanece como apoio. Ver [ANALISE_GUPY_INFOJOBS.md](ANALISE_GUPY_INFOJOBS.md).

## Interações que podem ser experimentadas

Na home, alternar Quero trabalhar, Sou autônomo e Quero contratar. Na busca, combinar termo, cidade e contratação; testar um termo sem resultados e limpar. Em uma vaga ainda não simulada, escolher currículo, confirmar a simulação e ver a candidatura no painel. No blog, filtrar categorias, abrir artigo e usar o sumário. No celular, conferir os dois menus e os campos empilhados.

Todos os nomes de empresas/profissionais, vagas, salários e estados são **fictícios**. A navegação não autentica, publica, envia currículos, manda mensagens ou grava dados. Uma candidatura simulada altera apenas o estado em memória da página e desaparece ao recarregar. Os formulários demonstram composição e feedback; não devem ser usados como cadastro real. Fontes web são carregadas do Google Fonts, com fallback local de navegador.

## Verificação

- `npm run prototype:build`: aprovado; seis rotas conferidas na versão estática, com logos carregados e sem erros de execução.
- Checagem de 9 telas representativas em 320, 390, 768, 1024, 1440 e 1920 CSS px: 54 combinações sem transbordamento da página ou de títulos/controles e sem erros de execução detectados no Chrome.
- Capturas desktop em 1440 × 900 e celular em 390 × 844; home também capturada inteira. Modo claro conferido com preferência escura emulada.
- Interações conferidas: troca de papel da demonstração; busca vazia, limpeza e contratação; candidatura simulada refletida no painel; categoria de artigo; perguntas frequentes; gavetas independentes, Escape e devolução do foco.
- O detector do Impeccable indicou textos pequenos na primeira passagem. A escala funcional foi aumentada antes da recaptura; as capturas foram revisadas. A correção pedida para o detalhe mobile (identidade antes de remuneração/ação) foi conferida e resolvida. Esse parecer cobre os pontos revisados, não uma certificação de toda a plataforma.
- Evidências locais em `.impeccable/review/` e `output/playwright/`. Essas verificações não equivalem a testes completos em dispositivos reais, Safari/Firefox, leitor de tela, zoom ou toda a matriz de estados da aplicação em produção.

Este estudo permite aprovar composição e comportamento antes da implementação real. A aplicação funcional continua dependendo de seus próprios dados, autenticação, permissões, estados e testes.


## Integração funcional

O responsável reforçou que as telas precisam de CRUD conectado ao banco. O inventário de integrações existentes e pendentes está em [CRUD_E_INTEGRACAO.md](CRUD_E_INTEGRACAO.md). A direção visual também foi implementada nas rotas reais de `src/`, com hooks Supabase e tratamento de operações. Os arrays e confirmações locais deste estudo permanecem demonstrativos. Veja [IMPLEMENTACAO.md](IMPLEMENTACAO.md) para configuração e limites de validação.


## Administração e lateral azul escura — atualização

A prévia `/#admin` mostra a administração sem header público, com lateral azul profunda e telas demonstrativas de vagas, profissionais, empresas, blog e aparência. O acesso está também no menu do painel de exemplo. O painel comum `/#painel` mantém o menu superior do site e recebe lateral azul escura. Esses formulários seguem ilustrativos; os CRUDs conectados ficam nas rotas `/admin/...` do aplicativo. Consulte [ADMINISTRACAO.md](ADMINISTRACAO.md).
