-- EmpregaSantana — conteúdo real de Termos de Uso e Política de Privacidade,
-- substituindo os placeholders "a ser definido" de 0005. Mesmo mecanismo:
-- editável em /admin/paginas, sem precisar mexer em código. Ponto de
-- partida sólido e específico da plataforma — como qualquer conteúdo
-- jurídico, vale revisão por advogado antes de virar a versão definitiva
-- (mesma ressalva já registrada na página de LGPD, migration 0010).

update public.paginas_institucionais
set content_html = '
<p><em>Última atualização: agosto de 2026.</em></p>

<h3>1. Aceitação dos termos</h3>
<p>Ao criar uma conta ou usar o EmpregaSantana, você concorda com estes Termos de Uso. Se não concordar, não utilize a plataforma.</p>

<h3>2. O que é o EmpregaSantana</h3>
<p>O EmpregaSantana é um marketplace de trabalho que conecta três tipos de usuário: <strong>candidatos</strong> em busca de vagas fixas ou temporárias, <strong>profissionais autônomos</strong> que divulgam seus serviços para contratação direta, e <strong>empresas</strong> que publicam vagas e buscam candidatos. A plataforma é um intermediário: não somos parte da relação de trabalho, contrato de prestação de serviço ou vínculo empregatício que eventualmente se forme entre os usuários.</p>

<h3>3. Cadastro e conta</h3>
<p>Para usar a maior parte das funcionalidades, é preciso criar uma conta com e-mail e senha verdadeiros. Você é responsável por manter sua senha em sigilo e por tudo o que acontecer na sua conta. Um mesmo usuário pode acumular mais de um perfil (candidato, autônomo e/ou empresa) na mesma conta.</p>
<p>Informações de cadastro, currículo e perfil devem ser verdadeiras. Contas com informação falsa, duplicada ou usada para fins fraudulentos podem ser suspensas ou excluídas pelo administrador, sem aviso prévio.</p>

<h3>4. Responsabilidades por tipo de perfil</h3>
<p><strong>Candidatos:</strong> as informações do currículo (experiência, formação, contato) são de sua responsabilidade. Candidaturas enviadas ficam visíveis para a empresa dona da vaga.</p>
<p><strong>Autônomos:</strong> o perfil público (descrição do serviço, forma de cobrança, área de atendimento) deve refletir com precisão o serviço oferecido. Preços e condições combinados com quem contrata são de responsabilidade exclusiva do autônomo — o EmpregaSantana não participa da negociação, do pagamento nem da execução do serviço.</p>
<p><strong>Empresas:</strong> vagas publicadas devem ser reais, atuais e seguir a legislação trabalhista brasileira, incluindo as normas de não discriminação na contratação. É proibido publicar vaga enganosa, vaga que exija pagamento do candidato para participar do processo seletivo, ou vaga com conteúdo discriminatório quanto a raça, gênero, idade, orientação sexual, religião, deficiência ou origem.</p>

<h3>5. Conteúdo proibido</h3>
<p>Não é permitido publicar conteúdo ilegal, discriminatório, difamatório, fraudulento ou que viole direitos de terceiros — em vaga, currículo, perfil de autônomo ou perfil de empresa. Contas que publicarem esse tipo de conteúdo podem ter o conteúdo removido e a conta suspensa ou excluída.</p>

<h3>6. Planos e cobrança</h3>
<p>Parte das funcionalidades (destaque de vaga ou de perfil, limites de vagas ativas, acesso a banco de currículos) pode estar vinculada a planos pagos. Quando isso estiver ativo, os termos específicos de cobrança, renovação e cancelamento de cada plano serão exibidos antes da contratação.</p>

<h3>7. Propriedade intelectual</h3>
<p>A marca, o logotipo e o layout do EmpregaSantana pertencem à plataforma. O conteúdo que você publica (currículo, descrição de serviço, vaga, fotos) continua sendo seu, mas ao publicar você autoriza a exibição pública dessas informações dentro da plataforma, conforme as configurações de visibilidade que você escolher.</p>

<h3>8. Isenção de responsabilidade</h3>
<p>O EmpregaSantana não garante contratação, fechamento de serviço nem a veracidade de todas as informações publicadas por terceiros. Recomendamos cautela: confira dados da empresa ou do profissional antes de fechar qualquer negócio, e nunca faça pagamento adiantado para "garantir" uma vaga ou processo seletivo.</p>

<h3>9. Suspensão e encerramento</h3>
<p>Você pode encerrar sua conta a qualquer momento nas configurações de conta. O EmpregaSantana pode suspender ou excluir contas que violem estes Termos.</p>

