# Imagens e posts ilustrados

Foram geradas três cenas pelo recurso integrado image_gen, usando nossa-gente.png como referência de estilo e personagens. São ilustrações, sem representação de usuários reais. Originais PNG preservados em public/illustrations/. As páginas usam cópias JPEG comprimidas, preservando a composição e reduzindo o download das três cenas. Prompts também embutidos nos arquivos.

## Aplicação

- Home: três cenas nos caminhos de candidatos, autônomos e empresas, em linhas alternadas no desktop e empilhadas no celular.
- Blog: capas temáticas quando o artigo não possui capa personalizada.
- Posts iniciais: os três textos em src/content/editorialDrafts.ts têm capa, imagem no corpo, textos alternativos e imagem social.
- Desenvolvimento: as três prévias ficam navegáveis em /blog, com aviso e noindex. Conteúdo publicado no banco prevalece pelo slug. Não entram como prévias no build de produção.
- Banco: 0027_editorial_illustrated_posts.sql publica os três textos, ou atualiza apenas rascunhos intactos da seed anterior. Não sobrescreve posts editados ou capas personalizadas. Aplicar após 0025 e após disponibilizar as imagens no domínio publicado. Nenhuma alteração remota executada nesta rodada.

## Prompts exatos

### curriculo.png

Use case: illustration-story. Asset type: editorial illustration for EmpregaSantana, a Brazilian local employment website. Input image 1 is STYLE AND CHARACTER REFERENCE only. Match its polished hand-painted editorial realism, friendly adult Brazilian characters, natural anatomy, blue/navy and orange clothing. Create a NEW scene in landscape 3:2 composition, pale warm ivory background with softly suggested environment, plenty of breathing room around heads and hands, all key subjects safely inside frame. Soft daylight, welcoming, dignified everyday work. No text, letters, logos, watermarks or interface mockups. The curly-haired woman in the white blouse from the reference is seated at a simple desk, thoughtfully preparing her resume on an open laptop, with a plain document and pen beside her. Three-quarter view, medium wide framing, modest home workspace, a small plant. Convey readiness for a new job.

### servicos.png

Use case: illustration-story. Asset type: editorial illustration for EmpregaSantana, a Brazilian local employment website. Input image 1 is STYLE AND CHARACTER REFERENCE only. Match its polished hand-painted editorial realism, friendly adult Brazilian characters, natural anatomy, blue/navy and orange clothing. Create a NEW scene in landscape 3:2 composition, pale warm ivory background with softly suggested environment, plenty of breathing room around heads and hands, all key subjects safely inside frame. Soft daylight, welcoming, dignified everyday work. No text, letters, logos, watermarks or interface mockups. The blue-shirted independent worker from the reference, with his neatly organized tool bag on a workbench, is photographing a completed wooden shelf with his smartphone to build his service portfolio. Medium wide framing inside a bright simple workshop. Show care, craft and professional confidence, no construction action or dangerous equipment.

### contratacao.png

Use case: illustration-story. Asset type: editorial illustration for EmpregaSantana, a Brazilian local employment website. Input image 1 is STYLE AND CHARACTER REFERENCE only. Match its polished hand-painted editorial realism, friendly adult Brazilian characters, natural anatomy, blue/navy and orange clothing. Create a NEW scene in landscape 3:2 composition, pale warm ivory background with softly suggested environment, plenty of breathing room around heads and hands, all key subjects safely inside frame. Soft daylight, welcoming, dignified everyday work. No text, letters, logos, watermarks or interface mockups. The orange-bloused business owner from the reference is welcoming a young adult Brazilian applicant across a small shop counter, discussing a plain document together. Medium wide framing, friendly eye contact, simple shelves and plant in background, warm local business setting. Convey a respectful hiring conversation.
