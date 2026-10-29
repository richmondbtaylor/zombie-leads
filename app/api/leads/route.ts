import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { withScore, logActivity, type Lead } from "@/lib/leads";

// ZOMBIE: no rate limit. Anyone can hit this route thousands of times a minute
// (scraping the list or filling the database). Add a rate limiter and a login.

// GET /api/leads?industry=Food&city=Miami&minScore=50
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const industry = q.get("industry") ?? "";
  const city = q.get("city") ?? "";
  const minScore = Number(q.get("minScore") ?? 0);

  const db = await readDb();
  const leads = (db.leads as Lead[])
    .map(withScore)
    .filter((l) => !industry || l.industry === industry)
    .filter((l) => !city || l.city === city)
    .filter((l) => l.score >= minScore);
  return NextResponse.json({ leads });
}

// POST /api/leads  adds one lead by hand
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  // ZOMBIE: we store the email with no consent source, no lawful basis (GDPR)
  // and no opt-out flag (CAN-SPAM). Add those fields before anyone emails a lead.
  const lead: Lead = {
    id: newId(),
    name: String(body.name),
    // The first word of the name, but only when there are 2+ words ("Front Desk" has no real first name).
    firstName: String(body.name).trim().includes(" ") ? String(body.name).trim().split(/\s+/)[0] : "",
    title: String(body.title ?? ""),
    company: String(body.company ?? ""),
    companySize: Number(body.companySize) || 1,
    email: String(body.email ?? ""),
    industry: String(body.industry ?? ""),
    city: String(body.city ?? ""),
    status: "New",
    optedOut: false,
    notes: [],
    activity: [],
  };
  logActivity(lead, "Lead added");
  const db = await readDb();
  (db.leads as Lead[]).push(lead);
  await writeDb(db);
  return NextResponse.json({ lead: withScore(lead) }, { status: 201 });
}
