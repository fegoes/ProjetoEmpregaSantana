import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
const db = new PGlite()
let checks=0
async function ok(name,sql) { await db.exec(sql); console.log('OK',name); checks++ }
async function rejects(name,sql,code) { await assert.rejects(db.exec(sql),error=>[code, ...(code==='23503' ? ['23001'] : [])].includes(error.code)); console.log('OK',name); checks++ }
try {
 await db.exec(`
 create role anon; create role authenticated;
 create function public.is_admin() returns boolean language sql stable as $$ select coalesce(current_setting('app.admin',true),'no')='yes' $$;
 create table categories(id uuid primary key default gen_random_uuid(), slug text unique not null,label text not null,kind text not null check(kind in ('vaga','autonomo','both')));
 create table vagas(id int primary key,employment_type text not null check(employment_type in ('clt','pj','temporario','freelance')),category text references categories(slug),title text);
 create table empresas(id int primary key);
 create table autonomo_profiles(id int primary key,category text references categories(slug),headline text);
 insert into categories(slug,label,kind) values('geral','Geral','both');
 insert into vagas values(1,'clt','geral','Existente');
 `)
 await db.exec(await readFile('supabase/migrations/0024_admin_taxonomies.sql','utf8'))
 await ok('migration preserva vaga CLT existente',`update vagas set title='Atualizada' where id=1`)
 await ok('novas categorias e tipos por domínio',`insert into categories(slug,label,kind) values('saude','Saúde','empresa'); insert into record_types(slug,label,kind) values('estagio','Estágio','vaga'),('cooperativa','Cooperativa','empresa'),('especialista','Especialista','autonomo')`)
 await ok('tipo novo de contratação é aceito',`insert into vagas values(2,'estagio','geral','Estágio')`)
 await ok('empresa e profissional recebem classificação própria',`insert into empresas(id,category,type_slug) values(1,'saude','cooperativa'); insert into autonomo_profiles(id,category,headline,type_slug) values(1,'geral','Serviços','especialista')`)
 await rejects('categoria de empresa recusada em vaga',`insert into vagas values(3,'clt','saude','Inválida')`,'23514')
 await rejects('tipo de empresa recusado em vaga',`insert into vagas values(3,'cooperativa','geral','Inválida')`,'23514')
 await rejects('tipo de vaga recusado em profissional',`update autonomo_profiles set type_slug='clt' where id=1`,'23514')
 await rejects('categoria em uso não pode ser apagada',`delete from categories where slug='saude'`,'23503')
 await rejects('tipo em uso não pode ser apagado',`delete from record_types where slug='estagio'`,'23503')
 await ok('inativação conserva vínculos e permite editar outros campos',`update categories set is_active=false where slug='geral'; update record_types set is_active=false where slug='estagio'; update vagas set title='Novo título' where id=2`)
 await rejects('categoria inativa recusada em nova associação',`insert into vagas values(3,'clt','geral','Inválida')`,'23514')
 await rejects('tipo inativo recusado em nova associação',`insert into vagas values(3,'estagio',null,'Inválida')`,'23514')
 await rejects('área de categoria é imutável',`update categories set kind='empresa' where slug='geral'`,'23514')
 await rejects('identificador de tipo é imutável',`update record_types set slug='novo-codigo' where slug='estagio'`,'23514')
 await ok('público lê tipos mas não administra',`set role anon; select * from record_types; reset role`)
 await rejects('conta comum não cria tipo',`set role authenticated; insert into record_types(slug,label,kind) values('nao','Não','vaga')`,'42501')
 await db.exec('reset role')
 await ok('admin autorizado gerencia tipos',`select set_config('app.admin','yes',false); set role authenticated; insert into record_types(slug,label,kind) values('aprendiz','Aprendiz','vaga'); update record_types set label='Jovem aprendiz' where slug='aprendiz'; delete from record_types where slug='aprendiz'; reset role`)
 console.log(`${checks} verificações PostgreSQL de classificações aprovadas em banco isolado.`)
} finally { await db.close() }
