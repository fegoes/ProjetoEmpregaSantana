# Referências de UX — EmpregaSantana

Pesquisa em **20/10/2026**. Referências de design vigentes: **Gupy, Infojobs e 99Freelas**. **FinGestão**, indicado pelo responsável pelo produto, orienta a narrativa da home em formato de pitch. O aprofundamento de Gupy e Infojobs, incluindo blog, painéis e responsividade, está em [ANALISE_GUPY_INFOJOBS.md](ANALISE_GUPY_INFOJOBS.md).

## Direção aprovada

**Todo o site e sistema em modo claro:** páginas públicas, cadastro, candidato, autônomo, empresa e administração. Fundos claros, cards brancos, texto escuro e contraste legível. Preservar Montserrat/Poppins e a paleta azul/laranja de [IDENTIDADE_VISUAL.md](IDENTIDADE_VISUAL.md). O tema do dispositivo não altera o produto. As referências inspiram organização e interação; as cores e grandes heros escuros de outros sites não definem a direção do EmpregaSantana.

## Método e limites

Leitura do README, PRD, identidade, rotas, componentes, hooks e migrations; navegação pública com Playwright/Chrome e consulta a páginas oficiais. Impeccable instalado como apoio de design; esta entrega é um levantamento de referências e propostas, sem nota de auditoria ou execução do fluxo completo `critique`.

