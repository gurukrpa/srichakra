-- Create table to track generated PDFs
create table if not exists public.pdfs (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  school_code text,
  bucket text not null,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pdfs_user_email on public.pdfs(user_email);
create index if not exists idx_pdfs_school_code on public.pdfs(school_code);

-- Optional: RLS can be added later for fine-grained access control
-- alter table public.pdfs enable row level security;