# MEL.md

This is a hackathon project: a half-built copy of Apollo.io (a lead finder) that we are turning into a real SaaS product the whole group can use.

## The stack

- Next.js (App Router) + TypeScript + React. Plain CSS in `app/globals.css`, no Tailwind.
- Data: `lib/db.ts` reads and writes `data/db.json`. `data/seed.json` is the starting data (fake people). This is temporary.
- Pages: `/` (dashboard), `/leads` (table, filters, add, import), `/leads/[id]` (lead page with notes and activity), `/lists`, `/sequences`, `/pricing`.
- Routes: `app/api/leads` (list, add, filter), `app/api/leads/[id]` (get one, status, opt-out), `.../notes`, `.../enrich`, `.../import`, `app/api/lists` and `app/api/lists/[id]` (add and remove leads), `app/api/sequences` and `app/api/sequences/[id]` (add leads, change step, remove), `app/api/export`.
- Sequences: `lib/sequences.ts` has the types and `fillTemplate`. Sending is not built.
- Leads can have `firstName`, `optedOut`, `notes` and `activity` (all optional). Use `logActivity` in `lib/leads.ts` when something changes on a lead.
- Score: `lib/score.ts` (title + company size + has email).
- Payments: `app/api/checkout/route.ts` is a stub. Stripe is not connected.
- Runs on port 3103.

## The job

Work through `ZOMBIE.md` in order: make it work, make it secure, make it compliant, connect Stripe, ship it.
Every planted problem in the code is marked with a `ZOMBIE:` comment.

## Rules for agents

- Keep it running. Run `npm run build` after each change and fix what breaks.
- Never commit secrets. Keys go in `.env.local` (it is git-ignored).
- Use Stripe test mode keys only.
- Never email a lead until consent, lawful basis and unsubscribe are built.
- When you fix a `ZOMBIE:` item, delete its comment and tick its box in `ZOMBIE.md`.
- Small commits with plain messages.
