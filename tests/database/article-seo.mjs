import {PGlite} from '@electric-sql/pglite'
import {readFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
const db=new PGlite()
try{
 await db.exec(`create role anon;create role authenticated;create schema storage;create table storage.objects(bucket_id text,name text,metadata jsonb);create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;create function storage.extension(text) returns text language sql as $$select split_part($1,'.',-1)$$;create function public.is_admin() returns boolean language sql stable as $$select false$$;create function public.set_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end;$$;create table profiles(id uuid primary key);`)
 await db.exec(await readFile('supabase/migrations/0021_blog_articles.sql','utf8'))
 await db.exec(`insert into artigos(slug,title,author_name,status) values('como-organizar-seu-curriculo','Artigo existente','Equipe','published')`)
 await db.exec(await readFile('supabase/migrations/0025_article_seo.sql','utf8'))
 const rows=(await db.query('select * from artigos order by slug')).rows
 assert.equal(rows.length,3);assert.equal(rows.find(r=>r.slug==='como-organizar-seu-curriculo').title,'Artigo existente');assert.equal(rows.filter(r=>r.status==='draft').length,2)
 await assert.rejects(db.exec(`update artigos set social_image_url='javascript:alert(1)'`),e=>e.code==='23514')
 await db.exec('set role anon');assert.equal((await db.query('select * from artigos')).rows.length,1)
 await db.exec('reset role')
 await db.exec(await readFile('supabase/migrations/0027_editorial_illustrated_posts.sql','utf8'))
 const illustrated=(await db.query('select * from artigos order by slug')).rows
 assert.equal(illustrated.find(r=>r.slug==='como-organizar-seu-curriculo').title,'Artigo existente')
 for(const row of illustrated.filter(r=>r.slug!=='como-organizar-seu-curriculo')) {
   assert.equal(row.status,'published');assert.match(row.cover_url,/^https:\/\/.*illustrations\//);assert.match(row.content_html,/<img src=/);assert.equal(row.social_image_url,row.cover_url)
 }
 await db.exec(await readFile('supabase/migrations/0027_editorial_illustrated_posts.sql','utf8'))
 assert.equal((await db.query('select count(*)::int as n from artigos')).rows[0].n,3)
 await db.exec('set role anon');assert.equal((await db.query('select * from artigos')).rows.length,3)
 console.log('OK posts ilustrados publicam apenas rascunhos iniciais intactos, preservam conteúdo existente e permitem leitura pública.')
 console.log('OK migration editorial conserva posts existentes, prepara rascunhos, valida URL social e oculta rascunhos do público.')
}finally{await db.close()}
