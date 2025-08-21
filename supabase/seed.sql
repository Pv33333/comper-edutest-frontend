-- seed.sql — demo tests (published, readable by all)
insert into public.tests (title, subject, grade_level, content, published, created_by)
values
  ('Test Română – Clasa IV', 'romana', 'IV', '{"items":[]}', true, null),
  ('Test Matematică – Clasa IV', 'matematica', 'IV', '{"items":[]}', true, null)
on conflict do nothing;
