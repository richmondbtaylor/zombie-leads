# Zombie Leads

> A half-built copy of **Apollo.io**. It runs, it kind of works, and it is not ready for real users.
> Your job tonight: bring it back to life.

**Replaces:** Apollo.io (paid plans) <!-- Source: https://www.apollo.io/pricing checked 2026-10-29. The page shows plan names (Free, Basic, Professional, Custom) but no dollar amounts, so no number is given. -->

**Live demo:** https://zombie-leads.vercel.app (a shared demo: data resets whenever the server restarts)

## Run it (2 minutes)

You need [Node.js 20 or newer](https://nodejs.org).

```bash
npm install
npm run dev
```

Open http://localhost:3103.

## What works

- **Dashboard** (`/`): total leads, average score, saved lists, leads on a sequence, a bar chart of leads by status, and the top 5 leads by score.
- **Leads table** (`/leads`): name, title, company, email, industry, city, score and status, with filters for industry, city and minimum score.
- Add a lead by hand. Change a lead's status. A simple lead score (title, company size, has email) with a short "why".
- **Lead page** (`/leads/<id>`): every field, the score and why, notes, an activity log (status changes, notes, lists, sequences), the lists and sequences the lead is on, and an opt-out button.
- **Sequences** (`/sequences`): make a sequence with 3 steps (day number plus message), add leads to it, move a lead between steps, and see who is on which step with a preview of their next message. Nothing is sent.
- **Saved lists** (`/lists`): see each list and its leads, make new lists, remove a lead from a list. Add leads to a list from the Leads page.
- A pricing page (the Buy buttons do not work yet, see ZOMBIE.md).

## What's broken

See [ZOMBIE.md](ZOMBIE.md). That's the to-do list for the night.

## How we build tonight

- **Mel** ([openmel.dev](https://openmel.dev)) does the building. Open this folder in Mel and give it tasks from ZOMBIE.md.
- **Prompt Anything** ([promptanything.io](https://www.promptanything.io)) writes the prompts. Use it inside Mel for features, agents, customer success flows, code fixes and reading this repo.
- **MEL.md** in this folder tells Mel's agents what this project is and how to work on it.

## Submit

Fork this repo, push your work, and send your link through the submission form before the deadline.
Many people can pick the same app. The one that actually works wins.

## License

MIT. Use it, ship it, share it.
