# Diyar Properties

A real-estate marketplace for Egypt: property owners and renters submit listings, seekers post
what they're looking for, everything is reviewed by a single admin (the agent) before it goes
live, and contact info is never shown publicly — all communication routes through the agent.

## Structure

- **`web/`** — Next.js website: public browsing, listing/request submission, admin review
  dashboard, and the AI chat assistant (Gemini-powered).
- **`mobile/`** — Expo React Native app (iOS/Android) covering the same flows, sharing the same
  Supabase backend.
- **`supabase/migrations/`** — the database schema: tables, row-level security policies, and
  storage bucket setup. Source of truth for both apps.
- **`docs/SETUP.md`** — step-by-step instructions to get this running: create a Supabase
  project, get a free Gemini API key, deploy the web app, and run the mobile app.

## How moderation works

Nothing submitted by a user is public until an admin approves it:

1. A property or "looking for" request is submitted → status `pending_review`.
2. A lightweight automated check scans the text for likely phone numbers, WhatsApp/social
   links, or phrasing that tries to route around the agent, and flags it for priority review —
   it never blocks or auto-rejects, the admin always makes the final call.
3. The admin reviews (with full contact info visible only to them) and approves or rejects.
4. Only approved items appear on the public site/app.

Contact information (phone/email) is stored in separate database tables with their own access
rules, so it's excluded from public results at the database level — not just hidden in the UI.

## Getting started

See [`docs/SETUP.md`](docs/SETUP.md).
