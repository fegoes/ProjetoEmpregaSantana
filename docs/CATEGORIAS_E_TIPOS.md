# Categorias, tipos e cadastros administrativos

As configurações ficam em `/admin/configuracoes/categorias` e `/admin/configuracoes/tipos`, dentro do menu Configurações. Acesso reservado aos administradores já provisionados. A implementação estende o painel claro e a navegação azul escura.

Categorias usam a tabela existente `categories`: vagas, profissionais autônomos, empresas ou compartilhadas entre vagas e profissionais. Empresas passam a ter `category`, preservando o texto livre `sector` como detalhamento; nenhum setor antigo foi convertido automaticamente.

Tipos usam `record_types`, com área de uso específica. Nas vagas representam contratação: CLT, PJ, Temporário e Freelance são preservados; outros podem ser cadastrados. Nas empresas e nos profissionais são classificações opcionais em `type_slug`. “Oportunidades” continua sendo o domínio de vagas, sem uma tabela duplicada. Forma de pagamento e situação de publicação mantêm suas regras próprias.

Cada item tem nome, identificador, área e disponibilidade. Nome e disponibilidade podem ser editados. Identificador e área são imutáveis na interface e no banco. Desativação impede novas associações, preservando cadastros existentes e sua edição. Exclusão depende da ausência de vínculos; em uso, a interface orienta desativar ou reclassificar. Para renomear um nome visível, edite o nome, sem criar outro identificador.

Os cadastros administrativos foram agrupados em identificação/conteúdo, classificação, localização/atendimento, remuneração e publicação. UF usa lista; remuneração mostra apenas os campos compatíveis; publicação de vaga exige descrição; prazo opcional é convertido do horário local para UTC. Profissional/empresa exigem vínculo com conta existente. O proprietário da empresa continua imutável no editor.

Tipos de contratação configurados aparecem no formulário da empresa, no filtro do catálogo e nos rótulos das vagas. Categoria/tipo de empresa também aparecem no cadastro e perfil da empresa, e o tipo de profissional no seu editor. Categorias inativas selecionadas são preservadas em edições; categorias de empresa não aparecem no filtro de vagas/serviços. O filtro na URL aceita os novos códigos de contratação.

## Banco e publicação

Aplicar a migration `0024_admin_taxonomies.sql` depois das migrations anteriores, no projeto correto. Ela adiciona as classificações de empresa e tipos, substitui o check fechado de contratação por chave estrangeira e valida domínio/atividade nas associações. `record_types` tem leitura pública e escrita administrativa por RLS. As categorias conservam a política administrativa existente. A migration não concede administração a ninguém.

Sem essa migration, a tela informa falha de carregamento e não apresenta formulário administrativo pronto para salvar. Este checkout não possui conexão real para aplicá-la ou validar dados remotos. Testes com PGlite exercitam a migration real em PostgreSQL isolado; navegador usa rede e contas simuladas.

A gestão de classificações aberta a partir de um cadastro usa uma nova aba, explicitamente indicada no link. O cadastro em andamento é conservado. Ao voltar, use “Atualizar opções” para carregar categorias e tipos recém-criados sem recarregar o formulário. O provedor de autenticação ignora notificações `SIGNED_IN` repetidas com o mesmo token e usuário já validados; novos tokens, troca de conta, atualização explícita do perfil e saída continuam revalidando/limpando acesso. Isso evita remontar o editor ao alternar abas sem alterar as políticas do banco.

## Validação desta etapa

- Build TypeScript/Vite aprovado; 25 testes Vitest aprovados, incluindo troca de conta, revalidação com novo token, sessão repetida, identificadores, disponibilidade e filtros dinâmicos.
- 32 verificações em PostgreSQL isolado: 15 de acesso reservado e 17 da migration0024. Não equivale a executar todo o schema ou validar o Supabase remoto.
- Chrome no build de produção: cinco telas em 320, 390, 768 e 1440px, total de 20 capturas sem transbordamento horizontal detectado; mais dois estados de falha de carregamento. Sessão e API simuladas.
- Fluxos de criação/edição/exclusão de classificações, vínculo em vaga/empresa, preservação de inativos, erro de salvamento conservando campos e atualização das opções em duas abas exercitados com API simulada. Rótulo de contratação atualizado também conferido na vaga pública e novo código preservado na URL da busca.
- Lint sem erros, com quatro avisos preexistentes de Fast Refresh.

Não houve migração nem alteração de dados em produção nesta etapa. A persistência e as permissões reais continuam dependendo da aplicação e validação da migration0024 no ambiente correto.

A revisão visual inicial das 20 capturas apontou dois ajustes: continuidade do cadastro ao gerenciar classificações e linguagem do erro de carregamento. Ambos foram corrigidos; a rodada de veredito considerou os dois resolvidos, usando as 22 recapturas. Esse veredito cobre esses ajustes, não certifica toda a aplicação. A comparação da extensão com o sistema vigente preservou `DESIGN.md` e seu sidecar, pois não houve novos tokens ou regras globais.
