-- EmpregaSantana — dados de demonstração (empresas, vagas, autônomos, candidatos)
-- Objetivo: popular o ambiente com dezenas de vagas e perfis reais para validar
-- a UX do site (ver docs/PRD.md). Usuários "seed" são criados diretamente em
-- auth.users (senha de demonstração, não destinada a login real).

-- ---------------------------------------------------------------------------
-- Novas categorias (além das criadas na migration 0001)
-- ---------------------------------------------------------------------------

insert into public.categories (slug, label, kind) values
  ('construcao', 'Construção Civil', 'vaga'),
  ('saude', 'Saúde', 'vaga'),
  ('educacao', 'Educação', 'vaga'),
  ('gastronomia', 'Gastronomia', 'vaga'),
  ('financeiro', 'Financeiro', 'vaga'),
  ('producao', 'Produção Industrial', 'vaga'),
  ('agronegocio', 'Agronegócio', 'vaga'),
  ('marketing', 'Marketing e Design', 'vaga'),
  ('hotelaria', 'Turismo e Hotelaria', 'vaga'),
  ('jardineiro', 'Jardinagem e Paisagismo', 'autonomo'),
  ('pintor', 'Pintor', 'autonomo'),
  ('marceneiro', 'Marcenaria', 'autonomo'),
  ('cabeleireiro', 'Cabeleireiro(a)', 'autonomo'),
  ('personal-trainer', 'Personal Trainer', 'autonomo'),
  ('fotografo', 'Fotografia', 'autonomo'),
  ('designer-freelancer', 'Design Freelancer', 'autonomo'),
  ('professor-particular', 'Aulas Particulares', 'autonomo'),
  ('cuidador', 'Cuidador(a)', 'autonomo'),
  ('motorista-particular', 'Motorista Particular', 'autonomo'),
  ('tecnico-informatica', 'Técnico em Informática', 'autonomo')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Empresas + vagas
-- ---------------------------------------------------------------------------

do $$
declare
  emp_names text[] := array[
    'TechNova Soluções', 'Construtora Horizonte', 'Mercado Bom Preço', 'Clínica Vida Plena',
    'Colégio Saber', 'Sabor Caseiro Alimentos', 'LogExpress Transportes', 'Financeira Confiança',
    'Metalúrgica Aço Forte', 'AgroVale Agronegócio', 'Studio Criativo Design', 'Hotel Bela Vista',
    'Farmácia Popular Saúde', 'Construtora Santana', 'Grupo Atacado Sul', 'Instituto Educar+'
  ];
  emp_sectors text[] := array[
    'Tecnologia', 'Construção Civil', 'Varejo', 'Saúde',
    'Educação', 'Alimentação', 'Logística', 'Serviços Financeiros',
    'Industrial', 'Agronegócio', 'Design & Marketing', 'Turismo & Hotelaria',
    'Varejo Farmacêutico', 'Construção Civil', 'Varejo Atacadista', 'Educação'
  ];
  emp_cities text[] := array[
    'São Paulo', 'Santana de Parnaíba', 'Recife', 'Belo Horizonte',
    'Curitiba', 'Porto Alegre', 'Campinas', 'Rio de Janeiro',
    'Joinville', 'Ribeirão Preto', 'São Paulo', 'Salvador',
    'Fortaleza', 'Santana', 'Porto Alegre', 'Brasília'
  ];
  emp_states text[] := array[
    'SP', 'SP', 'PE', 'MG', 'PR', 'RS', 'SP', 'RJ', 'SC', 'SP', 'SP', 'BA', 'CE', 'AP', 'RS', 'DF'
  ];
  emp_desc text[] := array[
    'Fábrica de software focada em produtos digitais para pequenas e médias empresas.',
    'Construtora residencial e comercial com mais de 20 anos de história.',
    'Rede de supermercados de bairro conhecida pelo atendimento próximo ao cliente.',
    'Clínica multidisciplinar dedicada a cuidado humanizado e acessível.',
    'Escola de ensino fundamental e médio com foco em educação integral.',
    'Restaurante e marmitaria especializados em comida caseira de qualidade.',
    'Transportadora regional com operação em todo o estado de São Paulo.',
    'Cooperativa de crédito voltada para pequenos empreendedores.',
    'Indústria metalúrgica fornecedora para o setor automotivo.',
    'Empresa do agronegócio com foco em produção sustentável de grãos.',
    'Agência de design e marketing digital para marcas em crescimento.',
    'Hotel boutique à beira-mar com tradição em hospitalidade baiana.',
    'Rede de farmácias populares com preços acessíveis para a comunidade.',
    'Construtora local especializada em obras residenciais na região Norte.',
    'Distribuidor atacadista de produtos de mercearia e limpeza.',
    'Instituto de cursos técnicos e profissionalizantes gratuitos.'
  ];

  emp_type text[] := array['clt', 'pj', 'temporario', 'freelance'];

  v_owner_id uuid;
  v_empresa_id uuid;
  v_vaga_id uuid;
  vaga_ids uuid[] := '{}';

  i int;
  j int;
  titles text[];
  category_slug text;
  cur_type text;
  cur_pricing text;
  s_min numeric;
  s_max numeric;
  s_hourly numeric;
  is_rem boolean;
  is_feat boolean;
