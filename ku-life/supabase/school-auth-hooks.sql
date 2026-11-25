-- Run as the project owner, then enable both Postgres hooks in Authentication.
create or replace function public.require_ku_email_for_signup(event jsonb)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select case
    when coalesce(event #>> '{user,email}', '') ~* '^[^@[:space:]]+@korea[.]ac[.]kr$'
      then '{}'::jsonb
    else '{"error":{"http_code":403,"message":"A korea.ac.kr email is required."}}'::jsonb
  end;
$$;

create or replace function public.require_ku_email_for_access_token(event jsonb)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when exists (
      select 1 from auth.users
      where id = (event ->> 'user_id')::uuid
        and email_confirmed_at is not null
        and email ~* '^[^@[:space:]]+@korea[.]ac[.]kr$'
    ) then event
    else '{"error":{"http_code":403,"message":"A verified korea.ac.kr email is required."}}'::jsonb
  end;
$$;

revoke execute on function public.require_ku_email_for_signup(jsonb) from public, anon, authenticated;
revoke execute on function public.require_ku_email_for_access_token(jsonb) from public, anon, authenticated;
grant execute on function public.require_ku_email_for_signup(jsonb) to supabase_auth_admin;
grant execute on function public.require_ku_email_for_access_token(jsonb) to supabase_auth_admin;
