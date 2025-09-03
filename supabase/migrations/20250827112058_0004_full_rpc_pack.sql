-- 0004_full_rpc_pack.sql
-- Pachet complet: helper + 4 RPC-uri (SECURITY DEFINER, RLS-safe)
-- Include DROP IF EXISTS ca să nu mai apară 42P13 sau duplicate.

-- Curățare (în ordine sigură)
drop function if exists public.schedule_test_for_student(uuid, uuid, timestamptz, timestamptz);
drop function if exists public.schedule_test_for_class(uuid, uuid, timestamptz, timestamptz);
drop function if exists public.list_students_for_class(uuid);
drop function if exists public.add_student_by_email(uuid, text);
drop function if exists public._ensure_class_owned_by_current_teacher(uuid);

-- HELPER: verifică dacă utilizatorul curent e profesorul clasei
create or replace function public._ensure_class_owned_by_current_teacher(_class_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_ok boolean;
begin
  select exists(
    select 1 from public.classes c
    where c.id = _class_id and c.teacher_id = auth.uid()
  ) into v_ok;

  if not v_ok then
    raise exception 'Access denied: class % is not owned by current teacher (uid=%).', _class_id, auth.uid()
      using errcode = '42501';
  end if;
end;
$$;
grant execute on function public._ensure_class_owned_by_current_teacher(uuid) to authenticated;

-- 1) add_student_by_email(_class_id, _email)
create or replace function public.add_student_by_email(
  _class_id uuid,
  _email    text
)
returns table(student_id uuid, class_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare v_student uuid;
begin
  perform public._ensure_class_owned_by_current_teacher(_class_id);

  select p.id into v_student
  from public.profiles p
  where lower(p.email) = lower(_email) and p.role = 'student'
  limit 1;

  if v_student is null then
    raise exception 'No student profile found for email: %', _email
      using errcode = 'P0002';
  end if;

  insert into public.enrollments(class_id, student_id)
  values (_class_id, v_student)
  on conflict (class_id, student_id) do nothing;

  return query select v_student::uuid, _class_id::uuid;
end;
$$;
comment on function public.add_student_by_email(uuid, text) is 'Adaugă elev în clasa dată după email (doar profesorul clasei).';
grant execute on function public.add_student_by_email(uuid, text) to authenticated;

-- 2) list_students_for_class(_class_id)
create or replace function public.list_students_for_class(
  _class_id uuid
)
returns table(student_id uuid, full_name text, email text)
language sql
security definer
set search_path = public
as $$
  select e.student_id, p.full_name, p.email
  from (
    select public._ensure_class_owned_by_current_teacher(_class_id)
  ) as _guard,
  public.enrollments e
  join public.profiles p on p.id = e.student_id
  where e.class_id = _class_id
  order by p.full_name nulls last, p.email;
$$;
comment on function public.list_students_for_class(uuid) is 'Listează elevii unei clase (doar profesorul clasei).';
grant execute on function public.list_students_for_class(uuid) to authenticated;

-- 3) schedule_test_for_class(_test_id,_class_id,_scheduled_at,_due_at)
create or replace function public.schedule_test_for_class(
  _test_id      uuid,
  _class_id     uuid,
  _scheduled_at timestamptz,
  _due_at       timestamptz
)
returns table(scheduled_test_id uuid, student_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  v_id uuid;
begin
  perform public._ensure_class_owned_by_current_teacher(_class_id);

  if not exists (
    select 1 from public.tests t
    where t.id = _test_id and coalesce(t.published, true) = true
  ) then
    raise exception 'Test % is not published or does not exist.', _test_id
      using errcode = 'P0001';
  end if;

  for rec in
    select e.student_id
    from public.enrollments e
    where e.class_id = _class_id
  loop
    insert into public.scheduled_tests(
      test_id, student_id, class_id, scheduled_at, due_at, created_by
    )
    values (_test_id, rec.student_id, _class_id, _scheduled_at, _due_at, auth.uid())
    returning id into v_id;

    return query select v_id::uuid, rec.student_id::uuid;
  end loop;

  return;
end;
$$;
comment on function public.schedule_test_for_class(uuid, uuid, timestamptz, timestamptz)
  is 'Programează un test pentru toți elevii dintr-o clasă (doar profesorul clasei).';
grant execute on function public.schedule_test_for_class(uuid, uuid, timestamptz, timestamptz) to authenticated;

-- 4) schedule_test_for_student(p_test_id,p_student_id,p_scheduled_at,p_due_at)
create or replace function public.schedule_test_for_student(
  p_test_id       uuid,
  p_student_id    uuid,
  p_scheduled_at  timestamptz,
  p_due_at        timestamptz
)
returns table(scheduled_test_id uuid, class_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_count    int;
  v_id       uuid;
begin
  if not exists (
    select 1 from public.tests t
    where t.id = p_test_id and coalesce(t.published, true) = true
  ) then
    raise exception 'Test % is not published or does not exist.', p_test_id
      using errcode = 'P0001';
  end if;

  select count(*) into v_count
  from public.enrollments e
  join public.classes c on c.id = e.class_id
  where e.student_id = p_student_id
    and c.teacher_id = auth.uid();

  if v_count = 0 then
    raise exception 'Access denied: student % is not enrolled in any class taught by current teacher.', p_student_id
      using errcode = '42501';
  elsif v_count > 1 then
    raise exception 'Ambiguous: student % is enrolled in multiple classes taught by current teacher. Use schedule_test_for_class instead.', p_student_id
      using errcode = 'P0001';
  end if;

  select e.class_id into v_class_id
  from public.enrollments e
  join public.classes c on c.id = e.class_id
  where e.student_id = p_student_id
    and c.teacher_id = auth.uid()
  limit 1;

  insert into public.scheduled_tests(
    test_id, student_id, class_id, scheduled_at, due_at, created_by
  )
  values (p_test_id, p_student_id, v_class_id, p_scheduled_at, p_due_at, auth.uid())
  returning id into v_id;

  return query select v_id::uuid, v_class_id::uuid;
end;
$$;
comment on function public.schedule_test_for_student(uuid, uuid, timestamptz, timestamptz)
  is 'Programează un test pentru un elev (doar pentru clasele predate de profesorul curent).';
grant execute on function public.schedule_test_for_student(uuid, uuid, timestamptz, timestamptz) to authenticated;
