-- 0005_fix_roles.sql
-- Extinde RPC-ul să accepte roluri RO/EN pentru elev: 'elev' și/sau 'student'

drop function if exists public.add_student_by_email(uuid, text);

create or replace function public.add_student_by_email(
  _class_id uuid,
  _email    text
)
returns table(student_id uuid, class_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid;
begin
  -- Asigură-te că prof. curent deține clasa
  perform public._ensure_class_owned_by_current_teacher(_class_id);

  -- Acceptă atât 'elev' (RO), cât și 'student' (EN); fallback dacă role e null
  select p.id
    into v_student
  from public.profiles p
  where lower(p.email) = lower(_email)
    and coalesce(lower(p.role), 'elev') in ('elev','student')
  limit 1;

  if v_student is null then
    raise exception 'No student profile found for email: % (role must be elev/student)', _email
      using errcode = 'P0002';
  end if;

  insert into public.enrollments(class_id, student_id)
  values (_class_id, v_student)
  on conflict (class_id, student_id) do nothing;

  return query
  select v_student::uuid, _class_id::uuid;
end;
$$;

grant execute on function public.add_student_by_email(uuid, text) to authenticated;
comment on function public.add_student_by_email(uuid, text)
  is 'Adaugă elev în clasa dată după email; acceptă rol elev/student (RO/EN).';
