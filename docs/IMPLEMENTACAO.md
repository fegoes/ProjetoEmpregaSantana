# Implementação da direção visual e dos fluxos conectados

Em 20/10/2026, o responsável autorizou implementar a direção dos protótipos. O código funcional está em `src/`; o estudo navegável em `prototipos/` permanece independente.

## Entregue em código

- Home como apresentação do projeto, com alternância entre os três públicos, caminhos reais e consultas ao catálogo. Sem catálogo disponível, a home explica o serviço sem inventar oportunidades.
- Modo claro em toda a aplicação; mesma identidade oficial nos componentes novos e existentes.
- Menu global no topo e menu do usuário à esquerda nas rotas privadas, organizado pelos papéis. Em telas menores, menu global e painel abrem controles independentes.
- Busca por termo/cidade e filtros preservados na URL. Cards mostram resumo e remuneração quando divulgada, sem depender de hover.
- Resumo do candidato consultado, formulários de conta/empresa/autônomo com retorno de salvamento, melhorias em currículos, vagas e candidaturas. Vagas podem ser publicadas, pausadas ou encerradas; exclusões têm confirmação.
- Blog público, categorias e leitura do artigo; administração de artigos com rascunho, editor, prévia privada, publicação, arquivamento e exclusão.
- HTML editorial sanitizado na renderização, metadados, canonical de artigos, resposta para bots sem JavaScript e entradas no sitemap.

As operações de banco usam os hooks e o cliente Supabase existentes. A interface não adiciona persistência fictícia ou autenticação de demonstração. Planos/cobrança, ADS e gestão de categorias conservam o escopo anterior; veja [CRUD_E_INTEGRACAO.md](CRUD_E_INTEGRACAO.md).

## Configurar o ambiente real

1. Copiar `.env.example` para `.env.local` e preencher `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do ambiente de teste. Não colocar chaves privilegiadas no frontend.
2. Confirmar o projeto Supabase e aplicar as migrations pendentes na ordem do repositório, incluindo `supabase/migrations/0021_blog_articles.sql`, usando o fluxo já adotado pelo projeto. Se usar a CLI vinculada, conferir o destino antes de `supabase db push`.
3. Executar `npm ci` e `npm run dev`.
4. Entrar com usuários de teste de cada papel. A gestão editorial exige `profiles.is_admin = true`; leitura pública exige artigo publicado e data de publicação atingida.
5. Validar criação, edição, recarregamento e exclusão/arquivamento nos dados persistidos e as políticas RLS entre usuários distintos. Reimplantar a função de sitemap no fluxo habitual quando publicar o ambiente.

A migration cria `artigos`, índice de publicação, timestamp automático e políticas: público lê publicados com data atingida; administração pode gerenciar. O conteúdo não recebe artigos fictícios por seed.

## Validação e limites

O checkout não possui configuração real de Supabase. Não houve execução de migrations, alteração de dados reais ou deploy. O servidor usado em QA recebe credenciais fictícias somente no processo e interceptações externas de rede; isso não configura o produto.

Build, lint e testes automatizados verificam código. A revisão visual usa Chrome com respostas de API simuladas, incluindo sessão sintética; não demonstra segurança de RLS ou persistência real. Evidências de interface ficam em `.impeccable/review/implementation/` (ignoradas pelo Git).

A validação com banco conectado continua necessária antes de disponibilizar os novos fluxos em produção. A ausência de configuração não transforma as telas de erro em conteúdo de demonstração.

### Resultado desta rodada

- `npm run build`: aprovado (TypeScript e Vite).
- `npm run lint`: sem erros; quatro avisos preexistentes de Fast Refresh em componentes/contextos.
- `npm run test -- --run`: cinco testes aprovados, incluindo persistência dos filtros na URL e compatibilidade de pagamento/remoto.
- Middleware verificado separadamente com TypeScript; a função Deno de sitemap não foi executada no ambiente real.
- Chrome: dez telas em seis larguras (320, 390, 768, 1024, 1440 e 1920px), total de 60 verificações sem transbordamento horizontal ou erros de execução detectados após corrigir o cabeçalho de 320px. Telas: home, busca, blog, artigo, vaga, currículos, candidaturas, conta, vagas da empresa e artigos no admin.
- Home sem catálogo: três públicos em 320, 390 e 1440px (nove verificações adicionais), sem transbordamento; ações internas outline e fechamento azul preservam prioridade do CTA principal.
- Fluxos com API simulada: CRUD editorial com prévia e publicação; currículo com erro de salvamento preservando campos e posterior exclusão; vaga com rascunho, publicação, pausa e exclusão; proteção da administração para visitante e gaveta do painel no celular.
- Revisão visual Impeccable: `disposition: ship` para o contrato e 12 capturas analisadas, após indicar seleção ativa dos resultados, remover etiqueta decorativa/capa repetida no artigo sem imagem e recapturar o editor com a página no topo. Uma checagem final de mais duas capturas da home sem catálogo também retornou `disposition: ship` para esses ajustes de hierarquia e reflow. Sem certificação de toda a aplicação ou dos estados em produção.

Os testes descritos não cobrem toda a matriz de dispositivos reais, Safari/Firefox, leitores de tela, zoom ou permissões e persistência do banco conectado. As operações reais precisam da configuração e validação indicadas acima.


## Extensão administrativa posterior

A administração ganhou layout próprio inspirado em WordPress, sem cabeçalho/rodapé públicos, com lateral azul profunda e submenus. Foram adicionados CRUDs administrativos de vagas, perfis profissionais e empresas, e configuração de aparência persistida. Usuários comuns também têm lateral azul profunda. Blog e demais rotas continuam disponíveis.

Aplicar também a migration0022 (`site_appearance`) no projeto correto antes de validar a configuração global. Não houve execução de migrations neste checkout. Veja [ADMINISTRACAO.md](ADMINISTRACAO.md) para rotas, regras e limites.


## Acesso administrativo reservado

Somente contas explicitamente provisionadas recebem administração. O cadastro público nunca concede esse acesso; o painel de usuários não oferece promoção a admin. A migration0023 reforça a proteção no banco e retira o privilégio da fixture administrativa antiga. Modelos, regras, testes e provisionamento por UUID estão em [MODELOS_E_ACESSOS.md](MODELOS_E_ACESSOS.md). A migração ainda precisa ser aplicada no ambiente real.
