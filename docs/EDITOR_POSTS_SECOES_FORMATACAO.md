# Editor de posts

Todas as postagens usam texto contínuo, com barra de ícones para formatação, listas, cor e hiperlinks. Escreva diretamente e insira imagens na posição do cursor. Galerias, slides, vídeos e anúncios são inseridos por modal; para alterar uma mídia existente, selecione-a no texto e use “Editar mídia selecionada”. Não é necessário criar seções ou blocos antes de escrever.

Posts antigos com `data-post-section` ou `data-post-block` também abrem no editor contínuo. Os contêineres são retirados da representação editável, preservando a ordem de textos, links e mídias. Abrir não grava nada; ao editar e salvar, o artigo passa a usar texto contínuo, sem as antigas configurações de cores, dimensões ou seções. Os editores de blocos e seções foram removidos. O conteúdo continua no campo HTML existente; nenhuma migration é necessária. Os dados de endereço, resumo e publicação ficam recolhidos, e a prévia mantém os modos computador/celular.

Imagens usam dispositivo, link ou galeria privada, com variantes para computador/celular. Nos posts, arquivos permanecem em prévia até salvar. Vídeos usam links validados de YouTube/Vimeo; Instagram abre a publicação original. Anúncios aparecem como Publicidade. DOMPurify sanitiza a marcação; o editor preserva apenas blobs locais registrados no rascunho. A renderização pública continua por `PostContent`, com players carregados sob demanda.

A simplificação dos formulários e sua validação estão em `FORMULARIOS_SIMPLES.md`. O diretório `prototipos/editor-posts` é um estudo anterior e não representa o editor atual.
