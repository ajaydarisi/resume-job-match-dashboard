create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete set null,
  job_match_id uuid references public.job_matches(id) on delete set null,
  company text not null,
  title text not null,
  location text not null default '',
  salary text not null default 'Not disclosed',
  match_score integer not null default 0 check (match_score >= 0 and match_score <= 100),
  apply_url text not null default '',
  status text not null default 'saved' check (status in ('saved', 'applied', 'oa_scheduled', 'interviewing', 'offer', 'rejected')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'critical')),
  next_action text,
  next_action_at timestamptz,
  notes text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.applications (
  user_id,
  analysis_id,
  job_match_id,
  company,
  title,
  location,
  salary,
  match_score,
  apply_url,
  priority,
  next_action,
  raw_payload,
  created_at,
  updated_at
)
select
  user_id,
  analysis_id,
  id,
  company,
  title,
  location,
  salary,
  match_score,
  apply_url,
  case
    when match_score >= 90 then 'high'
    when match_score < 70 then 'low'
    else 'normal'
  end,
  case
    when match_score >= 90 then 'Apply while the match is hot'
    else 'Review fit and tailor resume'
  end,
  raw_payload,
  created_at,
  created_at
from public.job_matches
where not exists (
  select 1
  from public.applications applications
  where applications.user_id = job_matches.user_id
    and applications.apply_url = job_matches.apply_url
);

create unique index if not exists applications_user_apply_url_unique_idx
  on public.applications(user_id, apply_url)
  where apply_url <> '';

create index if not exists applications_user_status_idx
  on public.applications(user_id, status, updated_at desc);

create index if not exists applications_user_score_idx
  on public.applications(user_id, match_score desc);

alter table public.applications enable row level security;

drop policy if exists "Users can read their applications" on public.applications;
create policy "Users can read their applications"
  on public.applications for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their applications" on public.applications;
create policy "Users can insert their applications"
  on public.applications for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their applications" on public.applications;
create policy "Users can update their applications"
  on public.applications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their applications" on public.applications;
create policy "Users can delete their applications"
  on public.applications for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.applications to authenticated;
