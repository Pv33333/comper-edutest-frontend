-- 0002_calendar_results.sql (rescris complet, idempotent)
-- Obiectiv: calendar (scheduled_tests), rezultate (results), ascunderi (student_hidden_schedules),
-- tipuri & tabele auxiliare (schools), coloane suplimentare pentru classes, RLS + policies.

-- =========================================================
-- 0) EXTENSII (siguranță)
-- =========================================================
create extension if not exists pgcrypto;

-- =========================================================
-- 1) TIPURI & TABEL AUXILIAR: Schools
-- =========================================================

-- Tip ciclu școlar (dacă îl folosiți în UI/rapoarte)
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'school_cycle' and n.nspname = 'public'
  ) then
    create type public.school_cycle as enum ('primary','gymnasium','highschool');
  end if;
end$$;

-- Tabel școli
create table if not exists public.schools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  county      text,
  city        text,
  created_at  timestamptz not null default now()
);

-- Index minim util
create index if not exists idx_schools_name on public.schools (name);

alter table public.schools enable row level security;

-- Politici de bază (toți autenticații pot citi; modificări doar dacă doriți mai strict se poate ajusta)
drop policy if exists "schools_select_all_auth" on public.schools;
create policy "schools_select_all_auth"
  on public.schools for select using (true);


-- =========================================================
-- 2) CLASSES – coloane & FK suplimentare + indici
--    (În 0001 există deja tabela classes: id, name, teacher_id, created_at)
-- =========================================================

-- Adăugăm coloanele doar dacă lipsesc
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='classes' and column_name='school_id'
  ) then
    alter table public.classes add column school_id uuid;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='classes' and column_name='cycle'
  ) then
    alter table public.classes add column cycle public.school_cycle;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='classes' and column_name='grade_level'
  ) then
    alter table public.classes add column grade_level text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='classes' and column_name='letter'
  ) then
    alter table public.classes add column letter text;
  end if;
end$$;

-- FK pentru school_id (dacă lipsește)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema='public' and table_name='classes' and constraint_name='classes_school_id_fkey'
  ) then
    alter table public.classes
      add constraint classes_school_id_fkey
      foreign key (school_id) references public.schools(id) on delete cascade;
  end if;
end$$;

-- Indici utili
create index if not exists idx_classes_school_id  on public.classes (school_id);
create index if not exists idx_classes_teacher_id on public.classes (teacher_id);
create index if not exists idx_classes_cycle      on public.classes (cycle);


-- =========================================================
-- 3) CALENDAR: scheduled_tests
-- =========================================================
create table if not exists public.scheduled_tests (
  id            uuid primary key default gen_random_uuid(),
  test_id       uuid not null references public.tests(id) on delete cascade,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  class_id      uuid references public.classes(id) on delete set null,
  scheduled_at  timestamptz not null,
  due_at        timestamptz,
  created_by    uuid not null references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- Indici
create index if not exists idx_sched_student    on public.scheduled_tests (student_id);
create index if not exists idx_sched_class      on public.scheduled_tests (class_id);
create index if not exists idx_sched_test       on public.scheduled_tests (test_id);
create index if not exists idx_sched_created_by on public.scheduled_tests (created_by);
create index if not exists idx_sched_due        on public.scheduled_tests (due_at);

alter table public.scheduled_tests enable row level security;

-- Politici:
--  a) elevul vede propriile programări
drop policy if exists "scheduled_select_student_own" on public.scheduled_tests;
create policy "scheduled_select_student_own"
  on public.scheduled_tests
  for select
  using (auth.uid() = student_id);

--  b) profesorul vede programările pe care le-a creat sau pe clasele lui
drop policy if exists "scheduled_select_teacher_own" on public.scheduled_tests;
create policy "scheduled_select_teacher_own"
  on public.scheduled_tests
  for select
  using (
    auth.uid() = created_by
    or exists (
      select 1 from public.classes c
      where c.id = scheduled_tests.class_id
        and c.teacher_id = auth.uid()
    )
  );

