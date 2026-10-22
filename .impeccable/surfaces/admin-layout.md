---
version: 1
slug: admin-layout
primary_target: src/pages/admin/AdminLayout.tsx
related_targets: [src/components/layout/PanelLayout.tsx, src/pages/admin/ResourcePage.tsx, src/pages/admin/AparenciaPage.tsx]
---
# Administração e menus do usuário — modo Operate

Usuário fixou referência WordPress e solicitou menu lateral azul escuro, ausência do header público no admin, acesso ao site, aparência do site/sistema e CRUD de blog, vagas, profissionais e empresas. Usuários comuns também recebem lateral azul escura. Esta preferência altera a regra anterior de superfícies inteiramente claras apenas para a navegação; conteúdo e controles continuam claros.

THESIS: tornar a gestão reconhecível por navegação persistente por domínio, submenus de listagem/criação e formulários diretos.
OWN-WORLD: identidade oficial Montserrat/Poppins, azul profundo #0D3A66 na navegação, texto branco e azul claro com contraste; conteúdo claro, azul nos links e laranja na ação prioritária. Nenhuma identidade substituta.
STORY: escolher domínio no menu, consultar/filtrar cadastros, adicionar/editar e confirmar persistência ou erro. Aparência tem prévia local e salvamento global real.
FIRST VIEWPORT: desktop sem header público ou rodapé público no admin, lateral fixa e título/tarefa no conteúdo; celular com botão explícito de menu que abre drawer azul escuro com Escape e foco protegido.
FORM: code-first; organização fixada pelo usuário a partir do WordPress, adaptada ao produto e sem copiar sua marca. SEED REFERENCE: seed:3d480c23a1fb87e2 (rodada original deste projeto corroborada anteriormente; direção agora explicitamente fixada pelo usuário).
FINISH: revisão por capturas válidas e registro em DESIGN.md. Sem raster gerado. Dados de QA e protótipo são sintéticos; aplicativo usa Supabase. Migrations0021/0022 e RLS não foram verificadas em banco real neste checkout.

Fonte da referência funcional: https://wordpress.org/documentation/article/administration-screens/ . WordPress informa painel, conteúdo e aparência em sua navegação administrativa; a ausência do header público e o azul profundo são requisitos do usuário, não afirmações de cópia exata do WordPress.
