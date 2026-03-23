-- Humacap production schema (LMS)
-- Run in Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS and DROP POLICY IF EXISTS.

begin;

create extension if not exists pgcrypto;

-- ============================================================
-- 1) Live sessions (for dashboard Upcoming Sessions)
-- ============================================================
create table if not exists public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id text null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz null,
  timezone text not null default 'UTC',
  join_url text null,
  host_notes text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_live_sessions_starts_at on public.live_sessions (starts_at);
create index if not exists idx_live_sessions_course_id on public.live_sessions (course_id);

alter table public.live_sessions enable row level security;

drop policy if exists "live_sessions_select_authenticated" on public.live_sessions;
create policy "live_sessions_select_authenticated"
on public.live_sessions
for select
to authenticated
using (true);

-- ============================================================
-- 2) Forum: threads + replies (per course)
-- ============================================================
create table if not exists public.course_forum_threads (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  author_id uuid null references auth.users(id) on delete set null,
  author_name text not null,
  title text not null,
  body text not null,
  is_hidden boolean not null default false,
  reported_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_forum_threads_course_id_created_at
  on public.course_forum_threads (course_id, created_at desc);

create table if not exists public.course_forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.course_forum_threads(id) on delete cascade,
  author_id uuid null references auth.users(id) on delete set null,
  author_name text not null,
  body text not null,
  is_instructor boolean not null default false,
  is_hidden boolean not null default false,
  reported_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_forum_replies_thread_id_created_at
  on public.course_forum_replies (thread_id, created_at asc);

alter table public.course_forum_threads enable row level security;
alter table public.course_forum_replies enable row level security;

drop policy if exists "forum_threads_select_authenticated" on public.course_forum_threads;
create policy "forum_threads_select_authenticated"
on public.course_forum_threads
for select
to authenticated
using (is_hidden = false);

drop policy if exists "forum_threads_insert_authenticated" on public.course_forum_threads;
create policy "forum_threads_insert_authenticated"
on public.course_forum_threads
for insert
to authenticated
with check (
  auth.uid() = author_id
  and char_length(title) between 3 and 200
  and char_length(body) between 3 and 5000
);

drop policy if exists "forum_threads_update_own" on public.course_forum_threads;
create policy "forum_threads_update_own"
on public.course_forum_threads
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "forum_replies_select_authenticated" on public.course_forum_replies;
create policy "forum_replies_select_authenticated"
on public.course_forum_replies
for select
to authenticated
using (is_hidden = false);

drop policy if exists "forum_replies_insert_authenticated" on public.course_forum_replies;
create policy "forum_replies_insert_authenticated"
on public.course_forum_replies
for insert
to authenticated
with check (
  auth.uid() = author_id
  and char_length(body) between 1 and 5000
);

drop policy if exists "forum_replies_update_own" on public.course_forum_replies;
create policy "forum_replies_update_own"
on public.course_forum_replies
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

-- ============================================================
-- 3) Access control: code catalog + user entitlements
-- ============================================================
create table if not exists public.course_access_codes (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  code_hash text not null,
  is_active boolean not null default true,
  expires_at timestamptz null,
  max_uses integer null,
  used_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, code_hash)
);

create index if not exists idx_course_access_codes_course_id on public.course_access_codes (course_id);
create index if not exists idx_course_access_codes_active on public.course_access_codes (is_active);

create table if not exists public.user_course_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  granted_by text not null default 'code',
  granted_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists idx_user_course_access_user_id on public.user_course_access (user_id);
create index if not exists idx_user_course_access_course_id on public.user_course_access (course_id);

alter table public.course_access_codes enable row level security;
alter table public.user_course_access enable row level security;

-- No direct client access to code table.
drop policy if exists "course_access_codes_no_client_access" on public.course_access_codes;
create policy "course_access_codes_no_client_access"
on public.course_access_codes
for all
to authenticated
using (false)
with check (false);

-- Users can read only their own entitlements.
drop policy if exists "user_course_access_select_own" on public.user_course_access;
create policy "user_course_access_select_own"
on public.user_course_access
for select
to authenticated
using (auth.uid() = user_id);

-- Optional direct insert (for service role/admin workflows only).
-- Keep blocked for normal authenticated clients.
drop policy if exists "user_course_access_insert_blocked" on public.user_course_access;
create policy "user_course_access_insert_blocked"
on public.user_course_access
for insert
to authenticated
with check (false);

commit;

-- ============================================================
-- Recommended next step (after this file):
-- Build an Edge Function "validate-course-code" that:
-- 1) receives course_id + code
-- 2) checks course_access_codes (hash compare)
-- 3) increments used_count (if applicable)
-- 4) inserts user_course_access (user_id, course_id)
-- ============================================================
