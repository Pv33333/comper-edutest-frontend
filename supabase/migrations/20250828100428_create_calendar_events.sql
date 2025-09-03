-- 2025-08-28_create_calendar_events.sql
create extension if not exists "pgcrypto";

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  test_id uuid references public.tests(id) on delete set null,
  subject text not null,
  descriere text,
  disciplina text,
  clasa text,
  tip text default 'Test programat',
  event_date date not null,
  event_time time not null,
  anulat boolean default false,
  source text default 'profesor',
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_calendar_events_updated on public.calendar_events;
create trigger trg_calendar_events_updated
before update on public.calendar_events
for each row execute function public.set_updated_at();

-- Enable RLS and basic policies: users manage only their own events
alter table public.calendar_events enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calendar_events' and policyname='Select own events') then
    create policy "Select own events" on public.calendar_events
      for select using (auth.uid() = created_by);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calendar_events' and policyname='Insert own events') then
    create policy "Insert own events" on public.calendar_events
      for insert with check (auth.uid() = created_by);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calendar_events' and policyname='Update own events') then
    create policy "Update own events" on public.calendar_events
      for update using (auth.uid() = created_by) with check (auth.uid() = created_by);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='calendar_events' and policyname='Delete own events') then
    create policy "Delete own events" on public.calendar_events
      for delete using (auth.uid() = created_by);
  end if;
end $$;