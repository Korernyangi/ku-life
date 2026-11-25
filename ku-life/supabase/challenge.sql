create table if not exists public.challenge_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  revision integer not null default 0 check (revision >= 0),
  state jsonb not null,
  major_id text not null,
  score integer check (score between 0 and 1000),
  public_nickname text check (char_length(public_nickname) between 1 and 20),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check ((score is null) = (completed_at is null)),
  check (public_nickname is null or score is not null)
);

create unique index if not exists challenge_one_active_per_user
  on public.challenge_runs (user_id) where completed_at is null;
create index if not exists challenge_runs_by_user
  on public.challenge_runs (user_id, created_at desc);

alter table public.challenge_runs enable row level security;
revoke all on public.challenge_runs from public, anon, authenticated;
grant select, insert, update on public.challenge_runs to service_role;

create or replace view public.challenge_ranking with (security_invoker = true) as
select rank() over (order by score desc) as rank, public_nickname, major_id, score, completed_at
from (
  select distinct on (user_id) public_nickname, major_id, score, completed_at
  from public.challenge_runs
  where public_nickname is not null
  order by user_id, score desc, completed_at asc
) as best;

revoke all on public.challenge_ranking from public, anon, authenticated;
grant select on public.challenge_ranking to service_role;
