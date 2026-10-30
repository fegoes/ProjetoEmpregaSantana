# Acompanhamento da contratação

Depois de se candidatar, a pessoa passa a acompanhar o processo etapa por etapa, dentro do site, junto com a empresa. O mesmo vale para a contratação de um autônomo.

## Quem vê o quê

| Perfil | Onde | O que faz |
| --- | --- | --- |
| Candidato | Painel do candidato → **Candidaturas** → abrir uma | Vê a etapa atual, os feedbacks, conversa, envia documentos, pode desistir. |
| Empresa | Painel da empresa → **Seleção** (ou **Minhas vagas → Candidatos → Abrir acompanhamento**) | Avança a etapa com feedback, vai direto a outra etapa, pede e confere documentos, contrata ou encerra, reabre. |
| Autônomo | Painel do autônomo → **Contratações** | Acompanha o que a empresa abriu, conversa e envia documentos. |

A empresa abre uma contratação com um autônomo pelo perfil dele, em **Contratar pela plataforma**. O botão do WhatsApp continua lá.

## Etapas

Cada vaga tem as etapas que a empresa escolher, no formulário da vaga (**Etapas da seleção**). Quem não mexer fica com o padrão:

1. Candidatura recebida
2. Análise do currículo
3. Entrevista
4. Análise de documentos
5. Aguardando posicionamento
6. Contratação

A primeira e a última são fixas; as do meio podem ser renomeadas, trocadas de ordem, apagadas ou acrescentadas (de 2 a 12 etapas no total). Mudar as etapas da vaga **não altera** os processos que já começaram: cada candidatura guarda a cópia que tinha.

Para contratação de autônomo, as etapas são: Convite enviado, Conversa inicial, Proposta e combinados, Documentos e Contratação.

### O que a empresa pode fazer

- **Concluir etapa e avançar**, com um feedback opcional que fica registrado na etapa que ficou para trás.
- **Ir direto para outra etapa**, para frente (as do meio ficam "puladas") ou para trás.
- **Marcar como contratado(a)**: conclui o processo.
- **Encerrar sem contratar**, com feedback. Dá para **reabrir** depois.

A pessoa pode **desistir** (com motivo opcional). Em todos os casos o outro lado recebe um aviso na conversa e a etiqueta laranja **Novidade** na lista.

## Conversa e documentos

- Mensagens dos dois lados, em texto. A empresa pode marcar uma mensagem como **feedback da etapa atual**.
- **Anexar documento**: PDF, imagem (JPG, PNG, WEBP) ou Word, até 10 MB. O outro lado clica em **Abrir** e vê o arquivo. A aba **Documentos** reúne tudo o que foi enviado.
- A conversa se atualiza sozinha a cada poucos segundos enquanto a tela está aberta.
- Depois de **encerrado**, a conversa fica só para leitura. Depois de **contratado**, continua aberta (documentos de admissão).

## Privacidade e segurança

- Os arquivos ficam num armazenamento **privado** (`processo-docs`). Eles nunca têm endereço público: quem participa do processo abre por um link temporário (2 minutos).
- Só participam o candidato (ou autônomo) e os membros da empresa daquele processo. Outra pessoa, outra empresa e visitantes não veem processo, mensagens nem arquivos. O superadmin pode ler (moderação), mas não escreve.
- Mensagens e arquivos não podem ser editados nem apagados depois de enviados.
- A etapa e a situação só mudam por funções do banco que conferem quem está pedindo. Por isso um candidato **não consegue se aprovar** pela API. (Antes disso era possível alterar o próprio status da candidatura; a migration 0024 corrige.)
- Os documentos podem ter dados pessoais sensíveis (RG, CPF, carteira de trabalho). Vale mencionar o tratamento na política de privacidade.

## Atualização do banco

Precisa das migrations `0024_hiring_process.sql` (acompanhamento), `0025_candidato_roles_backfill.sql` (papel de candidato para quem já tem perfil) e, para a modalidade da vaga, `0026_vaga_modalidade.sql`. Aplique em ordem com `supabase db push`. As candidaturas que já existem entram no acompanhamento na etapa que corresponde ao status que tinham.

## Limites atuais

- Não há e-mail nem notificação no celular: a pessoa vê a novidade quando abre o site.
- Os arquivos de um processo apagado (por exemplo, vaga excluída) continuam no armazenamento até serem removidos à mão.
- Cada mensagem leva no máximo um arquivo.
