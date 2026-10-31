# Edição da empresa por superadmin e empresário

O empresário mantém a edição das empresas às quais está autorizado no painel da empresa. O superadmin usa a gestão administrativa para editar qualquer empresa.

O formulário do superadmin contempla nome fantasia, razão social, CNPJ, responsável, categoria, tipo, setor, site, descrição, logo, capa, galeria de fotos, endereço, CEP, cidade, UF, missão/visão/valores, organograma, número de funcionários e controles de visibilidade. Situação, verificação e transferência de responsável continuam sendo ações administrativas. A gestão da equipe permanece na tela de detalhes da empresa.

No perfil do empresário, razão social, CNPJ e capa se juntam aos dados institucionais, endereço, logo e galeria já existentes. Uploads em andamento impedem o salvamento. A criação inicial também tem logo; vagas podem receber fotos antes do primeiro salvamento. Os arquivos são JPG/PNG, locais ou importados por link, com versões desktop/móvel.

## Migration obrigatória

Aplicar `0041_company_image_management.sql`, após 0039/0040 se ainda pendentes. Não foi executada no banco remoto pelo agente.

As permissões de variantes deixam de depender exclusivamente de quem fez o upload. O superadmin gerencia as imagens públicas. Responsáveis autorizados podem gerenciar as imagens que ficam na pasta da própria empresa/vaga. O titular também pode gerenciar as variantes da sua pasta de perfil/portfólio. A verificação usa a pasta real do objeto e a associação ao domínio; colar o link de outra empresa não transfere autoridade.

O superadmin pode enviar uma foto à pasta pública do usuário ao editar a conta. Na criação de usuário, os arquivos ficam temporariamente no formulário e só são enviados à pasta correta após a conta receber seu ID. Uma falha posterior não exige criar outra conta: a nova tentativa conclui a conta já criada. As permissões da galeria pessoal privada não incluem acesso geral de superadmin.

## Validação

232 testes da aplicação, build e lint sem erros. PostgreSQL isolado confirmou: empresário edita informações da própria empresa; moderação/verificação permanecem administrativas; superadmin altera empresa e variantes de arquivos de outro uploader; outra empresa não obtém acesso ao copiar o link; titular gerencia variante de foto enviada pelo admin; terceiros não enviam para a pasta de perfil de outra pessoa; galeria privada continua isolada, inclusive do administrador da aplicação.

Os testes visuais usam sessões e dados sintéticos, sem modificar empresas ou arquivos de produção.
