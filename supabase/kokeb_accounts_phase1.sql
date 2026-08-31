-- =====================================================================
-- Kokeb — Phase 1: Secure Accounts & Property Portal
-- Supabase / PostgreSQL
--
-- Roles:
--   platform_admin = platform administrator
--   admin_owner    = business administrator
--   owner          = property owner/customer
--   guest          = renter/visitor
--
-- Listing workflow:
--   draft -> pending -> published
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. PROFILES
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,

  role text not null default 'owner',

  created_at timestamptz not null default now()
);


-- Use owner as the default role for new portal accounts.
alter table public.profiles
  alter column role set default 'owner';


-- Convert the old temporary "customer" role if it exists.
update public.profiles
set role = 'owner'
where role = 'customer';


-- Add a role constraint if it does not already exist.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (
        role in (
          'platform_admin',
          'admin_owner',
          'owner',
          'guest'
        )
      );
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 2. LISTINGS
-- ---------------------------------------------------------------------

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null
    references auth.users(id)
    on delete cascade,

  title text not null,

  address text,
  city text,
  state text,
  zip text,

  category text not null default 'homes',

  property_type text,

  bedrooms integer,
  bathrooms numeric,

  price numeric,

  description text,

  amenities text[],

  availability text,

  contact_phone text,

  status text not null default 'draft',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 3. LISTING DATA VALIDATION
-- ---------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_status_check'
  ) then
    alter table public.listings
      add constraint listings_status_check
      check (
        status in (
          'draft',
          'pending',
          'published'
        )
      );
  end if;
end $$;


do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_category_check'
  ) then
    alter table public.listings
      add constraint listings_category_check
      check (
        category in (
          'homes',
          'vibes',
          'services',
          'long-term',
          'commercial'
        )
      );
  end if;
end $$;


-- Prevent negative prices.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_price_check'
  ) then
    alter table public.listings
      add constraint listings_price_check
      check (
        price is null or price >= 0
      );
  end if;
end $$;


-- Prevent negative bedroom values.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_bedrooms_check'
  ) then
    alter table public.listings
      add constraint listings_bedrooms_check
      check (
        bedrooms is null or bedrooms >= 0
      );
  end if;
end $$;


-- Prevent negative bathroom values.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_bathrooms_check'
  ) then
    alter table public.listings
      add constraint listings_bathrooms_check
      check (
        bathrooms is null or bathrooms >= 0
      );
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 4. AUTOMATIC updated_at
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists set_listings_updated_at
on public.listings;


create trigger set_listings_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 5. AUTO-CREATE PROFILE WHEN A USER SIGNS UP
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.profiles (
    id,
    email,
    full_name,
    role
  )

  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'owner'
  )

  on conflict (id) do nothing;

  return new;

end;
$$;


drop trigger if exists on_auth_user_created
on auth.users;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 6. BACKFILL USERS THAT ALREADY EXIST
--
-- This matters because your test user was created BEFORE this trigger.
-- ---------------------------------------------------------------------

insert into public.profiles (
  id,
  email,
  full_name,
  role
)

select
  u.id,
  u.email,
  u.raw_user_meta_data ->> 'full_name',
  'owner'

from auth.users u

where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
);


-- ---------------------------------------------------------------------
-- 7. ENABLE ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.profiles
enable row level security;


alter table public.listings
enable row level security;


-- =====================================================================
-- PROFILE POLICIES
-- =====================================================================


-- ---------------------------------------------------------------------
-- 8. USER CAN VIEW ONLY THEIR OWN PROFILE
-- ---------------------------------------------------------------------

drop policy if exists
"Profiles are self-viewable"
on public.profiles;


create policy
"Profiles are self-viewable"

on public.profiles
for select

to authenticated

using (
  auth.uid() = id
);


-- ---------------------------------------------------------------------
-- 9. USER CAN UPDATE THEIR OWN PROFILE
--
-- Column permissions below prevent them from updating "role".
-- ---------------------------------------------------------------------

drop policy if exists
"Profiles are self-editable"
on public.profiles;


create policy
"Profiles are self-editable"

on public.profiles
for update

to authenticated

using (
  auth.uid() = id
)

with check (
  auth.uid() = id
);


-- =====================================================================
-- LISTING POLICIES
-- =====================================================================


-- ---------------------------------------------------------------------
-- 10. OWNER CAN VIEW THEIR OWN LISTINGS
-- ---------------------------------------------------------------------

drop policy if exists
"Owners can view their own listings"
on public.listings;


create policy
"Owners can view their own listings"

on public.listings
for select

to authenticated

using (
  auth.uid() = owner_id
);


-- ---------------------------------------------------------------------
-- 11. OWNER CAN CREATE ONLY THEIR OWN DRAFT
--
-- Prevents:
--   owner_id = another user
--   status = published
-- ---------------------------------------------------------------------

