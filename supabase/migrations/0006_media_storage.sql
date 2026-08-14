-- EmpregaSantana — foto opcional em vagas + storage público para logos de
-- empresa e fotos de vaga.

alter table public.vagas add column photo_url text;

-- ---------------------------------------------------------------------------
-- Bucket público para mídia (logos de empresa, fotos de vaga)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

-- Leitura pública (o bucket já é público, mas a policy deixa explícito).
create policy "public_media_select" on storage.objects
  for select using (bucket_id = 'public-media');

-- Upload autenticado, restrito às pastas usadas pelo app.
create policy "public_media_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] in ('empresas', 'vagas')
  );

-- Só quem enviou o arquivo pode substituí-lo/removê-lo.
create policy "public_media_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-media' and owner = auth.uid())
  with check (bucket_id = 'public-media' and owner = auth.uid());

create policy "public_media_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-media' and owner = auth.uid());
