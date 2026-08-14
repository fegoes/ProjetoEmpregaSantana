-- EmpregaSantana — página institucional de LGPD (Lei nº 13.709/2018)
-- Mesma mecânica de 0005_institutional_pages.sql: linha editável pelo admin em /admin/paginas,
-- exibida publicamente em /lgpd. Conteúdo inicial é um esqueleto — precisa de revisão jurídica
-- antes de ser considerado definitivo (nenhum dado de contato/DPO real foi inventado aqui).

insert into public.paginas_institucionais (slug, title, content_html) values
  (
    'lgpd',
    'Privacidade e LGPD',
    '<p>O EmpregaSantana trata dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Esta página resume como os dados são tratados na plataforma.</p>
     <h3>Dados que coletamos</h3>
     <p>Dados de cadastro (nome, e-mail, telefone, cidade/estado), dados de currículo fornecidos pelo candidato, dados de perfil de empresa e de autônomo, e dados de uso da plataforma (candidaturas, mensagens de contato).</p>
     <h3>Finalidade do tratamento</h3>
     <p>Viabilizar a conexão entre candidatos, autônomos e empresas: publicação e busca de vagas, envio de candidaturas, exibição de perfis públicos de autônomos e empresas, e comunicação entre as partes.</p>
     <h3>Seus direitos como titular</h3>
     <p>Conforme o art. 18 da LGPD, você pode solicitar confirmação do tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, informação sobre compartilhamento e revogação do consentimento.</p>
     <h3>Como exercer seus direitos</h3>
     <p>Entre em contato pelos canais informados na página <a href="/sobre">Sobre</a>. Solicitações de exclusão de conta e dados também podem ser feitas diretamente nas configurações de conta.</p>
     <p><em>Este conteúdo é um ponto de partida e deve ser revisado por um profissional jurídico antes de ser considerado a política definitiva da empresa.</em></p>'
  )
on conflict (slug) do nothing;
