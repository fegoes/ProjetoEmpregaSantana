-- Administração geral das imagens públicas e edição pelos responsáveis pela empresa.
-- Não altera o bucket privado user-gallery nem suas políticas.
create function public.can_manage_public_image(url text) returns boolean
language sql stable security definer set search_path=public,storage as $$
 select exists(select 1 from storage.objects o where o.bucket_id='public-media'
 and url ~ '^https://[^/]+/storage/v1/object/public/public-media/'
 and split_part(split_part(url,'?',1),'/storage/v1/object/public/public-media/',2)=o.name
 and (
   o.owner=auth.uid() or public.is_admin()
   or ((storage.foldername(o.name))[1]='empresas' and exists(select 1 from public.empresas e where e.id::text=(storage.foldername(o.name))[2] and public.is_empresa_member(e.id)))
   or ((storage.foldername(o.name))[1]='vagas' and exists(select 1 from public.vagas v where v.id::text=(storage.foldername(o.name))[2] and v.empresa_id is not null and public.is_empresa_member(v.empresa_id)))
   or ((storage.foldername(o.name))[1] in ('profiles','autonomos') and (storage.foldername(o.name))[2]=auth.uid()::text)
 ))
$$;
drop policy image_variants_insert on public.image_variants;
drop policy image_variants_update on public.image_variants;
drop policy image_variants_delete on public.image_variants;
create policy image_variants_insert on public.image_variants for insert to authenticated with check (
 owner_id=auth.uid() and public.can_manage_public_image(desktop_url) and public.can_manage_public_image(mobile_url));
create policy image_variants_update on public.image_variants for update to authenticated
using (public.can_manage_public_image(desktop_url))
with check (public.can_manage_public_image(desktop_url) and public.can_manage_public_image(mobile_url));
create policy image_variants_delete on public.image_variants for delete to authenticated using(public.can_manage_public_image(desktop_url));
revoke update on public.image_variants from authenticated;
grant update(desktop_url,mobile_url) on public.image_variants to authenticated;
create policy public_profile_photo_admin_insert on storage.objects for insert to authenticated
with check (bucket_id='public-media' and (storage.foldername(name))[1]='profiles' and public.is_admin() and metadata->>'mimetype' in ('image/jpeg','image/png'));
