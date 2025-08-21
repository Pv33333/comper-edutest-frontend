-- 0001_init.sql — base schema + RLS

-- Extensions
create extension if not exists pgcrypto;

-- ===========
-- PROFILES
-- ===========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text check (role in ('student','teacher','admin','parent')) default 'student',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy if not exists "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy if not exists "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy if not exists "profiles_insert_self"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ===========
-- TESTS
-- ===========
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null check (subject in ('romana','matematica','other')),
  grade_level text,
  content jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.tests enable row level security;

-- RLS Policies for tests
-- Anyone can read published tests; creators can read their drafts
create policy if not exists "tests_select_published_or_owner"
  on public.tests for select
  using (published = true or auth.uid() = created_by);

-- Only creator can insert/update/delete their own tests
create policy if not exists "tests_insert_owner"
  on public.tests for insert
  with check (auth.uid() = created_by);

create policy if not exists "tests_update_owner"
  on public.tests for update
  using (auth.uid() = created_by);

create policy if not exists "tests_delete_owner"
  on public.tests for delete
  using (auth.uid() = created_by);
