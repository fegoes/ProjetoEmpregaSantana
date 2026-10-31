# Cadastros por modal no superadmin

- Categorias e tipos: botões para criar e editar em modal na gestão de configurações.
- Cadastros de vagas, empresas e autônomos: botões junto aos campos de categoria e tipo abrem cadastro rápido. A área já vem definida pelo formulário; após salvar, o item é selecionado e as listas são atualizadas sem perder os demais dados.
- Posts do blog: nova categoria diretamente no editor, selecionada após salvar.
- Categorias do blog: criação e edição em modal.
- Páginas: Nova página abre modal e, após criar o rascunho, segue ao editor visual.
- Planos e ADS: criação e edição em modal.
- Seleções: criação e edição de situação/etapa em modal, mantendo as regras e registros de auditoria existentes.

Modais usam Radix Dialog, título e descrição acessíveis, foco preso ao diálogo, Escape/cancelamento, rolagem em telas pequenas e bloqueio de fechamento/envio durante salvamento. Clique no fundo não descarta o formulário. Erros mantêm os campos e são apresentados dentro do diálogo. Envios de formulários em portais não propagam para o cadastro principal.

Sem migrations novas: utiliza tabelas, RPCs e permissões existentes. Status fixos e suas transições continuam com as regras do domínio; o cadastro rápido trata as classificações editáveis.

Validação: suíte de 220 testes, incluindo criação contextual, identificador duplicado, preservação de campos e prevenção do envio do formulário principal. Navegador com dados sintéticos: criação em cadastro de vaga, seleção automática de categoria, rota preservada e modal em 390 px sem overflow. Nenhum cadastro de produção foi criado durante a validação visual.