--  c) inserare doar de către profesor (creator)
drop policy if exists "scheduled_insert_teacher" on public.scheduled_tests;
create policy "scheduled_insert_teacher"
  on public.scheduled_tests
  for insert
  with check (
    auth.uid() = created_by
    and (
      -- dacă specifică class_id: trebuie să fie clasa lui
      class_id is null or exists (
        select 1 from public.classes c
        where c.id = class_id and c.teacher_id = auth.uid()
      )
    )
  );

--  d) update/delete doar de către profesorul creator (ajustează dacă ai nevoie diferit)
drop policy if exists "scheduled_update_teacher" on public.scheduled_tests;
create policy "scheduled_update_teacher"
  on public.scheduled_tests
  for update
  using (auth.uid() = created_by);

drop policy if exists "scheduled_delete_teacher" on public.scheduled_tests;
create policy "scheduled_delete_teacher"
  on public.scheduled_tests
  for delete
  using (auth.uid() = created_by);


-- =========================================================
-- 4) REZULTATE: results
-- =========================================================
create table if not exists public.results (
  id            uuid primary key default gen_random_uuid(),
  test_id       uuid not null references public.tests(id) on delete cascade,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  scheduled_id  uuid references public.scheduled_tests(id) on delete set null,
  score         numeric(5,2),
  submitted_at  timestamptz default now(),
  created_at    timestamptz not null default now(),
  unique (test_id, student_id, scheduled_id)
);

-- Indici utili
create index if not exists idx_results_student on public.results (student_id);
create index if not exists idx_results_test    on public.results (test_id);

alter table public.results enable row level security;

-- Politici results:
--  a) elevul își vede propriile rezultate
drop policy if exists "results_select_student_own" on public.results;
create policy "results_select_student_own"
  on public.results
  for select
  using (auth.uid() = student_id);

--  b) profesorul vede rezultatele elevilor din clasele lui
drop policy if exists "results_select_teacher_classes" on public.results;
create policy "results_select_teacher_classes"
  on public.results
  for select
  using (
    exists (
      select 1
      from public.enrollments e
      join public.classes c on c.id = e.class_id
      where e.student_id = results.student_id
        and c.teacher_id = auth.uid()
    )
  );

--  c) insert/update doar de către profesor (sau de către procesele voastre de corectare)
drop policy if exists "results_insert_teacher" on public.results;
create policy "results_insert_teacher"
  on public.results
  for insert
  with check (
    exists (
      select 1
      from public.enrollments e
      join public.classes c on c.id = e.class_id
      where e.student_id = results.student_id
        and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "results_update_teacher" on public.results;
create policy "results_update_teacher"
  on public.results
  for update
  using (
    exists (
      select 1
      from public.enrollments e
      join public.classes c on c.id = e.class_id
      where e.student_id = results.student_id
        and c.teacher_id = auth.uid()
    )
  );


-- =========================================================
-- 5) ASCUNDERI elev: student_hidden_schedules
-- =========================================================
create table if not exists public.student_hidden_schedules (
  student_id    uuid not null references public.profiles(id) on delete cascade,
  scheduled_id  uuid not null references public.scheduled_tests(id) on delete cascade,
  hidden_at     timestamptz not null default now(),
  primary key (student_id, scheduled_id)
);

alter table public.student_hidden_schedules enable row level security;

-- elevul își poate ascunde propriile programări din listă
drop policy if exists "hidden_select_student_own" on public.student_hidden_schedules;
create policy "hidden_select_student_own"
  on public.student_hidden_schedules
  for select
  using (auth.uid() = student_id);

drop policy if exists "hidden_insert_student_own" on public.student_hidden_schedules;
create policy "hidden_insert_student_own"
  on public.student_hidden_schedules
  for insert
  with check (auth.uid() = student_id);

drop policy if exists "hidden_delete_student_own" on public.student_hidden_schedules;
create policy "hidden_delete_student_own"
  on public.student_hidden_schedules
  for delete
  using (auth.uid() = student_id);
