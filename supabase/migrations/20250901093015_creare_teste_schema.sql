-- Replacement migration: 20250901093015_creare_teste_schema.sql
-- Purpose: clean schema for tests & test_questions using exam_date/exam_time (avoid reserved words).

-- ===== Extensions (idempotent) =====
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ===== Tables (idempotent) =====
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  school_class text not null,
  test_type text not null,
  competency text,
  description text not null,
  teacher_name text,
  exam_date date not null,
  exam_time text not null,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  text text not null,
  choices jsonb not null,           -- e.g. ["A","B","C","D"]
  correct_index int not null check (correct_index between 0 and 3),
  created_at timestamptz not null default now()
);

-- ===== Backfill & cleanup in case old columns existed =====
-- Add new columns if missing
alter table public.tests add column if not exists exam_date date;
alter table public.tests add column if not exists exam_time text;

-- Move data from legacy columns then drop them
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='tests' and column_name='date'
  ) then
    execute 'update public.tests set exam_date = coalesce(exam_date, "date") where exam_date is null';
    alter table public.tests drop column "date";
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='tests' and column_name='time'
  ) then
    execute 'update public.tests set exam_time = coalesce(exam_time, "time") where exam_time is null';
    alter table public.tests drop column "time";
  end if;
end $$;

-- ===== Indexes =====
drop index if exists idx_tests_created_by;
create index idx_tests_created_by on public.tests (created_by, exam_date desc, exam_time desc);
create index if not exists idx_test_questions_test_id on public.test_questions(test_id);

-- ===== RLS enable =====
alter table public.tests enable row level security;
alter table public.test_questions enable row level security;

-- ===== RLS Policies (drop+create idempotent) =====
drop policy if exists tests_select_owner on public.tests;
drop policy if exists tests_insert_owner on public.tests;
drop policy if exists tests_update_owner on public.tests;
drop policy if exists tests_delete_owner on public.tests;

create policy tests_select_owner
  on public.tests for select
  using (created_by = auth.uid());

create policy tests_insert_owner
  on public.tests for insert
  with check (created_by = auth.uid());

create policy tests_update_owner
  on public.tests for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy tests_delete_owner
  on public.tests for delete
  using (created_by = auth.uid());

drop policy if exists tq_select_owner on public.test_questions;
drop policy if exists tq_insert_owner on public.test_questions;
drop policy if exists tq_update_owner on public.test_questions;
drop policy if exists tq_delete_owner on public.test_questions;

create policy tq_select_owner
  on public.test_questions for select
  using (exists (
    select 1 from public.tests t
    where t.id = test_questions.test_id
      and t.created_by = auth.uid()
  ));

create policy tq_insert_owner
  on public.test_questions for insert
  with check (exists (
    select 1 from public.tests t
    where t.id = test_questions.test_id
      and t.created_by = auth.uid()
  ));

create policy tq_update_owner
  on public.test_questions for update
  using (exists (
    select 1 from public.tests t
    where t.id = test_questions.test_id
      and t.created_by = auth.uid()
  ))
  with check (exists (
    select 1 from public.tests t
    where t.id = test_questions.test_id
      and t.created_by = auth.uid()
  ));

create policy tq_delete_owner
  on public.test_questions for delete
  using (exists (
    select 1 from public.tests t
    where t.id = test_questions.test_id
      and t.created_by = auth.uid()
  ));

-- ===== Data integrity: choices must contain exactly 4 non-empty options =====
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'test_questions_choices_4_nonempty'
  ) then
    alter table public.test_questions
      add constraint test_questions_choices_4_nonempty
      check (
        jsonb_typeof(choices) = 'array'
        and jsonb_array_length(choices) = 4
        and (choices->>0) <> ''
        and (choices->>1) <> ''
        and (choices->>2) <> ''
        and (choices->>3) <> ''
      );
  end if;
end $$;