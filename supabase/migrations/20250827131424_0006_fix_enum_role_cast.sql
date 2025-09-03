-- 0006_fix_enum_role_cast.sql
-- Fix: profiles.role este ENUM -> trebuie cast la text când folosim lower()

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
  -- profesorul curent trebuie să dețină clasa
  perform public._ensure_class_owned_by_current_teacher(_class_id);

  -- căutăm elevul după email; rolul poate fi ENUM ('elev','student' etc.)
  -- => facem CAST la text înainte de lower()
  select p.id
    into v_student
  from public.profiles p
  where lower(p.email) = lower(_email)
    and coalesce(lower(p.role::text), 'elev') in ('elev','student')
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
