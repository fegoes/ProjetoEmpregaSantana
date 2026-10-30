import {PGlite} from '@electric-sql/pglite'
import {readFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
const db=new PGlite(), actor='11111111-1111-4111-8111-111111111111',target='22222222-2222-4222-8222-222222222222'
try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;create function public.is_admin() returns boolean language sql stable as $$select coalesce(current_setting('test.admin',true),'no')='yes'$$;create table profiles(id uuid primary key);insert into profiles values('${actor}'),('${target}');grant usage on schema auth to authenticated;`)
 await db.exec(await readFile('supabase/migrations/0026_password_admin_audit.sql','utf8'))
 await db.exec(`select set_config('test.uid','${actor}',false);set role authenticated`)
 await assert.rejects(db.exec(`select reserve_password_change('${target}')`),e=>e.code==='42501')
 await db.exec(`select set_config('test.admin','yes',false)`)
 for(let n=0;n<5;n++)await db.exec(`select reserve_password_change('${target}')`)
 await assert.rejects(db.exec(`select reserve_password_change('${target}')`),e=>e.code==='P0001')
 await assert.rejects(db.exec(`update admin_password_events set result='success'`),e=>e.code==='42501')
 await db.exec(`select set_config('test.admin','no',false)`)
 assert.equal((await db.query('select * from admin_password_events')).rows.length,0)
 await db.exec('reset role')
 const rows=(await db.query('select * from admin_password_events')).rows
 assert.equal(rows.length,5);assert(!Object.keys(rows[0]).some(k=>/password|senha/i.test(k)))
 console.log('OK RPC bloqueia conta comum, limita cinco tentativas, impede alteração de logs e não armazena senhas; 5 reservas válidas.')
}finally{await db.close()}
