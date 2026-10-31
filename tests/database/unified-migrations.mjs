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
  // CRUD do superadmin e estado final de autorização após todas as migrations.
  const admin='00000000-0000-4000-8000-000000000002'
  const person='00000000-0000-4000-8000-000000000003'
  const ordinary='00000000-0000-4000-8000-000000000001'
  await db.exec(`select set_config('request.jwt.claim.role','',false); select set_config('request.jwt.claim.sub','',false);
    insert into auth.users(id,email) values('${admin}','operator@example.test'),('${person}','person@example.test');
    update profiles set is_admin=true where id='${admin}';
    grant select,insert,update,delete on all tables in schema public to authenticated;
    grant select on all tables in schema public to anon;`)
  const claim=async(id)=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec("select set_config('request.jwt.claim.role','authenticated',false);set role authenticated")}
  await claim(ordinary)
  await assert.rejects(db.query('select admin_save_person($1,$2,$3)',[person,{},['candidato']]),e=>e.code==='42501')
  await assert.rejects(db.query('select admin_save_candidate($1,$2)',[person,{}]),e=>e.code==='42501')
  await claim(admin)
  await assert.rejects(db.query('select admin_save_person($1,$2,$3)',[person,{},['admin']]),e=>e.code==='23514')
  await assert.rejects(db.query('select admin_save_person($1,$2,$3)',[admin,{is_active:false},[]]),e=>e.code==='23514')
  await db.query('select admin_save_person($1,$2,$3)',[person,{full_name:'Pessoa editada',phone:'82999999999',city:'Santana do Ipanema',state:'AL'},['candidato']])
  assert.equal((await db.query('select full_name from profiles where id=$1',[person])).rows[0].full_name,'Pessoa editada')
  assert.equal((await db.query('select count(*)::int as n from candidato_profiles where id=$1',[person])).rows[0].n,1)
  await db.query('select admin_save_candidate($1,$2)',[person,{headline:'Assistente',desired_salary_min:'1800',availability:'imediata'}])
  assert.equal((await db.query('select headline from candidato_profiles where id=$1',[person])).rows[0].headline,'Assistente')
  const company=(await db.query("insert into empresas(owner_id,nome_fantasia) values($1,'Empresa CRUD') returning id",[admin])).rows[0].id
  const company2=(await db.query("insert into empresas(owner_id,nome_fantasia) values($1,'Segunda empresa') returning id",[admin])).rows[0].id
  await db.query('select admin_set_company_member($1,$2)',[company,person])
  await db.query('select admin_set_company_member($1,$2)',[company,person])
  assert.equal((await db.query('select count(*)::int as n from empresa_members where empresa_id=$1 and user_id=$2',[company,person])).rows[0].n,1)
  await db.query('select admin_set_company_member($1,$2)',[company2,person])
  await db.query('select admin_set_company_member($1,$2,true)',[company,person])
  assert.equal((await db.query("select count(*)::int as n from user_roles where user_id=$1 and role='empresa_owner'",[person])).rows[0].n,1)
  await assert.rejects(db.query('select admin_set_company_member($1,$2,true)',[company,admin]),e=>e.code==='23514')
  await db.query('select admin_set_company_member($1,$2,true)',[company2,person])
  assert.equal((await db.query("select count(*)::int as n from user_roles where user_id=$1 and role='empresa_owner'",[person])).rows[0].n,0)
  await db.query('select admin_delete_candidate($1)',[person])
  assert.equal((await db.query("select count(*)::int as n from user_roles where user_id=$1 and role='candidato'",[person])).rows[0].n,0)
  assert.equal((await db.query('select count(*)::int as n from profiles where id=$1',[person])).rows[0].n,1)
  console.log('OK CRUD de candidatos, papéis, vínculos idempotentes, múltiplas empresas e proteção do responsável.')
  await db.query('update empresas set owner_id=$1 where id=$2',[person,company])
  assert.equal((await db.query('select role from empresa_members where empresa_id=$1 and user_id=$2',[company,person])).rows[0].role,'owner')
  assert.equal((await db.query('select role from empresa_members where empresa_id=$1 and user_id=$2',[company,admin])).rows[0].role,'member')
  await claim(person)
  await assert.rejects(db.query('update empresas set owner_id=$1 where id=$2',[ordinary,company]),e=>e.code==='42501')
  await claim(admin)
  console.log('OK transferência de responsável mantém a equipe e é recusada a contas comuns.')


  const cat=(await db.query("insert into blog_categories(name,slug) values('Entrevistas','entrevistas') returning id")).rows[0].id
  const cat2=(await db.query("insert into blog_categories(name,slug) values('Currículos','curriculos') returning id")).rows[0].id
  const post=(await db.query("insert into artigos(slug,title,author_name,category_ids,location,status,published_at) values('post-agendado','Agenda','Equipe',$1,'Santana do Ipanema, AL','published',now()+interval '1 day') returning id",[[cat,cat2]])).rows[0].id
  assert.equal((await db.query('select category from artigos where id=$1',[post])).rows[0].category,'Entrevistas')
  await assert.rejects(db.query('delete from blog_categories where id=$1',[cat]),e=>e.code==='23503')
  await db.query("update blog_categories set name='Entrevistas de trabalho' where id=$1",[cat])
  assert.equal((await db.query('select category from artigos where id=$1',[post])).rows[0].category,'Entrevistas de trabalho')
  await claim(ordinary)
  await assert.rejects(db.query("insert into blog_categories(name,slug) values('Inválida','invalida')"),e=>e.code==='42501')
  assert.equal((await db.query('select count(*)::int as n from artigos where id=$1',[post])).rows[0].n,0)
  await db.exec("reset role;select set_config('request.jwt.claim.sub','',false);select set_config('request.jwt.claim.role','anon',false);set role anon")
  assert.equal((await db.query('select count(*)::int as n from artigos where id=$1',[post])).rows[0].n,0)
  await claim(admin)
  await db.query("update artigos set published_at=now()-interval '1 hour' where id=$1",[post])
  await db.exec("reset role;select set_config('request.jwt.claim.sub','',false);select set_config('request.jwt.claim.role','anon',false);set role anon")
  assert.equal((await db.query('select count(*)::int as n from artigos where id=$1',[post])).rows[0].n,1)
  await claim(admin)
  await db.query("update artigos set status='draft' where id=$1",[post])
  await db.exec("reset role;select set_config('request.jwt.claim.sub','',false);select set_config('request.jwt.claim.role','anon',false);set role anon")
  assert.equal((await db.query('select count(*)::int as n from artigos where id=$1',[post])).rows[0].n,0)
  console.log('OK blog: categorias múltiplas, renomeação, exclusão protegida, agendamento e rascunhos ocultos do público.')
  await claim(admin)
  await db.query('select admin_save_candidate($1,$2)',[person,{headline:'Candidato CRUD'}])
  const cv=(await db.query("insert into cv_variants(candidato_id,title) values($1,'Currículo administrativo') returning id",[person])).rows[0].id
  const job=(await db.query("insert into vagas(empresa_id,created_by,title,employment_type,pricing_model) values($1,$2,'Vaga CRUD','clt','fixed_salary') returning id",[company,admin])).rows[0].id
  const proc=(await db.query("select admin_manage_process('create',null,$1) as id",[{origem:'candidatura',vaga_id:job,cv_id:cv}])).rows[0].id
  assert.ok(proc)
  const stages=(await db.query('select id from processo_etapas where processo_id=$1 order by posicao',[proc])).rows
  await db.query("select admin_manage_process('update',$1,$2)",[proc,{titulo:'Seleção revisada',status:'contratado',etapa_id:stages[0].id}])
  assert.equal((await db.query('select status from candidaturas where vaga_id=$1',[job])).rows[0].status,'aprovada')
  await db.query("select admin_manage_process('update',$1,$2)",[proc,{status:'em_andamento',etapa_id:stages[0].id}])
  assert.equal((await db.query('select status from candidaturas where vaga_id=$1',[job])).rows[0].status,'enviada')
  await claim(ordinary)
  await assert.rejects(db.query("select admin_manage_process('delete',$1)",[proc]),e=>e.code==='42501')
  await claim(admin)
  await db.query("select admin_manage_process('delete',$1)",[proc])
  assert.equal((await db.query('select count(*)::int as n from candidaturas where vaga_id=$1',[job])).rows[0].n,0)
  assert.equal((await db.query('select count(*)::int as n from processo_etapas where processo_id=$1',[proc])).rows[0].n,0)
  await db.query('select admin_delete_candidate($1)',[person])
  assert.equal((await db.query('select count(*)::int as n from cv_variants where candidato_id=$1',[person])).rows[0].n,0)
  assert.equal((await db.query('select count(*)::int as n from profiles where id=$1',[person])).rows[0].n,1)
  assert.equal((await db.query('select owner_id from empresas where id=$1',[company])).rows[0].owner_id,person)
  console.log('OK CRUD administrativo de seleções, autorização, sincronização e exclusão do candidato preservando sua empresa e conta.')


  await db.exec("reset role;select set_config('request.jwt.claim.sub','',false);select set_config('request.jwt.claim.role','service_role',false)")
  const signupId='00000000-0000-4000-8000-000000000010'
  await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[signupId,'signup@example.test',{full_name:'Cadastro público',contact_phone:'82999990000',initial_role:'candidato',is_admin:true}])
  assert.equal((await db.query('select phone from profiles where id=$1',[signupId])).rows[0].phone,'82999990000')
  assert.equal((await db.query('select is_admin from profiles where id=$1',[signupId])).rows[0].is_admin,false)
  assert.equal((await db.query('select count(*)::int as n from candidato_profiles where id=$1',[signupId])).rows[0].n,1)
  assert.equal((await db.query("select count(*)::int as n from user_roles where user_id=$1 and role='candidato'",[signupId])).rows[0].n,1)
  const injected='00000000-0000-4000-8000-000000000011'
  await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[injected,'injected@example.test',{initial_role:'admin',is_admin:true}])
  assert.equal((await db.query('select is_admin from profiles where id=$1',[injected])).rows[0].is_admin,false)
  assert.equal((await db.query('select count(*)::int as n from user_roles where user_id=$1',[injected])).rows[0].n,0)
  console.log('OK cadastro público cria telefone e papel público na transação do Auth, sem permitir privilégio via metadata.')


  await db.exec(`reset role; alter table storage.objects enable row level security; grant select,insert,delete on storage.objects to authenticated;`)
  await claim(ordinary)
  await db.query(`insert into storage.objects(bucket_id,name,owner,metadata) values('user-gallery',$1,$2,'{"mimetype":"image/jpeg"}')`,[ordinary+'/own.jpg',ordinary])
  await assert.rejects(db.query(`insert into storage.objects(bucket_id,name,owner,metadata) values('user-gallery',$1,$2,'{"mimetype":"image/png"}')`,[person+'/other.png',ordinary]), e=>e.code==='42501')
  await claim(person)
  assert.equal((await db.query("select count(*)::int n from storage.objects where bucket_id='user-gallery'")).rows[0].n,0)
  assert.equal((await db.query("delete from storage.objects where bucket_id='user-gallery' returning id")).rows.length,0)
  console.log('OK galeria privada impede upload, leitura e exclusão de arquivos de outra conta.')

} finally { await db.close() }