begin
  for i in 1..16 loop
    v_owner_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_owner_id, 'authenticated', 'authenticated',
      'rh.empresa' || i || '@empregasantana-seed.com',
      extensions.crypt('seed-demo-password', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'RH ' || emp_names[i]),
      now(), now(), '', '', '', ''
    );

    insert into public.empresas (
      owner_id, nome_fantasia, razao_social, cnpj, sector, city, state, description_html, status, is_verified
    ) values (
      v_owner_id, emp_names[i], emp_names[i] || ' LTDA',
      lpad((12345678000100 + i * 137)::text, 14, '0'),
      emp_sectors[i], emp_cities[i], emp_states[i],
      '<p>' || emp_desc[i] || '</p>',
      'active', (i % 3 = 0)
    ) returning id into v_empresa_id;

    category_slug := case emp_sectors[i]
      when 'Tecnologia' then 'ti'
      when 'Construção Civil' then 'construcao'
      when 'Varejo' then 'vendas'
      when 'Saúde' then 'saude'
      when 'Educação' then 'educacao'
      when 'Alimentação' then 'gastronomia'
      when 'Logística' then 'logistica'
      when 'Serviços Financeiros' then 'financeiro'
      when 'Industrial' then 'producao'
      when 'Agronegócio' then 'agronegocio'
      when 'Design & Marketing' then 'marketing'
      when 'Turismo & Hotelaria' then 'hotelaria'
      when 'Varejo Farmacêutico' then 'vendas'
      when 'Varejo Atacadista' then 'vendas'
      else 'administrativo'
    end;

    titles := case emp_sectors[i]
      when 'Tecnologia' then array['Desenvolvedor(a) Front-end', 'Analista de Suporte de TI', 'Product Designer (UX/UI)']
      when 'Construção Civil' then array['Pedreiro', 'Mestre de Obras', 'Auxiliar de Construção Civil']
      when 'Varejo' then array['Vendedor(a) de Loja', 'Operador(a) de Caixa', 'Repositor(a) de Estoque']
      when 'Saúde' then array['Técnico(a) de Enfermagem', 'Recepcionista Clínica', 'Auxiliar de Farmácia']
      when 'Educação' then array['Professor(a) de Ensino Fundamental', 'Coordenador(a) Pedagógico', 'Auxiliar Administrativo Escolar']
      when 'Alimentação' then array['Cozinheiro(a)', 'Auxiliar de Cozinha', 'Atendente de Padaria']
      when 'Logística' then array['Motorista Entregador', 'Auxiliar de Logística', 'Conferente de Estoque']
      when 'Serviços Financeiros' then array['Analista Financeiro', 'Consultor(a) de Crédito', 'Assistente Administrativo']
      when 'Industrial' then array['Operador(a) de Produção', 'Técnico(a) de Manutenção Industrial', 'Soldador(a)']
      when 'Agronegócio' then array['Técnico(a) Agrícola', 'Operador(a) de Máquinas Agrícolas', 'Auxiliar de Campo']
      when 'Design & Marketing' then array['Designer Gráfico', 'Social Media', 'Redator(a) Publicitário']
      when 'Turismo & Hotelaria' then array['Recepcionista de Hotel', 'Camareira', 'Garçom/Garçonete']
      when 'Varejo Farmacêutico' then array['Balconista de Farmácia', 'Auxiliar de Farmácia', 'Operador(a) de Caixa']
      when 'Varejo Atacadista' then array['Auxiliar de Depósito', 'Vendedor(a) Atacado', 'Motorista Entregador']
      else array['Auxiliar Administrativo', 'Assistente Geral', 'Estagiário(a)']
    end;

    for j in 1..3 loop
      cur_type := emp_type[((i + j) % 4) + 1];
      if cur_type in ('temporario', 'freelance') then
        cur_pricing := (array['hourly', 'per_delivery'])[((i + j) % 2) + 1];
      else
        cur_pricing := 'fixed_salary';
      end if;

      s_min := 1700 + ((i * 53 + j * 97) % 3500);
      s_max := s_min + 500 + ((j * 211) % 1500);
      s_hourly := 25 + ((i * 7 + j * 3) % 60);
      is_rem := emp_sectors[i] in ('Tecnologia', 'Design & Marketing', 'Serviços Financeiros') and j = 1;
      is_feat := ((i + j) % 5 = 0);

      insert into public.vagas (
        empresa_id, created_by, title, description_html, employment_type, pricing_model,
        salary_min, salary_max, hourly_rate, salary_visible,
        location_city, location_state, is_remote, category, status, is_featured
      ) values (
        v_empresa_id, v_owner_id, titles[j],
        '<p>' || titles[j] || ' na ' || emp_names[i] || '.</p><p>Buscamos alguém dedicado(a) e pontual para se juntar ao nosso time em ' || emp_cities[i] || '. Oferecemos um ambiente de trabalho colaborativo e oportunidades de crescimento.</p>',
        cur_type, cur_pricing,
        case when cur_pricing = 'fixed_salary' then s_min end,
        case when cur_pricing = 'fixed_salary' then s_max end,
        case when cur_pricing = 'hourly' then s_hourly end,
        true,
        emp_cities[i], emp_states[i], is_rem, category_slug, 'published', is_feat
      ) returning id into v_vaga_id;

      vaga_ids := array_append(vaga_ids, v_vaga_id);
    end loop;
  end loop;

  -- variedade de status para a Lista de Vagas do admin não ficar só "publicada"
  if array_length(vaga_ids, 1) >= 20 then
    update public.vagas set status = 'draft' where id = vaga_ids[3];
    update public.vagas set status = 'paused' where id = vaga_ids[11];
    update public.vagas set status = 'closed' where id = vaga_ids[19];
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Autônomos
-- ---------------------------------------------------------------------------

