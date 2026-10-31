# Fotos e galeria dos usuários

Aplicar `supabase/migrations/0039_user_image_gallery.sql` antes de usar os novos uploads. A migration cria o bucket privado `user-gallery`, políticas que restringem cada pasta ao usuário autenticado, libera fotos de perfil em `public-media/profiles/{userId}` e restringe novos arquivos públicos a JPG e PNG, até 5 MB. Imagens antigas não são removidas.

- Minha conta (`/perfil`): foto de perfil para candidato e autônomo.
- Perfil de autônomo: foto de perfil e galeria de trabalhos existente.
- Minha galeria (`/perfil/galeria`): imagens pessoais privadas, upload, visualização com URLs temporárias e remoção; link no menu dos painéis. Não transforma automaticamente imagens pessoais em publicações.
- Superadmin > Posts do blog: imagem de destaque e imagens nos blocos continuam com upload. URLs novas devem apontar para JPG/PNG.
- Todos os campos compartilhados orientam Desktop 1920 × 1080 px e Móvel 320 × 480 px, somente JPG/PNG e 5 MB. Fotos de perfil/logo também sugerem 512 × 512 px. Dimensões são orientações, não bloqueio: o arquivo não é deformado. Esta alteração não adiciona dois arquivos por imagem nem troca automaticamente a arte conforme o dispositivo.

A galeria pessoal é separada das imagens públicas de posts, empresas e portfólios. O teste SQL local verifica que uma conta não consegue ler nem enviar arquivos na pasta de outra. Não foi aplicada migration no banco remoto pelo agente.
