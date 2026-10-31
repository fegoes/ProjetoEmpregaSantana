# Envio de imagens: arquivo local ou link

Os campos compartilhados agora iniciam em **Enviar arquivo**, com o seletor de arquivos visível. **Usar link** oferece um campo HTTPS e o botão **Importar imagem do link**. As opções se aplicam a desktop e móvel, blog/blocos, páginas, fotos de perfil, logos, portfólios e galerias. Imagens já cadastradas são preservadas.

A importação por link baixa a imagem no navegador e a envia pelo mesmo fluxo do upload local. Ela fica no armazenamento do sistema em vez de depender permanentemente do endereço externo. Isso permite associar versões desktop/móvel de arquivos pertencentes à conta. Na galeria privada, o arquivo é salvo na pasta privada do usuário; não é convertido em imagem pública.

Somente JPG e PNG, até 5 MB. Downloads remotos são limitados por tamanho informado e bytes recebidos, com prazo de 15 segundos. O conteúdo inicial precisa corresponder a JPEG ou PNG: páginas HTML, mesmo com nome .jpg, são recusadas. Cookies não são enviados para a origem externa.

O servidor externo deve permitir o acesso pelo navegador (CORS); páginas de compartilhamento ou imagens com login podem não permitir importação. Nesses casos, o campo apresenta o erro e orienta baixar a imagem e enviá-la localmente. Não há proxy remoto para contornar essa restrição. Endereços informados são preservados quando houver falha. Em posts, o salvamento fica bloqueado durante todo o download e upload.

Não há nova migration. Galeria privada e variantes por dispositivo continuam dependendo das migrations 0039 e 0040 já documentadas.

Validação: build, lint, suíte de 230 testes e navegador com armazenamento/rede simulados. Testados seleção de arquivo PNG local, importação HTTPS, atualização da prévia e largura de 390 px sem overflow. Nenhum arquivo de teste foi enviado ao armazenamento de produção.
