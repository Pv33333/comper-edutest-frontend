-- Activează extensii utile
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ======================
-- CLASSES (clase)
-- ======================
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  grade_level text not null check (grade_level in ('0','I','II','III','IV','V','VI','VII','VIII')),
  letter text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists idx_classes_owner on public.classes(created_by, grade_level, letter);

-- ======================
-- STUDENTS (elevi)
-- ======================
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create unique index if not exists uq_students_owner_email on public.students(created_by, email);

-- ======================
-- CLASS ENROLLMENTS (înscriere elev în clasă)
-- ======================
create table if not exists public.class_enrollments (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

-- ======================
-- ASSIGNMENTS (trimiteri test)
-- ======================
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  scheduled_at timestamptz not null default now(),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  check ( (class_id is not null) or (student_id is not null) )
);
create index if not exists idx_assignments_owner on public.assignments(created_by, scheduled_at desc);
create index if not exists idx_assignments_test on public.assignments(test_id);
create index if not exists idx_assignments_target on public.assignments(class_id, student_id);

-- ======================
-- RLS POLICIES
-- ======================
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.class_enrollments enable row level security;
alter table public.assignments enable row level security;

-- Drop old policies dacă există
drop policy if exists classes_owner_all on public.classes;
drop policy if exists students_owner_all on public.students;
drop policy if exists enroll_owner_select on public.class_enrollments;
drop policy if exists enroll_owner_ins on public.class_enrollments;
drop policy if exists enroll_owner_del on public.class_enrollments;
drop policy if exists assignments_owner_all on public.assignments;

-- Policies by owner
create policy classes_owner_all on public.classes
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy students_owner_all on public.students
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy enroll_owner_select on public.class_enrollments
  for select using (
    exists (select 1 from public.classes c where c.id = class_id and c.created_by = auth.uid())
    and exists (select 1 from public.students s where s.id = student_id and s.created_by = auth.uid())
  );

create policy enroll_owner_ins on public.class_enrollments
  for insert with check (
    exists (select 1 from public.classes c where c.id = class_id and c.created_by = auth.uid())
    and exists (select 1 from public.students s where s.id = student_id and s.created_by = auth.uid())
  );

create policy enroll_owner_del on public.class_enrollments
  for delete using (
    exists (select 1 from public.classes c where c.id = class_id and c.created_by = auth.uid())
    and exists (select 1 from public.students s where s.id = student_id and s.created_by = auth.uid())
  );

create policy assignments_owner_all on public.assignments
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());

-- Reîncarcă schema în PostgREST
notify pgrst, 'reload schema';
