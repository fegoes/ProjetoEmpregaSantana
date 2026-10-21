// PostgreSQL isolado em memória. Exercita a migration real com helpers de Auth
// equivalentes aos claims usados no Supabase; não valida um projeto remoto.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const db = new PGlite()
let checks = 0
try {
  await db.exec(`
    create schema auth;
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims',true)::jsonb ->> 'sub','')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select current_setting('request.jwt.claims',true)::jsonb ->> 'role' $$;
    grant usage on schema auth,public to anon,authenticated,service_role;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create table public.profiles (id uuid primary key references auth.users(id), email text, full_name text, is_admin boolean not null default false, is_active boolean not null default true);
    create table public.user_roles (user_id uuid references public.profiles(id), role text check(role in ('candidato','autonomo','empresa_owner')));
    create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select coalesce((select is_admin from profiles where id=auth.uid()),false) $$;
    create function public.protect_profiles_is_admin() returns trigger language plpgsql as $$ begin return new; end; $$;
    create trigger protect_profiles_is_admin before update on public.profiles for each row execute function public.protect_profiles_is_admin();
    alter table public.profiles enable row level security;
    create policy profiles_select on public.profiles for select using(id=auth.uid() or public.is_admin());
    create policy profiles_update on public.profiles for update using(id=auth.uid() or public.is_admin());
    grant select,update on public.profiles to authenticated;
    grant all on public.profiles to service_role;
    grant insert,select on public.user_roles to authenticated;
    create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email) values(new.id,new.email); return new; end; $$;
    create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
    select set_config('request.jwt.claims','{}',false);
    insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000001','admin@empregasantana-seed.com');
    update public.profiles set is_admin=true;
  `)
  await db.exec(await readFile(new URL('../../supabase/migrations/0023_restrict_admin_access.sql', import.meta.url), 'utf8'))
  const scalar = async sql => (await db.query(sql)).rows[0].value
  const check = async (name, condition) => { assert.ok(await condition, name); checks++; console.log(`OK ${name}`) }
  const claim = async (role, id) => {
    await db.exec('reset role')
    await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ role, sub: id })])
    if (role) await db.exec(`set role ${role}`)
  }
  const denied = async (name, sql, code = '42501') => {
    await assert.rejects(db.exec(sql), error => error.code === code, name)
    checks++; console.log(`OK ${name}`)
  }
  await check('fixture administrativa antiga perde privilégio', scalar('select not is_admin as value from public.profiles'))
  await db.exec(`insert into auth.users(id,email,raw_user_meta_data) values
    ('00000000-0000-4000-8000-000000000002','ordinary@example.test','{"is_admin":true,"role":"admin","full_name":"Usuário comum"}'),
    ('00000000-0000-4000-8000-000000000003','operator@example.test','{}'),
    ('00000000-0000-4000-8000-000000000004','inactive@example.test','{}'),
    ('00000000-0000-4000-8000-000000000005','service-target@example.test','{}');
    update public.profiles set is_admin=true where email in ('operator@example.test','inactive@example.test');
    update public.profiles set is_active=false where email='inactive@example.test';`)
  await check('metadata de cadastro não cria admin', scalar("select not is_admin and is_active as value from public.profiles where email='ordinary@example.test'"))
  await claim('authenticated','00000000-0000-4000-8000-000000000002')
  await check('usuário comum não é administrador', scalar('select not public.is_admin() as value'))
  await denied('autopromoção é recusada no banco', "update public.profiles set is_admin=true where id=auth.uid()")
  await db.exec("update public.profiles set full_name='Nome atualizado' where id=auth.uid()")
  await check('edição normal do próprio perfil permanece disponível', scalar("select full_name='Nome atualizado' as value from public.profiles where id=auth.uid()"))
  await denied('admin não é papel público válido', "insert into public.user_roles values(auth.uid(),'admin')", '23514')
  await claim('authenticated','00000000-0000-4000-8000-000000000003')
  await check('operador explicitamente provisionado é administrador', scalar('select public.is_admin() as value'))
  await denied('admin da interface não promove outro usuário', "update public.profiles set is_admin=true where email='ordinary@example.test'")
  await denied('admin da interface não muda o próprio privilégio', 'update public.profiles set is_admin=false where id=auth.uid()')
  await claim('authenticated','00000000-0000-4000-8000-000000000004')
  await check('admin desativado perde autorização', scalar('select not public.is_admin() as value'))
  await db.exec('update public.profiles set is_active=true where id=auth.uid()')
  await check('conta desativada não se reativa', scalar('select not is_active as value from public.profiles where id=auth.uid()'))
  await claim('service_role', null)
  await db.exec("update public.profiles set is_admin=true where email='service-target@example.test'")
  await check('operação de serviço privilegiada pode provisionar', scalar("select is_admin as value from public.profiles where email='service-target@example.test'"))
  await db.exec("update public.profiles set is_admin=false where email='service-target@example.test'")
  await check('operação de serviço privilegiada pode revogar', scalar("select not is_admin as value from public.profiles where email='service-target@example.test'"))
  await claim('anon', null)
  await check('visitante não é administrador', scalar('select not public.is_admin() as value'))
  await claim(null, null)
  // Concede INSERT somente no banco isolado para testar o trigger além da RLS.
  await db.exec('grant insert on public.profiles to authenticated; create policy test_insert on public.profiles for insert with check (id=auth.uid());')
  await db.exec("insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000006','insert-attempt@example.test'); delete from public.profiles where email='insert-attempt@example.test';")
  await claim('authenticated','00000000-0000-4000-8000-000000000006')
  await denied('inserção direta de perfil admin também é recusada', "insert into public.profiles(id,is_admin) values(auth.uid(),true)")
  console.log(`${checks} verificações PostgreSQL aprovadas em banco isolado.`)
} finally {
  await db.close()
}
