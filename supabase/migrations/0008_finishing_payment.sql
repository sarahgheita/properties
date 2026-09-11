-- Egypt-specific listing details, inspired by major property portals (Bayut etc.) but trimmed
-- to what actually matters most for the Egyptian market: finishing level and payment method.
-- Both optional — listings work fine without them, they just add useful filtering.

create type public.finishing_level as enum (
  'super_lux',
  'finished',
  'semi_finished',
  'core_shell',
  'not_finished'
);

create type public.payment_method as enum ('cash', 'installments');

alter table public.properties
  add column finishing public.finishing_level,
  add column payment_method public.payment_method,
  add column down_payment_percent numeric(5, 2),
  add column installment_years int;

create index properties_finishing_idx on public.properties (finishing);
create index properties_payment_method_idx on public.properties (payment_method);
