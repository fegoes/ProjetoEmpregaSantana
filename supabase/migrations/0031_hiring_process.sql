-- EmpregaSantana — acompanhamento da contratação (processo seletivo)
--
-- Cada candidatura vira um "processo": uma linha do tempo de etapas (recebida,
-- análise do currículo, entrevista, análise de documentos, aguardando
-- posicionamento, contratação), com conversa, feedback por etapa e documentos
-- enviados dentro da plataforma. A empresa escolhe as etapas de cada vaga; sem
-- escolha vale o modelo padrão. A empresa também pode abrir um processo com um
-- autônomo, a partir do perfil dele.
--
-- Quem escreve o quê:
--   - processos e etapas só mudam pelas funções processo_* (nunca por update
--     direto), então ninguém se aprova sozinho nem pula regra;
--   - mensagens podem ser enviadas pelos dois lados (feedback só pela empresa);
--   - documentos ficam num bucket PRIVADO e só quem participa do processo abre.

-- ---------------------------------------------------------------------------
-- Candidatura: o status passa a ser controlado pelo processo
-- ---------------------------------------------------------------------------

alter table public.candidaturas drop constraint candidaturas_status_check;
alter table public.candidaturas
  add constraint candidaturas_status_check
  check (status in ('enviada', 'em_analise', 'entrevista', 'aprovada', 'rejeitada', 'desistiu'));

-- Antes, o candidato podia mudar o próprio status (inclusive para "aprovada")
-- por uma chamada direta à API. Agora só o processo (ou o superadmin) muda.
create function public.candidaturas_guard_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and coalesce(current_setting('app.processo_sync', true), '') <> 'on'
     and not public.is_admin() then
    new.status := old.status;
  end if;
  return new;
end;
$$;

create trigger candidaturas_guard_status before update on public.candidaturas
  for each row execute procedure public.candidaturas_guard_status();

-- ---------------------------------------------------------------------------
-- Vaga: etapas escolhidas pela empresa (nulo = modelo padrão)
-- ---------------------------------------------------------------------------

alter table public.vagas
  add column etapas_selecao jsonb
  check (
    etapas_selecao is null
    or (jsonb_typeof(etapas_selecao) = 'array' and jsonb_array_length(etapas_selecao) between 2 and 12)
  );

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table public.processos (
  id uuid primary key default gen_random_uuid(),
  origem text not null check (origem in ('candidatura', 'autonomo')),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  -- a pessoa acompanhada: candidato ou autônomo
  pessoa_id uuid not null references public.profiles (id) on delete cascade,
  candidatura_id uuid unique references public.candidaturas (id) on delete cascade,
  vaga_id uuid references public.vagas (id) on delete set null,
  -- nomes guardados no momento da criação: a lista não depende de ler outras tabelas
  titulo text not null,
  empresa_nome text not null,
  pessoa_nome text not null,
  status text not null default 'em_andamento' check (status in ('em_andamento', 'contratado', 'encerrado')),
  motivo text check (motivo in ('reprovado', 'desistencia')),
  etapa_atual_id uuid,
  ultima_atividade_em timestamptz not null default now(),
  ultima_atividade_por uuid references public.profiles (id) on delete set null,
  concluido_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((origem = 'candidatura') = (candidatura_id is not null)),
  check ((status = 'encerrado') = (motivo is not null))
);

create index processos_empresa_idx on public.processos (empresa_id, status);
create index processos_pessoa_idx on public.processos (pessoa_id, status);
create index processos_vaga_idx on public.processos (vaga_id);
-- uma empresa não abre dois processos ao mesmo tempo com o mesmo autônomo
create unique index processos_autonomo_aberto_idx on public.processos (empresa_id, pessoa_id)
  where origem = 'autonomo' and status = 'em_andamento';

create trigger set_updated_at before update on public.processos
  for each row execute procedure public.set_updated_at();

create table public.processo_etapas (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos (id) on delete cascade,
  posicao int not null,
  tipo text not null check (tipo in ('recebida', 'triagem', 'entrevista', 'documentos', 'aguardando', 'conclusao', 'outra')),
  titulo text not null,
  descricao text,
  status text not null default 'pendente' check (status in ('pendente', 'atual', 'concluida', 'pulada')),
  iniciada_em timestamptz,
  concluida_em timestamptz,
  unique (processo_id, posicao)
);

