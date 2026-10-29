import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { STATUSES, logActivity, withScore, type Lead, type List } from "@/lib/leads";
import type { Enrollment, Sequence } from "@/lib/sequences";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/leads/:id  one lead with its score, the lists it is in and the sequences it is on
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const lead = (db.leads as Lead[]).find((l) => l.id === id);
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const lists = (db.lists as List[]).filter((l) => l.leadIds.includes(id)).map((l) => ({ id: l.id, name: l.name }));
  const sequences = (db.enrollments as Enrollment[])
    .filter((e) => e.leadId === id)
    .map((e) => {
      const seq = (db.sequences as Sequence[]).find((s) => s.id === e.sequenceId);
      return { enrollmentId: e.id, sequenceId: e.sequenceId, name: seq?.name ?? "Unknown", step: e.step };
    });
  return NextResponse.json({ lead: withScore(lead), lists, sequences });
}

// PATCH /api/leads/:id  body: { status } or { optedOut: true | false }
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({ status: "" }));

  const db = await readDb();
  const lead = (db.leads as Lead[]).find((l) => l.id === id);

  if (typeof body.optedOut === "boolean") {
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    lead.optedOut = body.optedOut;
    logActivity(lead, body.optedOut ? "Marked as opted out" : "Opt-out removed");
    await writeDb(db);
    return NextResponse.json({ lead });
  }

  const { status } = body;
  if (!STATUSES.includes(status)) return NextResponse.json({ error: "Bad status." }, { status: 400 });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (lead.status !== status) logActivity(lead, `Status changed from ${lead.status} to ${status}`);
  lead.status = status;
  await writeDb(db);
  return NextResponse.json({ lead });
}