do $$
declare
  auto_names text[] := array[
    'Roberto Alves', 'Marcos Vinícius', 'José Carlos Ferreira', 'Fernanda Souza',
    'Antônio Pereira', 'Maria Aparecida', 'Lucas Martins', 'Paulo Henrique',
    'Sérgio Ramos', 'Juliana Costa', 'Diego Oliveira', 'Camila Rocha',
    'Rafael Lima', 'Beatriz Santos', 'Isabela Cardoso', 'Eduardo Nogueira',
    'Vinícius Teixeira', 'Patrícia Gomes'
  ];
  auto_category text[] := array[
    'pedreiro', 'eletricista', 'encanador', 'consultor',
    'auditor', 'diarista', 'jardineiro', 'pintor',
    'marceneiro', 'cabeleireiro', 'personal-trainer', 'fotografo',
    'designer-freelancer', 'professor-particular', 'cuidador', 'motorista-particular',
    'tecnico-informatica', 'diarista'
  ];
  auto_headline text[] := array[
    'Pedreiro com 15 anos de experiência em reformas e construções',
    'Eletricista predial e residencial certificado',
    'Encanador para reparos e instalações hidráulicas',
    'Consultora empresarial especializada em pequenos negócios',
    'Auditor contábil e fiscal',
    'Diarista de confiança, referências disponíveis',
    'Jardineiro e paisagista',
    'Pintor residencial e comercial',
    'Marceneiro sob medida',
    'Cabeleireira e manicure a domicílio',
    'Personal trainer certificado',
    'Fotógrafa de eventos e retratos',
    'Designer gráfico freelancer',
    'Professora particular de Matemática e Física',
    'Cuidadora de idosos experiente',
    'Motorista particular e para eventos',
    'Técnico em informática e redes',
    'Diarista com experiência em limpeza pós-obra'
  ];
  auto_desc text[] := array[
    'Atendo reformas residenciais e comerciais, sempre com prazo e orçamento combinados.',
    'Instalações elétricas, manutenção preventiva e atendimento de emergência.',
    'Conserto vazamentos, instalo torneiras e faço manutenção hidráulica preventiva.',
    'Ajudo pequenas empresas a organizar processos financeiros e de gestão.',
    'Realizo auditorias internas e revisão de processos fiscais para empresas de todos os portes.',
    'Limpeza residencial completa, com produtos próprios se necessário.',
    'Cuido de jardins residenciais, poda de árvores e manutenção de grama.',
    'Pintura interna e externa, textura e grafiato.',
    'Faço móveis planejados, reparos e restauração de madeira.',
    'Atendimento a domicílio com hora marcada: corte, escova e tratamentos.',
    'Treinos personalizados em casa, ao ar livre ou em academia parceira.',
    'Cobertura de casamentos, aniversários e ensaios fotográficos.',
    'Identidade visual, posts para redes sociais e materiais impressos.',
    'Aulas de reforço para ensino fundamental e médio, presencial ou online.',
    'Cuidados diários, administração de medicamentos e companhia.',
    'Disponível para viagens, transporte executivo e eventos.',
    'Formatação, manutenção de computadores e configuração de redes.',
    'Atendo limpeza residencial e pós-obra na região.'
  ];
  auto_pricing text[] := array[
    'both', 'hourly', 'per_delivery', 'hourly',
    'hourly', 'hourly', 'both', 'per_delivery',
    'per_delivery', 'hourly', 'hourly', 'per_delivery',
    'both', 'hourly', 'hourly', 'hourly',
    'per_delivery', 'hourly'
  ];
  auto_hourly numeric[] := array[
    45, 60, null, 150, 180, 25, 35, null, null, 50, 70, null, 80, 55, 30, 40, null, 28
  ];
  auto_delivery text[] := array[
    'Orçamento por metro quadrado, a combinar conforme o serviço.', null,
    'Valor por serviço, a partir de R$ 120.', null, null, null,
    'Projetos de paisagismo sob orçamento.', 'Valor por metro quadrado pintado, a combinar.',
    'Orçamento sob medida conforme o projeto.', null, null, 'Pacotes a partir de R$ 400 por evento.',
    'Projetos fechados sob orçamento.', null, null, null,
    'Valor por serviço, a partir de R$ 80.', null
  ];
  auto_city text[] := array[
    'São Paulo', 'Campinas', 'Rio de Janeiro', 'Belo Horizonte',
    'São Paulo', 'Curitiba', 'Porto Alegre', 'Recife',
    'Salvador', 'Fortaleza', 'São Paulo', 'Rio de Janeiro',
    'Belo Horizonte', 'Brasília', 'Curitiba', 'São Paulo',
    'Campinas', 'Santana de Parnaíba'
  ];
  auto_state text[] := array[
    'SP', 'SP', 'RJ', 'MG', 'SP', 'PR', 'RS', 'PE', 'BA', 'CE', 'SP', 'RJ', 'MG', 'DF', 'PR', 'SP', 'SP', 'SP'
  ];
  auto_featured boolean[] := array[
    true, false, false, true, false, false, false, false,
    true, false, false, true, false, false, false, false,
    false, false
  ];

  v_id uuid;
  i int;
