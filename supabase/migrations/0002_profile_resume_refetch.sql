alter table public.analyses
  add column if not exists candidate_name text,
  add column if not exists mobile_number text,
  add column if not exists preferred_cities text[] not null default '{}',
  add column if not exists model_name text,
  add column if not exists analysis_payload jsonb not null default '{}'::jsonb;

alter table public.job_matches
  add column if not exists source text not null default 'ollama',
  add column if not exists discovered_at timestamptz not null default now();

delete from public.job_matches
where id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by user_id, apply_url
        order by created_at asc, id asc
      ) as duplicate_rank
    from public.job_matches
    where apply_url <> ''
  ) ranked
  where duplicate_rank > 1
);

create unique index if not exists job_matches_user_apply_url_unique_idx
  on public.job_matches(user_id, apply_url)
  where apply_url <> '';
