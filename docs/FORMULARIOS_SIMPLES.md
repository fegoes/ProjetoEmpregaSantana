# Formulários simples

O padrão compartilhado mostra dados essenciais no formulário e usa botões com ícone, nome curto e resumo para textos longos, imagens e itens repetidos. O modal “Concluir” volta ao formulário; o botão principal de salvar/publicar continua responsável pelo cadastro. Fechar o modal mantém as alterações no estado do formulário.

## Aplicação por área

- Conta pública: escolhas de perfil compactas com ícones; nome, telefone, e-mail e senha continuam identificados e visíveis.
- Currículos: novo currículo pede nome em modal; contatos ficam visíveis; endereço, interesses, resumo, experiência, formação e habilidades ficam em seções. Experiências e formações são editadas uma por vez em modal. Fotos e resumo usam os editores compartilhados.
- Vagas: título, categoria e local em foco; remuneração e etapas ficam recolhidas. Descrição usa o editor de texto em modal e fotos abrem um único gerenciador.
- Empresas e autônomos: logo, capa, fotos e textos longos usam os modais compartilhados. Informações institucionais, valores e dados complementares ficam recolhidos. Onboarding de empresa começa pelo nome; demais dados ficam em seção.
- Superadmin: grupos complementares do cadastro de empresas, vagas e profissionais ficam recolhidos. AdminFields aplica a mesma separação nos formulários compartilhados de usuários, candidatos, categorias e cadastros comerciais.
- Segurança: senha da conta abre em modal; definição administrativa de senha e confirmações usam os modais existentes. Novas remoções de experiências, formações, imagens e etapas pedem confirmação própria da plataforma.

Campos obrigatórios de seções recolhidas são revelados ao validar; campos e valores permanecem no DOM/estado do formulário. Botões de modais não submetem acidentalmente o formulário externo. Durante upload, o modal bloqueia fechamento e novas ações.

## Texto de orientação

Orientações longas de vagas, currículos e imagens foram removidas ou reduzidas. O seletor de imagens informa apenas **PNG ou JPEG · até 5 MB por imagem**. Dimensões técnicas por finalidade ficam em “Dimensões recomendadas”. Os campos computador e celular permanecem separados. Mensagens de erro e consequências das exclusões são mantidas.

## Posts

Novas postagens começam com um editor de texto contínuo. Não exigem criar seções ou blocos. A barra usa ícones de formatação e o texto aceita imagens, galerias, slides, vídeos e anúncios entre os parágrafos. As mídias são inseridas por modal e selecionadas no texto para edição. As configurações de endereço, resumo e publicação ficam recolhidas.

Posts salvos em seções/blocos continuam com o editor compatível; não há conversão nem perda automática de cores, layout ou conteúdo antigos. A prévia desktop/celular e o envio de imagens apenas no salvamento dos posts continuam disponíveis.

## Validação e publicação

Testes verificam abertura de campos inválidos, preservação de dados ao fechar/reabrir modais, envio móvel separado, inserção e validação de mídia, preservação de posts antigos e sanitização de galerias com blobs locais conhecidos. Playwright usa componentes reais com Auth/REST simulados para conta, currículo, vaga e post; não envia cadastros, e-mails, arquivos ou alterações reais ao banco.

Sem migration. Alterações locais, sem commit ou publicação remota.