begin
  for i in 1..18 loop
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      'autonomo' || i || '@empregasantana-seed.com',
      extensions.crypt('seed-demo-password', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', auto_names[i]),
      now(), now(), '', '', '', ''
    );

    insert into public.autonomo_profiles (
      id, headline, category, description_html, pricing_model,
      hourly_rate, delivery_rate_note, service_area_city, service_area_state,
      status, is_featured
    ) values (
      v_id, auto_headline[i], auto_category[i], '<p>' || auto_desc[i] || '</p>', auto_pricing[i],
      auto_hourly[i], auto_delivery[i], auto_city[i], auto_state[i],
      'active', auto_featured[i]
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Candidatos + currículos + candidaturas
-- ---------------------------------------------------------------------------

do $$
declare
  cand_names text[] := array[
    'Ana Beatriz Silva', 'Bruno Henrique', 'Carla Mendes', 'Diego Fernandes',
    'Elisa Ramos', 'Felipe Araújo', 'Gabriela Nunes', 'Henrique Barros'
  ];
  cand_headline text[] := array[
    'Auxiliar administrativa com 4 anos de experiência',
    'Desenvolvedor Jr. em busca de oportunidade',
    'Vendedora com experiência em atendimento ao cliente',
    'Motorista categoria D, CNH em dia',
    'Recém-formada em Pedagogia',
    'Técnico em logística e estoque',
    'Designer gráfica júnior',
    'Auxiliar de cozinha com experiência em restaurantes'
  ];
  cand_desired_role text[] := array[
    'Auxiliar Administrativo', 'Desenvolvedor Front-end', 'Vendedora', 'Motorista',
    'Auxiliar Pedagógica', 'Auxiliar de Logística', 'Designer Gráfico', 'Auxiliar de Cozinha'
  ];
  cand_summary text[] := array[
    'Tenho experiência em rotinas administrativas, atendimento e organização de documentos.',
    'Estudo desenvolvimento web há 2 anos e já participei de projetos freelance.',
    'Trabalhei 3 anos em loja de departamento, com foco em metas e relacionamento com cliente.',
    'Experiência com transporte de cargas e passageiros, CNH categoria D.',
    'Formada em Pedagogia, com estágio em escola de ensino fundamental.',
    'Experiência em controle de estoque e conferência de mercadorias.',
    'Formada em Design, com portfólio em identidade visual e redes sociais.',
    'Trabalhei em restaurantes e buffets, com boa organização e agilidade.'
  ];
  cand_skills text[] := array[
    'Excel,Atendimento ao cliente,Organização',
    'HTML,CSS,JavaScript,React',
    'Vendas,Atendimento,Trabalho em equipe',
    'Direção defensiva,Pontualidade',
    'Educação infantil,Planejamento de aulas',
    'Logística,Excel,Controle de estoque',
    'Photoshop,Illustrator,Canva',
    'Cozinha,Higiene alimentar,Trabalho em equipe'
  ];

  v_id uuid;
  v_cv_id uuid;
  candidato_ids uuid[] := '{}';
  cv_ids uuid[] := '{}';
  vaga_ids uuid[];
  i int;
  j int;
  n_apply int;
  v_vaga_id uuid;
  statuses text[] := array['enviada', 'em_analise', 'entrevista', 'aprovada', 'rejeitada'];
begin
  select array_agg(id) into vaga_ids from public.vagas where status = 'published';

  for i in 1..8 loop
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      'candidato' || i || '@empregasantana-seed.com',
      extensions.crypt('seed-demo-password', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', cand_names[i]),
      now(), now(), '', '', '', ''
    );

    insert into public.candidato_profiles (id, headline, desired_role, availability)
    values (v_id, cand_headline[i], cand_desired_role[i], 'imediata');

    candidato_ids := array_append(candidato_ids, v_id);

    insert into public.cv_variants (candidato_id, title, summary_html, skills, is_default, is_public)
    values (
      v_id, 'Currículo Principal', '<p>' || cand_summary[i] || '</p>',
      string_to_array(cand_skills[i], ','), true, (i % 2 = 0)
    )
    returning id into v_cv_id;

    cv_ids := array_append(cv_ids, v_cv_id);
  end loop;

  if array_length(vaga_ids, 1) > 0 then
    for i in 1..8 loop
      n_apply := 2 + (i % 2);
      for j in 1..n_apply loop
        v_vaga_id := vaga_ids[((i * 3 + j * 7) % array_length(vaga_ids, 1)) + 1];
        begin
          insert into public.candidaturas (vaga_id, candidato_id, cv_variant_id, status)
          values (v_vaga_id, candidato_ids[i], cv_ids[i], statuses[((i + j) % 5) + 1]);
        exception when unique_violation then
          null;
        end;
      end loop;
    end loop;
  end if;
end $$;