alter table public.processos
  add constraint processos_etapa_atual_fkey
  foreign key (etapa_atual_id) references public.processo_etapas (id) on delete set null;

create table public.processo_mensagens (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references public.processos (id) on delete cascade,
  etapa_id uuid references public.processo_etapas (id) on delete set null,
  -- nulo = aviso do sistema (mudou de etapa, processo encerrado…)
  autor_id uuid references public.profiles (id) on delete set null,
  tipo text not null default 'mensagem' check (tipo in ('mensagem', 'feedback', 'sistema')),
  corpo text check (corpo is null or char_length(corpo) <= 4000),
  anexo_path text,
  anexo_nome text check (anexo_nome is null or char_length(anexo_nome) <= 200),
  anexo_tipo text,
  anexo_tamanho int check (anexo_tamanho is null or anexo_tamanho between 0 and 10485760),
  created_at timestamptz not null default now(),
  check (btrim(coalesce(corpo, '')) <> '' or anexo_path is not null),
  check (anexo_path is null or anexo_nome is not null)
);

create index processo_etapas_processo_idx on public.processo_etapas (processo_id, posicao);
create index processo_mensagens_processo_idx on public.processo_mensagens (processo_id, created_at);

-- até quando cada pessoa leu a conversa (para marcar o que é novo)
create table public.processo_leituras (
  processo_id uuid not null references public.processos (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lida_ate timestamptz not null default now(),
  primary key (processo_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Quem pode ver e escrever (security definer: não reaplica a RLS e evita ciclo)
-- ---------------------------------------------------------------------------

create function public.pode_ver_processo(p_id uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.processos p
    where p.id = p_id
      and (p.pessoa_id = auth.uid() or public.is_empresa_member(p.empresa_id) or public.is_admin())
  );
$$;

-- Os dois lados escrevem enquanto o processo não foi encerrado. O superadmin só lê.
create function public.pode_escrever_processo(p_id uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.processos p
    where p.id = p_id
      and p.status <> 'encerrado'
      and (p.pessoa_id = auth.uid() or public.is_empresa_member(p.empresa_id))
  );
$$;

create function public.pode_acessar_arquivo_processo(p_nome text, p_escrever boolean)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select case
    when (string_to_array(p_nome, '/'))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then case when p_escrever
        then public.pode_escrever_processo(((string_to_array(p_nome, '/'))[1])::uuid)
        else public.pode_ver_processo(((string_to_array(p_nome, '/'))[1])::uuid)
      end
    else false
  end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.processos enable row level security;
alter table public.processo_etapas enable row level security;
alter table public.processo_mensagens enable row level security;
alter table public.processo_leituras enable row level security;

-- Leitura só para quem participa (e o superadmin). Não há policy de insert/update/delete
-- em processos nem em etapas: elas mudam só pelas funções processo_* abaixo.
create policy "processos_select" on public.processos
  for select using (pessoa_id = auth.uid() or public.is_empresa_member(empresa_id) or public.is_admin());

create policy "processo_etapas_select" on public.processo_etapas
  for select using (public.pode_ver_processo(processo_id));

create policy "processo_mensagens_select" on public.processo_mensagens
  for select using (public.pode_ver_processo(processo_id));

-- Envio: sempre em nome de quem está logado. "feedback" é da empresa; "sistema" nunca vem do cliente.
create policy "processo_mensagens_insert" on public.processo_mensagens
  for insert with check (
    autor_id = auth.uid()
    and tipo in ('mensagem', 'feedback')
    and public.pode_escrever_processo(processo_id)
    and (
      tipo = 'mensagem'
      or exists (
        select 1 from public.processos p
        where p.id = processo_id and public.is_empresa_member(p.empresa_id)
      )
    )
  );

create policy "processo_leituras_select_own" on public.processo_leituras
  for select using (user_id = auth.uid());

-- Valida a mensagem antes de gravar: etapa do mesmo processo, anexo na pasta do processo.
create function public.processo_mensagens_before_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  atual uuid;
begin
  select etapa_atual_id into atual from public.processos where id = new.processo_id;

  if new.etapa_id is null then
    new.etapa_id := atual;
  elsif not exists (select 1 from public.processo_etapas e where e.id = new.etapa_id and e.processo_id = new.processo_id) then
    raise exception 'etapa não pertence a este processo' using errcode = '23514';
  end if;

  if new.anexo_path is not null and split_part(new.anexo_path, '/', 1) <> new.processo_id::text then
    raise exception 'anexo fora da pasta do processo' using errcode = '23514';
  end if;

  new.corpo := nullif(btrim(coalesce(new.corpo, '')), '');
  return new;
end;
$$;

create trigger processo_mensagens_before_insert before insert on public.processo_mensagens
  for each row execute procedure public.processo_mensagens_before_insert();

-- Cada mensagem (inclusive aviso do sistema) conta como atividade do processo.
create function public.processo_mensagens_after_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.processos
  set ultima_atividade_em = new.created_at,
      ultima_atividade_por = coalesce(new.autor_id, auth.uid())
  where id = new.processo_id;
  return new;
end;
$$;

create trigger processo_mensagens_after_insert after insert on public.processo_mensagens
  for each row execute procedure public.processo_mensagens_after_insert();

-- ---------------------------------------------------------------------------
-- Modelos de etapas
-- ---------------------------------------------------------------------------

-- O mesmo modelo existe em src/lib/hiring.ts (usado como ponto de partida no editor da vaga).
create function public.processo_modelo_padrao(p_origem text)
returns jsonb
language sql immutable
as $$
  select case when p_origem = 'autonomo' then
    '[
      {"tipo":"recebida","titulo":"Convite enviado","descricao":"A empresa chamou você para conversar sobre um serviço."},
      {"tipo":"entrevista","titulo":"Conversa inicial","descricao":"Vocês alinham o que precisa ser feito, prazo e local."},
      {"tipo":"outra","titulo":"Proposta e combinados","descricao":"A empresa envia a proposta e vocês acertam valor e forma de pagamento."},
      {"tipo":"documentos","titulo":"Documentos","descricao":"Envio e conferência dos documentos necessários."},
      {"tipo":"conclusao","titulo":"Contratação","descricao":"Tudo combinado: serviço contratado."}
    ]'::jsonb
  else
    '[
      {"tipo":"recebida","titulo":"Candidatura recebida","descricao":"A empresa recebeu seu currículo."},
      {"tipo":"triagem","titulo":"Análise do currículo","descricao":"A empresa avalia seu currículo e decide quem segue."},
      {"tipo":"entrevista","titulo":"Entrevista","descricao":"Conversa com a empresa para se conhecerem melhor."},
      {"tipo":"documentos","titulo":"Análise de documentos","descricao":"Você envia os documentos pedidos e a empresa confere."},
      {"tipo":"aguardando","titulo":"Aguardando posicionamento","descricao":"A empresa está decidindo e vai dar uma resposta."},
      {"tipo":"conclusao","titulo":"Contratação","descricao":"Tudo certo: você foi contratado(a)."}
    ]'::jsonb
  end;
$$;

-- Funções internas: não ficam expostas para chamada direta pela API.
create function public.processo_criar_etapas(p_processo uuid, p_modelo jsonb)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  item jsonb;
  pos int := 0;
  novo uuid;
  primeira uuid;
  tipos text[] := array['recebida', 'triagem', 'entrevista', 'documentos', 'aguardando', 'conclusao', 'outra'];
begin
  for item in select * from jsonb_array_elements(p_modelo) loop
    pos := pos + 1;
    insert into public.processo_etapas (processo_id, posicao, tipo, titulo, descricao, status, iniciada_em)
    values (
      p_processo,
      pos,
      case when (item ->> 'tipo') = any (tipos) then item ->> 'tipo' else 'outra' end,
      left(coalesce(nullif(btrim(item ->> 'titulo'), ''), 'Etapa ' || pos), 80),
      left(nullif(btrim(coalesce(item ->> 'descricao', '')), ''), 300),
      case when pos = 1 then 'atual' else 'pendente' end,
      case when pos = 1 then now() end
    )
    returning id into novo;
    if pos = 1 then primeira := novo; end if;
  end loop;

  update public.processos set etapa_atual_id = primeira where id = p_processo;
end;
$$;

-- Mantém candidaturas.status (usado em listas e no painel do superadmin) de acordo com o processo.
create function public.processo_sincronizar_candidatura(p_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  p public.processos;
  tipo_atual text;
  novo text;
begin
  select * into p from public.processos where id = p_id;
  if not found or p.candidatura_id is null then
    return;
  end if;

  select tipo into tipo_atual from public.processo_etapas where id = p.etapa_atual_id;

  novo := case
    when p.status = 'contratado' then 'aprovada'
    when p.status = 'encerrado' and p.motivo = 'desistencia' then 'desistiu'
    when p.status = 'encerrado' then 'rejeitada'
    when tipo_atual = 'recebida' then 'enviada'
    when tipo_atual = 'entrevista' then 'entrevista'
    else 'em_analise'
  end;

  perform set_config('app.processo_sync', 'on', true);
  update public.candidaturas set status = novo where id = p.candidatura_id and status <> novo;
  perform set_config('app.processo_sync', 'off', true);
end;
$$;

revoke all on function public.processo_criar_etapas(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.processo_sincronizar_candidatura(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Candidatura nova abre o processo
-- ---------------------------------------------------------------------------

create function public.candidaturas_criar_processo()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v record;
  nome text;
  proc uuid;
begin
  select vg.title, vg.empresa_id, vg.etapas_selecao, e.nome_fantasia
  into v
  from public.vagas vg
  join public.empresas e on e.id = vg.empresa_id
  where vg.id = new.vaga_id;

  -- vaga sem empresa (criada pelo superadmin) não tem acompanhamento
  if not found then
    return new;
  end if;

  select coalesce(nullif(btrim(full_name), ''), 'Candidato') into nome from public.profiles where id = new.candidato_id;

  insert into public.processos (origem, empresa_id, pessoa_id, candidatura_id, vaga_id, titulo, empresa_nome, pessoa_nome, ultima_atividade_por)
  values ('candidatura', v.empresa_id, new.candidato_id, new.id, new.vaga_id, v.title, v.nome_fantasia, nome, new.candidato_id)
  returning id into proc;

  perform public.processo_criar_etapas(proc, coalesce(v.etapas_selecao, public.processo_modelo_padrao('candidatura')));

  insert into public.processo_mensagens (processo_id, autor_id, tipo, corpo)
  values (proc, null, 'sistema', 'Candidatura enviada. Acompanhe cada etapa por aqui.');

  return new;
end;
$$;

create trigger candidaturas_criar_processo after insert on public.candidaturas
  for each row execute procedure public.candidaturas_criar_processo();

-- ---------------------------------------------------------------------------
-- Ações sobre o processo (únicas formas de mudar etapa ou situação)
-- ---------------------------------------------------------------------------

-- Empresa: passa para a próxima etapa ou para uma etapa escolhida (para frente ou para trás),
-- com um feedback opcional sobre a etapa que ficou para trás.
create function public.processo_avancar(p_processo uuid, p_etapa uuid default null, p_mensagem text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  p public.processos;
  atual public.processo_etapas;
  alvo public.processo_etapas;
  msg text := nullif(btrim(coalesce(p_mensagem, '')), '');
begin
  select * into p from public.processos where id = p_processo for update;
  if not found or not public.is_empresa_member(p.empresa_id) then
    raise exception 'Processo não encontrado.' using errcode = '42501';
  end if;
  if p.status <> 'em_andamento' then
    raise exception 'Este processo já foi encerrado.' using errcode = '23514';
  end if;

  select * into atual from public.processo_etapas where id = p.etapa_atual_id;

  if p_etapa is null then
    select * into alvo from public.processo_etapas
    where processo_id = p.id and posicao > atual.posicao
    order by posicao limit 1;
  else
    select * into alvo from public.processo_etapas where id = p_etapa and processo_id = p.id;
  end if;
  if not found then
    raise exception 'Não há para onde avançar.' using errcode = '23514';
  end if;
  if alvo.id = atual.id then
    raise exception 'O processo já está nessa etapa.' using errcode = '23514';
  end if;

  if msg is not null then
    insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo)
    values (p.id, atual.id, auth.uid(), 'feedback', msg);
  end if;

  if alvo.posicao > atual.posicao then
    -- a etapa de onde sai fica concluída; as que ficam no meio são puladas
    update public.processo_etapas
    set status = case when id = atual.id then 'concluida' else 'pulada' end,
        concluida_em = now()
    where processo_id = p.id and posicao >= atual.posicao and posicao < alvo.posicao;
  else
    -- voltou: o que vem depois da etapa escolhida volta a ficar pendente
    update public.processo_etapas
    set status = 'pendente', iniciada_em = null, concluida_em = null
    where processo_id = p.id and posicao > alvo.posicao;
  end if;

  update public.processo_etapas
  set status = 'atual', iniciada_em = coalesce(iniciada_em, now()), concluida_em = null
  where id = alvo.id;

  update public.processos set etapa_atual_id = alvo.id where id = p.id;

  insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo)
  values (
    p.id, alvo.id, null, 'sistema',
    case when alvo.posicao > atual.posicao
      then 'Etapa "' || atual.titulo || '" concluída. Agora: "' || alvo.titulo || '".'
      else 'O processo voltou para a etapa "' || alvo.titulo || '".'
    end
  );

  perform public.processo_sincronizar_candidatura(p.id);
end;
$$;

-- Empresa: conclui o processo com a contratação.
create function public.processo_contratar(p_processo uuid, p_mensagem text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  p public.processos;
  ultima public.processo_etapas;
  msg text := nullif(btrim(coalesce(p_mensagem, '')), '');
begin
  select * into p from public.processos where id = p_processo for update;
  if not found or not public.is_empresa_member(p.empresa_id) then
    raise exception 'Processo não encontrado.' using errcode = '42501';
  end if;
  if p.status <> 'em_andamento' then
    raise exception 'Este processo já foi encerrado.' using errcode = '23514';
  end if;

  select * into ultima from public.processo_etapas where processo_id = p.id order by posicao desc limit 1;

  if msg is not null then
    insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo)
    values (p.id, p.etapa_atual_id, auth.uid(), 'feedback', msg);
  end if;

  update public.processo_etapas
  set status = case when id = p.etapa_atual_id or id = ultima.id then 'concluida' else 'pulada' end,
      iniciada_em = coalesce(iniciada_em, now()),
      concluida_em = now()
  where processo_id = p.id and status in ('atual', 'pendente');

  update public.processos
  set status = 'contratado', etapa_atual_id = ultima.id, concluido_em = now()
  where id = p.id;

  insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo)
  values (p.id, ultima.id, null, 'sistema', 'Contratação concluída. Parabéns!');

  perform public.processo_sincronizar_candidatura(p.id);
end;
$$;

-- Empresa: encerra sem contratar, com um feedback para a pessoa.
create function public.processo_encerrar(p_processo uuid, p_mensagem text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  p public.processos;
  msg text := nullif(btrim(coalesce(p_mensagem, '')), '');
begin
  select * into p from public.processos where id = p_processo for update;
  if not found or not public.is_empresa_member(p.empresa_id) then
    raise exception 'Processo não encontrado.' using errcode = '42501';
  end if;
  if p.status <> 'em_andamento' then
    raise exception 'Este processo já foi encerrado.' using errcode = '23514';
  end if;

  if msg is not null then
    insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo)
    values (p.id, p.etapa_atual_id, auth.uid(), 'feedback', msg);
  end if;

  update public.processos
  set status = 'encerrado', motivo = 'reprovado', concluido_em = now()
  where id = p.id;

  insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo)
  values (p.id, p.etapa_atual_id, null, 'sistema', 'A empresa encerrou o processo sem seguir com a contratação.');

  perform public.processo_sincronizar_candidatura(p.id);
end;
$$;

-- Empresa: reabre um processo que ela mesma encerrou.
create function public.processo_reabrir(p_processo uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  p public.processos;
begin
  select * into p from public.processos where id = p_processo for update;
  if not found or not public.is_empresa_member(p.empresa_id) then
    raise exception 'Processo não encontrado.' using errcode = '42501';
  end if;
  if p.status <> 'encerrado' or p.motivo <> 'reprovado' then
    raise exception 'Só dá para reabrir um processo encerrado pela empresa.' using errcode = '23514';
  end if;

  update public.processos set status = 'em_andamento', motivo = null, concluido_em = null where id = p.id;

  insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo)
  values (p.id, p.etapa_atual_id, null, 'sistema', 'A empresa reabriu o processo.');

  perform public.processo_sincronizar_candidatura(p.id);
end;
$$;

-- Pessoa acompanhada: desiste do processo.
create function public.processo_desistir(p_processo uuid, p_mensagem text default null)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  p public.processos;
  msg text := nullif(btrim(coalesce(p_mensagem, '')), '');
begin
  select * into p from public.processos where id = p_processo for update;
  if not found or p.pessoa_id is distinct from auth.uid() then
    raise exception 'Processo não encontrado.' using errcode = '42501';
  end if;
  if p.status <> 'em_andamento' then
    raise exception 'Este processo já foi encerrado.' using errcode = '23514';
  end if;

  if msg is not null then
    insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo)
    values (p.id, p.etapa_atual_id, auth.uid(), 'mensagem', msg);
  end if;

  update public.processos
  set status = 'encerrado', motivo = 'desistencia', concluido_em = now()
  where id = p.id;

  insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo)
  values (p.id, p.etapa_atual_id, null, 'sistema', p.pessoa_nome || ' desistiu do processo.');

  perform public.processo_sincronizar_candidatura(p.id);
