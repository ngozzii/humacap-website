create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  course_id text,
  stripe_session_id text unique,
  amount integer,
  created_at timestamp default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'unique_stripe_session_id'
  ) then
    alter table purchases
      add constraint unique_stripe_session_id unique (stripe_session_id);
  end if;
end
$$;
