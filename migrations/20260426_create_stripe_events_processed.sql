create table if not exists stripe_events_processed (
  id text primary key,
  created_at timestamp default now()
);
