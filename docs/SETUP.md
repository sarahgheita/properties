# Setup Guide

This project has three parts that share one Supabase backend:

- `web/` — Next.js website (public site + admin dashboard + AI chat API)
- `mobile/` — Expo React Native app (iOS/Android, same backend)
- `supabase/migrations/` — the database schema (SQL), source of truth for both apps

Follow these steps in order. Steps 1–4 only need to be done once.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a free account, and create a new project.
2. Once it's ready, open **Project Settings → API**. You'll need:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key

## 2. Run the database migrations

1. In the Supabase dashboard, open the **SQL Editor**.
2. Open each file in `supabase/migrations/` **in order** (0001, 0002, 0003…) and run its
   contents in the SQL Editor. This creates all tables, security policies, and the storage
   bucket for property photos.

   (If you have the Supabase CLI installed locally, you can instead run
   `supabase link --project-ref <your-project-ref>` then `supabase db push` from the repo root.)

## 3. Sign-in method: email + password (already free, no setup needed)

Accounts use email + password via Supabase Auth — no SMS provider, no extra account, and no
cost. It works out of the box once the migrations are run.

One thing worth knowing: by default, Supabase requires new users to click a confirmation link
in their email before they can sign in (**Authentication → Providers → Email → "Confirm
email"**). The app already handles this correctly (`web/src/app/auth/confirm/route.ts`), but if
you'd rather people get signed in immediately after creating an account — simpler for early
testing — you can turn that toggle off in the Supabase dashboard. Supabase sends these emails
itself at no cost on a low rate limit (a handful per hour), which is plenty for a single agent's
traffic; if you outgrow it later, connect a custom SMTP provider (e.g. Resend's free tier) under
**Authentication → Settings → SMTP**.

> Prefer phone/SMS sign-in instead? It's a bigger lift (needs a paid SMS provider like Twilio,
> roughly $0.02–$0.08 per code at Egypt rates) and isn't wired up in this version — ask if you'd
> like it added back.

## 4. Get a Gemini API key (free)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in with a Google
   account, and click **Create API key**. No credit card needed for the free tier.
2. Keep this key private — it goes in the web app's server-only environment variable, never in
   the mobile app or any public file.

## 5. Make yourself the admin

Once you've signed up on the web app with your own email (see step 6), go to the Supabase
**SQL Editor** and run:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

(Use the email you signed up with.) Reload the site — you'll now see the **Admin** link in the
nav bar.

## 6. Run the web app locally

```bash
cd web
cp .env.local.example .env.local
# edit .env.local and fill in the three values from steps 1 and 4
npm install
npm run dev
```

Open http://localhost:3000. Create an account (top right → Sign In → "Create one") to make your
own account, then follow step 5 to promote yourself to admin.

## 7. Deploy the web app

The simplest option is [Vercel](https://vercel.com) (built by the makers of Next.js, generous
free tier):

1. Push this repo to GitHub.
2. Import the repo in Vercel, set the **root directory** to `web/`.
3. Add the same three environment variables from `.env.local` in Vercel's project settings.
4. Deploy. You'll get a URL like `https://your-site.vercel.app`.

## 8. Run the mobile app

```bash
cd mobile
cp .env.example .env
# edit .env: same Supabase URL/key as the web app, plus your deployed web app URL
# from step 7 (needed for the AI chat tab, and for email confirmation links)
npm install
npm run start
```

Scan the QR code with the **Expo Go** app on your phone (iOS/Android) to try it instantly. When
you're ready to publish to the App Store / Play Store, look into
[EAS Build](https://docs.expo.dev/build/introduction/) (Expo's build service) — that's a bigger
step involving developer accounts with Apple/Google and isn't needed just to test the app.

## What's already handled for you

- **Every listing and request starts hidden** (`pending_review`) and only becomes public once
  you approve it from the Admin dashboard (`/admin` on web, the Admin tab on mobile).
- **Contact info is never in any public response** — it lives in separate database tables that
  only the submitting user and admins can read, enforced by the database itself (Row Level
  Security), not just hidden in the UI.
- **Automatic flagging**: submissions with likely phone numbers, WhatsApp/social links, or
  "contact me directly"-style phrasing in the text are flagged and sorted to the top of your
  review queue — you still make the final call.
- **The AI chat** answers basic questions and can turn a conversation into a draft "looking for"
  request, but it never writes to the database directly — the user reviews and submits it
  themselves through the normal form, so it goes through the same moderation queue as everything
  else.
- **Arabic + English** — a language switcher (EN/عربي) in the nav bar covers the whole
  public-facing site, RTL layout included. The AI chat also replies in whichever language the
  visitor writes in. The admin dashboard stays English-only for now (internal tool).

## Next steps you may want

- **Push/email notifications to you** when something new needs review (currently you have to
  check the Admin dashboard).
- **App Store / Play Store publishing** via EAS Build once you're ready to launch the mobile app
  publicly.
- **Phone/SMS sign-in** if you'd rather use that instead of (or alongside) email/password later.