end;
$$;

-- Empresa: abre um processo com um autônomo (a partir do perfil dele). Se já existe um em andamento, devolve esse.
create function public.processo_iniciar_contratacao(p_empresa uuid, p_autonomo uuid, p_mensagem text default null)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  emp record;
  existente uuid;
  nome text;
  proc uuid;
  msg text := nullif(btrim(coalesce(p_mensagem, '')), '');
begin
  if auth.uid() is null or not public.is_empresa_member(p_empresa) then
    raise exception 'Empresa não encontrada.' using errcode = '42501';
  end if;

  select nome_fantasia, status into emp from public.empresas where id = p_empresa;
  if emp.status <> 'active' then
    raise exception 'A empresa precisa estar ativa para contratar.' using errcode = '23514';
  end if;

  if p_autonomo = auth.uid() then
    raise exception 'Você não pode abrir um processo com você mesmo.' using errcode = '23514';
  end if;
  if not exists (
    select 1 from public.autonomo_profiles a
    where a.id = p_autonomo and a.status = 'active' and public.is_profile_active(a.id)
  ) then
    raise exception 'Profissional não encontrado.' using errcode = '23514';
  end if;

  select id into existente from public.processos
  where empresa_id = p_empresa and pessoa_id = p_autonomo and origem = 'autonomo' and status = 'em_andamento';
  if existente is not null then
    return existente;
  end if;

  select coalesce(nullif(btrim(full_name), ''), 'Profissional') into nome from public.profiles where id = p_autonomo;

  insert into public.processos (origem, empresa_id, pessoa_id, titulo, empresa_nome, pessoa_nome, ultima_atividade_por)
  values ('autonomo', p_empresa, p_autonomo, 'Contratação de serviço', emp.nome_fantasia, nome, auth.uid())
  returning id into proc;

  perform public.processo_criar_etapas(proc, public.processo_modelo_padrao('autonomo'));

  insert into public.processo_mensagens (processo_id, autor_id, tipo, corpo)
  values (proc, null, 'sistema', emp.nome_fantasia || ' quer contratar um serviço. Acompanhem cada etapa por aqui.');

  if msg is not null then
    insert into public.processo_mensagens (processo_id, autor_id, tipo, corpo)
    values (proc, auth.uid(), 'mensagem', msg);
  end if;

  return proc;
