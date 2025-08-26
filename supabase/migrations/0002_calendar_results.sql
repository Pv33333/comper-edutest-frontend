
-- 0002_calendar_results.sql
-- Purpose: core school/class/enrollment + scheduled_tests (assignments) + results
-- Safe to run multiple times (idempotent-ish using guards).

BEGIN;

-- 0) Enums / helpers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'school_cycle') THEN
    CREATE TYPE public.school_cycle AS ENUM ('primar','gimnazial');
  END IF;
END$$;

-- 1) Schools
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  county text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  cycle public.school_cycle NOT NULL,
  grade_level text NOT NULL,   -- e.g. 'I','II','III','IV','V'...'VIII'
  letter text,                 -- e.g. 'A','B'
  teacher_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);

-- 3) Enrollments (students in classes)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON public.enrollments(class_id);

-- 4) Ensure tests table has expected columns (added only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='tests' AND column_name='grade_level'
  ) THEN
    ALTER TABLE public.tests ADD COLUMN grade_level text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='tests' AND column_name='phase'
  ) THEN
    ALTER TABLE public.tests ADD COLUMN phase text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='tests' AND column_name='category'
  ) THEN
    ALTER TABLE public.tests ADD COLUMN category text DEFAULT 'profesor';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='tests' AND column_name='content'
  ) THEN
    ALTER TABLE public.tests ADD COLUMN content jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='tests' AND column_name='published'
  ) THEN
    ALTER TABLE public.tests ADD COLUMN published boolean NOT NULL DEFAULT false;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_tests_subject_grade ON public.tests(subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON public.tests(created_by);

-- 5) Scheduled tests / assignments
CREATE TABLE IF NOT EXISTS public.scheduled_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_target CHECK (
    ((class_id IS NOT NULL)::int + (student_id IS NOT NULL)::int) = 1
  )
);

CREATE INDEX IF NOT EXISTS idx_sched_class ON public.scheduled_tests(class_id);
CREATE INDEX IF NOT EXISTS idx_sched_student ON public.scheduled_tests(student_id);
CREATE INDEX IF NOT EXISTS idx_sched_created_by ON public.scheduled_tests(created_by);
CREATE INDEX IF NOT EXISTS idx_sched_test ON public.scheduled_tests(test_id);

-- 6) Results
CREATE TABLE IF NOT EXISTS public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.scheduled_tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score numeric(5,2),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_results_student ON public.results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_assignment ON public.results(assignment_id);

-- 7) RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Policies: schools/classes/enrollments (basic visibility)
DO $$ BEGIN
  -- Teachers & students see their related records; admins can be granted separately
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='schools_read_all' AND tablename='schools') THEN
    CREATE POLICY schools_read_all ON public.schools
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='classes_read_related' AND tablename='classes') THEN
    CREATE POLICY classes_read_related ON public.classes
      FOR SELECT USING (
        -- teacher of the class OR enrolled student in the class's school (loose)
        teacher_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.enrollments e WHERE e.class_id = classes.id AND e.student_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='enrollments_read_own' AND tablename='enrollments') THEN
    CREATE POLICY enrollments_read_own ON public.enrollments
      FOR SELECT USING (
        student_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.classes c WHERE c.id = enrollments.class_id AND c.teacher_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policies: scheduled_tests
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='scheduled_tests_select' AND tablename='scheduled_tests') THEN
    CREATE POLICY scheduled_tests_select ON public.scheduled_tests
      FOR SELECT USING (
        created_by = auth.uid()
        OR student_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.enrollments e 
          WHERE e.class_id = scheduled_tests.class_id AND e.student_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.classes c 
          WHERE c.id = scheduled_tests.class_id AND c.teacher_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='scheduled_tests_insert_teacher' AND tablename='scheduled_tests') THEN
    CREATE POLICY scheduled_tests_insert_teacher ON public.scheduled_tests
      FOR INSERT WITH CHECK (
        created_by = auth.uid()
        AND (
          (class_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid()
          ))
          OR
          (student_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.enrollments e 
            JOIN public.classes c ON c.id = e.class_id
            WHERE e.student_id = student_id AND c.teacher_id = auth.uid()
          ))
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='scheduled_tests_update_teacher' AND tablename='scheduled_tests') THEN
    CREATE POLICY scheduled_tests_update_teacher ON public.scheduled_tests
      FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

-- Policies: results
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='results_select' AND tablename='results') THEN
    CREATE POLICY results_select ON public.results
      FOR SELECT USING (
        student_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.classes c
          JOIN public.enrollments e ON e.class_id = c.id
          WHERE e.student_id = results.student_id AND c.teacher_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='results_insert_student' AND tablename='results') THEN
    CREATE POLICY results_insert_student ON public.results
      FOR INSERT WITH CHECK (
        student_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.scheduled_tests st WHERE st.id = assignment_id)
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='results_update_student' AND tablename='results') THEN
    CREATE POLICY results_update_student ON public.results
      FOR UPDATE USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
  END IF;
END $$;

-- 8) Enriched handle_new_user() to copy metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, prenume, nume, full_name, phone, county, city, school_id, clasa_id)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'elev'),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'prenume'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'nume'), ''),
    TRIM(COALESCE(NEW.raw_user_meta_data->>'prenume','') || ' ' || COALESCE(NEW.raw_user_meta_data->>'nume','')),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'telefon'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'judet'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'oras'), ''),
    NULLIF((NEW.raw_user_meta_data->>'scoala_id')::uuid, NULL),
    NULLIF((NEW.raw_user_meta_data->>'clasa_id')::uuid, NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    role      = EXCLUDED.role,
    prenume   = EXCLUDED.prenume,
    nume      = EXCLUDED.nume,
    full_name = EXCLUDED.full_name,
    phone     = EXCLUDED.phone,
    county    = EXCLUDED.county,
    city      = EXCLUDED.city,
    school_id = EXCLUDED.school_id,
    clasa_id  = EXCLUDED.clasa_id;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'::name
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;

COMMIT;
