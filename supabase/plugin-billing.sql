-- Paste into the SQL editor:
-- https://supabase.com/dashboard/project/kxqykdxydhfglnubjghj/sql/new
-- Service role bypasses RLS. Anon/publishable key has no policies, so the
-- browser cannot read billing rows.

create table if not exists plugin_users (
  figma_user_id text primary key,
  paddle_customer_id text unique,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists plugin_entitlements (
  figma_user_id text primary key references plugin_users (figma_user_id) on delete cascade,
  status text not null default 'free',
  plan text,
  paddle_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists plugin_usage (
  id uuid primary key default gen_random_uuid(),
  figma_user_id text not null references plugin_users (figma_user_id) on delete cascade,
  plugin text not null,
  action text not null default 'apply',
  created_at timestamptz not null default now()
);

create index if not exists plugin_usage_user_plugin_idx
  on plugin_usage (figma_user_id, plugin);

alter table plugin_users enable row level security;
alter table plugin_entitlements enable row level security;
alter table plugin_usage enable row level security;
