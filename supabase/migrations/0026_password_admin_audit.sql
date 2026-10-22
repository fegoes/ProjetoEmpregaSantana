create table public.admin_password_events (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid not null,
 target_id uuid not null,
 created_at timestamptz not null default now(),
 result text not null default 'pending' check(result in ('pending','success','failed'))
);
alter table public.admin_password_events enable row level security;
create policy password_events_read_admin on public.admin_password_events for select to authenticated using(public.is_admin());
grant select on public.admin_password_events to authenticated;
create function public.reserve_password_change(target_user uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare event_id uuid;
begin
 if not public.is_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
 if not exists(select 1 from public.profiles where id=target_user) then raise exception 'Usuário indisponível' using errcode='23503'; end if;
 perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
 if (select count(*) from public.admin_password_events where actor_id=auth.uid() and created_at>now()-interval '10 minutes')>=5 then
  raise exception 'Limite de alterações atingido. Aguarde e tente novamente.' using errcode='P0001';
 end if;
 insert into public.admin_password_events(actor_id,target_id) values(auth.uid(),target_user) returning id into event_id;
 return event_id;
end; $$;
revoke all on function public.reserve_password_change(uuid) from public,anon;
grant execute on function public.reserve_password_change(uuid) to authenticated;
grant select,update on public.admin_password_events to service_role;
