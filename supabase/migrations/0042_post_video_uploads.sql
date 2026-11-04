-- Vídeos dos artigos: leitura pública por URL, envio exclusivo do superadmin.
-- Não modifica os buckets de fotos nem a galeria privada.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('post-videos','post-videos',true,52428800,array['video/mp4','video/webm'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy post_videos_admin_read on storage.objects for select to authenticated
using(bucket_id='post-videos' and public.is_admin());
create policy post_videos_admin_insert on storage.objects for insert to authenticated
with check(bucket_id='post-videos' and public.is_admin() and (storage.foldername(name))[1]=auth.uid()::text and metadata->>'mimetype' in ('video/mp4','video/webm'));
create policy post_videos_admin_delete on storage.objects for delete to authenticated
using(bucket_id='post-videos' and public.is_admin());
