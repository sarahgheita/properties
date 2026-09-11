-- Inquiries: how a seeker expresses interest in a live property WITHOUT ever seeing owner contact info.
-- The message goes to the admin, who manually connects the two parties.

create table public.property_inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index property_inquiries_property_idx on public.property_inquiries (property_id);
create index property_inquiries_status_idx on public.property_inquiries (status);

alter table public.property_inquiries enable row level security;

-- Requesters can read/create their own inquiries; only admin can read all of them (that's the point —
-- inquiries are a private channel to the agent, not a public message board between users).
create policy "requester or admin can read inquiries"
  on public.property_inquiries for select
  to authenticated
  using (requester_id = auth.uid() or public.is_admin());

create policy "authenticated users can create inquiries"
  on public.property_inquiries for insert
  to authenticated
  with check (
    requester_id = auth.uid()
    and exists (select 1 from public.properties p where p.id = property_id and p.status = 'approved')
  );

create policy "admin can update inquiries"
  on public.property_inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
