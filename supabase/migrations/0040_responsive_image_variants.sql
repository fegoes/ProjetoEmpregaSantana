-- Apenas variantes de imagens públicas. A galeria privada continua no bucket user-gallery.
create table public.image_variants (
 desktop_url text primary key,
 mobile_url text not null,
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.image_variants enable row level security;
grant select on public.image_variants to anon, authenticated;
grant insert,update,delete on public.image_variants to authenticated;
create policy image_variants_read on public.image_variants for select using (true);
-- Não permite associar variantes a arquivos públicos de outra conta.
create function public.owns_public_image(url text) returns boolean language sql stable security definer set search_path=public,storage as $$
 select exists(select 1 from storage.objects o where o.bucket_id='public-media' and o.owner=auth.uid()
 and url ~ '^https://[^/]+/storage/v1/object/public/public-media/' and split_part(split_part(url,'?',1),'/storage/v1/object/public/public-media/',2)=o.name)
$$;
create policy image_variants_insert on public.image_variants for insert to authenticated with check (
 owner_id=auth.uid() and public.owns_public_image(desktop_url) and public.owns_public_image(mobile_url));
create policy image_variants_update on public.image_variants for update to authenticated using (owner_id=auth.uid()) with check (
 owner_id=auth.uid() and public.owns_public_image(desktop_url) and public.owns_public_image(mobile_url));
create policy image_variants_delete on public.image_variants for delete to authenticated using (owner_id=auth.uid());
