# Inicial sem exibição da versão antiga

A página inicial aguardava a consulta ao banco exibindo o modelo ilustrado como fallback. Agora apresenta apenas um estado neutro de carregamento até confirmar o conteúdo atual. Falhas mostram uma mensagem com nova tentativa, sem recuperar o modelo original.

As consultas de páginas por slug não herdam mais o cache de 30 minutos: revalidam a cada montagem e ao retornar à janela. A inicial também esconde dados anteriores durante essa revalidação. Salvar um layout com zero seções mantém essa escolha; conteúdo textual salvo também é respeitado. O modelo ilustrado permanece apenas para instalações sem conteúdo personalizado confirmado pelo banco.

A renderização para buscadores respeita essas mesmas escolhas, incluindo layouts vazios e conteúdo textual, com resposta da inicial marcada `no-store`.

Não requer migration. Alterações preparadas localmente; publicação remota deve ocorrer posteriormente. Testes de regressão cobrem carregamento, cache anterior, erro com nova tentativa, layout vazio e conteúdo textual.
