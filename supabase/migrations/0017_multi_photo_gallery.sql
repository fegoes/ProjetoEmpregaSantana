-- EmpregaSantana — múltiplas fotos por vaga (carrossel no card) e portfólio
-- de autônomo (a coluna portfolio_urls já existia desde a Fase 2/3, mas
-- nunca teve UI). photo_url (singular) fica no schema sem uso — mais simples
-- e seguro que dropar a coluna agora; nada depende dela ficar removida.

alter table public.vagas add column photo_urls text[] not null default '{}';

update public.vagas set photo_urls = array[photo_url] where photo_url is not null;

-- Upload de portfólio de autônomo usa a pasta autonomos/{id}/..., que a
-- policy de insert do bucket público ainda não liberava (só empresas/vagas).
drop policy "public_media_insert" on storage.objects;
create policy "public_media_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] in ('empresas', 'vagas', 'autonomos')
    and (metadata->>'mimetype') like 'image/%'
  );
