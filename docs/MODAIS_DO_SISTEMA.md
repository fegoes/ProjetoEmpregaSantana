# Confirmações com a interface da plataforma

Todas as chamadas de execução a `window.confirm` em `src` foram substituídas por `confirmAction`, uma confirmação assíncrona renderizada pelo `ConfirmationHost` global. As mensagens e consequências de cada operação foram preservadas. O serviço organiza solicitações em sequência e resolve como cancelamento ao fechar ou desmontar o host. Não usa alert, prompt ou confirm do navegador.

Cobertura: exclusão de usuários, empresas, candidatos, autônomos, vagas, currículos, categorias, páginas, posts, arquivos da biblioteca e registros comerciais; vínculos de empresa; moderação de processos; seções, slides e blocos nos editores; descarte de alterações e troca de empresa. Mesmo seções e blocos vazios pedem confirmação ao apagar.

O modal tem foco inicial em Cancelar, bloqueio de foco dentro da janela, Escape e botão de fechar, descrição acessível, restauração do foco ao acionador e botão destrutivo destacado. Confirmações também funcionam sobre os formulários em outros modais. A navegação no editor de página é impedida antes de aguardar a confirmação; a seleção da empresa captura o destino antes da espera assíncrona.

Redefinir senha por e-mail no superadmin pede confirmação pelo modal, com o endereço de destino. A definição manual de senha abre um formulário no modal existente da plataforma, com fechamento bloqueado durante o envio. Os demais formulários e seletores existentes continuam usando a interface do sistema; não se adicionaram confirmações extras em cada clique de edição.

## Limite do navegador

O editor de páginas mantém `beforeunload` para proteger alterações ainda não salvas quando a pessoa fecha ou recarrega a aba. Esse aviso pertence ao navegador: não permite conteúdo, cores ou modal personalizados e não pode aguardar uma janela React. Nas ações internas da plataforma, as confirmações são próprias do sistema.

## Verificação

Testes cobrem cancelar, confirmar, execução única, foco inicial e retorno, Escape, confirmação sobre outro modal e fila de solicitações. A navegação Playwright com o construtor real verificou cancelamento sem exclusão, exclusão após confirmação, zero diálogos nativos na operação e ausência de rolagem horizontal em 390 px.

Sem migration e sem publicação remota nesta etapa.
