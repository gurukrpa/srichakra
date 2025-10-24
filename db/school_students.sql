-- School-assigned student IDs and status tracking
create table if not exists public.school_students (
  id uuid primary key default gen_random_uuid(),
  school_code text not null,
  student_id text not null,
  student_name text not null,
  parent_name text,
  class text,
  expected_email text,
  claimed_email text,
  status text not null default 'pending', -- pending | registered | completed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_school_students_code_id on public.school_students(school_code, student_id);
create index if not exists idx_school_students_status on public.school_students(status);
create index if not exists idx_school_students_claimed on public.school_students(claimed_email);
