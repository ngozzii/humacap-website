# Humacap LMS Production Readiness

This document tracks recommended production changes before go-live.

## 1) Access Code System (Paid Courses)

Current state:
- Access codes are hardcoded in frontend (`Dashboard.jsx`), which is not secure for production.

Production recommendation:
- Move course access code validation to backend (Supabase).
- Do not store real access codes in client code.

Suggested data model:
- `course_access_codes`
  - `id` (uuid, pk)
  - `course_id` (text)
  - `code_hash` (text)  // store hash, not plain text
  - `is_active` (boolean default true)
  - `expires_at` (timestamptz nullable)
  - `max_uses` (int nullable)
  - `used_count` (int default 0)
  - `created_at` (timestamptz default now())

- `user_course_access`
  - `id` (uuid, pk)
  - `user_id` (uuid)
  - `course_id` (text)
  - `granted_by` (text) // "code", "admin", "purchase"
  - `granted_at` (timestamptz default now())
  - unique (`user_id`, `course_id`)

Implementation approach:
- Create a Supabase Edge Function `validate-course-code`.
- Client sends `course_id` + `code`.
- Function validates hash, expiry, usage limits.
- Function writes to `user_course_access` on success.
- Dashboard reads unlock state from `user_course_access` (not localStorage).

## 2) Free Courses Visibility

Current state:
- Free course is visible and accessible in dashboard grid.

Production recommendation:
- Keep free content visible to all signed-in users.
- Optionally show free courses on public pages as acquisition funnel.
- Track conversions from free -> paid (analytics event).

## 3) Upcoming Live Sessions

Current state:
- Dashboard tries Supabase `live_sessions`, falls back to local mock sessions.

Production recommendation:
- Remove fallback mock data in production build.
- Drive all sessions from backend.

Suggested `live_sessions` fields:
- `id` (uuid, pk)
- `course_id` (text nullable)
- `title` (text)
- `starts_at` (timestamptz)
- `timezone` (text)
- `join_url` (text)
- `is_active` (boolean default true)
- `created_at` (timestamptz default now())

Best practices:
- Show `Join live` only in a configurable time window.
- Add optional `ends_at`.
- Add admin UI for instructors to manage links and schedules.

## 4) Discussion Forum (Per Course)

Current state:
- Forum UI exists in `CoursePlayer`.
- Uses fallback/local mode if DB tables are missing.

Production recommendation:
- Create and enforce backend tables + RLS.
- Remove fallback mode or keep only as explicit "dev mode".

Required tables:
- `course_forum_threads`
  - `id` (uuid, pk)
  - `course_id` (text)
  - `author_id` (uuid)
  - `author_name` (text)
  - `title` (text)
  - `body` (text)
  - `created_at` (timestamptz default now())

- `course_forum_replies`
  - `id` (uuid, pk)
  - `thread_id` (uuid, fk -> course_forum_threads.id on delete cascade)
  - `author_id` (uuid)
  - `author_name` (text)
  - `body` (text)
  - `is_instructor` (boolean default false)
  - `created_at` (timestamptz default now())

Moderation recommendations:
- Add `is_hidden`, `reported_count`, and soft-delete support.
- Add instructor/admin moderation actions.

## 5) Split LMS into Two Tracks (Pharmacy + Business)

Target architecture:
- Track selector in LMS:
  - `Pharmacy LMS`
  - `Business LMS`

Business LMS requirements:
- Company/bundle-based access
- Async course progression
- Org-level reporting

Suggested future tables:
- `organizations`
- `organization_users`
- `organization_courses`
- `organization_enrollments`

## 6) Authentication & Authorization

Checklist:
- Require auth for dashboard, player, profile.
- Enforce authorization server-side:
  - User can only open course if free OR unlocked OR entitled.
- Never trust client-only checks for paid content.

## 7) Security (Must-Do Before Launch)

- Enable Supabase Row Level Security (RLS) on all LMS tables.
- Add strict policies for read/write by `auth.uid()`.
- Use server functions for sensitive flows:
  - access code validation
  - entitlement grants
  - instructor marking
- Rate-limit forum posting endpoints.
- Validate and sanitize user input.

## 8) Operational Readiness

- Add error monitoring (Sentry or similar).
- Add analytics events for:
  - dashboard view
  - code unlock attempt/success/failure
  - forum thread/reply creation
  - join live click
- Add database backups + rollback procedure.
- Add staging environment with production-like data model.

## 8.1) Stripe Live Payment URLs (Required Before Launch)

Current state:
- Some courses already have `stripeUrl` values in `COURSES_DATA`.

Production requirement:
- Ensure every paid course points to a **Stripe live** payment link (not test).
- Keep free courses with no payment URL.

Checklist:
- Verify all paid course links use Stripe live mode URLs.
- Remove any test URLs before production release.
- Map each paid course to the correct live product/price.
- Confirm success/cancel behavior after checkout.

Env/config recommendations:
- Store Stripe-related values in environment variables, not hardcoded where possible.
- Keep separate test and production configuration.

Webhook recommendation (strongly recommended):
- Configure Stripe webhook -> backend endpoint/Supabase Edge Function.
- On successful payment, grant entitlement in backend:
  - write to `user_course_access` for the purchased `course_id`.
- Use webhook as source of truth (not client redirect alone).

## 9) QA Checklist

- New user can sign in and view all course cards.
- Free course opens without code.
- Paid course prompts for code and unlocks correctly.
- Unlock persists across sessions from backend entitlement.
- Live session cards display and Join opens correct URL.
- Forum post/reply works and persists after refresh.
- Unauthorized users cannot access paid course player route directly.
- Mobile/tablet responsive checks for dashboard and player.

## 10) Release Plan (Recommended Order)

1. Create Supabase schema + RLS for live sessions + forum + entitlements.
2. Replace frontend hardcoded access codes with backend validation flow.
3. Add admin workflows (session links, code creation, moderation).
4. Enable monitoring + analytics.
5. Run QA checklist and production smoke tests.
6. Launch.

