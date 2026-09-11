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

## 3. Enable phone (SMS) sign-in

Supabase needs an SMS provider to send one-time codes. The easiest is Twilio:

1. Create a free [Twilio](https://www.twilio.com/try-twilio) account and a Twilio Verify Service
   (or a regular Twilio phone number — Verify is simpler and recommended).
2. In Supabase: **Authentication → Providers → Phone**. Enable it, choose Twilio, and paste your
   Account SID, Auth Token, and Verify Service SID (or Message Service SID).
3. Save. You can test it later once the web app is running (Sign In page).

> Twilio isn't free for SMS, but the pay-as-you-go cost is small for a single agent's traffic
> (a few cents per code sent). Trial accounts can send to verified numbers only, which is fine
> for testing before launch.

## 4. Get a Gemini API key (free)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in with a Google
   account, and click **Create API key**. No credit card needed for the free tier.
2. Keep this key private — it goes in the web app's server-only environment variable, never in
   the mobile app or any public file.

## 5. Make yourself the admin

Once you've signed in to the web app once with your own phone number (see step 6), go to the
Supabase **SQL Editor** and run:

```sql
update public.profiles set role = 'admin' where phone = '+201XXXXXXXXX';
```

(Use your own number in E.164 format, as stored by Supabase auth.) Reload the site — you'll now
see the **Admin** link in the nav bar.

## 6. Run the web app locally

```bash
cd web
cp .env.local.example .env.local
# edit .env.local and fill in the three values from steps 1 and 4
npm install
npm run dev
```

Open http://localhost:3000. Sign in with your phone number to create your account, then follow
step 5 to promote yourself to admin.

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
# from step 7 (needed for the AI chat tab)
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

## Next steps you may want

- **Arabic language support** — the UI is English-only for now; the AI chat already replies in
  whichever language the user writes in.
- **Push/SMS notifications to you** when something new needs review (currently you have to check
  the Admin dashboard).
- **App Store / Play Store publishing** via EAS Build once you're ready to launch the mobile app
  publicly.
