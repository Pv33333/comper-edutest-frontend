-- 0001_init.sql (rescris complet, idempotent)

-- ================
-- Extensions
-- ================
create extension if not exists pgcrypto;

-- ================
-- Tables
-- ================

-- profiles: shadow pentru auth.users (1-1)
create table if not exists public.profiles (
  id         uuid primary key,              -- = auth.users.id
  email      text unique,
  full_name  text,
  role       text check (role in ('student','teacher','admin')) default 'student',
  created_at timestamptz not null default now()
);

-- classes: clase predate de profesori
create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  teacher_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- enrollments: înscriere elev → clasă
create table if not exists public.enrollments (
  class_id   uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

-- tests: catalog de teste (minim necesar pentru RPC-uri)
create table if not exists public.tests (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subject     text,
  grade       text,
  published   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ==========================
-- Foreign keys (safety pass)
-- ==========================
-- (Definite deja în CREATE TABLE; secțiunea lăsată intenționat goală pentru claritate)


-- ==========================
-- Row Level Security (RLS)
-- ==========================
alter table public.profiles   enable row level security;
alter table public.classes    enable row level security;
alter table public.enrollments enable row level security;
alter table public.tests      enable row level security;

-- ==========================
-- RLS Policies (idempotent)
-- ==========================

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles
  for delete
  using (auth.uid() = id);

-- classes (vizibile & administrabile doar de profesorul deținator)
drop policy if exists "classes_select_own" on public.classes;
create policy "classes_select_own"
  on public.classes
  for select
  using (auth.uid() = teacher_id);

drop policy if exists "classes_insert_self" on public.classes;
create policy "classes_insert_self"
  on public.classes
  for insert
  with check (auth.uid() = teacher_id);

drop policy if exists "classes_update_own" on public.classes;
create policy "classes_update_own"
  on public.classes
  for update
  using (auth.uid() = teacher_id);

drop policy if exists "classes_delete_own" on public.classes;
create policy "classes_delete_own"
  on public.classes
  for delete
  using (auth.uid() = teacher_id);

-- enrollments (acces elev însuși sau profesorul clasei)
drop policy if exists "enrollments_select" on public.enrollments;
create policy "enrollments_select"
  on public.enrollments
  for select
  using (
    auth.uid() = student_id
    or auth.uid() = (select c.teacher_id from public.classes c where c.id = class_id)
  );

drop policy if exists "enrollments_insert" on public.enrollments;
create policy "enrollments_insert"
  on public.enrollments
  for insert
  with check (
    auth.uid() = student_id
    or auth.uid() = (select c.teacher_id from public.classes c where c.id = class_id)
  );

drop policy if exists "enrollments_delete" on public.enrollments;
create policy "enrollments_delete"
  on public.enrollments
  for delete
  using (
    auth.uid() = student_id
    or auth.uid() = (select c.teacher_id from public.classes c where c.id = class_id)
  );

-- tests (vizibile tuturor autenticaților; modificabile doar de creator)
drop policy if exists "tests_select_all_auth" on public.tests;
create policy "tests_select_all_auth"
  on public.tests
  for select
  using (true);  -- sau restrânge după nevoie

drop policy if exists "tests_insert_owner" on public.tests;
create policy "tests_insert_owner"
  on public.tests
  for insert
  with check (auth.uid() = created_by);

drop policy if exists "tests_update_owner" on public.tests;
create policy "tests_update_owner"
  on public.tests
  for update
  using (auth.uid() = created_by);

drop policy if exists "tests_delete_owner" on public.tests;
create policy "tests_delete_owner"
  on public.tests
  for delete
  using (auth.uid() = created_by);


-- ==========================
-- Sync auth.users → public.profiles
-- ==========================

-- function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- inserează profil doar dacă nu există
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), 'student')
  on conflict (id) do nothing;

  return new;
end;
$$;

-- trigger (idempotent: drop dacă există, apoi create)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ==========================
-- Indexes (minim utile)
-- ==========================
create index if not exists idx_classes_teacher on public.classes(teacher_id);
create index if not exists idx_enrollments_class on public.enrollments(class_id);
create index if not exists idx_enrollments_student on public.enrollments(student_id);
create index if not exists idx_tests_created_by on public.tests(created_by);
