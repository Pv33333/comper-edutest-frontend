-- 2025-09-01 HOTFIX: Fix index to use exam_date/exam_time and handle legacy columns.

-- 1) Ensure columns exam_date / exam_time exist
alter table public.tests add column if not exists exam_date date;
alter table public.tests add column if not exists exam_time text;

-- 2) If legacy columns "date" / "time" exist, migrate values and drop/rename safely
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tests' and column_name = 'date'
  ) then
    -- copy data from old "date" into exam_date if target is null
    execute 'update public.tests set exam_date = coalesce(exam_date, "date") where exam_date is null';
    -- drop column "date"
    alter table public.tests drop column "date";
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tests' and column_name = 'time'
  ) then
    -- copy data from old "time" into exam_time if target is null
    execute 'update public.tests set exam_time = coalesce(exam_time, "time") where exam_time is null';
    -- drop column "time"
    alter table public.tests drop column "time";
  end if;
end $$;

-- 3) Recreate useful index referencing the correct columns
drop index if exists idx_tests_created_by;
create index idx_tests_created_by on public.tests (created_by, exam_date desc, exam_time desc);