# Kokeb — Accounts & Property Portal (start here)

This build adds real customer accounts and a property portal on top of the
existing Kokeb starter. It follows the plan in *Kokeb — Today's Plan:
Accounts & Property Portal*.

## What's included

- Real Supabase Auth: `app/auth/page.jsx` now calls
  `supabase.auth.signInWithPassword` / `supabase.auth.signUp` instead of the
  old UI-only stub.
- `app/auth/confirm/route.js` — handles the email confirmation link.
- `app/auth/error/page.jsx` — shown if a confirmation link fails.
- `app/dashboard/` — protected customer dashboard, My Properties, and the
  Add Property form.
- `lib/supabase/client.js` and `lib/supabase/server.js` — Supabase clients
  for the browser and the server.
- `proxy.js` — Next.js 16's request-interception file (the replacement for
  `middleware.js`); keeps the login session refreshed.
- `supabase/kokeb_accounts_phase1.sql` — creates `profiles` and `listings`,
  the auto-profile trigger, and all Row Level Security policies.

## What you still need to do

Three things need your real Supabase project — nothing here can safely be
invented on your behalf.

### 1. Connect your Supabase project

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your project's real values from
**Supabase → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2. Run the SQL migration

In Supabase → **SQL Editor** → New query, paste the entire contents of
`supabase/kokeb_accounts_phase1.sql` and run it. It's safe to run once on a
fresh project — it creates the `profiles` and `listings` tables, an
auto-profile trigger, and Row Level Security policies.

### 3. Point the confirmation email at `/auth/confirm`

In Supabase → **Authentication → Email Templates → Confirm signup**, change:

```
{{ .ConfirmationURL }}
```

to:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

Also set **Authentication → URL Configuration → Site URL** to your real
site URL (e.g. `https://kokeb-pied.vercel.app` in production, or
`http://localhost:3000` while testing locally).

## Run it

```bash
npm install
npm run dev
```

Open **http://localhost:3000/auth**, create an account, confirm the email,
then you'll land in `/dashboard`.

## Test it before trusting it

1. Sign up as Customer A, add a property, confirm it shows under My
   Properties.
2. Log out. Sign up as Customer B. Confirm My Properties is empty for
   Customer B — Customer A's property does not appear.
3. Confirm `/dashboard` redirects to `/auth` when logged out.

If all three pass, today's build is done. The full roadmap (photos, admin
accounts, publishing, long-term rentals, the AI assistant) is covered in
the *Kokeb — Complete VS Code Build Manual* PDF, in the order it should be
built.

## Deploying

Add the same two environment variables in **Vercel → Settings →
Environment Variables**, then push this branch and test its preview URL
before merging into your production branch.
