// Verifica a sequência unificada num PostgreSQL local em memória, sem conexão remota.
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
const db = new PGlite()
try {
  await db.exec(`
    create schema auth; create schema storage;
    create role anon; create role authenticated; create role service_role bypassrls;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.role',true),'') $$;
    create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid, metadata jsonb);
    create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
    create function storage.extension(text) returns text language sql as $$select split_part($1,'.',-1)$$;
    grant usage on schema auth, public, storage to anon, authenticated, service_role;
  `)
  const files = (await readdir('supabase/migrations')).filter(f => f.endsWith('.sql')).sort()
  assert.equal(new Set(files.map(f => f.split('_')[0])).size, files.length, 'Números das migrations devem ser únicos')
  for (const file of files) {
    // Seeds dependem do serviço Auth/pgcrypto do Supabase, não do schema da aplicação.
    if (/seed|fixture/.test(file)) continue
    const sql = (await readFile(`supabase/migrations/${file}`, 'utf8')).replace('create extension if not exists "pgcrypto";', '')
    try { await db.exec(sql) } catch (error) { throw new Error(`${file}: ${error.message}`, { cause: error }) }
    console.log(`OK ${file}`)
  }
  const { rows } = await db.query(`select table_name from information_schema.tables where table_schema='public'`)
  for (const table of ['artigos','site_appearance','record_types','processos','processo_etapas','admin_password_events']) assert.ok(rows.some(r => r.table_name === table), table)
  assert.equal((await db.query(`select count(*)::int as n from profiles where is_admin`)).rows[0].n, 0)
  // Verifica a regra final, após todas as substituições de funções pelas branches.
  await db.exec(`insert into auth.users(id,email) values ('00000000-0000-4000-8000-000000000001','ordinary@example.test');
    select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
    select set_config('request.jwt.claim.role','authenticated',false);`)
  await assert.rejects(db.exec(`update profiles set is_admin=true where id=auth.uid()`), e => e.code === '42501')
  console.log('OK sequência unificada, tabelas editoriais/contratação e proteção administrativa final.')
} finally { await db.close() }
