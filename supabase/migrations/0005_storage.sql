-- Storage bucket for property photos.
-- Public read (so listing photos render on the public site), authenticated write scoped to own property.

insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

-- Path convention enforced by the app: {property_id}/{filename}
-- Only the property's owner (or admin) may upload/delete files under a given property_id prefix.

create policy "anyone can view property photos"
  on storage.objects for select
  using (bucket_id = 'property-photos');

create policy "owners can upload photos for own property"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-photos'
    and exists (
      select 1 from public.properties p
      where p.id::text = (storage.foldername(name))[1]
        and p.owner_id = auth.uid()
    )
  );

create policy "owners or admin can delete own property photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-photos'
    and exists (
      select 1 from public.properties p
      where p.id::text = (storage.foldername(name))[1]
        and (p.owner_id = auth.uid() or public.is_admin())
    )
  );