end;
$$;

-- Marca a conversa como lida por quem está logado.
create function public.processo_marcar_lido(p_processo uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null or not public.pode_ver_processo(p_processo) then
    return;
  end if;
  insert into public.processo_leituras (processo_id, user_id, lida_ate)
  values (p_processo, auth.uid(), now())
  on conflict (processo_id, user_id) do update set lida_ate = excluded.lida_ate;
end;
$$;

revoke all on function public.processo_avancar(uuid, uuid, text) from public, anon;
revoke all on function public.processo_contratar(uuid, text) from public, anon;
revoke all on function public.processo_encerrar(uuid, text) from public, anon;
revoke all on function public.processo_reabrir(uuid) from public, anon;
revoke all on function public.processo_desistir(uuid, text) from public, anon;
revoke all on function public.processo_iniciar_contratacao(uuid, uuid, text) from public, anon;
revoke all on function public.processo_marcar_lido(uuid) from public, anon;
grant execute on function public.processo_avancar(uuid, uuid, text) to authenticated;
grant execute on function public.processo_contratar(uuid, text) to authenticated;
grant execute on function public.processo_encerrar(uuid, text) to authenticated;
grant execute on function public.processo_reabrir(uuid) to authenticated;
grant execute on function public.processo_desistir(uuid, text) to authenticated;
grant execute on function public.processo_iniciar_contratacao(uuid, uuid, text) to authenticated;
grant execute on function public.processo_marcar_lido(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Documentos: bucket PRIVADO (arquivos só abrem por link temporário, para quem participa)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'processo-docs', 'processo-docs', false, 10485760,
  array[
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "processo_docs_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'processo-docs' and public.pode_acessar_arquivo_processo(name, false));

create policy "processo_docs_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'processo-docs' and public.pode_acessar_arquivo_processo(name, true));

-- ---------------------------------------------------------------------------
-- Candidaturas que já existem entram no acompanhamento
-- ---------------------------------------------------------------------------

do $$
declare
  c record;
  proc uuid;
  nome text;
  alvo int;
  total int;
  situacao text;
begin
  for c in
    select ca.id, ca.candidato_id, ca.vaga_id, ca.status, ca.created_at, ca.updated_at,
           vg.title, vg.empresa_id, vg.etapas_selecao, e.nome_fantasia
    from public.candidaturas ca
    join public.vagas vg on vg.id = ca.vaga_id
    join public.empresas e on e.id = vg.empresa_id
    where not exists (select 1 from public.processos p where p.candidatura_id = ca.id)
  loop
    select coalesce(nullif(btrim(full_name), ''), 'Candidato') into nome from public.profiles where id = c.candidato_id;

    insert into public.processos (origem, empresa_id, pessoa_id, candidatura_id, vaga_id, titulo, empresa_nome, pessoa_nome, created_at)
    values ('candidatura', c.empresa_id, c.candidato_id, c.id, c.vaga_id, c.title, c.nome_fantasia, nome, c.created_at)
    returning id into proc;

    perform public.processo_criar_etapas(proc, coalesce(c.etapas_selecao, public.processo_modelo_padrao('candidatura')));

    select count(*) into total from public.processo_etapas where processo_id = proc;

    -- etapa que corresponde à situação que a candidatura já tinha
    alvo := case c.status
      when 'em_analise' then coalesce((select posicao from public.processo_etapas where processo_id = proc and tipo = 'triagem' order by posicao limit 1), 2)
      when 'entrevista' then coalesce((select posicao from public.processo_etapas where processo_id = proc and tipo = 'entrevista' order by posicao limit 1), least(3, total))
      when 'rejeitada' then least(2, total)
      when 'aprovada' then total
      else 1
    end;

    update public.processo_etapas
    set status = case when posicao < alvo then 'concluida' when posicao = alvo then 'atual' else 'pendente' end,
        iniciada_em = case when posicao <= alvo then c.created_at end,
        concluida_em = case when posicao < alvo then c.updated_at end
    where processo_id = proc;

    update public.processo_etapas set status = 'concluida', concluida_em = c.updated_at
    where processo_id = proc and posicao = alvo and c.status = 'aprovada';

    situacao := case c.status
      when 'aprovada' then 'contratado'
      when 'rejeitada' then 'encerrado'
      else 'em_andamento'
    end;

    update public.processos
    set etapa_atual_id = (select id from public.processo_etapas where processo_id = proc and posicao = alvo),
        status = situacao,
        motivo = case when situacao = 'encerrado' then 'reprovado' end,
        concluido_em = case when situacao <> 'em_andamento' then c.updated_at end,
        ultima_atividade_em = c.updated_at
    where id = proc;

    insert into public.processo_mensagens (processo_id, etapa_id, autor_id, tipo, corpo, created_at)
    values (
      proc,
      (select id from public.processo_etapas where processo_id = proc and posicao = alvo),
      null, 'sistema', 'Candidatura enviada.', c.created_at
    );
  end loop;
end;
$$;
