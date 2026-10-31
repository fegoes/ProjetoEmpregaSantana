// Metas do layout atual, não dimensões obrigatórias nem padrão universal.
export const IMAGE_RECOMMENDATIONS = {
 logo: { desktop:'512 × 512 px (1:1)', mobile:'512 × 512 px (1:1)', weight:'até 150 KB', detail:'Foto de perfil e logo permanecem quadrados. Prefira PNG para transparência; mantenha margens para os avatares circulares.' },
 banner: { desktop:'2560 × 1440 px (16:9)', mobile:'1280 × 1600 px (4:5)', weight:'desktop até 600 KB; móvel até 300 KB', detail:'O fundo preenche uma área variável e pode recortar. Use uma composição móvel própria e ajuste o foco para manter o assunto visível.' },
 cover: { desktop:'1536 × 1024 px (3:2)', mobile:'960 × 640 px (3:2)', weight:'desktop até 350 KB; móvel até 200 KB', detail:'A capa do blog ocupa até 768 px de largura; 1536 px atende densidade 2×. No móvel, a proporção 3:2 é mantida, sem exigir retrato.' },
 social: { desktop:'1200 × 630 px (1,91:1)', mobile:'1200 × 630 px (1,91:1)', weight:'até 300 KB', detail:'Redes sociais recebem a imagem desktop. A versão móvel vale apenas para a prévia interna; cada rede pode aplicar seu próprio recorte.' },
 content: { desktop:'1600 px de largura, altura proporcional', mobile:'960 px de largura, altura proporcional', weight:'desktop até 350 KB; móvel até 200 KB', detail:'Preserve a proporção do conteúdo. Diagramas e textos precisam permanecer legíveis; para ilustrações verticais, mantenha altura proporcional à largura.' },
 gallery: { desktop:'1920 × 1080 px (16:9)', mobile:'960 × 540 px (16:9)', weight:'desktop até 400 KB; móvel até 200 KB', detail:'Cards usam 16:9. Cabeçalhos de vagas e profissionais usam 21:9 no desktop: deixe espaço acima e abaixo do assunto para esse recorte. A versão móvel pode ter enquadramento próprio.' },
} as const
