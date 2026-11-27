begin;

create table if not exists public.rewind_orders (
  ref uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.rewind_payments (
  merchant_uid text primary key,
  order_ref uuid not null references public.rewind_orders(ref) on delete cascade,
  completed_at timestamptz not null
);

create table if not exists public.rewind_webhook_events (
  event_id text primary key,
  delivery_key text not null unique,
  merchant_uid text not null,
  content_id text not null,
  occurred_at timestamptz not null,
  refund_amount integer,
  full_refund boolean not null default false,
  refunded_at timestamptz
);
create unique index if not exists rewind_refund_once
  on public.rewind_webhook_events (merchant_uid, refunded_at)
  where refunded_at is not null;

create table if not exists public.rewind_branches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_id text not null,
  semester smallint not null check (semester between 1 and 8),
  request_id uuid not null,
  used_free boolean not null,
  unique (user_id, request_id)
);
create unique index if not exists rewind_one_free
  on public.rewind_branches (user_id) where used_free;

alter table public.rewind_orders enable row level security;
alter table public.rewind_payments enable row level security;
alter table public.rewind_webhook_events enable row level security;
alter table public.rewind_branches enable row level security;
revoke all on public.rewind_orders, public.rewind_payments, public.rewind_webhook_events,
  public.rewind_branches from public, anon, authenticated;
grant insert on public.rewind_orders to service_role;

create or replace function public.rewind_access(p_user uuid)
returns text language sql stable set search_path = '' as $$
  select case when exists (
    select 1 from public.rewind_orders o
    join public.rewind_payments p on p.order_ref = o.ref
    where o.user_id = p_user and not exists (
      select 1 from public.rewind_webhook_events e
      where e.merchant_uid = p.merchant_uid and e.content_id = o.content_id
        and e.refunded_at is not null
      having bool_or(e.full_refund) or sum(e.refund_amount) >= o.amount
    )
  ) then 'unlimited'
  when exists (select 1 from public.rewind_branches where user_id = p_user and used_free)
    then 'purchase_required'
  else 'free' end;
$$;

create or replace function public.rewind_start(p_user uuid, p_source text, p_semester integer, p_request uuid)
returns jsonb language plpgsql set search_path = '' as $$
declare
  existing public.rewind_branches%rowtype;
  access_status text;
  branch_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));
  select * into existing from public.rewind_branches where user_id = p_user and request_id = p_request;
  if found then
    if existing.source_id <> p_source or existing.semester <> p_semester then
      return jsonb_build_object('status', 'request_conflict');
    end if;
    return jsonb_build_object('branchId', existing.id);
  end if;

  access_status := public.rewind_access(p_user);
  if access_status = 'purchase_required' then
    return jsonb_build_object('status', access_status, 'branchId', null);
  end if;
  insert into public.rewind_branches (user_id, source_id, semester, request_id, used_free)
  values (p_user, p_source, p_semester, p_request, access_status = 'free')
  returning id into branch_id;
  return jsonb_build_object('branchId', branch_id);
end;
$$;

create or replace function public.rewind_groble_event(
  p_event text, p_delivery text, p_merchant text, p_content text, p_occurred_at timestamptz,
  p_ref uuid, p_amount integer, p_refund integer, p_full boolean, p_refunded_at timestamptz
) returns text language plpgsql set search_path = '' as $$
begin
  if p_refunded_at is null and not exists (
    select 1 from public.rewind_orders
    where ref = p_ref and content_id = p_content and amount = p_amount
  ) then
    return 'unmatched';
  end if;

  insert into public.rewind_webhook_events (
    event_id, delivery_key, merchant_uid, content_id, occurred_at, refund_amount, full_refund, refunded_at
  ) values (
    p_event, p_delivery, p_merchant, p_content, p_occurred_at, p_refund, p_full, p_refunded_at
  ) on conflict do nothing;
  if not found then return 'duplicate'; end if;

  if p_refunded_at is null then
    insert into public.rewind_payments (merchant_uid, order_ref, completed_at)
    values (p_merchant, p_ref, p_occurred_at) on conflict do nothing;
  end if;
  return 'recorded';
end;
$$;

revoke execute on function public.rewind_access(uuid),
  public.rewind_start(uuid, text, integer, uuid),
  public.rewind_groble_event(text, text, text, text, timestamptz, uuid, integer, integer, boolean, timestamptz)
  from public, anon, authenticated;
grant execute on function public.rewind_access(uuid),
  public.rewind_start(uuid, text, integer, uuid),
  public.rewind_groble_event(text, text, text, text, timestamptz, uuid, integer, integer, boolean, timestamptz)
  to service_role;
grant select on public.rewind_orders, public.rewind_payments, public.rewind_webhook_events to service_role;
grant select, insert on public.rewind_branches, public.rewind_payments, public.rewind_webhook_events to service_role;

commit;
