-- Property requests ("looking for") — seekers describe what they want.

create table public.property_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,

  listing_type public.listing_type not null,
  property_type public.property_type,
  description text not null,

  budget_min numeric(14, 2),
  budget_max numeric(14, 2),
  currency text not null default 'EGP',

  city text,
  area text,
  bedrooms_min int,

  status public.moderation_status not null default 'pending_review',
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,

  flagged boolean not null default false,
  flag_reasons text[] not null default '{}',

  -- set when this request was created via the AI chat assistant rather than the form
  source text not null default 'form',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index property_requests_status_idx on public.property_requests (status);
create index property_requests_requester_idx on public.property_requests (requester_id);

alter table public.property_requests enable row level security;

create policy "approved requests are publicly readable"
  on public.property_requests for select
  using (
    status = 'approved'
    or requester_id = auth.uid()
    or public.is_admin()
  );

create policy "authenticated users can submit requests"
  on public.property_requests for insert
  to authenticated
  with check (requester_id = auth.uid());

create policy "requesters can edit own unapproved requests"
  on public.property_requests for update
  to authenticated
  using (requester_id = auth.uid() and status in ('pending_review', 'rejected'))
  with check (requester_id = auth.uid());

create policy "admin can edit any request"
  on public.property_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "requesters can delete own unapproved requests"
  on public.property_requests for delete
  to authenticated
  using (requester_id = auth.uid() and status in ('pending_review', 'rejected'));

create policy "admin can delete any request"
  on public.property_requests for delete
  to authenticated
  using (public.is_admin());

-- Same pattern as property_contacts: contact info isolated in its own strictly-scoped table.
create table public.property_request_contacts (
  request_id uuid primary key references public.property_requests(id) on delete cascade,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  created_at timestamptz not null default now()
);

alter table public.property_request_contacts enable row level security;

create policy "only requester or admin can read request contact info"
  on public.property_request_contacts for select
  to authenticated
  using (
    exists (
      select 1 from public.property_requests r
      where r.id = request_id and (r.requester_id = auth.uid() or public.is_admin())
    )
  );

create policy "requesters can insert own contact info"
  on public.property_request_contacts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.property_requests r
      where r.id = request_id and r.requester_id = auth.uid()
    )
  );

create policy "requester or admin can update request contact info"
  on public.property_request_contacts for update
  to authenticated
  using (
    exists (
      select 1 from public.property_requests r
      where r.id = request_id and (r.requester_id = auth.uid() or public.is_admin())
    )
  );
