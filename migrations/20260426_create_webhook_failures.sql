create table if not exists webhook_failures (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text,
  event_type text,
  error_type text,
  payload jsonb,
  created_at timestamp default now()
);