| Referência e fonte | Evidência disponível nesta rodada | Limite |
|---|---|---|
| [99Freelas](https://www.99freelas.com.br/) | Home no navegador e [ajuda oficial](https://99freelas.zendesk.com/hc/pt-br/articles/360012174814-O-que-%C3%A9-a-99Freelas) | Publicação de projeto e propostas não executadas |
| [Infojobs](https://www.infojobs.com.br/) | Home no navegador e conteúdo público | Modal de cookies cobre parte da captura; listagem via consulta web retornou 403 |
| [Portal Gupy](https://portal.gupy.io/) | Home no navegador e [ajuda de candidaturas](https://suporte-candidatos.gupy.io/s/article/Acompanhe-todas-as-suas-vagas-em-um-so-lugar?language=pt_BR) | Etapas autenticadas analisadas pela documentação oficial, sem acesso ao painel |

Não foram criadas contas, enviadas candidaturas, publicados projetos ou realizadas contratações. Capturas locais estão em `output/playwright/` (ignoradas pelo Git); as fontes acima mantêm o estudo consultável sem essas imagens. A observação visual foi feita em desktop, 1200 × 665; responsividade das referências não foi validada nesta rodada.

## O que aproveitar de cada referência

### 99Freelas — intenções bem separadas

**Observado:** navegação distingue encontrar profissionais e encontrar trabalho, com ações diferentes para publicar projeto e trabalhar. A ajuda oficial descreve o encontro entre contratantes e freelancers.

**Proposta para o EmpregaSantana:** deixar “Procurar vagas”, “Encontrar autônomos” e “Publicar vaga” facilmente identificáveis. No cadastro, explicar cada papel sem impedir que a pessoa adicione outros depois, como o modelo aditivo já permite.

**Limite de escopo:** um sistema de propostas e leilão de orçamento não faz parte do fluxo atual de candidatura/contato. A inspiração é a separação de intenção; a operação regional continua simples.

### Infojobs — busca orientada à localização

**Observado:** formulário principal separa cargo/palavra-chave de localização; a home oferece áreas profissionais e acesso a informações de empresas.

**Proposta para o EmpregaSantana:** oferecer cidade de forma explícita na busca, com Santana do Ipanema como sugestão visível e editável. Mostrar título, empresa, cidade, modalidade e remuneração divulgada antes de abrir o detalhe. Oferecer categorias relevantes à região com contagens reais.

**Limite de escopo:** avaliações de empresas precisam de autoria, moderação e dados próprios. Logotipos e selos devem refletir empresas e verificações existentes; não simular reputação.

### Gupy — descoberta pública e clareza do processo

**Observado:** portal com busca, entrada para explorar todas as vagas, cadastro de currículo e ajuda. A documentação oficial descreve [acompanhamento de candidaturas](https://suporte-candidatos.gupy.io/s/article/Por-que-minha-candidatura-foi-encerrada?language=pt_BR) e [gestão de candidatos por etapas](https://suporte.gupy.io/s/suporte/article/Pessoa-Gestora-Gestao-de-pessoas-candidatas-na-Gupy?language=pt_BR).

**Proposta para o EmpregaSantana:** confirmar o envio com vaga e currículo utilizado, mostrar o status atual com explicação simples e deixar claro quando a próxima ação depende da empresa. No painel empresarial, priorizar revisão de candidatos e atualização de status.

**Limite de escopo:** usar os estados existentes (`enviada`, `em_analise`, `entrevista`, `aprovada`, `rejeitada`). Histórico de transições, mensagens e etapas personalizadas precisam de modelagem adicional. Não presumir contratação nem avanço automático.

## Confronto com o código atual

| Área | Estado observado no código | Evolução proposta |
|---|---|---|
| Home | Feed misto, busca, filtros e carrossel de destaques em `HomePage.tsx` | Tornar a intenção vaga/autônomo mais evidente e reduzir competição com a busca |
| Explorar | `ExplorarPage.tsx` guarda apenas `q` na URL; filtros ficam no estado local | Persistir filtros e localização na URL; preservar ao voltar do detalhe |
| Localização | `FeedFilterPanel` oferece somente “Somente remoto”; sem seletor de cidade | Cidade e região explícitas, com possibilidade de limpar |
| Cards de vagas | `VagaCard` mostra título, empresa, local e modelos de contratação/pagamento | Mostrar valor divulgado e data; `VagaCardData` ainda não declara os campos de salário |
| Cards de autônomos | `AutonomoCardData` recebe `hourly_rate`, mas o card não o exibe | Exibir valor por hora quando disponível e resumo permanente do serviço |
| Resumos | Cards revelam descrição em `group-hover` | Informação importante acessível também em toque e teclado |
| Busca de vagas | `useVagasPublicadas` usa `ilike` somente em `title` | Alinhar o alcance da busca à promessa de cargo/categoria/termo; definir consulta e paginação no servidor |
| Estados de busca | `ExplorarPage` não mostra erro e carregamento explicitamente; o feed da home mostra | Distinguir carregando, falha e nenhum resultado, com recuperação |
| Filtro remoto de autônomos | `filterAutonomos` não usa `remoteOnly` | Definir semântica com `serves_remote` e incluir o campo nos dados do card |
| Tema | Tokens claros já existiam e havia um bloco `.dark` sem alternador | Nesta rodada: modo claro fixado, bloco escuro removido e controles nativos claros |

Os caminhos citados ficam em `src/pages/public/`, `src/components/`, `src/hooks/` e `src/lib/feedFilters.ts`. Esta comparação resulta de leitura de código, não de testes autenticados com dados reais.

## Prioridades propostas e critérios de aceite

As prioridades abaixo são sugestões de produto, não funcionalidades entregues nesta rodada.

| Prioridade | Proposta | Critério de aceite para futura implementação |
|---|---|---|
| Alta | Busca regional e filtros persistentes | Cidade editável; atualizar a página e voltar do detalhe mantém os filtros; limpar restaura resultados |
| Alta | Cards informativos | Dados essenciais visíveis sem hover; salário respeita `salary_visible`; ausências não viram preço zero |
| Alta | Estados claros na busca | Carregamento, erro e vazio distintos; erro oferece tentar novamente sem apagar busca |
| Alta | Retorno da candidatura | Login retorna à vaga; envio mostra confirmação ou erro; envio repetido não duplica candidatura |
| Média | Perfil público do autônomo | Serviço, área, cobrança, portfólio e CTA de contato claramente organizados |
| Média | Status compreensíveis | Candidato entende o estado atual; empresa consegue atualizá-lo com retorno de sucesso/falha |
| Exploração | Lista e detalhe no desktop | Comparar com navegação atual; no celular, voltar mantém busca e posição |

Em todas as evoluções: modo claro em 360, 768 e 1440 px; sem rolagem horizontal; foco visível; nomes acessíveis; mensagens legíveis; ações por toque e teclado. Validar contraste, textos longos, dados incompletos, rede lenta e estados vazios. Métricas sugeridas para avaliar depois: tempo para encontrar uma oportunidade, buscas sem resultado, abertura de detalhes e conclusão de candidatura, sem estabelecer metas fictícias.


## Decisões adicionais de 20/10/2026

- Responsividade obrigatória em todas as telas, com reflow, teclado, toque e zoom, conforme a matriz do [estudo aprofundado](ANALISE_GUPY_INFOJOBS.md#12-responsividade--requisito-para-toda-a-plataforma).
- Área logada com menu global do site no topo e opções do usuário em menu lateral à esquerda; em telas pequenas, navegações recolhidas e identificadas separadamente.
