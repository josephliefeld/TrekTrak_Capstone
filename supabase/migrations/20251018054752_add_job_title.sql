create table public.employees (
  id bigint generated always as identity not null,
  name text null,
  email text null,
  created_at timestamp with time zone null default now(),
  job_title text null default 'NULL'::text,
  constraint employees_pkey primary key (id)
) TABLESPACE pg_default;