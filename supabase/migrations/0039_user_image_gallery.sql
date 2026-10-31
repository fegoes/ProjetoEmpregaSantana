-- Galeria privada: cada usuário administra somente a própria pasta.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('user-gallery','user-gallery',false,5242880,array['image/jpeg','image/png'])
on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
create policy user_gallery_read on storage.objects for select to authenticated
using (bucket_id='user-gallery' and (storage.foldername(name))[1]=auth.uid()::text);
create policy user_gallery_insert on storage.objects for insert to authenticated
with check (bucket_id='user-gallery' and (storage.foldername(name))[1]=auth.uid()::text and metadata->>'mimetype' in ('image/jpeg','image/png'));
create policy user_gallery_delete on storage.objects for delete to authenticated
using (bucket_id='user-gallery' and (storage.foldername(name))[1]=auth.uid()::text);
create policy public_profile_photo_insert on storage.objects for insert to authenticated
with check (bucket_id='public-media' and (storage.foldername(name))[1]='profiles' and (storage.foldername(name))[2]=auth.uid()::text and metadata->>'mimetype' in ('image/jpeg','image/png'));
-- Mantém imagens já enviadas; restringe os novos uploads no servidor.
update storage.buckets set allowed_mime_types=array['image/jpeg','image/png'],file_size_limit=5242880 where id='public-media';
