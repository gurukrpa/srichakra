-- Users table required by /api/register and /api/login endpoints
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  full_name text,
  student_name text,
  parent_name text,
  school_name text,
  age text,
  occupation text,
  city text,
  country text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_created_at on public.users(created_at);
create index if not exists idx_users_school_name on public.users(school_name);
create index if not exists idx_users_city on public.users(city);
create index if not exists idx_users_country on public.users(country);
