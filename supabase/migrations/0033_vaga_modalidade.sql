-- EmpregaSantana — modalidade da vaga (presencial, remota, híbrida) gerenciada pelo superadmin
--
-- A modalidade é uma lista de categorias como as outras (tela /admin/categorias),
-- então o superadmin pode renomear, ocultar ou acrescentar opções. A vaga
-- guarda o slug escolhido. O campo antigo is_remote continua existindo e é
-- mantido de acordo com a modalidade, para nada que já o usa deixar de funcionar.

alter table public.categories drop constraint if exists categories_kind_check;
alter table public.categories
  add constraint categories_kind_check check (kind in ('vaga', 'autonomo', 'both', 'empresa', 'modalidade'));

insert into public.categories (slug, label, kind) values
  ('modalidade-presencial', 'Presencial', 'modalidade'),
  ('modalidade-remota', 'Remota', 'modalidade'),
  ('modalidade-hibrida', 'Híbrida', 'modalidade')
on conflict (slug) do nothing;

-- Apagar uma modalidade em uso continua bloqueado (chave estrangeira): ela só pode ser ocultada.
alter table public.vagas add column modalidade text references public.categories (slug);

update public.vagas
set modalidade = case when is_remote then 'modalidade-remota' else 'modalidade-presencial' end
where modalidade is null;

-- Vaga com modalidade escolhida: is_remote acompanha. Vaga gravada só com is_remote
-- (cliente antigo): a modalidade é deduzida dele, se a opção ainda existir.
create function public.vagas_sync_modalidade()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.modalidade is not null then
    new.is_remote := (new.modalidade = 'modalidade-remota');
  elsif exists (
    select 1 from public.categories
    where slug = case when new.is_remote then 'modalidade-remota' else 'modalidade-presencial' end
  ) then
    new.modalidade := case when new.is_remote then 'modalidade-remota' else 'modalidade-presencial' end;
  end if;
  return new;
end;
$$;

create trigger vagas_sync_modalidade before insert or update on public.vagas
  for each row execute procedure public.vagas_sync_modalidade();
