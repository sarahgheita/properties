-- More Egypt-market listing details, matching what Bayut/Aqarmap/Property Finder show:
-- furnishing status, compound/developer/delivery info (for off-plan sales), floor + view,
-- and an amenities checklist. All optional — listings work fine without them.

create type public.furnishing_status as enum ('unfurnished', 'semi_furnished', 'furnished');
create type public.property_view as enum ('garden', 'sea', 'pool', 'street', 'landmark', 'other');

alter table public.properties
  add column furnishing public.furnishing_status,
  add column compound_name text,
  add column developer_name text,
  add column delivery_date text, -- free text, e.g. "Q4 2029" or "Ready to move" — off-plan handover dates are rarely exact
  add column floor_number int,
  add column view public.property_view,
  add column amenities text[] not null default '{}';

create index properties_furnishing_idx on public.properties (furnishing);
create index properties_view_idx on public.properties (view);