drop policy if exists
"Owners can insert their own listings"
on public.listings;


create policy
"Owners can insert their own listings"

on public.listings
for insert

to authenticated

with check (
  auth.uid() = owner_id
  and status = 'draft'
);


-- ---------------------------------------------------------------------
-- 12. OWNER CAN EDIT ONLY THEIR OWN UNPUBLISHED LISTINGS
--
-- Owners can use:
--   draft
--   pending
--
-- Owners CANNOT set:
--   published
-- ---------------------------------------------------------------------

drop policy if exists
"Owners can update their own listings"
on public.listings;


create policy
"Owners can update their own listings"

on public.listings
for update

to authenticated

using (
  auth.uid() = owner_id
  and status in ('draft', 'pending')
)

with check (
  auth.uid() = owner_id
  and status in ('draft', 'pending')
);


-- ---------------------------------------------------------------------
-- 13. REMOVE OWNER HARD DELETE
-- ---------------------------------------------------------------------

drop policy if exists
"Owners can delete their own listings"
on public.listings;


-- No owner DELETE policy is created.
--
-- This intentionally prevents owners from permanently deleting
-- property records directly from the client application.


-- ---------------------------------------------------------------------
-- 14. PUBLIC CAN SEE PUBLISHED LISTINGS
-- ---------------------------------------------------------------------

drop policy if exists
"Published listings are publicly viewable"
on public.listings;


create policy
"Published listings are publicly viewable"

on public.listings
for select

to anon, authenticated

using (
  status = 'published'
);


-- =====================================================================
-- ADMIN LISTING ACCESS
-- =====================================================================


-- ---------------------------------------------------------------------
-- 15. ADMINS CAN VIEW ALL LISTINGS
-- ---------------------------------------------------------------------

drop policy if exists
"Admins can view all listings"
on public.listings;


create policy
"Admins can view all listings"

on public.listings
for select

to authenticated

using (

  exists (

    select 1

    from public.profiles p

    where
      p.id = auth.uid()

      and p.role in (
        'platform_admin',
        'admin_owner'
      )

  )

);


-- ---------------------------------------------------------------------
-- 16. ADMINS CAN UPDATE LISTINGS
--
-- This is what will eventually allow an administrator
-- to approve a property and set:
--
-- status = published
-- ---------------------------------------------------------------------

drop policy if exists
"Admins can update all listings"
on public.listings;


create policy
"Admins can update all listings"

on public.listings
for update

to authenticated

using (

  exists (

    select 1

    from public.profiles p

    where
      p.id = auth.uid()

      and p.role in (
        'platform_admin',
        'admin_owner'
      )

  )

)

with check (

  exists (

    select 1

    from public.profiles p

    where
      p.id = auth.uid()

      and p.role in (
        'platform_admin',
        'admin_owner'
      )

  )

);


-- =====================================================================
-- DATABASE COLUMN PERMISSIONS
-- =====================================================================


-- ---------------------------------------------------------------------
-- 17. PROTECT THE ROLE COLUMN
--
-- RLS protects ROWS.
-- PostgreSQL grants below protect COLUMNS.
--
-- This is important:
-- A normal logged-in user must NEVER be allowed to run:
--
-- update profiles
-- set role = 'platform_admin'
-- ---------------------------------------------------------------------

revoke update
on public.profiles
from anon, authenticated;


grant update (
  full_name,
  phone
)
on public.profiles
to authenticated;


grant select
on public.profiles
to authenticated;


-- ---------------------------------------------------------------------
-- 18. LISTING PERMISSIONS
-- ---------------------------------------------------------------------

revoke insert, update, delete
on public.listings
from anon, authenticated;


grant select
on public.listings
to anon, authenticated;


grant insert (
  owner_id,
  title,
  address,
  city,
  state,
  zip,
  category,
  property_type,
  bedrooms,
  bathrooms,
  price,
  description,
  amenities,
  availability,
  contact_phone,
  status
)
on public.listings
to authenticated;


grant update (
  title,
  address,
  city,
  state,
  zip,
  category,
  property_type,
  bedrooms,
  bathrooms,
  price,
  description,
  amenities,
  availability,
  contact_phone,
  status
)
on public.listings
to authenticated;


-- No DELETE privilege is granted to authenticated users.


-- =====================================================================
-- FINISHED
-- =====================================================================

-- After running this file, verify:
--
-- 1. Table Editor
--      profiles
--      listings
--
-- 2. RLS should show ENABLED on both tables.
--
-- 3. Authentication -> Users
--      Your existing test user should have a corresponding profile.
--
-- 4. New owner listing:
--      status = draft
--
-- 5. Normal owner cannot create:
--      status = published
--
-- 6. Normal owner cannot change:
--      profiles.role
--
-- 7. Normal owner cannot hard-delete listings.
--
-- =====================================================================