# 🧟 ZOMBIE.md: what's broken

This app is a zombie on purpose. Pick items off this list. Every box you tick gets it closer to a product we can all use and stop paying for Apollo.io.

Search the code for `ZOMBIE:` to find every planted problem.

## 1. Make it work

- [ ] **Enrich is fake.** The Enrich button writes placeholder data (`app/api/leads/[id]/enrich/route.ts`). Connect a real enrichment source.
- [ ] **CSV import only reads the first column.** Title, company, email and the rest are dropped (`app/api/leads/import/route.ts`). Read each column by its header name.
- [ ] **Export CSV is not built.** The button shows "not built yet" (`app/api/export/route.ts`).
- [ ] **Sequences do not send anything.** The sequences page tracks who is on which step, but no email or LinkedIn message is ever sent (`app/sequences/page.tsx`). Send step messages on the right day, and move leads to the next step on their own.
- [ ] **Message templates break when a lead has no first name.** `{firstName}` is left in the text as-is, so a message can say "Hi {firstName}," (`lib/sequences.ts`). Use a safe fallback like "there".
- [ ] **The score formula is wrong.** A missing email takes away 50 points, so great leads with no email score near zero (`lib/score.ts`). It should only skip the bonus.

## 2. Make it secure

- [ ] There is no login. Anyone who finds the URL sees everything. Add accounts (Supabase Auth, Clerk, Auth.js...).
- [ ] Every API route trusts whatever it's sent. Validate input on the server.
- [ ] Ids are guessable (`lib/db.ts`). Use random ids and check that the record belongs to the signed-in user.
- [ ] Data lives in `data/db.json` on disk. Move it to a real database.
- [ ] No rate limit on the API (`app/api/leads/route.ts`). Add one so nobody can scrape the whole list.

## 3. Make it compliant

- [ ] **Opt-outs are ignored by sequences.** Leads have an `optedOut` flag and the lead page can set it, but adding a lead to a sequence never checks it (`app/api/sequences/[id]/route.ts`). Skip opted-out people and say why.
- [ ] **CAN-SPAM (US):** every marketing email needs a working unsubscribe link, your real address, and honest subject lines. The opt-out flag exists per lead, but nothing uses it yet. Never email someone who opted out.
- [ ] **GDPR (EU and UK):** you need a lawful basis (consent or legitimate interest) for each person, and you must tell them how you got their data. Add `lawful_basis` and `consent_source` fields. Support "delete me" and "show me my data" requests.
- [ ] **CCPA / CPRA (California) and the Florida Digital Bill of Rights:** let people ask what you hold and ask you to delete it.
- [ ] Emails are stored and shown with no consent source, and the opt-out flag is only a field nothing enforces. Add a consent source and use the flag everywhere (sequences, export).
- [ ] No privacy policy or terms page.
- [ ] No way for a user to export or delete their data.

## 4. Connect Stripe

- [ ] `app/api/checkout/route.ts` returns a 501. Create a Stripe Checkout Session (test mode is fine).
- [ ] Add a webhook route that marks the account as paid.
- [ ] Lock the paid features behind the plan.

## 5. Ship it

- [ ] Deploy it (Vercel, Netlify, Railway...). The JSON file database will not survive this, so do section 2 first.
- [ ] Put the live link in your README.

## What "done" looks like

Someone who has never seen it can sign up, pay, use the main feature end to end, and come back tomorrow to find their data still there.
