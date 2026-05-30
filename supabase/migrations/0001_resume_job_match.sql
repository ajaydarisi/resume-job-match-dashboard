create extension if not exists pgcrypto;

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_name text,
  resume_text text not null,
  skills text[] not null default '{}',
  years_of_experience text not null default '',
  seniority_level text not null default '',
  technologies text[] not null default '{}',
  leadership_experience text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  title text not null,
  location text not null,
  salary text not null default 'Not disclosed',
  match_score integer not null check (match_score >= 0 and match_score <= 100),
  reason text not null,
  missing_skills text[] not null default '{}',
  apply_url text not null,
  contact_email text,
  contact_linkedin text,
  contact_reason text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
  on public.analyses(user_id, created_at desc);

create index if not exists job_matches_user_score_idx
  on public.job_matches(user_id, match_score desc);

alter table public.analyses enable row level security;
alter table public.job_matches enable row level security;

drop policy if exists "Users can read their analyses" on public.analyses;
create policy "Users can read their analyses"
  on public.analyses for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their analyses" on public.analyses;
create policy "Users can insert their analyses"
  on public.analyses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their analyses" on public.analyses;
create policy "Users can delete their analyses"
  on public.analyses for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their job matches" on public.job_matches;
create policy "Users can read their job matches"
  on public.job_matches for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their job matches" on public.job_matches;
create policy "Users can insert their job matches"
  on public.job_matches for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their job matches" on public.job_matches;
create policy "Users can delete their job matches"
  on public.job_matches for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, delete on public.analyses to authenticated;
grant select, insert, delete on public.job_matches to authenticated;