<h3>10. Alterações nestes termos</h3>
<p>Podemos atualizar este documento. Mudanças relevantes serão indicadas pela data de "última atualização" no topo da página.</p>

<h3>11. Legislação aplicável</h3>
<p>Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de Santana do Ipanema, Alagoas, para dirimir eventuais controvérsias, ressalvado o direito do consumidor de optar pelo foro do seu domicílio.</p>

<h3>12. Contato</h3>
<p>Dúvidas sobre estes Termos podem ser enviadas pelos canais de contato indicados na página <a href="/sobre">Sobre</a>.</p>

<p><em>Este conteúdo é um ponto de partida e deve ser revisado por um profissional jurídico antes de ser considerado a versão definitiva.</em></p>
'
where slug = 'termos';

update public.paginas_institucionais
set content_html = '
<p><em>Última atualização: agosto de 2026.</em></p>

<p>Esta política explica quais dados o EmpregaSantana coleta, para que usa e como você controla essas informações. Para o resumo específico da Lei Geral de Proteção de Dados (LGPD) — incluindo seus direitos como titular e como exercê-los — veja a página <a href="/lgpd">Privacidade e LGPD</a>.</p>

<h3>1. Quais dados coletamos</h3>
<p><strong>Dados de cadastro:</strong> nome, e-mail, telefone, cidade e estado.</p>
<p><strong>Dados de candidato:</strong> currículo (resumo, experiência profissional, formação, habilidades), candidaturas enviadas.</p>
<p><strong>Dados de autônomo:</strong> descrição do serviço, categoria, forma e valor de cobrança, área de atendimento, fotos de trabalhos anteriores.</p>
<p><strong>Dados de empresa:</strong> razão social, CNPJ, setor, endereço, missão/visão/valores, fotos internas, número de funcionários — a maioria desses campos tem uma opção para a empresa decidir se aparece no perfil público ou não.</p>
<p><strong>Dados de uso:</strong> páginas visitadas, buscas realizadas e interações com a plataforma, para entender o que funciona e corrigir problemas.</p>

<h3>2. Para que usamos esses dados</h3>
<ul>
<li>Viabilizar o cadastro e login na plataforma;</li>
<li>Exibir perfis públicos de vaga, autônomo e empresa para quem visita o site;</li>
<li>Processar candidaturas e permitir que a empresa veja quem se candidatou às próprias vagas;</li>
<li>Melhorar a plataforma com base em como ela é usada;</li>
<li>Cumprir obrigações legais, quando aplicável.</li>
</ul>

<h3>3. Com quem compartilhamos dados</h3>
<p>Isso é o núcleo do serviço, não um compartilhamento com terceiros externos: ao se candidatar a uma vaga, seu currículo fica visível para a empresa dona da vaga. Ao ativar um perfil público de autônomo ou empresa, as informações marcadas como públicas ficam visíveis para qualquer visitante do site. Não vendemos dados pessoais para terceiros.</p>
<p>Usamos o Supabase como infraestrutura de banco de dados e autenticação — os dados ficam armazenados nos servidores dessa provedora, sob contrato de processamento de dados compatível com a LGPD.</p>

<h3>4. Cookies</h3>
<p>O EmpregaSantana usa apenas cookies técnicos essenciais, necessários para manter sua sessão de login. Não usamos cookies de rastreamento publicitário de terceiros.</p>

<h3>5. Segurança</h3>
<p>Aplicamos controles de acesso (cada usuário só edita os próprios dados; empresas só veem currículo de quem se candidatou às próprias vagas) e conexão criptografada (HTTPS) em toda a plataforma.</p>

<h3>6. Retenção e exclusão</h3>
<p>Mantemos seus dados enquanto sua conta estiver ativa. Você pode excluir sua conta nas configurações de conta ou solicitar exclusão pelos canais de contato — isso remove currículo, candidaturas e perfil associados, conforme detalhado na página de <a href="/lgpd">LGPD</a>.</p>

<h3>7. Alterações nesta política</h3>
<p>Podemos atualizar este documento. Mudanças relevantes serão indicadas pela data de "última atualização" no topo da página.</p>

<h3>8. Contato</h3>
<p>Dúvidas sobre privacidade podem ser enviadas pelos canais de contato indicados na página <a href="/sobre">Sobre</a>.</p>

<p><em>Este conteúdo é um ponto de partida e deve ser revisado por um profissional jurídico antes de ser considerado a versão definitiva.</em></p>
'
where slug = 'privacidade';
