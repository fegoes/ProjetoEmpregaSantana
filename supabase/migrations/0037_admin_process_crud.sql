-- CRUD administrativo de seleções sem alterar a autorização das ações das empresas.
begin;
create function public.admin_manage_process(p_action text,p_id uuid default null,p_data jsonb default '{}')
returns uuid language plpgsql security definer set search_path=public as $$
declare
  proc public.processos; emp public.empresas; job public.vagas;
  person uuid; cv uuid; application uuid; result uuid; origin text; stage public.processo_etapas;
  next_status text; person_name text;
begin
  if not public.is_admin() then raise exception 'Acesso reservado à administração.' using errcode='42501'; end if;
  if p_action='create' then
    origin:=p_data->>'origem';
    if origin='candidatura' then
      select * into job from vagas where id=(p_data->>'vaga_id')::uuid;
      if not found or job.empresa_id is null then raise exception 'Selecione uma vaga vinculada a empresa.' using errcode='23514'; end if;
      select * into emp from empresas where id=job.empresa_id;
      cv:=(p_data->>'cv_id')::uuid;
      select candidato_id into person from cv_variants where id=cv;
      if not found then raise exception 'Currículo não encontrado.' using errcode='23503'; end if;
      insert into candidaturas(vaga_id,candidato_id,cv_variant_id,cover_note)
      values(job.id,person,cv,'Candidatura cadastrada pela administração.') returning id into application;
      select id into result from processos where candidatura_id=application;
    elsif origin='autonomo' then
      person:=(p_data->>'pessoa_id')::uuid;
      select * into emp from empresas where id=(p_data->>'empresa_id')::uuid for update;
      if not found then raise exception 'Empresa não encontrada.' using errcode='23503'; end if;
      if not exists(select 1 from autonomo_profiles where id=person) then raise exception 'Autônomo não encontrado.' using errcode='23503'; end if;
      if exists(select 1 from processos where origem='autonomo' and empresa_id=emp.id and pessoa_id=person and status='em_andamento') then
        raise exception 'Já existe uma contratação em andamento para este profissional e esta empresa.' using errcode='23505';
      end if;
      select coalesce(full_name,email,'Profissional') into person_name from profiles where id=person;
      insert into processos(origem,empresa_id,pessoa_id,titulo,empresa_nome,pessoa_nome,ultima_atividade_por)
      values('autonomo',emp.id,person,coalesce(nullif(trim(p_data->>'titulo'),''),'Contratação de serviço'),emp.nome_fantasia,person_name,auth.uid()) returning id into result;
      perform public.processo_criar_etapas(result,public.processo_modelo_padrao('autonomo'));
    else raise exception 'Origem inválida.' using errcode='23514'; end if;
    insert into processo_mensagens(processo_id,tipo,corpo) values(result,'sistema','Processo cadastrado pela administração.');
    return result;
  end if;
  select * into proc from processos where id=p_id for update;
  if not found then raise exception 'Processo não encontrado.' using errcode='P0002'; end if;
  if p_action='delete' then
    if proc.candidatura_id is not null then delete from candidaturas where id=proc.candidatura_id;
    else delete from processos where id=p_id; end if;
    return p_id;
  elsif p_action<>'update' then raise exception 'Ação inválida.' using errcode='23514'; end if;
  next_status:=p_data->>'status';
  if next_status not in ('em_andamento','contratado','encerrado') or next_status is null then raise exception 'Situação inválida.' using errcode='23514'; end if;
  if next_status='contratado' then select * into stage from processo_etapas where processo_id=p_id order by posicao desc limit 1;
  else select * into stage from processo_etapas where processo_id=p_id and id=coalesce(nullif(p_data->>'etapa_id','')::uuid,proc.etapa_atual_id); end if;
  if not found then raise exception 'A etapa não pertence a este processo.' using errcode='23514'; end if;
  update processo_etapas set status=case when next_status='contratado' or posicao<stage.posicao then 'concluida' when id=stage.id then 'atual' else 'pendente' end,
    concluida_em=case when next_status='contratado' or posicao<stage.posicao then coalesce(concluida_em,now()) else null end,
    iniciada_em=case when posicao<=stage.posicao then coalesce(iniciada_em,now()) else null end where processo_id=p_id;
  update processos set titulo=coalesce(nullif(trim(p_data->>'titulo'),''),titulo),status=next_status,
    motivo=case when next_status='encerrado' then coalesce(nullif(p_data->>'motivo',''),'reprovado') else null end,
    etapa_atual_id=stage.id,concluido_em=case when next_status='em_andamento' then null else now() end,
    ultima_atividade_em=now(),ultima_atividade_por=auth.uid() where id=p_id;
  perform public.processo_sincronizar_candidatura(p_id);
  insert into processo_mensagens(processo_id,tipo,corpo) values(p_id,'sistema','Processo atualizado pela administração: '||next_status||'.');
  return p_id;
end; $$;
revoke all on function public.admin_manage_process(text,uuid,jsonb) from public;
grant execute on function public.admin_manage_process(text,uuid,jsonb) to authenticated;
commit;
