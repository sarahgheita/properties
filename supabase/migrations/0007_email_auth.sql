-- Switch from phone+OTP to email+password auth. Keep the phone column (still used as the
-- listing/request contact phone people type into forms) but it's no longer tied to login.

alter table public.profiles add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, email)
  values (new.id, new.phone, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
