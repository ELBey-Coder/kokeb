# Kokeb — Listing Detail Page Starter

A ready-to-run Next.js 16 (App Router) project containing your Ethio-Modernist
listing page with a working guest booking engine. Runs clean on `npm audit`
as of this build.

## What's inside

```
kokeb/
├── app/
│   ├── layout.jsx                  # Root layout, loads global styles
│   ├── page.jsx                    # ⭐ Marketplace homepage — tabs + listing cards
│   ├── auth/
│   │   └── page.jsx                # Sign in / sign up UI (matches live site's /auth)
│   ├── globals.css                 # Tailwind base styles
│   ├── booking-confirmed/
│   │   └── page.jsx                # Landing page after mock checkout
│   ├── listing/[id]/
│   │   ├── page.jsx                # Server component — resolves listing by id
│   │   └── ListingDetailClient.jsx # ⭐ Booking engine (dates, pricing, checkout)
│   └── api/bookings/checkout/
│       └── route.js                # Mock checkout endpoint (stubbed, no Stripe key needed)
├── lib/
│   └── listings.js                 # ⭐ Shared mock listings data (5 sample stays)
├── .vscode/                        # Recommended VS Code settings + extensions
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── jsconfig.json                   # Enables @/ import alias
```

## Homepage structure

The homepage (`app/page.jsx`) matches the real Kokeb site's layout:
navy sticky header with logo, search bar, and 5 category tabs (Homes,
Vibes, Services, Long-term, Commercial). Only **Homes** is wired up with
real listing cards — the other four render a "coming soon" placeholder,
matching where the real product currently stands (see project brief).

## Real property listings

`lib/listings.js` now contains **3 real, currently-bookable properties**,
pulled directly from the live booking site at
https://sgwayss.holidayfuture.com — not placeholder data. Each includes
real photos, descriptions, amenities, guest/bed/bath counts, ratings, and
house rules/cancellation policy, sourced from that site.

**Important:** that source site only calculates a nightly price after you
pick check-in/check-out dates on its own booking engine — there's no fixed
price to pull statically. Rather than invent a price for real, bookable
properties, each listing's detail page links out ("Check availability &
book") directly to its real page on sgwayss.holidayfuture.com, where the
actual rate, live calendar, and checkout happen. This project's own fake
checkout flow (the old `/api/bookings/checkout` route and
`/booking-confirmed` page) was removed since it's no longer appropriate
for real inventory.

If you get real per-night pricing from the property owner later, it's a
straightforward addition back into `lib/listings.js` and the detail page.

## Sign in

The header's "Sign in" button links to `/auth`, matching the real Kokeb
site's flow (per the project brief: email/password auth via Supabase).
The form is UI-only — submitting it shows a note explaining it isn't wired
up yet, rather than silently failing. When you're ready to connect it,
replace the stub in `handleSubmit` (in `app/auth/page.jsx`) with real
`supabase.auth.signInWithPassword` / `supabase.auth.signUp` calls.

## 1. First-time setup

You need [Node.js](https://nodejs.org) 18.18+ installed. Check with:

```bash
node -v
```

Then, in the project root:

```bash
npm install
```

This pulls in Next.js, React, Tailwind, and `lucide-react` (the icon library
the component uses).

## 2. Run it

```bash
npm run dev
```

Open **http://localhost:3000** — it'll link you straight to the demo listing
at `/listing/addis-luxury-loft`.

## 3. VS Code setup

1. Open the `kokeb` folder in VS Code (`File → Open Folder…`).
2. Install the recommended extensions when prompted (Tailwind CSS
   IntelliSense is the important one — it makes the utility classes in the
   component clickable/autocompletable).
3. Split your editor: component on the left (`app/listing/[id]/page.jsx`),
   terminal + browser preview on the right.
4. Keep `npm run dev` running in the integrated terminal — Next.js hot-reloads
   on every save.

## 4. What's mocked vs. real

- **Listing data** — currently hardcoded as `MOCK_LISTING` at the top of
  `app/listing/[id]/page.jsx`. Swap this for a Supabase (or any DB) fetch
  keyed on `params.id` when you're ready.
- **Checkout** — `app/api/bookings/checkout/route.js` is a stub. It doesn't
  charge any card; it just redirects to `/booking-confirmed`. When you're
  ready to take real payments, install `stripe`, add your secret key to a
  `.env.local` file, and replace the stub logic (there's a comment in that
  file showing exactly where).
- **Images** — pulled from Unsplash for the demo. `next.config.js` already
  allowlists `images.unsplash.com`; add any other image domains you use
  there too if you switch to `next/image`.

## 5. Fixing the "photo bug" mentioned in your notes

This build already includes the fix: the hero image renders from
`listing.photo_url` when present, and falls back to a styled gradient
placeholder when it's missing — so a listing without a photo never breaks
the layout.

## 6. Vibe coding from here

Good next things to try tweaking:
- Colors: search for the hex codes (`#0B132B`, `#FFB703`, `#5BC0BE`) and swap
  the palette.
- `MOCK_LISTING.services` — add more add-on experiences, the pricing math
  updates automatically.
- Wire `handleBookNow` to a real backend once you have one.

If `npm run dev` ever errors out, the most common first fix is deleting
`node_modules` and `.next`, then running `npm install` again.
