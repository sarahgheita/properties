-- Properties (for sale / for rent listings)

create type public.listing_type as enum ('sale', 'rent');
create type public.moderation_status as enum ('pending_review', 'approved', 'rejected', 'archived');
create type public.property_type as enum ('apartment', 'villa', 'townhouse', 'duplex', 'studio', 'chalet', 'office', 'shop', 'land', 'other');

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,

  listing_type public.listing_type not null,
  property_type public.property_type not null default 'apartment',
  title text not null,
  description text not null,

  price numeric(14, 2) not null,
  currency text not null default 'EGP',
  rent_period text, -- e.g. 'month', 'year' — only relevant when listing_type = 'rent'

  city text not null,
  area text not null,
  address_line text, -- kept private-ish; not required, never shown to public in detail beyond city/area

  bedrooms int,
  bathrooms int,
  area_sqm numeric(10, 2),

  status public.moderation_status not null default 'pending_review',
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,

  -- automated moderation hints (set by server-side content check before admin review)
  flagged boolean not null default false,
  flag_reasons text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_status_idx on public.properties (status);
create index properties_owner_idx on public.properties (owner_id);
create index properties_city_area_idx on public.properties (city, area);

alter table public.properties enable row level security;

-- Public can read approved listings. Owners can read their own regardless of status. Admin reads everything.
create policy "approved properties are publicly readable"
  on public.properties for select
  using (
    status = 'approved'
    or owner_id = auth.uid()
    or public.is_admin()
  );

create policy "authenticated users can submit properties"
  on public.properties for insert
  to authenticated
  with check (owner_id = auth.uid());

-- Owners can edit their own listing while it's still pending or rejected (not once approved/live, to prevent
-- silently swapping in contact-bypass content after approval). Admin can edit anything (approve/reject/etc).
create policy "owners can edit own unapproved properties"
  on public.properties for update
  to authenticated
  using (owner_id = auth.uid() and status in ('pending_review', 'rejected'))
  with check (owner_id = auth.uid());

create policy "admin can edit any property"
  on public.properties for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "owners can delete own unapproved properties"
  on public.properties for delete
  to authenticated
  using (owner_id = auth.uid() and status in ('pending_review', 'rejected'));

create policy "admin can delete any property"
  on public.properties for delete
  to authenticated
  using (public.is_admin());

-- Property images
create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index property_images_property_idx on public.property_images (property_id);

alter table public.property_images enable row level security;

create policy "images readable if property readable"
  on public.property_images for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id
        and (p.status = 'approved' or p.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "owners can add images to own properties"
  on public.property_images for insert
  to authenticated
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.owner_id = auth.uid()
    )
  );

create policy "owners can delete images from own properties"
  on public.property_images for delete
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and (p.owner_id = auth.uid() or public.is_admin())
    )
  );

-- Contact info: deliberately a SEPARATE table with its own strict RLS, so a bug or change in the
-- properties policies above can never accidentally expose contact details to the public.
-- Only the submitting owner and the admin can ever read this table.
create table public.property_contacts (
  property_id uuid primary key references public.properties(id) on delete cascade,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  notes text, -- private notes from the owner to the agent, never shown publicly
  created_at timestamptz not null default now()
);

alter table public.property_contacts enable row level security;

create policy "only owner or admin can read contact info"
  on public.property_contacts for select
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and (p.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "owners can insert contact info for own property"
  on public.property_contacts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.owner_id = auth.uid()
    )
  );

create policy "owner or admin can update contact info"
  on public.property_contacts for update
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and (p.owner_id = auth.uid() or public.is_admin())
    )
  );
